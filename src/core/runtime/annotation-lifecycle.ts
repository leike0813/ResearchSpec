import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import {
  AnnotationSetArtifactRecordSchema,
  AnnotationSubmitReceiptArtifactRecordSchema,
  ArtifactRegistrySchema,
  type SubmitActor,
} from "../contracts/artifact.js";
import {
  AnnotationSetCandidateSchema,
  AnnotationSubmitReceiptSchema,
  FrozenAnnotationSetSchema,
  type AnnotationSetCandidate,
  type FrozenAnnotationSet,
} from "../contracts/annotation.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite, type WritePlan } from "../workspace/write-plan.js";
import { isPathContained, resolveRegisteredArtifactPath, serializeRegisteredArtifactPath } from "./artifact-path.js";
import { markdownSectionHeadings, parseAnchoredBlocks } from "./markdown-blocks.js";
import { createActionAvailability } from "./availability-facts.js";

export type AnnotationLifecycleErrorKind = "usage" | "domain" | "conflict";

export class AnnotationLifecycleError extends Error {
  constructor(readonly code: string, message: string, readonly kind: AnnotationLifecycleErrorKind, readonly details?: unknown) {
    super(message);
    this.name = "AnnotationLifecycleError";
  }
}

export interface AnnotationSubmitPlan {
  status: "would_submit" | "already_submitted";
  selector: string;
  annotation_set: FrozenAnnotationSet;
  action_basis: string;
  candidate_sha256: string;
  frozen_sha256: string;
  receipt_sha256: string;
  writePlan: WritePlan;
}

export function annotationCandidateRelativePath(annotationSetId: string): string {
  return `runs/current/annotation-sessions/${annotationSetId}/candidate.json`;
}

export function annotationFrozenRelativePath(annotationSetId: string): string {
  return `runs/current/annotation-sets/${annotationSetId}.json`;
}

export function annotationReceiptRelativePath(annotationSetId: string): string {
  return `runs/current/receipts/annotation-submit/${annotationSetId}.json`;
}

