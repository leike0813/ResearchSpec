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
  patches: z.array(ContractPatchInputSchema).min(1),
});

export type StableContractPath = typeof STABLE_CONTRACT_PATHS[number];
export type ContractPatchOperation = "add" | "replace" | "remove" | "append" | "merge";
export type ProposalRisk = "low" | "medium" | "high";
export type ProposalInput = z.infer<typeof ProposalInputSchema>;
