import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";

export const CAPABILITY_GRAPH_SCHEMA_VERSION = "2" as const;

const NonEmptySchema = z.string().trim().min(1);
const IdListSchema = z.array(StableIdSchema);

export const GraphEntryKindSchema = z.enum(["end-to-end", "mid-entry"]);
export const GraphNodeKindSchema = z.enum(["capability", "subgraph", "gate", "decision", "observer"]);
export const GraphMultiplicitySchema = z.enum(["one", "optional", "repeatable"]);
export const GraphJoinPolicySchema = z.enum(["all", "any"]);
export const GraphGatePolicySchema = z.enum(["required", "conditional"]);
export const GraphVerdictSchema = z.enum(["pass", "pass_with_conditions", "fail"]);

export const GraphInputBindingSourceSchema = z.enum([
  "stable_spec",
  "handoff",
  "node_output",
  "parameter",
]);

export const GraphInputBindingSchema = z.strictObject({
  role: StableIdSchema,
  source: GraphInputBindingSourceSchema,
  from_node_id: StableIdSchema.optional(),
  from_role: StableIdSchema.optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
}).superRefine((value, context) => {
  if (value.source === "node_output" && value.from_node_id === undefined) {
    context.addIssue({ code: "custom", path: ["from_node_id"], message: "node_output bindings require a source node ID." });
  }
  if (value.source !== "node_output" && value.from_node_id !== undefined) {
    context.addIssue({ code: "custom", path: ["from_node_id"], message: "from_node_id is only valid for node_output bindings." });
  }
  if (value.source !== "node_output" && value.from_role !== undefined) {
    context.addIssue({ code: "custom", path: ["from_role"], message: "from_role is only valid for node_output bindings." });
  }
});

export const GraphExpectedOutputSchema = z.strictObject({
  role: StableIdSchema,
  from_role: StableIdSchema.optional(),
  required: z.boolean().optional(),
});

export const GraphEntrySchema = z.discriminatedUnion("kind", [
  z.strictObject({
    entry_id: StableIdSchema,
    kind: z.literal("end-to-end"),
    node_id: StableIdSchema,
    route_ref: NonEmptySchema.optional(),
  }),
  z.strictObject({
    entry_id: StableIdSchema,
    kind: z.literal("mid-entry"),
    entry_points: IdListSchema.min(1),
    route_ref: NonEmptySchema.optional(),
  }),
]);

