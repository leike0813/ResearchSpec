import {
  ArsuRoutingCatalogSchema,
  type ArsuRouteDefinition,
  type ArsuRoutingCatalog,
  type ArsuSkillId,
  type ArsuSkillRouteDefinition,
  type PrerequisiteGroup,
  type PrerequisiteRequirement,
  type RouteRef,
  validateRoutingCatalogReferences,
} from "./contracts.js";

const contract = (id: string): PrerequisiteRequirement => ({ kind: "contract", id });
const artifact = (id: string): PrerequisiteRequirement => ({ kind: "artifact", id });
const userInput = (id: string): PrerequisiteRequirement => ({ kind: "user_input", id });
const group = (
  operator: PrerequisiteGroup["operator"],
  requirements: PrerequisiteRequirement[],
  fallbackRouteRefs: RouteRef[] = [],
): PrerequisiteGroup => ({ operator, requirements, fallback_route_refs: fallbackRouteRefs });
const none = { level: "none" as const, gate_kinds: [] };
const gate = (level: "conditional" | "required" | "profile_defined", ...gateKinds: string[]) => ({ level, gate_kinds: gateKinds });
const cost = (effort: "low" | "medium" | "high" | "variable", interaction: "single_pass" | "iterative" | "long_horizon") => ({ effort, interaction });

type ModeRouteInput = Omit<ArsuRouteDefinition, "route_kind" | "mode_id"> & { route_ref: RouteRef };
const mode = (input: ModeRouteInput): ArsuRouteDefinition => ({
  ...input,
  route_kind: "mode",
  mode_id: input.route_ref.split(":", 2)[1] ?? "",
});
const entry = (input: ModeRouteInput): ArsuRouteDefinition => ({ ...input, route_kind: "entry", mode_id: null });

const project = group("all_of", [contract("specs/project.md")]);
const manuscript = group("all_of", [contract("specs/manuscript.yaml")]);
const workflow = group("all_of", [contract("specs/workflow.yaml")]);
const researchGoal = group("all_of", [userInput("research_goal")]);
const researchMaterials = (fallback: RouteRef): PrerequisiteGroup => group("any_of", [
  userInput("research_materials"), artifact("rq_brief"), artifact("bibliography"),
  artifact("source_corpus"), artifact("synthesis_report"),
], [fallback]);
const paperDraft = (fallback: RouteRef = "academic-paper:full"): PrerequisiteGroup => group("any_of", [
  userInput("manuscript"), artifact("paper_draft"), artifact("verified_draft"), artifact("revised_draft"),
], [fallback]);
const reviewFeedback = group("any_of", [
  userInput("reviewer_comments"), artifact("review_report"), artifact("revision_roadmap"), artifact("annotation_set"),
], ["academic-paper:revision-coach"]);

