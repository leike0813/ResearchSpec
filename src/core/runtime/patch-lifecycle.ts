import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import {
  AppliedDraftArtifactRecordSchema,
  ApplyReceiptArtifactRecordSchema,
  ApplyReportArtifactRecordSchema,
  AnnotationResolutionReportArtifactRecordSchema,
  ArtifactRegistrySchema,
  type SubmitActor,
} from "../contracts/artifact.js";
import { CaseStateSchema, type CaseState } from "../contracts/case-state.js";
import {
  CanonicalDraftPatchSchema,
  CanonicalDraftPatchV2Schema,
  DraftPatchApplyReportSchema,
  DraftPatchReceiptSchema,
  DraftPatchSemanticInputSchema,
  DraftPatchSubmitInputSchema,
  type CanonicalDraftPatch,
  type DraftPatchSubmitInput,
} from "../contracts/draft-patch.js";
import {
  AnnotationResolutionReportSchema,
  FrozenAnnotationSetSchema,
  type AnnotationResolutionEntry,
} from "../contracts/annotation.js";
import { resolveWorkNode, type WorkflowNodeDefinition } from "../contracts/workflow.js";
import type { IndexedItem, WorkspaceSnapshot } from "../workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite, type WritePlan } from "../workspace/write-plan.js";
import {
  isPathContained,
  resolveRegisteredArtifactPath,
  serializeRegisteredArtifactPath,
  toPosixPath,
} from "./artifact-path.js";
import { applyDraftOperations } from "./lifecycle.js";

export type PatchLifecycleErrorKind = "usage" | "domain" | "conflict";

export class PatchLifecycleError extends Error {
  constructor(readonly code: string, message: string, readonly kind: PatchLifecycleErrorKind, readonly details?: unknown) {
    super(message);
    this.name = "PatchLifecycleError";
  }
}

export interface PatchSubmitPlan {
  status: "would_submit" | "already_submitted";
  selector: string;
  patch: CanonicalDraftPatch;
  plan_sha256: string;
  receipt_sha256: string;
  writePlan: WritePlan;
}

export interface PatchAdvancePlan {
  status: "would_apply" | "would_mark_stale" | "already_applied" | "already_stale";
  selector: string;
  patch_id: string;
  plan_sha256: string;
  revised_artifact_id?: string;
  apply_report_artifact_id?: string;
  annotation_resolution_report_artifact_id?: string;
  receipt_sha256?: string;
  writePlan: WritePlan;
}

export async function planPatchSubmit(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  payload: unknown;
  actor: SubmitActor;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<PatchSubmitPlan> {
  const patchId = patchIdFromSelector(input.selector);
  const semantic = DraftPatchSemanticInputSchema.safeParse(input.payload);
  if (!semantic.success) throw usage("invalid_patch_input", "Patch semantic input does not match the strict schema.", semantic.error.issues);
  const parsed = DraftPatchSubmitInputSchema.safeParse({
    ...semantic.data,
    patch_format_version: "3",
    ops: semantic.data.ops.map((operation, index) => ({
      ...operation,
      operation_id: operation.operation_id ?? `op-${String(index + 1).padStart(3, "0")}`,
      annotation_refs: operation.annotation_refs ?? [],
    })),
  });
  if (!parsed.success) throw usage("invalid_patch_input", "CLI-derived patch input is invalid.", parsed.error.issues);
  assertWorkspaceValid(input.snapshot, "patch_submit_workspace_invalid");
  validateScope(input.snapshot, parsed.data);
  await validateBase(input.snapshot, parsed.data.base_artifact_id, parsed.data.base_sha256);
  validateEvidence(input.snapshot, parsed.data.evidence_artifact_ids);
  validateAnnotationResolution(input.snapshot, parsed.data);

  const now = input.now ?? new Date().toISOString();
  const patch = CanonicalDraftPatchSchema.parse({
    ...parsed.data,
    patch_id: patchId,
    status: "proposed",
    emitted_by: input.actor,
    created_at: now,
  });
  const patchText = `${JSON.stringify(patch, null, 2)}\n`;
  const patchRelative = `draft-patches/${patchId}.json`;
  const patchPath = path.join(input.snapshot.workspace, patchRelative);
  const existing = input.snapshot.patches.find((item) => item.id === patchId);
  const planSha256 = patchPlanSha256(input.snapshot, input.selector, "submit", {
    actor: input.actor,
    patch: parsed.data,
  });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);

  if (existing) {
    if (canonicalInputEqual(existing.value, patch)) {
      return {
        status: "already_submitted",
        selector: input.selector,
        patch,
        plan_sha256: planSha256,
        receipt_sha256: await existingReceiptHash(input.snapshot, `runs/current/receipts/draft-patch/${patchId}-submit.json`),
        writePlan: { operations: [] },
      };
    }
    throw conflict("patch_id_conflict", `Patch ID already exists with different content: ${patchId}`);
  }

  const receiptRelative = `runs/current/receipts/draft-patch/${patchId}-submit.json`;
  const receiptPath = path.join(input.snapshot.workspace, receiptRelative);
  const receipt = DraftPatchReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "draft_patch_submit",
    receipt_id: `R-patch-submit-${planSha256.slice(0, 16)}`,
    patch_id: patchId,
    selector: input.selector,
    plan_sha256: planSha256,
    actor: input.actor,
    base_artifact_id: patch.base_artifact_id,
    base_sha256: patch.base_sha256,
    output_hashes: { [patchRelative]: sha256(patchText) },
    artifact_ids: patch.evidence_artifact_ids,
    effects: [{ kind: "patch_submitted", refs: [input.selector] }],
    committed_at: now,
  });
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const patchOperation = await createOnly(patchPath, patchRelative, patchText, "create canonical pending draft patch");
  const receiptOperation = await createOnly(receiptPath, receiptRelative, receiptText, "write draft patch submit receipt");
  const operations: PlannedWrite[] = [patchOperation, receiptOperation];
  const stateOperation = adaptiveCaseActionWrite(input.snapshot, {
    selector: input.selector,
    kind: "patch",
    status: "pending",
    obligationScope: patch.obligation_scope,
    payloadRef: { path: patchRelative, sha256: sha256(patchText) },
    receipt: { receipt_id: receipt.receipt_id, receipt_type: receipt.receipt_type, path: receiptRelative, sha256: sha256(receiptText) },
    now,
    linkedChangeId: "linked_change_id" in patch.semantic_delta ? patch.semantic_delta.linked_change_id : undefined,
  });
  if (stateOperation) operations.push(stateOperation);
  return {
    status: "would_submit",
    selector: input.selector,
    patch,
    plan_sha256: planSha256,
    receipt_sha256: sha256(receiptText),
    writePlan: { operations, readPreconditions: patchReadPreconditions(input.snapshot, patch.base_artifact_id) },
  };
}

