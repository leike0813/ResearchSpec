import { parse as parseYaml, stringify } from "yaml";
import { z } from "zod";

import {
  ClaimRecordSchema,
  ManuscriptDeliverySchema,
  ManuscriptSectionSchema,
  QuartoFormatIdSchema,
  SourceRecordSchema,
  StableIdSchema,
} from "./stable-specs.js";
import { CapabilityGraphProfileSchema } from "./capability-graph.js";
import { SafeProjectRelativePathSchema } from "./project-path.js";

export const GRAPH_WORKSPACE_SCHEMA_VERSION = "2" as const;

const NonEmptySchema = z.string().trim().min(1);
const Rfc3339Schema = z.iso.datetime({ offset: true });
const HexSha256Schema = z.string().regex(/^[0-9a-f]{64}$/, "must be a lowercase SHA-256 hex string");

export const GraphWorkspaceConfigSchema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  agent_tools: z.strictObject({
    selected: z.array(NonEmptySchema),
    delivery: z.enum(["skills", "commands", "both"]),
  }),
  literature_adapters: z.strictObject({ selected: z.array(NonEmptySchema) }),
  plugins: z.strictObject({ selected: z.array(NonEmptySchema) }),
});

export const ProjectFrontmatterV2Schema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  project_id: StableIdSchema,
  working_name: z.string().trim().min(1).nullable().optional(),
});

export const SourcesSpecV2Schema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  sources: z.array(SourceRecordSchema),
});

export const ClaimsSpecV2Schema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  claims: z.array(ClaimRecordSchema),
});

export const ManuscriptSpecV2Schema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  manuscript_id: StableIdSchema,
  output_type: z.string().trim().min(1).nullable(),
  working_title: z.string().trim().min(1).nullable(),
  language: z.string().trim().min(1).nullable(),
  audience: z.string().trim().min(1).nullable(),
  venue: z.string().trim().min(1).nullable(),
  citation_requirements: z.array(z.string().trim().min(1)),
  format_requirements: z.array(z.string().trim().min(1)),
  delivery: ManuscriptDeliverySchema,
  outline: z.array(ManuscriptSectionSchema),
});

export interface ParsedProjectSpecV2 {
  frontmatter: z.infer<typeof ProjectFrontmatterV2Schema>;
  body: string;
}

export function parseProjectSpecV2(text: string): ParsedProjectSpecV2 {
  if (!text.startsWith("---\n")) throw new Error("Project spec requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Project spec frontmatter is not closed.");
  return {
    frontmatter: ProjectFrontmatterV2Schema.parse(parseYaml(text.slice(4, end))),
    body: text.slice(end + 5),
  };
}

export const ProjectChangeFrontmatterV2Schema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  id: StableIdSchema,
  status: z.enum(["draft", "proposed", "accepted", "rejected", "deferred", "superseded", "applied"]),
  targets: z.array(z.enum(["project.md", "sources.yaml", "claims.yaml", "manuscript.yaml"])).min(1),
  decision: z.strictObject({
    outcome: z.enum(["accepted", "rejected", "deferred", "superseded"]),
    decided_by: NonEmptySchema,
    decided_at: Rfc3339Schema,
    reason: NonEmptySchema,
  }).nullable().optional(),
}).superRefine((value, context) => {
  const resolved = !["draft", "proposed"].includes(value.status);
  if (resolved && !value.decision) context.addIssue({ code: "custom", path: ["decision"], message: "Resolved changes require a decision." });
  if (!resolved && value.decision) context.addIssue({ code: "custom", path: ["decision"], message: "Draft and proposed changes cannot contain a decision." });
  const expectedOutcome = value.status === "applied" ? "accepted" : value.status;
  if (resolved && value.decision?.outcome !== expectedOutcome) {
    context.addIssue({ code: "custom", path: ["decision", "outcome"], message: `Status ${value.status} requires outcome ${expectedOutcome}.` });
  }
  if (value.status === "applied" && value.decision?.outcome !== "accepted") {
    context.addIssue({ code: "custom", path: ["status"], message: "Only accepted changes can become applied." });
  }
  const seen = new Set<string>();
  for (const [index, target] of value.targets.entries()) {
    if (seen.has(target)) context.addIssue({ code: "custom", path: ["targets", index], message: `Duplicate target: ${target}` });
    seen.add(target);
  }
});

export interface ParsedProjectChangeV2 {
  frontmatter: z.infer<typeof ProjectChangeFrontmatterV2Schema>;
  body: string;
}

