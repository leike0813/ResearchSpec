import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { ClaimRecordSchema, SourceRecordSchema, StableIdSchema } from "./stable-specs.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

export const ProjectChangeTargetSchema = z.enum(["project.md", "sources.yaml", "claims.yaml", "manuscript.yaml"]);
export const ProjectChangeOutcomeSchema = z.enum(["accepted", "rejected", "deferred", "superseded"]);
export const ProjectChangeStatusSchema = z.enum(["draft", "proposed", "accepted", "rejected", "deferred", "superseded", "applied"]);

export const ProjectChangeFrontmatterSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  id: StableIdSchema,
  status: ProjectChangeStatusSchema,
  targets: z.array(ProjectChangeTargetSchema).min(1),
  decision: z.strictObject({
    outcome: ProjectChangeOutcomeSchema,
    decided_by: z.string().trim().min(1),
    decided_at: z.iso.datetime({ offset: true }),
    reason: z.string().trim().min(1),
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
  addDuplicateTargets(value.targets, context);
});

const SourceDeltaValueSchema = SourceRecordSchema;
const ClaimDeltaValueSchema = ClaimRecordSchema;

const SourceDeltaRecordSchema = z.discriminatedUnion("operation", [
  z.strictObject({ operation: z.literal("add"), target: z.literal("sources"), id: StableIdSchema, value: SourceDeltaValueSchema }),
  z.strictObject({ operation: z.literal("update"), target: z.literal("sources"), id: StableIdSchema, value: SourceDeltaValueSchema }),
  z.strictObject({ operation: z.literal("remove"), target: z.literal("sources"), id: StableIdSchema }),
]);

const ClaimDeltaRecordSchema = z.discriminatedUnion("operation", [
  z.strictObject({ operation: z.literal("add"), target: z.literal("claims"), id: StableIdSchema, value: ClaimDeltaValueSchema }),
  z.strictObject({ operation: z.literal("update"), target: z.literal("claims"), id: StableIdSchema, value: ClaimDeltaValueSchema }),
  z.strictObject({ operation: z.literal("remove"), target: z.literal("claims"), id: StableIdSchema }),
]);

export const ProjectChangeDeltaRecordSchema = z.union([SourceDeltaRecordSchema, ClaimDeltaRecordSchema])
  .superRefine((value, context) => {
    if (value.operation === "remove") return;
    const valueId = value.target === "sources" ? value.value.source_id : value.value.claim_id;
    if (valueId !== value.id) context.addIssue({ code: "custom", path: ["value", value.target === "sources" ? "source_id" : "claim_id"], message: "Delta value ID must match the operation ID." });
  });

export const ProjectChangeDeltaSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  operations: z.array(ProjectChangeDeltaRecordSchema),
}).superRefine((value, context) => {
  const seen = new Set<string>();
  for (const [index, operation] of value.operations.entries()) {
    const key = `${operation.target}:${operation.id}`;
    if (seen.has(key)) context.addIssue({ code: "custom", path: ["operations", index], message: `Duplicate delta operation: ${key}` });
    seen.add(key);
  }
});

export function parseProjectChange(text: string): { frontmatter: z.infer<typeof ProjectChangeFrontmatterSchema>; body: string } {
  if (!text.startsWith("---\n")) throw new Error("Project change requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Project change frontmatter is not closed.");
  const body = text.slice(end + 5);
  if (!body.trim()) throw new Error("Project change requires a semantic Markdown body.");
  return {
    frontmatter: ProjectChangeFrontmatterSchema.parse(parseYaml(text.slice(4, end))),
    body,
  };
}

function addDuplicateTargets(targets: readonly string[], context: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (const [index, target] of targets.entries()) {
    if (seen.has(target)) context.addIssue({ code: "custom", path: ["targets", index], message: `Duplicate target: ${target}` });
    seen.add(target);
  }
}

export type ProjectChange = ReturnType<typeof parseProjectChange>;
export type ProjectChangeDelta = z.infer<typeof ProjectChangeDeltaSchema>;
