import { createHash } from "node:crypto";

import { parseAnchoredBlocks } from "../core/runtime/markdown-blocks.js";
import { ReviewDeltaSchema, type AnnotationIntakeDiagnostic, type ReviewDelta } from "./contracts.js";

export function deriveReviewDelta(input: {
  baseText: string;
  templateText: string;
  reviewText: string;
}): ReviewDelta {
  const diagnostics: AnnotationIntakeDiagnostic[] = [];
  let templateBlocks;
  let reviewBlocks;
  try {
    templateBlocks = parseAnchoredBlocks(input.templateText);
    reviewBlocks = parseAnchoredBlocks(input.reviewText);
  } catch (error) {
    diagnostics.push({
      code: "annotation_review_structure_ambiguous",
      message: error instanceof Error ? error.message : String(error),
      blocking: true,
    });
    return ReviewDeltaSchema.parse({
      schema_version: "1",
      base_sha256: sha256(input.baseText),
      template_sha256: sha256(input.templateText),
      review_sha256: sha256(input.reviewText),
      entries: input.templateText === input.reviewText ? [] : [{
        delta_id: `delta-${sha256(`${input.templateText}\0${input.reviewText}`).slice(0, 20)}`,
        kind: "unmatched_document",
        before_text: input.templateText,
        after_text: input.reviewText,
        review_start_byte: 0,
        review_end_byte: Buffer.byteLength(input.reviewText),
      }],
      diagnostics,
    });
  }

  const templateById = new Map(templateBlocks.map((block) => [block.id, block]));
  const reviewById = new Map(reviewBlocks.map((block) => [block.id, block]));
  const entries: ReviewDelta["entries"] = [];
  const templatePrefix = input.templateText.slice(0, templateBlocks[0]?.markerStart ?? input.templateText.length);
  const reviewPrefix = input.reviewText.slice(0, reviewBlocks[0]?.markerStart ?? input.reviewText.length);
  if (templatePrefix !== reviewPrefix) {
    entries.push({
      delta_id: `delta-${sha256(`document\0${templatePrefix}\0${reviewPrefix}`).slice(0, 20)}`,
      kind: "unmatched_document",
      before_text: templatePrefix,
      after_text: reviewPrefix,
      review_start_byte: 0,
      review_end_byte: Buffer.byteLength(reviewPrefix),
    });
  }
  for (const block of templateBlocks) {
    const current = reviewById.get(block.id);
    if (!current) {
      entries.push(entry("missing_block", block.id, block.content, "", 0, 0));
      continue;
    }
    if (current.content !== block.content) {
      entries.push(entry(
        "changed_block",
        block.id,
        block.content,
        current.content,
        byteOffset(input.reviewText, current.markerStart),
        byteOffset(input.reviewText, current.end),
      ));
    }
  }
  for (const block of reviewBlocks) {
    if (templateById.has(block.id)) continue;
    entries.push(entry(
      "added_block",
      block.id,
      "",
      block.content,
      byteOffset(input.reviewText, block.markerStart),
      byteOffset(input.reviewText, block.end),
    ));
  }
  if (entries.length === 0 && input.reviewText !== input.templateText) {
    diagnostics.push({
      code: "annotation_review_delta_unmapped",
      message: "Review bytes changed without a stable block-level difference.",
      blocking: true,
    });
  }
  return ReviewDeltaSchema.parse({
    schema_version: "1",
    base_sha256: sha256(input.baseText),
    template_sha256: sha256(input.templateText),
    review_sha256: sha256(input.reviewText),
    entries,
    diagnostics,
  });
}

function entry(
  kind: ReviewDelta["entries"][number]["kind"],
  blockId: string,
  beforeText: string,
  afterText: string,
  reviewStartByte: number,
  reviewEndByte: number,
): ReviewDelta["entries"][number] {
  return {
    delta_id: `delta-${sha256(`${kind}\0${blockId}\0${beforeText}\0${afterText}`).slice(0, 20)}`,
    kind,
    block_id: blockId,
    before_text: beforeText,
    after_text: afterText,
    review_start_byte: reviewStartByte,
    review_end_byte: reviewEndByte,
  };
}

function byteOffset(value: string, codeUnitOffset: number): number {
  return Buffer.byteLength(value.slice(0, codeUnitOffset));
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
