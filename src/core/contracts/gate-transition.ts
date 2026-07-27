import { z } from "zod";

import { CompletionEffectSchema } from "./case-state.js";

export const SafeRuntimeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
export const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
export const RuntimeActorSchema = z.strictObject({ kind: z.enum(["human", "agent", "script", "validator"]), name: z.string().min(1) });
export const ScopedRuntimeIdSchema = z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));

export const GateEvidenceRefSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("artifact"), artifact_id: SafeRuntimeIdSchema, sha256: Sha256Schema }),
  z.strictObject({ kind: z.literal("contract"), path: z.string().min(1).refine((value) => !value.startsWith("/") && !value.split("/").includes("..")), sha256: Sha256Schema }),
]);

const GateSubmitSemanticFields = {
  verdict: z.enum(["pass", "pass_with_conditions", "fail"]),
  verification_kind: z.enum(["initial", "reverification"]),
  evidence: z.array(GateEvidenceRefSchema).min(1),
  findings: z.array(z.strictObject({ code: SafeRuntimeIdSchema, summary: z.string().min(1), evidence_indexes: z.array(z.number().int().nonnegative()).min(1) })),
  challenged_basis_sha256: Sha256Schema.optional(),
  supersedes_event_id: SafeRuntimeIdSchema.optional(),
} as const;

function validateGateSubmitSemantics(value: {
  verification_kind: "initial" | "reverification";
  evidence: unknown[];
  findings: Array<{ evidence_indexes: number[] }>;
  challenged_basis_sha256?: string;
  supersedes_event_id?: string;
}, context: z.RefinementCtx): void {
  if (value.verification_kind === "reverification" && !value.challenged_basis_sha256 && !value.supersedes_event_id) {
    context.addIssue({ code: "custom", message: "Reverification must bind challenged evidence or a superseded event." });
  }
  if (value.verification_kind === "initial" && (value.challenged_basis_sha256 || value.supersedes_event_id)) {
    context.addIssue({ code: "custom", message: "Initial verification cannot supersede a prior attempt." });
  }
  for (const finding of value.findings) for (const index of finding.evidence_indexes) if (index >= value.evidence.length) {
    context.addIssue({ code: "custom", message: `Finding evidence index is out of range: ${String(index)}` });
  }
}

export const GateSubmitSemanticInputSchema = z.strictObject(GateSubmitSemanticFields)
  .superRefine(validateGateSubmitSemantics);

export const GateSubmitDerivedInputSchema = z.strictObject({
  schema_version: z.literal("1"),
  instruction_basis_sha256: Sha256Schema,
});

export const GateSubmitPayloadSchema = z.strictObject({
  ...GateSubmitSemanticFields,
  ...GateSubmitDerivedInputSchema.shape,
}).superRefine(validateGateSubmitSemantics);

export const GateReceiptReferenceSchema = z.strictObject({
  path: z.string().regex(/^runs\/current\/receipts\/gate-submit\/sf-[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*\/E-[A-Za-z0-9][A-Za-z0-9._-]*\.json$/),
  sha256: Sha256Schema,
  plan_sha256: Sha256Schema,
});

export const GateSubmitReceiptSchema = z.strictObject({
  schema_version: z.literal("1"), receipt_type: z.literal("gate_submit"), plan_sha256: Sha256Schema,
  instruction_basis_sha256: Sha256Schema, selector: z.string().min(1), gate_id: ScopedRuntimeIdSchema,
  gate_node_id: SafeRuntimeIdSchema, subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/), event_id: SafeRuntimeIdSchema,
  stage_id: SafeRuntimeIdSchema, gate_type: SafeRuntimeIdSchema, validator_id: SafeRuntimeIdSchema,
  verdict: z.enum(["pass", "pass_with_conditions", "fail"]), blocking: z.boolean(),
  verification_kind: z.enum(["initial", "reverification"]), evidence: z.array(GateEvidenceRefSchema).min(1),
  findings: z.array(z.strictObject({ code: SafeRuntimeIdSchema, summary: z.string().min(1), evidence_indexes: z.array(z.number().int().nonnegative()).min(1) })),
  actor: RuntimeActorSchema, confirmed_by: z.strictObject({ kind: z.literal("human"), name: z.string().min(1) }),
  challenged_basis_sha256: Sha256Schema.optional(), supersedes_event_id: SafeRuntimeIdSchema.optional(), submitted_at: z.iso.datetime(),
});