export function parseProjectChangeV2(text: string): ParsedProjectChangeV2 {
  if (!text.startsWith("---\n")) throw new Error("Project change requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Project change frontmatter is not closed.");
  const body = text.slice(end + 5);
  if (!body.trim()) throw new Error("Project change requires a semantic Markdown body.");
  return {
    frontmatter: ProjectChangeFrontmatterV2Schema.parse(parseYaml(text.slice(4, end))),
    body,
  };
}

const CostSchema = z.strictObject({
  effort: NonEmptySchema,
  interaction: NonEmptySchema,
});

export const GraphRunSchema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  run_id: StableIdSchema,
  profile_id: StableIdSchema,
  profile_version: NonEmptySchema,
  profile_sha256: HexSha256Schema,
  entry_id: StableIdSchema,
  entry_node_id: StableIdSchema,
  status: z.enum(["active", "paused", "blocked", "complete", "cancelled"]),
  started_at: Rfc3339Schema,
  authorization_origin: z.enum(["human", "parent_run"]),
  parent_binding: z.strictObject({
    parent_run_id: StableIdSchema,
    parent_node_id: StableIdSchema,
    subgraph_id: StableIdSchema,
    round: z.number().int().positive().optional(),
  }).optional(),
  start_confirmation: z.strictObject({
    confirmed_by: NonEmptySchema,
    confirmed_at: Rfc3339Schema,
    prerequisites: z.array(NonEmptySchema),
    expected_outputs: z.array(NonEmptySchema),
    formal_gates: z.array(StableIdSchema),
    cost: CostSchema,
  }).optional(),
}).superRefine((value, context) => {
  if (value.authorization_origin === "human") {
    if (!value.start_confirmation) context.addIssue({ code: "custom", path: ["start_confirmation"], message: "Human-authorized runs require start confirmation." });
    if (value.parent_binding) context.addIssue({ code: "custom", path: ["parent_binding"], message: "Human-authorized runs cannot declare a parent binding." });
  } else {
    if (!value.parent_binding) context.addIssue({ code: "custom", path: ["parent_binding"], message: "Parent-authorized runs require a parent binding." });
    if (value.start_confirmation) context.addIssue({ code: "custom", path: ["start_confirmation"], message: "Parent-authorized runs inherit authorization and cannot declare a second start confirmation." });
  }
});

export const GraphNodeInstanceSchema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  node_instance_id: StableIdSchema,
  run_id: StableIdSchema,
  node_id: StableIdSchema,
  state: z.enum(["pending", "eligible", "complete", "blocked", "cancelled", "skipped"]),
  round: z.number().int().positive().optional(),
  updated_at: Rfc3339Schema,
  outputs: z.array(z.strictObject({ role: NonEmptySchema, path: SafeProjectRelativePathSchema })),
  gate_attempts: z.array(z.strictObject({
    gate_id: StableIdSchema,
    verdict: z.enum(["pass", "pass_with_conditions", "fail"]),
    confirmed_by: NonEmptySchema,
    confirmed_at: Rfc3339Schema,
    summary: NonEmptySchema,
  })),
  gate_overrides: z.array(z.strictObject({
    gate_id: StableIdSchema,
    decision_id: StableIdSchema,
    approved_by: NonEmptySchema,
    approved_at: Rfc3339Schema,
    reason: NonEmptySchema,
  })).optional(),
  decisions: z.array(z.strictObject({
    decision_id: StableIdSchema,
    choice: NonEmptySchema,
    decided_by: NonEmptySchema,
    decided_at: Rfc3339Schema,
  })),
}).superRefine((value, context) => {
  if (value.round !== undefined && value.round < 1) {
    context.addIssue({ code: "custom", path: ["round"], message: "Round must be a positive integer." });
  }
  unique(value.outputs, (item) => item.role, ["outputs"], "output role", context);
  unique(value.gate_attempts, (item) => item.gate_id, ["gate_attempts"], "Gate attempt", context);
  unique(value.decisions, (item) => item.decision_id, ["decisions"], "Decision", context);
});