export async function planPatchAdvance(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  actor: SubmitActor;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<PatchAdvancePlan> {
  const patchId = patchIdFromSelector(input.selector);
  assertWorkspaceValid(input.snapshot, "patch_advance_workspace_invalid");
  const item = input.snapshot.patches.find((candidate) => candidate.id === patchId);
  if (!item) throw usage("patch_missing", `Patch not found: ${input.selector}`);
  const patch = normalizedPatch(input.snapshot, item);
  const currentStatus = string(record(item.value).status) || "proposed";
  const planSha256 = patchPlanSha256(input.snapshot, input.selector, "advance", { actor: input.actor, patch_id: patchId });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);
  if (currentStatus === "applied") return { status: "already_applied", selector: input.selector, patch_id: patchId, plan_sha256: planSha256, writePlan: { operations: [] } };
  if (currentStatus === "stale") return { status: "already_stale", selector: input.selector, patch_id: patchId, plan_sha256: planSha256, writePlan: { operations: [] } };
  if (currentStatus !== "accepted") throw conflict("patch_not_accepted", `Patch must be accepted before Advance: ${currentStatus}`);
  if (!patch.decision_id) throw domain("patch_decision_missing", "Accepted patch has no Decision reference.");
  if ("linked_change_id" in patch.semantic_delta) {
    const linkedChangeId = patch.semantic_delta.linked_change_id;
    const linked = input.snapshot.changes.find((change) => change.id === linkedChangeId);
    if (!linked || string(record(linked.value).status) !== "applied") {
      throw domain("patch_change_unresolved", `Linked contract change is not applied: change:${linkedChangeId}`);
    }
  }

  const base = input.snapshot.artifacts.find((artifact) => artifact.artifact_id === patch.base_artifact_id);
  if (!base || typeof base.path !== "string") throw domain("patch_base_missing", `Base artifact not found: ${patch.base_artifact_id}`);
  const baseResolution = requiredRegisteredArtifactPath(input.snapshot, base.path);
  const basePath = baseResolution.absolutePath;
  await assertRegularContained(baseResolution.root, basePath, "base draft");
  const original = await readFile(basePath, "utf8");
  const actualBaseSha256 = sha256(original);
  const now = input.now ?? new Date().toISOString();
  if (actualBaseSha256 !== patch.base_sha256) {
    const operations = await staleWrites(input.snapshot, item, patch, input.actor, planSha256, now, actualBaseSha256);
    return {
      status: "would_mark_stale",
      selector: input.selector,
      patch_id: patchId,
      plan_sha256: planSha256,
      receipt_sha256: operations.receiptSha256,
      writePlan: { operations: operations.operations, readPreconditions: [{ path: basePath, expectedHash: actualBaseSha256, reason: "observed stale draft base" }] },
    };
  }

  const revised = applyDraftOperations(original, patch.ops);
  const workflowBinding = strictWorkflowBinding(input.snapshot, patch);
  const extension = path.extname(basePath);
  const output = workflowBinding
    ? path.join(input.snapshot.workspace, workflowBinding.revised.output.workspace_path)
    : path.join(path.dirname(basePath), `${path.basename(basePath, extension)}.${patchId}${extension || ".md"}`);
  const outputRelative = serializePatchArtifactPath(input.snapshot, output, "revised draft");
  const reportRelativeWorkspace = workflowBinding?.report.output.workspace_path ?? `runs/current/apply-reports/${patchId}.json`;
  const reportPath = path.join(input.snapshot.workspace, reportRelativeWorkspace);
  const reportRegistryPath = serializePatchArtifactPath(input.snapshot, reportPath, "apply report");
  const receiptRelativeWorkspace = `runs/current/receipts/draft-patch/${patchId}-apply.json`;
  const receiptPath = path.join(input.snapshot.workspace, receiptRelativeWorkspace);
  const receiptRegistryPath = serializePatchArtifactPath(input.snapshot, receiptPath, "apply receipt");
  const revisedArtifactId = `A-${patchId}`;
  const reportArtifactId = `A-apply-report-${patchId}`;
  const resolutionReportArtifactId = patch.annotation_resolution ? `A-annotation-resolution-${patchId}` : undefined;
  const receiptArtifactId = `A-receipt-${patchId}`;
  const revisedSha256 = sha256(revised);
  const resolution = resolutionReportArtifactId
    ? deriveAnnotationResolutionReport(input.snapshot, patch, {
      revisedArtifactId,
      revisedSha256,
      now,
    })
    : undefined;
  const report = DraftPatchApplyReportSchema.parse({
    schema_version: "1",
    report_type: "draft_patch_apply",
    patch_id: patchId,
    base_artifact_id: patch.base_artifact_id,
    base_sha256: patch.base_sha256,
    revised_artifact_id: revisedArtifactId,
    revised_sha256: revisedSha256,
    operation_count: patch.ops.length,
    evidence_artifact_ids: patch.evidence_artifact_ids,
    semantic_delta: patch.semantic_delta,
    decision_id: patch.decision_id,
    ...(resolutionReportArtifactId ? { annotation_resolution_report_artifact_id: resolutionReportArtifactId } : {}),
    applied_at: now,
  });
  const reportText = `${JSON.stringify(report, null, 2)}\n`;
  const receipt = DraftPatchReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "draft_patch_apply",
    receipt_id: `R-patch-apply-${planSha256.slice(0, 16)}`,
    patch_id: patchId,
    selector: input.selector,
    plan_sha256: planSha256,
    actor: input.actor,
    decision_id: patch.decision_id,
    base_artifact_id: patch.base_artifact_id,
    base_sha256: patch.base_sha256,
    output_hashes: {
      [outputRelative]: revisedSha256,
      [reportRegistryPath]: sha256(reportText),
      ...(resolution ? { [resolution.registryPath]: resolution.sha256 } : {}),
    },
    artifact_ids: [revisedArtifactId, reportArtifactId, ...(resolutionReportArtifactId ? [resolutionReportArtifactId] : []), receiptArtifactId],
    effects: [{
      kind: "patch_applied",
      refs: [
        input.selector,
        `artifact:${revisedArtifactId}`,
        `artifact:${reportArtifactId}`,
        ...(resolutionReportArtifactId ? [`artifact:${resolutionReportArtifactId}`] : []),
      ],
    }],
    committed_at: now,
  });
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const revisedArtifact = AppliedDraftArtifactRecordSchema.parse({
    artifact_id: revisedArtifactId,
    artifact_type: "revised_draft",
    path: outputRelative,
    sha256: revisedSha256,
    status: "accepted",
    verification_state: "verified",
    produced_by: "researchspec advance",
    created_at: now,
    derived_from_artifact_ids: [patch.base_artifact_id],
    patch_id: patchId,
    apply_receipt_artifact_id: receiptArtifactId,
    ...(workflowBinding ? {
      work_item_id: workflowBinding.revised.id,
      subflow_instance_id: patch.subflow_instance_id ?? undefined,
      stage_id: workflowBinding.revised.stage_id,
    } : {}),
  });
  const reportArtifact = ApplyReportArtifactRecordSchema.parse({
    artifact_id: reportArtifactId,
    artifact_type: "apply_report",
    path: reportRegistryPath,
    sha256: sha256(reportText),
    status: "accepted",
    verification_state: "verified",
    produced_by: "researchspec advance",
    related_artifact_ids: [patch.base_artifact_id, revisedArtifactId],
    created_at: now,
    patch_id: patchId,
    apply_receipt_artifact_id: receiptArtifactId,
    ...(workflowBinding ? {
      work_item_id: workflowBinding.report.id,
      subflow_instance_id: patch.subflow_instance_id ?? undefined,
      stage_id: workflowBinding.report.stage_id,
    } : {}),
  });
  const receiptArtifact = ApplyReceiptArtifactRecordSchema.parse({
    artifact_id: receiptArtifactId,
    artifact_type: "apply_receipt",
    path: receiptRegistryPath,
    sha256: sha256(receiptText),
    status: "verified",
    produced_by: "researchspec advance",
    created_at: now,
    patch_id: patchId,
    related_artifact_ids: [revisedArtifactId, reportArtifactId, ...(resolutionReportArtifactId ? [resolutionReportArtifactId] : [])],
  });
  const resolutionArtifact = resolution && resolutionReportArtifactId
    ? AnnotationResolutionReportArtifactRecordSchema.parse({
      artifact_id: resolutionReportArtifactId,
      artifact_type: "annotation_resolution_report",
      path: resolution.registryPath,
      sha256: resolution.sha256,
      status: "accepted",
      verification_state: "verified",
      produced_by: "researchspec advance",
      patch_id: patchId,
      related_artifact_ids: [
        patch.base_artifact_id,
        revisedArtifactId,
        reportArtifactId,
        ...resolution.annotationSetArtifactIds,
      ],
      created_at: now,
      apply_receipt_artifact_id: receiptArtifactId,
    })
    : undefined;
  assertArtifactIdsAvailable(input.snapshot, [revisedArtifactId, reportArtifactId, ...(resolutionReportArtifactId ? [resolutionReportArtifactId] : []), receiptArtifactId]);
  const registry = ArtifactRegistrySchema.parse({
    ...input.snapshot.documents["runs/current/artifact-registry.json"] as object,
    artifacts: [...input.snapshot.artifacts, revisedArtifact, reportArtifact, ...(resolutionArtifact ? [resolutionArtifact] : []), receiptArtifact],
  });
  const registryText = `${JSON.stringify(registry, null, 2)}\n`;
  const registryFile = requiredFile(input.snapshot, "runs/current/artifact-registry.json");
  const patchText = lifecyclePatchText(item, {
    status: "applied",
    resolved_at: now,
    applied_artifact_id: revisedArtifactId,
    apply_report_artifact_id: reportArtifactId,
    ...(resolutionReportArtifactId ? { annotation_resolution_report_artifact_id: resolutionReportArtifactId } : {}),
    apply_receipt_artifact_id: receiptArtifactId,
  });
  const operations: PlannedWrite[] = [
    await createOnly(
      output,
      workflowBinding?.revised.output.workspace_path ?? outputRelative,
      revised,
      "create revised draft from accepted patch",
      workflowBinding || input.snapshot.runtimeMode === "adaptive" ? "workspace" : "project",
    ),
    await createOnly(reportPath, reportRelativeWorkspace, reportText, "write patch apply report"),
    ...(resolution ? [await createOnly(resolution.path, resolution.relativePath, resolution.text, "write Annotation Resolution Report")] : []),
    await createOnly(receiptPath, receiptRelativeWorkspace, receiptText, "write patch apply receipt"),
    refresh(registryFile, registryText, "register patch outputs and receipt"),
    refreshPatch(item, patchText, "commit applied patch lifecycle"),
  ];
  const stateOperation = adaptiveAppliedStateWrite(input.snapshot, patch, {
    patchText,
    receipt: { receipt_id: receipt.receipt_id, receipt_type: receipt.receipt_type, path: receiptRelativeWorkspace, sha256: sha256(receiptText) },
    revisedArtifact,
    reportArtifact,
    receiptRelative: receiptRegistryPath,
    receiptSha256: sha256(receiptText),
    now,
  });
  if (stateOperation) operations.push(stateOperation);
  return {
    status: "would_apply",
    selector: input.selector,
    patch_id: patchId,
    plan_sha256: planSha256,
    revised_artifact_id: revisedArtifactId,
    apply_report_artifact_id: reportArtifactId,
    ...(resolutionReportArtifactId ? { annotation_resolution_report_artifact_id: resolutionReportArtifactId } : {}),
    receipt_sha256: sha256(receiptText),
    writePlan: { operations, readPreconditions: [{ path: basePath, expectedHash: patch.base_sha256, reason: "accepted patch base" }] },
  };
}

