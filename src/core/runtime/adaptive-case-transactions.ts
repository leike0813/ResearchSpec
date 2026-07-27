import { readFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import {
  AdaptiveCaseReceiptSchema,
  AdaptiveObligationSubmitInputSchema,
  type AdaptiveObligationSubmitInput,
} from "../contracts/adaptive-runtime.js";
import {
  AdaptiveAcceptedArtifactRecordSchema,
  ArtifactRegistrySchema,
  SubmitActorSchema,
  type SubmitActor,
} from "../contracts/artifact.js";
import { DecisionInputSchema, type DecisionInput } from "../contracts/case-control.js";
import {
  AttemptRecordSchema,
  CaseStateSchema,
  type AttemptRecord,
  type CaseState,
  type HardObligation,
} from "../contracts/case-state.js";
import {
  GateSubmitPayloadSchema,
  GateSubmitSemanticInputSchema,
  GateSubmitReceiptSchema,
  RuntimeActorSchema,
} from "../contracts/gate-transition.js";
import { SubflowStartInputSchema, SubflowStartSemanticInputSchema } from "../contracts/subflow.js";
import type { CompactTransactionEffect } from "../contracts/runtime-protocol.js";
import type { WorkspaceSnapshot, SnapshotFile } from "../workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite, type ReadPrecondition, type WritePlan } from "../workspace/write-plan.js";
import { evaluateActionAvailability } from "./action-availability.js";

export class AdaptiveCaseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly kind: "usage" | "domain" | "conflict",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AdaptiveCaseError";
  }
}

export interface AdaptiveTransactionPlan {
  status: "would_apply" | "already_applied";
  selector: string;
  plan_sha256: string;
  identity_selector: string;
  identity_sha256?: string;
  effects: CompactTransactionEffect[];
  next_selectors: string[];
  writePlan: WritePlan;
}

export async function planAdaptiveStart(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  payload: unknown;
  actor: unknown;
  confirmedBy?: string;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<AdaptiveTransactionPlan> {
  const { profile, state } = adaptive(input.snapshot);
  const semantic = SubflowStartSemanticInputSchema.safeParse(input.payload);
  const actor = SubmitActorSchema.safeParse(input.actor);
  const route = profile.routes.find((item) => `subflow:${item.template_id}` === input.selector);
  if (!semantic.success || !actor.success || !["human", "agent", "script"].includes(actor.data.kind) || !route || !input.confirmedBy?.trim()) {
    throw new AdaptiveCaseError("invalid_start_input", "Adaptive Start input, actor, confirmer or route is invalid.", "usage", semantic.success ? actor.success ? undefined : actor.error.issues : semantic.error.issues);
  }
  if (semantic.data.material_passport_import) throw new AdaptiveCaseError("adaptive_import_not_supported", "Material Passport import remains a strict compatibility transaction until migration convergence.", "domain");
  const availability = await requireAllowed(input.snapshot, input.selector);
  const payload = {
    data: SubflowStartInputSchema.parse({
      ...semantic.data,
      schema_version: "1",
      instruction_basis_sha256: availability.availability.basis_sha256,
      acknowledged_user_input_ids: [],
      prerequisite_artifact_ids: [],
      prerequisite_decision_ids: [],
      parent_subflow_selector: null,
    }),
  };
  const planSha256 = bindPlan(input.snapshot, input.selector, { payload: payload.data, actor: actor.data, confirmed_by: input.confirmedBy.trim() });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);
  const instanceId = `sf-${route.template_id.slice(4)}-${planSha256.slice(0, 12)}`;
  const existing = state.obligations.some((item) => item.scope.subflow_instance_id === instanceId);
  const receiptId = `R-start-${planSha256.slice(0, 20)}`;
  const receiptPath = `runs/current/receipts/adaptive-start/${instanceId}.json`;
  if (existing) return already(input.selector, planSha256, `subflow:${instanceId}`, [{ kind: "no_change", refs: [`subflow:${instanceId}`] }]);

  const definitions = route.obligation_ids.map((id) => profile.obligations.find((item) => item.obligation_id === id));
  if (definitions.some((item) => !item)) throw new AdaptiveCaseError("adaptive_profile_invalid", "Route references an unavailable obligation definition.", "domain");
  const runtimeIds = new Map(definitions.map((item) => [item?.obligation_id ?? "", `${item?.obligation_id ?? "missing"}-${planSha256.slice(0, 8)}`]));
  const obligations: HardObligation[] = definitions.map((definition) => {
    if (!definition) throw new AdaptiveCaseError("adaptive_profile_invalid", "Obligation definition is unavailable.", "domain");
    return {
      obligation_id: requiredMap(runtimeIds, definition.obligation_id),
      definition_id: definition.obligation_id,
      title: definition.title,
      scope: { run_id: state.run_id, subflow_instance_id: instanceId },
      owner: "researchspec-cli",
      status: "unsatisfied",
      status_reason: null,
      policy_justification: definition.policy_justification,
      dependencies: definition.dependencies.map((dependency) => ({
        obligation_id: requiredMap(runtimeIds, dependency.obligation_id),
        justification: dependency.justification,
      })),
      accepted_evidence_ids: [],
      formal_gate_refs: [],
      formal_decision_refs: [],
    };
  });
  const now = input.now ?? new Date().toISOString();
  const receipt = AdaptiveCaseReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "adaptive_start",
    receipt_id: receiptId,
    selector: input.selector,
    plan_sha256: planSha256,
    actor: actor.data,
    effects: [{ kind: "subflow_started", refs: [`subflow:${instanceId}`, `route:${route.route_ref}`] }],
    committed_at: now,
  });
  const receiptOperation = await receiptWrite(input.snapshot, receiptPath, receipt);
  const receiptHash = requiredNextHash(receiptOperation);
  const nextState = CaseStateSchema.parse({
    ...state,
    lifecycle: "open",
    obligations: [...state.obligations, ...obligations],
    receipts: [...state.receipts, { receipt_id: receiptId, receipt_type: receipt.receipt_type, path: receiptPath, sha256: receiptHash }],
    updated_at: now,
  });
  return planned(input.snapshot, input.selector, planSha256, `subflow:${instanceId}`, receiptHash, [{ kind: "subflow_started", refs: [`subflow:${instanceId}`] }], obligations.map((item) => `instructions:obligation:${instanceId}/${item.obligation_id}`), [receiptOperation, stateWrite(input.snapshot, nextState)]);
}

