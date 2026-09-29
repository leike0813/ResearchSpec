import { isDeepStrictEqual } from "node:util";
import { z } from "zod";

import {
  ReviewDispositionSchema,
  ReviewWorkspaceAdapterSchema,
  ReviewWorkspaceDecisionSchema,
  ReviewWorkspaceItemSchema,
} from "./contracts.js";

const Id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const Hash = z.string().regex(/^[a-f0-9]{64}$/);
const NonEmpty = z.string().trim().min(1);
const RelativePath = z.string().min(1).refine((value) => !value.startsWith("/") && !value.split(/[\\/]/).includes(".."));

export const ReviewBlockKindSchema = z.enum([
  "heading", "paragraph", "table-cell", "footnote", "bibliography", "code", "raw-source", "formula", "image", "citation",
]);
const MarkSchema = z.enum(["strong", "emphasis", "code", "link", "subscript", "superscript"]);
export const ReviewBlockSchema = z.strictObject({
  id: Id,
  kind: ReviewBlockKindSchema,
  text: z.string(),
  runs: z.array(z.strictObject({ text: z.string(), marks: z.array(MarkSchema) })).default([]),
  level: z.number().int().min(1).max(6).nullable(),
  source_path: RelativePath.nullable(),
  resource_id: Id.nullable(),
  note: z.string().nullable(),
}).superRefine((block, context) => {
  if (block.runs.length > 0 && block.runs.map((run) => run.text).join("") !== block.text) {
    context.addIssue({ code: "custom", message: "Block runs must match visible text.", path: ["runs"] });
  }
  if ((block.kind === "heading") !== (block.level !== null)) {
    context.addIssue({ code: "custom", message: "Only headings have a level.", path: ["level"] });
  }
  if (block.kind === "image" && !block.resource_id) {
    context.addIssue({ code: "custom", message: "Image block requires an asset ID.", path: ["resource_id"] });
  }
});

export const ReviewAssetSchema = z.strictObject({
  id: Id,
  mime: z.enum(["image/png", "image/jpeg", "image/gif", "image/webp"]),
  base64: z.base64(),
  source_path: RelativePath.nullable(),
});

export const ReviewWorkspaceV2Schema = z.strictObject({
  schema_version: z.literal("2"),
  workspace_id: Id,
  snapshot_id: Id,
  adapter: ReviewWorkspaceAdapterSchema,
  title: NonEmpty,
  source: z.strictObject({
    format: z.enum(["markdown", "quarto", "latex", "latex-project", "plain"]),
    entry_path: RelativePath,
    files: z.array(z.strictObject({ path: RelativePath, sha256: Hash })).min(1),
    capture_limitations: z.array(z.string()),
  }),
  document: z.strictObject({ blocks: z.array(ReviewBlockSchema).min(1) }),
  assets: z.array(ReviewAssetSchema),
  items: z.array(ReviewWorkspaceItemSchema),
  workflow: z.strictObject({
    selector: NonEmpty.nullable(),
    formal_action: z.enum(["none", "gate", "decision"]),
    mutation_authority: z.literal("researchspec-cli-only"),
    handoff_instruction: NonEmpty,
  }),
}).superRefine((workspace, context) => {
  const unique = (values: string[]) => new Set(values).size === values.length;
  if (!unique(workspace.source.files.map((file) => file.path))) context.addIssue({ code: "custom", message: "Duplicate source path.", path: ["source", "files"] });
  if (workspace.source.files.some((file, index) => index > 0 && (workspace.source.files[index - 1]?.path ?? "") > file.path)) context.addIssue({ code: "custom", message: "Source paths must be sorted.", path: ["source", "files"] });
  if (!workspace.source.files.some((file) => file.path === workspace.source.entry_path)) context.addIssue({ code: "custom", message: "Entry path missing from source set.", path: ["source", "entry_path"] });
  if (!unique(workspace.document.blocks.map((block) => block.id))) context.addIssue({ code: "custom", message: "Duplicate block ID.", path: ["document", "blocks"] });
  if (!unique(workspace.assets.map((asset) => asset.id))) context.addIssue({ code: "custom", message: "Duplicate asset ID.", path: ["assets"] });
  if (!unique(workspace.items.map((item) => item.item_id))) context.addIssue({ code: "custom", message: "Duplicate item ID.", path: ["items"] });
  const assets = new Set(workspace.assets.map((asset) => asset.id));
  const paths = new Set(workspace.source.files.map((file) => file.path));
  for (const [index, block] of workspace.document.blocks.entries()) {
    if (block.kind === "image" && block.resource_id && !assets.has(block.resource_id)) context.addIssue({ code: "custom", message: "Missing image asset.", path: ["document", "blocks", index, "resource_id"] });
    if (block.source_path && !paths.has(block.source_path)) context.addIssue({ code: "custom", message: "Block source path not captured.", path: ["document", "blocks", index, "source_path"] });
  }
  for (const [index, asset] of workspace.assets.entries()) {
    if (asset.source_path && !paths.has(asset.source_path)) context.addIssue({ code: "custom", message: "Asset source path not captured.", path: ["assets", index, "source_path"] });
  }
});

