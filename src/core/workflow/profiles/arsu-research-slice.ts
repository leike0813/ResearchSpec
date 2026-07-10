import type { InstanceRunState } from "../../contracts/run-state.js";
import type { InstanceWorkflowDefinition, WorkflowNodeTemplate } from "../../contracts/workflow.js";

const commonCompletion = {
  artifact_statuses: ["candidate", "accepted"],
  verification_states: ["verified"],
  required_gate_ids: [],
  require_registry: true as const,
  require_sha256: true as const,
  require_receipt: true,
};

function node(input: Omit<WorkflowNodeTemplate, "submission" | "completion">): WorkflowNodeTemplate {
  return { ...input, submission: { policy: "automatic" }, completion: { ...commonCompletion } };
}

export const ARSU_RESEARCH_SLICE_WORKFLOW = {
  schema_version: "0.2",
  workflow_id: "arsu-research-slice",
  workflow_kind: "arsu-research-slice",
  subflow_templates: [{
    template_id: "tpl-research",
    template_kind: "standalone",
    route_ref: "deep-research:full",
    route_coverage: "partial",
    parent_policy: "none",
    entry_stage_id: "research",
    stages: [{ stage_id: "research", title: "Research slice" }],
    start_requires: { decision_types: [] },
    parallel_groups: [],
    gates: [{
      id: "research-completion", stage_id: "research", title: "Research evidence quality", gate_type: "evidence_quality",
      validator: { id: "researchspec-verify", evidence: { artifact_types: ["rq_brief", "bibliography", "synthesis_report"], contracts: ["specs/project.md", "specs/sources.yaml", "specs/claims.yaml"] } },
      risk_level: "high", blocking: true, confirmation_required: true,
    }],
    transitions: [{
      id: "complete-research", from_stage_id: "research", effect: { kind: "complete_subflow" },
      requires: { gate_ids: ["research-completion"], decision_types: [] }, branch: null,
    }],
    work_items: [
      node({
        id: "rq-brief", stage_id: "research", title: "RQ Brief", description: "Define the research question, scope, and methodological framing.", producer_skill: "deep-research",
        requires: { work_items: [], parallel_groups: [], contracts: ["specs/project.md", "specs/workflow.yaml", "runs/current/state.yaml"], artifact_types: [], gate_types: [], decision_types: [] },
        output: { artifact_type: "rq_brief", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/rq-brief.md", template_ref: "ars:shared/handoff_schemas.md#schema-1-rq-brief" },
        instruction: "Produce an RQ Brief grounded in the project contract. Propose, rather than directly apply, stable project-contract changes.",
        rules: ["Keep the full semantic payload in the artifact.", "Do not edit stable specs or runtime files directly."], allowed_writes: ["output_artifact", "contract_patch"], validation_profile: "research-artifact",
      }),
      node({
        id: "bibliography", stage_id: "research", title: "Bibliography", description: "Build a traceable annotated bibliography and documented search strategy.", producer_skill: "deep-research",
        requires: { work_items: ["rq-brief"], parallel_groups: [], contracts: ["specs/project.md", "specs/sources.yaml", "specs/workflow.yaml", "runs/current/state.yaml"], artifact_types: ["rq_brief"], gate_types: [], decision_types: [] },
        output: { artifact_type: "bibliography", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/bibliography.md", template_ref: "ars:shared/handoff_schemas.md#schema-2-bibliography" },
        instruction: "Produce an annotated bibliography whose sources and search strategy are reproducible and consistent with the RQ Brief.",
        rules: ["Preserve source identifiers for downstream synthesis.", "Propose source-contract changes instead of editing sources.yaml directly."], allowed_writes: ["output_artifact", "contract_patch"], validation_profile: "research-artifact",
      }),
      node({
        id: "synthesis", stage_id: "research", title: "Synthesis Report", description: "Integrate the bibliography into themes, debates, gaps, and bounded findings.", producer_skill: "deep-research",
        requires: { work_items: ["bibliography"], parallel_groups: [], contracts: ["specs/project.md", "specs/sources.yaml", "specs/claims.yaml", "runs/current/state.yaml"], artifact_types: ["bibliography"], gate_types: [], decision_types: [] },
        output: { artifact_type: "synthesis_report", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/synthesis-report.md", template_ref: "ars:shared/handoff_schemas.md#schema-3-synthesis-report" },
        instruction: "Produce a source-traceable synthesis that distinguishes findings, contradictions, limitations, and research gaps.",
        rules: ["Do not strengthen claims beyond the bibliography evidence.", "Propose claim-contract changes instead of editing claims.yaml directly."], allowed_writes: ["output_artifact", "contract_patch"], validation_profile: "research-artifact",
      }),
    ],
  }],
} satisfies InstanceWorkflowDefinition;

export const ARSU_RESEARCH_SLICE_STATE = {
  schema_version: "0.2",
  run_id: "current",
  workflow_id: "arsu-research-slice",
  status: "not_started",
  active_stage_id: null,
  started_at: null,
  updated_at: null,
  subflows: [],
  pending_decisions: [],
  diagnostics: [],
} satisfies InstanceRunState;