export async function planAdaptiveObligationSubmit(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  payload: unknown;
  actor: unknown;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<AdaptiveTransactionPlan> {
  const { profile, state } = adaptive(input.snapshot);
  const payload = AdaptiveObligationSubmitInputSchema.safeParse(input.payload);
  const actor = SubmitActorSchema.safeParse(input.actor);
  if (!payload.success || !actor.success) throw new AdaptiveCaseError("invalid_obligation_input", "Obligation submission does not match its action schema.", "usage", payload.success ? actor.success ? undefined : actor.error.issues : payload.error.issues);
  await requireAllowed(input.snapshot, input.selector);
  const obligation = obligationForSelector(state, input.selector);
  const definition = profile.obligations.find((item) => item.obligation_id === (obligation.definition_id ?? obligation.obligation_id));
  if (!definition) throw new AdaptiveCaseError("adaptive_profile_invalid", "Obligation definition is unavailable.", "domain");
  const planSha256 = bindPlan(input.snapshot, input.selector, { payload: payload.data, actor: actor.data });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);
  const now = input.now ?? new Date().toISOString();
  const attemptId = `AT-${planSha256.slice(0, 22)}`;
  if (input.snapshot.attempts.some((item) => item.attempt_id === attemptId)) {
    return already(input.selector, planSha256, `attempt:${attemptId}`, [{ kind: "no_change", refs: [`attempt:${attemptId}`] }]);
  }

  if (payload.data.operation === "request_resolution") {
    return planResolutionRequest(input.snapshot, input.selector, obligation, definition.resolution_policy[payload.data.resolution], payload.data, actor.data, planSha256, now);
  }

  const outputRefs = payload.data.operation === "accept_evidence"
    ? payload.data.evidence.map((item) => item.artifact_id)
    : payload.data.operation === "record_attempt" ? payload.data.output_refs : [];
  const disposition: AttemptRecord["disposition"] = payload.data.operation === "accept_evidence"
    ? "accepted"
    : payload.data.operation === "pause" ? "failed" : payload.data.disposition;
  const attempt = AttemptRecordSchema.parse({
    attempt_id: attemptId,
    obligation_id: obligation.obligation_id,
    subflow_instance_id: obligation.scope.subflow_instance_id,
    producer: { kind: actor.data.kind === "converter" || actor.data.kind === "validator" ? "script" : actor.data.kind, name: actor.data.name },
    method: payload.data.method,
    input_refs: payload.data.input_refs,
    output_refs: outputRefs,
    diagnostic_codes: payload.data.diagnostic_codes,
    disposition,
    retry_of_attempt_id: payload.data.retry_of_attempt_id,
    replaces_attempt_id: payload.data.replaces_attempt_id,
    recorded_at: now,
  });
  assertAttemptReferences(input.snapshot, obligation, payload.data);
  const attemptOperation = attemptWrite(input.snapshot, attempt);

  if (payload.data.operation === "record_attempt" && !(obligation.status === "blocked" && payload.data.retry_of_attempt_id)) {
    return planned(input.snapshot, input.selector, planSha256, `attempt:${attemptId}`, undefined, [{ kind: "attempt_recorded", refs: [`attempt:${attemptId}`] }], [`instructions:${input.selector}`], [attemptOperation]);
  }

  const receiptType = payload.data.operation === "pause" ? "obligation_pause" : "obligation_commit";
  const receiptId = `R-obligation-${planSha256.slice(0, 20)}`;
  const receiptPath = `runs/current/receipts/${receiptType.replaceAll("_", "-")}/${attemptId}.json`;
  const receipt = AdaptiveCaseReceiptSchema.parse({
    schema_version: "1",
    receipt_type: receiptType,
    receipt_id: receiptId,
    selector: input.selector,
    plan_sha256: planSha256,
    actor: actor.data,
    effects: [{ kind: payload.data.operation === "accept_evidence" ? "evidence_accepted" : payload.data.operation === "pause" ? "obligation_paused" : "obligation_retried", refs: [obligation.obligation_id, `attempt:${attemptId}`] }],
    committed_at: now,
  });
  const receiptOperation = await receiptWrite(input.snapshot, receiptPath, receipt);
  const receiptHash = requiredNextHash(receiptOperation);
  const operations: PlannedWrite[] = [];
  let acceptedEvidence = state.accepted_evidence;
  let acceptedIds = obligation.accepted_evidence_ids;
  let nextStatus: HardObligation["status"] = obligation.status === "blocked" ? "unsatisfied" : obligation.status;
  let statusReason: string | null = null;

  if (payload.data.operation === "accept_evidence") {
    const accepted = await validateAcceptedEvidence(input.snapshot, obligation, definition.outputs, payload.data, actor.data, receiptPath, receiptHash, now);
    const registryFile = requiredFile(input.snapshot, "runs/current/artifact-registry.json");
    const registry = ArtifactRegistrySchema.parse(input.snapshot.documents["runs/current/artifact-registry.json"]);
    const records = accepted.map((item) => item.artifact);
    if (records.some((item) => registry.artifacts.some((existing) => existing.artifact_id === item.artifact_id))) throw new AdaptiveCaseError("artifact_id_conflict", "Accepted evidence artifact ID already exists.", "conflict");
    const registryText = `${JSON.stringify({ ...registry, artifacts: [...registry.artifacts, ...records] }, null, 2)}\n`;
    operations.push(refresh(registryFile, registryText, "register adaptive accepted evidence"));
    acceptedEvidence = [...acceptedEvidence, ...accepted.map((item) => item.evidence)];
    acceptedIds = [...acceptedIds, ...accepted.map((item) => item.evidence.evidence_id)];
    nextStatus = "satisfied";
  } else if (payload.data.operation === "pause") {
    nextStatus = "blocked";
    statusReason = payload.data.reason;
  }

  const nextObligation = { ...obligation, status: nextStatus, status_reason: statusReason, accepted_evidence_ids: acceptedIds };
  const nextState = CaseStateSchema.parse({
    ...state,
    lifecycle: recomputeLifecycle(state, obligation.obligation_id, nextObligation),
    obligations: state.obligations.map((item) => item.obligation_id === obligation.obligation_id ? nextObligation : item),
    accepted_evidence: acceptedEvidence,
    receipts: [...state.receipts, { receipt_id: receiptId, receipt_type: receipt.receipt_type, path: receiptPath, sha256: receiptHash }],
    updated_at: now,
  });
  operations.push(receiptOperation, attemptOperation, stateWrite(input.snapshot, nextState));
  const effects: CompactTransactionEffect[] = [
    { kind: "attempt_recorded", refs: [`attempt:${attemptId}`] },
    payload.data.operation === "accept_evidence"
      ? { kind: "evidence_accepted", refs: acceptedIds.map((id) => `evidence:${id}`) }
      : payload.data.operation === "pause"
        ? { kind: "obligation_paused", refs: [obligation.obligation_id] }
        : { kind: "attempt_recorded", refs: [obligation.obligation_id] },
  ];
  return planned(input.snapshot, input.selector, planSha256, `attempt:${attemptId}`, receiptHash, effects, [`instructions:${input.selector}`], operations);
}

