import type { GateSubmitReceipt, TransitionAdvanceReceipt } from "../contracts/gate-transition.js";
import type { CaseState } from "../contracts/case-state.js";
import type { RunState, SubflowInstanceState } from "../contracts/run-state.js";
import type { SubflowStartReceipt } from "../contracts/subflow.js";

export function startReceiptMatchesAuthority(instance: SubflowInstanceState, receipt: SubflowStartReceipt): boolean {
  return receipt.instance_id === instance.instance_id
    && receipt.template_id === instance.template_id
    && receipt.route_ref === instance.route_ref
    && receipt.parent_subflow_id === instance.parent_subflow_id
    && (receipt.parent_node_id ?? null) === (instance.parent_node_id ?? null)
    && receipt.round_number === instance.round_number
    && receipt.plan_sha256 === instance.start_receipt.plan_sha256;
}

export function transitionReceiptMatchesAuthority(
  instance: SubflowInstanceState,
  reference: SubflowInstanceState["transition_receipts"][number],
  receipt: TransitionAdvanceReceipt,
): boolean {
  return receipt.transition_id === reference.transition_id
    && receipt.subflow_instance_id === instance.instance_id
    && receipt.plan_sha256 === reference.plan_sha256;
}

export function gateReceiptMatchesAuthority(
  event: Record<string, unknown>,
  reference: Record<string, unknown>,
  receipt: GateSubmitReceipt,
): boolean {
  return receipt.event_id === event.event_id
    && receipt.gate_id === event.gate_id
    && receipt.plan_sha256 === reference.plan_sha256
    && receipt.verdict === event.verdict
    && receipt.verification_kind === event.verification_kind
    && equivalent(receipt.evidence, event.evidence)
    && equivalent(receipt.findings, event.findings)
    && equivalent(receipt.confirmed_by, event.confirmed_by);
}

export function adaptiveReceiptMatchesAuthority(
  reference: CaseState["receipts"][number],
  receiptType: string | undefined,
  receipt: Record<string, unknown> | undefined,
): boolean {
  if (!receipt || receiptType !== reference.receipt_type) return false;
  if (receiptType !== "gate_submit" && receipt.receipt_id !== reference.receipt_id) return false;
  if (receipt.schema_version !== "2") return true;
  const actionIdentity = record(receipt.action_identity);
  return receipt.plan_sha256 === reference.plan_sha256
    && actionIdentity.identity_selector === reference.authority_selector;
}

export function runStateReceiptReferencePaths(state: RunState): string[] {
  return state.subflows.flatMap((instance) => [
    instance.start_receipt.path,
    ...instance.transition_receipts.map((reference) => reference.path),
  ]);
}

function equivalent(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
