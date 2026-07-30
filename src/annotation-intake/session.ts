import { createHash } from "node:crypto";

import {
  AnnotationIntakeSessionSchema,
  PlannedAnnotationWorkingWriteSchema,
  type AnnotationIntakeSession,
  type AnnotationSlotDensity,
  type PlannedAnnotationWorkingWrite,
  type ReviewDelta,
} from "./contracts.js";
import { annotationIntakePaths } from "./paths.js";
import { generateAnnotationReviewCopy } from "./review-copy.js";
import { captureAnnotationSource, type CapturedAnnotationSource } from "./sources.js";

export function createAnnotationIntakeSession(input: {
  annotationSetId: string;
  baseArtifactId: string;
  baseSha256: string;
  baseText: string;
  slotDensity?: AnnotationSlotDensity;
}): {
  session: AnnotationIntakeSession;
  reviewCopy: ReturnType<typeof generateAnnotationReviewCopy>;
  reviewSource: CapturedAnnotationSource;
  writes: PlannedAnnotationWorkingWrite[];
} {
  if (sha256(input.baseText) !== input.baseSha256) throw new Error("Annotation intake base bytes do not match baseSha256.");
  const paths = annotationIntakePaths(input.annotationSetId);
  const reviewCopy = generateAnnotationReviewCopy({ baseText: input.baseText, slotDensity: input.slotDensity });
  const reviewSource = captureAnnotationSource({
    annotationSetId: input.annotationSetId,
    content: reviewCopy.content,
    format: "markdown_review_copy",
  });
  const session = AnnotationIntakeSessionSchema.parse({
    schema_version: "1",
    session_id: input.annotationSetId,
    annotation_set_id: input.annotationSetId,
    base_artifact_id: input.baseArtifactId,
    base_sha256: input.baseSha256,
    paths,
    slot_density: reviewCopy.slot_density,
    review_copy: { path: paths.review_copy, sha256: reviewCopy.template_sha256 },
    raw_sources: [reviewSource.source],
    review_delta: null,
    interpretation: null,
    state: "collecting",
    diagnostics: [],
  });
  const sessionText = serialize(session);
  return {
    session,
    reviewCopy,
    reviewSource,
    writes: [
      PlannedAnnotationWorkingWriteSchema.parse({
        action: "refresh",
        path: paths.review_copy,
        content: reviewCopy.content,
        sha256: reviewCopy.template_sha256,
      }),
      reviewSource.write,
      PlannedAnnotationWorkingWriteSchema.parse({
        action: "refresh",
        path: paths.session,
        content: sessionText,
        sha256: sha256(sessionText),
      }),
    ],
  };
}

export function withDerivedReviewDelta(input: {
  session: AnnotationIntakeSession;
  delta: ReviewDelta;
}): {
  session: AnnotationIntakeSession;
  deltaSource: CapturedAnnotationSource;
  writes: PlannedAnnotationWorkingWrite[];
} {
  if (input.delta.base_sha256 !== input.session.base_sha256) throw new Error("Review Delta base does not match the intake session.");
  const deltaText = serialize(input.delta);
  const deltaSource = captureAnnotationSource({
    annotationSetId: input.session.annotation_set_id,
    content: deltaText,
    format: "review_delta_json",
    mediaType: "application/json",
    extension: ".json",
  });
  const session = AnnotationIntakeSessionSchema.parse({
    ...input.session,
    raw_sources: mergeSources(input.session.raw_sources, deltaSource.source),
    review_delta: { path: input.session.paths.review_delta, sha256: deltaSource.source.sha256 },
    state: "interpreting",
    diagnostics: [...input.session.diagnostics, ...input.delta.diagnostics],
  });
  const sessionText = serialize(session);
  return {
    session,
    deltaSource,
    writes: [
      deltaSource.write,
      {
        action: "refresh",
        path: input.session.paths.review_delta,
        content: deltaText,
        sha256: deltaSource.source.sha256,
      },
      {
        action: "refresh",
        path: input.session.paths.session,
        content: sessionText,
        sha256: sha256(sessionText),
      },
    ],
  };
}

