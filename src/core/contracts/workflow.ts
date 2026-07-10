import path from "node:path";
import { z } from "zod";

import { RouteRefSchema } from "../../arsu-converter/routing/contracts.js";
export { WorkItemSelectorSchema } from "./runtime-selector.js";

export const WORKFLOW_PROFILE_IDS = ["arsu-paper", "arsu-research-slice"] as const;
export type WorkflowProfileId = typeof WORKFLOW_PROFILE_IDS[number];

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const TemplateIdSchema = z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/);
const WorkspacePathSchema = z.string().min(1).refine(isSafeWorkspacePath, "Path must be relative to the ResearchSpec workspace and must not contain '..'.");
const WorkspacePathTemplateSchema = z.string().min(1).refine(isSafeWorkspacePathTemplate, "Output template must be safe and use only supported placeholders.");

const RequiresShape = {
  work_items: z.array(SafeIdSchema),
  parallel_groups: z.array(SafeIdSchema).default([]),
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
  require_receipt: z.boolean().default(false),
};
const CommonNodeShape = {
  id: SafeIdSchema,
  stage_id: SafeIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  producer_skill: z.string().min(1),
  instruction: z.string().min(1),
  rules: z.array(z.string().min(1)),
  allowed_writes: z.array(z.enum(["output_artifact", "contract_patch", "draft_patch"])),
  validation_profile: z.string().min(1),
};

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

export const SubflowTemplateDefinitionSchema = z.strictObject({
  template_id: TemplateIdSchema,
  template_kind: z.enum(["standalone", "pipeline", "round"]),
  route_ref: RouteRefSchema,
  route_coverage: z.enum(["complete", "partial"]),
  parent_policy: z.enum(["none", "optional", "required"]),
  entry_stage_id: SafeIdSchema,
  stages: z.array(z.strictObject({ stage_id: SafeIdSchema, title: z.string().min(1) })).min(1),
  start_requires: z.strictObject({ decision_types: z.array(SafeIdSchema) }),
  work_items: z.array(WorkflowNodeTemplateSchema).min(1),
  parallel_groups: z.array(ParallelGroupDefinitionSchema),
});

export const LegacyWorkflowDefinitionSchema = z.looseObject({
  schema_version: z.string(),
  workflow_id: SafeIdSchema,
  workflow_kind: z.string().min(1),
  entry_stage_id: SafeIdSchema,
  terminal_stage_ids: z.array(SafeIdSchema),
  stages: z.array(z.looseObject({ stage_id: SafeIdSchema, title: z.string().min(1) })),
  work_items: z.array(WorkflowNodeDefinitionSchema).optional(),
});

export const InstanceWorkflowDefinitionSchema = z.strictObject({
  schema_version: z.literal("0.2"),
  workflow_id: SafeIdSchema,
  workflow_kind: z.string().min(1),
  subflow_templates: z.array(SubflowTemplateDefinitionSchema).min(1),
});

export const WorkflowDefinitionSchema = z.union([InstanceWorkflowDefinitionSchema, LegacyWorkflowDefinitionSchema]);
export type WorkflowNodeDefinition = z.infer<typeof WorkflowNodeDefinitionSchema>;
export type WorkflowNodeTemplate = z.infer<typeof WorkflowNodeTemplateSchema>;
export type ParallelGroupDefinition = z.infer<typeof ParallelGroupDefinitionSchema>;
export type SubflowTemplateDefinition = z.infer<typeof SubflowTemplateDefinitionSchema>;
export type LegacyWorkflowDefinition = z.infer<typeof LegacyWorkflowDefinitionSchema>;
export type InstanceWorkflowDefinition = z.infer<typeof InstanceWorkflowDefinitionSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export interface WorkflowDefinitionIssue { code: string; message: string }

export function isInstanceWorkflowDefinition(value: WorkflowDefinition | undefined): value is InstanceWorkflowDefinition {
  return value?.schema_version === "0.2" && "subflow_templates" in value;
}

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
  if (isInstanceWorkflowDefinition(workflow)) return validateInstanceWorkflow(workflow);
  return validateLegacyWorkflow(workflow);
}

function validateLegacyWorkflow(workflow: LegacyWorkflowDefinition): WorkflowDefinitionIssue[] {
  const issues: WorkflowDefinitionIssue[] = [];
  const stageIds = uniqueIds(workflow.stages.map((item) => item.stage_id), "duplicate_stage_id", issues);
  for (const stageId of [workflow.entry_stage_id, ...workflow.terminal_stage_ids]) if (!stageIds.has(stageId)) issues.push({ code: "workflow_stage_missing", message: `Workflow stage does not exist: ${stageId}` });
  validateNodeGraph(workflow.work_items ?? [], stageIds, [], issues);
  return deduplicateIssues(issues);
}

function validateInstanceWorkflow(workflow: InstanceWorkflowDefinition): WorkflowDefinitionIssue[] {
  const issues: WorkflowDefinitionIssue[] = [];
  uniqueIds(workflow.subflow_templates.map((item) => item.template_id), "duplicate_subflow_template_id", issues);
  for (const template of workflow.subflow_templates) {
    const stageIds = uniqueIds(template.stages.map((item) => item.stage_id), "duplicate_stage_id", issues);
    if (!stageIds.has(template.entry_stage_id)) issues.push({ code: "workflow_stage_missing", message: `Template ${template.template_id} entry stage does not exist: ${template.entry_stage_id}` });
    if (template.template_kind === "round" && template.parent_policy !== "required") issues.push({ code: "round_parent_policy_invalid", message: `Round template ${template.template_id} requires parent_policy required.` });
    if (template.template_kind !== "round" && template.work_items.some((item) => item.output.workspace_path_template.includes("{round_number}"))) issues.push({ code: "round_placeholder_invalid", message: `Non-round template ${template.template_id} uses round_number.` });
    validateNodeGraph(template.work_items, stageIds, template.parallel_groups, issues);
  }
  return deduplicateIssues(issues);
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
