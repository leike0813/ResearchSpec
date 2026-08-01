import { parseActionTargetSelector } from "../contracts/action-selector.js";
import type { ActionAvailability } from "../contracts/case-control.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import {
  evaluateStartActionAvailability,
  evaluateWorkflowControl,
  type WorkflowControlResult,
} from "./legacy-workflow-control.js";
import { evaluateAdaptiveActionAvailability } from "./adaptive-case-control.js";
import { createActionAvailability } from "./availability-facts.js";
import { resolveGateAuthority } from "./gate-authority.js";

export { actionReadPreconditions, createActionAvailability } from "./availability-facts.js";

export type RuntimeActionKey =
  | "start"
  | "submit_artifact"
  | "submit_gate"
  | "submit_obligation"
  | "submit_patch"
  | "submit_annotation"
  | "advance"
  | "advance_completion"
  | "advance_patch"
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
  if (snapshot.runtimeMode === "adaptive") {
    const adaptive = evaluateAdaptiveActionAvailability(snapshot, selector);
    if (adaptive) return adaptive;
  }
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
      availability: createActionAvailability(snapshot, selector, item?.state === "ready" && item.dispatchable ? "recommended" : "blocked", item?.state === "ready" && item.dispatchable ? "work_ready" : item?.state === "done" ? "work_complete" : "work_blocked", item?.missing_dependencies.map((dependency) => `${dependency.kind}:${dependency.id}`) ?? [selector]),
    };
  }
  if (parsed.kind === "gate") {
    const item = control.gates.find((candidate) => candidate.selector === selector);
    return {
      key: "submit_gate",
      availability: createActionAvailability(snapshot, selector, item?.state === "ready" || item?.state === "failed" ? "allowed" : "blocked", item?.state === "ready" || item?.state === "failed" ? "gate_verdict_allowed" : item?.state === "passed" || item?.state === "overridden" ? "gate_complete" : "gate_blocked", item && item.state === "blocked" ? [selector] : []),
    };
  }
  if (parsed.kind === "transition") {
    const item = control.transitions.find((candidate) => candidate.selector === selector);
    const isDecision = item?.state === "decision_required";
    const executable = item?.state === "ready" || isDecision;
    return {
      key: isDecision ? "decide" : "advance",
      availability: createActionAvailability(snapshot, selector, executable ? item?.automatic ? "recommended" : "allowed" : "blocked", isDecision ? "decision_required" : item?.state === "ready" ? "transition_ready" : item?.state === "advanced" ? "transition_complete" : "transition_blocked", executable ? [] : [selector]),
    };
  }

  const existing = snapshot.items.find((item) => item.selector === selector);
  if (parsed.kind === "annotation") {
    return {
      key: "submit_annotation",
      availability: createActionAvailability(
        snapshot,
        selector,
        "allowed",
        "annotation_submission_allowed",
        [],
      ),
    };
  }
  if (parsed.kind === "patch") {
    if (!existing) {
      return {
        key: "submit_patch",
        availability: createActionAvailability(snapshot, selector, "allowed", "patch_submission_allowed", []),
      };
    }
    const status = string(record(existing.value).status) ?? "proposed";
    if (status === "accepted" || status === "applied" || status === "stale") {
      return {
        key: "advance_patch",
        availability: createActionAvailability(snapshot, selector, "allowed", status === "accepted" ? "patch_apply_allowed" : "patch_already_resolved", []),
      };
    }
    const pending = status === "proposed" || status === "postponed";
    return {
      key: "decide",
      availability: createActionAvailability(snapshot, selector, pending ? "allowed" : "blocked", pending ? "decision_allowed" : "decision_target_resolved", pending ? [] : [selector]),
    };
  }
  if (parsed.kind === "change" && !existing) {
    return {
      key: "propose",
      availability: createActionAvailability(snapshot, selector, "allowed", "proposal_allowed", []),
    };
  }
  if (!existing || !["change", "patch", "gate"].includes(existing.type)) {
    return {
      key: "decide",
      availability: createActionAvailability(snapshot, selector, "blocked", "decision_target_missing", [selector]),
    };
  }
  const status = string(record(existing.value).status) ?? (existing.type === "gate" ? undefined : "proposed");
  const gatePending = existing.type === "gate"
    && record(existing.value).blocking === true
    && !resolveGateAuthority(snapshot, existing.id).satisfied;
  const pending = existing.type === "gate" ? gatePending : status === "proposed" || status === "postponed";
  return {
    key: "decide",
    availability: createActionAvailability(snapshot, selector, pending ? "allowed" : "blocked", pending ? "decision_allowed" : "decision_target_resolved", pending ? [] : [selector]),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
