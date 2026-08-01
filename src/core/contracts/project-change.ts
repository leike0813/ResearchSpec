import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

export const ProjectChangeTargetSchema = z.enum(["project.md", "sources.yaml", "claims.yaml", "manuscript.yaml"]);
export const ProjectChangeOutcomeSchema = z.enum(["accepted", "rejected", "deferred", "superseded"]);

export const ProjectChangeFrontmatterSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  id: StableIdSchema,
  status: z.enum(["proposed", "accepted", "rejected", "deferred", "superseded", "applied"]),
  targets: z.array(ProjectChangeTargetSchema).min(1),
  decision: z.strictObject({
    outcome: ProjectChangeOutcomeSchema,
    decided_by: z.string().trim().min(1),
    decided_at: z.iso.datetime({ offset: true }),
    reason: z.string().trim().min(1),
  }).nullable().optional(),
}).superRefine((value, context) => {
  const resolved = value.status !== "proposed";
  if (resolved && !value.decision) context.addIssue({ code: "custom", path: ["decision"], message: "Resolved changes require a decision." });
  if (!resolved && value.decision) context.addIssue({ code: "custom", path: ["decision"], message: "Proposed changes cannot contain a decision." });
  if (value.status === "applied" && value.decision?.outcome !== "accepted") {
    context.addIssue({ code: "custom", path: ["status"], message: "Only accepted changes can become applied." });
  }
});

const DeltaRecordSchema = z.strictObject({
  operation: z.enum(["add", "update", "remove"]),
  target: z.enum(["sources", "claims"]),
  id: StableIdSchema,
  value: z.record(z.string(), z.unknown()).optional(),
}).superRefine((value, context) => {
  if (value.operation !== "remove" && value.value === undefined) context.addIssue({ code: "custom", path: ["value"], message: "Add and update require a value." });
  if (value.operation === "remove" && value.value !== undefined) context.addIssue({ code: "custom", path: ["value"], message: "Remove cannot contain a value." });
});

export const ProjectChangeDeltaSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  operations: z.array(DeltaRecordSchema),
});

export function parseProjectChange(text: string): { frontmatter: z.infer<typeof ProjectChangeFrontmatterSchema>; body: string } {
  if (!text.startsWith("---\n")) throw new Error("Project change requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Project change frontmatter is not closed.");
  return {
    frontmatter: ProjectChangeFrontmatterSchema.parse(parseYaml(text.slice(4, end))),
    body: text.slice(end + 5),
  };
}