export async function executePatchPlan(plan: PatchSubmitPlan | PatchAdvancePlan): Promise<"applied" | "already_applied"> {
  if (plan.writePlan.operations.length === 0) return "already_applied";
  await executeWritePlan(plan.writePlan);
  return "applied";
}

function normalizedPatch(snapshot: WorkspaceSnapshot, item: IndexedItem): CanonicalDraftPatch {
  const value = record(item.value);
  const canonical = CanonicalDraftPatchSchema.safeParse(value);
  if (canonical.success) return canonical.data;
  const canonicalV2 = CanonicalDraftPatchV2Schema.safeParse(value);
  if (canonicalV2.success) {
    return CanonicalDraftPatchSchema.parse({
      ...canonicalV2.data,
      patch_format_version: "3",
      ops: canonicalV2.data.ops.map((operation, index) => ({
        ...operation,
        operation_id: `legacy-op-${String(index + 1).padStart(3, "0")}`,
        annotation_refs: [],
      })),
    });
  }
  const emitted = typeof value.emitted_by === "string" ? { kind: "agent" as const, name: value.emitted_by } : record(value.emitted_by);
  const baseHash = string(value.base_draft_hash).replace(/^sha256:/, "");
  const artifactHash = snapshot.artifacts.find((artifact) => artifact.artifact_id === value.base_artifact_id)?.sha256;
  const normalizedBaseHash = baseHash.length === 64 ? baseHash : typeof artifactHash === "string" ? artifactHash : "";
  if (!/^[a-f0-9]{64}$/.test(normalizedBaseHash)) throw domain("patch_base_hash_missing", "Legacy patch has no complete trusted base artifact hash.");
  return CanonicalDraftPatchSchema.parse({
    patch_format_version: "3",
    patch_id: value.patch_id,
    revision_round: value.revision_round,
    status: value.status,
    base_artifact_id: value.base_artifact_id,
    base_sha256: normalizedBaseHash,
    emitted_by: emitted,
    producer_skill: "academic-paper",
    producer_mode: "revision",
    subflow_instance_id: null,
    obligation_scope: [],
    evidence_artifact_ids: [],
    semantic_delta: { level: "none" },
    ops: Array.isArray(value.ops) ? value.ops.map((operation, index) => ({
      ...record(operation),
      operation_id: `legacy-op-${String(index + 1).padStart(3, "0")}`,
      annotation_refs: [],
    })) : [],
    created_at: typeof value.created_at === "string" ? value.created_at : new Date(0).toISOString(),
    ...(typeof value.decision_id === "string" ? { decision_id: value.decision_id } : {}),
  });
}

