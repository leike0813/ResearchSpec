import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

export const StableIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
  .refine((value) => !value.includes(".."), "ID cannot contain '..'");
const ExtensionsSchema = z.record(z.string(), z.unknown()).optional();

export const ManuscriptWorkingFormatSchema = z.enum(["markdown", "qmd"]);
export const QuartoFormatIdSchema = z.string().trim().regex(
  /^[a-z0-9][a-z0-9._+-]*$/,
  "Quarto format ID must contain only lowercase letters, digits, dots, underscores, plus signs, and hyphens.",
);
export const ManuscriptDeliverySchema = z.strictObject({
  working_format: ManuscriptWorkingFormatSchema.nullable(),
  final_output_format: QuartoFormatIdSchema.nullable(),
}).superRefine((value, context) => {
  if (value.working_format === "qmd" && value.final_output_format === null) {
    context.addIssue({
      code: "custom",
      path: ["final_output_format"],
      message: "QMD delivery requires a final Quarto output format.",
    });
  }
});

export const ProjectFrontmatterSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  project_id: StableIdSchema,
  working_name: z.string().trim().min(1).nullable().optional(),
  extensions: ExtensionsSchema,
});

export const SourceRecordSchema = z.strictObject({
  source_id: StableIdSchema,
  title: z.string().trim().min(1),
  authors: z.array(z.string().trim().min(1)).optional(),
  year: z.union([z.number().int(), z.string().trim().min(1)]).optional(),
  identifiers: z.record(z.string(), z.string().trim().min(1)).optional(),
  source_type: z.string().trim().min(1),
  use_scope: z.string().trim().min(1).optional(),
  limits: z.array(z.string().trim().min(1)).optional(),
  extensions: ExtensionsSchema,
});

export const SourcesSpecSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  sources: z.array(SourceRecordSchema),
  extensions: ExtensionsSchema,
});

export const ClaimRecordSchema = z.strictObject({
  claim_id: StableIdSchema,
  wording: z.string().trim().min(1),
  strength: z.enum(["tentative", "supported", "strong"]),
  supporting_source_ids: z.array(StableIdSchema),
  scope: z.string().trim().min(1).optional(),
  limits: z.array(z.string().trim().min(1)).optional(),
  extensions: ExtensionsSchema,
});

export const ClaimsSpecSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  claims: z.array(ClaimRecordSchema),
  extensions: ExtensionsSchema,
});

export const ManuscriptSectionSchema = z.strictObject({
  section_id: StableIdSchema,
  title: z.string().trim().min(1),
  intent: z.string().trim().min(1),
  claim_ids: z.array(StableIdSchema).optional(),
  extensions: ExtensionsSchema,
});

export const ManuscriptSpecSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
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
  extensions: ExtensionsSchema,
});

export interface ParsedProjectSpec {
  frontmatter: z.infer<typeof ProjectFrontmatterSchema>;
  body: string;
}

export function parseProjectSpec(text: string): ParsedProjectSpec {
  if (!text.startsWith("---\n")) throw new Error("Project spec requires YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Project spec frontmatter is not closed.");
  const frontmatter = ProjectFrontmatterSchema.parse(parseYaml(text.slice(4, end)));
  return { frontmatter, body: text.slice(end + 5) };
}

export type SourcesSpec = z.infer<typeof SourcesSpecSchema>;
export type ClaimsSpec = z.infer<typeof ClaimsSpecSchema>;
export type ManuscriptSpec = z.infer<typeof ManuscriptSpecSchema>;
