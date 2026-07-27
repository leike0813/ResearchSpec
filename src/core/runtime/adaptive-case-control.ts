import type { HardObligation } from "../contracts/case-state.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import type { EvaluatedRuntimeAction } from "./action-availability.js";
import { createActionAvailability } from "./availability-facts.js";
import { isPassingGateVerdict, resolveGateAuthority } from "./gate-authority.js";

export function adaptiveActionCandidates(snapshot: WorkspaceSnapshot): string[] {
  if (!snapshot.caseProfile || !snapshot.caseState) return [];
  const instanceIds = adaptiveInstanceIds(snapshot);
  const obligationSelectors = snapshot.caseState.obligations.map((item) => obligationSelector(item));
  const gateSelectors = instanceIds.flatMap((instanceId) => {
    const definitions = instanceObligations(snapshot, instanceId).flatMap((item) => {
      const definition = snapshot.caseProfile?.obligations.find((candidate) => candidate.obligation_id === (item.definition_id ?? item.obligation_id));
      return definition?.formal_gate_ids ?? [];
    });
    return [...new Set(definitions)].map((id) => `gate:${instanceId}/${id}`);
  });
  const completionSelectors = instanceIds.flatMap((instanceId) => {
    const route = instanceRoute(snapshot, instanceId);
    return (route?.completion_criterion_ids ?? []).map((id) => `completion:${instanceId}/${id}`);
  });
  const caseActions = snapshot.caseState.case_actions
    .filter((item) => item.status === "pending" || item.status === "postponed" || (item.kind === "patch" && item.status === "accepted"))
    .map((item) => item.selector);
  const starts = snapshot.caseProfile.routes.map((route) => `subflow:${route.template_id}`);
  return [...new Set([...obligationSelectors, ...gateSelectors, ...completionSelectors, ...caseActions, ...starts])];
}

export function evaluateAdaptiveActionAvailability(
  snapshot: WorkspaceSnapshot,
  selector: string,
): EvaluatedRuntimeAction | undefined {
  if (!snapshot.caseProfile || !snapshot.caseState) return undefined;
  const raw = rawAdaptiveAvailability(snapshot, selector);
  if (!raw) return undefined;
  const recommended = recommendedSelector(snapshot);
  if (raw.availability.disposition === "allowed" && selector === recommended) {
    return {
      ...raw,
      availability: createActionAvailability(
        snapshot,
        selector,
        "recommended",
        raw.availability.reason_code,
        raw.availability.blocking_refs,
        raw.availability.obligation_scope,
      ),
    };
  }
  return raw;
}

export function adaptiveInstanceIds(snapshot: WorkspaceSnapshot): string[] {
  return [...new Set((snapshot.caseState?.obligations ?? []).flatMap((item) => item.scope.subflow_instance_id ? [item.scope.subflow_instance_id] : []))];
}

export function adaptiveInstanceState(snapshot: WorkspaceSnapshot, instanceId: string): "active" | "waiting" | "complete" {
  if (snapshot.caseState?.completion_effects.some((effect) => effect.kind === "complete_subflow" && effect.subflow_instance_id === instanceId)) return "complete";
  const obligations = instanceObligations(snapshot, instanceId);
  return obligations.length > 0 && obligations.every((item) => item.status === "blocked") ? "waiting" : "active";
}

export function obligationSelector(obligation: HardObligation): string {
  return `obligation:${obligation.scope.subflow_instance_id ?? obligation.scope.run_id}/${obligation.obligation_id}`;
}

export function instanceObligations(snapshot: WorkspaceSnapshot, instanceId: string): HardObligation[] {
  return snapshot.caseState?.obligations.filter((item) => item.scope.subflow_instance_id === instanceId) ?? [];
}

