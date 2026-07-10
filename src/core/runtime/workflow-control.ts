import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fileExists } from "../../utils/fs.js";
import { ArtifactSubmitReceiptSchema, SubmittedArtifactRecordSchema, SubmitReceiptArtifactRecordSchema } from "../contracts/artifact.js";
import { validateWorkflowDefinition, type WorkflowNodeDefinition } from "../contracts/workflow.js";
import type { Diagnostic } from "../validation/types.js";
import { latestById, type WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";

export type WorkItemState = "done" | "ready" | "blocked";

export interface MissingDependency {
  kind: "stage" | "work_item" | "contract" | "artifact_type" | "gate_type" | "gate_id" | "decision_type" | "output";
  id: string;
  reason: string;
}

export interface WorkItemStatus {
  id: string;
  selector: string;
  work_item_id: string;
  stage_id: string;
  producer_skill: string;
  state: WorkItemState;
  missing_dependencies: MissingDependency[];
  output_path: string;
  artifact_id?: string;
  unlocks: string[];
  warnings: Array<{ code: "candidate_unregistered"; path: string }>;
}

export interface WorkflowControlResult {
  profile: string;
  active_stage_id: string | null;
  state: "unconfigured" | "blocked" | "ready" | "stage_work_complete";
  configured: boolean;
  valid: boolean;
  reason?: "workflow_nodes_missing" | "workflow_invalid";
  work_items: WorkItemStatus[];
  ready_items: string[];
  stage_work_complete: boolean;
  transition_required: boolean;
}

export interface ArtifactInspection {
  artifact: Record<string, unknown>;
  resolved_path?: string;
  exists: boolean;
  inside_project: boolean;
  hash_matches?: boolean;
  diagnostics: Diagnostic[];
}

export interface WorkflowInstructionPacket {
  id: string;
  selector: string;
  work_item_id: string;
  stage_id: string;
  producer_skill: string;
  state: "ready";
  description: string;
  context: null;
  output: WorkflowNodeDefinition["output"] & { resolved_path: string };
  template: string;
  dependencies: {
    work_items: Array<{ id: string; state: WorkItemState }>;
    contracts: Array<{ path: string; absolute_path: string; available: boolean }>;
    artifacts: Array<{ artifact_type: string; available: boolean; artifact_ids: string[] }>;
    gates: Array<{ gate_type: string; satisfied: boolean }>;
    decisions: Array<{ decision_type: string; satisfied: boolean }>;
  };
  instruction: string;
  rules: string[];
  allowed_writes: WorkflowNodeDefinition["allowed_writes"];
  forbidden_writes: string[];
  validation: { profile: string; suggested_command: string };
  completion: {
    policy: WorkflowNodeDefinition["completion"];
    submit_available: boolean;
    submit?: {
      selector: string;
      candidate_path: string;
      dry_run_command: string;
      input_schema: { required: string[]; optional: string[] };
      requires_confirmation: true;
      requires_expected_sha256_for_noninteractive_execution: true;
      updates_state: false;
      appends_gate: false;
      appends_decision: false;
    };
  };
  unlocks: string[];
}

export type WorkflowInstructionResult =
  | { ok: true; packet: WorkflowInstructionPacket }
  | { ok: false; code: "workflow_unconfigured" | "workflow_invalid" | "work_item_not_found" | "work_item_blocked" | "work_item_already_done" | "workflow_resource_unavailable"; item?: WorkItemStatus; details?: unknown };

export interface ResolvedTemplateReference {
  template_ref: string;
  source_path: string;
  content: string;
}

export async function inspectArtifact(snapshot: WorkspaceSnapshot, artifact: Record<string, unknown>): Promise<ArtifactInspection> {
  const diagnostics: Diagnostic[] = [];
  const declaredPath = typeof artifact.path === "string" ? artifact.path : undefined;
  if (!declaredPath) return { artifact, exists: false, inside_project: false, diagnostics };

  const projectRoot = path.dirname(snapshot.workspace);
  const resolvedPath = path.resolve(projectRoot, declaredPath);
  if (!isInside(projectRoot, resolvedPath)) {
    diagnostics.push({ severity: "error", code: "artifact_path_escape", message: "Artifact path escapes the project root.", path: declaredPath, blocking: true });
    return { artifact, resolved_path: resolvedPath, exists: false, inside_project: false, diagnostics };
  }
  if (!(await fileExists(resolvedPath))) {
    diagnostics.push({ severity: "warning", code: "artifact_missing", message: "Registered artifact is missing.", path: resolvedPath, blocking: false });
    return { artifact, resolved_path: resolvedPath, exists: false, inside_project: true, diagnostics };
  }

  const [realProject, realArtifact] = await Promise.all([realpath(projectRoot), realpath(resolvedPath)]);
  if (!isInside(realProject, realArtifact)) {
    diagnostics.push({ severity: "error", code: "artifact_path_escape", message: "Artifact symlink resolves outside the project root.", path: resolvedPath, blocking: true });
    return { artifact, resolved_path: resolvedPath, exists: true, inside_project: false, diagnostics };
  }

  let hashMatches: boolean | undefined;
  if (typeof artifact.sha256 === "string") {
    hashMatches = sha256(await readFile(resolvedPath)) === artifact.sha256;
    if (!hashMatches) diagnostics.push({ severity: "error", code: "artifact_hash_mismatch", message: "Artifact hash does not match the registry.", path: resolvedPath, blocking: true });
  }
  return { artifact, resolved_path: resolvedPath, exists: true, inside_project: true, hash_matches: hashMatches, diagnostics };
}

export async function inspectArtifacts(snapshot: WorkspaceSnapshot): Promise<ArtifactInspection[]> {
  return Promise.all(snapshot.artifacts.map((artifact) => inspectArtifact(snapshot, artifact)));
}

export function passedCompletionGateIds(snapshot: WorkspaceSnapshot): Set<string> {
  return eventFacts(snapshot).passedGateIds;
}

export async function evaluateWorkflowControl(snapshot: WorkspaceSnapshot): Promise<WorkflowControlResult> {
  const workflow = snapshot.workflow;
  const nodes = workflow?.work_items ?? [];
  const profile = typeof snapshot.config.profile === "string" ? snapshot.config.profile : "unknown";
  const activeStage = typeof snapshot.state.active_stage_id === "string" ? snapshot.state.active_stage_id : null;
  if (!workflow || nodes.length === 0) return { profile, active_stage_id: activeStage, state: "unconfigured", configured: false, valid: true, reason: "workflow_nodes_missing", work_items: [], ready_items: [], stage_work_complete: false, transition_required: false };
  if (validateWorkflowDefinition(workflow).length > 0) return { profile, active_stage_id: activeStage, state: "blocked", configured: true, valid: false, reason: "workflow_invalid", work_items: [], ready_items: [], stage_work_complete: false, transition_required: false };

  const inspections = await inspectArtifacts(snapshot);
  const facts = eventFacts(snapshot);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const unlocks = new Map<string, string[]>();
  for (const node of nodes) for (const dependency of node.requires.work_items) unlocks.set(dependency, [...(unlocks.get(dependency) ?? []), node.id]);
  const memo = new Map<string, Promise<WorkItemStatus>>();

  const evaluate = (node: WorkflowNodeDefinition): Promise<WorkItemStatus> => {
    const existing = memo.get(node.id);
    if (existing) return existing;
    const pending = (async (): Promise<WorkItemStatus> => {
      const outputPath = path.resolve(snapshot.workspace, node.output.workspace_path);
      const candidates = inspections.filter((inspection) => inspection.artifact.work_item_id === node.id);
      const candidate = candidates[candidates.length - 1];
      if (candidate) {
        const outputProblems = await completionProblems(snapshot, node, candidate, facts, inspections);
        if (outputProblems.length === 0) {
          return {
            id: node.id, selector: `work:${node.id}`, work_item_id: node.id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: "done",
            missing_dependencies: [], output_path: outputPath, artifact_id: stringValue(candidate.artifact.artifact_id), unlocks: unlocks.get(node.id) ?? [], warnings: [],
          };
        }
        return {
          id: node.id, selector: `work:${node.id}`, work_item_id: node.id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: "blocked",
          missing_dependencies: outputProblems, output_path: outputPath, artifact_id: stringValue(candidate.artifact.artifact_id), unlocks: unlocks.get(node.id) ?? [], warnings: [],
        };
      }

      const missing: MissingDependency[] = [];
      if (activeStage !== node.stage_id) missing.push({ kind: "stage", id: node.stage_id, reason: "inactive_stage" });
      for (const dependencyId of node.requires.work_items) {
        const dependency = byId.get(dependencyId);
        if (!dependency || (await evaluate(dependency)).state !== "done") missing.push({ kind: "work_item", id: dependencyId, reason: "work_item_not_done" });
      }
      for (const contractPath of node.requires.contracts) {
        const file = snapshot.files.get(contractPath);
        const invalid = file && snapshot.diagnostics.some((diagnostic) => diagnostic.blocking && diagnostic.path === file.absolutePath);
        if (!file || invalid) missing.push({ kind: "contract", id: contractPath, reason: file ? "contract_invalid" : "contract_missing" });
      }
      for (const artifactType of node.requires.artifact_types) {
        if (!inspections.some((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection))) {
          missing.push({ kind: "artifact_type", id: artifactType, reason: "artifact_unavailable" });
        }
      }
      for (const gateType of node.requires.gate_types) if (!facts.passedGateTypes.has(gateType)) missing.push({ kind: "gate_type", id: gateType, reason: "gate_not_passed" });
      for (const decisionType of node.requires.decision_types) if (!facts.acceptedDecisionTypes.has(decisionType)) missing.push({ kind: "decision_type", id: decisionType, reason: "decision_not_accepted" });
      const warnings: WorkItemStatus["warnings"] = await fileExists(outputPath)
        ? [{ code: "candidate_unregistered", path: outputPath }]
        : [];
      return {
        id: node.id, selector: `work:${node.id}`, work_item_id: node.id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: missing.length ? "blocked" : "ready",
        missing_dependencies: missing, output_path: outputPath, unlocks: unlocks.get(node.id) ?? [], warnings,
      };
    })();
    memo.set(node.id, pending);
    return pending;
  };

  const workItems = await Promise.all(nodes.map((node) => evaluate(node)));
  const activeItems = workItems.filter((item) => item.stage_id === activeStage);
  const stageWorkComplete = activeItems.length > 0 && activeItems.every((item) => item.state === "done");
  const readyItems = workItems.filter((item) => item.state === "ready").map((item) => item.selector);
  const state = stageWorkComplete ? "stage_work_complete" : readyItems.length ? "ready" : "blocked";
  return { profile, active_stage_id: activeStage, state, configured: true, valid: true, work_items: workItems, ready_items: readyItems, stage_work_complete: stageWorkComplete, transition_required: stageWorkComplete };
}

export async function buildWorkflowInstructions(snapshot: WorkspaceSnapshot, workItemId: string): Promise<WorkflowInstructionResult> {
  const control = await evaluateWorkflowControl(snapshot);
  if (!control.configured) return { ok: false, code: "workflow_unconfigured" };
  if (!control.valid || !snapshot.workflow) return { ok: false, code: "workflow_invalid" };
  const status = control.work_items.find((item) => item.id === workItemId);
  const node = snapshot.workflow.work_items?.find((item) => item.id === workItemId);
  if (!status || !node) return { ok: false, code: "work_item_not_found" };
  if (status.state === "blocked") return { ok: false, code: "work_item_blocked", item: status };
  if (status.state === "done") return { ok: false, code: "work_item_already_done", item: status };

  const controlById = new Map(control.work_items.map((item) => [item.id, item]));
  const inspections = await inspectArtifacts(snapshot);
  const facts = eventFacts(snapshot);
  let template: ResolvedTemplateReference;
  try {
    template = await resolveTemplateReference(node.output.template_ref);
  } catch (error) {
    return { ok: false, code: "workflow_resource_unavailable", item: status, details: { template_ref: node.output.template_ref, message: error instanceof Error ? error.message : String(error) } };
  }
  return {
    ok: true,
    packet: {
      id: status.id,
      selector: status.selector,
      work_item_id: status.work_item_id,
      stage_id: status.stage_id,
      producer_skill: status.producer_skill,
      state: "ready",
      description: node.description,
      context: null,
      output: { ...node.output, resolved_path: status.output_path },
      template: template.content,
      dependencies: {
        work_items: node.requires.work_items.map((id) => ({ id, state: controlById.get(id)?.state ?? "blocked" })),
        contracts: node.requires.contracts.map((contractPath) => ({ path: contractPath, absolute_path: path.resolve(snapshot.workspace, contractPath), available: snapshot.files.has(contractPath) })),
        artifacts: node.requires.artifact_types.map((artifactType) => ({ artifact_type: artifactType, available: inspections.some((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection)), artifact_ids: inspections.filter((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection)).map((inspection) => String(inspection.artifact.artifact_id)) })),
        gates: node.requires.gate_types.map((gateType) => ({ gate_type: gateType, satisfied: facts.passedGateTypes.has(gateType) })),
        decisions: node.requires.decision_types.map((decisionType) => ({ decision_type: decisionType, satisfied: facts.acceptedDecisionTypes.has(decisionType) })),
      },
      instruction: node.instruction,
      rules: node.rules,
      allowed_writes: node.allowed_writes,
      forbidden_writes: ["specs/*", "runs/current/state.yaml", "runs/current/artifact-registry.json", "runs/current/decision-ledger.jsonl", "runs/current/gate-ledger.jsonl"],
      validation: { profile: node.validation_profile, suggested_command: "researchspec check artifacts --json" },
      completion: submitCapability(node, status),
      unlocks: status.unlocks,
    },
  };
}

export async function resolveTemplateReference(templateRef: string): Promise<ResolvedTemplateReference> {
  const match = /^ars:shared\/handoff_schemas\.md#([a-z0-9-]+)$/.exec(templateRef);
  if (!match?.[1]) throw new Error(`Unsupported template reference: ${templateRef}`);
  const sourcePath = fileURLToPath(new URL("../../../../skills/arsu/deep-research/references/shared/handoff_schemas.md", import.meta.url));
  const text = await readFile(sourcePath, "utf8");
  const content = markdownSection(text, match[1]);
  if (!content) throw new Error(`Template anchor not found: ${match[1]}`);
  return { template_ref: templateRef, source_path: sourcePath, content };
}

async function completionProblems(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, inspection: ArtifactInspection, facts: EventFacts, inspections: ArtifactInspection[]): Promise<MissingDependency[]> {
  const problems: MissingDependency[] = [];
  const artifact = inspection.artifact;
  const expectedPath = path.resolve(snapshot.workspace, node.output.workspace_path);
  if (inspection.resolved_path !== expectedPath) problems.push({ kind: "output", id: node.id, reason: "artifact_path_mismatch" });
  if (artifact.artifact_type !== node.output.artifact_type) problems.push({ kind: "output", id: node.id, reason: "artifact_type_mismatch" });
  if (!inspection.exists) problems.push({ kind: "output", id: node.id, reason: "artifact_missing" });
  if (!inspection.inside_project) problems.push({ kind: "output", id: node.id, reason: "artifact_path_escape" });
  if (node.completion.require_sha256 && (typeof artifact.sha256 !== "string" || inspection.hash_matches !== true)) problems.push({ kind: "output", id: node.id, reason: typeof artifact.sha256 === "string" ? "artifact_hash_mismatch" : "artifact_hash_missing" });
  if (!node.completion.artifact_statuses.includes(String(artifact.status))) problems.push({ kind: "output", id: node.id, reason: "artifact_status_not_accepted" });
  if (!node.completion.verification_states.includes(String(artifact.verification_state))) problems.push({ kind: "output", id: node.id, reason: "artifact_not_verified" });
  if (node.completion.require_receipt) {
    const candidateRecord = SubmittedArtifactRecordSchema.safeParse(artifact);
    const receiptId = stringValue(artifact.submit_receipt_artifact_id);
    const candidateId = stringValue(artifact.artifact_id);
    const receiptInspection = receiptId ? inspections.find((item) => item.artifact.artifact_id === receiptId) : undefined;
    const receiptRecord = receiptInspection ? SubmitReceiptArtifactRecordSchema.safeParse(receiptInspection.artifact) : undefined;
    if (!candidateRecord.success) problems.push({ kind: "output", id: node.id, reason: "submit_candidate_record_invalid" });
    if (!receiptId || !receiptInspection) problems.push({ kind: "output", id: node.id, reason: "submit_receipt_missing" });
    else if (!isTrustedInspection(receiptInspection) || !receiptRecord?.success) {
      problems.push({ kind: "output", id: node.id, reason: "submit_receipt_untrusted" });
    } else if (!receiptInspection.resolved_path) {
      problems.push({ kind: "output", id: node.id, reason: "submit_receipt_missing" });
    } else {
      try {
        const parsed = ArtifactSubmitReceiptSchema.safeParse(JSON.parse(await readFile(receiptInspection.resolved_path, "utf8")) as unknown);
        const related = Array.isArray(receiptInspection.artifact.related_artifact_ids) ? receiptInspection.artifact.related_artifact_ids : [];
        const suffix = typeof artifact.sha256 === "string" ? artifact.sha256.slice(0, 16) : "";
        const expectedCandidateId = `A-${node.id}-${suffix}`;
        const expectedSubmissionId = `S-${node.id}-${suffix}`;
        const expectedReceiptId = `A-submit-receipt-${node.id}-${suffix}`;
        const expectedReceiptPath = path.resolve(snapshot.workspace, `runs/current/receipts/artifact-submit/${expectedSubmissionId}.json`);
        if (!candidateRecord.success || !receiptRecord?.success || !parsed.success
          || candidateId !== expectedCandidateId
          || receiptId !== expectedReceiptId
          || receiptInspection.resolved_path !== expectedReceiptPath
          || parsed.data.submission_id !== expectedSubmissionId
          || parsed.data.receipt_artifact_id !== receiptId
          || parsed.data.selector !== `work:${node.id}`
          || parsed.data.artifact.artifact_id !== candidateId
          || parsed.data.artifact.artifact_type !== node.output.artifact_type
          || parsed.data.artifact.path !== artifact.path
          || parsed.data.artifact.sha256 !== artifact.sha256
          || parsed.data.producer_skill !== node.producer_skill
          || parsed.data.stage_id !== node.stage_id
          || parsed.data.payload_schema_ref !== node.output.template_ref
          || JSON.stringify(parsed.data.producer) !== JSON.stringify(candidateRecord.data.producer)
          || parsed.data.submitted_at !== candidateRecord.data.created_at
          || parsed.data.validation.profile !== node.validation_profile
          || parsed.data.validation.outcome !== "pass"
          || parsed.data.validation.validator.kind !== "validator"
          || parsed.data.validation.validator.name !== `researchspec:${node.validation_profile}`
          || candidateRecord.data.verification.profile !== node.validation_profile
          || candidateRecord.data.verification.verified_by.kind !== "validator"
          || candidateRecord.data.verification.verified_by.name !== `researchspec:${node.validation_profile}`
          || JSON.stringify(candidateRecord.data.verification.checks) !== JSON.stringify(parsed.data.validation.checks)
          || receiptRecord.data.created_at !== parsed.data.submitted_at
          || !related.includes(candidateId)) {
          problems.push({ kind: "output", id: node.id, reason: "submit_receipt_mismatch" });
        }
      } catch {
        problems.push({ kind: "output", id: node.id, reason: "submit_receipt_invalid" });
      }
    }
  }
  for (const gateId of node.completion.required_gate_ids) if (!facts.passedGateIds.has(gateId)) problems.push({ kind: "gate_id", id: gateId, reason: "completion_gate_not_passed" });
  return problems;
}

function submitCapability(node: WorkflowNodeDefinition, status: WorkItemStatus): WorkflowInstructionPacket["completion"] {
  const available = node.validation_profile === "research-artifact";
  return {
    policy: node.completion,
    submit_available: available,
    ...(available ? {
      submit: {
        selector: status.selector,
        candidate_path: status.output_path,
        dry_run_command: `researchspec submit ${status.selector} --input <submission.json> --actor-kind <kind> --actor-name <name> --dry-run --json`,
        input_schema: { required: ["schema_version", "dependency_artifact_ids"], optional: ["producer_mode"] },
        requires_confirmation: true as const,
        requires_expected_sha256_for_noninteractive_execution: true as const,
        updates_state: false as const,
        appends_gate: false as const,
        appends_decision: false as const,
      },
    } : {}),
  };
}

function isTrustedInspection(inspection: ArtifactInspection): boolean {
  return inspection.exists && inspection.inside_project && typeof inspection.artifact.sha256 === "string" && inspection.hash_matches === true;
}

interface EventFacts {
  passedGateIds: Set<string>;
  passedGateTypes: Set<string>;
  acceptedDecisionTypes: Set<string>;
}

function eventFacts(snapshot: WorkspaceSnapshot): EventFacts {
  const latestDecisions = latestById(snapshot.decisions, "decision_id");
  const latestGates = latestById(snapshot.gates, "gate_id");
  const overriddenGateIds = new Set(latestDecisions.filter((item) => item.status === "accepted" && item.decision_type === "gate_override" && typeof item.gate_id === "string").map((item) => String(item.gate_id)));
  const passedGates = latestGates.filter((item) => item.verdict === "pass" || item.verdict === "pass_with_conditions" || overriddenGateIds.has(String(item.gate_id)));
  const passedGateIds = new Set(passedGates.filter((item) => typeof item.gate_id === "string").map((item) => String(item.gate_id)));
  const passedGateTypes = new Set(passedGates.filter((item) => typeof item.gate_type === "string").map((item) => String(item.gate_type)));
  const acceptedDecisionTypes = new Set(latestDecisions.filter((item) => item.status === "accepted" && typeof item.decision_type === "string").map((item) => String(item.decision_type)));
  return { passedGateIds, passedGateTypes, acceptedDecisionTypes };
}

function isInside(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function markdownSection(text: string, anchor: string): string | undefined {
  const lines = text.split(/(?<=\n)/);
  let start = -1;
  let level = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index] ?? "");
    if (!heading?.[1] || !heading[2]) continue;
    const slug = markdownSlug(heading[2]);
    if (slug === anchor || slug.startsWith(`${anchor}-`)) {
      start = index;
      level = heading[1].length;
      break;
    }
  }
  if (start < 0) return undefined;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+/.exec(lines[index] ?? "");
    if (heading?.[1] && heading[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("").trimEnd();
}

function markdownSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-");
}
