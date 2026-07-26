import { z } from "zod";

import { CaseSafeIdSchema, CaseSha256Schema, CaseWorkspacePathSchema } from "./case-state.js";
import { ReadPreconditionSchema } from "./case-control.js";

export const RecoveryDispositionSchema = z.enum([
  "healthy",
  "retry_existing_transaction",
  "deterministically_repairable",
  "requires_human_reconstruction",
  "conflicting_evidence",
]);

export const DoctorFindingSchema = z.strictObject({
  finding_id: CaseSafeIdSchema,
  disposition: RecoveryDispositionSchema,
  scope: z.string().min(1),
  code: CaseSafeIdSchema,
  affected_paths: z.array(CaseWorkspacePathSchema),
  evidence_refs: z.array(z.string().min(1)),
  retry_selector: z.string().min(1).nullable(),
  repair_available: z.boolean(),
});

export const DoctorRepairOperationSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("restore_bytes"),
    target_path: CaseWorkspacePathSchema,
    source_path: CaseWorkspacePathSchema,
    source_sha256: CaseSha256Schema,
  }),
  z.strictObject({
    kind: z.literal("write_determined_content"),
    target_path: CaseWorkspacePathSchema,
    content_sha256: CaseSha256Schema,
  }),
  z.strictObject({
    kind: z.literal("append_receipt"),
    target_path: CaseWorkspacePathSchema,
    receipt_sha256: CaseSha256Schema,
  }),
]);

export const DoctorRepairPlanSchema = z.strictObject({
  schema_version: z.literal("1"),
  finding_id: CaseSafeIdSchema,
  read_preconditions: z.array(ReadPreconditionSchema).min(1),
  backup_paths: z.array(CaseWorkspacePathSchema).min(1),
  operations: z.array(DoctorRepairOperationSchema).min(1),
  postconditions: z.array(ReadPreconditionSchema).min(1),
  plan_sha256: CaseSha256Schema,
});

export const DoctorRepairReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("runtime_repair"),
  finding_id: CaseSafeIdSchema,
  plan_sha256: CaseSha256Schema,
  backup_paths: z.array(CaseWorkspacePathSchema).min(1),
  applied_operations: z.array(DoctorRepairOperationSchema).min(1),
  postcondition_hashes: z.array(ReadPreconditionSchema).min(1),
  repaired_at: z.iso.datetime(),
});

export type RecoveryDisposition = z.infer<typeof RecoveryDispositionSchema>;
export type DoctorFinding = z.infer<typeof DoctorFindingSchema>;
export type DoctorRepairPlan = z.infer<typeof DoctorRepairPlanSchema>;
export type DoctorRepairReceipt = z.infer<typeof DoctorRepairReceiptSchema>;