export async function planAdaptiveCompletion(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  actor: unknown;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<AdaptiveTransactionPlan> {
  const { profile, state } = adaptive(input.snapshot);
  const actor = SubmitActorSchema.safeParse(input.actor);
  if (!actor.success || !["agent", "script"].includes(actor.data.kind)) throw new AdaptiveCaseError("invalid_advance_input", "Adaptive completion requires an agent or script actor.", "usage");
  await requireAllowed(input.snapshot, input.selector);
  const [instanceId = "", criterionId = ""] = input.selector.slice("completion:".length).split("/", 2);
  const criterion = profile.completion_criteria.find((item) => item.criterion_id === criterionId);
  if (!criterion) throw new AdaptiveCaseError("completion_not_found", "Completion criterion is unavailable.", "domain");
  const planSha256 = bindPlan(input.snapshot, input.selector, { actor: actor.data, effects: criterion.effects });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);
  const receiptId = `R-completion-${planSha256.slice(0, 20)}`;
  if (state.receipts.some((item) => item.receipt_id === receiptId)) return already(input.selector, planSha256, input.selector, [{ kind: "no_change", refs: [input.selector] }]);
  const effects = criterion.effects.map((effect) => effect.kind === "complete_subflow" ? { kind: "complete_subflow" as const, subflow_instance_id: instanceId } : { kind: "complete_run" as const });
  const now = input.now ?? new Date().toISOString();
  const receiptPath = `runs/current/receipts/adaptive-completion/${instanceId}/${criterionId}.json`;
  const receipt = AdaptiveCaseReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "adaptive_completion",
    receipt_id: receiptId,
    selector: input.selector,
    plan_sha256: planSha256,
    actor: actor.data,
    effects: effects.map((effect) => ({ kind: effect.kind, refs: effect.kind === "complete_subflow" ? [`subflow:${instanceId}`] : [`run:${state.run_id}`] })),
    committed_at: now,
  });
  const receiptOperation = await receiptWrite(input.snapshot, receiptPath, receipt);
  const receiptHash = requiredNextHash(receiptOperation);
  const nextState = CaseStateSchema.parse({
    ...state,
    lifecycle: effects.some((effect) => effect.kind === "complete_run") ? "complete" : "open",
    completion_effects: [...state.completion_effects, ...effects],
    receipts: [...state.receipts, { receipt_id: receiptId, receipt_type: receipt.receipt_type, path: receiptPath, sha256: receiptHash }],
    updated_at: now,
  });
  const compactEffects: CompactTransactionEffect[] = effects.map((effect) => effect.kind === "complete_subflow"
    ? { kind: "subflow_completed", refs: [`subflow:${instanceId}`] }
    : { kind: "run_completed", refs: [`run:${state.run_id}`] });
  return planned(input.snapshot, input.selector, planSha256, input.selector, receiptHash, compactEffects, [`show:subflow:${instanceId}`], [receiptOperation, stateWrite(input.snapshot, nextState)]);
}

