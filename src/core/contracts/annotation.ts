import { z } from "zod";

import { Sha256Schema, SubmitActorSchema } from "./artifact.js";
import { CaseSafeIdSchema } from "./case-state.js";

const UniqueIdsSchema = z.array(CaseSafeIdSchema)
  .refine((values) => new Set(values).size === values.length, "IDs must be unique.");

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
  z.strictObject({
    kind: z.literal("block"),
    block_id: CaseSafeIdSchema,
    block_sha256: Sha256Schema,
  }),
  z.strictObject({
    kind: z.literal("quote"),
    block_id: CaseSafeIdSchema,
    block_sha256: Sha256Schema,
    exact_quote: z.string().min(1),
    prefix: z.string(),
    suffix: z.string(),
  }),
]);

export const ManuscriptAnnotationSchema = z.strictObject({
  annotation_id: CaseSafeIdSchema,
  raw_body: z.string().min(1),
  source_pointer: z.string().regex(/^(?:|\/(?:[^~/]|~0|~1)*)+$/),
  target: AnnotationTargetSchema,
  agent_interpretation: z.string().trim().min(1),
  expected_action: z.string().trim().min(1),
  semantic_impact: AnnotationSemanticImpactSchema,
  clarification: z.strictObject({
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
  }).nullable(),
});

export const AnnotationSetCandidateSchema = z.strictObject({
  schema_version: z.literal("1"),
  annotation_set_id: CaseSafeIdSchema,
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  annotations: z.array(ManuscriptAnnotationSchema).min(1)
    .refine((values) => new Set(values.map((item) => item.annotation_id)).size === values.length, "Annotation IDs must be unique."),
  supersedes_annotation_set_id: CaseSafeIdSchema.optional(),
});

export const FrozenAnnotationSetSchema = AnnotationSetCandidateSchema.extend({
  set_type: z.literal("manuscript_annotation"),
  candidate: z.strictObject({
    path: z.string().min(1).refine((value) => !value.startsWith("/") && !value.split("/").includes("..")),
    sha256: Sha256Schema,
  }),
  confirmed_by: z.string().trim().min(1),
  confirmed_at: z.iso.datetime(),
});

export const AnnotationSubmitInputSchema = z.strictObject({});

export const AnnotationSubmitReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("annotation_submit"),
  receipt_id: CaseSafeIdSchema,
  annotation_set_id: CaseSafeIdSchema,
  selector: z.string().regex(/^annotation:[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes("..")),
  action_schema: z.literal("researchspec://actions/submit-annotation/v1"),
  action_basis: Sha256Schema,
  actor: SubmitActorSchema,
  confirmed_by: z.string().trim().min(1),
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  candidate_path: z.string().min(1),
  candidate_sha256: Sha256Schema,
  frozen_path: z.string().min(1),
  frozen_sha256: Sha256Schema,
  artifact_ids: UniqueIdsSchema,
  committed_at: z.iso.datetime(),
});

export const AnnotationReferenceSchema = z.strictObject({
  annotation_set_id: CaseSafeIdSchema,
  annotation_id: CaseSafeIdSchema,
});

export const AnnotationDispositionSchema = z.enum([
  "implemented",
  "answered_without_text_change",
  "deferred",
  "rejected",
  "unresolved",
  "superseded",
]);

export const AnnotationResolutionEntrySchema = z.strictObject({
  annotation_set_id: CaseSafeIdSchema,
  annotation_id: CaseSafeIdSchema,
  disposition: AnnotationDispositionSchema,
  answer: z.string().trim().min(1).optional(),
  reason: z.string().trim().min(1).optional(),
  superseded_by: AnnotationReferenceSchema.optional(),
}).superRefine((entry, context) => {
  if (entry.disposition === "answered_without_text_change" && !entry.answer) {
    context.addIssue({ code: "custom", message: "answered_without_text_change requires answer.", path: ["answer"] });
  }
  if ((entry.disposition === "deferred" || entry.disposition === "rejected") && !entry.reason) {
    context.addIssue({ code: "custom", message: `${entry.disposition} requires reason.`, path: ["reason"] });
  }
  if (entry.disposition === "superseded" && !entry.superseded_by) {
    context.addIssue({ code: "custom", message: "superseded requires superseded_by.", path: ["superseded_by"] });
  }
});

export const AnnotationResolutionSchema = z.strictObject({
  entries: z.array(AnnotationResolutionEntrySchema).min(1)
    .refine((values) => {
      const keys = values.map((item) => `${item.annotation_set_id}:${item.annotation_id}`);
      return new Set(keys).size === keys.length;
    }, "Annotation resolution entries must be unique."),
});

export const AnnotationResolutionReportSchema = z.strictObject({
  schema_version: z.literal("1"),
  report_type: z.literal("annotation_resolution"),
  report_id: CaseSafeIdSchema,
  patch_id: CaseSafeIdSchema,
  decision_id: CaseSafeIdSchema,
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  revised_artifact_id: CaseSafeIdSchema,
  revised_sha256: Sha256Schema,
  annotation_sets: z.array(z.strictObject({
    annotation_set_id: CaseSafeIdSchema,
    artifact_id: CaseSafeIdSchema,
    sha256: Sha256Schema,
  })).min(1),
  entries: z.array(z.strictObject({
    annotation_set_id: CaseSafeIdSchema,
    annotation_id: CaseSafeIdSchema,
    disposition: AnnotationDispositionSchema,
    operation_ids: UniqueIdsSchema,
    answer: z.string().trim().min(1).optional(),
    reason: z.string().trim().min(1).optional(),
    superseded_by: AnnotationReferenceSchema.optional(),
  })).min(1),
  coverage: z.strictObject({
    total_count: z.number().int().nonnegative(),
    implemented_count: z.number().int().nonnegative(),
    answered_count: z.number().int().nonnegative(),
    deferred_count: z.number().int().nonnegative(),
    rejected_count: z.number().int().nonnegative(),
    superseded_count: z.number().int().nonnegative(),
    unresolved_count: z.number().int().nonnegative(),
  }),
  generated_at: z.iso.datetime(),
});

export type AnnotationSetCandidate = z.infer<typeof AnnotationSetCandidateSchema>;
export type FrozenAnnotationSet = z.infer<typeof FrozenAnnotationSetSchema>;
export type AnnotationReference = z.infer<typeof AnnotationReferenceSchema>;
export type AnnotationResolutionEntry = z.infer<typeof AnnotationResolutionEntrySchema>;
export type AnnotationResolutionReport = z.infer<typeof AnnotationResolutionReportSchema>;
