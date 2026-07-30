import { z, type ZodType } from "zod";

import {
  ArtifactSubmitDerivedInputSchema,
  ArtifactSubmitInputSchema,
  ArtifactSubmitSemanticInputSchema,
} from "./artifact.js";
import { AdaptiveObligationSubmitInputSchema } from "./adaptive-runtime.js";
import { CaseSafeIdSchema, CaseSha256Schema } from "./case-state.js";
import {
  GateSubmitDerivedInputSchema,
  GateSubmitPayloadSchema,
  GateSubmitSemanticInputSchema,
} from "./gate-transition.js";
import {
  DraftPatchDerivedInputSchema,
  DraftPatchSemanticInputSchema,
  DraftPatchSubmitInputSchema,
} from "./draft-patch.js";
import { ProposalInputSchema } from "./contract-change.js";
import { AnnotationSubmitInputSchema } from "./annotation.js";
import {
  SubflowStartDerivedInputSchema,
  SubflowStartInputSchema,
  SubflowStartSemanticInputSchema,
} from "./subflow.js";

export const ReadPreconditionSchema = z.strictObject({
  path: z.string().min(1),
  sha256: CaseSha256Schema,
});

export const ActionAvailabilitySchema = z.strictObject({
  selector: z.string().min(1),
  disposition: z.enum(["recommended", "allowed", "blocked"]),
  reason_code: CaseSafeIdSchema,
  obligation_scope: z.array(CaseSafeIdSchema),
  blocking_refs: z.array(z.string().min(1)),
  basis_sha256: CaseSha256Schema,
  expires_when: z.array(ReadPreconditionSchema),
});

export const ExecutionRequirementsSchema = z.strictObject({
  preview_required: z.boolean(),
  action_basis_required: z.boolean(),
  plan_sha256_required: z.boolean(),
  confirmation_required: z.boolean(),
});

export const ActionDescriptorSchema = z.strictObject({
  schema_version: z.literal("2"),
  selector: z.string().min(1),
  command: z.enum(["start", "submit", "advance", "propose", "decide"]),
  action_schema_ref: z.string().min(1),
  availability: ActionAvailabilitySchema,
  cli_derived_fields: z.array(z.string().min(1)),
  semantic_input_slots: z.array(z.strictObject({
    field_path: z.string().min(1),
    expectation: z.string().min(1),
  })),
  constraints: z.array(z.string().min(1)),
  minimal_input_template: z.record(z.string(), z.unknown()).nullable(),
  execution_policy: z.enum(["direct", "human_confirmed", "plan_bound"]),
  execution_requirements: ExecutionRequirementsSchema,
  possible_next_selectors: z.array(z.string().min(1)),
});

const BoundedIdListSchema = z.array(CaseSafeIdSchema).max(20);
const BoundedActionListSchema = z.array(ActionAvailabilitySchema).max(20);
const LiteratureAdapterStatusSchema = z.strictObject({
  adapter_id: CaseSafeIdSchema,
  state: z.enum(["installed", "degraded", "unsupported", "missing", "conflict"]),
  connection_state: z.literal("unchecked"),
  runtime_supported: z.boolean(),
  projection_state: z.enum(["complete", "deferred", "incomplete"]),
  diagnostic_count: z.number().int().nonnegative(),
});

export const CaseStatusSummarySchema = z.strictObject({
  schema_version: z.literal("1"),
  workspace_id: CaseSafeIdSchema,
  run_id: CaseSafeIdSchema,
  lifecycle: z.enum(["open", "waiting", "blocked", "complete", "failed", "cancelled"]),
  profile: z.strictObject({
    mode: z.enum(["adaptive", "strict"]),
    path: z.string().min(1),
    sha256: CaseSha256Schema,
  }),
  active_instance_ids: BoundedIdListSchema,
  idle_instance_ids: BoundedIdListSchema,
  recent_instance_ids: BoundedIdListSchema,
  unsatisfied_obligation_ids: BoundedIdListSchema,
  blocker_refs: z.array(z.string().min(1)).max(20),
  recommended_actions: BoundedActionListSchema,
  allowed_actions: BoundedActionListSchema,
  pending: z.strictObject({
    gate_ids: BoundedIdListSchema,
    gate_count: z.number().int().nonnegative(),
    decision_ids: BoundedIdListSchema,
    decision_count: z.number().int().nonnegative(),
    patch_ids: BoundedIdListSchema,
    patch_count: z.number().int().nonnegative(),
    change_ids: BoundedIdListSchema,
    change_count: z.number().int().nonnegative(),
  }),
  literature_adapters: z.array(LiteratureAdapterStatusSchema).max(10),
  diagnostic_counts: z.record(z.string(), z.number().int().nonnegative()),
  next_selectors: z.array(z.string().min(1)).max(20),
});

export const DecisionInputSchema = z.strictObject({
  decision: z.enum(["accept", "reject", "postpone"]),
  actor_name: z.string().trim().min(1),
  reason: z.string().trim().min(1).optional(),
}).superRefine((value, context) => {
  if (value.decision !== "postpone" && !value.reason) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A rationale is required for accept or reject.",
    });
  }
});