export function buildAdaptiveInstructions(snapshot: WorkspaceSnapshot, selector: string): Record<string, unknown> {
  const profile = snapshot.caseProfile;
  const state = snapshot.caseState;
  if (!profile || !state) return { selector };
  if (selector.startsWith("subflow:")) {
    const route = profile.routes.find((item) => `subflow:${item.template_id}` === selector);
    return { kind: "adaptive_route", selector, route: route ?? null, obligation_definitions: route?.obligation_ids.map((id) => profile.obligations.find((item) => item.obligation_id === id)).filter(Boolean) ?? [] };
  }
  if (selector.startsWith("obligation:")) {
    const [, body = ""] = selector.split(":", 2);
    const [instanceId, obligationId] = body.split("/", 2);
    const obligation = state.obligations.find((item) => item.scope.subflow_instance_id === instanceId && item.obligation_id === obligationId);
    const definition = profile.obligations.find((item) => item.obligation_id === (obligation?.definition_id ?? obligation?.obligation_id));
    return { kind: "adaptive_obligation", selector, obligation: obligation ?? null, definition: definition ?? null, attempts: snapshot.attempts.filter((item) => item.obligation_id === obligationId).slice(-20) };
  }
  if (selector.startsWith("completion:")) {
    const criterionId = selector.split("/", 2)[1] ?? "";
    return { kind: "adaptive_completion", selector, criterion: profile.completion_criteria.find((item) => item.criterion_id === criterionId) ?? null };
  }
  if (selector.startsWith("case-action:")) {
    return { kind: "adaptive_case_action", selector, case_action: state.case_actions.find((item) => `case-action:${item.action_id}` === selector) ?? null };
  }
  if (selector.startsWith("patch:") || selector.startsWith("change:")) {
    const action = state.case_actions.find((item) => item.selector === selector);
    const item = snapshot.items.find((candidate) => candidate.selector === selector);
    return { kind: action?.kind === "patch" ? "draft_patch_case_action" : "contract_change_case_action", selector, case_action: action ?? null, item: item?.value ?? null };
  }
  return { kind: "adaptive_gate", selector };
}

