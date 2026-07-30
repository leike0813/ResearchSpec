import { ARSU_ROUTING_CATALOG, getArsuRoute } from "../routing/catalog.js";
import type { ArsuRouteDefinition, RouteRef } from "../routing/contracts.js";
import type {
  GateTemplateDefinition,
  WorkflowDefinition,
  ParallelGroupDefinition,
  SubflowTemplateDefinition,
  TransitionTemplateDefinition,
  WorkflowNodeTemplate,
} from "../../core/contracts/workflow.js";
import {
  AdaptiveCaseProfileSchema,
  SoftPlaybookSchema,
  StrictCaseProfileSchema,
  type AdaptiveCaseProfile,
  type SoftPlaybook,
  type StrictCaseProfile,
} from "../../core/contracts/case-profile.js";
import { getArsuArtifactContract } from "./artifact-contracts.js";

const COMPLETION = {
  artifact_statuses: ["candidate", "accepted"],
  verification_states: ["verified"],
  required_gate_ids: [],
  require_registry: true as const,
  require_sha256: true as const,
  require_receipt: true,
};

type GraphPlan = { dependencies?: Record<string, string[]>; parallel?: Array<{ id: string; members: string[]; next?: string[] }> };

const GRAPH_PLANS: Record<string, GraphPlan> = {
  "deep-research:full": { dependencies: { methodology_blueprint: ["rq_brief"], bibliography: ["rq_brief"], synthesis_report: ["methodology_blueprint", "bibliography"], research_report: ["synthesis_report"] }, parallel: [{ id: "research-foundations", members: ["methodology_blueprint", "bibliography"] }] },
  "deep-research:lit-review": { dependencies: { literature_matrix: ["bibliography", "source_corpus"], synthesis_report: ["literature_matrix"] }, parallel: [{ id: "literature-collection", members: ["bibliography", "source_corpus"] }] },
  "deep-research:systematic-review": { dependencies: { prisma_materials: ["systematic_review_protocol"], risk_of_bias_report: ["systematic_review_protocol"], meta_analysis_report: ["prisma_materials", "risk_of_bias_report"], research_report: ["meta_analysis_report"] }, parallel: [{ id: "systematic-assessment", members: ["prisma_materials", "risk_of_bias_report"] }] },
  "academic-paper:full": { dependencies: { paper_outline: ["paper_configuration"], evidence_map: ["paper_configuration"], argument_blueprint: ["paper_outline", "evidence_map"], paper_draft: ["argument_blueprint"], submission_package: ["paper_draft"] }, parallel: [{ id: "paper-foundations", members: ["paper_outline", "evidence_map"] }] },
  "academic-paper:lit-review": { dependencies: { literature_matrix: ["bibliography"], synthesis_report: ["literature_matrix"], literature_review_draft: ["synthesis_report"] } },
  "academic-paper:revision": { dependencies: { revised_draft: [], apply_report: ["revised_draft"], response_to_reviewers: ["apply_report"] } },
  "academic-paper-reviewer:full": { dependencies: { editorial_decision: ["review_report"], revision_roadmap: ["editorial_decision"] } },
  "academic-paper-reviewer:re-review": { dependencies: { rr_traceability_matrix: ["verification_review_report"], revision_roadmap: ["rr_traceability_matrix"] } },
};

function slug(value: string): string { return value.replaceAll(":", "-").replaceAll("_", "-"); }
function templateId(routeRef: string): string { return `tpl-${slug(routeRef)}`; }
function workId(artifactType: string): string { return slug(artifactType); }
function skillId(routeRef: string): string { return routeRef.split(":", 1)[0] ?? ""; }
function obligationId(routeRef: string, artifactType: string): string { return `${slug(routeRef)}--${workId(artifactType)}`; }
function completionCriterionId(routeRef: string): string { return `${slug(routeRef)}--complete`; }
function runtimeArtifactTypes(route: ArsuRouteDefinition): string[] {
  return route.route_ref === "academic-paper:revision"
    ? route.primary_artifact_types.filter((artifactType) =>
      artifactType !== "revision_patch" && artifactType !== "annotation_resolution_report")
    : route.primary_artifact_types;
}

function routeContracts(route: ArsuRouteDefinition): string[] {
  return [...new Set([...route.prerequisite_groups.flatMap((group) => group.requirements.filter((item) => item.kind === "contract").map((item) => item.id)), "specs/workflow.yaml", "runs/current/state.yaml"])];
}

