import { z } from "zod";

import {
  CaseSafeIdSchema,
  CaseSha256Schema,
  CaseWorkspacePathSchema,
  HardObligationDependencySchema,
} from "./case-state.js";

export const ObligationResolutionPolicySchema = z.enum([
  "forbidden",
  "profile_allowed",
  "decision_required",
]);

export const ObligationOutputSchema = z.strictObject({
  artifact_type: z.string().trim().min(1),
  path_template: CaseWorkspacePathSchema,
  validation_profile: CaseSafeIdSchema,
  required: z.boolean(),
});

export const ObligationDefinitionSchema = z.strictObject({
  obligation_id: CaseSafeIdSchema,
  title: z.string().trim().min(1),
  policy_justification: z.string().trim().min(1),
  dependencies: z.array(HardObligationDependencySchema),
  required_evidence_types: z.array(z.string().trim().min(1)),
  outputs: z.array(ObligationOutputSchema).default([]),
  formal_gate_ids: z.array(CaseSafeIdSchema),
  formal_decision_types: z.array(CaseSafeIdSchema),
  resolution_policy: z.strictObject({
    waive: ObligationResolutionPolicySchema,
    not_applicable: ObligationResolutionPolicySchema,
  }).default({ waive: "decision_required", not_applicable: "decision_required" }),
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

export const AdaptiveRouteSchema = z.strictObject({
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  route_ref: z.string().trim().min(1),
  route_kind: z.enum(["mode", "entry"]),
  title: z.string().trim().min(1),
  obligation_ids: z.array(CaseSafeIdSchema).min(1),
  completion_criterion_ids: z.array(CaseSafeIdSchema).min(1),
});

export const ProfileCompletionEffectSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("complete_subflow") }),
  z.strictObject({ kind: z.literal("complete_run") }),
]);

const CommonProfileShape = {
  schema_version: z.literal("1"),
  profile_id: CaseSafeIdSchema,
  obligations: z.array(ObligationDefinitionSchema),
  routes: z.array(AdaptiveRouteSchema).default([]),
  completion_criteria: z.array(z.strictObject({
    criterion_id: CaseSafeIdSchema,
    obligation_ids: z.array(CaseSafeIdSchema),
    effects: z.array(ProfileCompletionEffectSchema),
  })),
  playbook_ref: z.strictObject({
    path: CaseWorkspacePathSchema,
    sha256: CaseSha256Schema,
  }).nullable(),
};

export const AdaptiveCaseProfileSchema = z.strictObject({
  ...CommonProfileShape,
  mode: z.literal("adaptive"),
}).superRefine(validateProfile);

export const StrictCaseProfileSchema = z.strictObject({
  ...CommonProfileShape,
  mode: z.literal("strict"),
  workflow_graph_ref: z.strictObject({
    schema_version: z.literal("0.2"),
    workflow_id: CaseSafeIdSchema,
    path: z.literal("specs/workflow.yaml"),
    sha256: CaseSha256Schema,
  }),
}).superRefine(validateProfile);

export const CaseProfileSchema = z.discriminatedUnion("mode", [
  AdaptiveCaseProfileSchema,
  StrictCaseProfileSchema,
]);

export type AdaptiveCaseProfile = z.infer<typeof AdaptiveCaseProfileSchema>;
export type StrictCaseProfile = z.infer<typeof StrictCaseProfileSchema>;
export type CaseProfile = z.infer<typeof CaseProfileSchema>;
export type SoftPlaybook = z.infer<typeof SoftPlaybookSchema>;

function validateProfile(
  profile: {
    obligations: Array<{ obligation_id: string; dependencies: Array<{ obligation_id: string }> }>;
    routes: Array<{ obligation_ids: string[]; completion_criterion_ids: string[] }>;
    completion_criteria: Array<{ criterion_id: string; obligation_ids: string[] }>;
  },
  context: z.core.$RefinementCtx,
): void {
  const obligationIds = profile.obligations.map((item) => item.obligation_id);
  const obligationSet = new Set(obligationIds);
  const criterionIds = profile.completion_criteria.map((item) => item.criterion_id);
  if (obligationSet.size !== obligationIds.length) context.addIssue({ code: "custom", path: ["obligations"], message: "Profile obligation IDs must be unique." });
  if (new Set(criterionIds).size !== criterionIds.length) context.addIssue({ code: "custom", path: ["completion_criteria"], message: "Profile completion criterion IDs must be unique." });
  for (const obligation of profile.obligations) {
    for (const dependency of obligation.dependencies) if (!obligationSet.has(dependency.obligation_id)) {
      context.addIssue({ code: "custom", path: ["obligations"], message: `Unknown profile obligation dependency: ${dependency.obligation_id}` });
    }
  }
  const criterionSet = new Set(criterionIds);
  for (const route of profile.routes) {
    for (const id of route.obligation_ids) if (!obligationSet.has(id)) context.addIssue({ code: "custom", path: ["routes"], message: `Route references unknown obligation: ${id}` });
    for (const id of route.completion_criterion_ids) if (!criterionSet.has(id)) context.addIssue({ code: "custom", path: ["routes"], message: `Route references unknown completion criterion: ${id}` });
  }
  for (const criterion of profile.completion_criteria) {
    for (const id of criterion.obligation_ids) if (!obligationSet.has(id)) context.addIssue({ code: "custom", path: ["completion_criteria"], message: `Completion criterion references unknown obligation: ${id}` });
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const dependencies = new Map(profile.obligations.map((item) => [item.obligation_id, item.dependencies.map((dependency) => dependency.obligation_id)]));
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if ((dependencies.get(id) ?? []).some(visit)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  if (obligationIds.some(visit)) context.addIssue({ code: "custom", path: ["obligations"], message: "Profile obligation dependencies must be acyclic." });
}
