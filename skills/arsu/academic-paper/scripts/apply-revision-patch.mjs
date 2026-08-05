#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { access, link, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EXIT = { usage: 2, input: 3, preflight: 4, output: 5 };

class HelperFailure extends Error {
  constructor(diagnostics, exitCode) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "HelperFailure";
    this.diagnostics = diagnostics;
    this.exitCode = exitCode;
  }
}

try {
  const options = parseArguments(process.argv.slice(2));
  const basePath = path.resolve(options.base);
  const patchPath = path.resolve(options.patch);
  const outputPath = path.resolve(options.output);
  const reportPath = options.report ? path.resolve(options.report) : undefined;
  assertDistinctPaths([basePath, patchPath, outputPath, ...(reportPath ? [reportPath] : [])]);
  await assertMissing(outputPath);
  if (reportPath) await assertMissing(reportPath);

  let baseBytes;
  let baseText;
  let patchValue;
  try {
    baseBytes = await readFile(basePath);
    baseText = new TextDecoder("utf-8", { fatal: true }).decode(baseBytes);
    patchValue = JSON.parse(await readFile(patchPath, "utf8"));
  } catch (error) {
    const code = error instanceof SyntaxError ? "patch_json_invalid" : "input_read_error";
    throw failure(code, error instanceof Error ? error.message : String(error), EXIT.input);
  }
  const result = applyRevisionPatch(baseText, baseBytes, patchValue);
  if (!result.ok) throw new HelperFailure(result.diagnostics, EXIT.preflight);

  const outputBytes = Buffer.from(result.manuscript, "utf8");
  const reportBytes = reportPath ? Buffer.from(`${JSON.stringify(result.summary, null, 2)}\n`, "utf8") : undefined;
  await atomicCreate({ outputPath, outputBytes, reportPath, reportBytes });
  process.stdout.write(`${JSON.stringify({
    ok: true,
    output_path: outputPath,
    output_sha256: sha256(outputBytes),
    summary: result.summary,
    ...(reportPath ? { report_path: reportPath } : {}),
  })}\n`);
} catch (error) {
  const resolved = error instanceof HelperFailure
    ? error
    : failure("output_write_failed", error instanceof Error ? error.message : String(error), EXIT.output);
  process.stderr.write(`${JSON.stringify({ ok: false, diagnostics: resolved.diagnostics })}\n`);
  process.exitCode = resolved.exitCode;
}

