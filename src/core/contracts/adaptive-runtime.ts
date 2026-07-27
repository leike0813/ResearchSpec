import { z } from "zod";

import {
  CaseSafeIdSchema,
  CaseSha256Schema,
  CaseWorkspacePathSchema,
} from "./case-state.js";

const AttemptBaseShape = {
  method: z.string().trim().min(1),
  input_refs: z.array(CaseSafeIdSchema),
  diagnostic_codes: z.array(CaseSafeIdSchema),
  retry_of_attempt_id: CaseSafeIdSchema.nullable().default(null),
  replaces_attempt_id: CaseSafeIdSchema.nullable().default(null),
};

export const AdaptiveObligationSubmitInputSchema = z.discriminatedUnion("operation", [
  z.strictObject({
    operation: z.literal("record_attempt"),
    ...AttemptBaseShape,
    disposition: z.enum(["working", "failed", "superseded"]),
    output_refs: z.array(CaseSafeIdSchema),
  }),
  z.strictObject({
    operation: z.literal("accept_evidence"),
    ...AttemptBaseShape,
    evidence: z.array(z.strictObject({
      artifact_id: CaseSafeIdSchema,
      artifact_type: z.string().trim().min(1),
      path: CaseWorkspacePathSchema,
      sha256: CaseSha256Schema,
      provenance: z.string().trim().min(1),
    })).min(1),
  }),
  z.strictObject({
    operation: z.literal("pause"),
    ...AttemptBaseShape,
    reason: z.string().trim().min(1),
  }),
  z.strictObject({
    operation: z.literal("request_resolution"),
    resolution: z.enum(["waive", "not_applicable"]),
    rationale: z.string().trim().min(1),
  }),
]);

const AdaptiveReceiptTypeSchema = z.enum([
  "adaptive_start",
  "obligation_commit",
  "obligation_pause",
  "obligation_resolution_request",
  "obligation_resolution",
  "adaptive_completion",
]);

const AdaptiveCaseReceiptV1Schema = z.strictObject({
  schema_version: z.literal("1"),
  receipt_type: AdaptiveReceiptTypeSchema,
  receipt_id: CaseSafeIdSchema,
  selector: z.string().min(1),
  plan_sha256: CaseSha256Schema,
  actor: z.strictObject({
    kind: z.enum(["human", "agent", "script", "converter", "validator"]),
    name: z.string().trim().min(1),
  }),
  effects: z.array(z.strictObject({
    kind: CaseSafeIdSchema,
    refs: z.array(z.string().min(1)),
  })),
  committed_at: z.iso.datetime(),
});

const AdaptiveReceiptReadPreconditionSchema = z.discriminatedUnion("state", [
  z.strictObject({
    path: CaseWorkspacePathSchema,
    state: z.literal("present"),
    sha256: CaseSha256Schema,
  }),
  z.strictObject({
    path: CaseWorkspacePathSchema,
    state: z.literal("absent"),
  }),
]);

export const AdaptiveCaseReceiptV2Schema = z.strictObject({
  schema_version: z.literal("2"),
  receipt_type: AdaptiveReceiptTypeSchema,
  receipt_id: CaseSafeIdSchema,
  selector: z.string().min(1),
  plan_sha256: CaseSha256Schema,
  action_identity: z.strictObject({
    action_type: AdaptiveReceiptTypeSchema,
    identity_selector: z.string().min(1),
  }),
  semantic_input: z.unknown(),
  read_preconditions: z.array(AdaptiveReceiptReadPreconditionSchema).min(1),
  authority_target: z.strictObject({
    kind: CaseSafeIdSchema,
    selector: z.string().min(1),
    paths: z.array(CaseWorkspacePathSchema).min(1),
  }),
  actor: z.strictObject({
    kind: z.enum(["human", "agent", "script", "converter", "validator"]),
    name: z.string().trim().min(1),
  }),
  effects: z.array(z.strictObject({
    kind: CaseSafeIdSchema,
    refs: z.array(z.string().min(1)),
  })),
  committed_at: z.iso.datetime(),
}).superRefine((receipt, context) => {
  if (receipt.action_identity.action_type !== receipt.receipt_type) {
    context.addIssue({
      code: "custom",
      path: ["action_identity", "action_type"],
      message: "Receipt action identity must match receipt_type.",
    });
  }
});

export const AdaptiveCaseReceiptSchema = z.discriminatedUnion("schema_version", [
  AdaptiveCaseReceiptV1Schema,
  AdaptiveCaseReceiptV2Schema,
]);

export type AdaptiveObligationSubmitInput = z.infer<typeof AdaptiveObligationSubmitInputSchema>;
export type AdaptiveCaseReceipt = z.infer<typeof AdaptiveCaseReceiptSchema>;