function workItems(route: ArsuRouteDefinition): WorkflowNodeTemplate[] {
  const plan = GRAPH_PLANS[route.route_ref] ?? {};
  const artifactTypes = runtimeArtifactTypes(route);
  return artifactTypes.map((artifactType, index) => {
    const contract = getArsuArtifactContract(artifactType);
    const explicit = plan.dependencies?.[artifactType];
    const dependencies = explicit ?? artifactTypes.slice(Math.max(0, index - 1), index);
    return {
      id: workId(artifactType), stage_id: "work", title: contract.title,
      description: `Produce the ${contract.title} required by ${route.route_ref}.`, producer_skill: skillId(route.route_ref), producer_route_ref: route.route_ref as RouteRef,
      instruction: `Follow the controlled ARSU artifact contract for ${artifactType} and preserve all declared ResearchSpec dependencies.`,
      rules: ["Write only the declared candidate artifact or a proposed patch.", "Do not mutate runtime ledgers or stable contracts directly."],
      allowed_writes: ["output_artifact", "contract_patch"], validation_profile: contract.validation_profile,
      requires: {
        work_items: dependencies.map(workId), parallel_groups: [], contracts: routeContracts(route),
        artifact_types: dependencies, gate_types: [], decision_types: [],
      },
      output: { artifact_type: artifactType, workspace_path_template: `runs/current/subflows/{subflow_instance_id}/artifacts/${workId(artifactType)}${contract.extension}`, template_ref: `arsu-artifact:${artifactType}` },
      submission: { policy: "automatic" }, completion: { ...COMPLETION },
    };
  });
}

function parallelGroups(route: ArsuRouteDefinition): ParallelGroupDefinition[] {
  return (GRAPH_PLANS[route.route_ref]?.parallel ?? []).map((group) => ({
    id: group.id, members: group.members.map((artifactType) => ({ work_item_id: workId(artifactType), required: true })),
    max_concurrency: group.members.length, join: { policy: "all" },
  }));
}

function formalGates(route: ArsuRouteDefinition): GateTemplateDefinition[] {
  if (route.gate_policy.level !== "required") return [];
  return route.gate_policy.gate_kinds.map((kind) => ({
    id: `gate-${slug(kind)}`, stage_id: "work", title: `${route.title}: ${kind}`, gate_type: kind,
    validator: { id: "researchspec-verify", evidence: { artifact_types: runtimeArtifactTypes(route), contracts: routeContracts(route).filter((item) => item.startsWith("specs/")) } },
    risk_level: route.risk_level, blocking: true, confirmation_required: true,
  }));
}

function completeTransition(route: ArsuRouteDefinition, gates: GateTemplateDefinition[]): TransitionTemplateDefinition {
  return { id: "complete", from_stage_id: "work", effects: [{ kind: "complete_subflow" }], requires: { gate_ids: gates.map((gate) => gate.id), decision_types: [] }, branch: null };
}

function externalTemplate(route: ArsuRouteDefinition): SubflowTemplateDefinition {
  const gates = formalGates(route);
  return {
    template_id: templateId(route.route_ref), template_kind: route.route_kind === "entry" ? "pipeline" : "standalone", visibility: "external",
    route_ref: route.route_ref, route_coverage: "complete", parent_policy: route.route_kind === "entry" ? "none" : "optional",
    entry_stage_id: "work", stages: [{ stage_id: "work", title: route.title }], start_requires: { decision_types: [] },
    work_items: workItems(route), parallel_groups: parallelGroups(route), subflow_nodes: [], subflow_parallel_groups: [], gates,
    advisory_gate_kinds: route.gate_policy.level === "conditional" ? route.gate_policy.gate_kinds : [], transitions: [completeTransition(route, gates)],
  };
}

function pipelineWork(id: string, stageId: string, artifactType: string): WorkflowNodeTemplate {
  const contract = getArsuArtifactContract(artifactType);
  return {
    id, stage_id: stageId, title: contract.title, description: `Produce ${contract.title} for the pipeline control plane.`,
    producer_skill: "academic-pipeline", producer_route_ref: "academic-pipeline:end-to-end", instruction: `Produce ${artifactType} from the current trusted pipeline evidence.`,
    rules: ["Do not bypass formal Gates or Decisions.", "Do not edit runtime ledgers directly."], allowed_writes: ["output_artifact"], validation_profile: contract.validation_profile,
    requires: { work_items: [], parallel_groups: [], contracts: ["specs/workflow.yaml", "runs/current/state.yaml"], artifact_types: [], gate_types: [], decision_types: [] },
    output: { artifact_type: artifactType, workspace_path_template: `runs/current/subflows/{subflow_instance_id}/artifacts/${workId(artifactType)}${contract.extension}`, template_ref: `arsu-artifact:${artifactType}` },
    submission: { policy: "automatic" }, completion: { ...COMPLETION },
  };
}

