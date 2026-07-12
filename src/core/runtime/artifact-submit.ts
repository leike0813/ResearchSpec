import { lstat, readFile, realpath } from "node:fs/promises";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import { getArsuArtifactContract } from "../../arsu-converter/workflow/artifact-contracts.js";

import {
  ArtifactRegistrySchema,
  ArtifactSubmitInputSchema,
  ArtifactSubmitReceiptSchema,
  SubmittedArtifactRecordSchema,
  SubmitReceiptArtifactRecordSchema,
  type ArtifactSubmitInput,
  type ArtifactSubmitReceipt,
  type SubmitActor,
  type SubmittedArtifactRecord,
  type SubmitReceiptArtifactRecord,
} from "../contracts/artifact.js";
import { parseRuntimeSelector } from "../contracts/runtime-selector.js";
import { SubflowStartReceiptSchema } from "../contracts/subflow.js";
import { resolveWorkNode, WorkItemSelectorSchema, type WorkflowNodeDefinition, type WorkflowNodeTemplate } from "../contracts/workflow.js";
import { loadWorkspaceSnapshot, type WorkspaceSnapshot } from "../workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite, type ReadPrecondition, type WritePlan } from "../workspace/write-plan.js";
import { evaluateWorkflowControl, inspectArtifacts, passedCompletionGateIds, resolveTemplateReference, type WorkflowControlResult } from "./workflow-control.js";

export type ArtifactSubmitErrorKind = "usage" | "domain" | "conflict";

export class ArtifactSubmitError extends Error {
  constructor(public readonly code: string, message: string, public readonly kind: ArtifactSubmitErrorKind, public readonly details?: unknown) {
    super(message);
  }
}

export interface ArtifactSubmitPlan {
  status: "would_submit" | "already_submitted";
  selector: string;
  candidate_sha256: string;
  artifact: SubmittedArtifactRecord;
  receipt_artifact: SubmitReceiptArtifactRecord;
  receipt: ArtifactSubmitReceipt;
  validation: { profile: string; ok: true; diagnostics: []; checks: string[] };
  projected_completion: { state: "done" | "blocked"; missing_gate_ids: string[] };
  writePlan: WritePlan;
  confirmation_basis: "subflow_start" | "per_artifact";
}

export interface ArtifactSubmitOutcome {
  status: "submitted" | "already_submitted";
  plan: ArtifactSubmitPlan;
  workflow_control_after: WorkflowControlResult;
}

