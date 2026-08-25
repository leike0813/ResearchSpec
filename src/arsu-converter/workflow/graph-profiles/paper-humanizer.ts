import { stringify } from "yaml";

import type { CapabilityGraphProfile } from "../../../core/contracts/capability-graph.js";

export const PAPER_HUMANIZER_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "paper-humanizer",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "review", kind: "end-to-end", node_id: "review" }],
  nodes: [
    {
      node_id: "review",
      kind: "capability",
      capability_id: "check-paper-humanization-review",
      input_bindings: [
        { role: "manuscript_source", source: "handoff" },
        { role: "user_constraints", source: "parameter", value: null },
      ],
      expected_outputs: [
        { role: "humanization_review_report", required: true },
        { role: "humanization_revision_plan", required: true },
      ],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "plan-gate",
      kind: "gate",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["review"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "plan-decision",
      kind: "decision",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["plan-gate"],
      required_gate_ids: ["paper-humanizer-plan"],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "revision",
      kind: "capability",
      capability_id: "transform-paper-humanization-revision",
      input_bindings: [
        { role: "manuscript_source", source: "handoff" },
        { role: "humanization_revision_plan", source: "node_output", from_node_id: "review" },
      ],
      expected_outputs: [
        { role: "humanized_manuscript", required: true },
        { role: "humanization_candidate_artifact", required: true },
      ],
      prerequisites: ["plan-decision"],
      required_gate_ids: ["paper-humanizer-plan"],
      required_decision_ids: [],
      multiplicity: "repeatable",
      round_role: "revision",
    },
    {
      node_id: "verification",
      kind: "capability",
      capability_id: "check-paper-humanization-verification",
      input_bindings: [
        { role: "manuscript_source", source: "handoff" },
        { role: "humanization_candidate_artifact", source: "node_output", from_node_id: "revision" },
      ],
      expected_outputs: [{ role: "humanization_verification_report", required: true }],
      prerequisites: ["revision"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "acceptance",
      kind: "decision",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["verification"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "repeatable",
      round_role: "acceptance",
    },
    {
      node_id: "exit-gate",
      kind: "gate",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["plan-decision"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [
    { gate_id: "paper-humanizer-plan", owner_node_id: "plan-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "paper-humanizer-exit", owner_node_id: "exit-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  decisions: [
    {
      decision_id: "paper-humanizer-plan-decision",
      owner_node_id: "plan-decision",
      options: [
        { option_id: "approve", unlocks: ["revision"] },
        { option_id: "defer", unlocks: ["exit-gate"] },
      ],
    },
    {
      decision_id: "paper-humanizer-acceptance",
      owner_node_id: "acceptance",
      options: [
        { option_id: "revise", unlocks: ["revision"] },
        { option_id: "accept", unlocks: ["exit-gate"] },
      ],
    },
  ],
  revision_round_template: {
    revision_node_id: "revision",
    review_node_id: "acceptance",
    continue_option_id: "revise",
    exit_option_id: "accept",
  },
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PAPER_HUMANIZER_GRAPH_PROFILE_TEXT = stringify(PAPER_HUMANIZER_GRAPH_PROFILE);