export async function planAnnotationSubmit(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  actor: SubmitActor;
  confirmedBy: string;
  expectedActionBasis?: string;
  now?: string;
}): Promise<AnnotationSubmitPlan> {
  const annotationSetId = annotationSetIdFromSelector(input.selector);
  const confirmedBy = input.confirmedBy.trim();
  if (!confirmedBy) throw usage("annotation_confirmation_missing", "Annotation submission requires --confirmed-by.");
  const blocker = input.snapshot.diagnostics.find((diagnostic) => diagnostic.blocking);
  if (blocker) throw domain("annotation_workspace_invalid", `Workspace has blocking diagnostics: ${blocker.code}`, blocker);

  const candidateRelative = annotationCandidateRelativePath(annotationSetId);
  const candidatePath = path.join(input.snapshot.workspace, candidateRelative);
  await assertRegularContained(input.snapshot.workspace, candidatePath, "annotation candidate", "annotation_candidate_path_escape");
  const candidateBytes = await readFile(candidatePath);
  const candidateSha256 = sha256(candidateBytes);
  let candidateValue: unknown;
  try {
    candidateValue = JSON.parse(candidateBytes.toString("utf8"));
  } catch (error) {
    throw usage("invalid_annotation_candidate_json", "Annotation candidate is not valid JSON.", String(error));
  }
  const parsed = AnnotationSetCandidateSchema.safeParse(candidateValue);
  if (!parsed.success) throw usage("invalid_annotation_candidate", "Annotation candidate does not match Annotation Set v1.", parsed.error.issues);
  if (parsed.data.annotation_set_id !== annotationSetId) {
    throw usage("annotation_set_id_mismatch", "Candidate annotation_set_id must match the selector.");
  }

  const base = await validateBaseAndTargets(input.snapshot, parsed.data);
  validateSupersedes(input.snapshot, parsed.data);
  const existingFrozen = input.snapshot.annotations.find((item) => item.id === annotationSetId);
  const existingFrozenValue = existingFrozen ? FrozenAnnotationSetSchema.safeParse(existingFrozen.value) : undefined;
  if (existingFrozenValue && !existingFrozenValue.success) {
    throw conflict("annotation_output_conflict", `Existing Annotation Set is invalid: ${annotationSetId}`);
  }
  if (existingFrozenValue?.success && existingFrozenValue.data.confirmed_by !== confirmedBy) {
    throw conflict("annotation_confirmation_conflict", "Existing Annotation Set was confirmed by a different human.");
  }
  const now = existingFrozenValue?.success
    ? existingFrozenValue.data.confirmed_at
    : input.now ?? new Date().toISOString();
  const frozen = FrozenAnnotationSetSchema.parse({
    ...parsed.data,
    set_type: "manuscript_annotation",
    candidate: { path: candidateRelative, sha256: candidateSha256 },
    confirmed_by: confirmedBy,
    confirmed_at: now,
  });
  const frozenText = `${JSON.stringify(frozen, null, 2)}\n`;
  const frozenSha256 = sha256(frozenText);
  const frozenRelative = annotationFrozenRelativePath(annotationSetId);
  const frozenPath = path.join(input.snapshot.workspace, frozenRelative);
  const receiptRelative = annotationReceiptRelativePath(annotationSetId);
  const receiptPath = path.join(input.snapshot.workspace, receiptRelative);
  const setArtifactId = `A-annotation-set-${annotationSetId}`;
  const receiptArtifactId = `A-annotation-receipt-${annotationSetId}`;
  const actionBasis = annotationActionBasis(input.snapshot, input.selector);
  if (input.expectedActionBasis && input.expectedActionBasis !== actionBasis) {
    throw conflict("annotation_action_basis_stale", "Annotation action basis no longer matches current input.", {
      expected: input.expectedActionBasis,
      actual: actionBasis,
    });
  }
  const existingReceipt = await readExistingReceipt(receiptPath);
  if (existingReceipt && JSON.stringify(existingReceipt.actor) !== JSON.stringify(input.actor)) {
    throw conflict("annotation_receipt_conflict", "Existing annotation receipt has different actor provenance.");
  }
  const receipt = AnnotationSubmitReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "annotation_submit",
    receipt_id: existingReceipt?.receipt_id ?? `R-annotation-submit-${actionBasis.slice(0, 20)}`,
    annotation_set_id: annotationSetId,
    selector: input.selector,
    action_schema: "researchspec://actions/submit-annotation/v1",
    action_basis: existingReceipt?.action_basis ?? actionBasis,
    actor: input.actor,
    confirmed_by: confirmedBy,
    base_artifact_id: parsed.data.base_artifact_id,
    base_sha256: parsed.data.base_sha256,
    candidate_path: candidateRelative,
    candidate_sha256: candidateSha256,
    frozen_path: frozenRelative,
    frozen_sha256: frozenSha256,
    artifact_ids: [setArtifactId, receiptArtifactId],
    committed_at: existingReceipt?.committed_at ?? now,
  });
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptSha256 = sha256(receiptText);
  const setRecord = AnnotationSetArtifactRecordSchema.parse({
    artifact_id: setArtifactId,
    artifact_type: "annotation_set",
    path: serializeRegisteredArtifactPath(input.snapshot, frozenPath),
    sha256: frozenSha256,
    status: "accepted",
    verification_state: "verified",
    produced_by: "researchspec submit",
    base_artifact_id: parsed.data.base_artifact_id,
    annotation_set_id: annotationSetId,
    created_at: now,
    submit_receipt_artifact_id: receiptArtifactId,
  });
  const receiptRecord = AnnotationSubmitReceiptArtifactRecordSchema.parse({
    artifact_id: receiptArtifactId,
    artifact_type: "annotation_submit_receipt",
    path: serializeRegisteredArtifactPath(input.snapshot, receiptPath),
    sha256: receiptSha256,
    status: "verified",
    produced_by: "researchspec submit",
    annotation_set_id: annotationSetId,
    related_artifact_ids: [setArtifactId],
    created_at: now,
  });

  const operations: PlannedWrite[] = [];
  const frozenOperation = await createOrMatch(frozenPath, frozenRelative, frozenText, "freeze Annotation Set");
  if (frozenOperation) operations.push(frozenOperation);
  const receiptOperation = await createOrMatch(receiptPath, receiptRelative, receiptText, "write annotation submit receipt");
  if (receiptOperation) operations.push(receiptOperation);
  const registryOperation = registryWrite(input.snapshot, setRecord, receiptRecord);
  if (registryOperation) operations.push(registryOperation);

  return {
    status: operations.length ? "would_submit" : "already_submitted",
    selector: input.selector,
    annotation_set: frozen,
    action_basis: actionBasis,
    candidate_sha256: candidateSha256,
    frozen_sha256: frozenSha256,
    receipt_sha256: receiptSha256,
    writePlan: {
      operations,
      readPreconditions: [
        { path: candidatePath, expectedHash: candidateSha256, reason: "normalized annotation candidate" },
        { path: base.absolutePath, expectedHash: parsed.data.base_sha256, reason: "registered annotation base draft" },
      ],
    },
  };
}