export const ReviewAnchorSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("text"), snapshot_id: Id, block_id: Id, start: z.number().int().min(0), end: z.number().int().min(1), exact_quote: NonEmpty, prefix: z.string(), suffix: z.string() }),
  z.strictObject({ kind: z.literal("whole"), snapshot_id: Id, block_id: Id, exact_quote: z.string(), prefix: z.string(), suffix: z.string(), resource_id: Id.nullable() }),
]);

export const ReviewUserCommentSchema = z.strictObject({
  comment_id: Id,
  origin: z.literal("user"),
  body: NonEmpty,
  anchor: ReviewAnchorSchema,
});

export const ReviewWorkspaceResultV2Schema = z.strictObject({
  schema_version: z.literal("2"),
  workspace: ReviewWorkspaceV2Schema,
  snapshot_id: Id,
  export_revision: z.number().int().min(1),
  decisions: z.array(ReviewWorkspaceDecisionSchema),
  comments: z.array(ReviewUserCommentSchema),
  overall_note: z.string(),
  exported_at: z.iso.datetime({ offset: true }),
}).superRefine((result, context) => {
  const workspace = result.workspace;
  if (result.snapshot_id !== workspace.snapshot_id) context.addIssue({ code: "custom", message: "Snapshot mismatch.", path: ["snapshot_id"] });
  const expected = new Set(workspace.items.map((item) => item.item_id));
  const actual = result.decisions.map((decision) => decision.item_id);
  if (actual.length !== expected.size || new Set(actual).size !== actual.length || actual.some((id) => !expected.has(id))) context.addIssue({ code: "custom", message: "Decisions must cover Agent items once.", path: ["decisions"] });
  if (new Set(result.comments.map((comment) => comment.comment_id)).size !== result.comments.length) context.addIssue({ code: "custom", message: "Duplicate comment ID.", path: ["comments"] });
  const agentIds = new Set(workspace.items.map((item) => item.item_id));
  if (result.comments.some((comment) => agentIds.has(comment.comment_id))) context.addIssue({ code: "custom", message: "User comment ID collides with an Agent item.", path: ["comments"] });
  const blocks = new Map(workspace.document.blocks.map((block) => [block.id, block]));
  for (const [index, comment] of result.comments.entries()) {
    const anchor = comment.anchor;
    const block = blocks.get(anchor.block_id);
    if (!block || anchor.snapshot_id !== workspace.snapshot_id) {
      context.addIssue({ code: "custom", message: "Comment target missing or stale.", path: ["comments", index, "anchor"] });
      continue;
    }
    if (anchor.kind === "text") {
      if (anchor.end <= anchor.start || block.text.slice(anchor.start, anchor.end) !== anchor.exact_quote) context.addIssue({ code: "custom", message: "Selected quote does not match block text.", path: ["comments", index, "anchor"] });
      if (!block.text.slice(0, anchor.start).endsWith(anchor.prefix) || !block.text.slice(anchor.end).startsWith(anchor.suffix)) context.addIssue({ code: "custom", message: "Selected context does not match block text.", path: ["comments", index, "anchor"] });
    } else if (anchor.exact_quote !== block.text || anchor.resource_id !== block.resource_id) {
      context.addIssue({ code: "custom", message: "Whole-block context does not match.", path: ["comments", index, "anchor"] });
    }
  }
});

export type ReviewWorkspaceV2 = z.infer<typeof ReviewWorkspaceV2Schema>;
export type ReviewBlock = z.infer<typeof ReviewBlockSchema>;
export type ReviewAnchor = z.infer<typeof ReviewAnchorSchema>;
export type ReviewWorkspaceResultV2 = z.infer<typeof ReviewWorkspaceResultV2Schema>;

export function createReviewWorkspaceResultV2(input: {
  workspace: ReviewWorkspaceV2;
  revision: number;
  decisions?: Array<{ item_id: string; disposition: z.infer<typeof ReviewDispositionSchema>; note: string; proposed_text: string | null }>;
  comments?: Array<z.infer<typeof ReviewUserCommentSchema>>;
  overallNote?: string;
  exportedAt: string;
}): ReviewWorkspaceResultV2 {
  const workspace = ReviewWorkspaceV2Schema.parse(input.workspace);
  const decisions = new Map(input.decisions?.map((decision) => [decision.item_id, decision]));
  return ReviewWorkspaceResultV2Schema.parse({
    schema_version: "2", workspace, snapshot_id: workspace.snapshot_id, export_revision: input.revision,
    decisions: workspace.items.map((item) => decisions.get(item.item_id) ?? { item_id: item.item_id, disposition: item.initial_disposition, note: "", proposed_text: item.recommendation.proposed_text }),
    comments: input.comments ?? [], overall_note: input.overallNote ?? "", exported_at: input.exportedAt,
  });
}

export function validateReviewResultAgainstWorkspace(result: unknown, retainedWorkspace: unknown): ReviewWorkspaceResultV2 {
  const workspace = ReviewWorkspaceV2Schema.parse(retainedWorkspace);
  const parsed = ReviewWorkspaceResultV2Schema.parse(result);
  if (!isDeepStrictEqual(parsed.workspace, workspace)) throw new Error("Review result does not match the retained frozen workspace.");
  return parsed;
}
