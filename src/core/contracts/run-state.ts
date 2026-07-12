import { z } from "zod";
import { TransitionReceiptReferenceSchema } from "./gate-transition.js";
import { MaterialPassportImportStateSchema, ResumeCandidateSchema } from "./material-passport.js";

const SafeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const RunStatusSchema = z.enum(["not_started", "in_progress", "waiting", "blocked", "complete", "failed", "cancelled"]);

export const SubflowInstanceStateSchema = z.strictObject({
  instance_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  template_id: z.string().regex(/^tpl-[A-Za-z0-9][A-Za-z0-9._-]*$/),
  route_ref: z.string().regex(/^(?:deep-research|academic-paper|academic-paper-reviewer|academic-pipeline):[a-z0-9][a-z0-9_-]*$/).nullable(),
  parent_subflow_id: z.string().regex(/^sf-[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
  parent_node_id: SafeIdSchema.nullable(),
  round_number: z.number().int().positive().nullable(),
  status: z.enum(["active", "waiting", "blocked", "complete", "failed", "cancelled"]),
  active_stage_id: SafeIdSchema,
  acknowledged_user_input_ids: z.array(SafeIdSchema),
  prerequisite_artifact_ids: z.array(SafeIdSchema),
  prerequisite_decision_ids: z.array(SafeIdSchema),
  start_receipt: z.strictObject({
    path: z.string().regex(/^runs\/current\/receipts\/subflow-start\/sf-[A-Za-z0-9][A-Za-z0-9._-]*\.json$/),
    sha256: Sha256Schema,
    plan_sha256: Sha256Schema,
  }),
  transition_receipts: z.array(TransitionReceiptReferenceSchema),
  started_at: z.iso.datetime(),
});

export const RunStateSchema = z.strictObject({
  schema_version: z.literal("0.2"),
  run_id: SafeIdSchema,
  workflow_id: SafeIdSchema,
  status: RunStatusSchema,
  started_at: z.iso.datetime().nullable(),
  updated_at: z.iso.datetime().nullable(),
  subflows: z.array(SubflowInstanceStateSchema),
  material_passport_imports: z.array(MaterialPassportImportStateSchema),
  resume_candidate: ResumeCandidateSchema.nullable(),
  pending_decisions: z.array(z.unknown()),
  diagnostics: z.array(z.unknown()),
});

export type RunState = z.infer<typeof RunStateSchema>;
export type SubflowInstanceState = z.infer<typeof SubflowInstanceStateSchema>;
