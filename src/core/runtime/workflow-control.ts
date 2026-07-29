import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ARSU_ROUTING_CATALOG } from "../../arsu-converter/routing/catalog.js";
import { renderArsuArtifactContract } from "../../arsu-converter/workflow/artifact-contracts.js";
import { fileExists } from "../../utils/fs.js";
import {
  AppliedDraftArtifactRecordSchema,
  ApplyReceiptArtifactRecordSchema,
  ApplyReportArtifactRecordSchema,
  ArtifactSubmitReceiptSchema,
  SubmittedArtifactRecordSchema,
  SubmitReceiptArtifactRecordSchema,
} from "../contracts/artifact.js";
import { ActionAvailabilitySchema, type ActionAvailability } from "../contracts/case-control.js";
import { DraftPatchReceiptSchema } from "../contracts/draft-patch.js";
import { GateSubmitReceiptSchema, TransitionAdvanceReceiptSchema } from "../contracts/gate-transition.js";
import { SubflowStartReceiptSchema } from "../contracts/subflow.js";
import { resolveWorkNode, validateWorkflowDefinition, type ParallelGroupDefinition, type SubflowTemplateDefinition, type WorkflowNodeDefinition, type WorkflowNodeTemplate } from "../contracts/workflow.js";
import type { Diagnostic } from "../validation/types.js";
import { latestById, type WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";
import { isPathContained, resolveRegisteredArtifactPath } from "./artifact-path.js";
import { buildRuntimeContext } from "./runtime-context.js";

export type WorkItemState = "done" | "ready" | "blocked";

export interface MissingDependency {
  kind: "stage" | "work_item" | "subflow_node" | "contract" | "artifact_type" | "gate_type" | "gate_id" | "decision_type" | "output";
  id: string;
  reason: string;
}

export interface WorkItemStatus {
  id: string;
  selector: string;
  work_item_id: string;
  stage_id: string;
  producer_skill: string;
  state: WorkItemState;
  missing_dependencies: MissingDependency[];
  output_path: string;
  artifact_id?: string;
  unlocks: string[];
  warnings: Array<{ code: "candidate_unregistered"; path: string }>;
  instance_id?: string;
  template_id?: string;
  dispatchable: boolean;
  submission_policy: "automatic" | "manual";
  deferred_reason?: "parallel_capacity_deferred";
}

export interface SubflowControlStatus {
  id: string;
  selector: string;
  kind: "template" | "instance" | "child";
  template_id: string;
  instance_id?: string;
  route_ref: string | null;
  route_coverage: "complete" | "partial";
  state: "available" | "blocked" | "active" | "waiting" | "complete" | "failed" | "cancelled";
  parent_subflow_id?: string | null;
  parent_node_id?: string | null;
  round_number?: number | null;
  active_stage_id?: string;
  missing_dependencies: MissingDependency[];
  ready_items: string[];
}

export interface ParallelGroupStatus {
  id: string;
  selector: string;
  subflow_instance_id: string;
  state: "satisfied" | "pending";
  join_policy: "all" | "quorum";
  ready_members: string[];
  dispatchable_members: string[];
  done_members: string[];
}

export interface GateControlStatus {
  id: string;
  selector: string;
  gate_id: string;
  gate_node_id: string;
  subflow_instance_id: string;
  template_id: string;
  stage_id: string;
  gate_type: string;
  state: "blocked" | "ready" | "passed" | "failed" | "overridden";
  latest_event_id?: string;
  latest_verdict?: string;
}

export interface TransitionControlStatus {
  id: string;
  selector: string;
  transition_id: string;
  transition_node_id: string;
  subflow_instance_id: string;
  template_id: string;
  from_stage_id: string;
  state: "blocked" | "ready" | "decision_required" | "advanced";
  automatic: boolean;
  decision_point_id?: string;
  effects: Array<{ kind: "activate_stage"; stage_id: string } | { kind: "complete_subflow" } | { kind: "complete_run" }>;
  gate_event_ids: string[];
  decision_ids: string[];
}

export interface WorkflowControlResult {
  profile: string;
  state: "unconfigured" | "not_started" | "blocked" | "ready" | "stage_work_complete" | "gate_required" | "transition_ready" | "decision_required" | "complete";
  configured: boolean;
  valid: boolean;
  reason?: "workflow_nodes_missing" | "workflow_invalid";
  work_items: WorkItemStatus[];
  ready_items: string[];
  stage_work_complete: boolean;
  transition_required: boolean;
  frontier: string[];
  startable_subflows: string[];
  subflows: SubflowControlStatus[];
  parallel_groups: ParallelGroupStatus[];
  gates: GateControlStatus[];
  transitions: TransitionControlStatus[];
}

export interface ArtifactInspection {
  artifact: Record<string, unknown>;
  resolved_path?: string;
  exists: boolean;
  inside_project: boolean;
  hash_matches?: boolean;
  diagnostics: Diagnostic[];
}

export interface WorkflowInstructionPacket {
  id: string;
  selector: string;
  work_item_id: string;
  stage_id: string;
  producer_skill: string;
  state: "ready";
  instruction_basis_sha256: string;
  description: string;
  context: ReturnType<typeof buildRuntimeContext>;
  output: WorkflowNodeDefinition["output"] & { resolved_path: string };
  template: string;
  dependencies: {
    work_items: Array<{ id: string; state: WorkItemState }>;
    contracts: Array<{ path: string; absolute_path: string; available: boolean }>;
    artifacts: Array<{ artifact_type: string; available: boolean; artifact_ids: string[] }>;
    gates: Array<{ gate_type: string; satisfied: boolean }>;
    decisions: Array<{ decision_type: string; satisfied: boolean }>;
  };
  instruction: string;
  rules: string[];
  allowed_writes: WorkflowNodeDefinition["allowed_writes"];
  forbidden_writes: string[];
  validation: { profile: string; suggested_command: string };
  completion: {
    policy: WorkflowNodeDefinition["completion"];
    submit_available: boolean;
    submit?: {
      selector: string;
      candidate_path: string;
      command: string;
      semantic_input_schema_version: "2";
      input_schema: { required: string[]; optional: string[] };
      execution_policy: "direct" | "human_confirmed";
      dry_run: "optional";
      updates_state: false;
      appends_gate: false;
      appends_decision: false;
    };
  };
  unlocks: string[];
  instance_id?: string;
  template_id?: string;
  submission: {
    policy: "automatic" | "manual";
    authorization: { kind: "subflow_start"; valid: boolean; receipt_path: string; receipt_sha256: string } | null;
    requires_user_confirmation: boolean;
  };
}

export type WorkflowInstructionResult =
  | { ok: true; packet: WorkflowInstructionPacket }
  | { ok: false; code: "workflow_unconfigured" | "workflow_invalid" | "work_item_not_found" | "work_item_blocked" | "work_item_already_done" | "workflow_resource_unavailable"; item?: WorkItemStatus; details?: unknown };

export type GateTransitionInstructionResult =
  | { ok: true; packet: Record<string, unknown> }
  | { ok: false; code: "workflow_unconfigured" | "workflow_invalid" | "runtime_item_not_found" | "runtime_item_blocked" | "runtime_item_already_done"; item?: GateControlStatus | TransitionControlStatus };

export interface ResolvedTemplateReference {
  template_ref: string;
  source_path: string;
  content: string;
}

export async function inspectArtifact(snapshot: WorkspaceSnapshot, artifact: Record<string, unknown>): Promise<ArtifactInspection> {
  const diagnostics: Diagnostic[] = [];
  const declaredPath = typeof artifact.path === "string" ? artifact.path : undefined;
  if (!declaredPath) return { artifact, exists: false, inside_project: false, diagnostics };

  const resolved = resolveRegisteredArtifactPath(snapshot, declaredPath);
  const resolvedPath = resolved.absolutePath;
  if (!resolved.contained) {
    diagnostics.push({ severity: "error", code: "artifact_path_escape", message: "Artifact path escapes its runtime root.", path: declaredPath, blocking: true });
    return { artifact, resolved_path: resolvedPath, exists: false, inside_project: false, diagnostics };
  }
  if (!(await fileExists(resolvedPath))) {
    diagnostics.push({ severity: "warning", code: "artifact_missing", message: "Registered artifact is missing.", path: resolvedPath, blocking: false });
    return { artifact, resolved_path: resolvedPath, exists: false, inside_project: true, diagnostics };
  }

  const [realRoot, realArtifact] = await Promise.all([realpath(resolved.root), realpath(resolvedPath)]);
  if (!isPathContained(realRoot, realArtifact)) {
    diagnostics.push({ severity: "error", code: "artifact_path_escape", message: "Artifact symlink resolves outside its runtime root.", path: resolvedPath, blocking: true });
    return { artifact, resolved_path: resolvedPath, exists: true, inside_project: false, diagnostics };
  }

  let hashMatches: boolean | undefined;
  if (typeof artifact.sha256 === "string") {
    hashMatches = sha256(await readFile(resolvedPath)) === artifact.sha256;
    if (!hashMatches) diagnostics.push({ severity: "error", code: "artifact_hash_mismatch", message: "Artifact hash does not match the registry.", path: resolvedPath, blocking: true });
  }
  return { artifact, resolved_path: resolvedPath, exists: true, inside_project: true, hash_matches: hashMatches, diagnostics };
}

export async function inspectArtifacts(snapshot: WorkspaceSnapshot): Promise<ArtifactInspection[]> {
  return Promise.all(snapshot.artifacts.map((artifact) => inspectArtifact(snapshot, artifact)));
}

export function passedCompletionGateIds(snapshot: WorkspaceSnapshot): Set<string> {
  return eventFacts(snapshot).passedGateIds;
}

export async function evaluateWorkflowControl(snapshot: WorkspaceSnapshot): Promise<WorkflowControlResult> {
  const workflow = snapshot.workflow;
  const profile = typeof snapshot.config.profile === "string" ? snapshot.config.profile : "unknown";
  const empty = (state: WorkflowControlResult["state"], configured: boolean, valid: boolean, reason?: WorkflowControlResult["reason"]): WorkflowControlResult => ({ profile, state, configured, valid, ...(reason ? { reason } : {}), work_items: [], ready_items: [], stage_work_complete: false, transition_required: false, frontier: [], startable_subflows: [], subflows: [], parallel_groups: [], gates: [], transitions: [] });
  if (!workflow) return empty("unconfigured", false, true, "workflow_nodes_missing");
  if (validateWorkflowDefinition(workflow).length > 0) return empty("blocked", true, false, "workflow_invalid");
  if (!snapshot.runState) return empty("blocked", true, false, "workflow_invalid");
  return evaluateInstanceWorkflow(snapshot, workflow.subflow_templates, profile);
}

export function evaluateStartActionAvailability(snapshot: WorkspaceSnapshot, control: WorkflowControlResult, selector: string): ActionAvailability {
  return startActionAvailability(snapshot, control.subflows, selector);
}

async function evaluateInstanceWorkflow(snapshot: WorkspaceSnapshot, templates: SubflowTemplateDefinition[], profile: string): Promise<WorkflowControlResult> {
  if (!snapshot.runState) throw new Error("Workflow requires run state.");
  const inspections = await inspectArtifacts(snapshot);
  const facts = eventFacts(snapshot);
  const trustedGates = await trustedGateEvents(snapshot);
  const latestTrustedGates = new Map(latestById(trustedGates, "gate_id").map((event) => [String(event.gate_id), event]));
  const templateStatuses = templates.filter((template) => template.visibility !== "internal").map((template): SubflowControlStatus => {
    const missing = templateStartProblems(snapshot, template, inspections);
    return {
      id: template.template_id, selector: `subflow:${template.template_id}`, kind: "template", template_id: template.template_id,
      route_ref: template.route_ref, route_coverage: template.route_coverage, state: missing.length ? "blocked" : "available",
      missing_dependencies: missing, ready_items: [],
    };
  });
  const allWork: WorkItemStatus[] = [];
  const allGroups: ParallelGroupStatus[] = [];
  const allGates: GateControlStatus[] = [];
  const allTransitions: TransitionControlStatus[] = [];
  const instanceStatuses: SubflowControlStatus[] = [];
  const instanceCompletion: boolean[] = [];

  for (const instance of snapshot.runState.subflows) {
    const template = templates.find((item) => item.template_id === instance.template_id);
    if (!template) {
      instanceStatuses.push({ id: instance.instance_id, selector: `subflow:${instance.instance_id}`, kind: "instance", template_id: instance.template_id, instance_id: instance.instance_id, route_ref: instance.route_ref, route_coverage: "partial", state: "blocked", parent_subflow_id: instance.parent_subflow_id, round_number: instance.round_number, active_stage_id: instance.active_stage_id, missing_dependencies: [{ kind: "output", id: instance.template_id, reason: "subflow_template_missing" }], ready_items: [] });
      instanceCompletion.push(false);
      continue;
    }
    const nodes = template.work_items.map((item) => ({ template: item, node: resolveWorkNode(item, instance.instance_id, instance.round_number) }));
    const byId = new Map(nodes.map((item) => [item.node.id, item]));
    const groupsById = new Map(template.parallel_groups.map((item) => [item.id, item]));
    const unlocks = new Map<string, string[]>();
    for (const { node } of nodes) for (const dependency of node.requires.work_items) unlocks.set(dependency, [...(unlocks.get(dependency) ?? []), node.id]);
    const memo = new Map<string, Promise<WorkItemStatus>>();
    const groupMemo = new Map<string, Promise<boolean>>();

    const evaluateGroup = (group: ParallelGroupDefinition): Promise<boolean> => {
      const existing = groupMemo.get(group.id);
      if (existing) return existing;
      const pending = (async () => {
        const statuses = await Promise.all(group.members.map((member) => evaluateNode(member.work_item_id)));
        const done = statuses.filter((item) => item.state === "done").length;
        return group.join.policy === "quorum"
          ? done >= group.join.required_count
          : group.members.filter((item) => item.required).every((member) => statuses.find((item) => item.work_item_id === member.work_item_id)?.state === "done");
      })();
      groupMemo.set(group.id, pending);
      return pending;
    };
    const evaluateNode = (id: string): Promise<WorkItemStatus> => {
      const existing = memo.get(id);
      if (existing) return existing;
      const pending = (async (): Promise<WorkItemStatus> => {
        const entry = byId.get(id);
        if (!entry) throw new Error(`Missing instance work item: ${id}`);
        const { node, template: nodeTemplate } = entry;
        const selector = `work:${instance.instance_id}/${node.id}`;
        const outputPath = path.resolve(snapshot.workspace, node.output.workspace_path);
        const candidates = inspections.filter((inspection) => inspection.artifact.work_item_id === node.id && inspection.artifact.subflow_instance_id === instance.instance_id);
        const candidate = candidates[candidates.length - 1];
        if (candidate) {
          const problems = await completionProblems(snapshot, node, candidate, facts, inspections, { instanceId: instance.instance_id, selector, requireStartAuthorization: nodeTemplate.submission.policy === "automatic" });
          return { id: `${instance.instance_id}/${node.id}`, selector, work_item_id: node.id, instance_id: instance.instance_id, template_id: template.template_id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: problems.length ? "blocked" : "done", missing_dependencies: problems, output_path: outputPath, artifact_id: stringValue(candidate.artifact.artifact_id), unlocks: (unlocks.get(node.id) ?? []).map((item) => `work:${instance.instance_id}/${item}`), warnings: [], dispatchable: false, submission_policy: nodeTemplate.submission.policy };
        }
        const missing: MissingDependency[] = [];
        if (instance.status !== "active") missing.push({ kind: "stage", id: instance.status, reason: "subflow_inactive" });
        if (instance.active_stage_id !== node.stage_id) missing.push({ kind: "stage", id: node.stage_id, reason: "inactive_stage" });
        for (const dependencyId of node.requires.work_items) if ((await evaluateNode(dependencyId)).state !== "done") missing.push({ kind: "work_item", id: dependencyId, reason: "work_item_not_done" });
        for (const groupId of node.requires.parallel_groups) {
          const group = groupsById.get(groupId);
          if (!group || !(await evaluateGroup(group))) missing.push({ kind: "work_item", id: groupId, reason: "parallel_join_not_satisfied" });
        }
        addExternalDependencyProblems(snapshot, node, inspections, facts, missing);
        const warnings: WorkItemStatus["warnings"] = await fileExists(outputPath) ? [{ code: "candidate_unregistered", path: outputPath }] : [];
        return { id: `${instance.instance_id}/${node.id}`, selector, work_item_id: node.id, instance_id: instance.instance_id, template_id: template.template_id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: missing.length ? "blocked" : "ready", missing_dependencies: missing, output_path: outputPath, unlocks: (unlocks.get(node.id) ?? []).map((item) => `work:${instance.instance_id}/${item}`), warnings, dispatchable: missing.length === 0, submission_policy: nodeTemplate.submission.policy };
      })();
      memo.set(id, pending);
      return pending;
    };

    const workStatuses = await Promise.all(nodes.map((item) => evaluateNode(item.node.id)));
    const groupStatuses: ParallelGroupStatus[] = [];
    for (const group of template.parallel_groups) {
      const memberStatuses = group.members.map((member) => workStatuses.find((item) => item.work_item_id === member.work_item_id)).filter((item): item is WorkItemStatus => Boolean(item));
      const ready = memberStatuses.filter((item) => item.state === "ready");
      const dispatchable = ready.slice(0, group.max_concurrency);
      for (const item of ready.slice(group.max_concurrency)) { item.dispatchable = false; item.deferred_reason = "parallel_capacity_deferred"; }
      groupStatuses.push({ id: group.id, selector: `parallel:${instance.instance_id}/${group.id}`, subflow_instance_id: instance.instance_id, state: await evaluateGroup(group) ? "satisfied" : "pending", join_policy: group.join.policy, ready_members: ready.map((item) => item.selector), dispatchable_members: dispatchable.map((item) => item.selector), done_members: memberStatuses.filter((item) => item.state === "done").map((item) => item.selector) });
    }
    const groupedIds = new Set(template.parallel_groups.flatMap((group) => group.members.map((item) => item.work_item_id)));
    const groupsSatisfied = groupStatuses.every((item) => item.state === "satisfied");
    const ungroupedDone = workStatuses.filter((item) => !groupedIds.has(item.work_item_id) && item.stage_id === instance.active_stage_id).every((item) => item.state === "done");
    const childStatuses = await evaluateChildNodes(snapshot, templates, instance, template);
    const activeChildStatuses = childStatuses.filter((item) => (template.subflow_nodes ?? []).find((node) => node.id === item.parent_node_id)?.stage_id === instance.active_stage_id);
    const childGroups = (template.subflow_parallel_groups ?? []).filter((group) => group.members.some((member) => activeChildStatuses.some((item) => item.parent_node_id === member.subflow_node_id)));
    const groupedChildIds = new Set(childGroups.flatMap((group) => group.members.map((item) => item.subflow_node_id)));
    const childGroupStatuses: ParallelGroupStatus[] = childGroups.map((group) => {
      const members = group.members.map((member) => activeChildStatuses.find((item) => item.parent_node_id === member.subflow_node_id)).filter((item): item is SubflowControlStatus => Boolean(item));
      const done = members.filter((item) => item.state === "complete");
      const satisfied = group.join.policy === "quorum" ? done.length >= group.join.required_count : group.members.filter((item) => item.required).every((member) => members.some((item) => item.parent_node_id === member.subflow_node_id && item.state === "complete"));
      const ready = members.filter((item) => item.state === "available");
      return { id: group.id, selector: `subflow-parallel:${instance.instance_id}/${group.id}`, subflow_instance_id: instance.instance_id, state: satisfied ? "satisfied" : "pending", join_policy: group.join.policy, ready_members: ready.map((item) => item.selector), dispatchable_members: ready.slice(0, group.max_concurrency).map((item) => item.selector), done_members: done.map((item) => item.selector) };
    });
    const stageWork = workStatuses.filter((item) => item.stage_id === instance.active_stage_id);
    const workSatisfied = stageWork.length === 0 || (groupsSatisfied && ungroupedDone);
    const childGroupsSatisfied = childGroupStatuses.every((item) => item.state === "satisfied");
    const ungroupedChildrenDone = activeChildStatuses.filter((item) => !groupedChildIds.has(item.parent_node_id ?? "")).every((item) => item.state === "complete");
    const childSatisfied = activeChildStatuses.length === 0 || (childGroupsSatisfied && ungroupedChildrenDone);
    const transitionOnlyStage = stageWork.length === 0 && activeChildStatuses.length === 0 && template.transitions.some((transition) => transition.from_stage_id === instance.active_stage_id);
    const complete = transitionOnlyStage || ((stageWork.length > 0 || activeChildStatuses.length > 0) && workSatisfied && childSatisfied);
    const readyItems = workStatuses.filter((item) => item.state === "ready" && item.dispatchable).map((item) => item.selector);
    const gateStatuses = template.gates.filter((gate) => gate.stage_id === instance.active_stage_id).map((gate): GateControlStatus => {
      const gateId = `${instance.instance_id}/${gate.id}`;
      const event = latestTrustedGates.get(gateId);
      const overridden = event ? hasTrustedGateOverride(snapshot, gateId, String(event.event_id)) : false;
      const state: GateControlStatus["state"] = !complete || instance.status !== "active" ? "blocked"
        : !event ? "ready"
          : event.verdict === "pass" || event.verdict === "pass_with_conditions" ? "passed"
            : overridden ? "overridden" : "failed";
      return { id: gateId, selector: `gate:${gateId}`, gate_id: gateId, gate_node_id: gate.id, subflow_instance_id: instance.instance_id, template_id: template.template_id, stage_id: gate.stage_id, gate_type: gate.gate_type, state, ...(event ? { latest_event_id: String(event.event_id), latest_verdict: String(event.verdict) } : {}) };
    });
    const gateByNode = new Map(gateStatuses.map((gate) => [gate.gate_node_id, gate]));
    const stageTransitions = template.transitions.filter((transition) => transition.from_stage_id === instance.active_stage_id);
    const advancedIds = new Set(instance.transition_receipts.map((receipt) => receipt.transition_id));
    const baseCandidates = stageTransitions.filter((transition) => complete && transition.requires.gate_ids.every((id) => ["passed", "overridden"].includes(gateByNode.get(id)?.state ?? ""))
      && (transition.requires.artifact_types ?? []).every((artifactType) => inspections.some((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection)))
      && transition.requires.decision_types.filter((type) => type !== "workflow_branch").every((type) => facts.acceptedDecisionTypes.has(type)));
    const branchDecisions = latestById(snapshot.decisions.filter((decision) => decision.decision_type === "workflow_branch" && decision.status === "accepted" && decision.subflow_instance_id === instance.instance_id), "decision_point_id");
    const selectedTransitionIds = new Set(branchDecisions.map((decision) => String(decision.transition_id)));
    const ambiguous = baseCandidates.length > 1;
    const transitionStatuses = stageTransitions.map((transition): TransitionControlStatus => {
      const transitionId = `${instance.instance_id}/${transition.id}`;
      const decisionPointId = transition.branch ? `${instance.instance_id}/${transition.branch.decision_point_id}` : ambiguous ? `${instance.instance_id}/${instance.active_stage_id}` : undefined;
      const gateEventIds = transition.requires.gate_ids.map((id) => gateByNode.get(id)?.latest_event_id).filter((id): id is string => Boolean(id));
      const matchingDecision = branchDecisions.find((decision) => decision.transition_id === transitionId);
      const decisionIds = matchingDecision && typeof matchingDecision.decision_id === "string" ? [matchingDecision.decision_id] : [];
      const baseEligible = baseCandidates.includes(transition);
      const decisionPointResolved = decisionPointId ? branchDecisions.some((decision) => decision.decision_point_id === decisionPointId) : false;
      const decisionRequired = baseEligible && (ambiguous || transition.branch !== null) && !decisionPointResolved;
      const state: TransitionControlStatus["state"] = advancedIds.has(transitionId) ? "advanced"
        : !baseEligible || instance.status !== "active" || (decisionPointResolved && !selectedTransitionIds.has(transitionId)) ? "blocked"
          : decisionRequired ? "decision_required" : "ready";
      return {
        id: transitionId, selector: `transition:${transitionId}`, transition_id: transitionId, transition_node_id: transition.id,
        subflow_instance_id: instance.instance_id, template_id: template.template_id, from_stage_id: transition.from_stage_id,
        state, automatic: state === "ready" && transition.branch === null && !ambiguous,
        ...(decisionPointId ? { decision_point_id: decisionPointId } : {}),
        effects: transition.effects, gate_event_ids: gateEventIds, decision_ids: decisionIds,
      };
    });
    instanceCompletion.push(complete);
    allWork.push(...workStatuses);
    allGroups.push(...groupStatuses, ...childGroupStatuses);
    allGates.push(...gateStatuses);
    allTransitions.push(...transitionStatuses);
    instanceStatuses.push({ id: instance.instance_id, selector: `subflow:${instance.instance_id}`, kind: "instance", template_id: template.template_id, instance_id: instance.instance_id, route_ref: instance.route_ref, route_coverage: template.route_coverage, state: instance.status, parent_subflow_id: instance.parent_subflow_id, round_number: instance.round_number, active_stage_id: instance.active_stage_id, missing_dependencies: [], ready_items: readyItems });
    instanceStatuses.push(...childStatuses);
  }

  const subflowStatuses = [...templateStatuses, ...instanceStatuses];
  const startAvailabilities = subflowStatuses
    .filter((item) => item.kind === "template" || item.kind === "child")
    .map((item) => startActionAvailability(snapshot, subflowStatuses, item.selector));
  const startable = startAvailabilities
    .filter((item) => item.disposition !== "blocked")
    .map((item) => item.selector);
  const terminallyBlockedStarts = new Set(startAvailabilities
    .filter((item) => item.reason_code === "run_terminal")
    .map((item) => item.selector));
  const projectedSubflowStatuses = subflowStatuses.map((item): SubflowControlStatus =>
    terminallyBlockedStarts.has(item.selector) ? { ...item, state: "blocked" } : item
  );
  const readyItems = allWork.filter((item) => item.state === "ready" && item.dispatchable).map((item) => item.selector);
  const stageWorkComplete = instanceCompletion.length > 0 && instanceCompletion.every(Boolean);
  const readyGates = allGates.filter((gate) => gate.state === "ready").map((gate) => gate.selector);
  const readyTransitions = allTransitions.filter((transition) => transition.state === "ready").map((transition) => transition.selector);
  const decisionTransitions = allTransitions.filter((transition) => transition.state === "decision_required").map((transition) => transition.selector);
  const hasActiveInstance = snapshot.runState.subflows.some((instance) => instance.status === "active");
  const state: WorkflowControlResult["state"] = snapshot.runState.status === "complete" ? "complete"
    : decisionTransitions.length ? "decision_required"
      : readyGates.length ? "gate_required"
        : readyTransitions.length ? "transition_ready"
          : hasActiveInstance && stageWorkComplete ? "stage_work_complete"
            : readyItems.length ? "ready"
              : snapshot.runState.subflows.length === 0 ? "not_started"
                : startable.length ? "ready" : "blocked";
  return { profile, state, configured: true, valid: true, work_items: allWork, ready_items: readyItems, stage_work_complete: stageWorkComplete, transition_required: readyTransitions.length > 0 || decisionTransitions.length > 0, frontier: [...startable, ...readyItems, ...readyGates, ...readyTransitions, ...decisionTransitions], startable_subflows: startable, subflows: projectedSubflowStatuses, parallel_groups: allGroups, gates: allGates, transitions: allTransitions };
}

function startActionAvailability(snapshot: WorkspaceSnapshot, subflows: SubflowControlStatus[], selector: string): ActionAvailability {
  const candidate = subflows.find((item) => item.selector === selector && (item.kind === "template" || item.kind === "child"));
  const terminal = snapshot.runState && ["complete", "failed", "cancelled"].includes(snapshot.runState.status);
  const disposition = !snapshot.runState || terminal || candidate?.state !== "available" ? "blocked" as const : "allowed" as const;
  const reasonCode = !snapshot.runState ? "workflow_unconfigured"
    : terminal ? "run_terminal"
      : candidate?.state === "available" ? "start_allowed" : "subflow_blocked";
  const blockingRefs = terminal
    ? [`run:${snapshot.runState?.run_id ?? "unknown"}`]
    : candidate?.missing_dependencies.map((item) => `${item.kind}:${item.id}`) ?? [selector];
  const expiresWhen = [
    "specs/workflow.yaml",
    "runs/current/state.yaml",
    "runs/current/artifact-registry.json",
    "runs/current/gate-ledger.jsonl",
    "runs/current/decision-ledger.jsonl",
  ].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    return file ? [{ path: relativePath, sha256: file.hash }] : [];
  });
  return ActionAvailabilitySchema.parse({
    selector,
    disposition,
    reason_code: reasonCode,
    obligation_scope: [],
    blocking_refs: blockingRefs,
    basis_sha256: sha256(`${JSON.stringify({
      selector,
      run_status: snapshot.runState?.status ?? null,
      candidate_state: candidate?.state ?? null,
      blocking_refs: blockingRefs,
      expires_when: expiresWhen,
    })}\n`),
    expires_when: expiresWhen,
  });
}