export const GraphNodeSchema = z.strictObject({
  node_id: StableIdSchema,
  kind: GraphNodeKindSchema,
  capability_id: StableIdSchema.optional(),
  subgraph_id: StableIdSchema.optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  input_bindings: z.array(GraphInputBindingSchema),
  expected_outputs: z.array(GraphExpectedOutputSchema),
  prerequisites: IdListSchema,
  required_gate_ids: IdListSchema,
  required_decision_ids: IdListSchema,
  multiplicity: GraphMultiplicitySchema,
  round_role: StableIdSchema.nullable(),
  delivery_requirement: z.literal("quarto_available_for_qmd").optional(),
}).superRefine((value, context) => {
  uniqueStrings(value.input_bindings.map((item) => item.role), ["input_bindings"], "input binding role", context);
  uniqueStrings(value.expected_outputs.map((item) => item.role), ["expected_outputs"], "expected output role", context);
  uniqueStrings(value.prerequisites, ["prerequisites"], "prerequisite node ID", context);
  uniqueStrings(value.required_gate_ids, ["required_gate_ids"], "required Gate ID", context);
  uniqueStrings(value.required_decision_ids, ["required_decision_ids"], "required Decision ID", context);
  if (value.kind === "capability" && value.capability_id === undefined) {
    context.addIssue({ code: "custom", path: ["capability_id"], message: "Capability nodes require a capability_id." });
  }
  if (value.kind === "capability" && value.subgraph_id !== undefined) {
    context.addIssue({ code: "custom", path: ["subgraph_id"], message: "Capability nodes cannot bind a subgraph." });
  }
  if (value.kind === "subgraph" && value.subgraph_id === undefined) {
    context.addIssue({ code: "custom", path: ["subgraph_id"], message: "Subgraph nodes require a subgraph_id." });
  }
  if (value.kind === "subgraph" && value.capability_id !== undefined) {
    context.addIssue({ code: "custom", path: ["capability_id"], message: "Subgraph nodes cannot bind a capability." });
  }
  if ((value.kind === "gate" || value.kind === "decision") && (value.capability_id !== undefined || value.subgraph_id !== undefined)) {
    context.addIssue({ code: "custom", path: ["capability_id"], message: `${value.kind} nodes own graph policy and cannot bind a capability or subgraph.` });
  }
  if (value.multiplicity === "repeatable" && value.round_role === null) {
    context.addIssue({ code: "custom", path: ["round_role"], message: "Repeatable nodes require a round role." });
  }
  if (value.multiplicity !== "repeatable" && value.round_role !== null) {
    context.addIssue({ code: "custom", path: ["round_role"], message: "Only repeatable nodes may declare a round role." });
  }
  if (value.prerequisites.includes(value.node_id)) {
    context.addIssue({ code: "custom", path: ["prerequisites"], message: "A node cannot depend on itself." });
  }
  if (value.kind !== "subgraph" && value.expected_outputs.some((output) => output.from_role !== undefined)) {
    context.addIssue({ code: "custom", path: ["expected_outputs"], message: "Output role mappings are valid only for subgraph nodes." });
  }
});

export const GraphSubgraphSchema = z.strictObject({
  subgraph_id: StableIdSchema,
  profile_id: StableIdSchema,
  profile_version: NonEmptySchema,
  entry_id: StableIdSchema,
  entry_node_id: StableIdSchema,
});

export const GraphParallelGroupSchema = z.strictObject({
  group_id: StableIdSchema,
  node_ids: IdListSchema.min(2),
  join_policy: GraphJoinPolicySchema,
});

export const GraphGateSchema = z.strictObject({
  gate_id: StableIdSchema,
  owner_node_id: StableIdSchema,
  policy: GraphGatePolicySchema,
  verdicts: z.array(GraphVerdictSchema).min(1),
});

export const GraphDecisionSchema = z.strictObject({
  decision_id: StableIdSchema,
  owner_node_id: StableIdSchema,
  options: z.array(z.strictObject({
    option_id: StableIdSchema,
    unlocks: IdListSchema,
  })).min(2),
});

export const GraphRevisionRoundTemplateSchema = z.strictObject({
  revision_node_id: StableIdSchema,
  review_execution_node_id: StableIdSchema.optional(),
  review_node_id: StableIdSchema,
  continue_option_id: StableIdSchema,
  exit_option_id: StableIdSchema,
}).nullable();

