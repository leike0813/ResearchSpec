import { z } from "zod";

import {
  CaseSafeIdSchema,
  CaseSha256Schema,
  CaseWorkspacePathSchema,
  CompletionEffectSchema,
  HardObligationDependencySchema,
} from "./case-state.js";

export const ObligationDefinitionSchema = z.strictObject({
  obligation_id: CaseSafeIdSchema,
  title: z.string().trim().min(1),
  policy_justification: z.string().trim().min(1),
  dependencies: z.array(HardObligationDependencySchema),
  required_evidence_types: z.array(z.string().trim().min(1)),
  formal_gate_ids: z.array(CaseSafeIdSchema),
  formal_decision_types: z.array(CaseSafeIdSchema),
});

export const SoftPlaybookSchema = z.strictObject({
  schema_version: z.literal("1"),
  playbook_id: CaseSafeIdSchema,
  profile_id: CaseSafeIdSchema,
  recommended_steps: z.array(z.strictObject({
    action_selector: z.string().min(1),
    rationale: z.string().trim().min(1),
  })),
});

const CommonProfileShape = {
  schema_version: z.literal("1"),
  profile_id: CaseSafeIdSchema,
  obligations: z.array(ObligationDefinitionSchema),
  completion_criteria: z.array(z.strictObject({
    criterion_id: CaseSafeIdSchema,
    obligation_ids: z.array(CaseSafeIdSchema),
    effects: z.array(CompletionEffectSchema),
  })),
  playbook_ref: z.strictObject({
    path: CaseWorkspacePathSchema,
    sha256: CaseSha256Schema,
  }).nullable(),
};

export const AdaptiveCaseProfileSchema = z.strictObject({
  ...CommonProfileShape,
  mode: z.literal("adaptive"),
});

export const StrictCaseProfileSchema = z.strictObject({
  ...CommonProfileShape,
  mode: z.literal("strict"),
  workflow_graph_ref: z.strictObject({
    schema_version: z.literal("0.2"),
    workflow_id: CaseSafeIdSchema,
    path: z.literal("specs/workflow.yaml"),
    sha256: CaseSha256Schema,
  }),
});

export const CaseProfileSchema = z.discriminatedUnion("mode", [
  AdaptiveCaseProfileSchema,
  StrictCaseProfileSchema,
]);

export type AdaptiveCaseProfile = z.infer<typeof AdaptiveCaseProfileSchema>;
export type StrictCaseProfile = z.infer<typeof StrictCaseProfileSchema>;
export type CaseProfile = z.infer<typeof CaseProfileSchema>;
export type SoftPlaybook = z.infer<typeof SoftPlaybookSchema>;
