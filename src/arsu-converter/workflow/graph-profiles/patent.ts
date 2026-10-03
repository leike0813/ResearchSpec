import { stringify } from "yaml";

import type { CapabilityGraphProfile } from "../../../core/contracts/capability-graph.js";

import type { AuthoredGraphProfile } from "./index.js";

export const PATENT_DISCLOSURE_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "patent-disclosure",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "intake" }],
  nodes: [
    { node_id: "intake", kind: "capability", capability_id: "design-patent-intake", input_bindings: [{ role: "technical_materials", source: "handoff" }], expected_outputs: [{ role: "patent_case", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "mining", kind: "capability", capability_id: "design-patent-invention-mining", input_bindings: [{ role: "patent_case", source: "node_output", from_node_id: "intake" }], expected_outputs: [{ role: "invention_brief", required: true }, { role: "search_request", required: true }], prerequisites: ["intake"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "search", kind: "capability", capability_id: "discovery-patent-search", input_bindings: [{ role: "search_request", source: "node_output", from_node_id: "mining" }], expected_outputs: [{ role: "search_results", required: true }], prerequisites: ["mining"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "prior-art", kind: "capability", capability_id: "analysis-patent-prior-art", input_bindings: [{ role: "patent_case", source: "node_output", from_node_id: "intake" }, { role: "invention_brief", source: "node_output", from_node_id: "mining" }, { role: "search_results", source: "node_output", from_node_id: "search" }], expected_outputs: [{ role: "prior_art_report", required: true }], prerequisites: ["search"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "disclosure", kind: "capability", capability_id: "generation-patent-disclosure", input_bindings: [{ role: "patent_case", source: "node_output", from_node_id: "intake" }, { role: "invention_brief", source: "node_output", from_node_id: "mining" }, { role: "prior_art_report", source: "node_output", from_node_id: "prior-art" }], expected_outputs: [{ role: "disclosure_bundle", required: true }], prerequisites: ["prior-art"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "check-disclosure", kind: "capability", capability_id: "check-patent-disclosure", input_bindings: [{ role: "disclosure_bundle", source: "node_output", from_node_id: "disclosure" }], expected_outputs: [{ role: "disclosure_review", required: true }], prerequisites: ["disclosure"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "disclosure-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["check-disclosure"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "layout-choice", kind: "decision", input_bindings: [], expected_outputs: [], prerequisites: ["disclosure-gate"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "protection-layout", kind: "capability", capability_id: "design-patent-protection-layout", input_bindings: [{ role: "disclosure_bundle", source: "node_output", from_node_id: "disclosure" }], expected_outputs: [{ role: "protection_plan", required: true }], prerequisites: ["layout-choice"], required_gate_ids: [], required_decision_ids: [], multiplicity: "optional", round_role: null },
    { node_id: "layout-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["protection-layout"], required_gate_ids: [], required_decision_ids: [], multiplicity: "optional", round_role: null },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [
    { gate_id: "patent-disclosure-complete", owner_node_id: "disclosure-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "patent-disclosure-layout", owner_node_id: "layout-gate", policy: "conditional", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  decisions: [{ decision_id: "patent-disclosure-layout", owner_node_id: "layout-choice", options: [{ option_id: "include-layout", unlocks: ["protection-layout", "layout-gate"] }, { option_id: "omit-layout", unlocks: [] }] }],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PATENT_DISCLOSURE_GRAPH_PROFILE_TEXT = stringify(PATENT_DISCLOSURE_GRAPH_PROFILE);

export const PATENT_APPLICATION_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "patent-application",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "application" }],
  nodes: [
    { node_id: "application", kind: "capability", capability_id: "generation-patent-application", input_bindings: [{ role: "disclosure_bundle", source: "handoff" }], expected_outputs: [{ role: "application_bundle", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "check-application", kind: "capability", capability_id: "check-patent-application", input_bindings: [{ role: "application_bundle", source: "node_output", from_node_id: "application" }], expected_outputs: [{ role: "application_review", required: true }], prerequisites: ["application"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "application-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["check-application"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [
    { gate_id: "patent-application-complete", owner_node_id: "application-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PATENT_APPLICATION_GRAPH_PROFILE_TEXT = stringify(PATENT_APPLICATION_GRAPH_PROFILE);

export const PATENT_DOCKET_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "patent-docket",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "disclosure" }],
  nodes: [
    { node_id: "disclosure", kind: "subgraph", subgraph_id: "patent-disclosure", input_bindings: [{ role: "technical_materials", source: "handoff" }], expected_outputs: [{ role: "patent_case", from_role: "patent_case", required: true }, { role: "disclosure_bundle", from_role: "disclosure_bundle", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "disclosure-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["disclosure"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "application", kind: "subgraph", subgraph_id: "patent-application", input_bindings: [{ role: "disclosure_bundle", source: "node_output", from_node_id: "disclosure", from_role: "disclosure_bundle" }], expected_outputs: [{ role: "application_bundle", from_role: "application_bundle", required: true }], prerequisites: ["disclosure-gate"], required_gate_ids: ["patent-docket-disclosure"], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "revision", kind: "capability", capability_id: "transform-patent-docket-revision", input_bindings: [{ role: "patent_case", source: "node_output", from_node_id: "disclosure", from_role: "patent_case" }, { role: "disclosure_bundle", source: "handoff" }, { role: "application_bundle", source: "handoff" }], expected_outputs: [{ role: "disclosure_bundle", required: true }, { role: "application_bundle", required: true }], prerequisites: ["application"], required_gate_ids: [], required_decision_ids: [], multiplicity: "repeatable", round_role: "revision" },
    { node_id: "docket-check", kind: "capability", capability_id: "check-patent-docket", input_bindings: [{ role: "disclosure_bundle", source: "node_output", from_node_id: "revision" }, { role: "application_bundle", source: "node_output", from_node_id: "revision" }], expected_outputs: [{ role: "docket_review", required: true }], prerequisites: ["revision"], required_gate_ids: [], required_decision_ids: [], multiplicity: "repeatable", round_role: "review" },
    { node_id: "docket-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["docket-check"], required_gate_ids: [], required_decision_ids: [], multiplicity: "repeatable", round_role: "review" },
    { node_id: "docket-outcome", kind: "decision", input_bindings: [], expected_outputs: [], prerequisites: ["docket-gate"], required_gate_ids: [], required_decision_ids: [], multiplicity: "repeatable", round_role: "review" },
  ],
  parallel_groups: [],
  subgraphs: [
    { subgraph_id: "patent-disclosure", profile_id: "patent-disclosure", profile_version: "0.1.0", entry_id: "main", entry_node_id: "intake" },
    { subgraph_id: "patent-application", profile_id: "patent-application", profile_version: "0.1.0", entry_id: "main", entry_node_id: "application" },
  ],
  gates: [
    { gate_id: "patent-docket-disclosure", owner_node_id: "disclosure-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "patent-docket-complete", owner_node_id: "docket-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  decisions: [
    { decision_id: "patent-docket-outcome", owner_node_id: "docket-outcome", options: [{ option_id: "continue", unlocks: ["revision"] }, { option_id: "complete", unlocks: [] }] },
  ],
  revision_round_template: {
    revision_node_id: "revision",
    review_execution_node_id: "docket-check",
    review_node_id: "docket-outcome",
    continue_option_id: "continue",
    exit_option_id: "complete",
  },
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PATENT_DOCKET_GRAPH_PROFILE_TEXT = stringify(PATENT_DOCKET_GRAPH_PROFILE);

export const PATENT_INTELLIGENCE_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "patent-intelligence",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "search" }],
  nodes: [
    { node_id: "search", kind: "capability", capability_id: "discovery-patent-search", input_bindings: [{ role: "search_request", source: "handoff" }], expected_outputs: [{ role: "search_results", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "reading", kind: "capability", capability_id: "analysis-patent-reading", input_bindings: [{ role: "patent_corpus", source: "node_output", from_node_id: "search", from_role: "search_results" }], expected_outputs: [{ role: "patent_notes", required: true }, { role: "claim_features", required: true }], prerequisites: ["search"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "branch-choice", kind: "decision", input_bindings: [], expected_outputs: [], prerequisites: ["reading"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "claim-chart", kind: "capability", capability_id: "analysis-patent-claim-chart", input_bindings: [{ role: "claim_features", source: "node_output", from_node_id: "reading" }, { role: "comparison_materials", source: "handoff" }], expected_outputs: [{ role: "claim_chart", required: true }, { role: "chart_evidence", required: true }], prerequisites: ["reading"], required_gate_ids: [], required_decision_ids: [], multiplicity: "optional", round_role: null },
    { node_id: "patent-map", kind: "capability", capability_id: "generation-patent-map", input_bindings: [{ role: "patent_notes", source: "node_output", from_node_id: "reading" }], expected_outputs: [{ role: "patent_map", required: true }], prerequisites: ["reading"], required_gate_ids: [], required_decision_ids: [], multiplicity: "optional", round_role: null },
    { node_id: "exam-policy", kind: "capability", capability_id: "discovery-patent-exam-policy", input_bindings: [], expected_outputs: [{ role: "policy_brief", required: true }], prerequisites: ["reading"], required_gate_ids: [], required_decision_ids: [], multiplicity: "optional", round_role: null },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [],
  decisions: [
    { decision_id: "patent-intelligence-branch", owner_node_id: "branch-choice", options: [{ option_id: "claim-chart", unlocks: ["claim-chart"] }, { option_id: "patent-map", unlocks: ["patent-map"] }, { option_id: "exam-policy", unlocks: ["exam-policy"] }, { option_id: "chart-and-map", unlocks: ["claim-chart", "patent-map"] }, { option_id: "chart-and-policy", unlocks: ["claim-chart", "exam-policy"] }, { option_id: "map-and-policy", unlocks: ["patent-map", "exam-policy"] }, { option_id: "all", unlocks: ["claim-chart", "patent-map", "exam-policy"] }, { option_id: "interpret-only", unlocks: [] }] },
  ],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PATENT_INTELLIGENCE_GRAPH_PROFILE_TEXT = stringify(PATENT_INTELLIGENCE_GRAPH_PROFILE);

export const PATENT_OA_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "patent-oa",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "oa-response" }],
  nodes: [
    { node_id: "oa-response", kind: "capability", capability_id: "generation-patent-oa-response", input_bindings: [{ role: "office_action", source: "handoff" }, { role: "application_bundle", source: "handoff" }], expected_outputs: [{ role: "oa_response", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "check-oa", kind: "capability", capability_id: "check-patent-oa-response", input_bindings: [{ role: "office_action", source: "handoff" }, { role: "application_bundle", source: "handoff" }, { role: "oa_response", source: "node_output", from_node_id: "oa-response" }], expected_outputs: [{ role: "oa_review", required: true }], prerequisites: ["oa-response"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "oa-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: ["check-oa"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [
    { gate_id: "patent-oa-complete", owner_node_id: "oa-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PATENT_OA_GRAPH_PROFILE_TEXT = stringify(PATENT_OA_GRAPH_PROFILE);

export const RESEARCH_TO_PATENT_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "research-to-patent",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "research" }],
  nodes: [
    { node_id: "research", kind: "subgraph", subgraph_id: "research-main", input_bindings: [], expected_outputs: [{ role: "research_report", from_role: "research_report", required: true }, { role: "annotated_bibliography", from_role: "annotated_bibliography", required: true }, { role: "synthesis_report", from_role: "synthesis_report", required: true }, { role: "graded_sources", from_role: "graded_sources", required: true }], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "research-intake", kind: "capability", capability_id: "design-patent-intake", input_bindings: [{ role: "technical_materials", source: "handoff" }, { role: "research_report", source: "node_output", from_node_id: "research", from_role: "research_report" }, { role: "synthesis_report", source: "node_output", from_node_id: "research", from_role: "synthesis_report" }, { role: "graded_sources", source: "node_output", from_node_id: "research", from_role: "graded_sources" }], expected_outputs: [{ role: "patent_case", required: true }], prerequisites: ["research"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "patent", kind: "subgraph", subgraph_id: "patent-docket", input_bindings: [{ role: "technical_materials", source: "node_output", from_node_id: "research-intake", from_role: "patent_case" }], expected_outputs: [{ role: "patent_case", from_role: "patent_case", required: true }, { role: "disclosure_bundle", from_role: "disclosure_bundle", required: true }, { role: "application_bundle", from_role: "application_bundle", required: true }], prerequisites: ["research-intake"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  subgraphs: [
    { subgraph_id: "research-main", profile_id: "research-main", profile_version: "0.1.0", entry_id: "main", entry_node_id: "research-question" },
    { subgraph_id: "patent-docket", profile_id: "patent-docket", profile_version: "0.1.0", entry_id: "main", entry_node_id: "disclosure" },
  ],
  gates: [],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const RESEARCH_TO_PATENT_GRAPH_PROFILE_TEXT = stringify(RESEARCH_TO_PATENT_GRAPH_PROFILE);

export const PATENT_INFORMED_PAPER_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "patent-informed-paper",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "source-gate" }],
  nodes: [
    { node_id: "source-gate", kind: "gate", input_bindings: [], expected_outputs: [], prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "research", kind: "subgraph", subgraph_id: "research-main", input_bindings: [], expected_outputs: [{ role: "research_report", from_role: "research_report", required: true }, { role: "annotated_bibliography", from_role: "annotated_bibliography", required: true }, { role: "synthesis_report", from_role: "synthesis_report", required: true }, { role: "graded_sources", from_role: "graded_sources", required: true }], prerequisites: ["source-gate"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "intelligence", kind: "subgraph", subgraph_id: "patent-intelligence", input_bindings: [{ role: "search_request", source: "handoff" }], expected_outputs: [{ role: "patent_notes", from_role: "patent_notes", required: true }, { role: "claim_chart", from_role: "claim_chart", required: false }], prerequisites: ["source-gate"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "bridge", kind: "capability", capability_id: "transform-patent-research-evidence", input_bindings: [{ role: "patent_notes", source: "node_output", from_node_id: "intelligence", from_role: "patent_notes" }, { role: "annotated_bibliography", source: "node_output", from_node_id: "research", from_role: "annotated_bibliography" }, { role: "synthesis_report", source: "node_output", from_node_id: "research", from_role: "synthesis_report" }, { role: "graded_sources", source: "node_output", from_node_id: "research", from_role: "graded_sources" }], expected_outputs: [{ role: "annotated_bibliography", required: true }, { role: "synthesis_report", required: true }], prerequisites: ["research", "intelligence"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
    { node_id: "writing", kind: "subgraph", subgraph_id: "academic-paper", input_bindings: [{ role: "annotated_bibliography", source: "node_output", from_node_id: "bridge", from_role: "annotated_bibliography" }, { role: "synthesis_report", source: "node_output", from_node_id: "bridge", from_role: "synthesis_report" }], expected_outputs: [{ role: "manuscript_draft", from_role: "manuscript_draft", required: true }], prerequisites: ["bridge"], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [
    { group_id: "patent-informed-sources", node_ids: ["research", "intelligence"], join_policy: "all" },
  ],
  subgraphs: [
    { subgraph_id: "research-main", profile_id: "research-main", profile_version: "0.1.0", entry_id: "main", entry_node_id: "research-question" },
    { subgraph_id: "patent-intelligence", profile_id: "patent-intelligence", profile_version: "0.1.0", entry_id: "main", entry_node_id: "search" },
    { subgraph_id: "academic-paper", profile_id: "academic-paper", profile_version: "0.1.0", entry_id: "main", entry_node_id: "intake" },
  ],
  gates: [{ gate_id: "patent-informed-source-scope", owner_node_id: "source-gate", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] }],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const satisfies CapabilityGraphProfile;

export const PATENT_INFORMED_PAPER_GRAPH_PROFILE_TEXT = stringify(PATENT_INFORMED_PAPER_GRAPH_PROFILE);

export const PATENT_GRAPH_PROFILES: readonly AuthoredGraphProfile[] = [
  { profile: PATENT_DISCLOSURE_GRAPH_PROFILE, projection: PATENT_DISCLOSURE_GRAPH_PROFILE_TEXT },
  { profile: PATENT_APPLICATION_GRAPH_PROFILE, projection: PATENT_APPLICATION_GRAPH_PROFILE_TEXT },
  { profile: PATENT_DOCKET_GRAPH_PROFILE, projection: PATENT_DOCKET_GRAPH_PROFILE_TEXT },
  { profile: PATENT_INTELLIGENCE_GRAPH_PROFILE, projection: PATENT_INTELLIGENCE_GRAPH_PROFILE_TEXT },
  { profile: PATENT_OA_GRAPH_PROFILE, projection: PATENT_OA_GRAPH_PROFILE_TEXT },
  { profile: RESEARCH_TO_PATENT_GRAPH_PROFILE, projection: RESEARCH_TO_PATENT_GRAPH_PROFILE_TEXT },
  { profile: PATENT_INFORMED_PAPER_GRAPH_PROFILE, projection: PATENT_INFORMED_PAPER_GRAPH_PROFILE_TEXT },
];