function applyRevisionPatch(baseText, baseBytes, value) {
  const diagnostics = validatePatch(value);
  if (diagnostics.length) return { ok: false, diagnostics };
  const patch = value;
  if (sha256(baseBytes).slice(0, 12) !== patch.base_draft_hash) diagnostics.push(diagnostic("base_hash_stale", "Patch base_draft_hash does not match the selected manuscript."));
  let blocks;
  try { blocks = parseAnchoredBlocks(baseText); }
  catch (error) { return { ok: false, diagnostics: [diagnostic("base_blocks_invalid", message(error))] }; }
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const used = new Set();
  for (const operation of patch.ops) {
    if (used.has(operation.block_id)) diagnostics.push(diagnostic("duplicate_block_target", `Block has more than one operation: ${operation.block_id}`, operation));
    used.add(operation.block_id);
    if (typeof operation.new_text === "string") {
      if (/<!--\s*block:/i.test(operation.new_text)) diagnostics.push(diagnostic("block_marker_injected", "Patch text cannot inject block markers.", operation));
      try { splitMarkdownBlocks(operation.new_text); }
      catch (error) { diagnostics.push(diagnostic("schema_invalid", message(error), operation)); }
    }
    if (operation.block_id === "DOC-BODY-START") continue;
    const block = byId.get(operation.block_id);
    if (!block) diagnostics.push(diagnostic("unknown_block", `Draft block not found: ${operation.block_id}`, operation));
    else if (block.hash.slice(0, 12) !== operation.old_hash) diagnostics.push(diagnostic("old_hash_stale", `Draft block hash is stale: ${operation.block_id}`, operation));
  }
  if (diagnostics.length) return { ok: false, diagnostics };

  let nextId = Math.max(0, ...blocks.map((block) => /^B(\d+)$/.exec(block.id)).filter(Boolean).map((match) => Number(match[1]))) + 1;
  const insertedBlockIds = [];
  const changedBlockIds = [];
  const edits = [];
  for (const [order, operation] of patch.ops.entries()) {
    if (operation.block_id === "DOC-BODY-START") {
      const position = blocks[0]?.markerStart ?? markdownBodyStart(baseText);
      edits.push({ start: position, end: position, replacement: `${anchorize(operation.new_text)}\n\n`, order });
      continue;
    }
    const block = byId.get(operation.block_id);
    changedBlockIds.push(operation.block_id);
    if (operation.op === "delete_block") edits.push({ start: block.markerStart, end: block.end, replacement: "", order });
    else if (operation.op === "replace_block") edits.push({ start: block.markerStart, end: block.end, replacement: `${anchorize(operation.new_text, block.id)}\n\n`, order });
    else edits.push({ start: block.end, end: block.end, replacement: `${anchorize(operation.new_text)}\n\n`, order });
  }
  let manuscript = baseText;
  for (const edit of edits.sort((left, right) => right.start - left.start || right.order - left.order)) manuscript = `${manuscript.slice(0, edit.start)}${edit.replacement}${manuscript.slice(edit.end)}`;
  const counts = {};
  for (const annotation of patch.annotation_mapping?.annotations ?? []) counts[annotation.disposition] = (counts[annotation.disposition] ?? 0) + 1;
  return { ok: true, manuscript, summary: { operation_count: patch.ops.length, changed_block_ids: [...new Set(changedBlockIds)], inserted_block_ids: insertedBlockIds, annotation_disposition_counts: counts } };

  function anchorize(text, firstId) {
    return splitMarkdownBlocks(text).map((content, index) => {
      const id = index === 0 && firstId ? firstId : `B${String(nextId++).padStart(4, "0")}`;
      if (!(index === 0 && firstId)) insertedBlockIds.push(id);
      return `<!--block:${id}-->\n${content}`;
    }).join("\n\n");
  }
}

