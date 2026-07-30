import { z } from "zod";

import { Sha256Schema, SubmitActorSchema } from "./artifact.js";
import {
  AnnotationReferenceSchema,
  AnnotationResolutionSchema,
} from "./annotation.js";
import { CaseSafeIdSchema } from "./case-state.js";

const UniqueIdsSchema = z.array(CaseSafeIdSchema)
  .refine((values) => new Set(values).size === values.length, "IDs must be unique.");

const DraftPatchOperationCoreSchema = {
  op: z.enum(["replace_block", "insert_after", "delete_block"]),
  block_id: z.string().trim().min(1),
  old_hash: z.string().regex(/^[a-f0-9]{12,64}$/).optional(),
  new_text: z.string().optional(),
} as const;

export const DraftPatchSemanticOperationSchema = z.strictObject({
  ...DraftPatchOperationCoreSchema,
  operation_id: CaseSafeIdSchema.optional(),
  annotation_refs: z.array(AnnotationReferenceSchema).optional(),
});

export const DraftPatchOperationSchema = z.strictObject({
  ...DraftPatchOperationCoreSchema,
  operation_id: CaseSafeIdSchema,
  annotation_refs: z.array(AnnotationReferenceSchema)
    .refine((values) => {
      const keys = values.map((item) => `${item.annotation_set_id}:${item.annotation_id}`);
      return new Set(keys).size === keys.length;
    }, "Annotation references on an operation must be unique."),
});

const DraftPatchV2OperationSchema = z.strictObject(DraftPatchOperationCoreSchema);

export const DraftPatchSemanticDeltaSchema = z.discriminatedUnion("level", [
  z.strictObject({ level: z.literal("none") }),
  z.strictObject({
    level: z.literal("ordinary"),
    summary: z.string().trim().min(1),
  }),
  z.strictObject({
    level: z.literal("high"),
    categories: z.array(z.enum(["scope", "claim", "structure", "source_policy", "workflow"])).min(1)
      .refine((values) => new Set(values).size === values.length, "Semantic delta categories must be unique."),
    summary: z.string().trim().min(1),
    linked_change_id: CaseSafeIdSchema,
  }),
]);

export const DraftPatchSemanticInputSchema = z.strictObject({
  revision_round: z.number().int().nonnegative(),
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  producer_skill: CaseSafeIdSchema,
  producer_mode: CaseSafeIdSchema.nullable().optional(),
  subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
  obligation_scope: UniqueIdsSchema,
  evidence_artifact_ids: UniqueIdsSchema,
  semantic_delta: DraftPatchSemanticDeltaSchema,
  ops: z.array(DraftPatchSemanticOperationSchema).min(1),
  annotation_resolution: AnnotationResolutionSchema.optional(),
});

export const DraftPatchDerivedInputSchema = z.strictObject({
  patch_format_version: z.literal("3"),
});

export const DraftPatchSubmitInputSchema = DraftPatchSemanticInputSchema.omit({ ops: true }).extend({
  ...DraftPatchDerivedInputSchema.shape,
  ops: z.array(DraftPatchOperationSchema).min(1)
    .refine((values) => new Set(values.map((item) => item.operation_id)).size === values.length, "Operation IDs must be unique."),
});

export const DraftPatchStatusSchema = z.enum([
  "proposed",
  "postponed",
  "accepted",
  "rejected",
  "stale",
  "applied",
  "superseded",
]);

export const CanonicalDraftPatchSchema = DraftPatchSubmitInputSchema.extend({
  patch_id: CaseSafeIdSchema,
  status: DraftPatchStatusSchema,
  emitted_by: SubmitActorSchema,
  created_at: z.iso.datetime(),
  decision_id: CaseSafeIdSchema.optional(),
  resolved_at: z.iso.datetime().optional(),
  applied_artifact_id: CaseSafeIdSchema.optional(),
  apply_report_artifact_id: CaseSafeIdSchema.optional(),
  annotation_resolution_report_artifact_id: CaseSafeIdSchema.optional(),
  apply_receipt_artifact_id: CaseSafeIdSchema.optional(),
  stale_receipt_path: z.string().min(1).optional(),
});