export const CapabilityGraphProfileSchema = z.strictObject({
  schema_version: z.literal(CAPABILITY_GRAPH_SCHEMA_VERSION),
  profile_id: StableIdSchema,
  profile_version: NonEmptySchema,
  capability_registry_version: NonEmptySchema,
  entries: z.array(GraphEntrySchema).min(1),
  nodes: z.array(GraphNodeSchema).min(1),
  parallel_groups: z.array(GraphParallelGroupSchema),
  subgraphs: z.array(GraphSubgraphSchema),
  gates: z.array(GraphGateSchema),
  decisions: z.array(GraphDecisionSchema),
  revision_round_template: GraphRevisionRoundTemplateSchema,
  override_policy: z.strictObject({ failed_gate_requires_decision: z.literal(true) }),
}).superRefine((value, context) => {
  unique(value.entries, (item) => item.entry_id, ["entries"], "entry ID", context);
  unique(value.nodes, (item) => item.node_id, ["nodes"], "node ID", context);
  unique(value.parallel_groups, (item) => item.group_id, ["parallel_groups"], "parallel group ID", context);
  unique(value.subgraphs, (item) => item.subgraph_id, ["subgraphs"], "subgraph ID", context);
  unique(value.gates, (item) => item.gate_id, ["gates"], "Gate ID", context);
  unique(value.decisions, (item) => item.decision_id, ["decisions"], "Decision ID", context);

  const nodeIds = new Set(value.nodes.map((item) => item.node_id));
  const gateIds = new Set(value.gates.map((item) => item.gate_id));
  const decisionIds = new Set(value.decisions.map((item) => item.decision_id));
  const subgraphIds = new Set(value.subgraphs.map((item) => item.subgraph_id));

  for (const [index, entry] of value.entries.entries()) {
    if (entry.kind === "end-to-end") ref(entry.node_id, nodeIds, ["entries", index, "node_id"], "node", context);
    else refs(entry.entry_points, nodeIds, ["entries", index, "entry_points"], "entry node", context);
  }
  for (const [index, node] of value.nodes.entries()) {
    refs(node.prerequisites, nodeIds, ["nodes", index, "prerequisites"], "node", context);
    refs(node.required_gate_ids, gateIds, ["nodes", index, "required_gate_ids"], "Gate", context);
    refs(node.required_decision_ids, decisionIds, ["nodes", index, "required_decision_ids"], "Decision", context);
    if (node.subgraph_id !== undefined) ref(node.subgraph_id, subgraphIds, ["nodes", index, "subgraph_id"], "subgraph", context);
  }

  const groupedNodes = new Set<string>();
  for (const [index, group] of value.parallel_groups.entries()) {
    refs(group.node_ids, nodeIds, ["parallel_groups", index, "node_ids"], "node", context);
    uniqueStrings(group.node_ids, ["parallel_groups", index, "node_ids"], "group node ID", context);
    for (const nodeId of group.node_ids) {
      if (groupedNodes.has(nodeId)) context.addIssue({ code: "custom", path: ["parallel_groups", index, "node_ids"], message: `Node belongs to multiple parallel groups: ${nodeId}` });
      groupedNodes.add(nodeId);
    }
  }

  for (const [index, gate] of value.gates.entries()) {
    ref(gate.owner_node_id, nodeIds, ["gates", index, "owner_node_id"], "node", context);
    const owner = value.nodes.find((item) => item.node_id === gate.owner_node_id);
    if (owner && owner.kind !== "gate") {
      context.addIssue({ code: "custom", path: ["gates", index, "owner_node_id"], message: `Gate ${gate.gate_id} owner must be a gate node.` });
    }
  }
  for (const [index, decision] of value.decisions.entries()) {
    ref(decision.owner_node_id, nodeIds, ["decisions", index, "owner_node_id"], "node", context);
    const owner = value.nodes.find((item) => item.node_id === decision.owner_node_id);
    if (owner && owner.kind !== "decision") {
      context.addIssue({ code: "custom", path: ["decisions", index, "owner_node_id"], message: `Decision ${decision.decision_id} owner must be a decision node.` });
    }
    unique(decision.options, (item) => item.option_id, ["decisions", index, "options"], "option ID", context);
    for (const [optionIndex, option] of decision.options.entries()) {
      refs(option.unlocks, nodeIds, ["decisions", index, "options", optionIndex, "unlocks"], "node", context);
      uniqueStrings(option.unlocks, ["decisions", index, "options", optionIndex, "unlocks"], "unlock node ID", context);
    }
  }

  const template = value.revision_round_template;
  if (template !== null) {
    ref(template.revision_node_id, nodeIds, ["revision_round_template", "revision_node_id"], "node", context);
    if (template.review_execution_node_id !== undefined) {
      ref(template.review_execution_node_id, nodeIds, ["revision_round_template", "review_execution_node_id"], "node", context);
    }
    ref(template.review_node_id, nodeIds, ["revision_round_template", "review_node_id"], "node", context);
    const reviewDecision = value.decisions.find((item) => item.owner_node_id === template.review_node_id);
    const reviewOptions = new Set(reviewDecision?.options.map((item) => item.option_id) ?? []);
    ref(template.continue_option_id, reviewOptions, ["revision_round_template", "continue_option_id"], "review Decision option", context);
    ref(template.exit_option_id, reviewOptions, ["revision_round_template", "exit_option_id"], "review Decision option", context);
    if (template.continue_option_id === template.exit_option_id) {
      context.addIssue({ code: "custom", path: ["revision_round_template"], message: "Continue and exit options must differ." });
    }
  }
});