function validatePatch(value) {
  const diagnostics = [];
  if (!record(value)) return [diagnostic("schema_invalid", "Patch must be an object.")];
  exactKeys(value, ["patch_format_version", "revision_round", "base_draft_hash", "revision_rationale", "emitted_by", "ops", "annotation_mapping"], diagnostics, "patch");
  if (value.patch_format_version !== "2.0") diagnostics.push(diagnostic("schema_invalid", "patch_format_version must be 2.0."));
  if (!Number.isInteger(value.revision_round) || value.revision_round < 1) diagnostics.push(diagnostic("schema_invalid", "revision_round must be a positive integer."));
  if (!hash12(value.base_draft_hash)) diagnostics.push(diagnostic("schema_invalid", "base_draft_hash must be 12 lowercase hex characters."));
  if (!nonempty(value.revision_rationale) || !nonempty(value.emitted_by)) diagnostics.push(diagnostic("schema_invalid", "revision_rationale and emitted_by are required."));
  if (!Array.isArray(value.ops) || value.ops.length === 0) return [...diagnostics, diagnostic("schema_invalid", "ops must contain at least one operation.")];
  const operationIds = new Set();
  const references = [];
  for (const operation of value.ops) {
    if (!record(operation)) { diagnostics.push(diagnostic("schema_invalid", "Each operation must be an object.")); continue; }
    const allowed = operation.op === "delete_block"
      ? ["operation_id", "op", "block_id", "roadmap_item_ids", "annotation_refs", "old_hash"]
      : ["operation_id", "op", "block_id", "roadmap_item_ids", "annotation_refs", "old_hash", "new_text"];
    exactKeys(operation, allowed, diagnostics, "operation");
    if (!safeId(operation.operation_id) || operationIds.has(operation.operation_id)) diagnostics.push(diagnostic("schema_invalid", "operation_id must be safe and unique.", operation));
    operationIds.add(operation.operation_id);
    if (!["replace_block", "insert_after", "delete_block"].includes(operation.op)) diagnostics.push(diagnostic("schema_invalid", "Unsupported patch operation.", operation));
    const bodyStart = operation.block_id === "DOC-BODY-START";
    if ((!bodyStart && !blockId(operation.block_id)) || (bodyStart && operation.op !== "insert_after")) diagnostics.push(diagnostic("schema_invalid", "block_id is invalid for this operation.", operation));
    if (!bodyStart && !hash12(operation.old_hash)) diagnostics.push(diagnostic("schema_invalid", "old_hash is required for ordinary block operations.", operation));
    if (bodyStart && "old_hash" in operation) diagnostics.push(diagnostic("schema_invalid", "DOC-BODY-START cannot carry old_hash.", operation));
    if (operation.op !== "delete_block" && !nonempty(operation.new_text)) diagnostics.push(diagnostic("schema_invalid", `${operation.op} requires new_text.`, operation));
    if (!uniqueSafeIds(operation.roadmap_item_ids)) diagnostics.push(diagnostic("schema_invalid", "roadmap_item_ids must be a non-empty unique ID list.", operation));
    if (operation.annotation_refs !== undefined) {
      if (!Array.isArray(operation.annotation_refs) || operation.annotation_refs.length === 0) diagnostics.push(diagnostic("annotation_mapping_invalid", "annotation_refs must be a non-empty array.", operation));
      else {
        const keys = operation.annotation_refs.map(annotationKey);
        if (keys.some((key) => !key) || new Set(keys).size !== keys.length) diagnostics.push(diagnostic("annotation_mapping_invalid", "annotation_refs must be valid and unique.", operation));
        references.push(...keys.filter(Boolean));
      }
    }
  }
  validateMapping(value.annotation_mapping, references, diagnostics);
  return diagnostics;
}

function validateMapping(mapping, references, diagnostics) {
  if (mapping === undefined) {
    if (references.length) diagnostics.push(diagnostic("annotation_mapping_incomplete", "Operations with annotation_refs require annotation_mapping."));
    return;
  }
  if (!record(mapping) || !Array.isArray(mapping.annotations) || mapping.annotations.length === 0) {
    diagnostics.push(diagnostic("annotation_mapping_invalid", "annotation_mapping.annotations must be a non-empty array."));
    return;
  }
  exactKeys(mapping, ["annotations"], diagnostics, "annotation_mapping");
  const entries = new Map();
  for (const entry of mapping.annotations) {
    if (!record(entry)) { diagnostics.push(diagnostic("annotation_mapping_invalid", "Annotation mapping entry must be an object.")); continue; }
    exactKeys(entry, ["annotation_set_id", "annotation_id", "disposition", "answer", "reason", "superseded_by"], diagnostics, "annotation mapping entry");
    const key = annotationKey(entry);
    if (!key || entries.has(key)) diagnostics.push(diagnostic("annotation_mapping_invalid", "Annotation mapping IDs must be valid and unique."));
    else entries.set(key, entry);
    if (!["implemented", "answered_without_text_change", "deferred", "rejected", "unresolved", "superseded"].includes(entry.disposition)) diagnostics.push(diagnostic("annotation_mapping_invalid", "Annotation disposition is invalid."));
    if (entry.disposition === "answered_without_text_change" && !nonempty(entry.answer)) diagnostics.push(diagnostic("annotation_mapping_invalid", "answered_without_text_change requires answer."));
    if (["deferred", "rejected", "unresolved"].includes(entry.disposition) && !nonempty(entry.reason)) diagnostics.push(diagnostic("annotation_mapping_invalid", `${entry.disposition} requires reason.`));
    if (entry.disposition === "superseded" && !annotationKey(entry.superseded_by)) diagnostics.push(diagnostic("annotation_mapping_invalid", "superseded requires superseded_by."));
  }
  const referenced = new Set(references);
  for (const reference of references) if (!entries.has(reference)) diagnostics.push(diagnostic("annotation_mapping_incomplete", `Annotation reference is absent from annotation_mapping: ${reference}`));
  for (const [key, entry] of entries) {
    if (entry.disposition === "implemented" && !referenced.has(key)) diagnostics.push(diagnostic("annotation_mapping_incomplete", `Implemented annotation is not mapped to an operation: ${key}`));
    if (entry.disposition !== "implemented" && referenced.has(key)) diagnostics.push(diagnostic("annotation_mapping_invalid", `Only implemented annotations may be mapped to an operation: ${key}`));
    if (entry.superseded_by) {
      const target = annotationKey(entry.superseded_by);
      if (target === key || !entries.has(target)) diagnostics.push(diagnostic("annotation_mapping_invalid", `superseded_by must reference another annotation in this mapping: ${key}`));
    }
  }
}

