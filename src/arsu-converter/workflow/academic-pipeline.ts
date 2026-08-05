import { PipelineProfileSchema, type PipelineProfile } from "../../core/contracts/pipeline-profile.js";
import { ARSU_ROUTING_CATALOG } from "../routing/catalog.js";
import type { ArsuRoutingCatalog } from "../routing/contracts.js";

export const ACADEMIC_PIPELINE_PROFILE: PipelineProfile = PipelineProfileSchema.parse({
  schema_version: "1",
  profile_id: "academic-pipeline",
  profile_version: "1",
  entries: [
    { entry_id: "end-to-end", route_ref: "academic-pipeline:end-to-end", checkpoint: "research", kind: "end-to-end" },
    { entry_id: "mid-entry", route_ref: "academic-pipeline:mid-entry", checkpoint: "entry", kind: "mid-entry" },
  ],
  children: [
    { node_id: "research", route_ref: "deep-research:full", prerequisites: [], required_gate_ids: ["evidence-integrity"], branch_ids: [], multiplicity: "optional", round_role: null },
    { node_id: "write", route_ref: "academic-paper:full", prerequisites: ["research"], required_gate_ids: ["manuscript-integrity"], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "review", route_ref: "academic-paper-reviewer:full", prerequisites: ["write"], required_gate_ids: ["review-confirmation"], branch_ids: ["editorial-outcome"], multiplicity: "one", round_role: null },
    { node_id: "revision", route_ref: "academic-paper:revision", prerequisites: ["review"], required_gate_ids: ["revision-completeness"], branch_ids: [], multiplicity: "repeatable", round_role: "revision" },
    { node_id: "re-review", route_ref: "academic-paper-reviewer:re-review", prerequisites: ["revision"], required_gate_ids: ["re-review-confirmation"], branch_ids: ["revision-outcome"], multiplicity: "repeatable", round_role: "re-review" },
    { node_id: "format", route_ref: "academic-paper:format-convert", prerequisites: [], required_input_roles: ["manuscript_source"], required_gate_ids: [], branch_ids: [], multiplicity: "one", round_role: null },
    { node_id: "final-integrity", route_ref: "academic-paper:citation-check", prerequisites: ["format"], required_input_roles: ["manuscript_source", "formatted_manuscript"], required_gate_ids: ["final-integrity"], branch_ids: [], multiplicity: "one", round_role: null },
  ],
  parallel_groups: [],
  gates: [
    { gate_id: "evidence-integrity", owner_node_id: "research", checkpoint: "research-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "manuscript-integrity", owner_node_id: "write", checkpoint: "draft-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "review-confirmation", owner_node_id: "review", checkpoint: "review-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "re-review-confirmation", owner_node_id: "re-review", checkpoint: "re-review-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "revision-completeness", owner_node_id: "revision", checkpoint: "revision-complete", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
    { gate_id: "final-integrity", owner_node_id: "final-integrity", checkpoint: "ready-to-finish", policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"] },
  ],
  branches: [
    { decision_id: "editorial-outcome", owner_node_id: "review", options: [
      { option_id: "accepted", unlocks: ["format"] },
      { option_id: "revision", unlocks: ["revision"] },
    ] },
    { decision_id: "revision-outcome", owner_node_id: "re-review", options: [
      { option_id: "accepted", unlocks: ["format"] },
      { option_id: "continue-revision", unlocks: ["revision"] },
    ] },
  ],
  transitions: [
    { transition_id: "research-to-write", from: "research", to: "write", required_child_node_ids: ["research"], required_gate_ids: ["evidence-integrity"], required_branch_ids: [] },
    { transition_id: "write-to-review", from: "write", to: "review", required_child_node_ids: ["write"], required_gate_ids: ["manuscript-integrity"], required_branch_ids: [] },
    { transition_id: "review-to-revision", from: "review", to: "revision", required_child_node_ids: ["review"], required_gate_ids: ["review-confirmation"], required_branch_ids: ["editorial-outcome"] },
    { transition_id: "revision-to-re-review", from: "revision", to: "re-review", required_child_node_ids: ["revision"], required_gate_ids: ["revision-completeness"], required_branch_ids: [] },
    { transition_id: "re-review-to-revision", from: "re-review", to: "revision", required_child_node_ids: ["re-review"], required_gate_ids: ["re-review-confirmation"], required_branch_ids: ["revision-outcome"] },
    { transition_id: "review-to-format", from: "review", to: "format", required_child_node_ids: ["review"], required_gate_ids: ["review-confirmation"], required_branch_ids: ["editorial-outcome"] },
    { transition_id: "re-review-to-format", from: "re-review", to: "format", required_child_node_ids: ["re-review"], required_gate_ids: ["re-review-confirmation"], required_branch_ids: ["revision-outcome"] },
    { transition_id: "format-to-final-integrity", from: "format", to: "final-integrity", required_child_node_ids: ["format"], required_gate_ids: [], required_branch_ids: [] },
  ],
  override_policy: { failed_gate_requires_decision: true },
  revision_round_template: {
    revision_node_id: "revision",
    review_node_id: "re-review",
    continue_option_id: "continue-revision",
    exit_option_id: "accepted",
  },
});

export function validateAcademicPipelineProfileRouting(
  profile: PipelineProfile = ACADEMIC_PIPELINE_PROFILE,
  catalog: ArsuRoutingCatalog = ARSU_ROUTING_CATALOG,
): string[] {
  const parsed = PipelineProfileSchema.parse(profile);
  const routes = new Map(catalog.skills.flatMap((skill) => skill.routes).map((route) => [route.route_ref, route]));
  const issues: string[] = [];
  const childIds = new Set(parsed.children.map((child) => child.node_id));

  for (const entry of parsed.entries) {
    const route = routes.get(entry.route_ref);
    if (!route) issues.push(`profile_entry_route_missing:${entry.entry_id}:${entry.route_ref}`);
    else if (route.route_kind !== "entry") issues.push(`profile_entry_route_kind_invalid:${entry.entry_id}:${entry.route_ref}`);
    if (entry.checkpoint !== "entry" && !childIds.has(entry.checkpoint)) {
      issues.push(`profile_entry_checkpoint_missing:${entry.entry_id}:${entry.checkpoint}`);
    }
  }

  for (const child of parsed.children) {
    const route = routes.get(child.route_ref);
    if (!route) {
      issues.push(`profile_child_route_missing:${child.node_id}:${child.route_ref}`);
      continue;
    }
    if (route.route_kind !== "mode") issues.push(`profile_child_route_kind_invalid:${child.node_id}:${child.route_ref}`);
    if (route.gate_policy.level === "none" && child.required_gate_ids.length > 0) {
      issues.push(`profile_child_gate_unexpected:${child.node_id}`);
    }
    if (route.gate_policy.level === "required" && child.required_gate_ids.length === 0) {
      issues.push(`profile_child_gate_missing:${child.node_id}`);
    }
  }

  return issues;
}
