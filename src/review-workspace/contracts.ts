import { z } from "zod";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const NonEmptySchema = z.string().trim().min(1);

export const ReviewWorkspaceAdapterSchema = z.enum([
  "annotation-intake",
  "paper-humanizer",
  "review-response",
]);

export const ReviewWorkspaceManuscriptSchema = z.strictObject({
  path: NonEmptySchema,
  entry_path: NonEmptySchema.nullable(),
  format: z.enum(["markdown", "quarto", "latex", "latex-project", "plain"]),
  sha256: Sha256Schema,
  content: z.string(),
});

export const ReviewWorkspaceTargetSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("document") }),
  z.strictObject({ kind: z.literal("section"), heading: NonEmptySchema }),
  z.strictObject({ kind: z.literal("block"), block_id: SafeIdSchema, block_sha256: Sha256Schema }),
  z.strictObject({
    kind: z.literal("quote"),
    block_id: SafeIdSchema,
    block_sha256: Sha256Schema,
    exact_quote: z.string().min(1),
    prefix: z.string(),
    suffix: z.string(),
  }),
  z.strictObject({ kind: z.literal("locator"), label: NonEmptySchema }),
]);

export const ReviewDispositionSchema = z.enum(["pending", "include", "exclude", "revise", "defer"]);

export const ReviewWorkspaceItemSchema = z.strictObject({
  item_id: SafeIdSchema,
  title: NonEmptySchema,
  source_text: z.string().min(1),
  source_pointer: z.string(),
  target: ReviewWorkspaceTargetSchema,
  recommendation: z.strictObject({
    action: NonEmptySchema,
    rationale: NonEmptySchema,
    proposed_text: z.string().nullable(),
    risk: NonEmptySchema,
  }),
  initial_disposition: ReviewDispositionSchema,
  metadata: z.record(z.string(), z.unknown()),
});

export const ReviewWorkspaceDescriptorSchema = z.strictObject({
  schema_version: z.literal("1"),
  workspace_id: SafeIdSchema,
  adapter: ReviewWorkspaceAdapterSchema,
  title: NonEmptySchema,
  manuscript: ReviewWorkspaceManuscriptSchema,
  items: z.array(ReviewWorkspaceItemSchema).min(1),
  workflow: z.strictObject({
    selector: NonEmptySchema.nullable(),
    formal_action: z.enum(["none", "gate", "decision"]),
    mutation_authority: z.literal("researchspec-cli-only"),
    handoff_instruction: NonEmptySchema,
  }),
}).superRefine((value, context) => {
  if (new Set(value.items.map((item) => item.item_id)).size !== value.items.length) {
    context.addIssue({ code: "custom", message: "Review item IDs must be unique.", path: ["items"] });
  }
  if (value.manuscript.format === "latex-project" && value.manuscript.entry_path === null) {
    context.addIssue({ code: "custom", message: "LaTeX project review requires entry_path.", path: ["manuscript", "entry_path"] });
  }
});

export const ReviewWorkspaceDecisionSchema = z.strictObject({
  item_id: SafeIdSchema,
  disposition: ReviewDispositionSchema,
  note: z.string(),
  proposed_text: z.string().nullable(),
});

export const ReviewWorkspaceResultSchema = z.strictObject({
  schema_version: z.literal("1"),
  workspace: ReviewWorkspaceDescriptorSchema,
  source_sha256: Sha256Schema,
  decisions: z.array(ReviewWorkspaceDecisionSchema).min(1),
  overall_note: z.string(),
  exported_at: z.iso.datetime({ offset: true }),
}).superRefine((value, context) => {
  if (value.source_sha256 !== value.workspace.manuscript.sha256) {
    context.addIssue({ code: "custom", message: "Result source hash must match the workspace manuscript.", path: ["source_sha256"] });
  }
  const expected = new Set(value.workspace.items.map((item) => item.item_id));
  const actual = value.decisions.map((item) => item.item_id);
  if (new Set(actual).size !== actual.length || actual.length !== expected.size || actual.some((id) => !expected.has(id))) {
    context.addIssue({ code: "custom", message: "Result decisions must cover every workspace item exactly once.", path: ["decisions"] });
  }
});

export type ReviewWorkspaceAdapter = z.infer<typeof ReviewWorkspaceAdapterSchema>;
export type ReviewWorkspaceDescriptor = z.infer<typeof ReviewWorkspaceDescriptorSchema>;
export type ReviewWorkspaceItem = z.infer<typeof ReviewWorkspaceItemSchema>;
export type ReviewWorkspaceResult = z.infer<typeof ReviewWorkspaceResultSchema>;
export type ReviewDisposition = z.infer<typeof ReviewDispositionSchema>;
