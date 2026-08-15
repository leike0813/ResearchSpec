import { stringify } from "yaml";

import type { CapabilityGraphProfile } from "../contracts/capability-graph.js";

export const ACADEMIC_PIPELINE_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "academic-pipeline",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "research" }],
  nodes: [
    { node_id: "research", kind: "subgraph", subgraph_id: "research-main", input_bindings: [], expected_outputs: [{ role: "research_report", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "research-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["research"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "write", kind: "subgraph", subgraph_id: "academic-paper", input_bindings: [], expected_outputs: [{ role: "manuscript_draft", required: true }], prerequisites: ["research-gate"], required_gate_ids: ["research-gate"], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "write-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["write"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "review", kind: "subgraph", subgraph_id: "academic-paper-reviewer", input_bindings: [], expected_outputs: [{ role: "review_synthesis", required: true }], prerequisites: ["write-gate"], required_gate_ids: ["write-gate"], required_decision_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  subgraphs: [
    { subgraph_id: "research-main", profile_id: "research-main", profile_version: "0.1.0" },
    { subgraph_id: "academic-paper", profile_id: "academic-paper", profile_version: "0.1.0" },
    { subgraph_id: "academic-paper-reviewer", profile_id: "academic-paper-reviewer", profile_version: "0.1.0" },
  ],
  gates: [
    { gate_id: "research-gate", owner_node_id: "research-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "write-gate", owner_node_id: "write-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT = `${stringify(ACADEMIC_PIPELINE_GRAPH_PROFILE)}\n`;
