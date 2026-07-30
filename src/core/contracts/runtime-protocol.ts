import { z } from "zod";

import { CaseSafeIdSchema, CaseSha256Schema } from "./case-state.js";

export const PageRequestSchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).optional(),
});

export const PageInfoSchema = z.strictObject({
  limit: z.number().int().min(1).max(50),
  total: z.number().int().nonnegative(),
  next_cursor: z.string().min(1).nullable(),
});

export const RuntimePageSchema = z.strictObject({
  schema_version: z.literal("1"),
  type: z.string().min(1),
  items: z.array(z.unknown()).max(50),
  page: PageInfoSchema,
});

export const ValidationViolationSchema = z.strictObject({
  code: z.enum([
    "required",
    "invalid_type",
    "invalid_value",
    "invalid_format",
    "too_small",
    "too_big",
    "unrecognized_key",
    "constraint_failed",
  ]),
  field_path: z.string(),
  expectation: z.string().min(1),
  schema_ref: z.string().min(1),
});

export const CompactTransactionIdentitySchema = z.strictObject({
  kind: z.enum(["plan", "receipt", "artifact", "decision", "change"]),
  selector: z.string().min(1),
  sha256: CaseSha256Schema.optional(),
  plan_sha256: CaseSha256Schema.optional(),
});

export const CompactTransactionEffectSchema = z.strictObject({
  kind: z.enum([
    "subflow_started",
    "material_passport_imported",
    "artifact_registered",
    "annotation_registered",
    "attempt_recorded",
    "evidence_accepted",
    "obligation_paused",
    "obligation_resolution_requested",
    "obligation_resolved",
    "gate_recorded",
    "stage_activated",
    "subflow_completed",
    "run_completed",
    "decision_recorded",
    "change_proposed",
    "change_marked_stale",
    "patch_submitted",
    "patch_accepted",
    "patch_applied",
    "patch_marked_stale",
    "contract_applied",
    "draft_output_created",
    "item_rejected",
    "item_postponed",
    "runtime_repaired",
    "no_change",
  ]),
  refs: z.array(z.string().min(1)).max(20),
});

export const CompactTransactionResultSchema = z.strictObject({
  schema_version: z.literal("1"),
  command: z.enum(["start", "submit", "advance", "propose", "decide", "doctor"]),
  selector: z.string().min(1),
  outcome: CaseSafeIdSchema,
  dry_run: z.boolean(),
  identity: CompactTransactionIdentitySchema,
  effects: z.array(CompactTransactionEffectSchema).max(20),
  next_selectors: z.array(z.string().min(1)).max(20),
});

export type PageRequest = z.infer<typeof PageRequestSchema>;
export type RuntimePage = z.infer<typeof RuntimePageSchema>;
export type ValidationViolation = z.infer<typeof ValidationViolationSchema>;
export type CompactTransactionIdentity = z.infer<typeof CompactTransactionIdentitySchema>;
export type CompactTransactionEffect = z.infer<typeof CompactTransactionEffectSchema>;
export type CompactTransactionResult = z.infer<typeof CompactTransactionResultSchema>;
