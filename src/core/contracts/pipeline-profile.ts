import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";
import { CURRENT_WORKSPACE_SCHEMA_VERSION } from "./workspace-format.js";

const RouteRefSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/);
const IdListSchema = z.array(StableIdSchema);

export const PipelineProfileEntrySchema = z.strictObject({
  entry_id: StableIdSchema,
  route_ref: RouteRefSchema,
  checkpoint: StableIdSchema,
  kind: z.enum(["end-to-end", "mid-entry"]),
});

export const PipelineProfileChildSchema = z.strictObject({
  node_id: StableIdSchema,
  route_ref: RouteRefSchema,
  prerequisites: IdListSchema,
  required_gate_ids: IdListSchema,
  branch_ids: IdListSchema,
  multiplicity: z.enum(["one", "optional", "repeatable"]),
  round_role: z.string().trim().min(1).nullable(),
});

export const PipelineProfileSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  profile_id: z.literal("academic-pipeline"),
  profile_version: z.string().trim().min(1),
  entries: z.array(PipelineProfileEntrySchema).min(1),
  children: z.array(PipelineProfileChildSchema).min(1),
  parallel_groups: z.array(z.strictObject({
    group_id: StableIdSchema,
    child_node_ids: IdListSchema.min(2),
    join_policy: z.enum(["all", "any"]),
  })),
  gates: z.array(z.strictObject({
    gate_id: StableIdSchema,
    owner_node_id: StableIdSchema,
    checkpoint: StableIdSchema,
    policy: z.enum(["required", "conditional"]),
    verdicts: z.array(z.enum(["pass", "pass_with_conditions", "fail"])).min(1),
  })),
  branches: z.array(z.strictObject({
    decision_id: StableIdSchema,
    owner_node_id: StableIdSchema,
    options: z.array(z.strictObject({ option_id: StableIdSchema, unlocks: IdListSchema })).min(2),
  })),
  transitions: z.array(z.strictObject({
    transition_id: StableIdSchema,
    from: StableIdSchema,
    to: StableIdSchema,
    required_child_node_ids: IdListSchema,
    required_gate_ids: IdListSchema,
    required_branch_ids: IdListSchema,
  })),
  override_policy: z.strictObject({ failed_gate_requires_decision: z.literal(true) }),
  revision_round_template: z.strictObject({
    revision_node_id: StableIdSchema,
    review_node_id: StableIdSchema,
    continue_option_id: StableIdSchema,
    exit_option_id: StableIdSchema,
  }),
});

export type PipelineProfile = z.infer<typeof PipelineProfileSchema>;

