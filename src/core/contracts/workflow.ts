import path from "node:path";
import { z } from "zod";

import { RouteRefSchema } from "../../arsu-converter/routing/contracts.js";
export { WorkItemSelectorSchema } from "./runtime-selector.js";

export const WORKFLOW_PROFILE_IDS = ["arsu-v0-1"] as const;
export type WorkflowProfileId = typeof WORKFLOW_PROFILE_IDS[number];
export const DEFAULT_WORKFLOW_PROFILE_ID: WorkflowProfileId = "arsu-v0-1";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const TemplateIdSchema = z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/);
const WorkspacePathSchema = z.string().min(1).refine(isSafeWorkspacePath, "Path must be relative to the ResearchSpec workspace and must not contain '..'.");
const WorkspacePathTemplateSchema = z.string().min(1).refine(isSafeWorkspacePathTemplate, "Output template must be safe and use only supported placeholders.");

const RequiresShape = {
  work_items: z.array(SafeIdSchema),
  parallel_groups: z.array(SafeIdSchema),
  contracts: z.array(WorkspacePathSchema),
  artifact_types: z.array(z.string().min(1)),
  gate_types: z.array(z.string().min(1)),
  decision_types: z.array(z.string().min(1)),
};
const CompletionShape = {
  artifact_statuses: z.array(z.string().min(1)).min(1),
  verification_states: z.array(z.string().min(1)).min(1),
  required_gate_ids: z.array(SafeIdSchema),
  require_registry: z.literal(true),
  require_sha256: z.literal(true),
  require_receipt: z.boolean(),
};
const CommonNodeShape = {
  id: SafeIdSchema,
  stage_id: SafeIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  producer_skill: z.string().min(1),
  producer_route_ref: RouteRefSchema.optional(),
  instruction: z.string().min(1),
  rules: z.array(z.string().min(1)),
  allowed_writes: z.array(z.enum(["output_artifact", "contract_patch", "draft_patch"])),
  validation_profile: z.enum(["text-artifact", "binary-file-artifact"]),
};

export const GateTemplateDefinitionSchema = z.strictObject({
  id: SafeIdSchema,
  stage_id: SafeIdSchema,
  title: z.string().min(1),
  gate_type: SafeIdSchema,
  validator: z.strictObject({ id: SafeIdSchema, evidence: z.strictObject({ artifact_types: z.array(SafeIdSchema), contracts: z.array(WorkspacePathSchema) }) }),
  risk_level: z.enum(["low", "medium", "high"]),
  blocking: z.boolean(),
  confirmation_required: z.literal(true),
});

export const TransitionTemplateEffectSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("activate_stage"), stage_id: SafeIdSchema }),
  z.strictObject({ kind: z.literal("complete_subflow") }),
  z.strictObject({ kind: z.literal("complete_run") }),
]);

const CurrentTransitionTemplateDefinitionSchema = z.strictObject({
  id: SafeIdSchema,
  from_stage_id: SafeIdSchema,
  effects: z.array(TransitionTemplateEffectSchema).min(1),
  requires: z.strictObject({ gate_ids: z.array(SafeIdSchema), decision_types: z.array(SafeIdSchema), artifact_types: z.array(SafeIdSchema).optional() }),
  branch: z.strictObject({ decision_point_id: SafeIdSchema, option_id: SafeIdSchema }).nullable(),
});

export const TransitionTemplateDefinitionSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  if (!("effect" in record) || "effects" in record) return value;
  const { effect, ...rest } = record;
  return { ...rest, effects: [effect] };
}, CurrentTransitionTemplateDefinitionSchema);

export const WorkflowNodeDefinitionSchema = z.looseObject({
  ...CommonNodeShape,
  requires: z.looseObject(RequiresShape),
  output: z.looseObject({ artifact_type: z.string().min(1), workspace_path: WorkspacePathSchema, template_ref: z.string().min(1) }),
  completion: z.looseObject(CompletionShape),
});

