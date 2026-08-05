import { z } from "zod";

import { ManuscriptDeliverySchema, StableIdSchema } from "./stable-specs.js";
import { HandoffInputSchema, HandoffOutputSchema } from "./subflow-handoff.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

const NonEmptySchema = z.string().trim().min(1);

export const QuartoProbeSummarySchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("available"), checked_at: z.iso.datetime({ offset: true }), version: NonEmptySchema }),
  z.strictObject({ status: z.literal("unavailable"), checked_at: z.iso.datetime({ offset: true }), reason: NonEmptySchema }),
  z.strictObject({ status: z.literal("unknown"), checked_at: z.iso.datetime({ offset: true }), reason: NonEmptySchema }),
]);

export const RenderConsentSchema = z.strictObject({
  execute: z.literal(true),
  confirmed_by: NonEmptySchema,
  confirmed_at: z.iso.datetime({ offset: true }),
});

export const SubflowStartCommandSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  confirmed_at: z.iso.datetime({ offset: true }),
  profile_entry: StableIdSchema.optional(),
  parent: z.strictObject({
    instance_id: StableIdSchema,
    node_id: StableIdSchema,
  }).optional(),
  round: z.number().int().positive().optional(),
  prerequisites: z.array(NonEmptySchema),
  handoff_inputs: z.array(HandoffInputSchema),
  planned_outputs: z.array(HandoffOutputSchema),
  manuscript_delivery: ManuscriptDeliverySchema.optional(),
  quarto_probe: QuartoProbeSummarySchema.optional(),
  render_consent: RenderConsentSchema.optional(),
  formal_gates: z.array(StableIdSchema),
  cost: z.strictObject({
    effort: NonEmptySchema,
    interaction: NonEmptySchema,
  }),
}).superRefine((value, context) => {
  if (value.round !== undefined && value.parent === undefined) {
    context.addIssue({ code: "custom", path: ["round"], message: "A round requires a pipeline parent." });
  }
  if (value.profile_entry !== undefined && value.parent !== undefined) {
    context.addIssue({ code: "custom", path: ["profile_entry"], message: "A profile entry starts a pipeline parent and cannot also name a parent." });
  }
  addDuplicateIssues(value.handoff_inputs, "handoff_inputs", context);
  addDuplicateIssues(value.planned_outputs, "planned_outputs", context);
});

function addDuplicateIssues(
  values: readonly { role: string }[],
  field: "handoff_inputs" | "planned_outputs",
  context: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (seen.has(value.role)) {
      context.addIssue({ code: "custom", path: [field, index, "role"], message: `Duplicate role: ${value.role}` });
    }
    seen.add(value.role);
  }
}

export type SubflowStartCommand = z.infer<typeof SubflowStartCommandSchema>;
