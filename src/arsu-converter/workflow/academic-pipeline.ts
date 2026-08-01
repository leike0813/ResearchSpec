import { stringify } from "yaml";

import { PipelineProfileSchema, type PipelineProfile } from "../../core/contracts/pipeline-profile.js";

export const ACADEMIC_PIPELINE_PROFILE: PipelineProfile = PipelineProfileSchema.parse({
  schema_version: "1",
  profile_id: "academic-pipeline",
  profile_version: "1",
  entries: [
    { entry_id: "end-to-end", route_ref: "academic-pipeline:end-to-end", checkpoint: "research", kind: "end-to-end" },
    { entry_id: "mid-entry", route_ref: "academic-pipeline:mid-entry", checkpoint: "entry", kind: "mid-entry" },
  ],
  children: [
    { node_id: "research", route_ref: "deep-research:full", prerequisites: [], required_gate_ids: ["evidence-integrity"], branch_ids: [], multiplicity: "optional", round_role: null },
    { node_id: "write", route_ref: "academic-paper:full", prerequisites: ["research"], required_gate_ids: ["manuscript-integrity"], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "review", route_ref: "academic-paper-reviewer:full", prerequisites: ["write"], required_gate_ids: ["review-confirmation"], branch_ids: ["editorial-outcome"], multiplicity: "one", round_role: null },
    { node_id: "revision", route_ref: "academic-paper:revision", prerequisites: ["review"], required_gate_ids: ["revision-completeness"], branch_ids: [], multiplicity: "repeatable", round_role: "revision" },
    { node_id: "re-review", route_ref: "academic-paper-reviewer:re-review", prerequisites: ["revision"], required_gate_ids: ["re-review-confirmation"], branch_ids: ["revision-outcome"], multiplicity: "repeatable", round_role: "re-review" },
    { node_id: "final-integrity", route_ref: "academic-paper:citation-check", prerequisites: ["write"], required_gate_ids: ["final-integrity"], branch_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  gates: [
    { gate_id: "evidence-integrity", owner_node_id: "research", checkpoint: "research-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "manuscript-integrity", owner_node_id: "write", checkpoint: "draft-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "review-confirmation", owner_node_id: "review", checkpoint: "review-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "re-review-confirmation", owner_node_id: "re-review", checkpoint: "re-review-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "revision-completeness", owner_node_id: "revision", checkpoint: "revision-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "final-integrity", owner_node_id: "final-integrity", checkpoint: "ready-to-finish", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  branches: [
    { decision_id: "editorial-outcome", owner_node_id: "review", options: [
      { option_id: "accepted", unlocks: ["final-integrity"] },
      { option_id: "revision", unlocks: ["revision"] },
    ] },
    { decision_id: "revision-outcome", owner_node_id: "re-review", options: [
      { option_id: "accepted", unlocks: ["final-integrity"] },
      { option_id: "continue-revision", unlocks: ["revision"] },
    ] },
  ],
  transitions: [
    { transition_id: "research-to-write", from: "research", to: "write", required_child_node_ids: ["research"], required_gate_ids: ["evidence-integrity"], required_branch_ids: [] },
    { transition_id: "write-to-review", from: "write", to: "review", required_child_node_ids: ["write"], required_gate_ids: ["manuscript-integrity"], required_branch_ids: [] },
    { transition_id: "review-to-revision", from: "review", to: "revision", required_child_node_ids: ["review"], required_gate_ids: ["review-confirmation"], required_branch_ids: ["editorial-outcome"] },
    { transition_id: "revision-to-re-review", from: "revision", to: "re-review", required_child_node_ids: ["revision"], required_gate_ids: ["revision-completeness"], required_branch_ids: [] },
    { transition_id: "re-review-to-revision", from: "re-review", to: "revision", required_child_node_ids: ["re-review"], required_gate_ids: ["re-review-confirmation"], required_branch_ids: ["revision-outcome"] },
    { transition_id: "review-to-final", from: "review", to: "final-integrity", required_child_node_ids: ["review"], required_gate_ids: ["review-confirmation"], required_branch_ids: ["editorial-outcome"] },
    { transition_id: "re-review-to-final", from: "re-review", to: "final-integrity", required_child_node_ids: ["re-review"], required_gate_ids: ["re-review-confirmation"], required_branch_ids: ["revision-outcome"] },
  ],
  override_policy: { failed_gate_requires_decision: true },
  revision_round_template: {
    revision_node_id: "revision",
    review_node_id: "re-review",
    continue_option_id: "continue-revision",
    exit_option_id: "accepted",
  },
});

export const ACADEMIC_PIPELINE_PROFILE_TEXT = stringify(ACADEMIC_PIPELINE_PROFILE);
