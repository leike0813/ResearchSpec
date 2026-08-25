import { stringify } from "yaml";

import type { CapabilityGraphProfile } from "../../../core/contracts/capability-graph.js";

export const ACADEMIC_PAPER_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "academic-paper",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [
    { entry_id: "main", kind: "end-to-end", node_id: "intake", route_ref: "academic-paper:full" },
    { entry_id: "format", kind: "end-to-end", node_id: "format", route_ref: "academic-paper:format-convert" },
  ],
  nodes: [
    { node_id: "intake", kind: "capability", capability_id: "design-writing-intake", input_bindings: [{ role: "project_intent", source: "stable_spec" }], expected_outputs: [{ role: "writing_configuration", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "structure", kind: "capability", capability_id: "design-manuscript-structure-design", input_bindings: [{ role: "writing_configuration", source: "node_output", from_node_id: "intake" }], expected_outputs: [{ role: "paper_outline", required: true }], prerequisites: ["intake"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "argument", kind: "capability", capability_id: "design-argument-blueprint", input_bindings: [{ role: "paper_outline", source: "node_output", from_node_id: "structure" }], expected_outputs: [{ role: "argument_blueprint", required: true }], prerequisites: ["structure"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "draft", kind: "capability", capability_id: "generation-manuscript-drafting", input_bindings: [{ role: "argument_blueprint", source: "node_output", from_node_id: "argument" }], expected_outputs: [{ role: "manuscript_draft", required: true }], prerequisites: ["argument"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "cite-check", kind: "capability", capability_id: "check-citation-format-compliance", input_bindings: [{ role: "manuscript_draft", source: "node_output", from_node_id: "draft" }], expected_outputs: [{ role: "citation_compliance_report", required: true }], prerequisites: ["draft"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "paper-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["cite-check"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "abstract", kind: "capability", capability_id: "generation-abstract-writing", input_bindings: [{ role: "manuscript_draft", source: "node_output", from_node_id: "draft" }], expected_outputs: [{ role: "abstract", required: true }], prerequisites: ["paper-gate"], required_gate_ids: ["paper-gate"], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "format", kind: "capability", capability_id: "generation-format-rendering", input_bindings: [{ role: "manuscript_draft", source: "handoff" }], expected_outputs: [{ role: "formatted_manuscript", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null, delivery_requirement: "quarto_available_for_qmd" },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [{ gate_id: "paper-gate", owner_node_id: "paper-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] }],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const ACADEMIC_PAPER_GRAPH_PROFILE_TEXT = stringify(ACADEMIC_PAPER_GRAPH_PROFILE);