async function staleWrites(
  snapshot: WorkspaceSnapshot,
  item: IndexedItem,
  patch: CanonicalDraftPatch,
  actor: SubmitActor,
  planSha256: string,
  now: string,
  actualBaseSha256: string,
): Promise<{ operations: PlannedWrite[]; receiptSha256: string }> {
  const receiptRelative = `runs/current/receipts/draft-patch/${patch.patch_id}-stale.json`;
  const receiptPath = path.join(snapshot.workspace, receiptRelative);
  const receipt = DraftPatchReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "draft_patch_stale",
    receipt_id: `R-patch-stale-${planSha256.slice(0, 16)}`,
    patch_id: patch.patch_id,
    selector: `patch:${patch.patch_id}`,
    plan_sha256: planSha256,
    actor,
    decision_id: patch.decision_id,
    base_artifact_id: patch.base_artifact_id,
    base_sha256: patch.base_sha256,
    output_hashes: {},
    artifact_ids: [],
    effects: [{ kind: "patch_marked_stale", refs: [`patch:${patch.patch_id}`, `sha256:${actualBaseSha256}`] }],
    committed_at: now,
  });
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const patchText = lifecyclePatchText(item, { status: "stale", resolved_at: now, stale_receipt_path: receiptRelative });
  const operations: PlannedWrite[] = [
    await createOnly(receiptPath, receiptRelative, receiptText, "write stale patch receipt"),
    refreshPatch(item, patchText, "commit stale patch lifecycle"),
  ];
  const stateOperation = adaptiveStatusWrite(snapshot, `patch:${patch.patch_id}`, "stale", patchText, {
    receipt_id: receipt.receipt_id,
    receipt_type: receipt.receipt_type,
    path: receiptRelative,
    sha256: sha256(receiptText),
  }, now);
  if (stateOperation) operations.push(stateOperation);
  return { operations, receiptSha256: sha256(receiptText) };
}