export async function planAdaptiveGate(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  payload: unknown;
  actor: unknown;
  confirmedBy?: string;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<AdaptiveTransactionPlan> {
  const { state } = adaptive(input.snapshot);
  const semantic = GateSubmitSemanticInputSchema.safeParse(input.payload);
  const actor = RuntimeActorSchema.safeParse(input.actor);
  if (!semantic.success || !actor.success || actor.data.kind !== "validator" || !input.confirmedBy?.trim()) throw new AdaptiveCaseError("invalid_gate_input", "Adaptive Gate input requires a validator and human confirmer.", "usage", semantic.success ? actor.success ? undefined : actor.error.issues : semantic.error.issues);
  const availability = await requireAllowed(input.snapshot, input.selector);
  const descriptor = await evaluateActionAvailability(input.snapshot, input.selector);
  if (!descriptor || descriptor.availability.basis_sha256 !== availability.availability.basis_sha256) throw new AdaptiveCaseError("gate_submit_conflict", "Gate instruction basis changed.", "conflict");
  const payload = {
    data: GateSubmitPayloadSchema.parse({
      ...semantic.data,
      schema_version: "1",
      instruction_basis_sha256: availability.availability.basis_sha256,
    }),
  };
  validateGateEvidence(input.snapshot, payload.data.evidence);
  const [instanceId = "", gateNodeId = ""] = input.selector.slice("gate:".length).split("/", 2);
  const planSha256 = bindPlan(input.snapshot, input.selector, { payload: payload.data, actor: actor.data, confirmed_by: input.confirmedBy.trim() });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);
  const eventId = `E-${planSha256.slice(0, 24)}`;
  if (input.snapshot.gates.some((item) => item.event_id === eventId)) return already(input.selector, planSha256, `gate-event:${eventId}`, [{ kind: "no_change", refs: [`gate-event:${eventId}`] }]);
  const now = input.now ?? new Date().toISOString();
  const gateId = `${instanceId}/${gateNodeId}`;
  const receiptPath = `runs/current/receipts/gate-submit/${instanceId}/${gateNodeId}/${eventId}.json`;
  const receipt = GateSubmitReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "gate_submit",
    plan_sha256: planSha256,
    instruction_basis_sha256: payload.data.instruction_basis_sha256,
    selector: input.selector,
    gate_id: gateId,
    gate_node_id: gateNodeId,
    subflow_instance_id: instanceId,
    template_id: `tpl-adaptive-${instanceId.slice(3)}`,
    event_id: eventId,
    stage_id: "adaptive",
    gate_type: gateNodeId,
    validator_id: "researchspec-verify",
    verdict: payload.data.verdict,
    blocking: true,
    verification_kind: payload.data.verification_kind,
    evidence: payload.data.evidence,
    findings: payload.data.findings,
    actor: actor.data,
    confirmed_by: { kind: "human", name: input.confirmedBy.trim() },
    challenged_basis_sha256: payload.data.challenged_basis_sha256,
    supersedes_event_id: payload.data.supersedes_event_id,
    submitted_at: now,
  });
  const receiptOperation = await receiptWrite(input.snapshot, receiptPath, receipt);
  const receiptHash = requiredNextHash(receiptOperation);
  const event = {
    schema_version: "1",
    event_id: eventId,
    gate_id: gateId,
    gate_node_id: gateNodeId,
    subflow_instance_id: instanceId,
    template_id: receipt.template_id,
    timestamp: now,
    actor: actor.data,
    stage_id: "adaptive",
    gate_type: gateNodeId,
    validator_id: "researchspec-verify",
    verdict: payload.data.verdict,
    blocking: true,
    verification_kind: payload.data.verification_kind,
    evidence: payload.data.evidence,
    findings: payload.data.findings,
    confirmed_by: receipt.confirmed_by,
    receipt: { path: receiptPath, sha256: receiptHash, plan_sha256: planSha256 },
    ...(payload.data.challenged_basis_sha256 ? { challenged_basis_sha256: payload.data.challenged_basis_sha256 } : {}),
    ...(payload.data.supersedes_event_id ? { supersedes_event_id: payload.data.supersedes_event_id } : {}),
  };
  const ledgerFile = requiredFile(input.snapshot, "runs/current/gate-ledger.jsonl");
  const ledgerOperation = refresh(ledgerFile, `${ledgerFile.text}${JSON.stringify(event)}\n`, "append adaptive Gate event");
  const receiptId = `R-gate-${planSha256.slice(0, 20)}`;
  const passed = payload.data.verdict === "pass";
  const nextState = CaseStateSchema.parse({
    ...state,
    formal_gate_refs: passed ? [...state.formal_gate_refs, { gate_id: gateId, event_id: eventId }] : state.formal_gate_refs,
    obligations: passed ? state.obligations.map((item) => item.scope.subflow_instance_id === instanceId
      ? { ...item, formal_gate_refs: item.formal_gate_refs.some((ref) => ref.gate_id === gateId) ? item.formal_gate_refs : [...item.formal_gate_refs, { gate_id: gateId, event_id: eventId }] }
      : item) : state.obligations,
    receipts: [...state.receipts, { receipt_id: receiptId, receipt_type: "gate_submit", path: receiptPath, sha256: receiptHash }],
    updated_at: now,
  });
  return planned(input.snapshot, input.selector, planSha256, `gate-event:${eventId}`, receiptHash, [{ kind: "gate_recorded", refs: [input.selector, `gate-event:${eventId}`] }], [`instructions:${input.selector}`], [receiptOperation, ledgerOperation, stateWrite(input.snapshot, nextState)]);
}