async function evaluateChildNodes(snapshot: WorkspaceSnapshot, templates: SubflowTemplateDefinition[], parent: import("../contracts/run-state.js").SubflowInstanceState, template: SubflowTemplateDefinition): Promise<SubflowControlStatus[]> {
  const nodes = template.subflow_nodes ?? [];
  const memo = new Map<string, Promise<SubflowControlStatus>>();
  const evaluate = (nodeId: string): Promise<SubflowControlStatus> => {
    const existing = memo.get(nodeId);
    if (existing) return existing;
    const pending = (async (): Promise<SubflowControlStatus> => {
      const node = nodes.find((item) => item.id === nodeId);
      if (!node) throw new Error(`Missing child node: ${nodeId}`);
      const childTemplate = templates.find((item) => item.template_id === node.template_id);
      if (!childTemplate) throw new Error(`Missing child template: ${node.template_id}`);
      const selector = `subflow:${parent.instance_id}/${node.id}`;
      const missing: MissingDependency[] = [];
      if (parent.status !== "active") missing.push({ kind: "stage", id: parent.status, reason: "subflow_inactive" });
      if (parent.active_stage_id !== node.stage_id) missing.push({ kind: "stage", id: node.stage_id, reason: "inactive_stage" });
      for (const dependencyId of node.depends_on) if ((await evaluate(dependencyId)).state !== "complete") missing.push({ kind: "subflow_node", id: dependencyId, reason: "child_subflow_not_complete" });
      const children = snapshot.runState ? snapshot.runState.subflows
        .filter((item) => item.parent_subflow_id === parent.instance_id && (item.parent_node_id ?? null) === node.id && item.template_id === node.template_id)
        .sort((left, right) => (left.round_number ?? 0) - (right.round_number ?? 0) || left.started_at.localeCompare(right.started_at)) : [];
      const trusted: typeof children = [];
      for (const child of children) if (await trustedChildStartReceipt(snapshot, child, parent.instance_id, node.id)) trusted.push(child);
      if (children.length !== trusted.length) missing.push({ kind: "subflow_node", id: node.id, reason: "child_start_receipt_untrusted" });
      const latest = trusted.at(-1);
      let state: SubflowControlStatus["state"] = missing.length ? "blocked" : "available";
      let roundNumber: number | null = node.multiplicity === "next_round" ? (latest?.round_number ?? 0) + 1 : parent.round_number;
      if (latest && ["active", "waiting", "blocked"].includes(latest.status)) { state = latest.status; roundNumber = latest.round_number; }
      else if (latest && ["failed", "cancelled"].includes(latest.status)) { state = latest.status; roundNumber = latest.round_number; }
      else if (latest?.status === "complete") {
        const outcome = node.multiplicity === "next_round" ? await trustedRoundOutcome(snapshot, latest) : "accepted";
        if (node.multiplicity === "next_round" && outcome === "revision") { state = missing.length ? "blocked" : "available"; roundNumber = (latest.round_number ?? 0) + 1; }
        else if (outcome === "accepted") { state = "complete"; roundNumber = latest.round_number; }
        else { state = "blocked"; missing.push({ kind: "subflow_node", id: node.id, reason: "round_outcome_untrusted" }); }
      }
      if (node.multiplicity === "once" && trusted.length > 1) { state = "blocked"; missing.push({ kind: "subflow_node", id: node.id, reason: "duplicate_child_instance" }); }
      return { id: `${parent.instance_id}/${node.id}`, selector, kind: "child", template_id: node.template_id, route_ref: childTemplate.route_ref, route_coverage: childTemplate.route_coverage, state, parent_subflow_id: parent.instance_id, parent_node_id: node.id, round_number: roundNumber, missing_dependencies: missing, ready_items: [] };
    })();
    memo.set(nodeId, pending);
    return pending;
  };
  return Promise.all(nodes.map((node) => evaluate(node.id)));
}

