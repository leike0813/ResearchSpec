import { z } from "zod";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const TimestampSchema = z.string().min(1);

export const MaterialPassportImportSchema = z.strictObject({
  kind: z.literal("ars-material-passport"),
  passport_path: z.string().trim().min(1),
  expected_passport_sha256: Sha256Schema,
  boundary_hash: z.string().regex(/^[a-f0-9]{12}$/).optional(),
  accompanied_artifact: z.strictObject({
    path: z.string().trim().min(1),
    artifact_type: SafeIdSchema,
    expected_sha256: Sha256Schema,
  }).optional(),
});

export const MaterialPassportResetBoundarySchema = z.looseObject({
  kind: z.literal("boundary"),
  hash: z.string().regex(/^[a-f0-9]{12}$/),
  stage: z.union([z.string(), z.number()]),
  next: z.union([z.string(), z.number(), z.null()]),
  generated_at: TimestampSchema,
  session_marker: z.string().min(1),
  version_label: z.string().min(1).optional(),
  mode: z.string().min(1).optional(),
  verification_status: z.enum(["VERIFIED", "UNVERIFIED", "STALE"]).optional(),
  pending_decision: z.looseObject({
    question: z.string().min(1),
    options: z.array(z.looseObject({
      value: z.string().min(1),
      next_stage: z.union([z.string(), z.number(), z.null()]),
      next_mode: z.string().min(1).optional(),
    })).min(1),
  }).optional(),
});

export const MaterialPassportResetResumeSchema = z.looseObject({
  kind: z.literal("resume"),
  consumes_hash: z.string().regex(/^[a-f0-9]{12}$/),
  generated_at: TimestampSchema,
  session_marker: z.string().min(1),
});

