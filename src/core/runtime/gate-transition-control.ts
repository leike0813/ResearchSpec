import { readFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import {
  GateSubmitPayloadSchema, GateSubmitReceiptSchema, GateSubmitSemanticInputSchema, RuntimeActorSchema, Sha256Schema, TransitionAdvanceReceiptSchema,
  TransitionAdvanceReceiptV2Schema,
  type AppliedTransitionEffect, type GateSubmitReceipt, type TransitionAdvanceReceipt,
} from "../contracts/gate-transition.js";
import type { RunState } from "../contracts/run-state.js";
import { parseRuntimeSelector } from "../contracts/runtime-selector.js";
import type { WorkflowDefinition } from "../contracts/workflow.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { loadWorkspaceSnapshot } from "../workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type WritePlan } from "../workspace/write-plan.js";
import { buildGateTransitionInstructions, evaluateWorkflowControl, inspectArtifact, type WorkflowControlResult } from "./legacy-workflow-control.js";
import { boundAnnotationSetIds, verifyAnnotationCoverage } from "./annotation-coverage.js";
import { isPassingGateVerdict } from "./gate-authority.js";

export class GateTransitionError extends Error {
  constructor(public readonly code: string, message: string, public readonly kind: "usage" | "domain" | "conflict", public readonly details?: unknown) { super(message); }
}

export interface GateSubmitPlan {
  status: "would_submit" | "already_submitted";
  selector: string;
  plan_sha256: string;
  event: Record<string, unknown>;
  receipt: GateSubmitReceipt;
  writePlan: WritePlan;
}

export interface TransitionAdvancePlan {
  status: "would_advance" | "already_advanced";
  selector: string;
  plan_sha256: string;
  receipt: TransitionAdvanceReceipt;
  effects: AppliedTransitionEffect[];
  from: { stage_id: string; status: string };
  to: { stage_id: string; status: string };
  writePlan: WritePlan;
}

