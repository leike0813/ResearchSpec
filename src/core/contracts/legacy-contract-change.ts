import { z } from "zod";

import { CaseSafeIdSchema } from "./case-state.js";

export const STABLE_CONTRACT_PATHS = [
  "specs/project.md",
  "specs/sources.yaml",
  "specs/claims.yaml",
  "specs/manuscript.yaml",
  "specs/workflow.yaml",
] as const;

export const ContractPatchInputSchema = z.strictObject({
  target_contract: z.enum(STABLE_CONTRACT_PATHS),
  operation: z.enum(["add", "replace", "remove", "append", "merge"]),
  target_path: z.string().min(1),
  current_value: z.unknown().optional(),
  proposed_value: z.unknown().optional(),
  reason: z.string().min(1),
  source_artifact_ids: z.array(CaseSafeIdSchema),
  source_decision_ids: z.array(CaseSafeIdSchema),
});

export const ProposalInputSchema = z.strictObject({
  title: z.string().min(1).regex(/^[^\r\n]+$/),
  rationale: z.string().min(1),
  risk_level: z.enum(["low", "medium", "high"]),
  impact: z.array(z.string().min(1)).min(1),
  obligation_scope: z.array(CaseSafeIdSchema)
    .refine((values) => new Set(values).size === values.length, "obligation_scope must be unique")
    .default([]),
  patches: z.array(ContractPatchInputSchema).min(1),
});

export const ContractChangeProposalReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("contract_change_proposal"),
  receipt_id: CaseSafeIdSchema,
  selector: z.string().regex(/^change:[A-Za-z0-9][A-Za-z0-9._-]*$/),
  plan_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  payload_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  obligation_scope: z.array(CaseSafeIdSchema),
  committed_at: z.iso.datetime(),
});

export const ContractChangeRevalidationReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("contract_change_revalidation"),
  receipt_id: CaseSafeIdSchema,
  selector: z.string().regex(/^change:[A-Za-z0-9][A-Za-z0-9._-]*$/),
  decision_id: CaseSafeIdSchema,
  plan_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  outcome: z.literal("stale"),
  diagnostic_code: CaseSafeIdSchema,
  checked_at: z.iso.datetime(),
});

export const ContractChangeDecisionReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("contract_change_decision"),
  receipt_id: CaseSafeIdSchema,
  selector: z.string().regex(/^change:[A-Za-z0-9][A-Za-z0-9._-]*$/),
  decision_id: CaseSafeIdSchema,
  plan_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(["accept", "reject", "postpone"]),
  actor: z.strictObject({ kind: z.literal("human"), name: z.string().trim().min(1) }),
  committed_at: z.iso.datetime(),
});

export type StableContractPath = typeof STABLE_CONTRACT_PATHS[number];
export type ContractPatchOperation = "add" | "replace" | "remove" | "append" | "merge";
export type ProposalRisk = "low" | "medium" | "high";
export type ProposalInput = z.infer<typeof ProposalInputSchema>;