export const MaterialPassportSchema = z.looseObject({
  origin_skill: z.string().min(1),
  origin_mode: z.string().min(1),
  origin_date: TimestampSchema,
  verification_status: z.enum(["VERIFIED", "UNVERIFIED", "STALE"]),
  version_label: z.string().min(1),
  integrity_pass_date: TimestampSchema.optional(),
  content_hash: z.string().regex(/^[a-f0-9]{12,64}$/).optional(),
  upstream_dependencies: z.array(z.string().min(1)).optional(),
  repro_lock: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
  compliance_history: z.array(z.record(z.string(), z.unknown())).optional(),
  reset_boundary: z.array(z.union([MaterialPassportResetBoundarySchema, MaterialPassportResetResumeSchema])).optional(),
  literature_corpus: z.array(z.record(z.string(), z.unknown())).optional(),
  audit_artifact: z.array(z.record(z.string(), z.unknown())).optional(),
  slr_lineage: z.boolean().optional(),
  experiment_intake_declaration: z.record(z.string(), z.unknown()).optional(),
  experiment_provenance: z.array(z.record(z.string(), z.unknown())).optional(),
  experiment_alignment_results: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const ImportedArtifactRecordSchema = z.strictObject({
  artifact_id: SafeIdSchema,
  artifact_type: z.string().min(1),
  path: z.string().min(1),
  sha256: Sha256Schema,
  status: z.literal("imported"),
  verification_state: z.enum(["verified", "unverified", "stale"]),
  authority: z.literal("imported_evidence"),
  source_import_id: SafeIdSchema,
  source_pointer: z.string().min(1),
  producer: z.strictObject({ kind: z.literal("converter"), name: z.literal("ars-material-passport-import") }),
  producer_skill: z.string().min(1),
  producer_mode: z.string().min(1),
  version_label: z.string().min(1),
  created_at: TimestampSchema,
  depends_on: z.array(z.string().min(1)),
});

export const ImportedGateEvidenceSchema = z.strictObject({
  schema_version: z.literal("1"),
  authority: z.literal("imported_evidence"),
  event_id: SafeIdSchema,
  gate_id: SafeIdSchema,
  timestamp: TimestampSchema,
  actor: z.strictObject({ kind: z.literal("converter"), name: z.literal("ars-material-passport-import") }),
  stage_id: z.string().min(1),
  gate_type: z.string().min(1),
  verdict: z.literal("not_run"),
  blocking: z.literal(false),
  source_import_id: SafeIdSchema,
  source_pointer: z.string().min(1),
  reported_payload: z.record(z.string(), z.unknown()),
});

export const ImportedDecisionEvidenceSchema = z.strictObject({
  schema_version: z.literal("1"),
  authority: z.literal("imported_evidence"),
  event_id: SafeIdSchema,
  decision_id: SafeIdSchema,
  timestamp: TimestampSchema,
  actor: z.strictObject({ kind: z.literal("converter"), name: z.literal("ars-material-passport-import") }),
  decision_type: z.string().min(1),
  selected_option: z.unknown(),
  status: z.literal("observed"),
  source_import_id: SafeIdSchema,
  source_pointer: z.string().min(1),
});

export const MaterialPassportProjectionSchema = z.strictObject({
  schema_version: z.literal("1"),
  import_id: SafeIdSchema,
  passport_sha256: Sha256Schema,
  passport: MaterialPassportSchema,
  selected_boundary: MaterialPassportResetBoundarySchema.nullable(),
  diagnostics: z.array(z.strictObject({ code: z.string().min(1), message: z.string().min(1) })),
});

export const MaterialPassportImportStateSchema = z.strictObject({
  import_id: SafeIdSchema,
  instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  passport_artifact_id: SafeIdSchema,
  projection_artifact_id: SafeIdSchema,
  accompanied_artifact_id: SafeIdSchema.nullable(),
  passport_sha256: Sha256Schema,
  boundary_hash: z.string().regex(/^[a-f0-9]{12}$/).nullable(),
  status: z.literal("consumed"),
  imported_at: TimestampSchema,
  diagnostic_codes: z.array(z.string().min(1)),
});

export const ResumeCandidateSchema = z.strictObject({
  import_id: SafeIdSchema,
  instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  boundary_hash: z.string().regex(/^[a-f0-9]{12}$/),
  source_stage: z.string().min(1),
  proposed_next_stage: z.string().nullable(),
  source_mode: z.string().nullable(),
  pending_decision: z.boolean(),
  status: z.literal("awaiting_current_confirmation"),
});

export const RuntimeContextSchema = z.strictObject({
  schema_version: z.literal("1"),
  instance_id: z.string().nullable(),
  resume_candidate: ResumeCandidateSchema.nullable(),
  imports: z.array(MaterialPassportImportStateSchema),
  artifacts: z.array(z.strictObject({ artifact_id: SafeIdSchema, artifact_type: z.string(), path: z.string(), sha256: Sha256Schema, authority: z.literal("imported_evidence") })),
  gate_evidence: z.array(z.strictObject({ event_id: SafeIdSchema, gate_type: z.string(), source_pointer: z.string() })),
  decision_evidence: z.array(z.strictObject({ event_id: SafeIdSchema, decision_type: z.string(), source_pointer: z.string() })),
  diagnostics: z.array(z.string()),
});

export type MaterialPassportImport = z.infer<typeof MaterialPassportImportSchema>;
export type MaterialPassport = z.infer<typeof MaterialPassportSchema>;
export type ImportedArtifactRecord = z.infer<typeof ImportedArtifactRecordSchema>;
export type ImportedGateEvidence = z.infer<typeof ImportedGateEvidenceSchema>;
export type ImportedDecisionEvidence = z.infer<typeof ImportedDecisionEvidenceSchema>;
export type MaterialPassportImportState = z.infer<typeof MaterialPassportImportStateSchema>;
export type ResumeCandidate = z.infer<typeof ResumeCandidateSchema>;
export type RuntimeContext = z.infer<typeof RuntimeContextSchema>;