export async function planGateSubmit(input: { snapshot: WorkspaceSnapshot; selector: string; payload: unknown; actor: unknown; confirmedBy: string; expectedPlanSha256?: string; now?: string }): Promise<GateSubmitPlan> {
  const semantic = GateSubmitSemanticInputSchema.safeParse(input.payload);
  const actor = RuntimeActorSchema.safeParse(input.actor);
  if (!semantic.success || !actor.success || actor.data.kind !== "validator" || !input.confirmedBy.trim()) throw new GateTransitionError("invalid_gate_input", "Gate semantic input, validator actor or human confirmer is invalid.", "usage", semantic.success ? actor.success ? undefined : actor.error.issues : semantic.error.issues);
  const { snapshot } = input;
  assertInstanceControl(snapshot);
  const parsed = parseRuntimeSelector(input.selector);
  if (parsed?.kind !== "gate" || !parsed.instanceId) throw new GateTransitionError("invalid_gate_selector", "Gate submit requires gate:<instance>/<node>.", "usage");
  const instanceId = parsed.instanceId;

  if (input.expectedPlanSha256) {
    const existing = await existingGatePlan(snapshot, input.selector, input.expectedPlanSha256);
    if (existing) return existing;
  }
  const instructions = await buildGateTransitionInstructions(snapshot, input.selector);
  if (!instructions.ok) throw new GateTransitionError(instructions.code, "Gate instructions are unavailable.", "domain", instructions.item);
  const packet = instructions.packet;
  if (packet.kind !== "gate") throw new GateTransitionError("gate_submit_conflict", "Gate instruction basis changed.", "conflict");
  const payload = {
    data: GateSubmitPayloadSchema.parse({
      ...semantic.data,
      schema_version: "1",
      instruction_basis_sha256: packet.instruction_basis_sha256,
    }),
  };
  const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === packet.template_id);
  const gate = template?.gates.find((item) => item.id === parsed.id);
  if (!gate) throw new GateTransitionError("gate_not_found", `Gate is not declared: ${input.selector}`, "domain");
  await validateGateEvidence(snapshot, gate.validator.evidence, payload.data.evidence);
  if ((gate.gate_type === "revision_completeness" || parsed.id === "revision_completeness")
    && isPassingGateVerdict(payload.data.verdict)) {
    const requiredAnnotationSetIds = await boundAnnotationSetIds(snapshot, parsed.instanceId);
    const coverage = await verifyAnnotationCoverage(snapshot, {
      evidenceArtifactIds: payload.data.evidence
        .filter((item) => item.kind === "artifact")
        .map((item) => item.artifact_id),
      requiredAnnotationSetIds,
    });
    if (!coverage.complete) {
      const finding = coverage.findings[0];
      throw new GateTransitionError(
        finding?.code ?? "annotation_coverage_incomplete",
        finding?.message ?? "Annotation coverage is incomplete.",
        "domain",
        coverage,
      );
    }
  }
  const latest = [...snapshot.gates].reverse().find((event) => event.gate_id === `${instanceId}/${parsed.id}`);
  if (payload.data.supersedes_event_id && latest?.event_id !== payload.data.supersedes_event_id) throw new GateTransitionError("gate_submit_conflict", "Reverification does not supersede the latest Gate event.", "conflict");

  const identity = { selector: input.selector, payload: payload.data, actor: actor.data, confirmed_by: { kind: "human", name: input.confirmedBy.trim() }, gate: { stage_id: gate.stage_id, gate_type: gate.gate_type, validator_id: gate.validator.id, blocking: gate.blocking } };
  const planSha256 = sha256(`${JSON.stringify(identity)}\n`);
  if (input.expectedPlanSha256 && input.expectedPlanSha256 !== planSha256) throw new GateTransitionError("gate_submit_conflict", "Gate plan differs from the confirmed preview.", "conflict", { expected: input.expectedPlanSha256, actual: planSha256 });
  const eventId = `E-${planSha256.slice(0, 24)}`;
  const gateId = `${instanceId}/${parsed.id}`;
  const relativeReceiptPath = `runs/current/receipts/gate-submit/${instanceId}/${parsed.id}/${eventId}.json`;
  const receiptPath = path.join(snapshot.workspace, relativeReceiptPath);
  const submittedAt = input.now ?? new Date().toISOString();
  let receipt = GateSubmitReceiptSchema.parse({
    schema_version: "1", receipt_type: "gate_submit", plan_sha256: planSha256, instruction_basis_sha256: payload.data.instruction_basis_sha256,
    selector: input.selector, gate_id: gateId, gate_node_id: parsed.id, subflow_instance_id: instanceId, template_id: String(packet.template_id),
    event_id: eventId, stage_id: gate.stage_id, gate_type: gate.gate_type, validator_id: gate.validator.id, verdict: payload.data.verdict,
    blocking: gate.blocking, verification_kind: payload.data.verification_kind, evidence: payload.data.evidence, findings: payload.data.findings,
    actor: actor.data, confirmed_by: { kind: "human", name: input.confirmedBy.trim() }, challenged_basis_sha256: payload.data.challenged_basis_sha256,
    supersedes_event_id: payload.data.supersedes_event_id, submitted_at: submittedAt,
  });
  const existingReceiptBytes = await readOptionalBytes(receiptPath);
  if (existingReceiptBytes) {
    const parsedReceipt = GateSubmitReceiptSchema.safeParse(JSON.parse(Buffer.from(existingReceiptBytes).toString("utf8")) as unknown);
    if (!parsedReceipt.success || parsedReceipt.data.plan_sha256 !== planSha256) throw new GateTransitionError("gate_submit_conflict", `Gate receipt conflicts: ${receiptPath}`, "conflict");
    receipt = parsedReceipt.data;
  }
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptHash = sha256(receiptText);
  const event = {
    schema_version: "1", event_id: eventId, gate_id: gateId, gate_node_id: parsed.id, subflow_instance_id: instanceId,
    template_id: String(packet.template_id), timestamp: receipt.submitted_at, actor: actor.data, stage_id: gate.stage_id, gate_type: gate.gate_type,
    validator_id: gate.validator.id, verdict: payload.data.verdict, blocking: gate.blocking, verification_kind: payload.data.verification_kind,
    evidence: payload.data.evidence, findings: payload.data.findings, confirmed_by: receipt.confirmed_by,
    receipt: { path: relativeReceiptPath, sha256: receiptHash, plan_sha256: planSha256 },
    ...(payload.data.challenged_basis_sha256 ? { challenged_basis_sha256: payload.data.challenged_basis_sha256 } : {}),
    ...(payload.data.supersedes_event_id ? { supersedes_event_id: payload.data.supersedes_event_id } : {}),
  };
  const duplicate = snapshot.gates.find((item) => item.event_id === eventId);
  if (duplicate) {
    if (JSON.stringify(duplicate) !== JSON.stringify(event) || !existingReceiptBytes || sha256(existingReceiptBytes) !== receiptHash) throw new GateTransitionError("gate_submit_conflict", "Existing Gate event or receipt is inconsistent.", "conflict");
    return { status: "already_submitted", selector: input.selector, plan_sha256: planSha256, event, receipt, writePlan: { operations: [] } };
  }
  const ledgerFile = snapshot.files.get("runs/current/gate-ledger.jsonl");
  if (!ledgerFile) throw new GateTransitionError("workflow_invalid", "Gate ledger is unavailable.", "domain");
  const receiptOperation = await planFile({ path: receiptPath, relativePath: relativeReceiptPath, content: receiptText, scope: "workspace", ownership: "user" });
  if (receiptOperation.action === "conflict") throw new GateTransitionError("gate_submit_conflict", `Gate receipt conflicts: ${receiptPath}`, "conflict");
  const ledgerText = `${ledgerFile.text}${JSON.stringify(event)}\n`;
  const ledgerOperation = { action: "refresh" as const, path: ledgerFile.absolutePath, relativePath: "runs/current/gate-ledger.jsonl", content: ledgerText, scope: "workspace" as const, ownership: "user" as const, previousHash: ledgerFile.hash, nextHash: sha256(ledgerText), reason: "append confirmed Gate event last" };
  return { status: "would_submit", selector: input.selector, plan_sha256: planSha256, event, receipt, writePlan: { operations: [receiptOperation, ledgerOperation], readPreconditions: runtimePreconditions(snapshot, ["specs/workflow.yaml", "runs/current/state.yaml", "runs/current/artifact-registry.json", "runs/current/decision-ledger.jsonl"]) } };
}