export async function planAdaptiveResolutionDecision(input: {
  snapshot: WorkspaceSnapshot;
  selector: string;
  decision: DecisionInput["decision"];
  actorName: string;
  reason?: string;
  expectedPlanSha256?: string;
  now?: string;
}): Promise<AdaptiveTransactionPlan> {
  const { state } = adaptive(input.snapshot);
  const semantic = DecisionInputSchema.safeParse({ decision: input.decision, actor_name: input.actorName, ...(input.reason ? { reason: input.reason } : {}) });
  if (!semantic.success) throw new AdaptiveCaseError("invalid_decision_input", "Adaptive resolution decision is invalid.", "usage", semantic.error.issues);
  await requireAllowed(input.snapshot, input.selector);
  const action = state.case_actions.find((item) => `case-action:${item.action_id}` === input.selector);
  const obligation = action ? state.obligations.find((item) => item.obligation_id === action.obligation_scope[0]) : undefined;
  if (!action || !obligation || !action.requested_effect) throw new AdaptiveCaseError("decision_target_missing", "Adaptive resolution case action is unavailable.", "domain");
  const planSha256 = bindPlan(input.snapshot, input.selector, { decision: semantic.data, requested_effect: action.requested_effect });
  assertExpectedPlan(input.expectedPlanSha256, planSha256);
  const decisionId = `D-${planSha256.slice(0, 24)}`;
  const eventId = `E-${planSha256.slice(24, 48)}`;
  if (input.snapshot.decisions.some((item) => item.event_id === eventId)) return already(input.selector, planSha256, `decision:${decisionId}`, [{ kind: "no_change", refs: [`decision:${decisionId}`] }]);
  const now = input.now ?? new Date().toISOString();
  const accepted = input.decision === "accept";
  const status = accepted ? "accepted" : input.decision === "reject" ? "rejected" : "postponed";
  const event = {
    event_id: eventId,
    decision_id: decisionId,
    timestamp: now,
    actor: { kind: "human", name: input.actorName },
    decision_type: action.requested_effect === "waive" ? "obligation_waiver" : "obligation_not_applicable",
    selected_option: action.requested_effect,
    status,
    rationale: input.reason,
    case_action_id: action.action_id,
    obligation_id: obligation.obligation_id,
    subflow_instance_id: obligation.scope.subflow_instance_id ?? undefined,
  };
  const receiptId = `R-resolution-${planSha256.slice(0, 20)}`;
  const receiptPath = `runs/current/receipts/obligation-resolution/${action.action_id}/${eventId}.json`;
  const receipt = AdaptiveCaseReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "obligation_resolution",
    receipt_id: receiptId,
    selector: input.selector,
    plan_sha256: planSha256,
    actor: { kind: "human", name: input.actorName },
    effects: [{ kind: accepted ? "obligation_resolved" : `resolution_${status}`, refs: [obligation.obligation_id, `decision:${decisionId}`] }],
    committed_at: now,
  });
  const receiptOperation = await receiptWrite(input.snapshot, receiptPath, receipt);
  const receiptHash = requiredNextHash(receiptOperation);
  const ledgerFile = requiredFile(input.snapshot, "runs/current/decision-ledger.jsonl");
  const ledgerOperation = refresh(ledgerFile, `${ledgerFile.text}${JSON.stringify(event)}\n`, "append adaptive obligation Decision");
  const nextObligation = accepted ? {
    ...obligation,
    status: action.requested_effect === "waive" ? "waived" as const : "not_applicable" as const,
    status_reason: action.rationale ?? input.reason ?? null,
    formal_decision_refs: [...obligation.formal_decision_refs, { decision_id: decisionId, decision_type: event.decision_type }],
  } : obligation;
  const nextState = CaseStateSchema.parse({
    ...state,
    lifecycle: recomputeLifecycle(state, obligation.obligation_id, nextObligation),
    obligations: state.obligations.map((item) => item.obligation_id === obligation.obligation_id ? nextObligation : item),
    formal_decision_refs: accepted ? [...state.formal_decision_refs, { decision_id: decisionId, decision_type: event.decision_type }] : state.formal_decision_refs,
    case_actions: state.case_actions.map((item) => item.action_id === action.action_id ? { ...item, status } : item),
    receipts: [...state.receipts, { receipt_id: receiptId, receipt_type: receipt.receipt_type, path: receiptPath, sha256: receiptHash }],
    updated_at: now,
  });
  return planned(input.snapshot, input.selector, planSha256, `decision:${decisionId}`, receiptHash, [
    { kind: "decision_recorded", refs: [`decision:${decisionId}`] },
    ...(accepted ? [{ kind: "obligation_resolved" as const, refs: [obligation.obligation_id] }] : []),
  ], [`instructions:obligation:${obligation.scope.subflow_instance_id ?? state.run_id}/${obligation.obligation_id}`], [receiptOperation, ledgerOperation, stateWrite(input.snapshot, nextState)]);
}