async function trustedChildStartReceipt(snapshot: WorkspaceSnapshot, child: import("../contracts/run-state.js").SubflowInstanceState, parentId: string, nodeId: string): Promise<boolean> {
  try {
    const receiptPath = path.resolve(snapshot.workspace, child.start_receipt.path);
    const bytes = await readFile(receiptPath);
    const receipt = SubflowStartReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    return sha256(bytes) === child.start_receipt.sha256 && receipt.plan_sha256 === child.start_receipt.plan_sha256 && receipt.instance_id === child.instance_id
      && receipt.parent_subflow_id === parentId && (receipt.parent_node_id ?? null) === nodeId && receipt.template_id === child.template_id;
  } catch { return false; }
}

async function trustedRoundOutcome(snapshot: WorkspaceSnapshot, instance: import("../contracts/run-state.js").SubflowInstanceState): Promise<"accepted" | "revision" | undefined> {
  for (const reference of [...instance.transition_receipts].reverse()) {
    if (!reference.transition_id.endsWith("/revise-round") && !reference.transition_id.endsWith("/accept-round")) continue;
    try {
      const bytes = await readFile(path.resolve(snapshot.workspace, reference.path));
      const receipt = TransitionAdvanceReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      const decisionsTrusted = receipt.decision_ids.every((decisionId) => snapshot.decisions.some((decision) => decision.decision_id === decisionId && decision.status === "accepted" && decision.subflow_instance_id === instance.instance_id && decision.transition_id === reference.transition_id));
      if (sha256(bytes) !== reference.sha256 || receipt.plan_sha256 !== reference.plan_sha256 || receipt.transition_id !== reference.transition_id || receipt.subflow_instance_id !== instance.instance_id || !decisionsTrusted) continue;
      return reference.transition_id.endsWith("/revise-round") ? "revision" : "accepted";
    } catch { return undefined; }
  }
  return undefined;
}

