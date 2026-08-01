import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

const HandoffBaseSchema = z.strictObject({
  role: z.string().trim().min(1),
  type: z.string().trim().min(1),
  path: z.string().trim().min(1),
  purpose: z.string().trim().min(1),
  limits: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().min(1).optional(),
});

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

export function parseSubflowHandoff(text: string): { frontmatter: z.infer<typeof SubflowHandoffSchema>; body: string } {
  if (!text.startsWith("---\n")) throw new Error("Handoff requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Handoff frontmatter is not closed.");
  return {
    frontmatter: SubflowHandoffSchema.parse(parseYaml(text.slice(4, end))),
    body: text.slice(end + 5),
  };
}

function addDuplicateRoleIssues(values: readonly { role: string }[], field: string, context: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (seen.has(value.role)) context.addIssue({ code: "custom", path: [field, index, "role"], message: `Duplicate role: ${value.role}` });
    seen.add(value.role);
  }
}

export type SubflowHandoff = z.infer<typeof SubflowHandoffSchema>;
