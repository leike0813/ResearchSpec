import path from "node:path";
import { z } from "zod";

export const WORKFLOW_PROFILE_IDS = ["arsu-paper", "arsu-research-slice"] as const;
export type WorkflowProfileId = typeof WORKFLOW_PROFILE_IDS[number];

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
export const WorkItemSelectorSchema = z.string()
  .regex(/^work:[A-Za-z0-9][A-Za-z0-9._-]*$/)
  .refine((value) => !value.slice("work:".length).includes(".."));
const WorkspacePathSchema = z.string().min(1).refine(isSafeWorkspacePath, "Path must be relative to the ResearchSpec workspace and must not contain '..'.");

export const WorkflowNodeDefinitionSchema = z.looseObject({
  id: SafeIdSchema,
  stage_id: SafeIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  producer_skill: z.string().min(1),
  requires: z.looseObject({
    work_items: z.array(SafeIdSchema),
    contracts: z.array(WorkspacePathSchema),
    artifact_types: z.array(z.string().min(1)),
    gate_types: z.array(z.string().min(1)),
    decision_types: z.array(z.string().min(1)),
  }),
  output: z.looseObject({
    artifact_type: z.string().min(1),
    workspace_path: WorkspacePathSchema,
    template_ref: z.string().min(1),
  }),
  instruction: z.string().min(1),
  rules: z.array(z.string().min(1)),
  allowed_writes: z.array(z.enum(["output_artifact", "contract_patch", "draft_patch"])),
  validation_profile: z.string().min(1),
  completion: z.looseObject({
    artifact_statuses: z.array(z.string().min(1)).min(1),
    verification_states: z.array(z.string().min(1)).min(1),
    required_gate_ids: z.array(SafeIdSchema),
    require_registry: z.literal(true),
    require_sha256: z.literal(true),
    require_receipt: z.boolean().default(false),
  }),
});

export const WorkflowDefinitionSchema = z.looseObject({
  schema_version: z.string(),
  workflow_id: SafeIdSchema,
  workflow_kind: z.string().min(1),
  entry_stage_id: SafeIdSchema,
  terminal_stage_ids: z.array(SafeIdSchema),
  stages: z.array(z.looseObject({ stage_id: SafeIdSchema, title: z.string().min(1) })),
  work_items: z.array(WorkflowNodeDefinitionSchema).optional(),
});

export type WorkflowNodeDefinition = z.infer<typeof WorkflowNodeDefinitionSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export interface WorkflowDefinitionIssue {
  code: string;
  message: string;
}

export function validateWorkflowDefinition(workflow: WorkflowDefinition): WorkflowDefinitionIssue[] {
  const issues: WorkflowDefinitionIssue[] = [];
  const stageIds = new Set<string>();
  for (const stage of workflow.stages) {
    if (stageIds.has(stage.stage_id)) issues.push({ code: "duplicate_stage_id", message: `Duplicate stage_id: ${stage.stage_id}` });
    stageIds.add(stage.stage_id);
  }
  for (const stageId of [workflow.entry_stage_id, ...workflow.terminal_stage_ids]) {
    if (!stageIds.has(stageId)) issues.push({ code: "workflow_stage_missing", message: `Workflow stage does not exist: ${stageId}` });
  }

  const nodes = workflow.work_items ?? [];
  const nodeIds = new Set<string>();
  const outputPaths = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) issues.push({ code: "duplicate_work_item_id", message: `Duplicate work item ID: ${node.id}` });
    nodeIds.add(node.id);
    if (!stageIds.has(node.stage_id)) issues.push({ code: "work_item_stage_missing", message: `Work item ${node.id} references missing stage: ${node.stage_id}` });
    const outputPath = normalizeWorkspacePath(node.output.workspace_path);
    if (!isSafeWorkspacePath(node.output.workspace_path)) issues.push({ code: "work_item_output_path_escape", message: `Work item ${node.id} output path escapes the workspace.` });
    else if (outputPaths.has(outputPath)) issues.push({ code: "duplicate_work_item_output", message: `Multiple work items use output path: ${outputPath}` });
    outputPaths.add(outputPath);
  }
  for (const node of nodes) {
    for (const dependency of node.requires.work_items) {
      if (!nodeIds.has(dependency)) issues.push({ code: "work_item_dependency_missing", message: `Work item ${node.id} references missing work item: ${dependency}` });
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      issues.push({ code: "workflow_cycle", message: `Workflow work-item graph contains a cycle involving: ${id}` });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)?.requires.work_items ?? []) if (byId.has(dependency)) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const node of nodes) visit(node.id);
  return deduplicateIssues(issues);
}

export function isSafeWorkspacePath(value: string): boolean {
  const normalized = value.replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized) || path.isAbsolute(value)) return false;
  return !normalized.split("/").some((segment) => segment === "..");
}

function normalizeWorkspacePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function deduplicateIssues(issues: WorkflowDefinitionIssue[]): WorkflowDefinitionIssue[] {
  return [...new Map(issues.map((issue) => [`${issue.code}:${issue.message}`, issue])).values()];
}
