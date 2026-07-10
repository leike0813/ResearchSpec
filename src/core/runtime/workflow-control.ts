import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ARSU_ROUTING_CATALOG } from "../../arsu-converter/routing/catalog.js";
import { fileExists } from "../../utils/fs.js";
import { ArtifactSubmitReceiptSchema, SubmittedArtifactRecordSchema, SubmitReceiptArtifactRecordSchema } from "../contracts/artifact.js";
import { SubflowStartReceiptSchema } from "../contracts/subflow.js";
import { isInstanceRunState } from "../contracts/run-state.js";
import { isInstanceWorkflowDefinition, resolveWorkNode, validateWorkflowDefinition, type ParallelGroupDefinition, type SubflowTemplateDefinition, type WorkflowNodeDefinition, type WorkflowNodeTemplate } from "../contracts/workflow.js";
import type { Diagnostic } from "../validation/types.js";
import { latestById, type WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";

export type WorkItemState = "done" | "ready" | "blocked";

export interface MissingDependency {
  kind: "stage" | "work_item" | "contract" | "artifact_type" | "gate_type" | "gate_id" | "decision_type" | "output";
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
  submission_policy: "automatic" | "manual" | "legacy";
  deferred_reason?: "parallel_capacity_deferred";
}

export interface SubflowControlStatus {
  id: string;
  selector: string;
  kind: "template" | "instance";
  template_id: string;
  instance_id?: string;
  route_ref: string;
  route_coverage: "complete" | "partial";
  state: "available" | "blocked" | "active" | "waiting" | "complete" | "failed" | "cancelled";
  parent_subflow_id?: string | null;
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

export interface WorkflowControlResult {
  profile: string;
  active_stage_id: string | null;
  state: "unconfigured" | "not_started" | "blocked" | "ready" | "stage_work_complete";
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
  description: string;
  context: null;
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
      dry_run_command: string;
      input_schema: { required: string[]; optional: string[] };
      requires_confirmation: boolean;
      requires_expected_sha256_for_noninteractive_execution: true;
      updates_state: false;
      appends_gate: false;
      appends_decision: false;
    };
  };
  unlocks: string[];
  instance_id?: string;
  template_id?: string;
  submission: {
    policy: "automatic" | "manual" | "legacy";
    authorization: { kind: "subflow_start"; valid: boolean; receipt_path: string; receipt_sha256: string } | null;
    requires_user_confirmation: boolean;
  };
}

export type WorkflowInstructionResult =
  | { ok: true; packet: WorkflowInstructionPacket }
  | { ok: false; code: "workflow_unconfigured" | "workflow_invalid" | "work_item_not_found" | "work_item_blocked" | "work_item_already_done" | "workflow_resource_unavailable"; item?: WorkItemStatus; details?: unknown };

export interface ResolvedTemplateReference {
  template_ref: string;
  source_path: string;
  content: string;
}