export async function executeGateSubmit(plan: GateSubmitPlan, workspace: string): Promise<{ status: "submitted" | "already_submitted"; plan: GateSubmitPlan; workflow_control_after: WorkflowControlResult }> {
  if (plan.status === "already_submitted") return { status: "already_submitted", plan, workflow_control_after: await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace)) };
  await executeWritePlan(plan.writePlan);
  return { status: "submitted", plan, workflow_control_after: await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace)) };
}

export async function planTransitionAdvance(input: { snapshot: WorkspaceSnapshot; selector: string; actor: unknown; expectedPlanSha256?: string; now?: string }): Promise<TransitionAdvancePlan> {
  const actor = RuntimeActorSchema.safeParse(input.actor);
  if (!actor.success || !["agent", "script"].includes(actor.data.kind)) throw new GateTransitionError("invalid_advance_input", "Advance actor must be an agent or script.", "usage", actor.success ? undefined : actor.error.issues);
  const { snapshot } = input;
  assertInstanceControl(snapshot);
  const parsed = parseRuntimeSelector(input.selector);
  if (parsed?.kind !== "transition") throw new GateTransitionError("invalid_transition_selector", "Advance requires transition:<instance>/<node>.", "usage");
  if (input.expectedPlanSha256) {
    const existing = await existingTransitionPlan(snapshot, input.selector, input.expectedPlanSha256);
    if (existing) return existing;
  }
  const control = await evaluateWorkflowControl(snapshot);
  const status = control.transitions.find((item) => item.selector === input.selector);
  if (!status) throw new GateTransitionError("transition_not_found", `Transition not found: ${input.selector}`, "domain");
  if (status.state === "decision_required") throw new GateTransitionError("transition_decision_required", "Multiple or semantic transition candidates require an accepted branch Decision.", "domain", { candidates: control.transitions.filter((item) => item.subflow_instance_id === status.subflow_instance_id && item.state === "decision_required").map((item) => item.selector) });
  if (status.state !== "ready") throw new GateTransitionError("transition_blocked", `Transition is not ready: ${input.selector}`, "domain", status);
  const readyForInstance = control.transitions.filter((item) => item.subflow_instance_id === status.subflow_instance_id && item.state === "ready");
  if (readyForInstance.length !== 1 || readyForInstance[0]?.selector !== input.selector) throw new GateTransitionError("transition_decision_required", "Advance requires exactly one eligible transition.", "domain", { candidates: readyForInstance.map((item) => item.selector) });
  const instructions = await buildGateTransitionInstructions(snapshot, input.selector);
  if (!instructions.ok) throw new GateTransitionError(instructions.code, "Transition instructions are unavailable.", "domain", instructions.item);
  const instructionBasis = String(instructions.packet.instruction_basis_sha256);
  const effects: AppliedTransitionEffect[] = status.effects.map((effect) =>
    effect.kind === "complete_subflow"
      ? { kind: "complete_subflow", subflow_instance_id: parsed.instanceId }
      : effect
  );
  const identity = { selector: input.selector, actor: actor.data, instruction_basis_sha256: instructionBasis, from_stage_id: status.from_stage_id, effects, gate_event_ids: status.gate_event_ids, decision_ids: status.decision_ids };
  const planSha256 = sha256(`${JSON.stringify(identity)}\n`);
  if (input.expectedPlanSha256 && input.expectedPlanSha256 !== planSha256) throw new GateTransitionError("transition_advance_conflict", "Transition plan differs from the preview.", "conflict", { expected: input.expectedPlanSha256, actual: planSha256 });
  const instance = snapshot.runState.subflows.find((item) => item.instance_id === parsed.instanceId);
  if (!instance || instance.active_stage_id !== status.from_stage_id || instance.status !== "active") throw new GateTransitionError("transition_advance_conflict", "Transition source state changed.", "conflict");
  const relativeReceiptPath = `runs/current/receipts/transition-advance/${parsed.instanceId}/${parsed.id}.json`;
  const receiptPath = path.join(snapshot.workspace, relativeReceiptPath);
  let receipt: TransitionAdvanceReceipt = TransitionAdvanceReceiptV2Schema.parse({ schema_version: "2", receipt_type: "transition_advance", plan_sha256: planSha256, instruction_basis_sha256: instructionBasis, selector: input.selector, transition_id: `${parsed.instanceId}/${parsed.id}`, transition_node_id: parsed.id, subflow_instance_id: parsed.instanceId, template_id: status.template_id, from_stage_id: status.from_stage_id, effects, gate_event_ids: status.gate_event_ids, decision_ids: status.decision_ids, actor: actor.data, advanced_at: input.now ?? new Date().toISOString() });
  const existingBytes = await readOptionalBytes(receiptPath);
  if (existingBytes) {
    const existing = TransitionAdvanceReceiptSchema.safeParse(JSON.parse(Buffer.from(existingBytes).toString("utf8")) as unknown);
    if (!existing.success || existing.data.schema_version !== "2" || existing.data.plan_sha256 !== planSha256) throw new GateTransitionError("transition_advance_conflict", `Transition receipt conflicts: ${receiptPath}`, "conflict");
    receipt = existing.data;
  }
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptHash = sha256(receiptText);
  const activateStage = effects.find((effect) => effect.kind === "activate_stage");
  const completesSubflow = effects.some((effect) => effect.kind === "complete_subflow");
  const completesRun = effects.some((effect) => effect.kind === "complete_run");
  const nextInstance = { ...instance, status: completesSubflow ? "complete" as const : "active" as const, active_stage_id: activateStage?.kind === "activate_stage" ? activateStage.stage_id : instance.active_stage_id, transition_receipts: [...instance.transition_receipts, { transition_id: status.transition_id, path: relativeReceiptPath, sha256: receiptHash, plan_sha256: planSha256 }] };
  const nextInstances = snapshot.runState.subflows.map((item) => item.instance_id === instance.instance_id ? nextInstance : item);
  const nextRunStatus = completesRun ? "complete" as const : snapshot.runState.status;
  const nextState: RunState = { ...snapshot.runState, status: nextRunStatus, updated_at: receipt.advanced_at, subflows: nextInstances };
  const stateFile = snapshot.files.get("runs/current/state.yaml");
  if (!stateFile) throw new GateTransitionError("workflow_invalid", "Run state is unavailable.", "domain");
  const stateText = stringify(nextState);
  const receiptOperation = await planFile({ path: receiptPath, relativePath: relativeReceiptPath, content: receiptText, scope: "workspace", ownership: "user" });
  if (receiptOperation.action === "conflict") throw new GateTransitionError("transition_advance_conflict", `Transition receipt conflicts: ${receiptPath}`, "conflict");
  const stateOperation = { action: "refresh" as const, path: stateFile.absolutePath, relativePath: "runs/current/state.yaml", content: stateText, scope: "workspace" as const, ownership: "user" as const, previousHash: stateFile.hash, nextHash: sha256(stateText), reason: "commit transition state last" };
  return { status: "would_advance", selector: input.selector, plan_sha256: planSha256, receipt, effects, from: { stage_id: instance.active_stage_id, status: instance.status }, to: { stage_id: nextInstance.active_stage_id, status: nextInstance.status }, writePlan: { operations: [receiptOperation, stateOperation], readPreconditions: runtimePreconditions(snapshot, ["specs/workflow.yaml", "runs/current/artifact-registry.json", "runs/current/gate-ledger.jsonl", "runs/current/decision-ledger.jsonl"]) } };
}

