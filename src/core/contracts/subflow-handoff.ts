import { parse as parseYaml, stringify } from "yaml";
import { z } from "zod";

import { QuartoFormatIdSchema, StableIdSchema } from "./stable-specs.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

const HandoffBaseSchema = z.strictObject({
  role: z.string().trim().min(1),
  type: z.string().trim().min(1),
  path: z.string().trim().min(1),
  purpose: z.string().trim().min(1),
  format: QuartoFormatIdSchema.optional(),
  renderer: z.literal("quarto").optional(),
  path_kind: z.enum(["file", "directory"]).optional(),
  entry_path: z.string().trim().min(1).optional(),
  limits: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().min(1).optional(),
}).superRefine(validateFormatDescriptor);

export const HandoffInputSchema = HandoffBaseSchema.extend({ source_instance_id: StableIdSchema.optional() });
export const HandoffOutputSchema = HandoffBaseSchema.extend({ intended_consumer: z.string().trim().min(1).optional() });

export const SubflowHandoffSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  subflow_instance_id: StableIdSchema,
  updated_at: z.iso.datetime({ offset: true }),
  inputs: z.array(HandoffInputSchema),
  outputs: z.array(HandoffOutputSchema),
}).superRefine((value, context) => {
  addDuplicateRoleIssues(value.inputs, "inputs", context);
  addDuplicateRoleIssues(value.outputs, "outputs", context);
});

export const SubflowHandoffInputSchema = z.strictObject({
  inputs: z.array(HandoffInputSchema),
  outputs: z.array(HandoffOutputSchema),
  body: z.string().optional(),
}).superRefine((value, context) => {
  addDuplicateRoleIssues(value.inputs, "inputs", context);
  addDuplicateRoleIssues(value.outputs, "outputs", context);
});

export function parseSubflowHandoff(text: string): { frontmatter: z.infer<typeof SubflowHandoffSchema>; body: string } {
  if (!text.startsWith("---\n")) throw new Error("Handoff requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Handoff frontmatter is not closed.");
  return {
    frontmatter: SubflowHandoffSchema.parse(parseYaml(text.slice(4, end))),
    body: text.slice(end + 5),
  };
}

export function renderSubflowHandoff(handoff: SubflowHandoff, body = "\n# Subflow handoff\n"): string {
  const normalizedBody = body.startsWith("\n") ? body : `\n${body}`;
  return `---\n${stringify(handoff)}---\n${normalizedBody}`;
}

function addDuplicateRoleIssues(values: readonly { role: string }[], field: string, context: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (seen.has(value.role)) context.addIssue({ code: "custom", path: [field, index, "role"], message: `Duplicate role: ${value.role}` });
    seen.add(value.role);
  }
}

function validateFormatDescriptor(
  value: { path: string; format?: string; renderer?: "quarto"; path_kind?: "file" | "directory"; entry_path?: string },
  context: z.RefinementCtx,
): void {
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
}

export type SubflowHandoff = z.infer<typeof SubflowHandoffSchema>;
export type SubflowHandoffInput = z.infer<typeof SubflowHandoffInputSchema>;