export async function planArtifactSubmit(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  payload: unknown;
  actor: SubmitActor;
  expectedSha256?: string;
  now?: string;
}): Promise<ArtifactSubmitPlan> {
  const selector = resolveSubmitTarget(input.snapshot, input.selector);
  const payload = parsePayload(input.payload);
  const snapshot = input.snapshot;
  if (snapshot.diagnostics.some((item) => item.blocking)) throw new ArtifactSubmitError("workflow_invalid", "Workspace or workflow has blocking diagnostics.", "domain", { diagnostics: snapshot.diagnostics.filter((item) => item.blocking) });
  const node = selector.node;
  if (!["text-artifact", "binary-file-artifact"].includes(node.validation_profile)) throw new ArtifactSubmitError("candidate_validation_failed", `Unsupported validation profile: ${node.validation_profile}`, "domain");

  const candidate = await validateCandidate(snapshot, node, input.expectedSha256);
  const ids = derivedIds(selector.instanceId ? `${selector.instanceId}-${node.id}` : node.id, candidate.hash);
  const dependencies = await trustedDependencies(snapshot, node, payload);
  const existingForWorkItem = snapshot.artifacts.filter((item) => item.work_item_id === node.id && (selector.instanceId ? item.subflow_instance_id === selector.instanceId : item.subflow_instance_id === undefined));
  const existingCandidate = existingForWorkItem.find((item) => item.artifact_id === ids.artifactId);
  const now = input.now ?? new Date().toISOString();
  const basis = submissionBasis(snapshot, node);
  const validationChecks = ["declared_path", "regular_file", "workspace_containment", ...(node.validation_profile === "binary-file-artifact" ? ["allowed_extension"] : ["utf8"]), "non_empty", "candidate_sha256", "template_ref", "dependency_coverage"];
  const validatorName = `researchspec:${node.validation_profile}`;
  const registryPath = path.join(snapshot.workspace, "runs/current/artifact-registry.json");
  const projectRoot = path.dirname(snapshot.workspace);
  const candidateRegistryPath = toPosix(path.relative(projectRoot, candidate.path));
  const receiptRelativeWorkspacePath = `runs/current/receipts/artifact-submit/${ids.submissionId}.json`;
  const receiptPath = path.join(snapshot.workspace, receiptRelativeWorkspacePath);
  const receiptRegistryPath = toPosix(path.relative(projectRoot, receiptPath));
  const passedGateIds = passedCompletionGateIds(snapshot);
  const satisfiedCompletionGateIds = node.completion.required_gate_ids.filter((id) => passedGateIds.has(id));

  let receipt: ArtifactSubmitReceipt = ArtifactSubmitReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "artifact_submit",
    submission_id: ids.submissionId,
    selector: input.selector,
    ...(selector.instanceId ? { subflow_instance_id: selector.instanceId, start_authorization: selector.startAuthorization } : {}),
    artifact: { artifact_id: ids.artifactId, artifact_type: node.output.artifact_type, path: candidateRegistryPath, sha256: candidate.hash },
    receipt_artifact_id: ids.receiptArtifactId,
    producer: input.actor,
    producer_skill: node.producer_skill,
    producer_mode: payload.producer_mode ?? null,
    stage_id: node.stage_id,
    payload_schema_ref: node.output.template_ref,
    dependency_artifacts: dependencies.map((item) => ({ artifact_id: String(item.artifact.artifact_id), artifact_type: String(item.artifact.artifact_type), path: String(item.artifact.path), sha256: String(item.artifact.sha256) })),
    validation: { profile: node.validation_profile, checks: validationChecks, outcome: "pass", validator: { kind: "validator", name: validatorName } },
    completion_gate_ids: { required: node.completion.required_gate_ids, satisfied: satisfiedCompletionGateIds },
    basis,
    submitted_at: now,
  });

  const existingReceiptBytes = await readOptionalBytes(receiptPath);
  if (existingReceiptBytes) {
    const existingReceipt = parseReceipt(existingReceiptBytes, receiptPath);
    const equivalent = existingCandidate ? receiptSubmissionIdentityEquivalent(existingReceipt, receipt) : receiptEquivalent(existingReceipt, receipt);
    if (!equivalent) throw new ArtifactSubmitError("submission_conflict", `Submission receipt conflicts with the planned submission: ${receiptPath}`, "conflict");
    receipt = existingReceipt;
  }
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptHash = sha256(receiptText);
  const verifiedAt = receipt.submitted_at;
  const artifact = SubmittedArtifactRecordSchema.parse({
    artifact_id: ids.artifactId,
    artifact_type: node.output.artifact_type,
    work_item_id: node.id,
    ...(selector.instanceId ? { subflow_instance_id: selector.instanceId } : {}),
    path: candidateRegistryPath,
    sha256: candidate.hash,
    status: "candidate",
    verification_state: "verified",
    producer: input.actor,
    producer_skill: node.producer_skill,
    stage_id: node.stage_id,
    payload_schema_ref: node.output.template_ref,
    created_at: verifiedAt,
    submit_receipt_artifact_id: ids.receiptArtifactId,
    verification: { profile: node.validation_profile, verified_at: verifiedAt, verified_by: { kind: "validator", name: validatorName }, checks: validationChecks },
  });
  const receiptArtifact = SubmitReceiptArtifactRecordSchema.parse({
    artifact_id: ids.receiptArtifactId,
    artifact_type: "artifact_submit_receipt",
    path: receiptRegistryPath,
    sha256: receiptHash,
    status: "accepted",
    verification_state: "verified",
    producer: { kind: "script", name: "researchspec:artifact-submit" },
    related_artifact_ids: [ids.artifactId],
    created_at: receipt.submitted_at,
  });

  if (existingForWorkItem.length > 0) {
    if (!existingCandidate || existingForWorkItem.some((item) => item.artifact_id !== ids.artifactId)) throw new ArtifactSubmitError("submission_conflict", `Work item ${node.id} already has a different registered submission.`, "conflict");
    if (!recordsEqual(existingCandidate, artifact)) throw new ArtifactSubmitError("submission_conflict", `Registered artifact conflicts with the planned submission: ${ids.artifactId}`, "conflict");
    const existingReceiptRecord = snapshot.artifacts.find((item) => item.artifact_id === ids.receiptArtifactId);
    if (!existingReceiptRecord || !recordsEqual(existingReceiptRecord, receiptArtifact) || !existingReceiptBytes) throw new ArtifactSubmitError("submission_conflict", "Existing submission is incomplete or its receipt is untrusted.", "conflict");
    return buildPlan("already_submitted", input.selector, candidate.hash, artifact, receiptArtifact, receipt, validationChecks, node, passedGateIds, { operations: [] }, selector.confirmationBasis);
  }
  for (const record of snapshot.artifacts) {
    if ((record.artifact_id === ids.artifactId && !recordsEqual(record, artifact)) || (record.artifact_id === ids.receiptArtifactId && !recordsEqual(record, receiptArtifact))) {
      throw new ArtifactSubmitError("submission_conflict", "A derived artifact ID is already occupied by different content.", "conflict", { artifact_id: record.artifact_id });
    }
  }

  const control = await evaluateWorkflowControl(snapshot);
  const status = control.work_items.find((item) => item.selector === input.selector);
  if (!status) throw new ArtifactSubmitError("work_item_not_found", `Work item not found: ${input.selector}`, "domain");
  if (status.state !== "ready") throw new ArtifactSubmitError("work_item_blocked", `Work item is not ready: ${input.selector}`, "domain", { item: status });

  const projectedRegistry = ArtifactRegistrySchema.parse({ ...snapshot.documents["runs/current/artifact-registry.json"] as object, artifacts: [...snapshot.artifacts, artifact, receiptArtifact] });
  const registryText = `${JSON.stringify(projectedRegistry, null, 2)}\n`;
  const receiptOperation = await planFile({ path: receiptPath, relativePath: receiptRelativeWorkspacePath, content: receiptText, scope: "workspace", ownership: "user" });
  if (receiptOperation.action === "conflict") throw new ArtifactSubmitError("submission_conflict", `Receipt path conflicts: ${receiptPath}`, "conflict");
  const registryFile = snapshot.files.get("runs/current/artifact-registry.json");
  if (!registryFile) throw new ArtifactSubmitError("workflow_invalid", "Artifact registry is unavailable.", "domain");
  const registryOperation: PlannedWrite = { action: "refresh", path: registryPath, relativePath: "runs/current/artifact-registry.json", content: registryText, scope: "workspace", ownership: "user", previousHash: registryFile.hash, nextHash: sha256(registryText), reason: "commit artifact submission registry last" };
  const readPreconditions = submissionPreconditions(snapshot, node, candidate.path, candidate.hash, dependencies);
  return buildPlan("would_submit", input.selector, candidate.hash, artifact, receiptArtifact, receipt, validationChecks, node, passedGateIds, { operations: [receiptOperation, registryOperation], readPreconditions }, selector.confirmationBasis);
}