export function withCapturedAnnotationSources(input: {
  session: AnnotationIntakeSession;
  sources: CapturedAnnotationSource[];
  currentReviewText?: string;
}): {
  session: AnnotationIntakeSession;
  writes: PlannedAnnotationWorkingWrite[];
} {
  let rawSources = input.session.raw_sources;
  for (const captured of input.sources) rawSources = mergeSources(rawSources, captured.source);
  const currentReviewSha256 = input.currentReviewText === undefined ? undefined : sha256(input.currentReviewText);
  const session = AnnotationIntakeSessionSchema.parse({
    ...input.session,
    raw_sources: rawSources,
    review_copy: currentReviewSha256
      ? { ...input.session.review_copy, sha256: currentReviewSha256 }
      : input.session.review_copy,
  });
  const sessionText = serialize(session);
  return {
    session,
    writes: [
      ...(input.currentReviewText === undefined ? [] : [{
        action: "refresh" as const,
        path: session.paths.review_copy,
        content: input.currentReviewText,
        sha256: currentReviewSha256 ?? session.review_copy.sha256,
      }]),
      ...input.sources.map((source) => source.write),
      {
        action: "refresh",
        path: session.paths.session,
        content: sessionText,
        sha256: sha256(sessionText),
      },
    ],
  };
}

export function withAnnotationInterpretation(input: {
  session: AnnotationIntakeSession;
  interpretation: unknown;
}): {
  session: AnnotationIntakeSession;
  writes: PlannedAnnotationWorkingWrite[];
} {
  const interpretationText = serialize(input.interpretation);
  const interpretationSha256 = sha256(interpretationText);
  const session = AnnotationIntakeSessionSchema.parse({
    ...input.session,
    interpretation: { path: input.session.paths.interpretation, sha256: interpretationSha256 },
    state: "interpreting",
  });
  const sessionText = serialize(session);
  return {
    session,
    writes: [
      {
        action: "refresh",
        path: session.paths.interpretation,
        content: interpretationText,
        sha256: interpretationSha256,
      },
      {
        action: "refresh",
        path: session.paths.session,
        content: sessionText,
        sha256: sha256(sessionText),
      },
    ],
  };
}

export function planMaterializedAnnotationCandidate(input: {
  session: AnnotationIntakeSession;
  candidate: unknown;
}): PlannedAnnotationWorkingWrite {
  const content = serialize(input.candidate);
  return PlannedAnnotationWorkingWriteSchema.parse({
    action: "refresh",
    path: input.session.paths.candidate,
    content,
    sha256: sha256(content),
  });
}

export function planAnnotationWorkingMaterial(
  writes: PlannedAnnotationWorkingWrite[],
): PlannedAnnotationWorkingWrite[] {
  const byPath = new Map<string, PlannedAnnotationWorkingWrite>();
  for (const write of writes) {
    const parsed = PlannedAnnotationWorkingWriteSchema.parse(write);
    const existing = byPath.get(parsed.path);
    if (existing && (existing.sha256 !== parsed.sha256 || existing.action !== parsed.action)) {
      throw new Error(`Conflicting annotation working-material write: ${parsed.path}`);
    }
    byPath.set(parsed.path, parsed);
  }
  return [...byPath.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function mergeSources(
  sources: AnnotationIntakeSession["raw_sources"],
  source: AnnotationIntakeSession["raw_sources"][number],
): AnnotationIntakeSession["raw_sources"] {
  const existing = sources.find((item) => item.source_id === source.source_id);
  if (existing && JSON.stringify(existing) !== JSON.stringify(source)) throw new Error(`Conflicting raw source: ${source.source_id}`);
  return existing ? sources : [...sources, source];
}

function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