function adaptiveCaseActionWrite(
  snapshot: WorkspaceSnapshot,
  input: {
    selector: string;
    kind: "patch" | "contract_change";
    status: "pending" | "accepted" | "rejected" | "postponed" | "applied" | "stale";
    obligationScope: string[];
    payloadRef: { path: string; sha256: string };
    receipt: { receipt_id: string; receipt_type: string; path: string; sha256: string };
    now: string;
    linkedChangeId?: string;
  },
): PlannedWrite | undefined {
  const state = snapshot.caseState;
  if (snapshot.runtimeMode !== "adaptive" || !state) return undefined;
  const actionId = actionIdFor(input.selector);
  const actions = state.case_actions.filter((item) => item.selector !== input.selector);
  actions.push({
    action_id: actionId,
    selector: input.selector,
    kind: input.kind,
    obligation_scope: input.obligationScope,
    status: input.status,
    payload_ref: input.payloadRef,
    created_at: input.now,
  });
  const linkedChangeId = input.linkedChangeId;
  if (linkedChangeId && !actions.some((item) => item.selector === `change:${linkedChangeId}`)) {
    actions.push({
      action_id: actionIdFor(`change:${linkedChangeId}`),
      selector: `change:${linkedChangeId}`,
      kind: "contract_change",
      obligation_scope: input.obligationScope,
      status: "pending",
      rationale: "A high-impact draft patch requires an accepted contract change.",
      created_at: input.now,
    });
  }
  const next = CaseStateSchema.parse({
    ...state,
    case_actions: actions,
    receipts: upsertReceipt(state, input.receipt),
    updated_at: input.now,
  });
  return caseStateOperation(snapshot, next);
}

function adaptiveAppliedStateWrite(
  snapshot: WorkspaceSnapshot,
  patch: CanonicalDraftPatch,
  input: {
    patchText: string;
    receipt: { receipt_id: string; receipt_type: string; path: string; sha256: string };
    revisedArtifact: { artifact_id: string; artifact_type: string; path: string; sha256: string };
    reportArtifact: { artifact_id: string; artifact_type: string; path: string; sha256: string };
    receiptRelative: string;
    receiptSha256: string;
    now: string;
  },
): PlannedWrite | undefined {
  const state = snapshot.caseState;
  if (snapshot.runtimeMode !== "adaptive" || !state) return undefined;
  const evidence = [
    { artifact: input.revisedArtifact, obligationId: matchingObligation(state, patch.obligation_scope, "revised_draft") },
    { artifact: input.reportArtifact, obligationId: matchingObligation(state, patch.obligation_scope, "apply_report") },
  ].filter((item): item is { artifact: typeof input.revisedArtifact; obligationId: string } => Boolean(item.obligationId));
  const accepted = evidence.map(({ artifact, obligationId }) => ({
    evidence_id: `EV-${artifact.artifact_id}`,
    obligation_id: obligationId,
    artifact_id: artifact.artifact_id,
    artifact_type: artifact.artifact_type,
    path: artifact.path,
    sha256: artifact.sha256,
    accepted_at: input.now,
    acceptance_receipt: { path: input.receiptRelative, sha256: input.receiptSha256 },
  }));
  const next = CaseStateSchema.parse({
    ...state,
    obligations: state.obligations.map((obligation) => {
      const additions = accepted.filter((item) => item.obligation_id === obligation.obligation_id);
      return additions.length ? {
        ...obligation,
        status: "satisfied",
        accepted_evidence_ids: [...new Set([...obligation.accepted_evidence_ids, ...additions.map((item) => item.evidence_id)])],
      } : obligation;
    }),
    accepted_evidence: [...state.accepted_evidence.filter((item) => !accepted.some((nextItem) => nextItem.evidence_id === item.evidence_id)), ...accepted],
    case_actions: state.case_actions.map((action) => action.selector === `patch:${patch.patch_id}` ? {
      ...action,
      status: "applied",
      payload_ref: { path: `draft-patches/${patch.patch_id}.json`, sha256: sha256(input.patchText) },
    } : action),
    receipts: upsertReceipt(state, input.receipt),
    updated_at: input.now,
  });
  return caseStateOperation(snapshot, next);
}

function adaptiveStatusWrite(
  snapshot: WorkspaceSnapshot,
  selector: string,
  status: "stale" | "accepted" | "rejected" | "postponed" | "applied",
  payloadText: string,
  receipt: { receipt_id: string; receipt_type: string; path: string; sha256: string },
  now: string,
): PlannedWrite | undefined {
  const state = snapshot.caseState;
  if (snapshot.runtimeMode !== "adaptive" || !state) return undefined;
  const patchId = selector.slice("patch:".length);
  const next = CaseStateSchema.parse({
    ...state,
    case_actions: state.case_actions.map((action) => action.selector === selector ? {
      ...action,
      status,
      payload_ref: { path: `draft-patches/${patchId}.json`, sha256: sha256(payloadText) },
    } : action),
    receipts: upsertReceipt(state, receipt),
    updated_at: now,
  });
  return caseStateOperation(snapshot, next);
}

function matchingObligation(state: CaseState, scope: string[], artifactType: string): string | undefined {
  return state.obligations.find((obligation) => scope.includes(obligation.obligation_id)
    && (obligation.title.toLowerCase().includes(artifactType.replaceAll("_", " "))
      || obligation.definition_id?.endsWith(`--${artifactType.replaceAll("_", "-")}`)))?.obligation_id;
}

function validateScope(snapshot: WorkspaceSnapshot, patch: DraftPatchSubmitInput): void {
  if (snapshot.runtimeMode === "strict") {
    strictWorkflowBinding(snapshot, patch);
    return;
  }
  const state = snapshot.caseState;
  if (!state) throw domain("adaptive_case_state_missing", "Adaptive patch submission requires CaseState.");
  const known = new Set(state.obligations.map((item) => item.obligation_id));
  const missing = patch.obligation_scope.filter((id) => !known.has(id));
  if (missing.length) throw usage("patch_scope_invalid", "Patch obligation scope contains unknown obligations.", { missing });
  if (patch.subflow_instance_id && patch.obligation_scope.some((id) => state.obligations.find((item) => item.obligation_id === id)?.scope.subflow_instance_id !== patch.subflow_instance_id)) {
    throw usage("patch_scope_invalid", "Patch obligations must belong to the declared subflow.");
  }
}

