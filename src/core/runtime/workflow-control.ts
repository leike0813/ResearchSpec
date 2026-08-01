import type { PipelineProfile } from "../contracts/pipeline-profile.js";
import type { SubflowControl } from "../contracts/subflow-control.js";
import type { CurrentWorkspaceIndex, SubflowRecord } from "./workspace-index.js";

type PipelineProfileChild = PipelineProfile["children"][number];
type PipelineProfileTransition = PipelineProfile["transitions"][number];

export interface RouteFrontierItem {
  kind: "route";
  selector: string;
  route_ref: string;
  profile_entry?: string;
  parent_instance_id?: string;
  node_id?: string;
  round?: number;
}

export interface ControlFrontierItem {
  kind: "gate" | "decision" | "advance";
  selector: string;
  instance_id: string;
  local_id?: string;
  transition?: string;
}

export type WorkflowFrontierItem = RouteFrontierItem | ControlFrontierItem;

export interface WorkflowBlocker {
  instance_id: string;
  code: string;
  message: string;
  refs: string[];
}

export interface WorkflowControl {
  frontier: WorkflowFrontierItem[];
  blockers: WorkflowBlocker[];
  pending_gates: string[];
  pending_decisions: string[];
}

export interface ChildStartCandidate {
  parent: SubflowRecord;
  node: PipelineProfileChild;
  round?: number;
}

export function evaluateWorkflowControl(index: CurrentWorkspaceIndex): WorkflowControl {
  const frontier: WorkflowFrontierItem[] = index.profile.entries.map((entry) => ({
    kind: "route",
    selector: `route:${entry.route_ref}`,
    route_ref: entry.route_ref,
    profile_entry: entry.entry_id,
  }));
  const blockers: WorkflowBlocker[] = [];
  const pendingGates: string[] = [];
  const pendingDecisions: string[] = [];

  for (const candidate of childStartCandidates(index)) {
    frontier.push({
      kind: "route",
      selector: `route:${candidate.node.route_ref}`,
      route_ref: candidate.node.route_ref,
      parent_instance_id: candidate.parent.control.instance_id,
      node_id: candidate.node.node_id,
      ...(candidate.round === undefined ? {} : { round: candidate.round }),
    });
  }

  for (const record of index.subflows) {
    const control = record.control;
    if (control.status === "paused") {
      frontier.push({ kind: "advance", selector: `subflow:${control.instance_id}`, instance_id: control.instance_id, transition: "resume" });
      continue;
    }
    if (control.status !== "active" && control.status !== "blocked") continue;

    const missingOutputRoles = control.start_confirmation.expected_outputs.filter((role) => !record.handoff.outputs.some((item) => item.role === role));
    if (missingOutputRoles.length > 0) {
      blockers.push({ instance_id: control.instance_id, code: "handoff_output_missing", message: "Confirmed output roles are missing from the owning handoff.", refs: missingOutputRoles });
    }

    for (const gate of control.gates) {
      if (isGateAccepted(gate)) continue;
      const selector = `gate:${control.instance_id}/${gate.gate_id}`;
      pendingGates.push(selector);
      frontier.push({ kind: "gate", selector, instance_id: control.instance_id, local_id: gate.gate_id });
      const latest = gate.attempts.at(-1);
      if (latest?.verdict === "fail") {
        blockers.push({ instance_id: control.instance_id, code: "gate_failed", message: `Gate ${gate.gate_id} currently fails.`, refs: [selector] });
      }
    }

    for (const branchId of requiredBranchIds(index, record)) {
      if (control.decisions.some((item) => item.kind === "branch" && item.decision_id === branchId)) continue;
      if (!allGatesAccepted(control)) continue;
      const selector = `decision:${control.instance_id}/${branchId}`;
      pendingDecisions.push(selector);
      frontier.push({ kind: "decision", selector, instance_id: control.instance_id, local_id: branchId });
    }

    if (control.profile !== null && control.parent === null) {
      const transitions = eligibleProfileTransitions(index, record);
      for (const transition of transitions) {
        frontier.push({ kind: "advance", selector: `subflow:${control.instance_id}`, instance_id: control.instance_id, local_id: transition.transition_id, transition: transition.transition_id });
      }
      if (transitions.length === 0 && isSubflowCompletionReady(index, record)) {
        frontier.push({ kind: "advance", selector: `subflow:${control.instance_id}`, instance_id: control.instance_id, transition: "complete" });
      }
    } else if (isSubflowCompletionReady(index, record)) {
      frontier.push({ kind: "advance", selector: `subflow:${control.instance_id}`, instance_id: control.instance_id, transition: "complete" });
    }
  }

  return {
    frontier: deduplicateFrontier(frontier),
    blockers,
    pending_gates: [...new Set(pendingGates)],
    pending_decisions: [...new Set(pendingDecisions)],
  };
}

