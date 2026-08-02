import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { annotationRawSources, type AnnotationSetCandidate } from "../contracts/annotation.js";
import { sha256, type ReadPrecondition } from "../workspace/write-plan.js";
import { isPathContained } from "./artifact-path.js";

export class AnnotationProvenanceError extends Error {
  constructor(readonly code: string, message: string, readonly conflict: boolean, readonly details?: unknown) {
    super(message);
    this.name = "AnnotationProvenanceError";
  }
}

export async function validateAnnotationRawProvenance(input: {
  workRoot: string;
  annotationSet: AnnotationSetCandidate;
}): Promise<ReadPrecondition[]> {
  const root = path.resolve(input.workRoot);
  const rootReal = await realpath(root);
  const contentById = new Map<string, Buffer>();
  const preconditions: ReadPrecondition[] = [];
  for (const source of annotationRawSources(input.annotationSet)) {
    const absolutePath = path.resolve(source.path);
    if (!isPathContained(root, absolutePath)) throw pathError(source.source_id, source.path);
    const info = await safeLstat(absolutePath, source.source_id);
    if (!info.isFile() || info.isSymbolicLink()) throw pathError(source.source_id, source.path);
    const sourceReal = await realpath(absolutePath);
    if (!isPathContained(rootReal, sourceReal)) throw pathError(source.source_id, source.path);
    const bytes = await readFile(absolutePath);
    const actual = sha256(bytes);
    if (actual !== source.sha256) throw new AnnotationProvenanceError("annotation_raw_source_hash_mismatch", `Annotation raw source hash has drifted: ${source.source_id}`, true, { expected: source.sha256, actual });
    contentById.set(source.source_id, bytes);
    preconditions.push({ path: absolutePath, expectedHash: source.sha256, reason: `annotation raw source ${source.source_id}` });
  }

  for (const annotation of input.annotationSet.annotations) {
    const sourceRef = annotation.source_ref;
    const source = input.annotationSet.raw_sources.find((item) => item.source_id === sourceRef.source_id);
    const bytes = contentById.get(sourceRef.source_id);
    if (!source || !bytes) throw new AnnotationProvenanceError("annotation_raw_source_missing", `Annotation source reference is missing: ${annotation.annotation_id}`, false);
    if (sourceRef.kind === "source_span") {
      if (sourceRef.end_byte > bytes.length) throw new AnnotationProvenanceError("annotation_raw_source_span_invalid", `Annotation source span exceeds its raw source: ${annotation.annotation_id}`, false);
      const excerpt = bytes.subarray(sourceRef.start_byte, sourceRef.end_byte).toString("utf8");
      if (excerpt !== annotation.raw_body) throw new AnnotationProvenanceError("annotation_raw_source_excerpt_mismatch", `Annotation raw body differs from its source span: ${annotation.annotation_id}`, true);
      continue;
    }
    if (source.format !== "review_delta_json") throw new AnnotationProvenanceError("annotation_review_delta_source_invalid", `Annotation Review Delta reference does not target a delta source: ${annotation.annotation_id}`, false);
    let delta: unknown;
    try { delta = JSON.parse(bytes.toString("utf8")) as unknown; }
    catch { throw new AnnotationProvenanceError("annotation_review_delta_invalid", `Annotation Review Delta source is not valid JSON: ${source.source_id}`, false); }
    const entries = Array.isArray(record(delta).entries) ? record(delta).entries as unknown[] : [];
    const deltaEntry = entries.find((entry) => record(entry).delta_id === sourceRef.delta_id);
    if (!deltaEntry) throw new AnnotationProvenanceError("annotation_review_delta_reference_missing", `Annotation Review Delta entry is missing: ${sourceRef.delta_id}`, false);
    const deltaRecord = record(deltaEntry);
    const expectedRaw = typeof deltaRecord.after_text === "string" && deltaRecord.after_text ? deltaRecord.after_text : deltaRecord.before_text;
    if (typeof expectedRaw !== "string" || expectedRaw !== annotation.raw_body) throw new AnnotationProvenanceError("annotation_review_delta_excerpt_mismatch", `Annotation raw body differs from its Review Delta entry: ${annotation.annotation_id}`, true);
  }
  return preconditions;
}

async function safeLstat(target: string, sourceId: string) {
  try { return await lstat(target); }
  catch (error) { throw new AnnotationProvenanceError("annotation_raw_source_missing", `Annotation raw source is missing: ${sourceId}`, false, String(error)); }
}

function pathError(sourceId: string, sourcePath: string): AnnotationProvenanceError {
  return new AnnotationProvenanceError("annotation_raw_source_path_escape", `Annotation raw source is outside its private work root: ${sourceId}`, false, { path: sourcePath });
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
