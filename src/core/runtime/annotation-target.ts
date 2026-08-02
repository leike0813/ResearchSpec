import type { z } from "zod";

import { AnnotationTargetSchema } from "../contracts/annotation.js";
import { markdownSectionHeadings, parseAnchoredBlocks } from "../../arsu-converter/revision/markdown-blocks.js";

export type AnnotationTarget = z.infer<typeof AnnotationTargetSchema>;

export class AnnotationTargetError extends Error {
  constructor(readonly code: string, message: string, readonly conflict: boolean) {
    super(message);
    this.name = "AnnotationTargetError";
  }
}

export function validateAnnotationTargetAgainstMarkdown(text: string, target: AnnotationTarget): void {
  if (target.kind === "document") return;
  if (target.kind === "section") {
    const headings = markdownSectionHeadings(text);
    if (headings.filter((heading) => heading === target.heading).length !== 1) {
      throw new AnnotationTargetError(
        "annotation_section_not_unique",
        `Annotation section target is missing or ambiguous: ${target.heading}`,
        false,
      );
    }
    return;
  }
  const block = parseAnchoredBlocks(text).find((item) => item.id === target.block_id);
  if (!block) {
    throw new AnnotationTargetError(
      "annotation_block_missing",
      `Annotation block target is missing: ${target.block_id}`,
      false,
    );
  }
  if (block.hash !== target.block_sha256) {
    throw new AnnotationTargetError(
      "annotation_block_hash_mismatch",
      `Annotation block hash has drifted: ${target.block_id}`,
      true,
    );
  }
  if (target.kind !== "quote") return;
  const first = block.content.indexOf(target.exact_quote);
  const last = block.content.lastIndexOf(target.exact_quote);
  if (first < 0 || first !== last) {
    throw new AnnotationTargetError(
      "annotation_quote_not_unique",
      `Annotation quote must occur exactly once in block ${target.block_id}.`,
      false,
    );
  }
  const before = block.content.slice(0, first);
  const after = block.content.slice(first + target.exact_quote.length);
  if (!before.endsWith(target.prefix) || !after.startsWith(target.suffix)) {
    throw new AnnotationTargetError(
      "annotation_quote_context_mismatch",
      `Annotation quote context has drifted in block ${target.block_id}.`,
      true,
    );
  }
}