function strictWorkflowBinding(
  snapshot: WorkspaceSnapshot,
  patch: Pick<DraftPatchSubmitInput, "subflow_instance_id">,
): { revised: WorkflowNodeDefinition; report: WorkflowNodeDefinition } | undefined {
  if (snapshot.runtimeMode !== "strict" || !patch.subflow_instance_id) return undefined;
  const instance = snapshot.runState?.subflows.find((item) => item.instance_id === patch.subflow_instance_id);
  if (!instance) throw usage("patch_scope_invalid", `Patch subflow does not exist: ${patch.subflow_instance_id}`);
  if (instance.status !== "active") throw domain("patch_scope_inactive", `Patch subflow is not active: ${patch.subflow_instance_id}`);
  const template = snapshot.workflow?.subflow_templates.find((item) => item.template_id === instance.template_id);
  if (!template) throw domain("patch_scope_invalid", `Patch subflow template is unavailable: ${instance.template_id}`);
  const nodeFor = (artifactType: "revised_draft" | "apply_report"): WorkflowNodeDefinition => {
    const candidates = template.work_items.filter((item) => item.output.artifact_type === artifactType);
    const candidate = candidates.at(0);
    if (candidates.length !== 1 || !candidate) {
      throw domain("patch_scope_invalid", `Patch subflow must define exactly one ${artifactType} work item.`);
    }
    return resolveWorkNode(candidate, instance.instance_id, instance.round_number);
  };
  return { revised: nodeFor("revised_draft"), report: nodeFor("apply_report") };
}

async function validateBase(snapshot: WorkspaceSnapshot, artifactId: string, expectedHash: string): Promise<void> {
  const artifact = snapshot.artifacts.find((item) => item.artifact_id === artifactId);
  if (!artifact || typeof artifact.path !== "string" || typeof artifact.sha256 !== "string") throw domain("patch_base_missing", `Base artifact not found: ${artifactId}`);
  if (artifact.sha256 !== expectedHash) throw conflict("patch_base_hash_mismatch", "Patch base hash does not match the artifact registry.", { expected: expectedHash, actual: artifact.sha256 });
  const baseResolution = requiredRegisteredArtifactPath(snapshot, artifact.path);
  const basePath = baseResolution.absolutePath;
  await assertRegularContained(baseResolution.root, basePath, "base draft");
  const actual = sha256(await readFile(basePath));
  if (actual !== expectedHash) throw conflict("patch_base_hash_mismatch", "Patch base file does not match the declared hash.", { expected: expectedHash, actual });
}

function validateEvidence(snapshot: WorkspaceSnapshot, ids: string[]): void {
  const known = new Set(snapshot.artifacts.map((item) => item.artifact_id).filter((id): id is string => typeof id === "string"));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) throw domain("patch_evidence_missing", "Patch evidence references are missing.", { missing });
}

function deriveAnnotationResolutionReport(
  snapshot: WorkspaceSnapshot,
  patch: CanonicalDraftPatch,
  input: {
    revisedArtifactId: string;
    revisedSha256: string;
    now: string;
  },
) {
  if (!patch.annotation_resolution || !patch.decision_id) {
    throw domain("patch_annotation_resolution_missing", "Annotation Resolution Report requires patch resolution entries and Decision.");
  }
  const operationIds = new Map<string, string[]>();
  for (const operation of patch.ops) {
    for (const reference of operation.annotation_refs) {
      const key = annotationKey(reference.annotation_set_id, reference.annotation_id);
      operationIds.set(key, [...(operationIds.get(key) ?? []), operation.operation_id]);
    }
  }
  const setIds = [...new Set(patch.annotation_resolution.entries.map((entry) => entry.annotation_set_id))].sort();
  const annotationSets = setIds.map((setId) => {
    const artifact = snapshot.artifacts.find((item) => item.artifact_type === "annotation_set"
      && item.annotation_set_id === setId);
    if (!artifact || typeof artifact.artifact_id !== "string" || typeof artifact.sha256 !== "string") {
      throw domain("patch_annotation_set_unregistered", `Annotation Set is not registered: annotation:${setId}`);
    }
    return {
      annotation_set_id: setId,
      artifact_id: artifact.artifact_id,
      sha256: artifact.sha256,
    };
  });
  const entries = patch.annotation_resolution.entries.map((entry) => ({
    ...entry,
    operation_ids: operationIds.get(annotationKey(entry.annotation_set_id, entry.annotation_id)) ?? [],
  }));
  const count = (disposition: AnnotationResolutionEntry["disposition"]) =>
    entries.filter((entry) => entry.disposition === disposition).length;
  const report = AnnotationResolutionReportSchema.parse({
    schema_version: "1",
    report_type: "annotation_resolution",
    report_id: `AR-${patch.patch_id}`,
    patch_id: patch.patch_id,
    decision_id: patch.decision_id,
    base_artifact_id: patch.base_artifact_id,
    base_sha256: patch.base_sha256,
    revised_artifact_id: input.revisedArtifactId,
    revised_sha256: input.revisedSha256,
    annotation_sets: annotationSets,
    entries,
    coverage: {
      total_count: entries.length,
      implemented_count: count("implemented"),
      answered_count: count("answered_without_text_change"),
      deferred_count: count("deferred"),
      rejected_count: count("rejected"),
      superseded_count: count("superseded"),
      unresolved_count: count("unresolved"),
    },
    generated_at: input.now,
  });
  const relativePath = `runs/current/annotation-resolution-reports/${patch.patch_id}.json`;
  const target = path.join(snapshot.workspace, relativePath);
  const text = `${JSON.stringify(report, null, 2)}\n`;
  return {
    path: target,
    relativePath,
    registryPath: serializePatchArtifactPath(snapshot, target, "Annotation Resolution Report"),
    text,
    sha256: sha256(text),
    annotationSetArtifactIds: annotationSets.map((item) => item.artifact_id),
  };
}

