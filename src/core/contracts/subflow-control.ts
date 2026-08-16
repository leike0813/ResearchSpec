import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";
import { ManuscriptDeliverySchema } from "./stable-specs.js";
import { QuartoProbeSummarySchema, RenderConsentSchema } from "./subflow-command.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

const Rfc3339Schema = z.iso.datetime({ offset: true });
const RouteRefSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/);
const NonEmptySchema = z.string().trim().min(1);

export const GateAttemptSchema = z.strictObject({
  attempt_id: StableIdSchema,
  verdict: z.enum(["pass", "pass_with_conditions", "fail"]),
  confirmed_by: NonEmptySchema,
  confirmed_at: Rfc3339Schema,
  summary: NonEmptySchema,
  evidence: z.array(z.strictObject({ role: NonEmptySchema, path: NonEmptySchema })).optional(),
});

export const SubflowGateSchema = z.strictObject({
  gate_id: StableIdSchema,
  attempts: z.array(GateAttemptSchema),
  override: z.strictObject({
    decision_id: StableIdSchema,
    approved_by: NonEmptySchema,
    approved_at: Rfc3339Schema,
    reason: NonEmptySchema,
  }).nullable().optional(),
});

export const SubflowDecisionSchema = z.strictObject({
  decision_id: StableIdSchema,
  kind: z.enum(["scope", "claim", "structure", "branch"]),
  choice: NonEmptySchema,
  decided_by: NonEmptySchema,
  decided_at: Rfc3339Schema,
  reason: NonEmptySchema.optional(),
});

export const SubflowTransitionSchema = z.strictObject({
  transition_id: StableIdSchema,
  from: StableIdSchema,
  to: StableIdSchema,
  transitioned_at: Rfc3339Schema,
  actor: NonEmptySchema,
});

export const SubflowControlSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  instance_id: StableIdSchema,
  route_ref: RouteRefSchema,
  skill_id: StableIdSchema,
  mode_id: StableIdSchema,
  profile: z.strictObject({
    id: z.enum(["academic-pipeline", "review-response"]),
    version: NonEmptySchema,
    path: z.enum(["profiles/academic-pipeline.yaml", "profiles/review-response.yaml"]),
  }).nullable(),
  parent: z.strictObject({ instance_id: StableIdSchema, node_id: StableIdSchema }).nullable(),
  round: z.number().int().positive().optional(),
  started_at: Rfc3339Schema,
  start_confirmation: z.strictObject({
    confirmed_by: NonEmptySchema,
    confirmed_at: Rfc3339Schema,
    entry_point: StableIdSchema.optional(),
    prerequisites: z.array(NonEmptySchema),
    expected_outputs: z.array(NonEmptySchema),
    manuscript_delivery: ManuscriptDeliverySchema.optional(),
    quarto_probe: QuartoProbeSummarySchema.optional(),
    render_consent: RenderConsentSchema.optional(),
    formal_gates: z.array(StableIdSchema),
    cost: z.strictObject({ effort: NonEmptySchema, interaction: NonEmptySchema }),
  }),
  status: z.enum(["active", "paused", "blocked", "complete", "cancelled"]),
  checkpoint: StableIdSchema,
  gates: z.array(SubflowGateSchema),
  decisions: z.array(SubflowDecisionSchema),
  transitions: z.array(SubflowTransitionSchema),
}).superRefine((value, context) => {
  if (value.parent !== null && value.profile === null) {
    context.addIssue({ code: "custom", path: ["profile"], message: "Pipeline children require a profile." });
  }
  if (value.round !== undefined && value.parent === null) {
    context.addIssue({ code: "custom", path: ["round"], message: "Only pipeline children can declare a round." });
  }
  uniqueBy(value.gates, (item) => item.gate_id, ["gates"], context);
  for (const [gateIndex, gate] of value.gates.entries()) {
    uniqueBy(gate.attempts, (item) => item.attempt_id, ["gates", gateIndex, "attempts"], context);
  }
  uniqueBy(value.decisions, (item) => item.decision_id, ["decisions"], context);
});

function uniqueBy<T>(
  values: readonly T[],
  key: (value: T) => string,
  path: (string | number)[],
  context: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    const id = key(value);
    if (seen.has(id)) context.addIssue({ code: "custom", path: [...path, index], message: `Duplicate ID: ${id}` });
    seen.add(id);
  }
}

export type SubflowControl = z.infer<typeof SubflowControlSchema>;