interface ActionSchemaMetadata {
  command: "start" | "submit" | "advance" | "propose" | "decide";
  constraints: readonly string[];
  execution_policy: "direct" | "human_confirmed" | "plan_bound";
}

export type ActionSchemaRegistration =
  | (ActionSchemaMetadata & {
      kind: "input";
      schema_ref: string;
      semantic_validator: ZodType;
      derived_validator: ZodType;
      canonical_validator: ZodType;
    })
  | (ActionSchemaMetadata & { kind: "no-input"; schema_ref: string });

const EmptyDerivedInputSchema = z.strictObject({});
const AdaptiveObligationDerivedInputSchema = z.strictObject({
  obligation_id: CaseSafeIdSchema,
  subflow_instance_id: CaseSafeIdSchema,
  attempt_id: CaseSafeIdSchema.optional(),
  receipt_id: CaseSafeIdSchema,
});

export const ACTION_SCHEMA_REGISTRY = {
  start: {
    kind: "input",
    command: "start",
    schema_ref: "researchspec://actions/start/v2",
    semantic_validator: SubflowStartSemanticInputSchema,
    derived_validator: SubflowStartDerivedInputSchema,
    canonical_validator: SubflowStartInputSchema,
    constraints: ["External starts require a user-confirmed route; delegated child starts inherit their parent authorization."],
    execution_policy: "human_confirmed",
  },
  submit_artifact: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-artifact/v2",
    semantic_validator: ArtifactSubmitSemanticInputSchema,
    derived_validator: ArtifactSubmitDerivedInputSchema,
    canonical_validator: ArtifactSubmitInputSchema,
    constraints: ["The candidate path and hash are resolved from the selected workflow item."],
    execution_policy: "direct",
  },
  submit_gate: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-gate/v2",
    semantic_validator: GateSubmitSemanticInputSchema,
    derived_validator: GateSubmitDerivedInputSchema,
    canonical_validator: GateSubmitPayloadSchema,
    constraints: ["Gate verdicts require explicit human confirmation and evidence-bound findings."],
    execution_policy: "plan_bound",
  },
  submit_obligation: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-obligation/v2",
    semantic_validator: AdaptiveObligationSubmitInputSchema,
    derived_validator: AdaptiveObligationDerivedInputSchema,
    canonical_validator: AdaptiveObligationSubmitInputSchema,
    constraints: ["Attempts remain scoped to one obligation; only a validated accept_evidence operation may satisfy it."],
    execution_policy: "direct",
  },
  submit_patch: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-patch/v3",
    semantic_validator: DraftPatchSemanticInputSchema,
    derived_validator: DraftPatchDerivedInputSchema,
    canonical_validator: DraftPatchSubmitInputSchema,
    constraints: ["A patch is the sole authority for its text modification; high-impact deltas require a linked contract change."],
    execution_policy: "direct",
  },
  submit_annotation: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-annotation/v1",
    semantic_validator: AnnotationSubmitInputSchema,
    derived_validator: EmptyDerivedInputSchema,
    canonical_validator: AnnotationSubmitInputSchema,
    constraints: ["The candidate path, base draft, target hashes, frozen set, receipt, and registry records are CLI-derived and create-only."],
    execution_policy: "human_confirmed",
  },
  advance: {
    kind: "no-input",
    command: "advance",
    schema_ref: "researchspec://actions/advance/no-input",
    constraints: ["Only the currently ready transition may advance."],
    execution_policy: "direct",
  },
  advance_completion: {
    kind: "no-input",
    command: "advance",
    schema_ref: "researchspec://actions/advance-completion/no-input",
    constraints: ["Only the selected profile completion criterion may emit completion effects."],
    execution_policy: "direct",
  },
  advance_patch: {
    kind: "no-input",
    command: "advance",
    schema_ref: "researchspec://actions/advance-patch/no-input",
    constraints: ["Only an accepted, non-stale patch whose linked contract change is applied may modify the base artifact."],
    execution_policy: "plan_bound",
  },
  propose: {
    kind: "input",
    command: "propose",
    schema_ref: "researchspec://actions/propose/v2",
    semantic_validator: ProposalInputSchema,
    derived_validator: EmptyDerivedInputSchema,
    canonical_validator: ProposalInputSchema,
    constraints: ["The requested change ID must be absent and all target contracts must match their read basis."],
    execution_policy: "direct",
  },
  decide: {
    kind: "input",
    command: "decide",
    schema_ref: "researchspec://actions/decide/v2",
    semantic_validator: DecisionInputSchema,
    derived_validator: EmptyDerivedInputSchema,
    canonical_validator: DecisionInputSchema,
    constraints: ["Accept and reject require a human rationale; postpone does not apply the target."],
    execution_policy: "plan_bound",
  },
} as const satisfies Record<string, ActionSchemaRegistration>;

export type ReadPrecondition = z.infer<typeof ReadPreconditionSchema>;
export type ActionAvailability = z.infer<typeof ActionAvailabilitySchema>;
export type ActionDescriptor = z.infer<typeof ActionDescriptorSchema>;
export type ExecutionRequirements = z.infer<typeof ExecutionRequirementsSchema>;
export type CaseStatusSummary = z.infer<typeof CaseStatusSummarySchema>;
export type DecisionInput = z.infer<typeof DecisionInputSchema>;