function pipelineGates(): GateTemplateDefinition[] {
  return [
    { id: "pre-review-integrity", stage_id: "pre-review", title: "Pre-review integrity", gate_type: "integrity", validator: { id: "researchspec-verify", evidence: { artifact_types: ["integrity_report", "paper_draft"], contracts: ["specs/project.md", "specs/manuscript.yaml"] } }, risk_level: "high", blocking: true, confirmation_required: true },
    { id: "review-confirmation", stage_id: "review", title: "Review quality and editorial outcome", gate_type: "review", validator: { id: "researchspec-verify", evidence: { artifact_types: ["review_report", "editorial_decision"], contracts: ["specs/project.md", "specs/manuscript.yaml"] } }, risk_level: "high", blocking: true, confirmation_required: true },
    { id: "final-integrity", stage_id: "final-integrity", title: "Final integrity", gate_type: "final_integrity", validator: { id: "researchspec-verify", evidence: { artifact_types: ["final_integrity_report", "paper_draft"], contracts: ["specs/project.md", "specs/manuscript.yaml"] } }, risk_level: "high", blocking: true, confirmation_required: true },
  ];
}

function pipelineTransitions(includeEntry: boolean): TransitionTemplateDefinition[] {
  const transitions: TransitionTemplateDefinition[] = [
    { id: "research-to-write", from_stage_id: "research", effects: [{ kind: "activate_stage", stage_id: "write" }], requires: { gate_ids: [], decision_types: [] }, branch: null },
    { id: "write-to-pre-review", from_stage_id: "write", effects: [{ kind: "activate_stage", stage_id: "pre-review" }], requires: { gate_ids: [], decision_types: [] }, branch: null },
    { id: "pre-review-to-review", from_stage_id: "pre-review", effects: [{ kind: "activate_stage", stage_id: "review" }], requires: { gate_ids: ["pre-review-integrity"], decision_types: [] }, branch: null },
    { id: "accept-review", from_stage_id: "review", effects: [{ kind: "activate_stage", stage_id: "final-integrity" }], requires: { gate_ids: ["review-confirmation"], decision_types: ["workflow_branch"] }, branch: { decision_point_id: "editorial-outcome", option_id: "accepted" } },
    { id: "revise-review", from_stage_id: "review", effects: [{ kind: "activate_stage", stage_id: "revision" }], requires: { gate_ids: ["review-confirmation"], decision_types: ["workflow_branch"] }, branch: { decision_point_id: "editorial-outcome", option_id: "revision" } },
    { id: "rounds-to-final", from_stage_id: "revision", effects: [{ kind: "activate_stage", stage_id: "final-integrity" }], requires: { gate_ids: [], decision_types: [] }, branch: null },
    { id: "final-integrity-to-finalize", from_stage_id: "final-integrity", effects: [{ kind: "activate_stage", stage_id: "finalize" }], requires: { gate_ids: ["final-integrity"], decision_types: [] }, branch: null },
    { id: "finalize-to-summary", from_stage_id: "finalize", effects: [{ kind: "activate_stage", stage_id: "summary" }], requires: { gate_ids: [], decision_types: [] }, branch: null },
    { id: "complete-pipeline", from_stage_id: "summary", effects: [{ kind: "complete_subflow" }, { kind: "complete_run" }], requires: { gate_ids: [], decision_types: [] }, branch: null },
  ];
  if (includeEntry) transitions.unshift(
    { id: "enter-research", from_stage_id: "entry", effects: [{ kind: "activate_stage", stage_id: "research" }], requires: { gate_ids: [], decision_types: ["workflow_branch"], artifact_types: [] }, branch: { decision_point_id: "pipeline-entry", option_id: "research" } },
    { id: "enter-write", from_stage_id: "entry", effects: [{ kind: "activate_stage", stage_id: "write" }], requires: { gate_ids: [], decision_types: ["workflow_branch"], artifact_types: ["synthesis_report"] }, branch: { decision_point_id: "pipeline-entry", option_id: "write" } },
    { id: "enter-pre-review", from_stage_id: "entry", effects: [{ kind: "activate_stage", stage_id: "pre-review" }], requires: { gate_ids: [], decision_types: ["workflow_branch"], artifact_types: ["paper_draft"] }, branch: { decision_point_id: "pipeline-entry", option_id: "pre-review" } },
    { id: "enter-revision", from_stage_id: "entry", effects: [{ kind: "activate_stage", stage_id: "revision" }], requires: { gate_ids: [], decision_types: ["workflow_branch"], artifact_types: ["review_report"] }, branch: { decision_point_id: "pipeline-entry", option_id: "revision" } },
    { id: "enter-annotated-revision", from_stage_id: "entry", effects: [{ kind: "activate_stage", stage_id: "revision" }], requires: { gate_ids: [], decision_types: ["workflow_branch"], artifact_types: ["paper_draft", "annotation_set"] }, branch: { decision_point_id: "pipeline-entry", option_id: "annotated-revision" } },
  );
  return transitions;
}