function templateStartProblems(snapshot: WorkspaceSnapshot, template: SubflowTemplateDefinition, inspections: ArtifactInspection[]): MissingDependency[] {
  if (template.route_ref === null) return [{ kind: "output", id: template.template_id, reason: "internal_subflow_requires_parent" }];
  const route = getRouteDefinition(template.route_ref);
  const problems: MissingDependency[] = [];
  for (const group of route.prerequisite_groups) {
    const deterministicallyAvailable = group.requirements.some((requirement) => requirement.kind === "user_input")
      || (group.operator === "all_of"
        ? group.requirements.every((requirement) => requirementAvailable(snapshot, inspections, requirement))
        : group.requirements.some((requirement) => requirementAvailable(snapshot, inspections, requirement)));
    if (!deterministicallyAvailable) problems.push({ kind: "output", id: group.fallback_route_refs.join(",") || template.route_ref, reason: "subflow_prerequisite_missing" });
  }
  return problems;
}

function requirementAvailable(snapshot: WorkspaceSnapshot, inspections: ArtifactInspection[], requirement: { kind: string; id: string }): boolean {
  if (requirement.kind === "user_input") return false;
  if (requirement.kind === "contract") return snapshot.files.has(requirement.id) && !snapshot.diagnostics.some((item) => item.blocking && item.path === snapshot.files.get(requirement.id)?.absolutePath);
  return inspections.some((item) => item.artifact.artifact_type === requirement.id && isTrustedInspection(item));
}