export const WorkflowNodeTemplateSchema = z.strictObject({
  ...CommonNodeShape,
  requires: z.strictObject(RequiresShape),
  output: z.strictObject({ artifact_type: z.string().min(1), workspace_path_template: WorkspacePathTemplateSchema, template_ref: z.string().min(1) }),
  submission: z.strictObject({ policy: z.enum(["automatic", "manual"]) }),
  completion: z.strictObject(CompletionShape),
});

export const ParallelGroupDefinitionSchema = z.strictObject({
  id: SafeIdSchema,
  members: z.array(z.strictObject({ work_item_id: SafeIdSchema, required: z.boolean() })).min(1),
  max_concurrency: z.number().int().positive(),
  join: z.discriminatedUnion("policy", [
    z.strictObject({ policy: z.literal("all") }),
    z.strictObject({ policy: z.literal("quorum"), required_count: z.number().int().positive() }),
  ]),
});

export const SubflowNodeDefinitionSchema = z.strictObject({
  id: SafeIdSchema,
  stage_id: SafeIdSchema,
  template_id: TemplateIdSchema,
  depends_on: z.array(SafeIdSchema).default([]),
  multiplicity: z.enum(["once", "next_round"]).default("once"),
  completion: z.enum(["child_complete"]).default("child_complete"),
});

export const SubflowParallelGroupDefinitionSchema = z.strictObject({
  id: SafeIdSchema,
  members: z.array(z.strictObject({ subflow_node_id: SafeIdSchema, required: z.boolean() })).min(1),
  max_concurrency: z.number().int().positive(),
  join: z.discriminatedUnion("policy", [
    z.strictObject({ policy: z.literal("all") }),
    z.strictObject({ policy: z.literal("quorum"), required_count: z.number().int().positive() }),
  ]),
});

export const SubflowTemplateDefinitionSchema = z.strictObject({
  template_id: TemplateIdSchema,
  template_kind: z.enum(["standalone", "pipeline", "round"]),
  visibility: z.enum(["external", "internal"]).optional(),
  route_ref: RouteRefSchema.nullable(),
  route_coverage: z.enum(["complete", "partial"]),
  parent_policy: z.enum(["none", "optional", "required"]),
  entry_stage_id: SafeIdSchema,
  stages: z.array(z.strictObject({ stage_id: SafeIdSchema, title: z.string().min(1) })).min(1),
  start_requires: z.strictObject({ decision_types: z.array(SafeIdSchema) }),
  work_items: z.array(WorkflowNodeTemplateSchema),
  parallel_groups: z.array(ParallelGroupDefinitionSchema),
  subflow_nodes: z.array(SubflowNodeDefinitionSchema),
  subflow_parallel_groups: z.array(SubflowParallelGroupDefinitionSchema),
  gates: z.array(GateTemplateDefinitionSchema),
  advisory_gate_kinds: z.array(SafeIdSchema).optional(),
  transitions: z.array(TransitionTemplateDefinitionSchema),
});

export const WorkflowDefinitionSchema = z.strictObject({
  schema_version: z.literal("0.2"),
  workflow_id: SafeIdSchema,
  workflow_kind: z.string().min(1),
  subflow_templates: z.array(SubflowTemplateDefinitionSchema).min(1),
});

export type WorkflowNodeDefinition = z.infer<typeof WorkflowNodeDefinitionSchema>;
export type WorkflowNodeTemplate = z.infer<typeof WorkflowNodeTemplateSchema>;
export type ParallelGroupDefinition = z.infer<typeof ParallelGroupDefinitionSchema>;
export type SubflowNodeDefinition = z.infer<typeof SubflowNodeDefinitionSchema>;
export type SubflowParallelGroupDefinition = z.infer<typeof SubflowParallelGroupDefinitionSchema>;
export type SubflowTemplateDefinition = z.infer<typeof SubflowTemplateDefinitionSchema>;
export type GateTemplateDefinition = z.infer<typeof GateTemplateDefinitionSchema>;
export type TransitionTemplateEffect = z.infer<typeof TransitionTemplateEffectSchema>;
export type TransitionTemplateDefinition = z.infer<typeof TransitionTemplateDefinitionSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export interface WorkflowDefinitionIssue { code: string; message: string }

