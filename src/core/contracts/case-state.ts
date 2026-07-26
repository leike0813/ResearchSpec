import { z } from "zod";

export const CaseSafeIdSchema = z.string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
  .refine((value) => !value.includes(".."));
export const CaseSha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
export const CaseWorkspacePathSchema = z.string().min(1)
  .refine((value) => !value.startsWith("/") && !value.split("/").includes(".."));

export const CaseAuthorityOwnerSchema = z.enum([
  "researchspec-cli",
  "human",
  "arsu-producer",
  "literature-adapter",
]);

export const ObligationScopeSchema = z.strictObject({
  run_id: CaseSafeIdSchema,
  subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
});

export const HardObligationDependencySchema = z.strictObject({
  obligation_id: CaseSafeIdSchema,
  justification: z.string().trim().min(1),
});

export const FormalGateReferenceSchema = z.strictObject({
  gate_id: CaseSafeIdSchema,
  event_id: CaseSafeIdSchema.nullable(),
});

export const FormalDecisionReferenceSchema = z.strictObject({
  decision_id: CaseSafeIdSchema,
  decision_type: CaseSafeIdSchema,
});

export const CompletionEffectSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("complete_subflow"),
    subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  }),
  z.strictObject({ kind: z.literal("complete_run") }),
]);

export const AcceptedEvidenceSchema = z.strictObject({
  evidence_id: CaseSafeIdSchema,
  obligation_id: CaseSafeIdSchema,
  artifact_id: CaseSafeIdSchema,
  artifact_type: z.string().trim().min(1),
  path: CaseWorkspacePathSchema,
  sha256: CaseSha256Schema,
  accepted_at: z.iso.datetime(),
  acceptance_receipt: z.strictObject({
    path: CaseWorkspacePathSchema,
    sha256: CaseSha256Schema,
  }),
});

export const HardObligationSchema = z.strictObject({
  obligation_id: CaseSafeIdSchema,
  title: z.string().trim().min(1),
  scope: ObligationScopeSchema,
  owner: z.literal("researchspec-cli"),
  status: z.enum(["unsatisfied", "satisfied", "blocked", "waived", "not_applicable"]),
  policy_justification: z.string().trim().min(1),
  dependencies: z.array(HardObligationDependencySchema),
  accepted_evidence_ids: z.array(CaseSafeIdSchema),
  formal_gate_refs: z.array(FormalGateReferenceSchema),
  formal_decision_refs: z.array(FormalDecisionReferenceSchema),
});

export const WorkingEvidenceSchema = z.strictObject({
  evidence_id: CaseSafeIdSchema,
  obligation_id: CaseSafeIdSchema,
  owner: z.enum(["arsu-producer", "literature-adapter"]),
  path: CaseWorkspacePathSchema,
  sha256: CaseSha256Schema,
  provenance: z.string().trim().min(1),
  created_at: z.iso.datetime(),
});

export const AttemptRecordSchema = z.strictObject({
  attempt_id: CaseSafeIdSchema,
  obligation_id: CaseSafeIdSchema,
  subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
  producer: z.strictObject({ kind: z.enum(["human", "agent", "script"]), name: z.string().trim().min(1) }),
  method: z.string().trim().min(1),
  input_refs: z.array(CaseSafeIdSchema),
  output_refs: z.array(CaseSafeIdSchema),
  diagnostic_codes: z.array(CaseSafeIdSchema),
  disposition: z.enum(["working", "failed", "superseded", "accepted"]),
  recorded_at: z.iso.datetime(),
});

export const CaseActionSchema = z.strictObject({
  action_id: CaseSafeIdSchema,
  selector: z.string().min(1),
  kind: z.enum(["gate", "decision", "patch", "contract_change", "completion"]),
  obligation_scope: z.array(CaseSafeIdSchema),
  status: z.enum(["pending", "accepted", "rejected", "postponed", "applied", "stale"]),
  created_at: z.iso.datetime(),
});

export const CaseReceiptReferenceSchema = z.strictObject({
  receipt_id: CaseSafeIdSchema,
  receipt_type: CaseSafeIdSchema,
  path: CaseWorkspacePathSchema,
  sha256: CaseSha256Schema,
});

export const CaseStateSchema = z.strictObject({
  schema_version: z.literal("1"),
  case_id: CaseSafeIdSchema,
  run_id: CaseSafeIdSchema,
  profile_mode: z.enum(["adaptive", "strict"]),
  lifecycle: z.enum(["open", "waiting", "blocked", "complete", "failed", "cancelled"]),
  obligations: z.array(HardObligationSchema),
  accepted_evidence: z.array(AcceptedEvidenceSchema),
  formal_gate_refs: z.array(FormalGateReferenceSchema),
  formal_decision_refs: z.array(FormalDecisionReferenceSchema),
  case_actions: z.array(CaseActionSchema),
  completion_effects: z.array(CompletionEffectSchema),
  receipts: z.array(CaseReceiptReferenceSchema),
  updated_at: z.iso.datetime().nullable(),
}).superRefine((state, context) => {
  validateUnique(state.obligations.map((item) => item.obligation_id), ["obligations"], context);
  validateUnique(state.accepted_evidence.map((item) => item.evidence_id), ["accepted_evidence"], context);
  validateUnique(state.case_actions.map((item) => item.action_id), ["case_actions"], context);
  validateUnique(state.receipts.map((item) => item.receipt_id), ["receipts"], context);

  const obligations = new Set(state.obligations.map((item) => item.obligation_id));
  const evidence = new Set(state.accepted_evidence.map((item) => item.evidence_id));
  for (const obligation of state.obligations) {
    for (const dependency of obligation.dependencies) {
      if (!obligations.has(dependency.obligation_id)) {
        context.addIssue({ code: "custom", path: ["obligations"], message: `Unknown obligation dependency: ${dependency.obligation_id}` });
      }
    }
    for (const evidenceId of obligation.accepted_evidence_ids) {
      if (!evidence.has(evidenceId)) {
        context.addIssue({ code: "custom", path: ["obligations"], message: `Unknown accepted evidence: ${evidenceId}` });
      }
    }
  }
  for (const item of state.accepted_evidence) {
    if (!obligations.has(item.obligation_id)) {
      context.addIssue({ code: "custom", path: ["accepted_evidence"], message: `Accepted evidence has unknown obligation: ${item.obligation_id}` });
    }
  }
});

export type HardObligation = z.infer<typeof HardObligationSchema>;
export type WorkingEvidence = z.infer<typeof WorkingEvidenceSchema>;
export type AttemptRecord = z.infer<typeof AttemptRecordSchema>;
export type CaseState = z.infer<typeof CaseStateSchema>;

function validateUnique(
  values: readonly string[],
  path: PropertyKey[],
  context: z.core.$RefinementCtx,
): void {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: "custom", path, message: "Case authority identities must be unique." });
  }
}