function getRouteDefinition(routeRef: string) {
  const route = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes).find((item) => item.route_ref === routeRef);
  if (!route) throw new Error(`Unknown ARSU route: ${routeRef}`);
  return route;
}

function addExternalDependencyProblems(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, inspections: ArtifactInspection[], facts: EventFacts, missing: MissingDependency[]): void {
  for (const contractPath of node.requires.contracts) {
    const file = snapshot.files.get(contractPath);
    const invalid = file && snapshot.diagnostics.some((diagnostic) => diagnostic.blocking && diagnostic.path === file.absolutePath);
    if (!file || invalid) missing.push({ kind: "contract", id: contractPath, reason: file ? "contract_invalid" : "contract_missing" });
  }
  for (const artifactType of node.requires.artifact_types) if (!inspections.some((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection))) missing.push({ kind: "artifact_type", id: artifactType, reason: "artifact_unavailable" });
  for (const gateType of node.requires.gate_types) if (!facts.passedGateTypes.has(gateType)) missing.push({ kind: "gate_type", id: gateType, reason: "gate_not_passed" });
  for (const decisionType of node.requires.decision_types) if (!facts.acceptedDecisionTypes.has(decisionType)) missing.push({ kind: "decision_type", id: decisionType, reason: "decision_not_accepted" });
}