export async function executeArtifactSubmit(plan: ArtifactSubmitPlan, workspace: string): Promise<ArtifactSubmitOutcome> {
  if (plan.status === "already_submitted") {
    const snapshot = await loadWorkspaceSnapshot(workspace);
    return { status: "already_submitted", plan, workflow_control_after: await evaluateWorkflowControl(snapshot) };
  }
  await executeWritePlan(plan.writePlan);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  return { status: "submitted", plan, workflow_control_after: await evaluateWorkflowControl(snapshot) };
}

interface SubmitTarget {
  node: WorkflowNodeDefinition;
  nodeTemplate?: WorkflowNodeTemplate;
  instanceId?: string;
  startAuthorization?: { plan_sha256: string; receipt_path: string; receipt_sha256: string };
  confirmationBasis: ArtifactSubmitPlan["confirmation_basis"];
}

function resolveSubmitTarget(snapshot: WorkspaceSnapshot, selector: string): SubmitTarget {
  if (!WorkItemSelectorSchema.safeParse(selector).success) throw new ArtifactSubmitError("invalid_work_item_selector", `Invalid work-item selector: ${selector}`, "usage");
  const parsed = parseRuntimeSelector(selector);
  if (parsed?.kind === "scoped_work") {
    if (!snapshot.workflow || !snapshot.runState) throw new ArtifactSubmitError("workflow_unconfigured", "The current workflow has no subflow work graph.", "domain");
    const instance = snapshot.runState.subflows.find((item) => item.instance_id === parsed.instanceId);
    const template = instance ? snapshot.workflow.subflow_templates.find((item) => item.template_id === instance.template_id) : undefined;
    const nodeTemplate = template?.work_items.find((item) => item.id === parsed.workItemId);
    if (!instance || !template || !nodeTemplate) throw new ArtifactSubmitError("work_item_not_found", `Work item not found: ${selector}`, "domain");
    const authorization = validateStartAuthorization(snapshot, instance.instance_id, instance.start_receipt);
    if (nodeTemplate.submission.policy === "automatic" && !authorization) throw new ArtifactSubmitError("submission_dependency_untrusted", "Automatic submission requires a trusted subflow start receipt.", "domain");
    return { node: resolveWorkNode(nodeTemplate, instance.instance_id, instance.round_number), nodeTemplate, instanceId: instance.instance_id, ...(authorization ? { startAuthorization: authorization } : {}), confirmationBasis: nodeTemplate.submission.policy === "automatic" ? "subflow_start" : "per_artifact" };
  }
  throw new ArtifactSubmitError("invalid_work_item_selector", `Invalid work-item selector: ${selector}`, "usage");
}