function pipelineTemplate(routeRef: "academic-pipeline:end-to-end" | "academic-pipeline:mid-entry"): SubflowTemplateDefinition {
  const includeEntry = routeRef.endsWith("mid-entry");
  return {
    template_id: templateId(routeRef), template_kind: "pipeline", visibility: "external", route_ref: routeRef, route_coverage: "complete", parent_policy: "none",
    entry_stage_id: includeEntry ? "entry" : "research",
    stages: [
      ...(includeEntry ? [{ stage_id: "entry", title: "Select pipeline entry" }] : []),
      { stage_id: "research", title: "Research" }, { stage_id: "write", title: "Writing" }, { stage_id: "pre-review", title: "Pre-review integrity" },
      { stage_id: "review", title: "Review" }, { stage_id: "revision", title: "Revision rounds" }, { stage_id: "final-integrity", title: "Final integrity" },
      { stage_id: "finalize", title: "Finalization" }, { stage_id: "summary", title: "Process summary" },
    ],
    start_requires: { decision_types: [] },
    work_items: [pipelineWork("pre-review-integrity-report", "pre-review", "integrity_report"), pipelineWork("final-integrity-report", "final-integrity", "final_integrity_report"), pipelineWork("process-summary", "summary", "process_summary")],
    parallel_groups: [],
    subflow_nodes: [
      { id: "research", stage_id: "research", template_id: templateId("deep-research:full"), depends_on: [], multiplicity: "once", completion: "child_complete" },
      { id: "write", stage_id: "write", template_id: templateId("academic-paper:full"), depends_on: [], multiplicity: "once", completion: "child_complete" },
      { id: "review", stage_id: "review", template_id: templateId("academic-paper-reviewer:full"), depends_on: [], multiplicity: "once", completion: "child_complete" },
      { id: "revision-round", stage_id: "revision", template_id: "tpl-pipeline-revision-round", depends_on: [], multiplicity: "next_round", completion: "child_complete" },
      { id: "format", stage_id: "finalize", template_id: templateId("academic-paper:format-convert"), depends_on: [], multiplicity: "once", completion: "child_complete" },
    ],
    subflow_parallel_groups: [], gates: pipelineGates(), advisory_gate_kinds: [], transitions: pipelineTransitions(includeEntry),
  };
}

function roundTemplate(): SubflowTemplateDefinition {
  return {
    template_id: "tpl-pipeline-revision-round", template_kind: "round", visibility: "internal", route_ref: null, route_coverage: "complete", parent_policy: "required",
    entry_stage_id: "revise", stages: [{ stage_id: "revise", title: "Revise manuscript" }, { stage_id: "re-review", title: "Re-review" }], start_requires: { decision_types: [] },
    work_items: [], parallel_groups: [],
    subflow_nodes: [
      { id: "revision", stage_id: "revise", template_id: templateId("academic-paper:revision"), depends_on: [], multiplicity: "once", completion: "child_complete" },
      { id: "re-review", stage_id: "re-review", template_id: templateId("academic-paper-reviewer:re-review"), depends_on: [], multiplicity: "once", completion: "child_complete" },
    ],
    subflow_parallel_groups: [], gates: [], advisory_gate_kinds: [],
    transitions: [
      { id: "revision-to-re-review", from_stage_id: "revise", effects: [{ kind: "activate_stage", stage_id: "re-review" }], requires: { gate_ids: [], decision_types: [] }, branch: null },
      { id: "accept-round", from_stage_id: "re-review", effects: [{ kind: "complete_subflow" }], requires: { gate_ids: [], decision_types: ["workflow_branch"] }, branch: { decision_point_id: "revision-outcome", option_id: "accepted" } },
      { id: "revise-round", from_stage_id: "re-review", effects: [{ kind: "complete_subflow" }], requires: { gate_ids: [], decision_types: ["workflow_branch"] }, branch: { decision_point_id: "revision-outcome", option_id: "revision" } },
    ],
  };
}