export async function executeAdaptivePlan(plan: AdaptiveTransactionPlan): Promise<"applied" | "already_applied"> {
  if (plan.status === "already_applied") return "already_applied";
  await executeWritePlan(plan.writePlan);
  return "applied";
}

function planResolutionRequest(
  snapshot: WorkspaceSnapshot,
  selector: string,
  obligation: HardObligation,
  policy: "forbidden" | "profile_allowed" | "decision_required",
  payload: Extract<AdaptiveObligationSubmitInput, { operation: "request_resolution" }>,
  actor: SubmitActor,
  planSha256: string,
  now: string,
): Promise<AdaptiveTransactionPlan> {
  if (policy === "forbidden") throw new AdaptiveCaseError("obligation_resolution_forbidden", "The selected profile forbids this obligation resolution.", "domain");
  const { state } = adaptive(snapshot);
  const actionId = `CA-${planSha256.slice(0, 22)}`;
  if (state.case_actions.some((item) => item.action_id === actionId)) return Promise.resolve(already(selector, planSha256, `case-action:${actionId}`, [{ kind: "no_change", refs: [`case-action:${actionId}`] }]));
  const receiptId = `R-resolution-request-${planSha256.slice(0, 16)}`;
  const receiptPath = `runs/current/receipts/obligation-resolution-request/${actionId}.json`;
  const receipt = AdaptiveCaseReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "obligation_resolution_request",
    receipt_id: receiptId,
    selector,
    plan_sha256: planSha256,
    actor,
    effects: [{ kind: policy === "profile_allowed" ? "obligation_resolved" : "obligation_resolution_requested", refs: [obligation.obligation_id, `case-action:${actionId}`] }],
    committed_at: now,
  });
  return receiptWrite(snapshot, receiptPath, receipt).then((receiptOperation) => {
    const receiptHash = requiredNextHash(receiptOperation);
    const direct = policy === "profile_allowed";
    const nextState = CaseStateSchema.parse({
      ...state,
      lifecycle: direct
        ? recomputeLifecycle(state, obligation.obligation_id, {
            ...obligation,
            status: payload.resolution === "waive" ? "waived" : "not_applicable",
          })
        : state.lifecycle,
      obligations: state.obligations.map((item) => item.obligation_id === obligation.obligation_id && direct
        ? { ...item, status: payload.resolution === "waive" ? "waived" as const : "not_applicable" as const, status_reason: payload.rationale }
        : item),
      case_actions: [...state.case_actions, {
        action_id: actionId,
        selector: `case-action:${actionId}`,
        kind: "decision",
        obligation_scope: [obligation.obligation_id],
        status: direct ? "applied" : "pending",
        requested_effect: payload.resolution,
        rationale: payload.rationale,
        created_at: now,
      }],
      receipts: [...state.receipts, { receipt_id: receiptId, receipt_type: receipt.receipt_type, path: receiptPath, sha256: receiptHash }],
      updated_at: now,
    });
    return planned(snapshot, selector, planSha256, `case-action:${actionId}`, receiptHash, [direct
      ? { kind: "obligation_resolved", refs: [obligation.obligation_id] }
      : { kind: "obligation_resolution_requested", refs: [`case-action:${actionId}`] }], direct ? [`instructions:${selector}`] : [`instructions:case-action:${actionId}`], [receiptOperation, stateWrite(snapshot, nextState)]);
  });
}