function rawAdaptiveAvailability(snapshot: WorkspaceSnapshot, selector: string): EvaluatedRuntimeAction | undefined {
  const profile = snapshot.caseProfile;
  const state = snapshot.caseState;
  if (!profile || !state) return undefined;
  if (selector.startsWith("subflow:tpl-")) {
    const route = profile.routes.find((item) => `subflow:${item.template_id}` === selector);
    if (!route) return undefined;
    const terminal = ["complete", "failed", "cancelled"].includes(state.lifecycle);
    return {
      key: "start",
      availability: createActionAvailability(snapshot, selector, terminal ? "blocked" : "allowed", terminal ? "run_terminal" : "adaptive_route_start_allowed", terminal ? [`run:${state.run_id}`] : []),
    };
  }
  if (selector.startsWith("obligation:")) {
    const [, body = ""] = selector.split(":", 2);
    const [instanceId, obligationId] = body.split("/", 2);
    const obligation = state.obligations.find((item) => item.scope.subflow_instance_id === instanceId && item.obligation_id === obligationId);
    if (!obligation) return undefined;
    const completed = ["satisfied", "waived", "not_applicable"].includes(obligation.status);
    const unresolvedDependencies = obligation.dependencies
      .map((dependency) => state.obligations.find((item) => item.obligation_id === dependency.obligation_id))
      .filter((item) => !item || !["satisfied", "waived", "not_applicable"].includes(item.status))
      .map((item) => item ? obligationSelector(item) : "obligation:missing");
    const caseActionBlockers = state.case_actions
      .filter((action) => action.obligation_scope.includes(obligation.obligation_id)
        && ((action.kind === "contract_change"
          && (action.status === "pending" || action.status === "postponed" || action.status === "accepted" || action.status === "stale"))
          || (action.kind === "patch" && action.status === "accepted" && highImpactPatchIsBlocked(snapshot, action.selector))))
      .map((action) => action.selector);
    const blockers = [...unresolvedDependencies, ...caseActionBlockers];
    const blocked = blockers.length > 0 && obligation.status !== "blocked";
    return {
      key: "submit_obligation",
      availability: createActionAvailability(
        snapshot,
        selector,
        completed || blocked ? "blocked" : "allowed",
        completed ? "obligation_resolved" : caseActionBlockers.length ? "contract_change_pending" : blocked ? "hard_dependency_unsatisfied" : obligation.status === "blocked" ? "obligation_retry_allowed" : "obligation_work_allowed",
        completed ? [] : blockers,
        [obligation.obligation_id],
      ),
    };
  }
  if (selector.startsWith("gate:sf-")) {
    const [, body = ""] = selector.split(":", 2);
    const [instanceId, gateId] = body.split("/", 2);
    const scoped = instanceObligations(snapshot, instanceId).filter((item) => {
      const definition = profile.obligations.find((candidate) => candidate.obligation_id === (item.definition_id ?? item.obligation_id));
      return definition?.formal_gate_ids.includes(gateId ?? "") ?? false;
    });
    if (!gateId || scoped.length === 0) return undefined;
    const authority = resolveGateAuthority(snapshot, `${instanceId}/${gateId}`);
    const verified = isPassingGateVerdict(authority.latestEvent?.verdict);
    const evidenceReady = scoped.every((item) =>
      item.accepted_evidence_ids.length > 0
      || (
        (item.status === "waived" || item.status === "not_applicable")
        && item.formal_decision_refs.some((reference) => reference.event_id && reference.receipt)
    ));
    return {
      key: "submit_gate",
      availability: createActionAvailability(
        snapshot,
        selector,
        verified || !evidenceReady ? "blocked" : "allowed",
        verified
          ? "gate_complete"
          : authority.acceptedOverride
            ? "gate_reverification_allowed"
            : evidenceReady
              ? "gate_verdict_allowed"
              : "gate_evidence_missing",
        verified ? [] : evidenceReady ? [] : scoped.map(obligationSelector),
        scoped.map((item) => item.obligation_id),
      ),
    };
  }
  if (selector.startsWith("completion:sf-")) {
    const [, body = ""] = selector.split(":", 2);
    const [instanceId, criterionId] = body.split("/", 2);
    const criterion = profile.completion_criteria.find((item) => item.criterion_id === criterionId);
    const route = instanceRoute(snapshot, instanceId ?? "");
    if (!criterion || !route?.completion_criterion_ids.includes(criterion.criterion_id)) return undefined;
    const scoped = instanceObligations(snapshot, instanceId ?? "");
    const byDefinition = new Map(scoped.map((item) => [item.definition_id ?? item.obligation_id, item]));
    const required = criterion.obligation_ids.map((id) => byDefinition.get(id));
    const unresolved = required.filter((item) => !item || !["satisfied", "waived", "not_applicable"].includes(item.status));
    const gateIds = [...new Set(required.flatMap((item) => {
      const definition = profile.obligations.find((candidate) => candidate.obligation_id === (item?.definition_id ?? item?.obligation_id));
      return definition?.formal_gate_ids ?? [];
    }))];
    const missingGates = gateIds.filter((id) => !resolveGateAuthority(snapshot, `${instanceId}/${id}`).satisfied);
    const already = state.completion_effects.some((effect) => effect.kind === "complete_subflow" && effect.subflow_instance_id === instanceId);
    const blockers = [...unresolved.map((item) => item ? obligationSelector(item) : "obligation:missing"), ...missingGates.map((id) => `gate:${instanceId}/${id}`)];
    return {
      key: "advance_completion",
      availability: createActionAvailability(snapshot, selector, already || blockers.length > 0 ? "blocked" : "allowed", already ? "completion_applied" : blockers.length ? "completion_blocked" : "completion_ready", already ? [] : blockers, required.flatMap((item) => item ? [item.obligation_id] : [])),
    };
  }
  if (selector.startsWith("case-action:")) {
    const action = state.case_actions.find((item) => item.action_id === selector.slice("case-action:".length));
    if (!action) return undefined;
    const pending = action.status === "pending" || action.status === "postponed";
    return {
      key: "decide",
      availability: createActionAvailability(snapshot, selector, pending ? "allowed" : "blocked", pending ? "decision_allowed" : "decision_target_resolved", [], action.obligation_scope),
    };
  }
  if (selector.startsWith("patch:")) {
    const patch = snapshot.patches.find((item) => item.selector === selector);
    if (!patch) {
      return {
        key: "submit_patch",
        availability: createActionAvailability(snapshot, selector, "allowed", "patch_submission_allowed", []),
      };
    }
    const status = string(record(patch.value).status) ?? "proposed";
    const action = state.case_actions.find((item) => item.selector === selector);
    if (status === "accepted") {
      const linkedChangeId = linkedChange(record(patch.value));
      const linked = linkedChangeId ? snapshot.changes.find((item) => item.id === linkedChangeId) : undefined;
      const blocked = Boolean(linkedChangeId && (!linked || string(record(linked.value).status) !== "applied"));
      return {
        key: "advance_patch",
        availability: createActionAvailability(snapshot, selector, blocked ? "blocked" : "allowed", blocked ? "linked_change_unresolved" : "patch_apply_allowed", blocked && linkedChangeId ? [`change:${linkedChangeId}`] : [], action?.obligation_scope ?? []),
      };
    }
    if (status === "applied" || status === "stale") {
      return {
        key: "advance_patch",
        availability: createActionAvailability(snapshot, selector, "allowed", "patch_already_resolved", [], action?.obligation_scope ?? []),
      };
    }
    const pending = status === "proposed" || status === "postponed";
    return {
      key: "decide",
      availability: createActionAvailability(snapshot, selector, pending ? "allowed" : "blocked", pending ? "decision_allowed" : "decision_target_resolved", pending ? [] : [selector], action?.obligation_scope ?? []),
    };
  }
  if (selector.startsWith("change:")) {
    const change = snapshot.changes.find((item) => item.selector === selector);
    const action = state.case_actions.find((item) => item.selector === selector);
    if (!change) {
      return {
        key: "propose",
        availability: createActionAvailability(snapshot, selector, "allowed", "proposal_allowed", [], action?.obligation_scope ?? []),
      };
    }
    const status = string(record(change.value).status) ?? "proposed";
    const pending = status === "proposed" || status === "postponed";
    return {
      key: "decide",
      availability: createActionAvailability(snapshot, selector, pending ? "allowed" : "blocked", pending ? "decision_allowed" : "decision_target_resolved", pending ? [] : [selector], action?.obligation_scope ?? []),
    };
  }
  return undefined;
}

