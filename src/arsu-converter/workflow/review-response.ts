import { stringify } from "yaml";

import { PipelineProfileSchema, type PipelineProfile } from "../../core/contracts/pipeline-profile.js";

export const REVIEW_RESPONSE_PROFILE: PipelineProfile = PipelineProfileSchema.parse({
  schema_version: "1",
  profile_id: "review-response",
  profile_version: "1",
  entries: [{ entry_id: "full", route_ref: "review-response:full", checkpoint: "intake", kind: "end-to-end" }],
  children: [
    { node_id: "intake", route_ref: "review-response:full", prerequisites: [], required_gate_ids: [], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "manuscript-analysis", route_ref: "review-response:full", prerequisites: ["intake"], required_gate_ids: [], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "comment-atomization", route_ref: "review-response:full", prerequisites: ["manuscript-analysis"], required_gate_ids: ["review-response-comment-coverage"], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "workboard", route_ref: "review-response:full", prerequisites: ["comment-atomization"], required_gate_ids: ["review-response-strategy"], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "strategy-execution", route_ref: "review-response:full", prerequisites: ["workboard"], required_gate_ids: ["review-response-evidence"], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "final-assembly", route_ref: "review-response:full", prerequisites: ["strategy-execution"], required_gate_ids: ["review-response-response-coverage", "review-response-final-assembly"], branch_ids: ["review-response-outcome"], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  gates: [
    { gate_id: "review-response-comment-coverage", owner_node_id: "comment-atomization", checkpoint: "comment-atomization-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "review-response-strategy", owner_node_id: "workboard", checkpoint: "workboard-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "review-response-evidence", owner_node_id: "strategy-execution", checkpoint: "strategy-execution-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "review-response-response-coverage", owner_node_id: "final-assembly", checkpoint: "final-assembly-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "review-response-final-assembly", owner_node_id: "final-assembly", checkpoint: "final-assembly-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  branches: [{ decision_id: "review-response-outcome", owner_node_id: "final-assembly", options: [
    { option_id: "complete", unlocks: ["final-assembly"] },
    { option_id: "continue", unlocks: ["strategy-execution"] },
  ] }],
  transitions: [
    { transition_id: "intake-to-manuscript-analysis", from: "intake", to: "manuscript-analysis", required_child_node_ids: ["intake"], required_gate_ids: [], required_branch_ids: [] },
    { transition_id: "manuscript-analysis-to-comment-atomization", from: "manuscript-analysis", to: "comment-atomization", required_child_node_ids: ["manuscript-analysis"], required_gate_ids: [], required_branch_ids: [] },
    { transition_id: "comment-atomization-to-workboard", from: "comment-atomization", to: "workboard", required_child_node_ids: ["comment-atomization"], required_gate_ids: ["review-response-comment-coverage"], required_branch_ids: [] },
    { transition_id: "workboard-to-strategy-execution", from: "workboard", to: "strategy-execution", required_child_node_ids: ["workboard"], required_gate_ids: ["review-response-strategy"], required_branch_ids: [] },
    { transition_id: "strategy-execution-to-final-assembly", from: "strategy-execution", to: "final-assembly", required_child_node_ids: ["strategy-execution"], required_gate_ids: ["review-response-evidence"], required_branch_ids: [] },
  ],
  override_policy: { failed_gate_requires_decision: true },
  revision_round_template: { revision_node_id: "strategy-execution", review_node_id: "final-assembly", continue_option_id: "continue", exit_option_id: "complete" },
});

export function renderReviewResponseProfile(profile: PipelineProfile = REVIEW_RESPONSE_PROFILE): string {
  return `${stringify(PipelineProfileSchema.parse(profile)).trimEnd()}\n`;
}