const operationalRoutes = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes).filter((route) => route.route_kind === "mode");

export const ARSU_V0_1_WORKFLOW: WorkflowDefinition = {
  schema_version: "0.2", workflow_id: "arsu-v0-1", workflow_kind: "arsu-v0-1",
  subflow_templates: [
    ...operationalRoutes.map(externalTemplate),
    pipelineTemplate("academic-pipeline:end-to-end"),
    pipelineTemplate("academic-pipeline:mid-entry"),
    roundTemplate(),
  ],
};

const externalRoutes = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes);

function adaptiveObligations() {
  return externalRoutes.flatMap((route) => {
    const hardDependencies = GRAPH_PLANS[route.route_ref]?.dependencies ?? {};
    return runtimeArtifactTypes(route).map((artifactType) => {
      const contract = getArsuArtifactContract(artifactType);
      return {
        obligation_id: obligationId(route.route_ref, artifactType),
        title: `${route.title}: ${contract.title}`,
        policy_justification: `${artifactType} is a durable output declared by ${route.route_ref}.`,
        dependencies: (hardDependencies[artifactType] ?? []).map((dependency) => ({
          obligation_id: obligationId(route.route_ref, dependency),
          justification: `${artifactType} consumes accepted ${dependency} evidence in ${route.route_ref}.`,
        })),
        required_evidence_types: [artifactType],
        outputs: [{
          artifact_type: artifactType,
          path_template: `runs/current/subflows/{subflow_instance_id}/artifacts/${workId(artifactType)}${contract.extension}`,
          validation_profile: contract.validation_profile,
          required: true,
        }],
        formal_gate_ids: route.gate_policy.level === "required" || route.gate_policy.level === "profile_defined"
          ? route.gate_policy.gate_kinds.map((kind) => `gate-${slug(kind)}`)
          : [],
        formal_decision_types: [],
        resolution_policy: {
          waive: "decision_required" as const,
          not_applicable: "decision_required" as const,
        },
      };
    });
  });
}

function adaptiveRoutes() {
  return externalRoutes.map((route) => ({
    template_id: templateId(route.route_ref),
    route_ref: route.route_ref,
    route_kind: route.route_kind,
    title: route.title,
    obligation_ids: runtimeArtifactTypes(route).map((artifactType) => obligationId(route.route_ref, artifactType)),
    completion_criterion_ids: [completionCriterionId(route.route_ref)],
  }));
}

function adaptiveCompletionCriteria() {
  return externalRoutes.map((route) => ({
    criterion_id: completionCriterionId(route.route_ref),
    obligation_ids: runtimeArtifactTypes(route).map((artifactType) => obligationId(route.route_ref, artifactType)),
    effects: route.route_kind === "entry"
      ? [{ kind: "complete_subflow" as const }, { kind: "complete_run" as const }]
      : [{ kind: "complete_subflow" as const }],
  }));
}

export const ARSU_ADAPTIVE_PLAYBOOK: SoftPlaybook = SoftPlaybookSchema.parse({
  schema_version: "1",
  playbook_id: "arsu-adaptive-default",
  profile_id: "arsu-adaptive",
  recommended_steps: externalRoutes.flatMap((route) => [
    {
      action_selector: `subflow:${templateId(route.route_ref)}`,
      rationale: `Start ${route.route_ref} only after its route summary is confirmed.`,
    },
    ...runtimeArtifactTypes(route).map((artifactType) => ({
      action_selector: `obligation:{subflow_instance_id}/${obligationId(route.route_ref, artifactType)}`,
      rationale: `The default ARSU playbook recommends ${artifactType} at this point; declared hard dependencies remain authoritative.`,
    })),
  ]),
});