async function validateAcceptedEvidence(
  snapshot: WorkspaceSnapshot,
  obligation: HardObligation,
  outputs: Array<{ artifact_type: string; path_template: string; validation_profile: string; required: boolean }>,
  payload: Extract<AdaptiveObligationSubmitInput, { operation: "accept_evidence" }>,
  actor: SubmitActor,
  receiptPath: string,
  receiptHash: string,
  now: string,
) {
  const requiredTypes = outputs.filter((item) => item.required).map((item) => item.artifact_type);
  if (requiredTypes.some((type) => !payload.evidence.some((item) => item.artifact_type === type))) throw new AdaptiveCaseError("evidence_bundle_incomplete", "Accepted evidence bundle does not cover every required output.", "domain");
  return Promise.all(payload.evidence.map(async (candidate) => {
    const output = outputs.find((item) => item.artifact_type === candidate.artifact_type);
    if (!output) throw new AdaptiveCaseError("evidence_type_not_allowed", `Evidence type is not declared: ${candidate.artifact_type}`, "domain");
    const instanceId = obligation.scope.subflow_instance_id;
    if (!instanceId) throw new AdaptiveCaseError("obligation_scope_invalid", "Adaptive evidence requires a subflow-scoped obligation.", "domain");
    const expectedPath = output.path_template.replaceAll("{subflow_instance_id}", instanceId);
    if (candidate.path !== expectedPath) throw new AdaptiveCaseError("evidence_path_mismatch", "Evidence path differs from the profile output contract.", "domain", { expected: expectedPath, actual: candidate.path });
    const absolutePath = path.resolve(snapshot.workspace, candidate.path);
    if (!inside(snapshot.workspace, absolutePath)) throw new AdaptiveCaseError("evidence_path_escape", "Evidence path escapes the workspace.", "domain");
    let bytes: Uint8Array;
    try { bytes = await readFile(absolutePath); } catch { throw new AdaptiveCaseError("evidence_missing", `Evidence file is unavailable: ${candidate.path}`, "domain"); }
    if (sha256(bytes) !== candidate.sha256) throw new AdaptiveCaseError("evidence_hash_mismatch", `Evidence hash changed: ${candidate.path}`, "conflict");
    if (output.validation_profile !== "binary-file-artifact") {
      try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new AdaptiveCaseError("evidence_validation_failed", "Text evidence is not valid UTF-8.", "domain"); }
    }
    const evidenceId = `EV-${candidate.artifact_id}`;
    return {
      artifact: AdaptiveAcceptedArtifactRecordSchema.parse({
        artifact_id: candidate.artifact_id,
        artifact_type: candidate.artifact_type,
        obligation_id: obligation.obligation_id,
        subflow_instance_id: instanceId,
        path: candidate.path,
        sha256: candidate.sha256,
        status: "accepted",
        verification_state: "verified",
        producer: actor,
        provenance: candidate.provenance,
        created_at: now,
      }),
      evidence: {
        evidence_id: evidenceId,
        obligation_id: obligation.obligation_id,
        artifact_id: candidate.artifact_id,
        artifact_type: candidate.artifact_type,
        path: candidate.path,
        sha256: candidate.sha256,
        accepted_at: now,
        acceptance_receipt: { path: receiptPath, sha256: receiptHash },
      },
    };
  }));
}

function assertAttemptReferences(snapshot: WorkspaceSnapshot, obligation: HardObligation, payload: Exclude<AdaptiveObligationSubmitInput, { operation: "request_resolution" }>): void {
  for (const id of [payload.retry_of_attempt_id, payload.replaces_attempt_id]) {
    if (!id) continue;
    const prior = snapshot.attempts.find((item) => item.attempt_id === id);
    if (!prior || prior.obligation_id !== obligation.obligation_id) throw new AdaptiveCaseError("attempt_reference_invalid", "Retry and replacement references must belong to the same obligation.", "domain");
  }
}

function validateGateEvidence(snapshot: WorkspaceSnapshot, evidence: Array<{ kind: "artifact"; artifact_id: string; sha256: string } | { kind: "contract"; path: string; sha256: string }>): void {
  for (const item of evidence) {
    if (item.kind === "contract") {
      const file = snapshot.files.get(item.path);
      if (!file || file.hash !== item.sha256) throw new AdaptiveCaseError("gate_evidence_untrusted", `Gate contract evidence is stale: ${item.path}`, "conflict");
    } else {
      const artifact = snapshot.artifacts.find((candidate) => candidate.artifact_id === item.artifact_id);
      if (!artifact || artifact.sha256 !== item.sha256) throw new AdaptiveCaseError("gate_evidence_untrusted", `Gate artifact evidence is stale: ${item.artifact_id}`, "conflict");
    }
  }
}

function adaptive(snapshot: WorkspaceSnapshot) {
  if (snapshot.runtimeMode !== "adaptive" || !snapshot.caseProfile || !snapshot.caseState) throw new AdaptiveCaseError("adaptive_runtime_unavailable", "Workspace is not a valid adaptive runtime.", "domain");
  const blocking = snapshot.diagnostics.find((item) => item.blocking);
  if (blocking) throw new AdaptiveCaseError("adaptive_workspace_invalid", `Workspace is invalid: ${blocking.code}`, "domain", blocking);
  return { profile: snapshot.caseProfile, state: snapshot.caseState };
}

async function requireAllowed(snapshot: WorkspaceSnapshot, selector: string) {
  const evaluated = await evaluateActionAvailability(snapshot, selector);
  if (!evaluated) throw new AdaptiveCaseError("action_not_found", `Adaptive action is unavailable: ${selector}`, "usage");
  if (evaluated.availability.disposition === "blocked") throw new AdaptiveCaseError("action_blocked", `Adaptive action is blocked: ${selector}`, "domain", evaluated.availability);
  return evaluated;
}

function bindPlan(snapshot: WorkspaceSnapshot, selector: string, semantic: unknown): string {
  const basis = [
    "specs/workflow.yaml",
    "runs/current/state.yaml",
    "runs/current/artifact-registry.json",
    "runs/current/gate-ledger.jsonl",
    "runs/current/decision-ledger.jsonl",
    "runs/current/attempt-ledger.jsonl",
  ].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    return file ? [[relativePath, file.hash] as const] : [];
  });
  return sha256(`${JSON.stringify({ selector, semantic, basis })}\n`);
}

