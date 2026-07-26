import { z } from "zod";

import { ImportedDecisionEvidenceSchema } from "./material-passport.js";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const ScopedIdSchema = z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/);
const ActorSchema = z.strictObject({ kind: z.literal("human"), name: z.string().min(1) });

export const DecisionEventSchema = z.strictObject({
  event_id: SafeIdSchema,
  decision_id: SafeIdSchema,
  timestamp: z.iso.datetime(),
  actor: ActorSchema,
  decision_type: z.enum(["gate_override", "patch_acceptance", "workflow_branch", "obligation_waiver", "obligation_not_applicable"]),
  selected_option: z.unknown(),
  status: z.enum(["accepted", "rejected", "postponed"]),
  rationale: z.string().min(1).optional(),
  change_id: SafeIdSchema.optional(),
  draft_patch_id: SafeIdSchema.optional(),
  gate_id: ScopedIdSchema.optional(),
  gate_event_id: SafeIdSchema.optional(),
  gate_receipt_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  decision_point_id: ScopedIdSchema.optional(),
  transition_id: ScopedIdSchema.optional(),
  subflow_instance_id: SafeIdSchema.optional(),
  case_action_id: SafeIdSchema.optional(),
  obligation_id: SafeIdSchema.optional(),
});

export const DecisionLedgerEventSchema = z.union([ImportedDecisionEvidenceSchema, DecisionEventSchema]);