function validateStartAuthorization(snapshot: WorkspaceSnapshot, instanceId: string, reference: { path: string; sha256: string; plan_sha256: string }) {
  const filePath = path.resolve(snapshot.workspace, reference.path);
  try {
    const workspaceReal = realpathSync(snapshot.workspace);
    const receiptReal = realpathSync(filePath);
    if (!isInside(workspaceReal, receiptReal)) return undefined;
    const bytes = readFileSync(filePath);
    const receipt = SubflowStartReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== reference.sha256 || receipt.instance_id !== instanceId || receipt.plan_sha256 !== reference.plan_sha256) return undefined;
    return { plan_sha256: reference.plan_sha256, receipt_path: reference.path, receipt_sha256: reference.sha256 };
  } catch { return undefined; }
}

function parsePayload(payload: unknown): ArtifactSubmitInput {
  const parsed = ArtifactSubmitInputSchema.safeParse(payload);
  if (!parsed.success) throw new ArtifactSubmitError("invalid_submission_input", "Submission input does not match the strict schema.", "usage", parsed.error.issues);
  return parsed.data;
}

async function validateCandidate(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, expectedSha256?: string): Promise<{ path: string; hash: string }> {
  const candidatePath = path.resolve(snapshot.workspace, node.output.workspace_path);
  let info;
  try { info = await lstat(candidatePath); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new ArtifactSubmitError("candidate_missing", `Candidate file is missing: ${candidatePath}`, "domain");
    throw error;
  }
  if (!info.isFile() || info.isSymbolicLink()) throw new ArtifactSubmitError("candidate_path_escape", "Candidate must be a regular non-symlink file.", "domain", { path: candidatePath });
  const [workspaceReal, candidateReal] = await Promise.all([realpath(snapshot.workspace), realpath(candidatePath)]);
  if (!isInside(workspaceReal, candidateReal)) throw new ArtifactSubmitError("candidate_path_escape", "Candidate resolves outside the ResearchSpec workspace.", "domain", { path: candidatePath });
  const bytes = await readFile(candidatePath);
  if (bytes.length === 0) throw new ArtifactSubmitError("candidate_validation_failed", "Candidate is empty.", "domain");
  if (node.validation_profile !== "binary-file-artifact") {
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { throw new ArtifactSubmitError("candidate_validation_failed", "Candidate is not valid UTF-8.", "domain"); }
  } else {
    const artifactType = /^arsu-artifact:([a-z0-9][a-z0-9_-]*)$/.exec(node.output.template_ref)?.[1];
    if (!artifactType) throw new ArtifactSubmitError("candidate_validation_failed", "Binary candidates require a controlled arsu-artifact reference.", "domain");
    const contract = getArsuArtifactContract(artifactType);
    if (contract.media_kind !== "binary" || path.extname(candidatePath).toLowerCase() !== contract.extension) throw new ArtifactSubmitError("candidate_validation_failed", `Binary candidate must use ${contract.extension}.`, "domain");
  }
  const hash = sha256(bytes);
  if (expectedSha256 && hash !== expectedSha256) throw new ArtifactSubmitError("submission_conflict", "Candidate hash differs from the confirmed expected SHA-256.", "conflict", { expected: expectedSha256, actual: hash });
  try { await resolveTemplateReference(node.output.template_ref); }
  catch (error) { throw new ArtifactSubmitError("candidate_validation_failed", error instanceof Error ? error.message : String(error), "domain"); }
  return { path: candidatePath, hash };
}