export function resolveWorkNode(template: WorkflowNodeTemplate, instanceId: string, roundNumber: number | null): WorkflowNodeDefinition {
  const workspacePath = template.output.workspace_path_template
    .replaceAll("{subflow_instance_id}", instanceId)
    .replaceAll("{round_number}", roundNumber === null ? "none" : String(roundNumber));
  if (!isSafeWorkspacePath(workspacePath)) throw new Error(`Resolved work output is unsafe: ${workspacePath}`);
  return {
    ...template,
    output: { artifact_type: template.output.artifact_type, workspace_path: workspacePath, template_ref: template.output.template_ref },
  };
}

export function validateWorkflowDefinition(workflow: WorkflowDefinition): WorkflowDefinitionIssue[] {
  return validateInstanceWorkflow(workflow);
}

function validateInstanceWorkflow(workflow: WorkflowDefinition): WorkflowDefinitionIssue[] {
  const issues: WorkflowDefinitionIssue[] = [];
  const templateIds = uniqueIds(workflow.subflow_templates.map((item) => item.template_id), "duplicate_subflow_template_id", issues);
  for (const template of workflow.subflow_templates) {
    const stageIds = uniqueIds(template.stages.map((item) => item.stage_id), "duplicate_stage_id", issues);
    if (!stageIds.has(template.entry_stage_id)) issues.push({ code: "workflow_stage_missing", message: `Template ${template.template_id} entry stage does not exist: ${template.entry_stage_id}` });
    if (template.template_kind === "round" && template.parent_policy !== "required") issues.push({ code: "round_parent_policy_invalid", message: `Round template ${template.template_id} requires parent_policy required.` });
    if (template.visibility !== "internal" && template.route_ref === null) issues.push({ code: "external_route_missing", message: `External template ${template.template_id} requires route_ref.` });
    if (template.visibility === "internal" && template.parent_policy !== "required") issues.push({ code: "internal_parent_policy_invalid", message: `Internal template ${template.template_id} requires parent_policy required.` });
    if (template.work_items.length === 0 && (template.subflow_nodes ?? []).length === 0) issues.push({ code: "subflow_template_empty", message: `Template ${template.template_id} has no work or child nodes.` });
    if (template.template_kind !== "round" && template.work_items.some((item) => item.output.workspace_path_template.includes("{round_number}"))) issues.push({ code: "round_placeholder_invalid", message: `Non-round template ${template.template_id} uses round_number.` });
    validateNodeGraph(template.work_items, stageIds, template.parallel_groups, issues);
    validateSubflowGraph(template, templateIds, stageIds, issues);
    const gateIds = uniqueIds(template.gates.map((item) => item.id), "duplicate_gate_id", issues);
    uniqueIds(template.transitions.map((item) => item.id), "duplicate_transition_id", issues);
    for (const gate of template.gates) if (!stageIds.has(gate.stage_id)) issues.push({ code: "gate_stage_missing", message: `Gate ${gate.id} references missing stage: ${gate.stage_id}` });
    for (const transition of template.transitions) {
      if (!stageIds.has(transition.from_stage_id)) issues.push({ code: "transition_stage_missing", message: `Transition ${transition.id} references missing source stage: ${transition.from_stage_id}` });
      const effectKinds = transition.effects.map((effect) => effect.kind);
      if (new Set(effectKinds).size !== effectKinds.length) issues.push({ code: "transition_effect_duplicate", message: `Transition ${transition.id} repeats an effect kind.` });
      if (effectKinds.includes("activate_stage") && transition.effects.length !== 1) issues.push({ code: "transition_effect_combination_invalid", message: `Transition ${transition.id} cannot combine stage activation with completion.` });
      if (effectKinds.includes("complete_run") && (effectKinds.join(",") !== "complete_subflow,complete_run" || template.template_kind !== "pipeline")) issues.push({ code: "transition_run_completion_invalid", message: `Transition ${transition.id} may complete a run only after completing its pipeline subflow.` });
      for (const effect of transition.effects) {
        if (effect.kind === "activate_stage" && !stageIds.has(effect.stage_id)) issues.push({ code: "transition_target_missing", message: `Transition ${transition.id} references missing target stage: ${effect.stage_id}` });
      }
      for (const gateId of transition.requires.gate_ids) if (!gateIds.has(gateId)) issues.push({ code: "transition_gate_missing", message: `Transition ${transition.id} references missing Gate: ${gateId}` });
      if (transition.branch && !transition.requires.decision_types.includes("workflow_branch")) issues.push({ code: "transition_branch_invalid", message: `Branch transition ${transition.id} must require workflow_branch.` });
    }
  }
  validateSubflowCompositionCycles(workflow.subflow_templates, issues);
  return deduplicateIssues(issues);
}

