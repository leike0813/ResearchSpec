import { z } from "zod";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const ExplicitPathSchema = z.string().trim().min(1);

export const AnnotationSemanticImpactSchema = z.discriminatedUnion("level", [
  z.strictObject({ level: z.literal("ordinary") }),
  z.strictObject({
    level: z.literal("high"),
    categories: z.array(z.enum(["scope", "claim", "structure", "source_policy", "workflow"])).min(1)
      .refine((values) => new Set(values).size === values.length, "Semantic impact categories must be unique."),
  }),
]);

export const AnnotationTargetSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("document") }),
  z.strictObject({ kind: z.literal("section"), heading: z.string().trim().min(1) }),
  z.strictObject({ kind: z.literal("block"), block_id: SafeIdSchema, block_sha256: Sha256Schema }),
  z.strictObject({
    kind: z.literal("quote"),
    block_id: SafeIdSchema,
    block_sha256: Sha256Schema,
    exact_quote: z.string().min(1),
    prefix: z.string(),
    suffix: z.string(),
  }),
]);

export const AnnotationRawSourceSchema = z.strictObject({
  source_id: SafeIdSchema,
  path: ExplicitPathSchema,
  sha256: Sha256Schema,
  format: z.enum(["markdown_review_copy", "markdown_feedback", "conversation_json", "review_delta_json", "text"]),
  media_type: z.string().trim().min(1),
});

export const AnnotationSourceReferenceSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("source_span"),
    source_id: SafeIdSchema,
    start_byte: z.number().int().nonnegative(),
    end_byte: z.number().int().positive(),
  }).refine((value) => value.end_byte > value.start_byte, "Source span must be non-empty."),
  z.strictObject({ kind: z.literal("review_delta"), source_id: SafeIdSchema, delta_id: SafeIdSchema }),
]);

export const ManuscriptAnnotationSchema = z.strictObject({
  annotation_id: SafeIdSchema,
  raw_body: z.string().min(1),
  source_pointer: z.string().regex(/^(?:|\/(?:[^~/]|~0|~1)*)+$/),
  source_ref: AnnotationSourceReferenceSchema,
  target: AnnotationTargetSchema,
  agent_interpretation: z.string().trim().min(1),
  expected_action: z.string().trim().min(1),
  semantic_impact: AnnotationSemanticImpactSchema,
  clarification: z.strictObject({ question: z.string().trim().min(1), answer: z.string().trim().min(1) }).nullable(),
});

export const AnnotationSetCandidateSchema = z.strictObject({
  schema_version: z.literal("1"),
  annotation_set_id: SafeIdSchema,
  intake_session_id: SafeIdSchema,
  manuscript: z.strictObject({ path: ExplicitPathSchema, sha256: Sha256Schema }),
  raw_sources: z.array(AnnotationRawSourceSchema).min(1)
    .refine((values) => new Set(values.map((item) => item.source_id)).size === values.length, "Raw source IDs must be unique."),
  annotations: z.array(ManuscriptAnnotationSchema).min(1)
    .refine((values) => new Set(values.map((item) => item.annotation_id)).size === values.length, "Annotation IDs must be unique."),
  supersedes_annotation_set_id: SafeIdSchema.optional(),
}).superRefine((value, context) => {
  if (value.intake_session_id !== value.annotation_set_id) context.addIssue({ code: "custom", message: "intake_session_id must match annotation_set_id.", path: ["intake_session_id"] });
  const sources = new Set(value.raw_sources.map((source) => source.source_id));
  value.annotations.forEach((annotation, index) => {
    if (!sources.has(annotation.source_ref.source_id)) context.addIssue({ code: "custom", message: "Annotation source reference is dangling.", path: ["annotations", index, "source_ref", "source_id"] });
  });
});

export type AnnotationSetCandidate = z.infer<typeof AnnotationSetCandidateSchema>;
export type AnnotationRawSource = z.infer<typeof AnnotationRawSourceSchema>;
export type AnnotationSourceReference = z.infer<typeof AnnotationSourceReferenceSchema>;
export type ManuscriptAnnotation = z.infer<typeof ManuscriptAnnotationSchema>;

export function annotationRawSources(value: AnnotationSetCandidate): AnnotationRawSource[] {
  return value.raw_sources;
}
