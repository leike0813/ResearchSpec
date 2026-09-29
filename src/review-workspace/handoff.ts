import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { compareReviewSources, readFrozenSource, type FrozenSourceSet } from "./prepare.js";
import { validateReviewResultAgainstWorkspace, type ReviewWorkspaceV2 } from "./v2.js";

export interface ReviewHandoffCheck {
  status: "ready" | "source-changed" | "needs-location";
  changed_files: Array<{ path: string; status: "changed" | "missing"; frozen_text: string | null; current_text: string | null }>;
  affected_comment_ids: string[];
  ambiguous_comment_ids: string[];
  capture_limitations: string[];
}

const hash = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
const textOrNull = (bytes: Buffer): string | null => bytes.includes(0) ? null : bytes.toString("utf8");

/** Validate a browser result and classify the questions the owning Agent must resolve. */
export async function inspectReviewHandoff(input: {
  result: unknown;
  retainedWorkspace: ReviewWorkspaceV2;
  frozen: FrozenSourceSet;
  projectRoot: string;
  workRoot: string;
}): Promise<ReviewHandoffCheck> {
  const result = validateReviewResultAgainstWorkspace(input.result, input.retainedWorkspace);
  const workspace = result.workspace;
  if (input.frozen.workspace_id !== workspace.workspace_id || input.frozen.entry_path !== workspace.source.entry_path || JSON.stringify(input.frozen.files) !== JSON.stringify(workspace.source.files)) {
    throw new Error("Retained frozen source manifest does not match the review workspace.");
  }
  for (const file of input.frozen.files) {
    const bytes = await readFrozenSource(input.workRoot, input.frozen.workspace_id, file.path);
    if (hash(bytes) !== file.sha256) throw new Error(`Retained frozen source has changed: ${file.path}`);
  }
  const changes = await compareReviewSources(input.projectRoot, input.frozen);
  const changedFiles = await Promise.all(changes.map(async (item) => {
    const frozen = await readFrozenSource(input.workRoot, input.frozen.workspace_id, item.path);
    const current = item.status === "missing" ? null : await readFile(path.join(input.projectRoot, item.path));
    return { path: item.path, status: item.status, frozen_text: textOrNull(frozen), current_text: current ? textOrNull(current) : null };
  }));
  if (changedFiles.length > 0) return {
    status: "source-changed", changed_files: changedFiles,
    affected_comment_ids: result.comments.map((comment) => comment.comment_id),
    ambiguous_comment_ids: [], capture_limitations: input.frozen.capture_limitations,
  };
  const blocks = new Map(workspace.document.blocks.map((block) => [block.id, block]));
  const ambiguous: string[] = [];
  for (const comment of result.comments) {
    const block = blocks.get(comment.anchor.block_id);
    const sourcePath = block?.source_path;
    if (!sourcePath || comment.anchor.exact_quote.length === 0) { ambiguous.push(comment.comment_id); continue; }
    const source = (await readFrozenSource(input.workRoot, input.frozen.workspace_id, sourcePath)).toString("utf8");
    const quote = comment.anchor.exact_quote;
    const context = comment.anchor.prefix + quote + comment.anchor.suffix;
    // Rendered text may not occur verbatim in Markdown/LaTeX source; the Agent can inspect the frozen source.
    if (source.includes(context) && source.split(context).length > 2) ambiguous.push(comment.comment_id);
  }
  return {
    status: ambiguous.length > 0 || input.frozen.capture_limitations.length > 0 ? "needs-location" : "ready",
    changed_files: [], affected_comment_ids: [], ambiguous_comment_ids: ambiguous,
    capture_limitations: input.frozen.capture_limitations,
  };
}
