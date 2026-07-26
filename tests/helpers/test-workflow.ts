import type { RunState } from "../../src/core/contracts/run-state.js";
import type { WorkflowDefinition, WorkflowNodeTemplate } from "../../src/core/contracts/workflow.js";

const completion = {
  artifact_statuses: ["candidate", "accepted"], verification_states: ["verified"], required_gate_ids: [],
  require_registry: true as const, require_sha256: true as const, require_receipt: true,
};

function node(input: Omit<WorkflowNodeTemplate, "submission" | "completion">): WorkflowNodeTemplate {
  return { ...input, submission: { policy: "automatic" }, completion: { ...completion } };
}

export const TEST_WORKFLOW: WorkflowDefinition = {
  schema_version: "0.2", workflow_id: "test-research", workflow_kind: "test-research",
  subflow_templates: [{
    template_id: "tpl-research", template_kind: "standalone", route_ref: "deep-research:full", route_coverage: "partial", parent_policy: "none",
    entry_stage_id: "research", stages: [{ stage_id: "research", title: "Research" }], start_requires: { decision_types: [] },
    parallel_groups: [], subflow_nodes: [], subflow_parallel_groups: [],
    gates: [{ id: "research-completion", stage_id: "research", title: "Research evidence quality", gate_type: "evidence_quality", validator: { id: "researchspec-verify", evidence: { artifact_types: ["rq_brief", "bibliography", "synthesis_report"], contracts: ["specs/project.md", "specs/sources.yaml", "specs/claims.yaml"] } }, risk_level: "high", blocking: true, confirmation_required: true }],
    transitions: [{ id: "complete-research", from_stage_id: "research", effects: [{ kind: "complete_subflow" }], requires: { gate_ids: ["research-completion"], decision_types: [] }, branch: null }],
    work_items: [
      node({ id: "rq-brief", stage_id: "research", title: "RQ Brief", description: "Define the research question.", producer_skill: "deep-research", requires: { work_items: [], parallel_groups: [], contracts: ["specs/project.md", "specs/workflow.yaml", "runs/current/state.yaml"], artifact_types: [], gate_types: [], decision_types: [] }, output: { artifact_type: "rq_brief", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/rq-brief.md", template_ref: "ars:shared/handoff_schemas.md#schema-1-rq-brief" }, instruction: "Produce an RQ Brief.", rules: ["Preserve evidence."], allowed_writes: ["output_artifact", "contract_patch"], validation_profile: "text-artifact" }),
      node({ id: "bibliography", stage_id: "research", title: "Bibliography", description: "Build a bibliography.", producer_skill: "deep-research", requires: { work_items: ["rq-brief"], parallel_groups: [], contracts: ["specs/project.md", "specs/sources.yaml", "specs/workflow.yaml", "runs/current/state.yaml"], artifact_types: ["rq_brief"], gate_types: [], decision_types: [] }, output: { artifact_type: "bibliography", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/bibliography.md", template_ref: "ars:shared/handoff_schemas.md#schema-2-bibliography" }, instruction: "Produce a bibliography.", rules: ["Preserve sources."], allowed_writes: ["output_artifact", "contract_patch"], validation_profile: "text-artifact" }),
      node({ id: "synthesis", stage_id: "research", title: "Synthesis", description: "Build a synthesis.", producer_skill: "deep-research", requires: { work_items: ["bibliography"], parallel_groups: [], contracts: ["specs/project.md", "specs/sources.yaml", "specs/claims.yaml", "runs/current/state.yaml"], artifact_types: ["bibliography"], gate_types: [], decision_types: [] }, output: { artifact_type: "synthesis_report", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/synthesis-report.md", template_ref: "ars:shared/handoff_schemas.md#schema-3-synthesis-report" }, instruction: "Produce a synthesis.", rules: ["Preserve limits."], allowed_writes: ["output_artifact", "contract_patch"], validation_profile: "text-artifact" }),
    ],
  }],
};

export const TEST_RUN_STATE: RunState = {
  schema_version: "0.2", run_id: "current", workflow_id: "test-research", status: "not_started", started_at: null, updated_at: null,
  subflows: [], material_passport_imports: [], resume_candidate: null, pending_decisions: [], diagnostics: [],
};