function validateAnnotationResolution(snapshot: WorkspaceSnapshot, patch: DraftPatchSubmitInput): void {
  const operationRefs = new Map<string, string[]>();
  for (const operation of patch.ops) {
    for (const reference of operation.annotation_refs) {
      const key = annotationKey(reference.annotation_set_id, reference.annotation_id);
      operationRefs.set(key, [...(operationRefs.get(key) ?? []), operation.operation_id]);
    }
  }
  if (!patch.annotation_resolution) {
    if (operationRefs.size) {
      throw usage("patch_annotation_resolution_missing", "Patch operations reference annotations but annotation_resolution is missing.");
    }
    return;
  }

  const entries = new Map<string, AnnotationResolutionEntry>();
  for (const entry of patch.annotation_resolution.entries) {
    entries.set(annotationKey(entry.annotation_set_id, entry.annotation_id), entry);
  }
  const setIds = new Set([
    ...patch.annotation_resolution.entries.map((entry) => entry.annotation_set_id),
    ...patch.ops.flatMap((operation) => operation.annotation_refs.map((reference) => reference.annotation_set_id)),
  ]);
  const annotations = new Map<string, ReturnType<typeof FrozenAnnotationSetSchema.parse>["annotations"][number]>();
  for (const setId of setIds) {
    const item = snapshot.annotations.find((candidate) => candidate.id === setId);
    if (!item) throw domain("patch_annotation_set_missing", `Annotation Set is missing: annotation:${setId}`);
    const set = FrozenAnnotationSetSchema.parse(item.value);
    if (set.base_artifact_id !== patch.base_artifact_id || set.base_sha256 !== patch.base_sha256) {
      throw conflict("patch_annotation_base_mismatch", `Annotation Set does not bind the patch base: annotation:${setId}`);
    }
    const recordValue = snapshot.artifacts.find((artifact) => artifact.artifact_type === "annotation_set"
      && artifact.annotation_set_id === setId);
    if (!recordValue || typeof recordValue.sha256 !== "string" || !item.path) {
      throw domain("patch_annotation_set_unregistered", `Annotation Set is not registered: annotation:${setId}`);
    }
    const text = `${JSON.stringify(set, null, 2)}\n`;
    if (sha256(text) !== recordValue.sha256) {
      throw conflict("patch_annotation_set_hash_mismatch", `Annotation Set registry hash has drifted: annotation:${setId}`);
    }
    for (const annotation of set.annotations) annotations.set(annotationKey(setId, annotation.annotation_id), annotation);
  }

  const expected = new Set(annotations.keys());
  const actual = new Set(entries.keys());
  const missing = [...expected].filter((key) => !actual.has(key));
  const dangling = [...actual].filter((key) => !expected.has(key));
  if (missing.length || dangling.length) {
    throw usage("patch_annotation_coverage_invalid", "Annotation resolution must cover every annotation in every related set exactly once.", { missing, dangling });
  }

  for (const [key, entry] of entries) {
    const linkedOperations = operationRefs.get(key) ?? [];
    if (entry.disposition === "implemented" && !linkedOperations.length) {
      throw usage("patch_annotation_operation_missing", `Implemented annotation has no operation mapping: ${key}`);
    }
    if (entry.disposition !== "implemented" && linkedOperations.length) {
      throw usage("patch_annotation_operation_invalid", `Only implemented annotations may be mapped to operations: ${key}`);
    }
    if (entry.superseded_by) {
      const successor = annotationKey(entry.superseded_by.annotation_set_id, entry.superseded_by.annotation_id);
      const successorSet = snapshot.annotations.find((candidate) => candidate.id === entry.superseded_by?.annotation_set_id);
      const successorValue = successorSet && FrozenAnnotationSetSchema.safeParse(successorSet.value);
      if (!successorValue?.success || !successorValue.data.annotations.some((annotation) => annotation.annotation_id === entry.superseded_by?.annotation_id)) {
        throw domain("patch_annotation_successor_missing", `Superseding annotation is missing: ${successor}`);
      }
    }
    const annotation = annotations.get(key);
    if (entry.disposition === "implemented" && annotation?.semantic_impact.level === "high") {
      const semanticDelta = patch.semantic_delta;
      if (semanticDelta.level !== "high") {
        throw domain("patch_annotation_high_impact_unlinked", `High-impact annotation requires a high semantic delta: ${key}`);
      }
      const missingCategories = annotation.semantic_impact.categories
        .filter((category) => !semanticDelta.categories.includes(category));
      if (missingCategories.length) {
        throw domain("patch_annotation_high_impact_uncovered", `Patch semantic delta does not cover high-impact annotation ${key}.`, { missing_categories: missingCategories });
      }
    }
  }
  for (const key of operationRefs.keys()) {
    if (!entries.has(key)) throw usage("patch_annotation_reference_dangling", `Operation references an unresolved annotation: ${key}`);
  }
}

function annotationKey(annotationSetId: string, annotationId: string): string {
  return `${annotationSetId}:${annotationId}`;
}

function patchPlanSha256(snapshot: WorkspaceSnapshot, selector: string, operation: string, semantic: unknown): string {
  const reads = [
    "runs/current/artifact-registry.json",
    "runs/current/decision-ledger.jsonl",
    "runs/current/state.yaml",
  ].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    return file ? [{ path: relativePath, sha256: file.hash }] : [];
  });
  const item = snapshot.patches.find((candidate) => candidate.selector === selector);
  if (item?.path) {
    const relative = toPosixPath(path.relative(snapshot.workspace, item.path));
    const file = snapshot.files.get(relative);
    if (file) reads.push({ path: relative, sha256: file.hash });
  }
  return sha256(`${JSON.stringify({ selector, operation, semantic, reads })}\n`);
}

function patchReadPreconditions(snapshot: WorkspaceSnapshot, artifactId: string) {
  const artifact = snapshot.artifacts.find((item) => item.artifact_id === artifactId);
  if (!artifact || typeof artifact.path !== "string" || typeof artifact.sha256 !== "string") return [];
  return [{ path: requiredRegisteredArtifactPath(snapshot, artifact.path).absolutePath, expectedHash: artifact.sha256, reason: "canonical patch base" }];
}

function requiredRegisteredArtifactPath(snapshot: WorkspaceSnapshot, artifactPath: string) {
  const resolved = resolveRegisteredArtifactPath(snapshot, artifactPath);
  if (!resolved.contained) throw domain("patch_path_escape", "Registered Artifact path escapes its runtime root.");
  return resolved;
}

