import { z } from "zod";

import {
  AnnotationRawSourceSchema,
  AnnotationSemanticImpactSchema,
  AnnotationSourceReferenceSchema,
  AnnotationTargetSchema,
} from "../core/contracts/annotation.js";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const ExplicitPathSchema = z.string().trim().min(1);

export const AnnotationSlotDensitySchema = z.enum(["section", "block", "none"]);

export const AnnotationIntakePathsSchema = z.strictObject({
  root: ExplicitPathSchema,
  session: ExplicitPathSchema,
  review_copy: ExplicitPathSchema,
  interpretation: ExplicitPathSchema,
  review_delta: ExplicitPathSchema,
  raw_sources: ExplicitPathSchema,
  candidate: ExplicitPathSchema,
});

export const AnnotationIntakeDiagnosticSchema = z.strictObject({
  code: z.string().trim().min(1),
  message: z.string().trim().min(1),
  blocking: z.boolean(),
  details: z.unknown().optional(),
});

export const ReviewCopySlotSchema = z.strictObject({
  slot_id: SafeIdSchema,
  target: z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("document") }),
    z.strictObject({ kind: z.literal("section"), heading: z.string().trim().min(1) }),
    z.strictObject({ kind: z.literal("block"), block_id: SafeIdSchema }),
  ]),
  start_byte: z.number().int().nonnegative(),
  end_byte: z.number().int().positive(),
  template_sha256: Sha256Schema,
});

export const GeneratedReviewCopySchema = z.strictObject({
  schema_version: z.literal("1"),
  base_sha256: Sha256Schema,
  slot_density: AnnotationSlotDensitySchema,
  template_sha256: Sha256Schema,
  content: z.string(),
  slots: z.array(ReviewCopySlotSchema),
});

export const ReviewDeltaEntrySchema = z.strictObject({
  delta_id: SafeIdSchema,
  kind: z.enum(["changed_block", "missing_block", "added_block", "unmatched_document"]),
  block_id: SafeIdSchema.optional(),
  before_text: z.string(),
  after_text: z.string(),
  review_start_byte: z.number().int().nonnegative(),
  review_end_byte: z.number().int().nonnegative(),
}).refine((value) => value.review_end_byte >= value.review_start_byte, "Review span is invalid.");

export const ReviewDeltaSchema = z.strictObject({
  schema_version: z.literal("1"),
  base_sha256: Sha256Schema,
  template_sha256: Sha256Schema,
  review_sha256: Sha256Schema,
  entries: z.array(ReviewDeltaEntrySchema),
  diagnostics: z.array(AnnotationIntakeDiagnosticSchema),
});

const FileReferenceSchema = z.strictObject({ path: ExplicitPathSchema, sha256: Sha256Schema });

export const AnnotationIntakeSessionSchema = z.strictObject({
  schema_version: z.literal("1"),
  session_id: SafeIdSchema,
  annotation_set_id: SafeIdSchema,
  manuscript: FileReferenceSchema,
  paths: AnnotationIntakePathsSchema,
  slot_density: AnnotationSlotDensitySchema,
  review_copy: FileReferenceSchema,
  raw_sources: z.array(AnnotationRawSourceSchema),
  review_delta: FileReferenceSchema.nullable(),
  interpretation: FileReferenceSchema.nullable(),
  state: z.enum(["collecting", "interpreting", "ready"]),
  diagnostics: z.array(AnnotationIntakeDiagnosticSchema),
}).superRefine((value, context) => {
  if (value.session_id !== value.annotation_set_id) context.addIssue({ code: "custom", message: "session_id must match annotation_set_id.", path: ["session_id"] });
  if (new Set(value.raw_sources.map((source) => source.source_id)).size !== value.raw_sources.length) context.addIssue({ code: "custom", message: "Raw source IDs must be unique.", path: ["raw_sources"] });
});

const ClarificationDraftSchema = z.strictObject({ question: z.string().trim().min(1), answer: z.string().trim().min(1).optional() }).nullable();

export const AnnotationInterpretationEntrySchema = z.strictObject({
  annotation_id: SafeIdSchema,
  status: z.enum(["ready", "needs_clarification", "needs_confirmation", "discarded"]),
  raw_body: z.string().min(1),
  source_pointer: z.string().regex(/^(?:|\/(?:[^~/]|~0|~1)*)+$/),
  source_ref: AnnotationSourceReferenceSchema,
  target: AnnotationTargetSchema.optional(),
  agent_interpretation: z.string().trim().min(1).optional(),
  expected_action: z.string().trim().min(1).optional(),
  semantic_impact: AnnotationSemanticImpactSchema.optional(),
  clarification: ClarificationDraftSchema,
}).superRefine((value, context) => {
  if (value.status !== "ready") return;
  if (!value.target) context.addIssue({ code: "custom", message: "Ready interpretation requires target.", path: ["target"] });
  if (!value.agent_interpretation) context.addIssue({ code: "custom", message: "Ready interpretation requires agent_interpretation.", path: ["agent_interpretation"] });
  if (!value.expected_action) context.addIssue({ code: "custom", message: "Ready interpretation requires expected_action.", path: ["expected_action"] });
  if (!value.semantic_impact) context.addIssue({ code: "custom", message: "Ready interpretation requires semantic_impact.", path: ["semantic_impact"] });
  if (value.clarification && !value.clarification.answer) context.addIssue({ code: "custom", message: "Ready interpretation requires a resolved clarification.", path: ["clarification", "answer"] });
});

export const AnnotationInterpretationDraftSchema = z.strictObject({
  schema_version: z.literal("1"),
  session_id: SafeIdSchema,
  base_sha256: Sha256Schema,
  review_sha256: Sha256Schema,
  delta_sha256: Sha256Schema,
  entries: z.array(AnnotationInterpretationEntrySchema).min(1)
    .refine((values) => new Set(values.map((entry) => entry.annotation_id)).size === values.length, "Annotation IDs must be unique."),
});

export const PlannedAnnotationWorkingWriteSchema = z.strictObject({
  action: z.enum(["create_only", "refresh"]),
  path: ExplicitPathSchema,
  content: z.string(),
  sha256: Sha256Schema,
});

export type AnnotationSlotDensity = z.infer<typeof AnnotationSlotDensitySchema>;
export type AnnotationIntakePaths = z.infer<typeof AnnotationIntakePathsSchema>;
export type AnnotationIntakeDiagnostic = z.infer<typeof AnnotationIntakeDiagnosticSchema>;
export type GeneratedReviewCopy = z.infer<typeof GeneratedReviewCopySchema>;
export type ReviewDelta = z.infer<typeof ReviewDeltaSchema>;
export type AnnotationIntakeSession = z.infer<typeof AnnotationIntakeSessionSchema>;
export type AnnotationInterpretationDraft = z.infer<typeof AnnotationInterpretationDraftSchema>;
export type PlannedAnnotationWorkingWrite = z.infer<typeof PlannedAnnotationWorkingWriteSchema>;