function validateSubflowGraph(template: SubflowTemplateDefinition, templateIds: Set<string>, stageIds: Set<string>, issues: WorkflowDefinitionIssue[]): void {
  const childNodes = template.subflow_nodes ?? [];
  const childGroups = template.subflow_parallel_groups ?? [];
  const nodeIds = uniqueIds(childNodes.map((item) => item.id), "duplicate_subflow_node_id", issues);
  const groupIds = uniqueIds(childGroups.map((item) => item.id), "duplicate_subflow_parallel_group_id", issues);
  for (const node of childNodes) {
    if (!stageIds.has(node.stage_id)) issues.push({ code: "subflow_node_stage_missing", message: `Child node ${node.id} references missing stage: ${node.stage_id}` });
    if (!templateIds.has(node.template_id)) issues.push({ code: "subflow_node_template_missing", message: `Child node ${node.id} references missing template: ${node.template_id}` });
    if (node.template_id === template.template_id) issues.push({ code: "subflow_node_self_reference", message: `Template ${template.template_id} cannot invoke itself directly.` });
    for (const dependency of node.depends_on) if (!nodeIds.has(dependency)) issues.push({ code: "subflow_node_dependency_missing", message: `Child node ${node.id} references missing child node: ${dependency}` });
  }
  const membership = new Set<string>();
  for (const group of childGroups) {
    if (group.max_concurrency > group.members.length) issues.push({ code: "subflow_parallel_capacity_invalid", message: `Child group ${group.id} capacity exceeds members.` });
    if (group.join.policy === "quorum" && group.join.required_count > group.members.length) issues.push({ code: "subflow_parallel_quorum_invalid", message: `Child group ${group.id} quorum exceeds members.` });
    for (const member of group.members) {
      if (!nodeIds.has(member.subflow_node_id)) issues.push({ code: "subflow_parallel_member_missing", message: `Child group ${group.id} references missing node: ${member.subflow_node_id}` });
      if (membership.has(member.subflow_node_id)) issues.push({ code: "subflow_parallel_member_multiple_groups", message: `Child node ${member.subflow_node_id} belongs to multiple groups.` });
      membership.add(member.subflow_node_id);
    }
  }
  const byId = new Map(childNodes.map((node) => [node.id, node]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) { issues.push({ code: "subflow_node_cycle", message: `Child-node graph contains a cycle involving: ${id}` }); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)?.depends_on ?? []) if (byId.has(dependency)) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const node of childNodes) visit(node.id);
  void groupIds;
}

