import { stringify } from "yaml";
import { PipelineProfileSchema, type PipelineProfile } from "../../core/contracts/pipeline-profile.js";

export const PAPER_HUMANIZER_PROFILE: PipelineProfile = PipelineProfileSchema.parse({
  schema_version: "1",
  profile_id: "paper-humanizer",
  profile_version: "1",
  entries: [
    { entry_id: "review", route_ref: "paper-humanizer:review", checkpoint: "review", kind: "end-to-end" },
    { entry_id: "full", route_ref: "paper-humanizer:full", checkpoint: "full", kind: "end-to-end" },
  ],
  children: [],
  parallel_groups: [],
  gates: [{ gate_id: "paper-humanizer-acceptance", owner_node_id: "full", checkpoint: "full", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] }],
  branches: [],
  transitions: [],
  override_policy: { failed_gate_requires_decision: true },
  revision_round_template: null,
});

export function renderPaperHumanizerProfile(profile: PipelineProfile = PAPER_HUMANIZER_PROFILE): string {
  return `${stringify(PipelineProfileSchema.parse(profile)).trimEnd()}\n`;
}