function serializePatchArtifactPath(snapshot: WorkspaceSnapshot, absolutePath: string, label: string): string {
  try {
    return serializeRegisteredArtifactPath(snapshot, absolutePath);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    throw domain("patch_output_escape", `${label} escapes its runtime root.`);
  }
}

function lifecyclePatchText(item: IndexedItem, updates: Record<string, unknown>): string {
  return `${JSON.stringify({ ...record(item.value), ...updates }, null, 2)}\n`;
}

function refreshPatch(item: IndexedItem, content: string, reason: string): PlannedWrite {
  if (!item.path) throw domain("patch_path_missing", "Patch has no source path.");
  return { action: "refresh", path: item.path, content, scope: "workspace", ownership: "user", previousHash: sha256(`${JSON.stringify(item.value, null, 2)}\n`), nextHash: sha256(content), reason };
}

function caseStateOperation(snapshot: WorkspaceSnapshot, state: CaseState): PlannedWrite {
  const file = requiredFile(snapshot, "runs/current/state.yaml");
  const content = stringify(state);
  return refresh(file, content, "commit adaptive case-action authority last");
}

function refresh(file: { absolutePath: string; relativePath: string; hash: string }, content: string, reason: string): PlannedWrite {
  return { action: "refresh", path: file.absolutePath, relativePath: file.relativePath, content, scope: "workspace", ownership: "user", previousHash: file.hash, nextHash: sha256(content), reason };
}

function requiredFile(snapshot: WorkspaceSnapshot, relativePath: string) {
  const file = snapshot.files.get(relativePath);
  if (!file) throw domain("patch_workspace_invalid", `Required file is unavailable: ${relativePath}`);
  return file;
}

async function createOnly(target: string, relativePath: string, content: string, reason: string, scope: "workspace" | "project" = "workspace"): Promise<PlannedWrite> {
  const operation = await planFile({ path: target, relativePath, content, scope, ownership: "user" });
  if (operation.action !== "create") throw conflict("patch_output_conflict", `Patch transaction target already exists: ${target}`);
  return { ...operation, reason };
}

function assertArtifactIdsAvailable(snapshot: WorkspaceSnapshot, ids: string[]): void {
  const occupied = ids.filter((id) => snapshot.artifacts.some((artifact) => artifact.artifact_id === id));
  if (occupied.length) throw conflict("patch_artifact_conflict", "Patch output artifact IDs are already occupied.", { occupied });
}

async function assertRegularContained(root: string, candidate: string, label: string): Promise<void> {
  if (!isPathContained(root, candidate)) throw domain("patch_path_escape", `${label} escapes its allowed root.`);
  const info = await lstat(candidate);
  if (!info.isFile() || info.isSymbolicLink()) throw domain("patch_path_escape", `${label} must be a regular non-symlink file.`);
  const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
  if (!isPathContained(realRoot, realCandidate)) throw domain("patch_path_escape", `${label} resolves outside its allowed root.`);
}

function assertWorkspaceValid(snapshot: WorkspaceSnapshot, code: string): void {
  const blocker = snapshot.diagnostics.find((diagnostic) => diagnostic.blocking);
  if (blocker) throw domain(code, `Workspace has blocking diagnostics: ${blocker.code}`, blocker);
}

function assertExpectedPlan(expected: string | undefined, actual: string): void {
  if (expected && expected !== actual) throw conflict("patch_plan_stale", "Patch plan no longer matches the approved preview.", { expected, actual });
}

function patchIdFromSelector(selector: string): string {
  const match = /^patch:([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(selector);
  if (!match || selector.includes("..")) throw usage("invalid_patch_selector", `Invalid patch selector: ${selector}`);
  return match[1];
}

function canonicalInputEqual(value: unknown, expected: CanonicalDraftPatch): boolean {
  const parsed = CanonicalDraftPatchSchema.safeParse(value);
  if (!parsed.success) return false;
  const omitLifecycle = (patch: CanonicalDraftPatch) => {
    const {
      status,
      created_at: createdAt,
      decision_id: decisionId,
      resolved_at: resolvedAt,
      applied_artifact_id: appliedArtifactId,
      apply_report_artifact_id: applyReportArtifactId,
      annotation_resolution_report_artifact_id: annotationResolutionReportArtifactId,
      apply_receipt_artifact_id: applyReceiptArtifactId,
      stale_receipt_path: staleReceiptPath,
      ...semantic
    } = patch;
    void status;
    void createdAt;
    void decisionId;
    void resolvedAt;
    void appliedArtifactId;
    void applyReportArtifactId;
    void annotationResolutionReportArtifactId;
    void applyReceiptArtifactId;
    void staleReceiptPath;
    return semantic;
  };
  return JSON.stringify(omitLifecycle(parsed.data)) === JSON.stringify(omitLifecycle(expected));
}

async function existingReceiptHash(snapshot: WorkspaceSnapshot, relativePath: string): Promise<string> {
  try {
    return sha256(await readFile(path.join(snapshot.workspace, relativePath)));
  } catch {
    throw conflict("patch_receipt_missing", `Existing patch has no trusted submit receipt: ${relativePath}`);
  }
}

function upsertReceipt(state: CaseState, receipt: { receipt_id: string; receipt_type: string; path: string; sha256: string }) {
  return [...state.receipts.filter((item) => item.receipt_id !== receipt.receipt_id), receipt];
}

function actionIdFor(selector: string): string {
  return selector.replace(":", "-");
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function usage(code: string, message: string, details?: unknown): PatchLifecycleError {
  return new PatchLifecycleError(code, message, "usage", details);
}

function domain(code: string, message: string, details?: unknown): PatchLifecycleError {
  return new PatchLifecycleError(code, message, "domain", details);
}

function conflict(code: string, message: string, details?: unknown): PatchLifecycleError {
  return new PatchLifecycleError(code, message, "conflict", details);
}
