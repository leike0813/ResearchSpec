import type { CapabilityAuthoringSource } from "./author.js";

const PROCEDURES = "src/arsu-converter/authoring/procedures/m1";
const TOOL_ROOT = "src/arsu-converter/authoring/checkers/sr-screening";
const role = (role: string, schema_ref: string, source_policy: "handoff" | "node_output" | "parameter" | ("handoff" | "node_output")[] = "handoff", required = true) => ({ role, schema_ref, source_policy, required });
const output = (role: string, schema_ref: string) => ({ role, schema_ref, required: true });
const SCREENING_TOOL_ASSETS = [
  { source_path: `${TOOL_ROOT}/screening_common.py`, output_path: "tools/screening_common.py" },
  { source_path: `${TOOL_ROOT}/screening_config.py`, output_path: "tools/screening_config.py" },
  { source_path: `${TOOL_ROOT}/screening_import.py`, output_path: "tools/screening_import.py" },
  { source_path: `${TOOL_ROOT}/screening_tools.py`, output_path: "tools/screening_tools.py" },
  { source_path: `${TOOL_ROOT}/screening_export.py`, output_path: "tools/screening_export.py" },
];

export const SR_SCREENING_SOURCES: readonly CapabilityAuthoringSource[] = [
  {
    capability_id: "screening-protocol", title: "Screening Protocol",
    description: "Turns a review proposal into confirmed, stage-specific eligibility rules and a versioned screening configuration.",
    procedure_path: `${PROCEDURES}/screening-protocol.md`, class: "verification", node_kind: "producer", execution_type: "llm", gate_policy: "required", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-01",
    knowledge_sources: [
      { knowledge_id: "protocol-template", extraction_artifact_id: "KP-M1-SR-04", output_path: "knowledge/protocol_template.md" },
      { knowledge_id: "reviewer-roles", extraction_artifact_id: "KP-M1-SR-06", output_path: "knowledge/reviewer_roles.md" },
    ],
    inputs: [role("review_proposal", "review-proposal.v1", ["handoff", "node_output"])],
    outputs: [output("screening_protocol", "screening-protocol.v1"), output("screening_config", "screening-config.v1")],
  },
  {
    capability_id: "screening-quick", title: "Single Reviewer Screening Triage",
    description: "Applies confirmed eligibility criteria in one explicitly labeled triage pass.",
    procedure_path: `${PROCEDURES}/screening-quick.md`, class: "verification", node_kind: "producer", execution_type: "llm", gate_policy: "none", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-02",
    knowledge_sources: [
      { knowledge_id: "decision-rules", extraction_artifact_id: "KP-M1-SR-01", output_path: "knowledge/decision_rules.md" },
      { knowledge_id: "reviewer-roles", extraction_artifact_id: "KP-M1-SR-06", output_path: "knowledge/reviewer_roles.md" },
    ],
    inputs: [role("eligibility_criteria", "eligibility-criteria.v1"), role("screening_records", "screening-records.v1")],
    outputs: [output("triage_table", "triage-table.v1")],
  },
  {
    capability_id: "screening-review-ballot", title: "Independent Screening Review Ballot",
    description: "Applies one confirmed protocol independently to one seat and stage, preserving reviewer blindness.",
    procedure_path: `${PROCEDURES}/screening-review-ballot.md`, class: "verification", node_kind: "checker", execution_type: "llm", gate_policy: "none", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-02",
    knowledge_sources: [
      { knowledge_id: "decision-rules", extraction_artifact_id: "KP-M1-SR-01", output_path: "knowledge/decision_rules.md" },
      { knowledge_id: "reviewer-roles", extraction_artifact_id: "KP-M1-SR-06", output_path: "knowledge/reviewer_roles.md" },
      { knowledge_id: "instruction-data-boundary", extraction_artifact_id: "KP-M1-08", output_path: "knowledge/instruction-data-boundary.md" },
    ],
    inputs: [
      role("screening_protocol", "screening-protocol.v1", "node_output"), role("screening_config", "screening-config.v1", "node_output"),
      role("stage", "screening-stage.v1", "parameter"), role("reviewer_seat", "screening-reviewer-seat.v1", "parameter"),
      role("pilot_records", "screening-records.v1", "handoff", false), role("screening_records", "screening-records.v1", "handoff", false), role("full_text_materials", "full-text-materials.v1", "handoff", false),
    ],
    outputs: [output("review_ballot", "review-ballot.v1")],
  },
  {
    capability_id: "screening-pilot", title: "Screening Pilot Calibration",
    description: "Compares independent pilot ballots with human labels, checks seeds, and reports readiness evidence.",
    procedure_path: `${PROCEDURES}/screening-pilot.md`, class: "verification", node_kind: "producer", execution_type: "mixed", gate_policy: "required", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-03",
    knowledge_sources: [
      { knowledge_id: "quality-control", extraction_artifact_id: "KP-M1-SR-05", output_path: "knowledge/quality_control.md" },
      { knowledge_id: "reviewer-roles", extraction_artifact_id: "KP-M1-SR-06", output_path: "knowledge/reviewer_roles.md" },
    ],
    package_assets: SCREENING_TOOL_ASSETS,
    inputs: [
      role("screening_data_identity", "screening-data-identity.v1"),
      role("screening_protocol", "screening-protocol.v1", ["handoff", "node_output"]), role("screening_config", "screening-config.v1", ["handoff", "node_output"]),
      role("pilot_records", "screening-records.v1"), role("pilot_labels", "pilot-labels.v1"),
      role("ballot_a", "review-ballot.v1", "node_output"), role("ballot_b", "review-ballot.v1", "node_output"),
    ],
    outputs: [output("pilot_report", "pilot-report.v1")],
  },
  {
    capability_id: "screening-ta-screen", title: "Title and Abstract Screening",
    description: "Screens title and abstract records using two blinded ballots and emits merged decisions, conflicts, and blind QC candidates.",
    procedure_path: `${PROCEDURES}/screening-ta-screen.md`, class: "verification", node_kind: "producer", execution_type: "mixed", gate_policy: "required", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-02",
    knowledge_sources: [
      { knowledge_id: "decision-rules", extraction_artifact_id: "KP-M1-SR-01", output_path: "knowledge/decision_rules.md" },
      { knowledge_id: "reviewer-roles", extraction_artifact_id: "KP-M1-SR-06", output_path: "knowledge/reviewer_roles.md" },
      { knowledge_id: "instruction-data-boundary", extraction_artifact_id: "KP-M1-08", output_path: "knowledge/instruction-data-boundary.md" },
    ],
    package_assets: SCREENING_TOOL_ASSETS,
    inputs: [
      role("screening_data_identity", "screening-data-identity.v1"),
      role("screening_protocol", "screening-protocol.v1", "node_output"), role("screening_config", "screening-config.v1", "node_output"),
      role("screening_records", "screening-records.v1"), role("pilot_report", "pilot-report.v1", "node_output"), role("ballot_a", "review-ballot.v1", "node_output"), role("ballot_b", "review-ballot.v1", "node_output"),
    ],
    outputs: [output("screening_log", "screening-log.v1"), output("screening_conflicts", "screening-conflicts.v1"), output("excluded_records", "excluded-records.v1")],
  },
  {
    capability_id: "screening-ft-screen", title: "Full Text Screening",
    description: "Applies full-text-only criteria with source locations and emits decisions and conflicts.",
    procedure_path: `${PROCEDURES}/screening-ft-screen.md`, class: "verification", node_kind: "producer", execution_type: "mixed", gate_policy: "required", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-02",
    knowledge_sources: [
      { knowledge_id: "decision-rules", extraction_artifact_id: "KP-M1-SR-01", output_path: "knowledge/decision_rules.md" },
      { knowledge_id: "failure-paths", extraction_artifact_id: "KP-M1-SR-02", output_path: "knowledge/failure_paths.md" },
      { knowledge_id: "instruction-data-boundary", extraction_artifact_id: "KP-M1-08", output_path: "knowledge/instruction-data-boundary.md" },
    ],
    package_assets: SCREENING_TOOL_ASSETS,
    inputs: [
      role("screening_data_identity", "screening-data-identity.v1"), role("screening_protocol", "screening-protocol.v1", "node_output"), role("screening_config", "screening-config.v1", "node_output"),
      role("screening_log", "screening-log.v1", "node_output"), role("full_text_materials", "full-text-materials.v1"),
      role("ta_adjudication", "adjudication-advice.v1", ["handoff", "node_output"], false), role("exclusion_audit", "exclusion-audit.v1", ["handoff", "node_output"], false),
      role("human_confirmed_decisions", "screening-human-confirmations.v1", ["handoff", "node_output"], false),
      role("ballot_a", "review-ballot.v1", "node_output"), role("ballot_b", "review-ballot.v1", "node_output"),
    ],
    outputs: [output("full_text_decisions", "full-text-decisions.v1"), output("full_text_conflicts", "full-text-conflicts.v1")],
  },
  {
    capability_id: "screening-adjudicate", title: "Screening Conflict Adjudication",
    description: "Reviews recorded screening conflicts and returns advisory reasoning for a human decision.",
    procedure_path: `${PROCEDURES}/screening-adjudicate.md`, class: "verification", node_kind: "checker", execution_type: "llm", gate_policy: "none", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-02",
    knowledge_sources: [
      { knowledge_id: "decision-rules", extraction_artifact_id: "KP-M1-SR-01", output_path: "knowledge/decision_rules.md" },
      { knowledge_id: "reviewer-roles", extraction_artifact_id: "KP-M1-SR-06", output_path: "knowledge/reviewer_roles.md" },
    ],
    inputs: [
      role("screening_protocol", "screening-protocol.v1", ["handoff", "node_output"]), role("screening_config", "screening-config.v1", ["handoff", "node_output"]),
      role("screening_conflicts", "screening-conflicts.v1", ["handoff", "node_output"], false), role("full_text_conflicts", "full-text-conflicts.v1", ["handoff", "node_output"], false),
    ],
    outputs: [output("adjudication_advice", "adjudication-advice.v1")],
  },
  {
    capability_id: "screening-audit", title: "Screening Exclusion Audit",
    description: "Rechecks protocol-defined near misses and a reproducible sample of jointly excluded records.",
    procedure_path: `${PROCEDURES}/screening-audit.md`, class: "verification", node_kind: "checker", execution_type: "llm", gate_policy: "none", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-03",
    knowledge_sources: [
      { knowledge_id: "quality-control", extraction_artifact_id: "KP-M1-SR-05", output_path: "knowledge/quality_control.md" },
      { knowledge_id: "failure-paths", extraction_artifact_id: "KP-M1-SR-02", output_path: "knowledge/failure_paths.md" },
    ],
    inputs: [
      role("screening_protocol", "screening-protocol.v1", ["handoff", "node_output"]), role("screening_config", "screening-config.v1", ["handoff", "node_output"]),
      role("excluded_records", "excluded-records.v1", ["handoff", "node_output"]),
    ],
    outputs: [output("exclusion_audit", "exclusion-audit.v1")],
  },
  {
    capability_id: "screening-report", title: "PRISMA Screening Report",
    description: "Reconciles record-level decisions into traceable PRISMA counts and the eligible literature corpus.",
    procedure_path: `${PROCEDURES}/screening-report.md`, class: "verification", node_kind: "producer", execution_type: "mixed", gate_policy: "required", license: "CC BY-NC 4.0", extraction_artifact_id: "CAP-M1-SR-04",
    knowledge_sources: [
      { knowledge_id: "reporting-and-handoff", extraction_artifact_id: "KP-M1-SR-07", output_path: "knowledge/reporting_and_handoff.md" },
      { knowledge_id: "failure-paths", extraction_artifact_id: "KP-M1-SR-02", output_path: "knowledge/failure_paths.md" },
    ],
    package_assets: SCREENING_TOOL_ASSETS,
    inputs: [
      role("screening_data_identity", "screening-data-identity.v1"),
      role("screening_config", "screening-config.v1", ["handoff", "node_output"]), role("screening_log", "screening-log.v1", ["handoff", "node_output"]),
      role("full_text_decisions", "full-text-decisions.v1", ["handoff", "node_output"]),
      role("ta_adjudication", "adjudication-advice.v1", ["handoff", "node_output"], false), role("ft_adjudication", "adjudication-advice.v1", ["handoff", "node_output"], false),
      role("exclusion_audit", "exclusion-audit.v1", ["handoff", "node_output"], false), role("human_confirmed_decisions", "screening-human-confirmations.v1", ["handoff", "node_output"]),
    ],
    outputs: [output("prisma_counts", "prisma-counts.v1"), output("literature_corpus", "literature-corpus.v1")],
  },
];