async function trustedDependencies(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, payload: ArtifactSubmitInput) {
  const inspections = await inspectArtifacts(snapshot);
  const selected = payload.dependency_artifact_ids.map((id) => inspections.find((item) => item.artifact.artifact_id === id));
  if (selected.some((item) => !item)) throw new ArtifactSubmitError("submission_dependency_missing", "A declared dependency artifact does not exist.", "domain", { dependency_artifact_ids: payload.dependency_artifact_ids });
  for (const inspection of selected) {
    if (!inspection || !inspection.exists || !inspection.inside_project || inspection.hash_matches !== true || typeof inspection.artifact.sha256 !== "string") {
      throw new ArtifactSubmitError("submission_dependency_untrusted", "A declared dependency artifact is not hash-trusted.", "domain", { artifact_id: inspection?.artifact.artifact_id });
    }
  }
  for (const artifactType of node.requires.artifact_types) {
    if (!selected.some((item) => item?.artifact.artifact_type === artifactType)) throw new ArtifactSubmitError("submission_dependency_missing", `Submission input does not cover required artifact type: ${artifactType}`, "domain");
  }
  return selected.filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((left, right) => String(left.artifact.artifact_id).localeCompare(String(right.artifact.artifact_id)));
}

function submissionBasis(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition): ArtifactSubmitReceipt["basis"] {
  const required = (relativePath: string) => {
    const file = snapshot.files.get(relativePath);
    if (!file) throw new ArtifactSubmitError("workflow_invalid", `Required submission basis file is unavailable: ${relativePath}`, "domain");
    return file.hash;
  };
  return {
    workflow_sha256: required("specs/workflow.yaml"),
    state_sha256: required("runs/current/state.yaml"),
    registry_sha256: required("runs/current/artifact-registry.json"),
    gate_ledger_sha256: required("runs/current/gate-ledger.jsonl"),
    decision_ledger_sha256: required("runs/current/decision-ledger.jsonl"),
    contract_hashes: Object.fromEntries(node.requires.contracts.map((item) => [item, required(item)])),
  };
}