function parseArguments(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!["--base", "--patch", "--output", "--report"].includes(flag) || !value || value.startsWith("--")) throw failure("usage_error", "Usage: apply-revision-patch --base <base.md> --patch <patch.json> --output <revised.md> [--report <summary.json>]", EXIT.usage);
    const key = flag.slice(2);
    if (result[key] !== undefined) throw failure("usage_error", `Duplicate option: ${flag}`, EXIT.usage);
    result[key] = value;
  }
  if (!result.base || !result.patch || !result.output) throw failure("usage_error", "--base, --patch and --output are required.", EXIT.usage);
  return result;
}

async function atomicCreate({ outputPath, outputBytes, reportPath, reportBytes }) {
  const suffix = `.researchspec-${process.pid}-${randomUUID()}.tmp`;
  const outputTemp = `${outputPath}${suffix}`;
  const reportTemp = reportPath ? `${reportPath}${suffix}` : undefined;
  let reportCommitted = false;
  let outputCommitted = false;
  try {
    await writeFile(outputTemp, outputBytes, { flag: "wx" });
    if (reportTemp && reportBytes) await writeFile(reportTemp, reportBytes, { flag: "wx" });
    if (reportTemp && reportPath) { await link(reportTemp, reportPath); reportCommitted = true; }
    await link(outputTemp, outputPath);
    outputCommitted = true;
    await safeUnlink(outputTemp);
    if (reportTemp) await safeUnlink(reportTemp);
  } catch (error) {
    await safeUnlink(outputTemp);
    if (reportTemp) await safeUnlink(reportTemp);
    if (outputCommitted) await safeUnlink(outputPath);
    if (reportCommitted && reportPath) await safeUnlink(reportPath);
    throw failure(reportPath && !reportCommitted ? "report_write_failed" : "output_write_failed", message(error), EXIT.output);
  }
}

function parseAnchoredBlocks(text) {
  const matches = standaloneBlockMarkers(text);
  if (!matches.length) throw new Error("Draft has no ResearchSpec block markers.");
  const ids = new Set();
  return matches.map((match, index) => {
    const id = match.id;
    if (!id || ids.has(id)) throw new Error(`Draft contains duplicate block marker: ${id ?? ""}`);
    ids.add(id);
    const markerStart = match.index;
    const contentStart = markerStart + match.length;
    const end = matches[index + 1]?.index ?? text.length;
    const content = text.slice(contentStart, end);
    return { id, markerStart, end, content, hash: sha256(content.replaceAll("\r\n", "\n").replace(/^\n+|\n+$/g, "")) };
  });
}