export function childStartCandidates(index: CurrentWorkspaceIndex): ChildStartCandidate[] {
  const candidates: ChildStartCandidate[] = [];
  for (const parent of index.subflows) {
    if (parent.control.profile === null || parent.control.parent !== null || parent.control.status !== "active") continue;
    for (const node of nodesAtCheckpoint(index, parent.control.checkpoint)) {
      const round = nextRound(index, parent, node);
      if (node.multiplicity === "repeatable" && round === undefined) continue;
      if (!dependenciesSatisfied(index, parent, node, round)) continue;
      if (!branchUnlocks(index, parent, node.node_id)) continue;
      const existing = childrenFor(index, parent.control.instance_id, node.node_id);
      if (node.multiplicity !== "repeatable" && existing.length > 0) continue;
      if (round !== undefined && existing.some((item) => item.control.round === round)) continue;
      candidates.push({ parent, node, ...(round === undefined ? {} : { round }) });
    }
  }
  return candidates;
}

export function eligibleProfileTransitions(index: CurrentWorkspaceIndex, parent: SubflowRecord): PipelineProfileTransition[] {
  if (parent.control.profile === null || parent.control.parent !== null || parent.control.status !== "active") return [];
  return index.profile.transitions.filter((transition) => {
    if (transition.from !== parent.control.checkpoint) return false;
    if (!transition.required_child_node_ids.every((nodeId) => latestCompletedChild(index, parent.control.instance_id, nodeId))) return false;
    if (!transition.required_gate_ids.every((gateId) => acceptedGateForParent(index, parent.control.instance_id, gateId))) return false;
    return transition.required_branch_ids.every((branchId) => {
      const choice = branchChoiceForParent(index, parent.control.instance_id, branchId);
      const branch = index.profile.branches.find((item) => item.decision_id === branchId);
      return Boolean(choice && branch?.options.find((item) => item.option_id === choice)?.unlocks.includes(transition.to));
    });
  });
}

export function isSubflowCompletionReady(index: CurrentWorkspaceIndex, record: SubflowRecord): boolean {
  const control = record.control;
  if (control.status !== "active" && control.status !== "blocked") return false;
  if (!allGatesAccepted(control)) return false;
  if (!control.start_confirmation.expected_outputs.every((role) => record.handoff.outputs.some((item) => item.role === role))) return false;
  if (requiredBranchIds(index, record).some((branchId) => !control.decisions.some((item) => item.kind === "branch" && item.decision_id === branchId))) return false;
  if (control.profile === null || control.parent !== null) return true;
  const finalNode = index.profile.children.find((item) => item.node_id === control.checkpoint);
  if (!finalNode) return false;
  return Boolean(latestCompletedChild(index, control.instance_id, finalNode.node_id));
}

export function isGateAccepted(gate: SubflowControl["gates"][number]): boolean {
  const latest = gate.attempts.at(-1);
  if (!latest) return false;
  if (latest.verdict === "pass" || latest.verdict === "pass_with_conditions") return true;
  return Boolean(gate.override && Date.parse(gate.override.approved_at) >= Date.parse(latest.confirmed_at));
}

function allGatesAccepted(control: SubflowControl): boolean {
  return control.gates.every(isGateAccepted);
}

function requiredBranchIds(index: CurrentWorkspaceIndex, record: SubflowRecord): string[] {
  const nodeId = record.control.parent?.node_id;
  return nodeId ? index.profile.children.find((item) => item.node_id === nodeId)?.branch_ids ?? [] : [];
}

function nodesAtCheckpoint(index: CurrentWorkspaceIndex, checkpoint: string): PipelineProfileChild[] {
  const direct = index.profile.children.filter((item) => item.node_id === checkpoint);
  const groups = index.profile.parallel_groups.filter((group) => group.group_id === checkpoint || group.child_node_ids.includes(checkpoint));
  const grouped = groups.flatMap((group) => group.child_node_ids).flatMap((nodeId) => index.profile.children.filter((item) => item.node_id === nodeId));
  return [...new Map([...direct, ...grouped].map((item) => [item.node_id, item])).values()];
}

function dependenciesSatisfied(index: CurrentWorkspaceIndex, parent: SubflowRecord, node: PipelineProfileChild, round: number | undefined): boolean {
  const pending = new Set(node.prerequisites);
  for (const group of index.profile.parallel_groups) {
    const members = group.child_node_ids.filter((item) => pending.has(item));
    if (members.length < 2) continue;
    const completed = members.filter((item) => completedChildForRound(index, parent.control.instance_id, item, round));
    if (group.join_policy === "all" ? completed.length !== members.length : completed.length === 0) return false;
    for (const member of members) pending.delete(member);
  }
  return [...pending].every((item) => completedChildForRound(index, parent.control.instance_id, item, round));
}

