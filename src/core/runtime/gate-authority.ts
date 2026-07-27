import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { latestById } from "../workspace/snapshot.js";

export interface GateAuthority {
  gateId: string;
  latestEvent?: Record<string, unknown>;
  acceptedOverride?: Record<string, unknown>;
  satisfied: boolean;
}

export function resolveGateAuthority(snapshot: WorkspaceSnapshot, gateId: string): GateAuthority {
  const latestEvent = latestById(
    snapshot.gates.filter((event) => event.authority !== "imported_evidence" && event.gate_id === gateId),
    "gate_id",
  )[0];
  const eventId = string(latestEvent?.event_id);
  const receipt = record(latestEvent?.receipt);
  const acceptedOverride = eventId
    ? latestById(snapshot.decisions.filter((decision) => decision.authority !== "imported_evidence"), "decision_id")
      .find((decision) =>
        decision.status === "accepted"
        && decision.decision_type === "gate_override"
        && decision.gate_id === gateId
        && decision.gate_event_id === eventId
        && decision.gate_receipt_sha256 === receipt.sha256
        && decision.gate_receipt_plan_sha256 === receipt.plan_sha256)
    : undefined;
  return {
    gateId,
    ...(latestEvent ? { latestEvent } : {}),
    ...(acceptedOverride ? { acceptedOverride } : {}),
    satisfied: isPassingGateVerdict(latestEvent?.verdict) || Boolean(acceptedOverride),
  };
}

export function isPassingGateVerdict(value: unknown): boolean {
  return value === "pass" || value === "pass_with_conditions";
}

export function assertCurrentGateReverification(
  snapshot: WorkspaceSnapshot,
  gateId: string,
  verificationKind: "initial" | "reverification",
  supersedesEventId?: string,
): void {
  if (verificationKind !== "reverification") return;
  const latest = resolveGateAuthority(snapshot, gateId).latestEvent;
  if (!latest || supersedesEventId !== latest.event_id) {
    throw new Error(`Reverification must supersede the latest event for ${gateId}.`);
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
