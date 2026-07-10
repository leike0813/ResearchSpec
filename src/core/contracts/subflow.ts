import { z } from "zod";

import { SubmitActorSchema } from "./artifact.js";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

export const StartActorSchema = SubmitActorSchema.refine((value) => value.kind === "human" || value.kind === "agent" || value.kind === "script", "Start actor must be human, agent, or script.");
export const SubflowStartInputSchema = z.strictObject({
  schema_version: z.literal("1"),
  instruction_basis_sha256: Sha256Schema,
  acknowledged_user_input_ids: z.array(SafeIdSchema).refine(unique, "acknowledged_user_input_ids must be unique"),
  prerequisite_artifact_ids: z.array(SafeIdSchema).refine(unique, "prerequisite_artifact_ids must be unique"),
  prerequisite_decision_ids: z.array(SafeIdSchema).refine(unique, "prerequisite_decision_ids must be unique"),
  parent_subflow_selector: z.string().regex(/^subflow:sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
});

export const SubflowStartReceiptSchema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: z.literal("subflow_start"),
  plan_sha256: Sha256Schema,
  instruction_basis_sha256: Sha256Schema,
  selector: z.string().regex(/^subflow:tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  route_ref: z.string().min(1),
  route_coverage: z.enum(["complete", "partial"]),
  parent_subflow_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
  round_number: z.number().int().positive().nullable(),
  actor: StartActorSchema,
  confirmed_by: z.strictObject({ kind: z.literal("human"), name: z.string().trim().min(1) }),
  acknowledged_user_input_ids: z.array(SafeIdSchema),
  prerequisite_artifact_ids: z.array(SafeIdSchema),
  prerequisite_decision_ids: z.array(SafeIdSchema),
  basis: z.strictObject({
    workflow_sha256: Sha256Schema,
    state_sha256: Sha256Schema,
    registry_sha256: Sha256Schema,
    gate_ledger_sha256: Sha256Schema,
    decision_ledger_sha256: Sha256Schema,
    catalog_sha256: Sha256Schema,
    contract_hashes: z.record(z.string(), Sha256Schema),
    artifact_hashes: z.record(z.string(), Sha256Schema),
    decision_event_ids: z.array(SafeIdSchema),
  }),
  started_at: z.iso.datetime(),
});

export type StartActor = z.infer<typeof StartActorSchema>;
export type SubflowStartInput = z.infer<typeof SubflowStartInputSchema>;
export type SubflowStartReceipt = z.infer<typeof SubflowStartReceiptSchema>;

function unique(values: string[]): boolean { return new Set(values).size === values.length; }

