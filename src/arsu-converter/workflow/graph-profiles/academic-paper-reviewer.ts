import { stringify } from "yaml";

import type { CapabilityGraphProfile } from "../../../core/contracts/capability-graph.js";

export const ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "academic-paper-reviewer",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "panel", route_ref: "academic-paper-reviewer:full" }],
  nodes: [
    { node_id: "panel", kind: "capability", capability_id: "design-review-panel-config", input_bindings: [{ role: "manuscript_draft", source: "handoff" }], expected_outputs: [{ role: "review_panel_config", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "specialist", kind: "capability", capability_id: "judgment-specialist-review", input_bindings: [{ role: "manuscript_draft", source: "handoff" }, { role: "review_panel_config", source: "node_output", from_node_id: "panel" }], expected_outputs: [{ role: "specialist_review", required: true }], prerequisites: ["panel"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "da", kind: "capability", capability_id: "judgment-devils-advocate-stress-test", input_bindings: [{ role: "manuscript_draft", source: "handoff" }, { role: "review_panel_config", source: "node_output", from_node_id: "panel" }], expected_outputs: [{ role: "stress_test_report", required: true }], prerequisites: ["panel"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "editorial", kind: "capability", capability_id: "judgment-editorial-judgment", input_bindings: [{ role: "manuscript_draft", source: "handoff" }, { role: "review_panel_config", source: "node_output", from_node_id: "panel" }], expected_outputs: [{ role: "editorial_decision", required: true }], prerequisites: ["specialist"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "synthesis", kind: "capability", capability_id: "judgment-review-synthesis", input_bindings: [{ role: "specialist_review", source: "node_output", from_node_id: "specialist" }, { role: "editorial_decision", source: "node_output", from_node_id: "editorial" }, { role: "stress_test_report", source: "node_output", from_node_id: "da" }], expected_outputs: [{ role: "review_synthesis", required: true }], prerequisites: ["editorial", "da"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [{ group_id: "reviewers", node_ids: ["specialist", "da"], join_policy: "all" }],
  subgraphs: [],
  gates: [],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT = stringify(ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE);
