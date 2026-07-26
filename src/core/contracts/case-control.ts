import { z, type ZodType } from "zod";

import { ArtifactSubmitInputSchema } from "./artifact.js";
import { AdaptiveObligationSubmitInputSchema } from "./adaptive-runtime.js";
import { CaseSafeIdSchema, CaseSha256Schema } from "./case-state.js";
import { GateSubmitPayloadSchema } from "./gate-transition.js";
import { DraftPatchSubmitInputSchema } from "./draft-patch.js";
import { ProposalInputSchema } from "./contract-change.js";
import { SubflowStartInputSchema } from "./subflow.js";

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

export const ActionDescriptorSchema = z.strictObject({
  schema_version: z.literal("1"),
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
  requires_dry_run: z.boolean(),
  requires_confirmation: z.boolean(),
  possible_next_selectors: z.array(z.string().min(1)),
});

const BoundedIdListSchema = z.array(CaseSafeIdSchema).max(20);
const BoundedActionListSchema = z.array(ActionAvailabilitySchema).max(20);

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
  cli_derived_fields: readonly string[];
  semantic_input_fields: readonly string[];
  constraints: readonly string[];
  requires_dry_run: boolean;
  requires_confirmation: boolean;
}

export type ActionSchemaRegistration =
  | (ActionSchemaMetadata & { kind: "input"; schema_ref: string; validator: ZodType })
  | (ActionSchemaMetadata & { kind: "no-input"; schema_ref: string });

export const ACTION_SCHEMA_REGISTRY = {
  start: {
    kind: "input",
    command: "start",
    schema_ref: "researchspec://actions/start/v1",
    validator: SubflowStartInputSchema,
    cli_derived_fields: ["schema_version", "instruction_basis_sha256", "acknowledged_user_input_ids", "prerequisite_artifact_ids", "prerequisite_decision_ids", "parent_subflow_selector"],
    semantic_input_fields: ["material_passport_import"],
    constraints: ["External starts require a user-confirmed route; delegated child starts inherit their parent authorization."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
  submit_artifact: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-artifact/v1",
    validator: ArtifactSubmitInputSchema,
    cli_derived_fields: ["schema_version", "dependency_artifact_ids"],
    semantic_input_fields: ["producer_mode"],
    constraints: ["The candidate path and hash are resolved from the selected workflow item."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
  submit_gate: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-gate/v1",
    validator: GateSubmitPayloadSchema,
    cli_derived_fields: ["schema_version", "instruction_basis_sha256"],
    semantic_input_fields: ["verdict", "verification_kind", "evidence", "findings", "challenged_basis_sha256", "supersedes_event_id"],
    constraints: ["Gate verdicts require explicit human confirmation and evidence-bound findings."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
  submit_obligation: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-obligation/v1",
    validator: AdaptiveObligationSubmitInputSchema,
    cli_derived_fields: ["obligation_id", "subflow_instance_id", "attempt_id", "receipt_id"],
    semantic_input_fields: ["operation", "method", "input_refs", "diagnostic_codes", "disposition", "output_refs", "retry_of_attempt_id", "replaces_attempt_id", "evidence", "reason", "resolution", "rationale"],
    constraints: ["Attempts remain scoped to one obligation; only a validated accept_evidence operation may satisfy it."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
  submit_patch: {
    kind: "input",
    command: "submit",
    schema_ref: "researchspec://actions/submit-patch/v2",
    validator: DraftPatchSubmitInputSchema,
    cli_derived_fields: ["patch_id", "status", "emitted_by", "created_at", "decision_id", "receipt_refs"],
    semantic_input_fields: ["revision_round", "base_artifact_id", "base_sha256", "producer_skill", "producer_mode", "subflow_instance_id", "obligation_scope", "evidence_artifact_ids", "semantic_delta", "ops"],
    constraints: ["A patch is the sole authority for its text modification; high-impact deltas require a linked contract change."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
  advance: {
    kind: "no-input",
    command: "advance",
    schema_ref: "researchspec://actions/advance/no-input",
    cli_derived_fields: [],
    semantic_input_fields: [],
    constraints: ["Only the currently ready transition may advance."],
    requires_dry_run: true,
    requires_confirmation: false,
  },
  advance_completion: {
    kind: "no-input",
    command: "advance",
    schema_ref: "researchspec://actions/advance-completion/no-input",
    cli_derived_fields: [],
    semantic_input_fields: [],
    constraints: ["Only the selected profile completion criterion may emit completion effects."],
    requires_dry_run: true,
    requires_confirmation: false,
  },
  advance_patch: {
    kind: "no-input",
    command: "advance",
    schema_ref: "researchspec://actions/advance-patch/no-input",
    cli_derived_fields: [],
    semantic_input_fields: [],
    constraints: ["Only an accepted, non-stale patch whose linked contract change is applied may modify the base artifact."],
    requires_dry_run: true,
    requires_confirmation: false,
  },
  propose: {
    kind: "input",
    command: "propose",
    schema_ref: "researchspec://actions/propose/v1",
    validator: ProposalInputSchema,
    cli_derived_fields: [],
    semantic_input_fields: ["title", "rationale", "risk_level", "impact", "patches"],
    constraints: ["The requested change ID must be absent and all target contracts must match their read basis."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
  decide: {
    kind: "input",
    command: "decide",
    schema_ref: "researchspec://actions/decide/v1",
    validator: DecisionInputSchema,
    cli_derived_fields: [],
    semantic_input_fields: ["decision", "actor_name", "reason"],
    constraints: ["Accept and reject require a human rationale; postpone does not apply the target."],
    requires_dry_run: true,
    requires_confirmation: true,
  },
} as const satisfies Record<string, ActionSchemaRegistration>;

export type ReadPrecondition = z.infer<typeof ReadPreconditionSchema>;
export type ActionAvailability = z.infer<typeof ActionAvailabilitySchema>;
export type ActionDescriptor = z.infer<typeof ActionDescriptorSchema>;
export type CaseStatusSummary = z.infer<typeof CaseStatusSummarySchema>;
export type DecisionInput = z.infer<typeof DecisionInputSchema>;
