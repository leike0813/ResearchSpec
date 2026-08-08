import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

const RouteRefSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/);
const IdListSchema = z.array(StableIdSchema);

export const PipelineProfileEntrySchema = z.discriminatedUnion("kind", [
  z.strictObject({
    entry_id: StableIdSchema,
    route_ref: RouteRefSchema,
    checkpoint: StableIdSchema,
    kind: z.literal("end-to-end"),
  }),
  z.strictObject({
    entry_id: StableIdSchema,
    route_ref: RouteRefSchema,
    entry_points: IdListSchema.min(1),
    kind: z.literal("mid-entry"),
  }),
]);

export const PipelineProfileChildSchema = z.strictObject({
  node_id: StableIdSchema,
  route_ref: RouteRefSchema,
  prerequisites: IdListSchema,
  required_input_roles: IdListSchema.optional(),
  required_gate_ids: IdListSchema,
  branch_ids: IdListSchema,
  multiplicity: z.enum(["one", "optional", "repeatable"]),
  round_role: z.string().trim().min(1).nullable(),
});

export const PipelineProfileSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  profile_id: z.enum(["academic-pipeline", "review-response", "paper-humanizer"]),
  profile_version: z.string().trim().min(1),
  entries: z.array(PipelineProfileEntrySchema).min(1),
  children: z.array(PipelineProfileChildSchema),
  parallel_groups: z.array(z.strictObject({
    group_id: StableIdSchema,
    child_node_ids: IdListSchema.min(2),
    join_policy: z.enum(["all", "any"]),
  })),
  gates: z.array(z.strictObject({
    gate_id: StableIdSchema,
    owner_node_id: StableIdSchema,
    checkpoint: StableIdSchema,
    policy: z.enum(["required", "conditional"]),
    verdicts: z.array(z.enum(["pass", "pass_with_conditions", "fail"])).min(1),
  })),
  branches: z.array(z.strictObject({
    decision_id: StableIdSchema,
    owner_node_id: StableIdSchema,
    options: z.array(z.strictObject({ option_id: StableIdSchema, unlocks: IdListSchema })).min(2),
  })),
  transitions: z.array(z.strictObject({
    transition_id: StableIdSchema,
    from: StableIdSchema,
    to: StableIdSchema,
    required_child_node_ids: IdListSchema,
    required_gate_ids: IdListSchema,
    required_branch_ids: IdListSchema,
  })),
  override_policy: z.strictObject({ failed_gate_requires_decision: z.literal(true) }),
  revision_round_template: z.strictObject({
    revision_node_id: StableIdSchema,
    review_node_id: StableIdSchema,
    continue_option_id: StableIdSchema,
    exit_option_id: StableIdSchema,
  }).nullable(),
}).superRefine((value, context) => {
  unique(value.entries, (item) => item.entry_id, "entries", context);
  unique(value.children, (item) => item.node_id, "children", context);
  unique(value.parallel_groups, (item) => item.group_id, "parallel_groups", context);
  unique(value.gates, (item) => item.gate_id, "gates", context);
  unique(value.branches, (item) => item.decision_id, "branches", context);
  unique(value.transitions, (item) => item.transition_id, "transitions", context);

  const childIds = new Set(value.children.map((item) => item.node_id));
  for (const [index, entry] of value.entries.entries()) {
    if (entry.kind !== "mid-entry") continue;
    refs(entry.entry_points, childIds, ["entries", index, "entry_points"], "child node", context);
    uniqueStrings(entry.entry_points, ["entries", index, "entry_points"], context);
  }
  const gateOwnerIds = new Set([...childIds, ...(value.profile_id === "paper-humanizer" ? value.entries.map((item) => item.entry_id) : [])]);
  const gateOwners = new Map(value.gates.map((item) => [item.gate_id, item.owner_node_id]));
  const branchOwners = new Map(value.branches.map((item) => [item.decision_id, item.owner_node_id]));
  for (const [index, child] of value.children.entries()) {
    refs(child.prerequisites, childIds, ["children", index, "prerequisites"], "child node", context);
    refs(child.required_gate_ids, new Set(gateOwners.keys()), ["children", index, "required_gate_ids"], "Gate", context);
    refs(child.branch_ids, new Set(branchOwners.keys()), ["children", index, "branch_ids"], "branch", context);
    if (child.multiplicity === "repeatable" && child.round_role === null) {
      context.addIssue({ code: "custom", path: ["children", index, "round_role"], message: "Repeatable children require a round role." });
    }
    if (child.multiplicity !== "repeatable" && child.round_role !== null) {
      context.addIssue({ code: "custom", path: ["children", index, "round_role"], message: "Only repeatable children may declare a round role." });
    }
    uniqueStrings(child.prerequisites, ["children", index, "prerequisites"], context);
    if (child.required_input_roles) uniqueStrings(child.required_input_roles, ["children", index, "required_input_roles"], context);
    uniqueStrings(child.required_gate_ids, ["children", index, "required_gate_ids"], context);
    uniqueStrings(child.branch_ids, ["children", index, "branch_ids"], context);
    for (const gateId of child.required_gate_ids) {
      if (gateOwners.get(gateId) !== child.node_id) {
        context.addIssue({ code: "custom", path: ["children", index, "required_gate_ids"], message: `Gate ${gateId} is not owned by child ${child.node_id}.` });
      }
    }
    for (const branchId of child.branch_ids) {
      if (branchOwners.get(branchId) !== child.node_id) {
        context.addIssue({ code: "custom", path: ["children", index, "branch_ids"], message: `Branch ${branchId} is not owned by child ${child.node_id}.` });
      }
    }
  }

  const groupedChildren = new Set<string>();
  for (const [index, group] of value.parallel_groups.entries()) {
    refs(group.child_node_ids, childIds, ["parallel_groups", index, "child_node_ids"], "child node", context);
    uniqueStrings(group.child_node_ids, ["parallel_groups", index, "child_node_ids"], context);
    for (const childId of group.child_node_ids) {
      if (groupedChildren.has(childId)) context.addIssue({ code: "custom", path: ["parallel_groups", index, "child_node_ids"], message: `Child belongs to multiple parallel groups: ${childId}` });
      groupedChildren.add(childId);
    }
  }
  for (const [index, gate] of value.gates.entries()) {
    ref(gate.owner_node_id, gateOwnerIds, ["gates", index, "owner_node_id"], "child or standalone entry", context);
    uniqueStrings(gate.verdicts, ["gates", index, "verdicts"], context);
  }
  for (const [index, branch] of value.branches.entries()) {
    ref(branch.owner_node_id, childIds, ["branches", index, "owner_node_id"], "child node", context);
    unique(branch.options, (item) => item.option_id, `branches.${String(index)}.options`, context, ["branches", index, "options"]);
    for (const [optionIndex, option] of branch.options.entries()) {
      refs(option.unlocks, childIds, ["branches", index, "options", optionIndex, "unlocks"], "child node", context);
      uniqueStrings(option.unlocks, ["branches", index, "options", optionIndex, "unlocks"], context);
    }
  }
  const checkpoints = new Set([...childIds, ...value.entries.flatMap((item) => item.kind === "end-to-end" ? [item.checkpoint] : [])]);
  for (const [index, transition] of value.transitions.entries()) {
    ref(transition.from, checkpoints, ["transitions", index, "from"], "checkpoint", context);
    ref(transition.to, checkpoints, ["transitions", index, "to"], "checkpoint", context);
    refs(transition.required_child_node_ids, childIds, ["transitions", index, "required_child_node_ids"], "child node", context);
    refs(transition.required_gate_ids, new Set(gateOwners.keys()), ["transitions", index, "required_gate_ids"], "Gate", context);
    refs(transition.required_branch_ids, new Set(branchOwners.keys()), ["transitions", index, "required_branch_ids"], "branch", context);
    uniqueStrings(transition.required_child_node_ids, ["transitions", index, "required_child_node_ids"], context);
    uniqueStrings(transition.required_gate_ids, ["transitions", index, "required_gate_ids"], context);
    uniqueStrings(transition.required_branch_ids, ["transitions", index, "required_branch_ids"], context);
  }

  const template = value.revision_round_template;
  if (value.profile_id === "paper-humanizer") {
    if (value.children.length > 0 || value.parallel_groups.length > 0 || value.branches.length > 0 || value.transitions.length > 0 || template !== null) {
      context.addIssue({ code: "custom", path: ["profile_id"], message: "Paper Humanizer profile must be a one-shot profile without workflow graph state." });
    }
  } else if (template === null) {
    context.addIssue({ code: "custom", path: ["revision_round_template"], message: "Pipeline profiles require a revision round template." });
  } else {
    ref(template.revision_node_id, childIds, ["revision_round_template", "revision_node_id"], "child node", context);
    ref(template.review_node_id, childIds, ["revision_round_template", "review_node_id"], "child node", context);
    const reviewBranch = value.branches.find((item) => item.owner_node_id === template.review_node_id);
    const reviewOptions = new Set(reviewBranch?.options.map((item) => item.option_id) ?? []);
    ref(template.continue_option_id, reviewOptions, ["revision_round_template", "continue_option_id"], "review branch option", context);
    ref(template.exit_option_id, reviewOptions, ["revision_round_template", "exit_option_id"], "review branch option", context);
  }
});

function unique<T>(
  values: readonly T[],
  key: (value: T) => string,
  label: string,
  context: z.RefinementCtx,
  basePath: (string | number)[] = [label],
): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    const id = key(value);
    if (seen.has(id)) context.addIssue({ code: "custom", path: [...basePath, index], message: `Duplicate ID: ${id}` });
    seen.add(id);
  }
}

function uniqueStrings(values: readonly string[], path: (string | number)[], context: z.RefinementCtx): void {
  unique(values, (value) => value, path.join("."), context, path);
}

function ref(value: string, ids: ReadonlySet<string>, path: (string | number)[], label: string, context: z.RefinementCtx): void {
  if (!ids.has(value)) context.addIssue({ code: "custom", path, message: `Unknown ${label}: ${value}` });
}

function refs(values: readonly string[], ids: ReadonlySet<string>, path: (string | number)[], label: string, context: z.RefinementCtx): void {
  for (const [index, value] of values.entries()) ref(value, ids, [...path, index], label, context);
}

export type PipelineProfile = z.infer<typeof PipelineProfileSchema>;
