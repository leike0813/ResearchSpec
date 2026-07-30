import { createHash } from "node:crypto";

import { parseAnchoredBlocks } from "../core/runtime/markdown-blocks.js";
import {
  GeneratedReviewCopySchema,
  type AnnotationSlotDensity,
  type GeneratedReviewCopy,
} from "./contracts.js";

interface PendingSlot {
  slot_id: string;
  target: GeneratedReviewCopy["slots"][number]["target"];
  rendered: string;
}

export function generateAnnotationReviewCopy(input: {
  baseText: string;
  slotDensity?: AnnotationSlotDensity;
}): GeneratedReviewCopy {
  const slotDensity = input.slotDensity ?? "section";
  const baseSha256 = sha256(input.baseText);
  if (slotDensity === "none") {
    return GeneratedReviewCopySchema.parse({
      schema_version: "1",
      base_sha256: baseSha256,
      slot_density: slotDensity,
      template_sha256: baseSha256,
      content: input.baseText,
      slots: [],
    });
  }

  const blocks = parseAnchoredBlocks(input.baseText);
  const insertions = new Map<number, PendingSlot[]>();
  addInsertion(insertions, blocks[0]?.markerStart ?? input.baseText.length, slot("slot-document", { kind: "document" }));
  for (const block of blocks) {
    const heading = firstHeading(block.content);
    if (heading && slotDensity === "section") {
      addInsertion(insertions, block.end, slot(`slot-section-${safeFragment(heading)}-${block.id}`, { kind: "section", heading }));
    }
    if (slotDensity === "block") {
      addInsertion(insertions, block.end, slot(`slot-block-${block.id}`, { kind: "block", block_id: block.id }));
    }
  }

  let content = "";
  let cursor = 0;
  const slots: GeneratedReviewCopy["slots"] = [];
  for (const offset of [...insertions.keys()].sort((left, right) => left - right)) {
    content += input.baseText.slice(cursor, offset);
    cursor = offset;
    for (const pending of insertions.get(offset) ?? []) {
      const startByte = Buffer.byteLength(content);
      content += pending.rendered;
      slots.push({
        slot_id: pending.slot_id,
        target: pending.target,
        start_byte: startByte,
        end_byte: Buffer.byteLength(content),
        template_sha256: sha256(pending.rendered),
      });
    }
  }
  content += input.baseText.slice(cursor);
  return GeneratedReviewCopySchema.parse({
    schema_version: "1",
    base_sha256: baseSha256,
    slot_density: slotDensity,
    template_sha256: sha256(content),
    content,
    slots,
  });
}

export function removeUntouchedAnnotationSlots(reviewCopy: GeneratedReviewCopy): string {
  let content = reviewCopy.content;
  for (const slotInfo of [...reviewCopy.slots].sort((left, right) => right.start_byte - left.start_byte)) {
    const bytes = Buffer.from(content);
    const rendered = bytes.subarray(slotInfo.start_byte, slotInfo.end_byte);
    if (sha256(rendered) !== slotInfo.template_sha256) continue;
    content = Buffer.concat([
      bytes.subarray(0, slotInfo.start_byte),
      bytes.subarray(slotInfo.end_byte),
    ]).toString("utf8");
  }
  return content;
}

function slot(slotId: string, target: PendingSlot["target"]): PendingSlot {
  const rendered = [
    `<!-- researchspec:annotation-slot ${slotId} -->`,
    "> 可在这里填写批注，也可以删除或忽略此区域。",
    "<!-- /researchspec:annotation-slot -->",
    "",
  ].join("\n");
  return { slot_id: slotId, target, rendered };
}

function addInsertion(map: Map<number, PendingSlot[]>, offset: number, value: PendingSlot): void {
  const existing = map.get(offset) ?? [];
  existing.push(value);
  map.set(offset, existing);
}

function firstHeading(content: string): string | undefined {
  for (const line of content.replaceAll("\r\n", "\n").split("\n")) {
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]?.replace(/\s+#+\s*$/, "").trim();
    if (heading) return heading;
    if (line.trim()) return undefined;
  }
  return undefined;
}

function safeFragment(value: string): string {
  const normalized = value.normalize("NFKD").replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 24) || sha256(value).slice(0, 12);
}

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