const RunHandoffEntrySchema = z.strictObject({
  role: NonEmptySchema,
  type: NonEmptySchema,
  path: SafeProjectRelativePathSchema,
  purpose: NonEmptySchema,
  format: QuartoFormatIdSchema.optional(),
  renderer: z.literal("quarto").optional(),
  path_kind: z.enum(["file", "directory"]).optional(),
  entry_path: SafeProjectRelativePathSchema.optional(),
  limits: z.array(NonEmptySchema).optional(),
  notes: NonEmptySchema.optional(),
}).superRefine((value, context) => {
  if (value.format === "qmd" && !value.path.toLowerCase().endsWith(".qmd")) {
    context.addIssue({ code: "custom", path: ["path"], message: "QMD handoff paths must end in .qmd." });
  }
  if (value.renderer === "quarto" && value.format === undefined) {
    context.addIssue({ code: "custom", path: ["format"], message: "Quarto-rendered handoffs require a target format ID." });
  }
  if (value.format === "latex" && !value.path.toLowerCase().endsWith(".tex")) {
    context.addIssue({ code: "custom", path: ["path"], message: "Single-file LaTeX handoff paths must end in .tex." });
  }
  if (value.format === "latex-project") {
    if (value.path_kind !== "directory") context.addIssue({ code: "custom", path: ["path_kind"], message: "LaTeX project handoffs require a directory path_kind." });
    if (!value.entry_path || !value.entry_path.toLowerCase().endsWith(".tex")) context.addIssue({ code: "custom", path: ["entry_path"], message: "LaTeX project handoffs require a .tex entry_path." });
  }
  if (value.path_kind === "directory" && value.format !== "latex-project") {
    context.addIssue({ code: "custom", path: ["path_kind"], message: "Only LaTeX projects may use directory path_kind." });
  }
});

export const RunHandoffInputEntrySchema = RunHandoffEntrySchema.extend({ source_run_id: StableIdSchema.optional() });
export const RunHandoffOutputEntrySchema = RunHandoffEntrySchema.extend({ intended_consumer: NonEmptySchema.optional() });

export const RunHandoffSchema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  run_id: StableIdSchema,
  updated_at: Rfc3339Schema,
  inputs: z.array(RunHandoffInputEntrySchema),
  outputs: z.array(RunHandoffOutputEntrySchema),
}).superRefine((value, context) => {
  unique(value.inputs, (item) => item.role, ["inputs"], "input role", context);
  unique(value.outputs, (item) => item.role, ["outputs"], "output role", context);
});

export const GraphRunStartCommandSchema = z.strictObject({
  schema_version: z.literal(GRAPH_WORKSPACE_SCHEMA_VERSION),
  confirmed_at: Rfc3339Schema,
  entry_id: StableIdSchema,
  entry_node_id: StableIdSchema,
  prerequisites: z.array(NonEmptySchema),
  handoff_inputs: z.array(RunHandoffInputEntrySchema),
  planned_outputs: z.array(RunHandoffOutputEntrySchema),
  formal_gates: z.array(StableIdSchema),
  cost: CostSchema,
}).superRefine((value, context) => {
  unique(value.prerequisites, (item) => item, ["prerequisites"], "prerequisite", context);
  unique(value.handoff_inputs, (item) => item.role, ["handoff_inputs"], "input role", context);
  unique(value.planned_outputs, (item) => item.role, ["planned_outputs"], "output role", context);
  unique(value.formal_gates, (item) => item, ["formal_gates"], "Gate", context);
});

export function renderRunHandoff(handoff: RunHandoff, body = "\n# Run handoff\n"): string {
  const normalizedBody = body.startsWith("\n") ? body : `\n${body}`;
  return `---\n${stringify(handoff)}---\n${normalizedBody}`;
}

export interface ParsedRunHandoff {
  frontmatter: z.infer<typeof RunHandoffSchema>;
  body: string;
}

export function parseRunHandoff(text: string): ParsedRunHandoff {
  if (!text.startsWith("---\n")) throw new Error("Handoff requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Handoff frontmatter is not closed.");
  return {
    frontmatter: RunHandoffSchema.parse(parseYaml(text.slice(4, end))),
    body: text.slice(end + 5),
  };
}

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

export type GraphWorkspaceConfig = z.infer<typeof GraphWorkspaceConfigSchema>;
export type SourcesSpecV2 = z.infer<typeof SourcesSpecV2Schema>;
export type ClaimsSpecV2 = z.infer<typeof ClaimsSpecV2Schema>;
export type ManuscriptSpecV2 = z.infer<typeof ManuscriptSpecV2Schema>;
export type GraphRun = z.infer<typeof GraphRunSchema>;
export type GraphNodeInstance = z.infer<typeof GraphNodeInstanceSchema>;
export type RunHandoff = z.infer<typeof RunHandoffSchema>;
export type RunHandoffInputEntry = z.infer<typeof RunHandoffInputEntrySchema>;
export type RunHandoffOutputEntry = z.infer<typeof RunHandoffOutputEntrySchema>;
export type GraphRunStartCommand = z.infer<typeof GraphRunStartCommandSchema>;
export type FrozenGraphProfile = z.infer<typeof CapabilityGraphProfileSchema>;
