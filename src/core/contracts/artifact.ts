import { z } from "zod";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
export const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
export const SubmitActorKindSchema = z.enum(["human", "agent", "script", "converter", "validator"]);
export const SubmitActorSchema = z.object({
  kind: SubmitActorKindSchema,
  name: z.string().trim().min(1),
}).strict();

export const ArtifactSubmitInputSchema = z.object({
  schema_version: z.literal("1"),
  dependency_artifact_ids: z.array(SafeIdSchema).refine((items) => new Set(items).size === items.length, "dependency_artifact_ids must be unique"),
  producer_mode: SafeIdSchema.optional(),
}).strict();

export const LegacyArtifactSchema = z.looseObject({
  artifact_id: SafeIdSchema,
  artifact_type: z.string().min(1).optional(),
  work_item_id: SafeIdSchema.optional(),
  path: z.string().min(1),
  sha256: z.string().optional(),
  status: z.string().optional(),
  verification_state: z.string().optional(),
});

const VerificationSchema = z.object({
  profile: z.string().min(1),
  verified_at: z.iso.datetime(),
  verified_by: SubmitActorSchema,
  checks: z.array(z.string().min(1)).min(1),
}).strict();

export const SubmittedArtifactRecordSchema = z.object({
  artifact_id: SafeIdSchema,
  artifact_type: z.string().min(1),
  work_item_id: SafeIdSchema,
  subflow_instance_id: SafeIdSchema.optional(),
  path: z.string().min(1),
  sha256: Sha256Schema,
  status: z.literal("candidate"),
  verification_state: z.literal("verified"),
  producer: SubmitActorSchema,
  producer_skill: z.string().min(1),
  stage_id: SafeIdSchema,
  payload_schema_ref: z.string().min(1),
  created_at: z.iso.datetime(),
  submit_receipt_artifact_id: SafeIdSchema,
  verification: VerificationSchema,
}).strict();

export const SubmitReceiptArtifactRecordSchema = z.object({
  artifact_id: SafeIdSchema,
  artifact_type: z.literal("artifact_submit_receipt"),
  path: z.string().min(1),
  sha256: Sha256Schema,
  status: z.literal("accepted"),
  verification_state: z.literal("verified"),
  producer: SubmitActorSchema,
  related_artifact_ids: z.array(SafeIdSchema).length(1),
  created_at: z.iso.datetime(),
}).strict();

const DependencyArtifactSchema = z.object({
  artifact_id: SafeIdSchema,
  artifact_type: z.string().min(1),
  path: z.string().min(1),
  sha256: Sha256Schema,
}).strict();

export const ArtifactSubmitReceiptSchema = z.object({
  schema_version: z.literal("1"),
  receipt_type: z.literal("artifact_submit"),
  submission_id: SafeIdSchema,
  selector: z.string().regex(/^work:(?:sf-[A-Za-z0-9][A-Za-z0-9._-]*\/)?[A-Za-z0-9][A-Za-z0-9._-]*$/),
  subflow_instance_id: SafeIdSchema.optional(),
  start_authorization: z.object({
    plan_sha256: Sha256Schema,
    receipt_path: z.string().min(1),
    receipt_sha256: Sha256Schema,
  }).strict().optional(),
  artifact: z.object({
    artifact_id: SafeIdSchema,
    artifact_type: z.string().min(1),
    path: z.string().min(1),
    sha256: Sha256Schema,
  }).strict(),
  receipt_artifact_id: SafeIdSchema,
  producer: SubmitActorSchema,
  producer_skill: z.string().min(1),
  producer_mode: SafeIdSchema.nullable(),
  stage_id: SafeIdSchema,
  payload_schema_ref: z.string().min(1),
  dependency_artifacts: z.array(DependencyArtifactSchema),
  validation: z.object({
    profile: z.string().min(1),
    checks: z.array(z.string().min(1)).min(1),
    outcome: z.literal("pass"),
    validator: SubmitActorSchema,
  }).strict(),
  completion_gate_ids: z.object({
    required: z.array(SafeIdSchema),
    satisfied: z.array(SafeIdSchema),
  }).strict(),
  basis: z.object({
    workflow_sha256: Sha256Schema,
    state_sha256: Sha256Schema,
    registry_sha256: Sha256Schema,
    gate_ledger_sha256: Sha256Schema,
    decision_ledger_sha256: Sha256Schema,
    contract_hashes: z.record(z.string(), Sha256Schema),
  }).strict(),
  submitted_at: z.iso.datetime(),
}).strict();

export const ArtifactRegistrySchema = z.looseObject({
  schema_version: z.string(),
  run_id: SafeIdSchema,
  artifacts: z.array(LegacyArtifactSchema),
});

export type ArtifactSubmitInput = z.infer<typeof ArtifactSubmitInputSchema>;
export type SubmitActor = z.infer<typeof SubmitActorSchema>;
export type SubmittedArtifactRecord = z.infer<typeof SubmittedArtifactRecordSchema>;
export type SubmitReceiptArtifactRecord = z.infer<typeof SubmitReceiptArtifactRecordSchema>;
export type ArtifactSubmitReceipt = z.infer<typeof ArtifactSubmitReceiptSchema>;
