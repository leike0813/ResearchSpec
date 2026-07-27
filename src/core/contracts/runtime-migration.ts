import { z } from "zod";

import { CaseSafeIdSchema, CaseSha256Schema, CaseWorkspacePathSchema } from "./case-state.js";
import { ReadPreconditionSchema } from "./case-control.js";

export const RuntimeMigrationFindingSchema = z.strictObject({
  finding_id: CaseSafeIdSchema,
  code: CaseSafeIdSchema,
  scope: z.string().min(1),
  detail: z.string().min(1),
  blocking: z.boolean(),
});

export const RuntimeMigrationProjectedObligationSchema = z.strictObject({
  obligation_id: CaseSafeIdSchema,
  definition_id: CaseSafeIdSchema,
  subflow_instance_id: CaseSafeIdSchema,
  strict_selector: z.string().min(1).nullable(),
  status: z.enum(["unsatisfied", "satisfied", "blocked", "waived", "not_applicable"]),
  accepted_artifact_id: CaseSafeIdSchema.nullable(),
});

export const RuntimeMigrationBackupEntrySchema = z.strictObject({
  source_path: CaseWorkspacePathSchema,
  backup_path: CaseWorkspacePathSchema,
  sha256: CaseSha256Schema,
  mode: z.number().int().min(0).max(0o777),
});

export const RuntimeMigrationTargetEntrySchema = z.strictObject({
  path: CaseWorkspacePathSchema,
  action: z.enum(["create", "refresh", "remove"]),
  sha256: CaseSha256Schema.nullable(),
});

export const RuntimeMigrationPlanSchema = z.strictObject({
  schema_version: z.literal("1"),
  migration_id: CaseSafeIdSchema,
  source_schema_version: z.literal("0.2"),
  target_mode: z.literal("adaptive"),
  read_preconditions: z.array(ReadPreconditionSchema).min(1),
  compatibility_findings: z.array(RuntimeMigrationFindingSchema),
  projected_obligations: z.array(RuntimeMigrationProjectedObligationSchema),
  retained_strict_policies: z.array(z.string().min(1)),
  backup_entries: z.array(RuntimeMigrationBackupEntrySchema).min(3),
  target_entries: z.array(RuntimeMigrationTargetEntrySchema).min(3),
  receipt_path: CaseWorkspacePathSchema,
  executable: z.boolean(),
  plan_sha256: CaseSha256Schema,
});

export const RuntimeMigrationReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("runtime_migration"),
  migration_id: CaseSafeIdSchema,
  plan_sha256: CaseSha256Schema,
  source_schema_version: z.literal("0.2"),
  target_mode: z.literal("adaptive"),
  source_hashes: z.record(CaseWorkspacePathSchema, CaseSha256Schema),
  target_hashes: z.record(CaseWorkspacePathSchema, CaseSha256Schema),
  backup_entries: z.array(RuntimeMigrationBackupEntrySchema).min(3),
  created_paths: z.array(CaseWorkspacePathSchema),
  committed_at: z.iso.datetime(),
});

export const RuntimeMigrationRollbackPlanSchema = z.strictObject({
  schema_version: z.literal("1"),
  rollback_id: CaseSafeIdSchema,
  migration_id: CaseSafeIdSchema,
  read_preconditions: z.array(ReadPreconditionSchema).min(1),
  restore_entries: z.array(RuntimeMigrationBackupEntrySchema).min(3),
  remove_paths: z.array(CaseWorkspacePathSchema),
  receipt_path: CaseWorkspacePathSchema,
  executable: z.boolean(),
  plan_sha256: CaseSha256Schema,
});

export const RuntimeMigrationRollbackReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("runtime_migration_rollback"),
  rollback_id: CaseSafeIdSchema,
  migration_id: CaseSafeIdSchema,
  plan_sha256: CaseSha256Schema,
  restored_hashes: z.record(CaseWorkspacePathSchema, CaseSha256Schema),
  removed_paths: z.array(CaseWorkspacePathSchema),
  rolled_back_at: z.iso.datetime(),
});

export type RuntimeMigrationFinding = z.infer<typeof RuntimeMigrationFindingSchema>;
export type RuntimeMigrationProjectedObligation = z.infer<typeof RuntimeMigrationProjectedObligationSchema>;
export type RuntimeMigrationBackupEntry = z.infer<typeof RuntimeMigrationBackupEntrySchema>;
export type RuntimeMigrationPlan = z.infer<typeof RuntimeMigrationPlanSchema>;
export type RuntimeMigrationReceipt = z.infer<typeof RuntimeMigrationReceiptSchema>;
export type RuntimeMigrationRollbackPlan = z.infer<typeof RuntimeMigrationRollbackPlanSchema>;
export type RuntimeMigrationRollbackReceipt = z.infer<typeof RuntimeMigrationRollbackReceiptSchema>;