function completedChildForRound(index: CurrentWorkspaceIndex, parentId: string, nodeId: string, round: number | undefined): boolean {
  const node = index.profile.children.find((item) => item.node_id === nodeId);
  const children = childrenFor(index, parentId, nodeId).filter((item) => item.control.status === "complete");
  if (node?.multiplicity === "repeatable" && round !== undefined) return children.some((item) => item.control.round === round);
  return children.length > 0;
}

function branchUnlocks(index: CurrentWorkspaceIndex, parent: SubflowRecord, nodeId: string): boolean {
  const branches = index.profile.branches.filter((branch) => branch.options.some((option) => option.unlocks.includes(nodeId)));
  if (branches.length === 0) return true;
  return branches.some((branch) => {
    const choice = branchChoiceForParent(index, parent.control.instance_id, branch.decision_id);
    return branch.options.some((option) => option.option_id === choice && option.unlocks.includes(nodeId));
  });
}

function nextRound(index: CurrentWorkspaceIndex, parent: SubflowRecord, node: PipelineProfileChild): number | undefined {
  if (node.multiplicity !== "repeatable") return undefined;
  const template = index.profile.revision_round_template;
  if (node.node_id === template.review_node_id) {
    const revisions = childrenFor(index, parent.control.instance_id, template.revision_node_id)
      .filter((item) => item.control.status === "complete" && item.control.round !== undefined)
      .sort((left, right) => (right.control.round ?? 0) - (left.control.round ?? 0));
    const round = revisions[0]?.control.round;
    if (round === undefined) return undefined;
    return childrenFor(index, parent.control.instance_id, template.review_node_id).some((item) => item.control.round === round) ? undefined : round;
  }
  if (node.node_id === template.revision_node_id) {
    const reviews = childrenFor(index, parent.control.instance_id, template.review_node_id)
      .filter((item) => item.control.status === "complete" && item.control.round !== undefined)
      .sort((left, right) => (right.control.round ?? 0) - (left.control.round ?? 0));
    const latest = reviews[0];
    if (!latest) return childrenFor(index, parent.control.instance_id, node.node_id).length === 0 ? 1 : undefined;
    const choice = latest.control.decisions.find((item) => item.kind === "branch" && item.decision_id === branchForNode(index, template.review_node_id))?.choice;
    return choice === template.continue_option_id ? (latest.control.round ?? 0) + 1 : undefined;
  }
  const existing = childrenFor(index, parent.control.instance_id, node.node_id);
  if (existing.some((item) => item.control.status !== "complete" && item.control.status !== "cancelled")) return undefined;
  return Math.max(0, ...existing.map((item) => item.control.round ?? 0)) + 1;
}

function branchForNode(index: CurrentWorkspaceIndex, nodeId: string): string | undefined {
  return index.profile.branches.find((item) => item.owner_node_id === nodeId)?.decision_id;
}

function latestCompletedChild(index: CurrentWorkspaceIndex, parentId: string, nodeId: string): SubflowRecord | undefined {
  return childrenFor(index, parentId, nodeId)
    .filter((item) => item.control.status === "complete")
    .sort((left, right) => (right.control.round ?? 0) - (left.control.round ?? 0))[0];
}

function acceptedGateForParent(index: CurrentWorkspaceIndex, parentId: string, gateId: string): boolean {
  const definition = index.profile.gates.find((item) => item.gate_id === gateId);
  const owner = definition?.owner_node_id;
  if (!owner) return false;
  const child = latestCompletedChild(index, parentId, owner);
  if (!child) return false;
  const gate = child.control.gates.find((item) => item.gate_id === gateId);
  return gate ? isGateAccepted(gate) : definition.policy === "conditional";
}

function branchChoiceForParent(index: CurrentWorkspaceIndex, parentId: string, branchId: string): string | undefined {
  const owner = index.profile.branches.find((item) => item.decision_id === branchId)?.owner_node_id;
  if (!owner) return undefined;
  const child = latestCompletedChild(index, parentId, owner) ?? childrenFor(index, parentId, owner).at(-1);
  return child?.control.decisions.find((item) => item.kind === "branch" && item.decision_id === branchId)?.choice;
}

function childrenFor(index: CurrentWorkspaceIndex, parentId: string, nodeId: string): SubflowRecord[] {
  return index.subflows.filter((item) => item.control.parent?.instance_id === parentId && item.control.parent.node_id === nodeId);
}

function deduplicateFrontier(items: WorkflowFrontierItem[]): WorkflowFrontierItem[] {
  return [...new Map(items.map((item) => [JSON.stringify(item), item])).values()];
}