export const CanonicalDraftPatchV2Schema = z.strictObject({
  patch_format_version: z.literal("2"),
  patch_id: CaseSafeIdSchema,
  revision_round: z.number().int().nonnegative(),
  status: DraftPatchStatusSchema,
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  emitted_by: SubmitActorSchema,
  producer_skill: CaseSafeIdSchema,
  producer_mode: CaseSafeIdSchema.nullable().optional(),
  subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
  obligation_scope: UniqueIdsSchema,
  evidence_artifact_ids: UniqueIdsSchema,
  semantic_delta: DraftPatchSemanticDeltaSchema,
  ops: z.array(DraftPatchV2OperationSchema).min(1),
  created_at: z.iso.datetime(),
  decision_id: CaseSafeIdSchema.optional(),
  resolved_at: z.iso.datetime().optional(),
  applied_artifact_id: CaseSafeIdSchema.optional(),
  apply_report_artifact_id: CaseSafeIdSchema.optional(),
  apply_receipt_artifact_id: CaseSafeIdSchema.optional(),
  stale_receipt_path: z.string().min(1).optional(),
});

export const LegacyDraftPatchSchema = z.looseObject({
  patch_format_version: z.string(),
  patch_id: CaseSafeIdSchema,
  revision_round: z.number().int().nonnegative(),
  status: z.enum(["proposed", "postponed", "accepted", "rejected", "stale", "applied", "superseded"]),
  base_artifact_id: CaseSafeIdSchema,
  base_draft_hash: z.string().min(12),
  emitted_by: z.union([z.string().min(1), SubmitActorSchema]),
  ops: z.array(z.looseObject({
    op: z.enum(["replace_block", "insert_after", "delete_block"]),
    block_id: z.string().min(1),
    old_hash: z.string().optional(),
    new_text: z.string().optional(),
  })).min(1),
});

export const StoredDraftPatchSchema = z.union([
  CanonicalDraftPatchSchema,
  CanonicalDraftPatchV2Schema,
  LegacyDraftPatchSchema,
]);

export const DraftPatchReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.enum(["draft_patch_submit", "draft_patch_decision", "draft_patch_apply", "draft_patch_stale"]),
  receipt_id: CaseSafeIdSchema,
  patch_id: CaseSafeIdSchema,
  selector: z.string().regex(/^patch:[A-Za-z0-9][A-Za-z0-9._-]*$/),
  plan_sha256: Sha256Schema,
  actor: SubmitActorSchema,
  decision_id: CaseSafeIdSchema.optional(),
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  output_hashes: z.record(z.string(), Sha256Schema),
  artifact_ids: UniqueIdsSchema,
  effects: z.array(z.strictObject({
    kind: CaseSafeIdSchema,
    refs: z.array(z.string().min(1)),
  })),
  committed_at: z.iso.datetime(),
});

export const DraftPatchApplyReportSchema = z.strictObject({
  schema_version: z.literal("1"),
  report_type: z.literal("draft_patch_apply"),
  patch_id: CaseSafeIdSchema,
  base_artifact_id: CaseSafeIdSchema,
  base_sha256: Sha256Schema,
  revised_artifact_id: CaseSafeIdSchema,
  revised_sha256: Sha256Schema,
  operation_count: z.number().int().positive(),
  evidence_artifact_ids: UniqueIdsSchema,
  semantic_delta: DraftPatchSemanticDeltaSchema,
  decision_id: CaseSafeIdSchema,
  annotation_resolution_report_artifact_id: CaseSafeIdSchema.optional(),
  applied_at: z.iso.datetime(),
});

export type DraftPatchSubmitInput = z.infer<typeof DraftPatchSubmitInputSchema>;
export type DraftPatchSemanticInput = z.infer<typeof DraftPatchSemanticInputSchema>;
export type CanonicalDraftPatch = z.infer<typeof CanonicalDraftPatchSchema>;
export type DraftPatchStatus = z.infer<typeof DraftPatchStatusSchema>;