const rawCatalog = {
  schema_version: "1",
  catalog_id: "arsu-routing-v0.1",
  skills: [
    {
      skill_id: "deep-research",
      title: "Deep Research",
      summary: "Research questions, evidence discovery, literature synthesis, fact-checking, and research reports.",
      intents: ["investigate a research question", "synthesize scholarly evidence", "verify claims", "design a systematic review"],
      default_route_ref: "deep-research:full",
      near_misses: [
        { intent: "write a literature-review section for a manuscript", route_ref: "academic-paper:lit-review", reason: "The deliverable is manuscript prose rather than an evidence synthesis artifact." },
        { intent: "peer-review an academic manuscript", route_ref: "academic-paper-reviewer:full", reason: "Manuscript peer review belongs to the reviewer Skill, not research-text review." },
        { intent: "complete research-to-publication workflow", route_ref: "academic-pipeline:end-to-end", reason: "A cross-stage deliverable needs the pipeline rather than a standalone research route." },
      ],
      routes: [
        mode({ route_ref: "deep-research:full", title: "Full research", intents: ["complete evidence-grounded research report"], primary_artifact_types: ["rq_brief", "methodology_blueprint", "bibliography", "synthesis_report", "research_report"], prerequisite_groups: [project, researchGoal], risk_level: "high", gate_policy: gate("required", "evidence_quality"), cost: cost("high", "long_horizon") }),
        mode({ route_ref: "deep-research:quick", title: "Quick research brief", intents: ["short research brief with key sources"], primary_artifact_types: ["research_brief", "bibliography"], prerequisite_groups: [project, researchGoal], risk_level: "low", gate_policy: none, cost: cost("low", "single_pass") }),
        mode({ route_ref: "deep-research:review", title: "Research text review", intents: ["review an existing research text or report"], primary_artifact_types: ["research_review_report"], prerequisite_groups: [project, group("any_of", [userInput("research_text"), artifact("research_report")])], risk_level: "medium", gate_policy: gate("conditional", "evidence_quality"), cost: cost("medium", "single_pass") }),
        mode({ route_ref: "deep-research:lit-review", title: "Evidence literature review", intents: ["search and synthesize literature on a topic"], primary_artifact_types: ["bibliography", "source_corpus", "literature_matrix", "synthesis_report"], prerequisite_groups: [project, researchGoal], risk_level: "high", gate_policy: gate("required", "evidence_quality"), cost: cost("medium", "iterative") }),
        mode({ route_ref: "deep-research:three-way-scan", title: "WHY/HOW/WHAT scan", intents: ["rapidly compare a focused paper shortlist"], primary_artifact_types: ["comparison_matrix", "reading_shortlist"], prerequisite_groups: [project, researchGoal], risk_level: "low", gate_policy: none, cost: cost("low", "single_pass") }),
        mode({ route_ref: "deep-research:fact-check", title: "Claim fact-check", intents: ["verify specific factual or scholarly claims"], primary_artifact_types: ["fact_check_report"], prerequisite_groups: [project, group("any_of", [userInput("claims"), artifact("synthesis_report")])], risk_level: "high", gate_policy: gate("conditional", "claim_verification"), cost: cost("low", "single_pass") }),
        mode({ route_ref: "deep-research:socratic", title: "Socratic research planning", intents: ["clarify a vague research idea through guided dialogue"], primary_artifact_types: ["rq_brief", "research_plan_summary"], prerequisite_groups: [project, researchGoal], risk_level: "medium", gate_policy: none, cost: cost("variable", "iterative") }),
        mode({ route_ref: "deep-research:systematic-review", title: "Systematic review", intents: ["conduct a PRISMA systematic review or meta-analysis"], primary_artifact_types: ["systematic_review_protocol", "prisma_materials", "risk_of_bias_report", "meta_analysis_report", "research_report"], prerequisite_groups: [project, group("any_of", [userInput("review_question"), artifact("rq_brief")], ["deep-research:socratic"])], risk_level: "high", gate_policy: gate("required", "methodology_compliance", "evidence_quality"), cost: cost("high", "long_horizon") }),
      ],
    },
    {
      skill_id: "academic-paper",
      title: "Academic Paper",
      summary: "Academic manuscript planning, drafting, revision, citation work, disclosure, and format conversion.",
      intents: ["plan or draft an academic paper", "revise a manuscript", "prepare citation or submission outputs", "respond to reviewer feedback"],
      default_route_ref: "academic-paper:full",
      near_misses: [
        { intent: "start from a topic and continue through review and finalization", route_ref: "academic-pipeline:end-to-end", reason: "From-scratch cross-stage work needs pipeline coordination and Gates." },
        { intent: "conduct a PRISMA systematic review", route_ref: "deep-research:systematic-review", reason: "Systematic-review methodology is research work, not manuscript literature-section drafting." },
        { intent: "independently peer-review a manuscript", route_ref: "academic-paper-reviewer:full", reason: "Independent manuscript assessment belongs to the reviewer Skill." },
      ],
      routes: [
        mode({ route_ref: "academic-paper:full", title: "Full manuscript drafting", intents: ["draft a complete paper from existing research materials"], primary_artifact_types: ["paper_configuration", "paper_outline", "evidence_map", "argument_blueprint", "paper_draft", "submission_package"], prerequisite_groups: [project, manuscript, researchMaterials("deep-research:full")], risk_level: "high", gate_policy: gate("required", "manuscript_quality", "citation_integrity"), cost: cost("high", "long_horizon") }),
        mode({ route_ref: "academic-paper:outline-only", title: "Outline only", intents: ["create a detailed manuscript outline and evidence map"], primary_artifact_types: ["paper_outline", "evidence_map"], prerequisite_groups: [project, manuscript, researchMaterials("deep-research:full")], risk_level: "medium", gate_policy: gate("conditional", "manuscript_structure"), cost: cost("medium", "single_pass") }),
        mode({ route_ref: "academic-paper:revision", title: "Manuscript revision", intents: ["revise a draft against reviewer feedback or registered annotations"], primary_artifact_types: ["revision_patch", "revised_draft", "apply_report", "annotation_resolution_report", "response_to_reviewers"], prerequisite_groups: [manuscript, paperDraft(), reviewFeedback], risk_level: "high", gate_policy: gate("required", "revision_completeness"), cost: cost("high", "iterative") }),
        mode({ route_ref: "academic-paper:abstract-only", title: "Abstract only", intents: ["write an abstract and keywords for an existing manuscript"], primary_artifact_types: ["abstract", "keywords"], prerequisite_groups: [manuscript, paperDraft()], risk_level: "low", gate_policy: none, cost: cost("low", "single_pass") }),
        mode({ route_ref: "academic-paper:lit-review", title: "Manuscript literature review", intents: ["prepare literature-review material or prose for a manuscript"], primary_artifact_types: ["bibliography", "literature_matrix", "synthesis_report", "literature_review_draft"], prerequisite_groups: [project, manuscript, researchMaterials("deep-research:lit-review")], risk_level: "high", gate_policy: gate("required", "evidence_quality", "manuscript_quality"), cost: cost("medium", "iterative") }),
        mode({ route_ref: "academic-paper:format-convert", title: "Format conversion", intents: ["convert a final draft to a submission format"], primary_artifact_types: ["formatted_manuscript", "submission_package"], prerequisite_groups: [manuscript, paperDraft()], risk_level: "low", gate_policy: none, cost: cost("low", "single_pass") }),
        mode({ route_ref: "academic-paper:citation-check", title: "Citation check", intents: ["audit citations and references in a draft"], primary_artifact_types: ["citation_audit_report"], prerequisite_groups: [manuscript, paperDraft()], risk_level: "medium", gate_policy: gate("conditional", "citation_integrity"), cost: cost("low", "single_pass") }),
        mode({ route_ref: "academic-paper:plan", title: "Guided paper planning", intents: ["plan a paper through structured dialogue"], primary_artifact_types: ["chapter_plan", "insight_collection"], prerequisite_groups: [project, manuscript, researchMaterials("deep-research:socratic")], risk_level: "medium", gate_policy: none, cost: cost("variable", "iterative") }),
        mode({ route_ref: "academic-paper:revision-coach", title: "Revision coaching", intents: ["parse reviewer comments or registered annotations and develop a revision strategy"], primary_artifact_types: ["revision_roadmap", "response_letter_skeleton"], prerequisite_groups: [manuscript, group("any_of", [userInput("reviewer_comments"), artifact("review_report"), artifact("annotation_set")])], risk_level: "medium", gate_policy: none, cost: cost("medium", "iterative") }),
        mode({ route_ref: "academic-paper:disclosure", title: "AI disclosure", intents: ["prepare a venue-specific AI-use disclosure"], primary_artifact_types: ["ai_disclosure"], prerequisite_groups: [manuscript, paperDraft(), group("any_of", [userInput("venue_requirements"), userInput("venue_profile")])], risk_level: "medium", gate_policy: gate("conditional", "compliance"), cost: cost("low", "single_pass") }),
        mode({ route_ref: "academic-paper:rebuttal-audit", title: "Rebuttal audit", intents: ["audit an existing rebuttal against reviewer comments"], primary_artifact_types: ["rebuttal_qa_report"], prerequisite_groups: [manuscript, group("any_of", [userInput("reviewer_comments"), artifact("review_report")]), group("any_of", [userInput("rebuttal_draft"), artifact("response_to_reviewers")])], risk_level: "medium", gate_policy: gate("conditional", "rebuttal_completeness"), cost: cost("low", "single_pass") }),
      ],
    },
    {
      skill_id: "academic-paper-reviewer",
      title: "Academic Paper Reviewer",
      summary: "Independent manuscript peer review, focused methodology assessment, guided review, and revision verification.",
      intents: ["peer-review an academic manuscript", "verify a revised manuscript", "focus on methodology", "calibrate reviewer judgments"],
      default_route_ref: "academic-paper-reviewer:full",
      near_misses: [
        { intent: "verify facts or claims in a research report", route_ref: "deep-research:fact-check", reason: "Claim verification is evidence research, not manuscript peer review." },
        { intent: "write or revise manuscript prose", route_ref: "academic-paper:revision", reason: "Reviewer routes remain read-only with respect to manuscript content." },
        { intent: "audit only the response letter", route_ref: "academic-paper:rebuttal-audit", reason: "Rebuttal QA differs from verifying changes in the revised manuscript." },
      ],
      routes: [
        mode({ route_ref: "academic-paper-reviewer:full", title: "Full peer review", intents: ["run a complete multi-perspective manuscript review"], primary_artifact_types: ["review_report", "editorial_decision", "revision_roadmap"], prerequisite_groups: [project, manuscript, paperDraft()], risk_level: "high", gate_policy: gate("required", "review_quality"), cost: cost("medium", "single_pass") }),
        mode({ route_ref: "academic-paper-reviewer:re-review", title: "Revision re-review", intents: ["verify whether a revised manuscript addresses prior review or annotations"], primary_artifact_types: ["verification_review_report", "rr_traceability_matrix", "revision_roadmap"], prerequisite_groups: [manuscript, group("any_of", [userInput("revised_manuscript"), artifact("revised_draft")], ["academic-paper:revision"]), group("any_of", [artifact("review_report"), artifact("revision_roadmap"), userInput("reviewer_comments"), artifact("annotation_set"), artifact("annotation_resolution_report")])], risk_level: "high", gate_policy: gate("required", "revision_completeness"), cost: cost("medium", "single_pass") }),
        mode({ route_ref: "academic-paper-reviewer:quick", title: "Quick review", intents: ["identify the most important manuscript issues quickly"], primary_artifact_types: ["eic_quick_assessment"], prerequisite_groups: [manuscript, paperDraft()], risk_level: "low", gate_policy: none, cost: cost("low", "single_pass") }),
        mode({ route_ref: "academic-paper-reviewer:methodology-focus", title: "Methodology-focused review", intents: ["assess research design and methodology in depth"], primary_artifact_types: ["methodology_review"], prerequisite_groups: [project, manuscript, paperDraft()], risk_level: "high", gate_policy: gate("required", "methodology_quality"), cost: cost("medium", "single_pass") }),
        mode({ route_ref: "academic-paper-reviewer:guided", title: "Guided review", intents: ["work through manuscript issues through Socratic dialogue"], primary_artifact_types: ["guided_review_notes"], prerequisite_groups: [manuscript, paperDraft()], risk_level: "medium", gate_policy: none, cost: cost("variable", "iterative") }),
        mode({ route_ref: "academic-paper-reviewer:calibration", title: "Reviewer calibration", intents: ["measure reviewer accuracy against a gold set"], primary_artifact_types: ["calibration_report", "confidence_disclosure"], prerequisite_groups: [group("all_of", [userInput("calibration_gold_set")])], risk_level: "low", gate_policy: none, cost: cost("high", "long_horizon") }),
      ],
    },
    {
      skill_id: "academic-pipeline",
      title: "Academic Pipeline",
      summary: "Cross-stage orchestration from research through writing, integrity, review, revision, and finalization.",
      intents: ["complete a research-to-publication workflow", "continue a cross-stage paper workflow", "enter the pipeline from existing materials"],
      default_route_ref: "academic-pipeline:end-to-end",
      near_misses: [
        { intent: "perform one focused research task", route_ref: "deep-research:full", reason: "A standalone research route avoids unnecessary pipeline overhead." },
        { intent: "write from completed research materials", route_ref: "academic-paper:full", reason: "A single writing deliverable can go directly to the paper Skill." },
        { intent: "review one existing manuscript", route_ref: "academic-paper-reviewer:full", reason: "A local peer-review request does not require pipeline orchestration." },
      ],
      routes: [
        entry({ route_ref: "academic-pipeline:end-to-end", title: "End-to-end pipeline", intents: ["start from a research goal and continue to a submission package"], primary_artifact_types: ["submission_package", "process_summary"], prerequisite_groups: [workflow, project, researchGoal], risk_level: "high", gate_policy: gate("profile_defined", "integrity", "review", "final_integrity"), cost: cost("high", "long_horizon") }),
        entry({ route_ref: "academic-pipeline:mid-entry", title: "Mid-entry or resume", intents: ["continue the pipeline from research materials, a draft, review feedback, or registered annotations"], primary_artifact_types: ["submission_package", "process_summary"], prerequisite_groups: [workflow, project, group("any_of", [userInput("research_materials"), artifact("rq_brief"), artifact("bibliography"), artifact("synthesis_report"), userInput("manuscript"), artifact("paper_draft"), userInput("reviewer_comments"), artifact("review_report"), artifact("annotation_set")], ["academic-pipeline:end-to-end"])], risk_level: "high", gate_policy: gate("profile_defined", "integrity", "review", "final_integrity"), cost: cost("high", "long_horizon") }),
      ],
    },
  ],
};

const parsed = ArsuRoutingCatalogSchema.parse(rawCatalog);
const issues = validateRoutingCatalogReferences(parsed);
if (issues.length > 0) {
  throw new Error(`Invalid canonical ARSU routing catalog:\n${issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n")}`);
}

export const ARSU_ROUTING_CATALOG: ArsuRoutingCatalog = parsed;

export function getArsuSkillDefinition(skillId: ArsuSkillId): ArsuSkillRouteDefinition {
  const skill = ARSU_ROUTING_CATALOG.skills.find((item) => item.skill_id === skillId);
  if (!skill) throw new Error(`Unknown ARSU Skill: ${skillId}`);
  return skill;
}

export function getArsuRoute(routeRef: RouteRef): ArsuRouteDefinition {
  const route = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes)
    .find((item) => item.route_ref === routeRef);
  if (!route) throw new Error(`Unknown ARSU route: ${routeRef}`);
  return route;
}