export async function buildWorkflowInstructions(snapshot: WorkspaceSnapshot, selectorOrId: string): Promise<WorkflowInstructionResult> {
  const control = await evaluateWorkflowControl(snapshot);
  if (!control.configured) return { ok: false, code: "workflow_unconfigured" };
  if (!control.valid || !snapshot.workflow) return { ok: false, code: "workflow_invalid" };
  const selector = selectorOrId.startsWith("work:") ? selectorOrId : `work:${selectorOrId}`;
  const status = control.work_items.find((item) => item.selector === selector || item.id === selectorOrId);
  let node: WorkflowNodeDefinition | undefined;
  let nodeTemplate: WorkflowNodeTemplate | undefined;
  if (status?.instance_id && status.template_id) {
    const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === status.template_id);
    nodeTemplate = template?.work_items.find((item) => item.id === status.work_item_id);
    const instance = snapshot.runState?.subflows.find((item) => item.instance_id === status.instance_id);
    if (nodeTemplate && instance) node = resolveWorkNode(nodeTemplate, instance.instance_id, instance.round_number);
  }
  if (!status || !node) return { ok: false, code: "work_item_not_found" };
  if (status.state === "blocked") return { ok: false, code: "work_item_blocked", item: status };
  if (!status.dispatchable) return { ok: false, code: "work_item_blocked", item: status };
  if (status.state === "done") return { ok: false, code: "work_item_already_done", item: status };

  const controlById = new Map(control.work_items.map((item) => [item.id, item]));
  const inspections = await inspectArtifacts(snapshot);
  const facts = eventFacts(snapshot);
  let template: ResolvedTemplateReference;
  try {
    template = await resolveTemplateReference(node.output.template_ref);
  } catch (error) {
    return { ok: false, code: "workflow_resource_unavailable", item: status, details: { template_ref: node.output.template_ref, message: error instanceof Error ? error.message : String(error) } };
  }
  const runtimeContext = buildRuntimeContext(snapshot, status.instance_id);
  return {
    ok: true,
    packet: {
      id: status.id,
      selector: status.selector,
      work_item_id: status.work_item_id,
      stage_id: status.stage_id,
      producer_skill: status.producer_skill,
      state: "ready",
      instruction_basis_sha256: runtimeInstructionBasis(snapshot, status.selector, { status, node, runtimeContext }),
      description: node.description,
      context: runtimeContext,
      output: { ...node.output, resolved_path: status.output_path },
      template: template.content,
      dependencies: {
        work_items: node.requires.work_items.map((id) => ({ id, state: controlById.get(id)?.state ?? "blocked" })),
        contracts: node.requires.contracts.map((contractPath) => ({ path: contractPath, absolute_path: path.resolve(snapshot.workspace, contractPath), available: snapshot.files.has(contractPath) })),
        artifacts: node.requires.artifact_types.map((artifactType) => ({ artifact_type: artifactType, available: inspections.some((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection)), artifact_ids: inspections.filter((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection)).map((inspection) => String(inspection.artifact.artifact_id)) })),
        gates: node.requires.gate_types.map((gateType) => ({ gate_type: gateType, satisfied: facts.passedGateTypes.has(gateType) })),
        decisions: node.requires.decision_types.map((decisionType) => ({ decision_type: decisionType, satisfied: facts.acceptedDecisionTypes.has(decisionType) })),
      },
      instruction: node.instruction,
      rules: node.rules,
      allowed_writes: node.allowed_writes,
      forbidden_writes: ["specs/*", "runs/current/state.yaml", "runs/current/artifact-registry.json", "runs/current/decision-ledger.jsonl", "runs/current/gate-ledger.jsonl"],
      validation: { profile: node.validation_profile, suggested_command: "researchspec check artifacts --json" },
      completion: submitCapability(node, status),
      unlocks: status.unlocks,
      ...(status.instance_id ? { instance_id: status.instance_id } : {}),
      ...(status.template_id ? { template_id: status.template_id } : {}),
      submission: await submissionPacket(snapshot, status, nodeTemplate),
    },
  };
}

export async function buildGateTransitionInstructions(snapshot: WorkspaceSnapshot, selector: string): Promise<GateTransitionInstructionResult> {
  const control = await evaluateWorkflowControl(snapshot);
  if (!control.configured) return { ok: false, code: "workflow_unconfigured" };
  if (!control.valid || !snapshot.workflow || !snapshot.runState) return { ok: false, code: "workflow_invalid" };
  if (selector.startsWith("gate:")) {
    const status = control.gates.find((item) => item.selector === selector);
    if (!status) return { ok: false, code: "runtime_item_not_found" };
    if (status.state === "passed" || status.state === "overridden") return { ok: false, code: "runtime_item_already_done", item: status };
    if (status.state === "blocked") return { ok: false, code: "runtime_item_blocked", item: status };
    const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === status.template_id);
    const gate = template?.gates.find((item) => item.id === status.gate_node_id);
    if (!gate) return { ok: false, code: "runtime_item_not_found", item: status };
    const artifactEvidence: Array<Record<string, unknown>> = gate.validator.evidence.artifact_types.flatMap((artifactType) => snapshot.artifacts
      .filter((artifact) => artifact.artifact_type === artifactType && typeof artifact.artifact_id === "string" && typeof artifact.sha256 === "string")
      .map((artifact) => ({ kind: "artifact", artifact_id: artifact.artifact_id, sha256: artifact.sha256 })));
    const contractEvidence: Array<Record<string, unknown>> = gate.validator.evidence.contracts.map((contractPath) => ({ kind: "contract", path: contractPath, sha256: snapshot.files.get(contractPath)?.hash ?? "" })).filter((item) => item.sha256);
    const evidence = [...artifactEvidence, ...contractEvidence];
    const runtimeContext = buildRuntimeContext(snapshot, status.subflow_instance_id);
    const instructionBasis = runtimeInstructionBasis(snapshot, selector, { gate, status, evidence, runtimeContext });
    return { ok: true, packet: {
      kind: "gate", selector, state: status.state, instance_id: status.subflow_instance_id, template_id: status.template_id,
      gate: { id: status.gate_node_id, gate_type: gate.gate_type, stage_id: gate.stage_id, title: gate.title, risk_level: gate.risk_level, blocking: gate.blocking },
      validator: gate.validator, evidence, runtime_context: runtimeContext, latest_attempt: status.latest_event_id ? { event_id: status.latest_event_id, verdict: status.latest_verdict } : null,
      instruction_basis_sha256: instructionBasis, confirmation: { required: true, actor_kind: "human", delegated_by_start: false, yes_is_not_confirmation: true },
      submit: { available: true, command: `researchspec submit ${selector} --input <verdict.json> --actor-kind validator --actor-name <name> --confirmed-by <human> --dry-run --json`, expected_plan_required_for_noninteractive_execution: true },
    } };
  }
  const status = control.transitions.find((item) => item.selector === selector);
  if (!status) return { ok: false, code: "runtime_item_not_found" };
  if (status.state === "advanced") return { ok: false, code: "runtime_item_already_done", item: status };
  if (status.state === "blocked") return { ok: false, code: "runtime_item_blocked", item: status };
  const instructionBasis = runtimeInstructionBasis(snapshot, selector, status);
  return { ok: true, packet: {
    kind: "transition", selector, state: status.state, instance_id: status.subflow_instance_id, template_id: status.template_id,
    from_stage_id: status.from_stage_id, effects: status.effects, gate_event_ids: status.gate_event_ids, decision_ids: status.decision_ids,
    decision_point_id: status.decision_point_id ?? null, automatic: status.automatic, instruction_basis_sha256: instructionBasis,
    advance: { available: status.state === "ready", command: `researchspec advance ${selector} --actor-kind agent --actor-name <name> --dry-run --json`, expected_plan_required_for_noninteractive_execution: true },
  } };
}

export function runtimeInstructionBasis(snapshot: WorkspaceSnapshot, selector: string, facts: unknown): string {
  const basis = {
    selector,
    workflow_sha256: snapshot.files.get("specs/workflow.yaml")?.hash,
    state_sha256: snapshot.files.get("runs/current/state.yaml")?.hash,
    artifact_registry_sha256: snapshot.files.get("runs/current/artifact-registry.json")?.hash,
    gate_ledger_sha256: snapshot.files.get("runs/current/gate-ledger.jsonl")?.hash,
    decision_ledger_sha256: snapshot.files.get("runs/current/decision-ledger.jsonl")?.hash,
    facts,
  };
  return sha256(JSON.stringify(basis));
}

export async function resolveTemplateReference(templateRef: string): Promise<ResolvedTemplateReference> {
  const artifactMatch = /^arsu-artifact:([a-z0-9][a-z0-9_-]*)$/.exec(templateRef);
  if (artifactMatch?.[1]) return { template_ref: templateRef, source_path: "src/arsu-converter/workflow/artifact-contracts.ts", content: renderArsuArtifactContract(artifactMatch[1]) };
  const match = /^ars:shared\/handoff_schemas\.md#([a-z0-9-]+)$/.exec(templateRef);
  if (!match?.[1]) throw new Error(`Unsupported template reference: ${templateRef}`);
  const sourcePath = fileURLToPath(new URL("../../../../skills/arsu/deep-research/references/shared/handoff_schemas.md", import.meta.url));
  const text = await readFile(sourcePath, "utf8");
  const content = markdownSection(text, match[1]);
  if (!content) throw new Error(`Template anchor not found: ${match[1]}`);
  return { template_ref: templateRef, source_path: sourcePath, content };
}