export function createArsuAdaptiveProfile(playbookSha256: string): AdaptiveCaseProfile {
  return AdaptiveCaseProfileSchema.parse({
    schema_version: "1",
    profile_id: "arsu-adaptive",
    mode: "adaptive",
    routes: adaptiveRoutes(),
    obligations: adaptiveObligations(),
    completion_criteria: adaptiveCompletionCriteria(),
    playbook_ref: { path: "playbooks/arsu-adaptive.yaml", sha256: playbookSha256 },
  });
}

export function createArsuStrictCaseProfile(workflowSha256: string, playbookSha256: string | null = null): StrictCaseProfile {
  return StrictCaseProfileSchema.parse({
    schema_version: "1",
    profile_id: "arsu-strict",
    mode: "strict",
    routes: adaptiveRoutes(),
    obligations: adaptiveObligations(),
    completion_criteria: adaptiveCompletionCriteria(),
    playbook_ref: playbookSha256 ? { path: "playbooks/arsu-adaptive.yaml", sha256: playbookSha256 } : null,
    workflow_graph_ref: {
      schema_version: "0.2",
      workflow_id: ARSU_V0_1_WORKFLOW.workflow_id,
      path: "specs/workflow.yaml",
      sha256: workflowSha256,
    },
  });
}

export function validateArsuWorkflowCatalog(workflow: WorkflowDefinition = ARSU_V0_1_WORKFLOW): string[] {
  const issues: string[] = [];
  const catalogRoutes = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes);
  const external = workflow.subflow_templates.filter((template) => template.visibility !== "internal");
  for (const route of catalogRoutes) {
    const matches = external.filter((template) => template.route_ref === route.route_ref && template.route_coverage === "complete");
    if (matches.length !== 1) issues.push(`route_coverage:${route.route_ref}:${String(matches.length)}`);
    const template = matches[0];
    if (!template) continue;
    const produced = recursivelyProducedArtifacts(workflow, template.template_id, new Set());
    for (const artifactType of runtimeArtifactTypes(route)) if (!produced.has(artifactType)) issues.push(`primary_artifact_missing:${route.route_ref}:${artifactType}`);
    for (const item of template.work_items) {
      if (item.producer_route_ref) {
        const producerRoute = getArsuRoute(item.producer_route_ref as RouteRef);
        if (skillId(producerRoute.route_ref) !== item.producer_skill) issues.push(`producer_owner_mismatch:${template.template_id}:${item.id}`);
      }
      try { getArsuArtifactContract(item.output.artifact_type); } catch { issues.push(`artifact_contract_missing:${item.output.artifact_type}`); }
    }
    if (route.gate_policy.level === "required" || route.gate_policy.level === "profile_defined") for (const kind of route.gate_policy.gate_kinds) if (!template.gates.some((gate) => gate.gate_type === kind && gate.blocking)) issues.push(`required_gate_missing:${route.route_ref}:${kind}`);
    if (route.gate_policy.level === "conditional") for (const kind of route.gate_policy.gate_kinds) if (!(template.advisory_gate_kinds ?? []).includes(kind)) issues.push(`conditional_gate_unaccounted:${route.route_ref}:${kind}`);
  }
  for (const template of external) if (!template.route_ref || !catalogRoutes.some((route) => route.route_ref === template.route_ref)) issues.push(`unknown_external_route:${template.template_id}`);
  const adaptive = createArsuAdaptiveProfile("0".repeat(64));
  for (const route of catalogRoutes) {
    if (adaptive.routes.filter((item) => item.route_ref === route.route_ref).length !== 1) issues.push(`adaptive_route_coverage:${route.route_ref}`);
  }
  return issues;
}

function recursivelyProducedArtifacts(workflow: WorkflowDefinition, templateIdValue: string, visiting: Set<string>): Set<string> {
  if (visiting.has(templateIdValue)) return new Set();
  visiting.add(templateIdValue);
  const template = workflow.subflow_templates.find((item) => item.template_id === templateIdValue);
  const result = new Set(template?.work_items.map((item) => item.output.artifact_type) ?? []);
  for (const child of template?.subflow_nodes ?? []) for (const artifactType of recursivelyProducedArtifacts(workflow, child.template_id, visiting)) result.add(artifactType);
  visiting.delete(templateIdValue);
  return result;
}

const catalogIssues = validateArsuWorkflowCatalog();
if (catalogIssues.length > 0) throw new Error(`Invalid ARSU workflow catalog:\n${catalogIssues.join("\n")}`);