export async function executeTransitionAdvance(plan: TransitionAdvancePlan, workspace: string): Promise<{ status: "advanced" | "already_advanced"; plan: TransitionAdvancePlan; workflow_control_after: WorkflowControlResult }> {
  if (plan.status === "already_advanced") return { status: "already_advanced", plan, workflow_control_after: await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace)) };
  await executeWritePlan(plan.writePlan);
  return { status: "advanced", plan, workflow_control_after: await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace)) };
}

function assertInstanceControl(snapshot: WorkspaceSnapshot): asserts snapshot is WorkspaceSnapshot & { workflow: WorkflowDefinition; runState: RunState } {
  if (!snapshot.workflow || !snapshot.runState) throw new GateTransitionError("workflow_unconfigured", "Workflow has no instance Gate/transition graph.", "domain");
  if (snapshot.diagnostics.some((item) => item.blocking)) throw new GateTransitionError("workflow_invalid", "Workspace has blocking diagnostics.", "domain", snapshot.diagnostics.filter((item) => item.blocking));
}

async function validateGateEvidence(snapshot: WorkspaceSnapshot, required: { artifact_types: string[]; contracts: string[] }, evidence: Array<Record<string, unknown>>): Promise<void> {
  for (const ref of evidence) {
    if (ref.kind === "contract") {
      const file = snapshot.files.get(String(ref.path));
      if (!file || file.hash !== ref.sha256) throw new GateTransitionError("gate_evidence_untrusted", `Contract evidence is missing or drifted: ${String(ref.path)}`, "domain");
    } else {
      const artifact = snapshot.artifacts.find((item) => item.artifact_id === ref.artifact_id && item.sha256 === ref.sha256);
      if (!artifact || !(await inspectArtifact(snapshot, artifact)).hash_matches) throw new GateTransitionError("gate_evidence_untrusted", `Artifact evidence is missing or drifted: ${String(ref.artifact_id)}`, "domain");
    }
  }
  for (const contractPath of required.contracts) if (!evidence.some((ref) => ref.kind === "contract" && ref.path === contractPath)) throw new GateTransitionError("gate_evidence_missing", `Required contract evidence is missing: ${contractPath}`, "domain");
  for (const artifactType of required.artifact_types) if (!evidence.some((ref) => ref.kind === "artifact" && snapshot.artifacts.some((artifact) => artifact.artifact_id === ref.artifact_id && artifact.artifact_type === artifactType))) throw new GateTransitionError("gate_evidence_missing", `Required artifact evidence is missing: ${artifactType}`, "domain");
}

