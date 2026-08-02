import { validateRevisionPatch, type RevisionPatch, type RevisionPatchDiagnostic } from "./contract.js";
import { markdownBodyStart, parseAnchoredBlocks, sha256, splitMarkdownBlocks } from "./markdown-blocks.js";

export type RevisionApplyDiagnosticCode = RevisionPatchDiagnostic["code"]
  | "base_hash_stale"
  | "base_blocks_invalid"
  | "unknown_block"
  | "old_hash_stale"
  | "duplicate_block_target"
  | "block_marker_injected";

export interface RevisionApplyDiagnostic {
  code: RevisionApplyDiagnosticCode;
  message: string;
  operation_id?: string;
  block_id?: string;
}

export interface RevisionApplySummary {
  operation_count: number;
  changed_block_ids: string[];
  inserted_block_ids: string[];
  annotation_disposition_counts: Record<string, number>;
}

export type RevisionApplyResult =
  | { ok: true; manuscript: string; summary: RevisionApplySummary }
  | { ok: false; diagnostics: RevisionApplyDiagnostic[] };

export function applyRevisionPatch(input: { baseText: string; patch: unknown }): RevisionApplyResult {
  const validated = validateRevisionPatch(input.patch);
  if (!validated.ok) return validated;
  const patch = validated.patch;
  const diagnostics: RevisionApplyDiagnostic[] = [];
  if (sha256(input.baseText).slice(0, 12) !== patch.base_draft_hash) {
    diagnostics.push({ code: "base_hash_stale", message: "Patch base_draft_hash does not match the selected manuscript." });
  }
  let blocks;
  try { blocks = parseAnchoredBlocks(input.baseText); }
  catch (error) {
    diagnostics.push({ code: "base_blocks_invalid", message: error instanceof Error ? error.message : String(error) });
    return { ok: false, diagnostics };
  }
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const usedTargets = new Set<string>();
  for (const operation of patch.ops) {
    if (usedTargets.has(operation.block_id)) diagnostics.push({ code: "duplicate_block_target", message: `Block has more than one operation: ${operation.block_id}`, operation_id: operation.operation_id, block_id: operation.block_id });
    usedTargets.add(operation.block_id);
    if ("new_text" in operation) {
      if (/<!--\s*block:/i.test(operation.new_text)) diagnostics.push({ code: "block_marker_injected", message: "Patch text cannot inject block markers.", operation_id: operation.operation_id, block_id: operation.block_id });
      try { splitMarkdownBlocks(operation.new_text); }
      catch (error) { diagnostics.push({ code: "schema_invalid", message: error instanceof Error ? error.message : String(error), operation_id: operation.operation_id, block_id: operation.block_id }); }
    }
    if (operation.block_id === "DOC-BODY-START") continue;
    const block = byId.get(operation.block_id);
    if (!block) diagnostics.push({ code: "unknown_block", message: `Draft block not found: ${operation.block_id}`, operation_id: operation.operation_id, block_id: operation.block_id });
    else if ("old_hash" in operation && block.hash.slice(0, 12) !== operation.old_hash) diagnostics.push({ code: "old_hash_stale", message: `Draft block hash is stale: ${operation.block_id}`, operation_id: operation.operation_id, block_id: operation.block_id });
  }
  if (diagnostics.length) return { ok: false, diagnostics };
  return applyValidated(input.baseText, patch);
}

function applyValidated(text: string, patch: RevisionPatch): RevisionApplyResult {
  const blocks = parseAnchoredBlocks(text);
  const byId = new Map(blocks.map((block) => [block.id, block]));
  let nextId = Math.max(0, ...blocks.map((block) => /^B(\d+)$/.exec(block.id)).filter((match): match is RegExpExecArray => Boolean(match)).map((match) => Number(match[1]))) + 1;
  const insertedBlockIds: string[] = [];
  const changedBlockIds: string[] = [];
  const edits: Array<{ start: number; end: number; replacement: string; order: number }> = [];

  for (const [order, operation] of patch.ops.entries()) {
    if (operation.block_id === "DOC-BODY-START") {
      if (operation.op !== "insert_after") throw new Error("Validated DOC-BODY-START operation is not insert_after.");
      const position = blocks[0]?.markerStart ?? markdownBodyStart(text);
      edits.push({ start: position, end: position, replacement: `${anchorize(operation.new_text)}\n\n`, order });
      continue;
    }
    const block = byId.get(operation.block_id);
    if (!block) throw new Error(`Validated block disappeared: ${operation.block_id}`);
    changedBlockIds.push(operation.block_id);
    if (operation.op === "delete_block") edits.push({ start: block.markerStart, end: block.end, replacement: "", order });
    else if (operation.op === "replace_block") edits.push({ start: block.markerStart, end: block.end, replacement: `${anchorize(operation.new_text, block.id)}\n\n`, order });
    else edits.push({ start: block.end, end: block.end, replacement: `${anchorize(operation.new_text)}\n\n`, order });
  }
  let manuscript = text;
  for (const edit of edits.sort((left, right) => right.start - left.start || right.order - left.order)) manuscript = `${manuscript.slice(0, edit.start)}${edit.replacement}${manuscript.slice(edit.end)}`;
  const annotationDispositionCounts: Record<string, number> = {};
  for (const annotation of patch.annotation_mapping?.annotations ?? []) annotationDispositionCounts[annotation.disposition] = (annotationDispositionCounts[annotation.disposition] ?? 0) + 1;
  return { ok: true, manuscript, summary: { operation_count: patch.ops.length, changed_block_ids: [...new Set(changedBlockIds)], inserted_block_ids: insertedBlockIds, annotation_disposition_counts: annotationDispositionCounts } };

  function anchorize(value: string, firstId?: string): string {
    return splitMarkdownBlocks(value).map((content, index) => {
      const id = index === 0 && firstId ? firstId : `B${String(nextId++).padStart(4, "0")}`;
      if (!(index === 0 && firstId)) insertedBlockIds.push(id);
      return `<!--block:${id}-->\n${content}`;
    }).join("\n\n");
  }
}
