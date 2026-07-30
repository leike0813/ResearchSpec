import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import {
  annotationRawSources,
  type AnnotationSetCandidate,
  type FrozenAnnotationSet,
} from "../contracts/annotation.js";
import { sha256, type ReadPrecondition } from "../workspace/write-plan.js";
import { isPathContained } from "./artifact-path.js";

export class AnnotationProvenanceError extends Error {
  constructor(readonly code: string, message: string, readonly conflict: boolean, readonly details?: unknown) {
    super(message);
    this.name = "AnnotationProvenanceError";
  }
}

export async function validateAnnotationRawProvenance(input: {
  workspace: string;
  annotationSet: AnnotationSetCandidate | FrozenAnnotationSet;
}): Promise<ReadPrecondition[]> {
  if (input.annotationSet.schema_version === "1") return [];
  const sourceRoot = `runs/current/annotation-sessions/${input.annotationSet.annotation_set_id}/sources`;
  const contentById = new Map<string, Buffer>();
  const preconditions: ReadPrecondition[] = [];
  for (const source of annotationRawSources(input.annotationSet)) {
    if (!(source.path === sourceRoot || source.path.startsWith(`${sourceRoot}/`))) {
      throw new AnnotationProvenanceError(
        "annotation_raw_source_path_escape",
        `Annotation raw source is outside its session source directory: ${source.source_id}`,
        false,
        { path: source.path },
      );
    }
    const absolutePath = path.join(input.workspace, source.path);
    const info = await safeLstat(absolutePath, source.source_id);
    if (!info.isFile() || info.isSymbolicLink()) {
      throw new AnnotationProvenanceError(
        "annotation_raw_source_path_escape",
        `Annotation raw source must be a regular non-symlink file: ${source.source_id}`,
        false,
      );
    }
    const [workspaceReal, sourceReal] = await Promise.all([realpath(input.workspace), realpath(absolutePath)]);
    if (!isPathContained(workspaceReal, sourceReal)) {
      throw new AnnotationProvenanceError(
        "annotation_raw_source_path_escape",
        `Annotation raw source resolves outside the workspace: ${source.source_id}`,
        false,
      );
    }
    const bytes = await readFile(absolutePath);
    const actual = sha256(bytes);
    if (actual !== source.sha256) {
      throw new AnnotationProvenanceError(
        "annotation_raw_source_hash_mismatch",
        `Annotation raw source hash has drifted: ${source.source_id}`,
        true,
        { expected: source.sha256, actual },
      );
    }
    contentById.set(source.source_id, bytes);
    preconditions.push({ path: absolutePath, expectedHash: source.sha256, reason: `annotation raw source ${source.source_id}` });
  }

  for (const annotation of input.annotationSet.annotations) {
    if (!("source_ref" in annotation)) continue;
    const source = input.annotationSet.raw_sources.find((item) => item.source_id === annotation.source_ref.source_id);
    const bytes = contentById.get(annotation.source_ref.source_id);
    if (!source || !bytes) {
      throw new AnnotationProvenanceError(
        "annotation_raw_source_missing",
        `Annotation source reference is missing: ${annotation.annotation_id}`,
        false,
      );
    }
    if (annotation.source_ref.kind === "source_span") {
      if (annotation.source_ref.end_byte > bytes.length) {
        throw new AnnotationProvenanceError(
          "annotation_raw_source_span_invalid",
          `Annotation source span exceeds its raw source: ${annotation.annotation_id}`,
          false,
        );
      }
      const excerpt = bytes.subarray(annotation.source_ref.start_byte, annotation.source_ref.end_byte).toString("utf8");
      if (excerpt !== annotation.raw_body) {
        throw new AnnotationProvenanceError(
          "annotation_raw_source_excerpt_mismatch",
          `Annotation raw body differs from its source span: ${annotation.annotation_id}`,
          true,
        );
      }
      continue;
    }
    if (source.format !== "review_delta_json") {
      throw new AnnotationProvenanceError(
        "annotation_review_delta_source_invalid",
        `Annotation Review Delta reference does not target a delta source: ${annotation.annotation_id}`,
        false,
      );
    }
    let delta: unknown;
    try {
      delta = JSON.parse(bytes.toString("utf8")) as unknown;
    } catch {
      throw new AnnotationProvenanceError(
        "annotation_review_delta_invalid",
        `Annotation Review Delta source is not valid JSON: ${source.source_id}`,
        false,
      );
    }
    const entries = Array.isArray(record(delta).entries) ? record(delta).entries as unknown[] : [];
    const deltaId = annotation.source_ref.delta_id;
    const deltaEntry = entries.find((entry) => record(entry).delta_id === deltaId);
    if (!deltaEntry) {
      throw new AnnotationProvenanceError(
        "annotation_review_delta_reference_missing",
        `Annotation Review Delta entry is missing: ${deltaId}`,
        false,
      );
    }
    const deltaRecord = record(deltaEntry);
    const expectedRaw = typeof deltaRecord.after_text === "string" && deltaRecord.after_text
      ? deltaRecord.after_text
      : deltaRecord.before_text;
    if (typeof expectedRaw !== "string" || expectedRaw !== annotation.raw_body) {
      throw new AnnotationProvenanceError(
        "annotation_review_delta_excerpt_mismatch",
        `Annotation raw body differs from its Review Delta entry: ${annotation.annotation_id}`,
        true,
      );
    }
  }
  return preconditions;
}

async function safeLstat(target: string, sourceId: string) {
  try {
    return await lstat(target);
  } catch (error) {
    throw new AnnotationProvenanceError(
      "annotation_raw_source_missing",
      `Annotation raw source is missing: ${sourceId}`,
      false,
      String(error),
    );
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