function unique<T>(
  values: readonly T[],
  key: (value: T) => string,
  path: (string | number)[],
  label: string,
  context: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    const id = key(value);
    if (seen.has(id)) context.addIssue({ code: "custom", path: [...path, index], message: `Duplicate ${label}: ${id}` });
    seen.add(id);
  }
}

function uniqueStrings(values: readonly string[], path: (string | number)[], label: string, context: z.RefinementCtx): void {
  unique(values, (value) => value, path, label, context);
}

function ref(value: string, ids: ReadonlySet<string>, path: (string | number)[], label: string, context: z.RefinementCtx): void {
  if (!ids.has(value)) context.addIssue({ code: "custom", path, message: `Unknown ${label}: ${value}` });
}

function refs(values: readonly string[], ids: ReadonlySet<string>, path: (string | number)[], label: string, context: z.RefinementCtx): void {
  for (const [index, value] of values.entries()) ref(value, ids, [...path, index], label, context);
}

export type CapabilityGraphProfile = z.infer<typeof CapabilityGraphProfileSchema>;
export type GraphEntry = z.infer<typeof GraphEntrySchema>;
export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphGate = z.infer<typeof GraphGateSchema>;
export type GraphDecision = z.infer<typeof GraphDecisionSchema>;

export function parseCapabilityGraphProfile(value: unknown): CapabilityGraphProfile {
  return CapabilityGraphProfileSchema.parse(value);
}

export interface CapabilityGraphDiagnostic {
  path: string;
  message: string;
}

export function validateGraphCapabilityReferences(
  profile: CapabilityGraphProfile,
  capabilityIds: ReadonlySet<string>,
): CapabilityGraphDiagnostic[] {
  const diagnostics: CapabilityGraphDiagnostic[] = [];
  for (const [index, node] of profile.nodes.entries()) {
    if (node.capability_id !== undefined && !capabilityIds.has(node.capability_id)) {
      diagnostics.push({
        path: `nodes.${String(index)}.capability_id`,
        message: `Unknown capability in graph profile: ${node.capability_id}`,
      });
    }
  }
  return diagnostics;
}

export function findUnreachableGraphNodes(profile: CapabilityGraphProfile): string[] {
  const reachable = new Set<string>();
  const pending = new Set<string>();

  const visit = (nodeId: string) => {
    if (nodeIds.has(nodeId) && !reachable.has(nodeId)) {
      reachable.add(nodeId);
      pending.add(nodeId);
    }
  };

  const nodeIds = new Set(profile.nodes.map((item) => item.node_id));
  for (const entry of profile.entries) {
    if (entry.kind === "end-to-end") visit(entry.node_id);
    else for (const nodeId of entry.entry_points) visit(nodeId);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const nodeId of [...pending]) {
      pending.delete(nodeId);
      const successors = profile.nodes.filter((candidate) => candidate.prerequisites.includes(nodeId));
      for (const successor of successors) visit(successor.node_id);
      for (const decision of profile.decisions) {
        if (decision.owner_node_id === nodeId) {
          for (const option of decision.options) {
            for (const unlock of option.unlocks) visit(unlock);
          }
        }
      }
    }
    if (pending.size > 0) changed = true;
  }

  return profile.nodes.filter((item) => !reachable.has(item.node_id)).map((item) => item.node_id).sort();
}