export async function executeAnnotationPlan(plan: AnnotationSubmitPlan): Promise<void> {
  await executeWritePlan(plan.writePlan);
}

export function annotationActionBasis(
  snapshot: WorkspaceSnapshot,
  selector: string,
): string {
  return createActionAvailability(
    snapshot,
    selector,
    "allowed",
    "annotation_submission_allowed",
    [],
  ).basis_sha256;
}

async function validateBaseAndTargets(
  snapshot: WorkspaceSnapshot,
  candidate: AnnotationSetCandidate,
): Promise<{ absolutePath: string }> {
  const artifact = snapshot.artifacts.find((item) => item.artifact_id === candidate.base_artifact_id);
  if (!artifact || typeof artifact.path !== "string" || typeof artifact.sha256 !== "string") {
    throw domain("annotation_base_missing", `Registered base artifact is missing: ${candidate.base_artifact_id}`);
  }
  if (!["paper_draft", "verified_draft", "revised_draft"].includes(String(artifact.artifact_type))) {
    throw domain("annotation_base_type_unsupported", "Annotation base must be a paper_draft, verified_draft, or revised_draft.");
  }
  if (artifact.sha256 !== candidate.base_sha256) {
    throw conflict("annotation_base_hash_mismatch", "Candidate base hash differs from the registry.", {
      expected: candidate.base_sha256,
      actual: artifact.sha256,
    });
  }
  const resolved = resolveRegisteredArtifactPath(snapshot, artifact.path);
  if (!resolved.contained || path.extname(resolved.absolutePath).toLowerCase() !== ".md") {
    throw domain("annotation_base_not_markdown", "Annotation base must be a contained Markdown file.");
  }
  await assertRegularContained(resolved.root, resolved.absolutePath, "annotation base", "annotation_base_path_escape");
  const text = await readFile(resolved.absolutePath, "utf8");
  const actualSha256 = sha256(text);
  if (actualSha256 !== candidate.base_sha256) {
    throw conflict("annotation_base_hash_mismatch", "Annotation base file has drifted.", {
      expected: candidate.base_sha256,
      actual: actualSha256,
    });
  }
  const headings = markdownSectionHeadings(text);
  const blocks = parseAnchoredBlocks(text);
  const byId = new Map(blocks.map((block) => [block.id, block]));
  for (const annotation of candidate.annotations) {
    const target = annotation.target;
    if (target.kind === "document") continue;
    if (target.kind === "section") {
      if (headings.filter((heading) => heading === target.heading).length !== 1) {
        throw domain("annotation_section_not_unique", `Annotation section target is missing or ambiguous: ${target.heading}`);
      }
      continue;
    }
    const block = byId.get(target.block_id);
    if (!block) throw domain("annotation_block_missing", `Annotation block target is missing: ${target.block_id}`);
    if (block.hash !== target.block_sha256) {
      throw conflict("annotation_block_hash_mismatch", `Annotation block hash has drifted: ${target.block_id}`);
    }
    if (target.kind === "quote") {
      const first = block.content.indexOf(target.exact_quote);
      const last = block.content.lastIndexOf(target.exact_quote);
      if (first < 0 || first !== last) {
        throw domain("annotation_quote_not_unique", `Annotation quote must occur exactly once in block ${target.block_id}.`);
      }
      const before = block.content.slice(0, first);
      const after = block.content.slice(first + target.exact_quote.length);
      if (!before.endsWith(target.prefix) || !after.startsWith(target.suffix)) {
        throw conflict("annotation_quote_context_mismatch", `Annotation quote context has drifted in block ${target.block_id}.`);
      }
    }
  }
  return { absolutePath: resolved.absolutePath };
}

