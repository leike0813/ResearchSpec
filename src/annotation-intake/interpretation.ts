import { createHash } from "node:crypto";

import {
  AnnotationSetCandidateSchema,
  type AnnotationRawSource,
  type AnnotationSetCandidate,
} from "../core/contracts/annotation.js";
import { validateAnnotationTargetAgainstMarkdown } from "../core/runtime/annotation-target.js";
import {
  AnnotationInterpretationDraftSchema,
  type AnnotationIntakeDiagnostic,
  type AnnotationIntakeSession,
  type AnnotationInterpretationDraft,
  type ReviewDelta,
} from "./contracts.js";

export function validateAnnotationInterpretation(input: {
  session: AnnotationIntakeSession;
  interpretation: AnnotationInterpretationDraft;
  baseText: string;
  reviewText: string;
  delta: ReviewDelta;
  sourceContents: Readonly<Record<string, string>>;
}): AnnotationIntakeDiagnostic[] {
  const diagnostics: AnnotationIntakeDiagnostic[] = [];
  const parsed = AnnotationInterpretationDraftSchema.safeParse(input.interpretation);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({
      code: "annotation_interpretation_invalid",
      message: issue.message,
      blocking: true,
      details: { path: issue.path },
    }));
  }
  if (sha256(input.baseText) !== input.session.manuscript.sha256 || parsed.data.base_sha256 !== input.session.manuscript.sha256) {
    diagnostics.push({ code: "annotation_interpretation_base_stale", message: "Interpretation base hash does not match the session.", blocking: true });
  }
  if (sha256(input.reviewText) !== parsed.data.review_sha256 || input.delta.review_sha256 !== parsed.data.review_sha256) {
    diagnostics.push({ code: "annotation_interpretation_review_stale", message: "Interpretation review hash does not match current review bytes.", blocking: true });
  }
  const deltaText = `${JSON.stringify(input.delta, null, 2)}\n`;
  if (sha256(deltaText) !== parsed.data.delta_sha256) {
    diagnostics.push({ code: "annotation_interpretation_delta_stale", message: "Interpretation delta hash does not match current delta.", blocking: true });
  }
  const sources = new Map(input.session.raw_sources.map((source) => [source.source_id, source]));
  const deltas = new Map(input.delta.entries.map((entry) => [entry.delta_id, entry]));
  for (const entry of parsed.data.entries) {
    if (entry.status === "discarded") continue;
    if (entry.status !== "ready") {
      diagnostics.push({
        code: `annotation_interpretation_${entry.status}`,
        message: `Annotation interpretation is not ready: ${entry.annotation_id}`,
        blocking: true,
      });
      continue;
    }
    const source = sources.get(entry.source_ref.source_id);
    if (!source) {
      diagnostics.push({ code: "annotation_interpretation_source_missing", message: `Raw source is missing: ${entry.source_ref.source_id}`, blocking: true });
      continue;
    }
    const content = input.sourceContents[source.source_id];
    if (content === undefined || sha256(content) !== source.sha256) {
      diagnostics.push({ code: "annotation_interpretation_source_stale", message: `Raw source bytes do not match: ${source.source_id}`, blocking: true });
      continue;
    }
    if (entry.source_ref.kind === "source_span") {
      const excerpt = Buffer.from(content).subarray(entry.source_ref.start_byte, entry.source_ref.end_byte).toString("utf8");
      if (excerpt !== entry.raw_body) {
        diagnostics.push({ code: "annotation_interpretation_excerpt_mismatch", message: `Raw source span does not match: ${entry.annotation_id}`, blocking: true });
      }
    } else {
      const deltaEntry = deltas.get(entry.source_ref.delta_id);
      const expectedRaw = deltaEntry?.after_text || deltaEntry?.before_text;
      if (source.format !== "review_delta_json" || !deltaEntry || expectedRaw !== entry.raw_body) {
        diagnostics.push({ code: "annotation_interpretation_delta_reference_invalid", message: `Review Delta reference is invalid: ${entry.annotation_id}`, blocking: true });
      }
    }
    try {
      if (!entry.target) throw new Error("Target is missing.");
      validateAnnotationTargetAgainstMarkdown(input.baseText, entry.target);
    } catch (error) {
      diagnostics.push({
        code: "annotation_interpretation_target_invalid",
        message: error instanceof Error ? error.message : String(error),
        blocking: true,
        details: { annotation_id: entry.annotation_id },
      });
    }
  }
  return diagnostics;
}

export function materializeAnnotationCandidate(input: {
  session: AnnotationIntakeSession;
  interpretation: AnnotationInterpretationDraft;
  baseText: string;
  reviewText: string;
  delta: ReviewDelta;
  sourceContents: Readonly<Record<string, string>>;
  supersedesAnnotationSetId?: string;
}): AnnotationSetCandidate {
  const diagnostics = validateAnnotationInterpretation(input);
  if (diagnostics.some((diagnostic) => diagnostic.blocking)) {
    throw new AnnotationInterpretationError(diagnostics);
  }
  const ready = input.interpretation.entries.filter((entry) => entry.status === "ready");
  return AnnotationSetCandidateSchema.parse({
    schema_version: "1",
    annotation_set_id: input.session.annotation_set_id,
    intake_session_id: input.session.session_id,
    manuscript: input.session.manuscript,
    raw_sources: input.session.raw_sources,
    annotations: ready.map((entry) => ({
      annotation_id: entry.annotation_id,
      raw_body: entry.raw_body,
      source_pointer: entry.source_pointer,
      source_ref: entry.source_ref,
      target: entry.target,
      agent_interpretation: entry.agent_interpretation,
      expected_action: entry.expected_action,
      semantic_impact: entry.semantic_impact,
      clarification: entry.clarification
        ? { question: entry.clarification.question, answer: entry.clarification.answer }
        : null,
    })),
    ...(input.supersedesAnnotationSetId ? { supersedes_annotation_set_id: input.supersedesAnnotationSetId } : {}),
  });
}

export class AnnotationInterpretationError extends Error {
  constructor(readonly diagnostics: AnnotationIntakeDiagnostic[]) {
    super("Annotation interpretation is not ready for candidate materialization.");
    this.name = "AnnotationInterpretationError";
  }
}

export function annotationSourceContents(
  sources: Array<{ source: AnnotationRawSource; content: string }>,
): Record<string, string> {
  return Object.fromEntries(sources.map((item) => [item.source.source_id, item.content]));
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