async function existingGatePlan(snapshot: WorkspaceSnapshot, selector: string, planSha256: string): Promise<GateSubmitPlan | undefined> {
  const event = snapshot.gates.find((item) => item.receipt && typeof item.receipt === "object" && (item.receipt as Record<string, unknown>).plan_sha256 === planSha256);
  if (!event) return undefined;
  const ref = event.receipt as Record<string, unknown>;
  try {
    const bytes = await readFile(path.resolve(snapshot.workspace, String(ref.path)));
    const receipt = GateSubmitReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== ref.sha256 || receipt.plan_sha256 !== planSha256 || receipt.selector !== selector) throw new Error("receipt mismatch");
    return { status: "already_submitted", selector, plan_sha256: planSha256, event, receipt, writePlan: { operations: [] } };
  } catch (error) { throw new GateTransitionError("gate_submit_conflict", `Existing Gate receipt is untrusted: ${error instanceof Error ? error.message : String(error)}`, "conflict"); }
}

async function existingTransitionPlan(snapshot: WorkspaceSnapshot, selector: string, planSha256: string): Promise<TransitionAdvancePlan | undefined> {
  if (!snapshot.runState) return undefined;
  const ref = snapshot.runState.subflows.flatMap((instance) => instance.transition_receipts).find((item) => item.plan_sha256 === planSha256);
  if (!ref) return undefined;
  try {
    const bytes = await readFile(path.resolve(snapshot.workspace, ref.path));
    const receipt = TransitionAdvanceReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== ref.sha256 || receipt.plan_sha256 !== planSha256 || receipt.selector !== selector) throw new Error("receipt mismatch");
    const effects = appliedReceiptEffects(receipt);
    const status = effects.some((effect) => effect.kind === "complete_subflow") ? "complete" : "active";
    const activateStage = effects.find((effect) => effect.kind === "activate_stage");
    const targetStage = activateStage?.kind === "activate_stage" ? activateStage.stage_id : receipt.from_stage_id;
    return { status: "already_advanced", selector, plan_sha256: planSha256, receipt, effects, from: { stage_id: receipt.from_stage_id, status: "active" }, to: { stage_id: targetStage, status }, writePlan: { operations: [] } };
  } catch (error) { throw new GateTransitionError("transition_advance_conflict", `Existing transition receipt is untrusted: ${error instanceof Error ? error.message : String(error)}`, "conflict"); }
}

function appliedReceiptEffects(receipt: TransitionAdvanceReceipt): AppliedTransitionEffect[] {
  if (receipt.schema_version === "2") return receipt.effects;
  return receipt.effect.kind === "complete_subflow"
    ? [{ kind: "complete_subflow", subflow_instance_id: receipt.subflow_instance_id }]
    : [receipt.effect];
}

function runtimePreconditions(snapshot: WorkspaceSnapshot, paths: string[]) {
  return paths.map((relativePath) => {
    const file = snapshot.files.get(relativePath);
    if (!file) throw new GateTransitionError("workflow_invalid", `Runtime basis is missing: ${relativePath}`, "domain");
    return { path: file.absolutePath, expectedHash: file.hash, reason: `runtime basis ${relativePath}` };
  });
}

async function readOptionalBytes(filePath: string): Promise<Uint8Array | undefined> {
  try { return await readFile(filePath); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
}

export function isSha256(value: string | undefined): boolean { return value === undefined || Sha256Schema.safeParse(value).success; }