export async function inspectArtifact(snapshot: WorkspaceSnapshot, artifact: Record<string, unknown>): Promise<ArtifactInspection> {
  const diagnostics: Diagnostic[] = [];
  const declaredPath = typeof artifact.path === "string" ? artifact.path : undefined;
  if (!declaredPath) return { artifact, exists: false, inside_project: false, diagnostics };

  const projectRoot = path.dirname(snapshot.workspace);
  const resolvedPath = path.resolve(projectRoot, declaredPath);
  if (!isInside(projectRoot, resolvedPath)) {
    diagnostics.push({ severity: "error", code: "artifact_path_escape", message: "Artifact path escapes the project root.", path: declaredPath, blocking: true });
    return { artifact, resolved_path: resolvedPath, exists: false, inside_project: false, diagnostics };
  }
  if (!(await fileExists(resolvedPath))) {
    diagnostics.push({ severity: "warning", code: "artifact_missing", message: "Registered artifact is missing.", path: resolvedPath, blocking: false });
    return { artifact, resolved_path: resolvedPath, exists: false, inside_project: true, diagnostics };
  }

  const [realProject, realArtifact] = await Promise.all([realpath(projectRoot), realpath(resolvedPath)]);
  if (!isInside(realProject, realArtifact)) {
    diagnostics.push({ severity: "error", code: "artifact_path_escape", message: "Artifact symlink resolves outside the project root.", path: resolvedPath, blocking: true });
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
  const activeStage = typeof snapshot.state.active_stage_id === "string" ? snapshot.state.active_stage_id : null;
  const empty = (state: WorkflowControlResult["state"], configured: boolean, valid: boolean, reason?: WorkflowControlResult["reason"]): WorkflowControlResult => ({ profile, active_stage_id: activeStage, state, configured, valid, ...(reason ? { reason } : {}), work_items: [], ready_items: [], stage_work_complete: false, transition_required: false, frontier: [], startable_subflows: [], subflows: [], parallel_groups: [] });
  if (!workflow) return empty("unconfigured", false, true, "workflow_nodes_missing");
  if (validateWorkflowDefinition(workflow).length > 0) return empty("blocked", true, false, "workflow_invalid");
  if (isInstanceWorkflowDefinition(workflow)) {
    if (!isInstanceRunState(snapshot.runState)) return empty("blocked", true, false, "workflow_invalid");
    return evaluateInstanceWorkflow(snapshot, workflow.subflow_templates, profile);
  }
  const nodes = workflow.work_items ?? [];
  if (nodes.length === 0) return empty("unconfigured", false, true, "workflow_nodes_missing");

  const inspections = await inspectArtifacts(snapshot);
  const facts = eventFacts(snapshot);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const unlocks = new Map<string, string[]>();
  for (const node of nodes) for (const dependency of node.requires.work_items) unlocks.set(dependency, [...(unlocks.get(dependency) ?? []), node.id]);
  const memo = new Map<string, Promise<WorkItemStatus>>();

  const evaluate = (node: WorkflowNodeDefinition): Promise<WorkItemStatus> => {
    const existing = memo.get(node.id);
    if (existing) return existing;
    const pending = (async (): Promise<WorkItemStatus> => {
      const outputPath = path.resolve(snapshot.workspace, node.output.workspace_path);
      const candidates = inspections.filter((inspection) => inspection.artifact.work_item_id === node.id);
      const candidate = candidates[candidates.length - 1];
      if (candidate) {
        const outputProblems = await completionProblems(snapshot, node, candidate, facts, inspections);
        if (outputProblems.length === 0) {
          return {
            id: node.id, selector: `work:${node.id}`, work_item_id: node.id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: "done",
            missing_dependencies: [], output_path: outputPath, artifact_id: stringValue(candidate.artifact.artifact_id), unlocks: unlocks.get(node.id) ?? [], warnings: [], dispatchable: false, submission_policy: "legacy",
          };
        }
        return {
          id: node.id, selector: `work:${node.id}`, work_item_id: node.id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: "blocked",
          missing_dependencies: outputProblems, output_path: outputPath, artifact_id: stringValue(candidate.artifact.artifact_id), unlocks: unlocks.get(node.id) ?? [], warnings: [], dispatchable: false, submission_policy: "legacy",
        };
      }

      const missing: MissingDependency[] = [];
      if (activeStage !== node.stage_id) missing.push({ kind: "stage", id: node.stage_id, reason: "inactive_stage" });
      for (const dependencyId of node.requires.work_items) {
        const dependency = byId.get(dependencyId);
        if (!dependency || (await evaluate(dependency)).state !== "done") missing.push({ kind: "work_item", id: dependencyId, reason: "work_item_not_done" });
      }
      for (const contractPath of node.requires.contracts) {
        const file = snapshot.files.get(contractPath);
        const invalid = file && snapshot.diagnostics.some((diagnostic) => diagnostic.blocking && diagnostic.path === file.absolutePath);
        if (!file || invalid) missing.push({ kind: "contract", id: contractPath, reason: file ? "contract_invalid" : "contract_missing" });
      }
      for (const artifactType of node.requires.artifact_types) {
        if (!inspections.some((inspection) => inspection.artifact.artifact_type === artifactType && isTrustedInspection(inspection))) {
          missing.push({ kind: "artifact_type", id: artifactType, reason: "artifact_unavailable" });
        }
      }
      for (const gateType of node.requires.gate_types) if (!facts.passedGateTypes.has(gateType)) missing.push({ kind: "gate_type", id: gateType, reason: "gate_not_passed" });
      for (const decisionType of node.requires.decision_types) if (!facts.acceptedDecisionTypes.has(decisionType)) missing.push({ kind: "decision_type", id: decisionType, reason: "decision_not_accepted" });
      const warnings: WorkItemStatus["warnings"] = await fileExists(outputPath)
        ? [{ code: "candidate_unregistered", path: outputPath }]
        : [];
      return {
        id: node.id, selector: `work:${node.id}`, work_item_id: node.id, stage_id: node.stage_id, producer_skill: node.producer_skill, state: missing.length ? "blocked" : "ready",
        missing_dependencies: missing, output_path: outputPath, unlocks: unlocks.get(node.id) ?? [], warnings, dispatchable: missing.length === 0, submission_policy: "legacy",
      };
    })();
    memo.set(node.id, pending);
    return pending;
  };

  const workItems = await Promise.all(nodes.map((node) => evaluate(node)));
  const activeItems = workItems.filter((item) => item.stage_id === activeStage);
  const stageWorkComplete = activeItems.length > 0 && activeItems.every((item) => item.state === "done");
  const readyItems = workItems.filter((item) => item.state === "ready").map((item) => item.selector);
  const state = stageWorkComplete ? "stage_work_complete" : readyItems.length ? "ready" : "blocked";
  return { profile, active_stage_id: activeStage, state, configured: true, valid: true, work_items: workItems, ready_items: readyItems, stage_work_complete: stageWorkComplete, transition_required: stageWorkComplete, frontier: readyItems, startable_subflows: [], subflows: [], parallel_groups: [] };
}

async function evaluateInstanceWorkflow(snapshot: WorkspaceSnapshot, templates: SubflowTemplateDefinition[], profile: string): Promise<WorkflowControlResult> {
  if (!isInstanceRunState(snapshot.runState)) throw new Error("Instance workflow requires instance run state.");
  const inspections = await inspectArtifacts(snapshot);
  const facts = eventFacts(snapshot);
  const templateStatuses = templates.map((template): SubflowControlStatus => {
    const missing = templateStartProblems(snapshot, template, inspections);
    return {
      id: template.template_id, selector: `subflow:${template.template_id}`, kind: "template", template_id: template.template_id,
      route_ref: template.route_ref, route_coverage: template.route_coverage, state: missing.length ? "blocked" : "available",
      missing_dependencies: missing, ready_items: [],
    };
  });
  const allWork: WorkItemStatus[] = [];
  const allGroups: ParallelGroupStatus[] = [];
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
          const problems = await completionProblems(snapshot, node, candidate, facts, inspections, { instanceId: instance.instance_id, selector });
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
    const complete = workStatuses.some((item) => item.stage_id === instance.active_stage_id) && groupsSatisfied && ungroupedDone;
    const readyItems = workStatuses.filter((item) => item.state === "ready" && item.dispatchable).map((item) => item.selector);
    instanceCompletion.push(complete);
    allWork.push(...workStatuses);
    allGroups.push(...groupStatuses);
    instanceStatuses.push({ id: instance.instance_id, selector: `subflow:${instance.instance_id}`, kind: "instance", template_id: template.template_id, instance_id: instance.instance_id, route_ref: instance.route_ref, route_coverage: template.route_coverage, state: instance.status, parent_subflow_id: instance.parent_subflow_id, round_number: instance.round_number, active_stage_id: instance.active_stage_id, missing_dependencies: [], ready_items: readyItems });
  }

  const startable = templateStatuses.filter((item) => item.state === "available").map((item) => item.selector);
  const readyItems = allWork.filter((item) => item.state === "ready" && item.dispatchable).map((item) => item.selector);
  const stageWorkComplete = instanceCompletion.length > 0 && instanceCompletion.every(Boolean);
  const state: WorkflowControlResult["state"] = stageWorkComplete ? "stage_work_complete" : readyItems.length ? "ready" : snapshot.runState.subflows.length === 0 ? "not_started" : "blocked";
  return { profile, active_stage_id: null, state, configured: true, valid: true, work_items: allWork, ready_items: readyItems, stage_work_complete: stageWorkComplete, transition_required: stageWorkComplete, frontier: [...startable, ...readyItems], startable_subflows: startable, subflows: [...templateStatuses, ...instanceStatuses], parallel_groups: allGroups };
}