async function completionProblems(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, inspection: ArtifactInspection, facts: EventFacts, inspections: ArtifactInspection[], scope?: { instanceId: string; selector: string; requireStartAuthorization: boolean }): Promise<MissingDependency[]> {
  const problems: MissingDependency[] = [];
  const artifact = inspection.artifact;
  const expectedPath = path.resolve(snapshot.workspace, node.output.workspace_path);
  if (inspection.resolved_path !== expectedPath) problems.push({ kind: "output", id: node.id, reason: "artifact_path_mismatch" });
  if (artifact.artifact_type !== node.output.artifact_type) problems.push({ kind: "output", id: node.id, reason: "artifact_type_mismatch" });
  if (!inspection.exists) problems.push({ kind: "output", id: node.id, reason: "artifact_missing" });
  if (!inspection.inside_project) problems.push({ kind: "output", id: node.id, reason: "artifact_path_escape" });
  if (node.completion.require_sha256 && (typeof artifact.sha256 !== "string" || inspection.hash_matches !== true)) problems.push({ kind: "output", id: node.id, reason: typeof artifact.sha256 === "string" ? "artifact_hash_mismatch" : "artifact_hash_missing" });
  if (!node.completion.artifact_statuses.includes(String(artifact.status))) problems.push({ kind: "output", id: node.id, reason: "artifact_status_not_accepted" });
  if (!node.completion.verification_states.includes(String(artifact.verification_state))) problems.push({ kind: "output", id: node.id, reason: "artifact_not_verified" });
  if (node.completion.require_receipt) {
    if (isPatchManagedOutput(artifact)) {
      if (!(await trustedPatchApplyReceipt(artifact, inspections))) {
        problems.push({ kind: "output", id: node.id, reason: "patch_apply_receipt_untrusted" });
      }
    } else {
      const candidateRecord = SubmittedArtifactRecordSchema.safeParse(artifact);
      const receiptId = stringValue(artifact.submit_receipt_artifact_id);
      const candidateId = stringValue(artifact.artifact_id);
      const receiptInspection = receiptId ? inspections.find((item) => item.artifact.artifact_id === receiptId) : undefined;
      const receiptRecord = receiptInspection ? SubmitReceiptArtifactRecordSchema.safeParse(receiptInspection.artifact) : undefined;
      if (!candidateRecord.success) problems.push({ kind: "output", id: node.id, reason: "submit_candidate_record_invalid" });
      if (!receiptId || !receiptInspection) problems.push({ kind: "output", id: node.id, reason: "submit_receipt_missing" });
      else if (!isTrustedInspection(receiptInspection) || !receiptRecord?.success) {
        problems.push({ kind: "output", id: node.id, reason: "submit_receipt_untrusted" });
      } else if (!receiptInspection.resolved_path) {
        problems.push({ kind: "output", id: node.id, reason: "submit_receipt_missing" });
      } else {
        try {
        const parsed = ArtifactSubmitReceiptSchema.safeParse(JSON.parse(await readFile(receiptInspection.resolved_path, "utf8")) as unknown);
        const related = Array.isArray(receiptInspection.artifact.related_artifact_ids) ? receiptInspection.artifact.related_artifact_ids : [];
        const suffix = typeof artifact.sha256 === "string" ? artifact.sha256.slice(0, 16) : "";
        const scopedWorkId = scope ? `${scope.instanceId}-${node.id}` : node.id;
        const expectedCandidateId = `A-${scopedWorkId}-${suffix}`;
        const expectedSubmissionId = `S-${scopedWorkId}-${suffix}`;
        const expectedReceiptId = `A-submit-receipt-${scopedWorkId}-${suffix}`;
        const expectedReceiptPath = path.resolve(snapshot.workspace, `runs/current/receipts/artifact-submit/${expectedSubmissionId}.json`);
        if (!candidateRecord.success || !receiptRecord?.success || !parsed.success
          || candidateId !== expectedCandidateId
          || receiptId !== expectedReceiptId
          || receiptInspection.resolved_path !== expectedReceiptPath
          || parsed.data.submission_id !== expectedSubmissionId
          || parsed.data.receipt_artifact_id !== receiptId
          || parsed.data.selector !== (scope?.selector ?? `work:${node.id}`)
          || parsed.data.subflow_instance_id !== scope?.instanceId
          || candidateRecord.data.subflow_instance_id !== scope?.instanceId
          || parsed.data.artifact.artifact_id !== candidateId
          || parsed.data.artifact.artifact_type !== node.output.artifact_type
          || parsed.data.artifact.path !== artifact.path
          || parsed.data.artifact.sha256 !== artifact.sha256
          || parsed.data.producer_skill !== node.producer_skill
          || parsed.data.stage_id !== node.stage_id
          || parsed.data.payload_schema_ref !== node.output.template_ref
          || JSON.stringify(parsed.data.producer) !== JSON.stringify(candidateRecord.data.producer)
          || parsed.data.submitted_at !== candidateRecord.data.created_at
          || parsed.data.validation.profile !== node.validation_profile
          || parsed.data.validation.outcome !== "pass"
          || parsed.data.validation.validator.kind !== "validator"
          || parsed.data.validation.validator.name !== `researchspec:${node.validation_profile}`
          || candidateRecord.data.verification.profile !== node.validation_profile
          || candidateRecord.data.verification.verified_by.kind !== "validator"
          || candidateRecord.data.verification.verified_by.name !== `researchspec:${node.validation_profile}`
          || JSON.stringify(candidateRecord.data.verification.checks) !== JSON.stringify(parsed.data.validation.checks)
          || receiptRecord.data.created_at !== parsed.data.submitted_at
          || !related.includes(candidateId)) {
          problems.push({ kind: "output", id: node.id, reason: "submit_receipt_mismatch" });
        }
        if (scope?.requireStartAuthorization) {
          const authorization = parsed.success ? parsed.data.start_authorization : undefined;
          if (!authorization) problems.push({ kind: "output", id: node.id, reason: "subflow_start_receipt_missing" });
          else {
            try {
              const startPath = path.resolve(snapshot.workspace, authorization.receipt_path);
              const startBytes = await readFile(startPath);
              const start = SubflowStartReceiptSchema.parse(JSON.parse(Buffer.from(startBytes).toString("utf8")) as unknown);
              if (sha256(startBytes) !== authorization.receipt_sha256 || start.instance_id !== scope.instanceId || start.plan_sha256 !== authorization.plan_sha256) problems.push({ kind: "output", id: node.id, reason: "subflow_start_receipt_mismatch" });
            } catch { problems.push({ kind: "output", id: node.id, reason: "subflow_start_receipt_untrusted" }); }
          }
        }
        } catch {
          problems.push({ kind: "output", id: node.id, reason: "submit_receipt_invalid" });
        }
      }
    }
  }
  for (const gateId of node.completion.required_gate_ids) if (!facts.passedGateIds.has(gateId)) problems.push({ kind: "gate_id", id: gateId, reason: "completion_gate_not_passed" });
  return problems;
}

function isPatchManagedOutput(artifact: Record<string, unknown>): boolean {
  if (artifact.produced_by !== "researchspec advance") return false;
  return AppliedDraftArtifactRecordSchema.safeParse(artifact).success
    || ApplyReportArtifactRecordSchema.safeParse(artifact).success;
}