function standaloneBlockMarkers(text) {
  const markers = [];
  const bodyStart = markdownBodyStart(text);
  let offset = bodyStart;
  let fence;
  for (const match of text.slice(bodyStart).matchAll(/.*(?:\r?\n|$)/g)) {
    const line = match[0];
    if (!line) continue;
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n|$)/.exec(line);
    if (fenceMatch?.[1]) {
      const marker = fenceMatch[1][0];
      if (!fence) {
        fence = { marker, length: fenceMatch[1].length };
        offset += line.length;
        continue;
      }
      if (marker === fence.marker && fenceMatch[1].length >= fence.length && !(fenceMatch[2] ?? "").trim()) {
        fence = undefined;
        offset += line.length;
        continue;
      }
    }
    if (!fence) {
      const markerMatch = /^<!--block:([A-Za-z0-9][A-Za-z0-9._-]*)-->[ \t]*(?:\r?\n|$)/.exec(line);
      if (markerMatch?.[1]) markers.push({ id: markerMatch[1], index: offset, length: markerMatch[0].length });
      else if (/<!--\s*block:/i.test(line)) throw new Error("Draft contains a malformed or non-standalone block marker.");
    }
    offset += line.length;
  }
  return markers;
}

function splitMarkdownBlocks(value) {
  const normalized = value.replaceAll("\r\n", "\n").trim();
  if (!normalized) throw new Error("Inserted draft text is empty.");
  const blocks = [];
  let current = [];
  let fence;
  const flush = () => { if (current.length) { blocks.push(current.join("\n").trim()); current = []; } };
  for (const line of normalized.split("\n")) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) fence = fence ? undefined : fenceMatch[1][0];
    if (!fence && /^(?: {0,3}(?:=+|-+)\s*$|<[^!][^>]*>\s*$|\[\^[^\]]+\]:)/.test(line)) throw new Error("Inserted text contains an unsupported ambiguous Markdown block shape.");
    if (!fence && !line.trim()) { flush(); continue; }
    if (!fence && /^#{1,6}\s+/.test(line)) { flush(); current.push(line); flush(); continue; }
    current.push(line);
  }
  if (fence) throw new Error("Inserted text contains an unclosed code fence.");
  flush();
  return blocks;
}

function markdownBodyStart(text) {
  if (!text.startsWith("---")) return 0;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? 0 : text.indexOf("\n", end + 4) + 1;
}

function diagnostic(code, message, operation) { return { code, message, ...(operation?.operation_id ? { operation_id: operation.operation_id } : {}), ...(operation?.block_id ? { block_id: operation.block_id } : {}) }; }
function failure(code, message, exitCode) { return new HelperFailure([diagnostic(code, message)], exitCode); }
function message(error) { return error instanceof Error ? error.message : String(error); }
function record(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function nonempty(value) { return typeof value === "string" && Boolean(value.trim()); }
function safeId(value) { return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value); }
function blockId(value) { return typeof value === "string" && /^B[0-9]{4,}$/.test(value); }
function hash12(value) { return typeof value === "string" && /^[a-f0-9]{12}$/.test(value); }
function uniqueSafeIds(value) { return Array.isArray(value) && value.length > 0 && value.every(safeId) && new Set(value).size === value.length; }
function annotationKey(value) { return record(value) && safeId(value.annotation_set_id) && safeId(value.annotation_id) ? `${value.annotation_set_id}:${value.annotation_id}` : ""; }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function exactKeys(value, allowed, diagnostics, label) { for (const key of Object.keys(value)) if (!allowed.includes(key)) diagnostics.push(diagnostic(key.includes("annotation") ? "annotation_mapping_invalid" : "schema_invalid", `Unexpected ${label} field: ${key}`)); }
function assertDistinctPaths(paths) { if (new Set(paths).size !== paths.length) throw failure("usage_error", "Input, output and report paths must be distinct.", EXIT.usage); }
async function assertMissing(target) { try { await access(target); throw failure("output_exists", `Output already exists: ${target}`, EXIT.output); } catch (error) { if (error instanceof HelperFailure) throw error; if (error?.code !== "ENOENT") throw failure("output_write_failed", message(error), EXIT.output); } }
async function safeUnlink(target) { try { await unlink(target); } catch (error) { if (error?.code !== "ENOENT") throw error; } }