function templateStartProblems(snapshot: WorkspaceSnapshot, template: SubflowTemplateDefinition, inspections: ArtifactInspection[]): MissingDependency[] {
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
  if (isInstanceWorkflowDefinition(snapshot.workflow) && status?.instance_id && status.template_id) {
    const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === status.template_id);
    nodeTemplate = template?.work_items.find((item) => item.id === status.work_item_id);
    const instance = isInstanceRunState(snapshot.runState) ? snapshot.runState.subflows.find((item) => item.instance_id === status.instance_id) : undefined;
    if (nodeTemplate && instance) node = resolveWorkNode(nodeTemplate, instance.instance_id, instance.round_number);
  } else if (snapshot.workflow && !isInstanceWorkflowDefinition(snapshot.workflow)) node = snapshot.workflow.work_items?.find((item) => item.id === status?.work_item_id || item.id === selectorOrId);
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
  return {
    ok: true,
    packet: {
      id: status.id,
      selector: status.selector,
      work_item_id: status.work_item_id,
      stage_id: status.stage_id,
      producer_skill: status.producer_skill,
      state: "ready",
      description: node.description,
      context: null,
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

export async function resolveTemplateReference(templateRef: string): Promise<ResolvedTemplateReference> {
  const match = /^ars:shared\/handoff_schemas\.md#([a-z0-9-]+)$/.exec(templateRef);
  if (!match?.[1]) throw new Error(`Unsupported template reference: ${templateRef}`);
  const sourcePath = fileURLToPath(new URL("../../../../skills/arsu/deep-research/references/shared/handoff_schemas.md", import.meta.url));
  const text = await readFile(sourcePath, "utf8");
  const content = markdownSection(text, match[1]);
  if (!content) throw new Error(`Template anchor not found: ${match[1]}`);
  return { template_ref: templateRef, source_path: sourcePath, content };
}

async function completionProblems(snapshot: WorkspaceSnapshot, node: WorkflowNodeDefinition, inspection: ArtifactInspection, facts: EventFacts, inspections: ArtifactInspection[], scope?: { instanceId: string; selector: string }): Promise<MissingDependency[]> {
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
        if (scope) {
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
  for (const gateId of node.completion.required_gate_ids) if (!facts.passedGateIds.has(gateId)) problems.push({ kind: "gate_id", id: gateId, reason: "completion_gate_not_passed" });
  return problems;
}

function submitCapability(node: WorkflowNodeDefinition, status: WorkItemStatus): WorkflowInstructionPacket["completion"] {
  const available = node.validation_profile === "research-artifact";
  return {
    policy: node.completion,
    submit_available: available,
    ...(available ? {
      submit: {
        selector: status.selector,
        candidate_path: status.output_path,
        dry_run_command: `researchspec submit ${status.selector} --input <submission.json> --actor-kind <kind> --actor-name <name> --dry-run --json`,
        input_schema: { required: ["schema_version", "dependency_artifact_ids"], optional: ["producer_mode"] },
        requires_confirmation: status.submission_policy !== "automatic",
        requires_expected_sha256_for_noninteractive_execution: true as const,
        updates_state: false as const,
        appends_gate: false as const,
        appends_decision: false as const,
      },
    } : {}),
  };
}

async function submissionPacket(snapshot: WorkspaceSnapshot, status: WorkItemStatus, nodeTemplate: WorkflowNodeTemplate | undefined): Promise<WorkflowInstructionPacket["submission"]> {
  if (!status.instance_id || !nodeTemplate || !isInstanceRunState(snapshot.runState)) return { policy: "legacy", authorization: null, requires_user_confirmation: true };
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
  const latestDecisions = latestById(snapshot.decisions, "decision_id");
  const latestGates = latestById(snapshot.gates, "gate_id");
  const overriddenGateIds = new Set(latestDecisions.filter((item) => item.status === "accepted" && item.decision_type === "gate_override" && typeof item.gate_id === "string").map((item) => String(item.gate_id)));
  const passedGates = latestGates.filter((item) => item.verdict === "pass" || item.verdict === "pass_with_conditions" || overriddenGateIds.has(String(item.gate_id)));
  const passedGateIds = new Set(passedGates.filter((item) => typeof item.gate_id === "string").map((item) => String(item.gate_id)));
  const passedGateTypes = new Set(passedGates.filter((item) => typeof item.gate_type === "string").map((item) => String(item.gate_type)));
  const acceptedDecisionTypes = new Set(latestDecisions.filter((item) => item.status === "accepted" && typeof item.decision_type === "string").map((item) => String(item.decision_type)));
  return { passedGateIds, passedGateTypes, acceptedDecisionTypes };
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