export const GateEventV1Schema = z.strictObject({
  schema_version: z.literal("1"), event_id: SafeRuntimeIdSchema, gate_id: ScopedRuntimeIdSchema,
  gate_node_id: SafeRuntimeIdSchema, subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/), timestamp: z.iso.datetime(), actor: RuntimeActorSchema,
  stage_id: SafeRuntimeIdSchema, gate_type: SafeRuntimeIdSchema, validator_id: SafeRuntimeIdSchema,
  verdict: z.enum(["pass", "pass_with_conditions", "fail"]), blocking: z.boolean(),
  verification_kind: z.enum(["initial", "reverification"]), evidence: z.array(GateEvidenceRefSchema).min(1),
  findings: z.array(z.strictObject({ code: SafeRuntimeIdSchema, summary: z.string().min(1), evidence_indexes: z.array(z.number().int().nonnegative()).min(1) })),
  confirmed_by: z.strictObject({ kind: z.literal("human"), name: z.string().min(1) }), receipt: GateReceiptReferenceSchema,
  challenged_basis_sha256: Sha256Schema.optional(), supersedes_event_id: SafeRuntimeIdSchema.optional(),
});

export const TransitionReceiptReferenceSchema = z.strictObject({
  transition_id: ScopedRuntimeIdSchema,
  path: z.string().regex(/^runs\/current\/receipts\/transition-advance\/sf-[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*\.json$/),
  sha256: Sha256Schema, plan_sha256: Sha256Schema,
});

export const AppliedTransitionEffectSchema = z.union([
  z.strictObject({ kind: z.literal("activate_stage"), stage_id: SafeRuntimeIdSchema }),
  CompletionEffectSchema,
]);

export const AppliedTransitionEffectsSchema = z.array(AppliedTransitionEffectSchema).min(1).superRefine((effects, context) => {
  const kinds = effects.map((effect) => effect.kind);
  if (new Set(kinds).size !== kinds.length) context.addIssue({ code: "custom", message: "Applied transition effect kinds must be unique." });
  if (kinds.includes("activate_stage") && effects.length !== 1) context.addIssue({ code: "custom", message: "Stage activation cannot be combined with completion effects." });
  if (kinds.includes("complete_run") && kinds.join(",") !== "complete_subflow,complete_run") context.addIssue({ code: "custom", message: "Run completion must follow subflow completion." });
});

export const TransitionAdvanceReceiptV1Schema = z.strictObject({
  schema_version: z.literal("1"), receipt_type: z.literal("transition_advance"), plan_sha256: Sha256Schema,
  instruction_basis_sha256: Sha256Schema, selector: z.string().min(1), transition_id: ScopedRuntimeIdSchema,
  transition_node_id: SafeRuntimeIdSchema, subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/), from_stage_id: SafeRuntimeIdSchema,
  effect: z.union([z.strictObject({ kind: z.literal("activate_stage"), stage_id: SafeRuntimeIdSchema }), z.strictObject({ kind: z.literal("complete_subflow") })]),
  gate_event_ids: z.array(SafeRuntimeIdSchema), decision_ids: z.array(SafeRuntimeIdSchema), actor: RuntimeActorSchema, advanced_at: z.iso.datetime(),
});

export const TransitionAdvanceReceiptV2Schema = z.strictObject({
  schema_version: z.literal("2"), receipt_type: z.literal("transition_advance"), plan_sha256: Sha256Schema,
  instruction_basis_sha256: Sha256Schema, selector: z.string().min(1), transition_id: ScopedRuntimeIdSchema,
  transition_node_id: SafeRuntimeIdSchema, subflow_instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/), from_stage_id: SafeRuntimeIdSchema,
  effects: AppliedTransitionEffectsSchema,
  gate_event_ids: z.array(SafeRuntimeIdSchema), decision_ids: z.array(SafeRuntimeIdSchema), actor: RuntimeActorSchema, advanced_at: z.iso.datetime(),
}).superRefine((receipt, context) => {
  for (const effect of receipt.effects) {
    if (effect.kind === "complete_subflow" && effect.subflow_instance_id !== receipt.subflow_instance_id) {
      context.addIssue({ code: "custom", path: ["effects"], message: "Subflow completion effect must target the receipt instance." });
    }
  }
});

export const TransitionAdvanceReceiptSchema = z.discriminatedUnion("schema_version", [
  TransitionAdvanceReceiptV1Schema,
  TransitionAdvanceReceiptV2Schema,
]);

export type GateSubmitPayload = z.infer<typeof GateSubmitPayloadSchema>;
export type GateSubmitSemanticInput = z.infer<typeof GateSubmitSemanticInputSchema>;
export type GateSubmitReceipt = z.infer<typeof GateSubmitReceiptSchema>;
export type AppliedTransitionEffect = z.infer<typeof AppliedTransitionEffectSchema>;
export type TransitionAdvanceReceipt = z.infer<typeof TransitionAdvanceReceiptSchema>;