async function trustedPatchApplyReceipt(
  artifact: Record<string, unknown>,
  inspections: ArtifactInspection[],
): Promise<boolean> {
  const patchId = stringValue(artifact.patch_id);
  const artifactId = stringValue(artifact.artifact_id);
  const artifactPath = stringValue(artifact.path);
  const artifactHash = stringValue(artifact.sha256);
  const receiptId = stringValue(artifact.apply_receipt_artifact_id);
  const receiptInspection = inspections.find((item) => item.artifact.artifact_id === receiptId);
  if (!patchId || !artifactId || !artifactPath || !artifactHash || !receiptId
    || !receiptInspection?.resolved_path || !isTrustedInspection(receiptInspection)) return false;
  const receiptArtifact = ApplyReceiptArtifactRecordSchema.safeParse(receiptInspection.artifact);
  if (!receiptArtifact.success
    || receiptArtifact.data.patch_id !== patchId
    || !receiptArtifact.data.related_artifact_ids?.includes(artifactId)) return false;
  try {
    const receipt = DraftPatchReceiptSchema.parse(JSON.parse(await readFile(receiptInspection.resolved_path, "utf8")) as unknown);
    return receipt.receipt_type === "draft_patch_apply"
      && receipt.patch_id === patchId
      && receipt.artifact_ids.includes(artifactId)
      && receipt.artifact_ids.includes(receiptId)
      && receipt.output_hashes[artifactPath] === artifactHash;
  } catch {
    return false;
  }
}

function submitCapability(node: WorkflowNodeDefinition, status: WorkItemStatus): WorkflowInstructionPacket["completion"] {
  const available = ["text-artifact", "binary-file-artifact"].includes(node.validation_profile);
  return {
    policy: node.completion,
    submit_available: available,
    ...(available ? {
      submit: {
        selector: status.selector,
        candidate_path: status.output_path,
        command: `researchspec submit ${status.selector} --input <semantic-input.json> --actor-kind <kind> --actor-name <name>${status.submission_policy === "manual" ? " --confirmed-by <human>" : ""} --json`,
        semantic_input_schema_version: "2" as const,
        input_schema: { required: [], optional: ["producer_mode"] },
        execution_policy: status.submission_policy === "automatic" ? "direct" as const : "human_confirmed" as const,
        dry_run: "optional" as const,
        updates_state: false as const,
        appends_gate: false as const,
        appends_decision: false as const,
      },
    } : {}),
  };
}

async function submissionPacket(snapshot: WorkspaceSnapshot, status: WorkItemStatus, nodeTemplate: WorkflowNodeTemplate | undefined): Promise<WorkflowInstructionPacket["submission"]> {
  if (!status.instance_id || !nodeTemplate || !snapshot.runState) throw new Error("Scoped submission requires current instance state.");
  const instance = snapshot.runState.subflows.find((item) => item.instance_id === status.instance_id);
  if (!instance) return { policy: nodeTemplate.submission.policy, authorization: null, requires_user_confirmation: true };
  const receiptPath = path.resolve(snapshot.workspace, instance.start_receipt.path);
  let valid = false;
  try {
    const bytes = await readFile(receiptPath);
    const receipt = JSON.parse(Buffer.from(bytes).toString("utf8")) as Record<string, unknown>;
    valid = sha256(bytes) === instance.start_receipt.sha256
      && receipt.receipt_type === "subflow_start"
      && receipt.instance_id === instance.instance_id
      && receipt.plan_sha256 === instance.start_receipt.plan_sha256;
  } catch { valid = false; }
  const automatic = nodeTemplate.submission.policy === "automatic" && valid;
  return {
    policy: nodeTemplate.submission.policy,
    authorization: { kind: "subflow_start", valid, receipt_path: receiptPath, receipt_sha256: instance.start_receipt.sha256 },
    requires_user_confirmation: !automatic,
  };
}

function isTrustedInspection(inspection: ArtifactInspection): boolean {
  return inspection.exists && inspection.inside_project && typeof inspection.artifact.sha256 === "string" && inspection.hash_matches === true;
}

interface EventFacts {
  passedGateIds: Set<string>;
  passedGateTypes: Set<string>;
  acceptedDecisionTypes: Set<string>;
}

function eventFacts(snapshot: WorkspaceSnapshot): EventFacts {
  const latestDecisions = latestById(snapshot.decisions.filter((item) => item.authority !== "imported_evidence"), "decision_id");
  const latestGates = latestById(snapshot.gates.filter((item) => item.authority !== "imported_evidence"), "gate_id");
  const passedGates = latestGates.filter((item) =>
    item.verdict === "pass"
    || item.verdict === "pass_with_conditions"
    || hasTrustedGateOverride(snapshot, String(item.gate_id), String(item.event_id)));
  const passedGateIds = new Set(passedGates.filter((item) => typeof item.gate_id === "string").map((item) => String(item.gate_id)));
  const passedGateTypes = new Set(passedGates.filter((item) => typeof item.gate_type === "string").map((item) => String(item.gate_type)));
  const acceptedDecisionTypes = new Set(latestDecisions.filter((item) => item.status === "accepted" && typeof item.decision_type === "string").map((item) => String(item.decision_type)));
  return { passedGateIds, passedGateTypes, acceptedDecisionTypes };
}

async function trustedGateEvents(snapshot: WorkspaceSnapshot): Promise<Record<string, unknown>[]> {
  const trusted: Record<string, unknown>[] = [];
  for (const event of snapshot.gates) {
    if (event.authority === "imported_evidence") continue;
    if (event.schema_version !== "1") { trusted.push(event); continue; }
    const reference = event.receipt && typeof event.receipt === "object" && !Array.isArray(event.receipt) ? event.receipt as Record<string, unknown> : undefined;
    if (!reference || typeof reference.path !== "string" || typeof reference.sha256 !== "string" || typeof reference.plan_sha256 !== "string") continue;
    const receiptPath = path.resolve(snapshot.workspace, reference.path);
    if (!isInside(snapshot.workspace, receiptPath)) continue;
    try {
      const bytes = await readFile(receiptPath);
      const parsed = GateSubmitReceiptSchema.safeParse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      if (!parsed.success || sha256(bytes) !== reference.sha256 || parsed.data.plan_sha256 !== reference.plan_sha256
        || parsed.data.gate_id !== event.gate_id || parsed.data.event_id !== event.event_id || parsed.data.verdict !== event.verdict
        || parsed.data.stage_id !== event.stage_id || parsed.data.gate_type !== event.gate_type || parsed.data.validator_id !== event.validator_id
        || parsed.data.blocking !== event.blocking || parsed.data.verification_kind !== event.verification_kind
        || JSON.stringify(parsed.data.evidence) !== JSON.stringify(event.evidence)
        || JSON.stringify(parsed.data.confirmed_by) !== JSON.stringify(event.confirmed_by)) continue;
      trusted.push(event);
    } catch { continue; }
  }
  return trusted;
}

function hasTrustedGateOverride(snapshot: WorkspaceSnapshot, gateId: string, gateEventId: string): boolean {
  const gate = snapshot.gates.find((event) => event.gate_id === gateId && event.event_id === gateEventId);
  const receipt = gate?.receipt && typeof gate.receipt === "object" && !Array.isArray(gate.receipt)
    ? gate.receipt as Record<string, unknown>
    : undefined;
  if (!receipt) return false;
  return latestById(snapshot.decisions, "decision_id").some((decision) => decision.status === "accepted" && decision.decision_type === "gate_override"
    && decision.gate_id === gateId
    && decision.gate_event_id === gateEventId
    && decision.gate_receipt_sha256 === receipt.sha256
    && decision.gate_receipt_plan_sha256 === receipt.plan_sha256);
}

function isInside(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function markdownSection(text: string, anchor: string): string | undefined {
  const lines = text.split(/(?<=\n)/);
  let start = -1;
  let level = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index] ?? "");
    if (!heading?.[1] || !heading[2]) continue;
    const slug = markdownSlug(heading[2]);
    if (slug === anchor || slug.startsWith(`${anchor}-`)) {
      start = index;
      level = heading[1].length;
      break;
    }
  }
  if (start < 0) return undefined;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const heading = /^(#{1,6})\s+/.exec(lines[index] ?? "");
    if (heading?.[1] && heading[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("").trimEnd();
}

function markdownSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-");
}