function recommendedSelector(snapshot: WorkspaceSnapshot): string | undefined {
  const candidates = adaptiveActionCandidates(snapshot);
  const active = candidates.filter((item) => item.startsWith("obligation:") || item.startsWith("gate:") || item.startsWith("completion:") || item.startsWith("case-action:") || item.startsWith("patch:") || item.startsWith("change:"));
  const playbookOrder = (snapshot.playbook?.recommended_steps ?? []).flatMap((step) => {
    if (!step.action_selector.includes("{subflow_instance_id}")) return [step.action_selector];
    return adaptiveInstanceIds(snapshot).map((instanceId) => step.action_selector.replace("{subflow_instance_id}", instanceId));
  });
  const activeSet = new Set(active);
  const rankedActive = playbookOrder.filter((selector) => activeSet.has(selector));
  const ordered = active.length > 0
    ? [...rankedActive, ...active.filter((selector) => !rankedActive.includes(selector)), ...candidates.filter((item) => item.startsWith("subflow:"))]
    : [...playbookOrder.filter((selector) => candidates.includes(selector)), ...candidates];
  return ordered.find((selector) => rawAdaptiveAvailability(snapshot, selector)?.availability.disposition === "allowed");
}

function instanceRoute(snapshot: WorkspaceSnapshot, instanceId: string) {
  const definitions = new Set(instanceObligations(snapshot, instanceId).map((item) => item.definition_id ?? item.obligation_id));
  return snapshot.caseProfile?.routes.find((route) => route.obligation_ids.some((id) => definitions.has(id)));
}

function linkedChange(value: Record<string, unknown>): string | undefined {
  const semantic = record(value.semantic_delta);
  return semantic.level === "high" && typeof semantic.linked_change_id === "string" ? semantic.linked_change_id : undefined;
}

function highImpactPatchIsBlocked(snapshot: WorkspaceSnapshot, selector: string): boolean {
  const patch = snapshot.patches.find((item) => item.selector === selector);
  const changeId = patch ? linkedChange(record(patch.value)) : undefined;
  if (!changeId) return false;
  const change = snapshot.changes.find((item) => item.id === changeId);
  return !change || string(record(change.value).status) !== "applied";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}