function validateSubflowCompositionCycles(templates: SubflowTemplateDefinition[], issues: WorkflowDefinitionIssue[]): void {
  const byId = new Map(templates.map((template) => [template.template_id, template]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (templateId: string): void => {
    if (visiting.has(templateId)) { issues.push({ code: "subflow_composition_cycle", message: `Subflow template composition contains a cycle involving: ${templateId}` }); return; }
    if (visited.has(templateId)) return;
    visiting.add(templateId);
    for (const node of byId.get(templateId)?.subflow_nodes ?? []) if (byId.has(node.template_id)) visit(node.template_id);
    visiting.delete(templateId);
    visited.add(templateId);
  };
  for (const template of templates) visit(template.template_id);
}

function validateNodeGraph(nodes: Array<WorkflowNodeDefinition | WorkflowNodeTemplate>, stageIds: Set<string>, groups: ParallelGroupDefinition[], issues: WorkflowDefinitionIssue[]): void {
  const nodeIds = uniqueIds(nodes.map((item) => item.id), "duplicate_work_item_id", issues);
  const groupIds = uniqueIds(groups.map((item) => item.id), "duplicate_parallel_group_id", issues);
  const outputPaths = new Set<string>();
  const membership = new Set<string>();
  for (const node of nodes) {
    if (!stageIds.has(node.stage_id)) issues.push({ code: "work_item_stage_missing", message: `Work item ${node.id} references missing stage: ${node.stage_id}` });
    const outputPath = "workspace_path" in node.output ? node.output.workspace_path : node.output.workspace_path_template;
    if (outputPaths.has(outputPath)) issues.push({ code: "duplicate_work_item_output", message: `Multiple work items use output path: ${outputPath}` });
    outputPaths.add(outputPath);
    for (const dependency of node.requires.work_items) if (!nodeIds.has(dependency)) issues.push({ code: "work_item_dependency_missing", message: `Work item ${node.id} references missing work item: ${dependency}` });
    for (const groupId of node.requires.parallel_groups) if (!groupIds.has(groupId)) issues.push({ code: "parallel_group_dependency_missing", message: `Work item ${node.id} references missing parallel group: ${groupId}` });
  }
  for (const group of groups) {
    if (group.max_concurrency > group.members.length) issues.push({ code: "parallel_capacity_invalid", message: `Parallel group ${group.id} capacity exceeds members.` });
    if (group.join.policy === "quorum" && group.join.required_count > group.members.length) issues.push({ code: "parallel_quorum_invalid", message: `Parallel group ${group.id} quorum exceeds members.` });
    const local = new Set<string>();
    for (const member of group.members) {
      if (!nodeIds.has(member.work_item_id)) issues.push({ code: "parallel_member_missing", message: `Parallel group ${group.id} references missing work item: ${member.work_item_id}` });
      if (local.has(member.work_item_id)) issues.push({ code: "duplicate_parallel_member", message: `Parallel group ${group.id} repeats member: ${member.work_item_id}` });
      local.add(member.work_item_id);
      if (membership.has(member.work_item_id)) issues.push({ code: "parallel_member_multiple_groups", message: `Work item ${member.work_item_id} belongs to multiple parallel groups.` });
      membership.add(member.work_item_id);
    }
  }
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const groupMembers = new Map(groups.map((group) => [group.id, group.members.map((item) => item.work_item_id)]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) { issues.push({ code: "workflow_cycle", message: `Workflow graph contains a cycle involving: ${id}` }); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    const node = byId.get(id);
    for (const dependency of [...(node?.requires.work_items ?? []), ...(node?.requires.parallel_groups.flatMap((group) => groupMembers.get(group) ?? []) ?? [])]) if (byId.has(dependency)) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const node of nodes) visit(node.id);
}

export function isSafeWorkspacePath(value: string): boolean {
  const normalized = value.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized) || path.isAbsolute(value)) return false;
  return !normalized.split("/").some((segment) => segment === "..");
}

function isSafeWorkspacePathTemplate(value: string): boolean {
  const stripped = value.replaceAll("{subflow_instance_id}", "instance").replaceAll("{round_number}", "1");
  if (/\{[^}]+\}/.test(stripped)) return false;
  return value.includes("{subflow_instance_id}") && isSafeWorkspacePath(stripped);
}

function uniqueIds(values: string[], code: string, issues: WorkflowDefinitionIssue[]): Set<string> {
  const result = new Set<string>();
  for (const value of values) { if (result.has(value)) issues.push({ code, message: `Duplicate ID: ${value}` }); result.add(value); }
  return result;
}

function deduplicateIssues(issues: WorkflowDefinitionIssue[]): WorkflowDefinitionIssue[] {
  return [...new Map(issues.map((issue) => [`${issue.code}:${issue.message}`, issue])).values()];
}