function submissionPreconditions(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, candidatePath: string, candidateHash: string, dependencies: Awaited<ReturnType<typeof trustedDependencies>>): ReadPrecondition[] {
  const relativePaths = [...new Set(["specs/workflow.yaml", "runs/current/state.yaml", "runs/current/artifact-registry.json", "runs/current/gate-ledger.jsonl", "runs/current/decision-ledger.jsonl", ...node.requires.contracts])];
  const result = relativePaths.map((relativePath) => {
    const file = snapshot.files.get(relativePath);
    if (!file) throw new ArtifactSubmitError("workflow_invalid", `Submission basis is unavailable: ${relativePath}`, "domain");
    return { path: file.absolutePath, expectedHash: file.hash, reason: `submission basis ${relativePath}` };
  });
  result.push({ path: candidatePath, expectedHash: candidateHash, reason: "candidate artifact" });
  for (const dependency of dependencies) if (dependency.resolved_path && typeof dependency.artifact.sha256 === "string") result.push({ path: dependency.resolved_path, expectedHash: dependency.artifact.sha256, reason: `dependency artifact ${String(dependency.artifact.artifact_id)}` });
  return result;
}

function buildPlan(status: ArtifactSubmitPlan["status"], selector: string, candidateHash: string, artifact: SubmittedArtifactRecord, receiptArtifact: SubmitReceiptArtifactRecord, receipt: ArtifactSubmitReceipt, checks: string[], node: WorkflowNodeDefinition, passedGateIds: Set<string>, writePlan: WritePlan, confirmationBasis: ArtifactSubmitPlan["confirmation_basis"]): ArtifactSubmitPlan {
  const missingGateIds = node.completion.required_gate_ids.filter((id) => !passedGateIds.has(id));
  return { status, selector, candidate_sha256: candidateHash, artifact, receipt_artifact: receiptArtifact, receipt, validation: { profile: node.validation_profile, ok: true, diagnostics: [], checks }, projected_completion: { state: missingGateIds.length ? "blocked" : "done", missing_gate_ids: missingGateIds }, writePlan, confirmation_basis: confirmationBasis };
}

function derivedIds(workItemId: string, hash: string) {
  const suffix = hash.slice(0, 16);
  return { submissionId: `S-${workItemId}-${suffix}`, artifactId: `A-${workItemId}-${suffix}`, receiptArtifactId: `A-submit-receipt-${workItemId}-${suffix}` };
}

async function readOptionalBytes(filePath: string): Promise<Uint8Array | undefined> {
  try { return await readFile(filePath); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
}

function parseReceipt(bytes: Uint8Array, filePath: string): ArtifactSubmitReceipt {
  try { return ArtifactSubmitReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown); }
  catch { throw new ArtifactSubmitError("submission_conflict", `Existing receipt is invalid: ${filePath}`, "conflict"); }
}

function receiptEquivalent(left: ArtifactSubmitReceipt, right: ArtifactSubmitReceipt): boolean {
  const withoutTime = (value: ArtifactSubmitReceipt) => ({ ...value, submitted_at: undefined });
  return JSON.stringify(withoutTime(left)) === JSON.stringify(withoutTime(right));
}

function receiptSubmissionIdentityEquivalent(left: ArtifactSubmitReceipt, right: ArtifactSubmitReceipt): boolean {
  const identity = (value: ArtifactSubmitReceipt) => ({
    receipt_type: value.receipt_type,
    submission_id: value.submission_id,
    selector: value.selector,
    subflow_instance_id: value.subflow_instance_id,
    start_authorization: value.start_authorization,
    artifact: value.artifact,
    receipt_artifact_id: value.receipt_artifact_id,
    producer: value.producer,
    producer_skill: value.producer_skill,
    producer_mode: value.producer_mode,
    stage_id: value.stage_id,
    payload_schema_ref: value.payload_schema_ref,
    dependency_artifacts: value.dependency_artifacts,
    validation: value.validation,
    required_gate_ids: value.completion_gate_ids.required,
  });
  return JSON.stringify(identity(left)) === JSON.stringify(identity(right));
}

function recordsEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonical(entry)]));
}

function toPosix(value: string): string { return value.split(path.sep).join("/"); }
function isInside(root: string, target: string): boolean { return target === root || target.startsWith(`${root}${path.sep}`); }
