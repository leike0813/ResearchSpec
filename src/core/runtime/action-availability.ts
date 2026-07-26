import { ActionAvailabilitySchema, type ActionAvailability } from "../contracts/case-control.js";
import { parseActionTargetSelector } from "../contracts/action-selector.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";
import {
  evaluateStartActionAvailability,
  evaluateWorkflowControl,
  type WorkflowControlResult,
} from "./workflow-control.js";

export type RuntimeActionKey =
  | "start"
  | "submit_artifact"
  | "submit_gate"
  | "advance"
  | "propose"
  | "decide";

export interface EvaluatedRuntimeAction {
  key: RuntimeActionKey;
  availability: ActionAvailability;
}

export async function evaluateActionAvailability(
  snapshot: WorkspaceSnapshot,
  selector: string,
  providedControl?: WorkflowControlResult,
): Promise<EvaluatedRuntimeAction | undefined> {
  const parsed = parseActionTargetSelector(selector);
  if (!parsed) return undefined;
  const control = providedControl ?? await evaluateWorkflowControl(snapshot);

  if (parsed.kind === "subflow_template" || parsed.kind === "scoped_subflow_node") {
    return { key: "start", availability: evaluateStartActionAvailability(snapshot, control, selector) };
  }
  if (parsed.kind === "scoped_work") {
    const item = control.work_items.find((candidate) => candidate.selector === selector);
    return {
      key: "submit_artifact",
      availability: availability(snapshot, selector, item?.state === "ready" && item.dispatchable ? "recommended" : "blocked", item?.state === "ready" && item.dispatchable ? "work_ready" : item?.state === "done" ? "work_complete" : "work_blocked", item?.missing_dependencies.map((dependency) => `${dependency.kind}:${dependency.id}`) ?? [selector]),
    };
  }
  if (parsed.kind === "gate") {
    const item = control.gates.find((candidate) => candidate.selector === selector);
    return {
      key: "submit_gate",
      availability: availability(snapshot, selector, item?.state === "ready" || item?.state === "failed" ? "allowed" : "blocked", item?.state === "ready" || item?.state === "failed" ? "gate_verdict_allowed" : item?.state === "passed" || item?.state === "overridden" ? "gate_complete" : "gate_blocked", item && item.state === "blocked" ? [selector] : []),
    };
  }
  if (parsed.kind === "transition") {
    const item = control.transitions.find((candidate) => candidate.selector === selector);
    const isDecision = item?.state === "decision_required";
    const executable = item?.state === "ready" || isDecision;
    return {
      key: isDecision ? "decide" : "advance",
      availability: availability(snapshot, selector, executable ? item?.automatic ? "recommended" : "allowed" : "blocked", isDecision ? "decision_required" : item?.state === "ready" ? "transition_ready" : item?.state === "advanced" ? "transition_complete" : "transition_blocked", executable ? [] : [selector]),
    };
  }

  const existing = snapshot.items.find((item) => item.selector === selector);
  if (parsed.kind === "change" && !existing) {
    return {
      key: "propose",
      availability: availability(snapshot, selector, "allowed", "proposal_allowed", []),
    };
  }
  if (!existing || !["change", "patch", "gate"].includes(existing.type)) {
    return {
      key: "decide",
      availability: availability(snapshot, selector, "blocked", "decision_target_missing", [selector]),
    };
  }
  const status = string(record(existing.value).status) ?? (existing.type === "gate" ? undefined : "proposed");
  const gatePending = existing.type === "gate"
    && record(existing.value).blocking === true
    && record(existing.value).verdict !== "pass"
    && !snapshot.decisions.some((decision) => decision.gate_id === existing.id && decision.status === "accepted");
  const pending = existing.type === "gate" ? gatePending : status === "proposed" || status === "postponed";
  return {
    key: "decide",
    availability: availability(snapshot, selector, pending ? "allowed" : "blocked", pending ? "decision_allowed" : "decision_target_resolved", pending ? [] : [selector]),
  };
}

export function actionReadPreconditions(snapshot: WorkspaceSnapshot) {
  return [
    "specs/project.md",
    "specs/sources.yaml",
    "specs/claims.yaml",
    "specs/manuscript.yaml",
    "specs/workflow.yaml",
    "runs/current/state.yaml",
    "runs/current/artifact-registry.json",
    "runs/current/gate-ledger.jsonl",
    "runs/current/decision-ledger.jsonl",
  ].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    return file ? [{ path: relativePath, sha256: file.hash }] : [];
  });
}

function availability(
  snapshot: WorkspaceSnapshot,
  selector: string,
  disposition: ActionAvailability["disposition"],
  reasonCode: string,
  blockingRefs: string[],
): ActionAvailability {
  const expiresWhen = actionReadPreconditions(snapshot);
  return ActionAvailabilitySchema.parse({
    selector,
    disposition,
    reason_code: reasonCode,
    obligation_scope: [],
    blocking_refs: blockingRefs,
    basis_sha256: sha256(`${JSON.stringify({
      selector,
      disposition,
      reason_code: reasonCode,
      blocking_refs: blockingRefs,
      expires_when: expiresWhen,
    })}\n`),
    expires_when: expiresWhen,
  });
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