function assertExpectedPlan(expected: string | undefined, actual: string): void {
  if (expected && expected !== actual) throw new AdaptiveCaseError("adaptive_plan_stale", "Adaptive transaction plan differs from the approved preview.", "conflict", { expected, actual });
}

function planned(
  snapshot: WorkspaceSnapshot,
  selector: string,
  planSha256: string,
  identitySelector: string,
  identitySha256: string | undefined,
  effects: CompactTransactionEffect[],
  nextSelectors: string[],
  operations: PlannedWrite[],
): AdaptiveTransactionPlan {
  return {
    status: "would_apply",
    selector,
    plan_sha256: planSha256,
    identity_selector: identitySelector,
    identity_sha256: identitySha256,
    effects,
    next_selectors: nextSelectors,
    writePlan: { operations, readPreconditions: preconditions(snapshot) },
  };
}

function already(selector: string, planSha256: string, identitySelector: string, effects: CompactTransactionEffect[]): AdaptiveTransactionPlan {
  return { status: "already_applied", selector, plan_sha256: planSha256, identity_selector: identitySelector, effects, next_selectors: [`instructions:${selector}`], writePlan: { operations: [] } };
}

function preconditions(snapshot: WorkspaceSnapshot): ReadPrecondition[] {
  return [
    "specs/workflow.yaml",
    "runs/current/state.yaml",
    "runs/current/artifact-registry.json",
    "runs/current/gate-ledger.jsonl",
    "runs/current/decision-ledger.jsonl",
    "runs/current/attempt-ledger.jsonl",
  ].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    return file ? [{ path: file.absolutePath, expectedHash: file.hash, reason: `adaptive basis ${relativePath}` }] : [];
  });
}

async function receiptWrite(snapshot: WorkspaceSnapshot, relativePath: string, receipt: unknown): Promise<PlannedWrite> {
  const content = `${JSON.stringify(receipt, null, 2)}\n`;
  const operation = await planFile({ path: path.join(snapshot.workspace, relativePath), relativePath, content, scope: "workspace", ownership: "user" });
  if (operation.action === "conflict") throw new AdaptiveCaseError("adaptive_receipt_conflict", `Adaptive receipt conflicts: ${relativePath}`, "conflict");
  return operation;
}

function attemptWrite(snapshot: WorkspaceSnapshot, attempt: AttemptRecord): PlannedWrite {
  const file = snapshot.files.get("runs/current/attempt-ledger.jsonl");
  const content = `${file?.text ?? ""}${JSON.stringify(attempt)}\n`;
  return file ? refresh(file, content, "append scoped adaptive attempt") : {
    action: "create",
    path: path.join(snapshot.workspace, "runs/current/attempt-ledger.jsonl"),
    relativePath: "runs/current/attempt-ledger.jsonl",
    content,
    scope: "workspace",
    ownership: "user",
    nextHash: sha256(content),
    reason: "create scoped adaptive attempt ledger",
  };
}

function stateWrite(snapshot: WorkspaceSnapshot, state: CaseState): PlannedWrite {
  const file = requiredFile(snapshot, "runs/current/state.yaml");
  return refresh(file, stringify(state), "commit adaptive CaseState last");
}

function refresh(file: SnapshotFile, content: string, reason: string): PlannedWrite {
  return { action: "refresh", path: file.absolutePath, relativePath: file.relativePath, content, scope: "workspace", ownership: "user", previousHash: file.hash, nextHash: sha256(content), reason };
}

function requiredFile(snapshot: WorkspaceSnapshot, relativePath: string): SnapshotFile {
  const file = snapshot.files.get(relativePath);
  if (!file) throw new AdaptiveCaseError("adaptive_basis_missing", `Required adaptive basis is unavailable: ${relativePath}`, "domain");
  return file;
}

function requiredNextHash(operation: PlannedWrite): string {
  if (!operation.nextHash) throw new AdaptiveCaseError("adaptive_plan_invalid", "Planned receipt has no next hash.", "domain");
  return operation.nextHash;
}

function obligationForSelector(state: CaseState, selector: string): HardObligation {
  const [instanceId = "", obligationId = ""] = selector.slice("obligation:".length).split("/", 2);
  const obligation = state.obligations.find((item) => item.scope.subflow_instance_id === instanceId && item.obligation_id === obligationId);
  if (!obligation) throw new AdaptiveCaseError("obligation_not_found", `Obligation is unavailable: ${selector}`, "domain");
  return obligation;
}

function requiredMap(values: Map<string, string>, key: string): string {
  const value = values.get(key);
  if (!value) throw new AdaptiveCaseError("adaptive_profile_invalid", `Runtime obligation mapping is unavailable: ${key}`, "domain");
  return value;
}

function recomputeLifecycle(state: CaseState, changedId: string, changed: HardObligation): CaseState["lifecycle"] {
  const obligations = state.obligations.map((item) => item.obligation_id === changedId ? changed : item);
  const unresolved = obligations.filter((item) => !["satisfied", "waived", "not_applicable"].includes(item.status));
  return unresolved.length > 0 && unresolved.every((item) => item.status === "blocked") ? "waiting" : "open";
}

function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