function validateSupersedes(snapshot: WorkspaceSnapshot, candidate: AnnotationSetCandidate): void {
  if (!candidate.supersedes_annotation_set_id) return;
  const predecessor = snapshot.annotations.find((item) => item.id === candidate.supersedes_annotation_set_id);
  if (!predecessor) throw domain("annotation_supersedes_missing", `Superseded Annotation Set is missing: ${candidate.supersedes_annotation_set_id}`);
  if (record(predecessor.value).base_artifact_id !== candidate.base_artifact_id) {
    throw domain("annotation_supersedes_base_mismatch", "Superseding Annotation Sets must target the same base artifact.");
  }
}

function registryWrite(
  snapshot: WorkspaceSnapshot,
  setRecord: Record<string, unknown>,
  receiptRecord: Record<string, unknown>,
): PlannedWrite | undefined {
  const registryFile = snapshot.files.get("runs/current/artifact-registry.json");
  if (!registryFile) throw domain("annotation_registry_missing", "Artifact registry is unavailable.");
  const additions = [setRecord, receiptRecord];
  for (const addition of additions) {
    const existing = snapshot.artifacts.find((item) => item.artifact_id === addition.artifact_id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(addition)) {
      throw conflict("annotation_registry_conflict", `Artifact ID is occupied by different content: ${String(addition.artifact_id)}`);
    }
  }
  const missing = additions.filter((addition) => !snapshot.artifacts.some((item) => item.artifact_id === addition.artifact_id));
  if (!missing.length) return undefined;
  const registry = ArtifactRegistrySchema.parse({
    ...record(snapshot.documents["runs/current/artifact-registry.json"]),
    artifacts: [...snapshot.artifacts, ...missing],
  });
  const content = `${JSON.stringify(registry, null, 2)}\n`;
  return {
    action: "refresh",
    path: registryFile.absolutePath,
    relativePath: registryFile.relativePath,
    content,
    scope: "workspace",
    ownership: "user",
    previousHash: registryFile.hash,
    nextHash: sha256(content),
    reason: "register Annotation Set and submit receipt",
  };
}

async function createOrMatch(
  target: string,
  relativePath: string,
  content: string,
  reason: string,
): Promise<PlannedWrite | undefined> {
  const operation = await planFile({ path: target, relativePath, content, scope: "workspace", ownership: "user" });
  if (operation.action === "create") return { ...operation, reason };
  if (operation.action === "skip-unchanged") return undefined;
  throw conflict("annotation_output_conflict", `Annotation transaction target exists with different content: ${target}`);
}

async function readExistingReceipt(target: string) {
  let text: string;
  try {
    text = await readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    throw conflict("annotation_receipt_conflict", "Existing annotation receipt is not valid JSON.");
  }
  const parsed = AnnotationSubmitReceiptSchema.safeParse(value);
  if (!parsed.success) throw conflict("annotation_receipt_conflict", "Existing annotation receipt is invalid.", parsed.error.issues);
  return parsed.data;
}

async function assertRegularContained(root: string, candidate: string, label: string, code: string): Promise<void> {
  if (!isPathContained(root, candidate)) throw domain(code, `${label} escapes its allowed root.`);
  let info;
  try {
    info = await lstat(candidate);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw usage("annotation_candidate_missing", `${label} is missing: ${candidate}`);
    throw error;
  }
  if (!info.isFile() || info.isSymbolicLink()) throw domain(code, `${label} must be a regular non-symlink file.`);
  const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
  if (!isPathContained(realRoot, realCandidate)) throw domain(code, `${label} resolves outside its allowed root.`);
}

function annotationSetIdFromSelector(selector: string): string {
  const match = /^annotation:([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(selector);
  if (!match?.[1] || selector.includes("..")) throw usage("invalid_annotation_selector", `Invalid annotation selector: ${selector}`);
  return match[1];
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function usage(code: string, message: string, details?: unknown): AnnotationLifecycleError {
  return new AnnotationLifecycleError(code, message, "usage", details);
}

function domain(code: string, message: string, details?: unknown): AnnotationLifecycleError {
  return new AnnotationLifecycleError(code, message, "domain", details);
}

function conflict(code: string, message: string, details?: unknown): AnnotationLifecycleError {
  return new AnnotationLifecycleError(code, message, "conflict", details);
}
