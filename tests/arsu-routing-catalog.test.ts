import assert from "node:assert/strict";
import { test } from "node:test";

import { ARSU_ROUTING_CATALOG, getArsuRoute, getArsuSkillDefinition } from "../src/arsu-converter/routing/catalog.js";
import {
  ARSU_SKILL_IDS,
  ArsuRoutingCatalogSchema,
  PrerequisiteRequirementSchema,
  type ArsuRoutingCatalog,
  validateRoutingCatalogReferences,
} from "../src/arsu-converter/routing/contracts.js";
import {
  projectSkillFrontmatterDescription,
  readSkillFrontmatterDescription,
  renderArsuCommandDescription,
  renderArsuRouteSummary,
  renderArsuSkillDescription,
} from "../src/arsu-converter/routing/projection.js";

const expectedRoutes = {
  "deep-research": ["full", "quick", "review", "lit-review", "three-way-scan", "fact-check", "socratic", "systematic-review"],
  "academic-paper": ["full", "outline-only", "revision", "abstract-only", "lit-review", "format-convert", "citation-check", "plan", "revision-coach", "disclosure", "rebuttal-audit"],
  "academic-paper-reviewer": ["full", "re-review", "quick", "methodology-focus", "guided", "calibration"],
  "academic-pipeline": ["end-to-end", "mid-entry"],
} as const;

void test("canonical routing catalog covers the locked ARSU surface", () => {
  assert.deepEqual(ARSU_ROUTING_CATALOG.skills.map((skill) => skill.skill_id), [...ARSU_SKILL_IDS]);
  const routes = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes);
  assert.equal(routes.filter((route) => route.route_kind === "mode").length, 25);
  assert.equal(routes.filter((route) => route.route_kind === "entry").length, 2);
  for (const skill of ARSU_ROUTING_CATALOG.skills) {
    assert.deepEqual(skill.routes.map((route) => route.route_ref.split(":", 2)[1]), [...expectedRoutes[skill.skill_id]]);
  }
  assert.deepEqual(validateRoutingCatalogReferences(ARSU_ROUTING_CATALOG), []);
});

void test("all routes expose current summaries without framework-owned artifact paths", () => {
  for (const route of ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes)) {
    const summary = renderArsuRouteSummary(route);
    assert.ok(summary.prerequisites.length > 0);
    assert.ok(summary.boundary_outputs.length > 0);
    assert.ok(summary.formal_gates.length > 0);
    assert.match(summary.risk_cost, /low|medium|high/);
    assert.equal(summary.confirmation, "independent confirmation required");
    assert.equal(route.start_confirmation, "required");
    assert.equal(route.boundary_outputs.every((output) => output.role && output.type && output.purpose && output.structure), true);
  }

  const paper = getArsuRoute("academic-paper:revision");
  assert.equal(paper.risk_level, "high");
  assert.deepEqual(paper.gate_policy, { level: "required", gate_kinds: ["revision_completeness"] });
  assert.ok(paper.boundary_outputs.some((output) => output.role === "response_to_reviewers"));
  assert.equal(paper.boundary_outputs.some((output) => output.role === "annotation_resolution_report"), false);
  assert.equal(paper.boundary_outputs.some((output) => output.role === "apply_report"), false);
  assert.ok(paper.prerequisite_groups.some((item) => item.operator === "any_of" && item.requirements.some((requirement) => requirement.id === "reviewer_comments")));
  assert.ok(paper.prerequisite_groups.some((item) => item.operator === "any_of" && item.requirements.some((requirement) => requirement.id === "annotation_set")));

  const fullPaper = getArsuRoute("academic-paper:full");
  assert.ok(fullPaper.prerequisite_groups.some((item) => item.fallback_route_refs.includes("deep-research:full")));
  const pipeline = getArsuRoute("academic-pipeline:mid-entry");
  assert.equal(pipeline.route_kind, "entry");
  assert.equal(pipeline.mode_id, null);
  assert.deepEqual(pipeline.gate_policy.gate_kinds, ["integrity", "review", "final_integrity"]);
  assert.ok(pipeline.prerequisite_groups.some((item) =>
    item.requirements.some((requirement) => requirement.id === "annotation_set")));

  const reviewer = getArsuSkillDefinition("academic-paper-reviewer");
  assert.ok(reviewer.near_misses.some((item) => item.route_ref === "academic-paper:rebuttal-audit"));

  assert.equal(PrerequisiteRequirementSchema.safeParse({ kind: "artifact", id: "paper_draft" }).success, false);
  assert.equal(PrerequisiteRequirementSchema.safeParse({ kind: "contract", id: "specs/workflow.yaml" }).success, false);
  assert.equal(PrerequisiteRequirementSchema.safeParse({ kind: "stable_spec", id: "specs/manuscript.yaml" }).success, true);
  assert.equal(PrerequisiteRequirementSchema.safeParse({ kind: "handoff_role", id: "paper_draft" }).success, true);
});

void test("routing catalog rejects structural and semantic inconsistencies", () => {
  const withExtra = { ...structuredClone(ARSU_ROUTING_CATALOG), unexpected: true };
  assert.equal(ArsuRoutingCatalogSchema.safeParse(withExtra).success, false);

  const cases: Array<[string, (catalog: ArsuRoutingCatalog) => void, string]> = [
    ["duplicate route", (catalog) => { const skill = firstSkill(catalog); skill.routes.push(structuredClone(firstRoute(catalog))); }, "duplicate_route_ref"],
    ["route owner", (catalog) => { firstRoute(catalog).route_ref = "academic-paper:full"; }, "route_skill_mismatch"],
    ["unknown near miss", (catalog) => { firstNearMiss(catalog).route_ref = "academic-paper:missing"; }, "near_miss_route_missing"],
    ["empty gate", (catalog) => { firstRoute(catalog).gate_policy.gate_kinds = []; }, "gate_policy_inconsistent"],
    ["duplicate output role", (catalog) => {
      const route = firstRoute(catalog);
      const output = route.boundary_outputs[0];
      if (!output) throw new Error("Fixture route has no boundary output.");
      route.boundary_outputs.push(structuredClone(output));
    }, "duplicate_boundary_output_role"],
    ["fallback cycle", (catalog) => { firstPrerequisiteGroup(catalog).fallback_route_refs = ["academic-paper:full"]; }, "fallback_route_cycle"],
  ];
  for (const [label, mutate, code] of cases) {
    const catalog = structuredClone(ARSU_ROUTING_CATALOG);
    mutate(catalog);
    assert.ok(validateRoutingCatalogReferences(catalog).some((issue) => issue.code === code), label);
  }

  const emptyGroup = structuredClone(ARSU_ROUTING_CATALOG);
  firstPrerequisiteGroup(emptyGroup).requirements = [];
  assert.equal(ArsuRoutingCatalogSchema.safeParse(emptyGroup).success, false);
});

void test("Skill and command descriptions are deterministic catalog projections", () => {
  const source = `---\nname: deep-research\ndescription: upstream\nmetadata:\n  status: active\n---\n# Body\n\nKeep body.\n`;
  const result = projectSkillFrontmatterDescription(source, "deep-research");
  const skill = getArsuSkillDefinition("deep-research");
  assert.equal(readSkillFrontmatterDescription(result.text), renderArsuSkillDescription(skill));
  assert.ok(result.text.includes("metadata:\n  status: active"));
  assert.match(result.text, /# Body\n\nKeep body\./);
  assert.match(result.text, /deep-research:systematic-review/);
  assert.match(renderArsuCommandDescription(skill), /deep-research:full/);
  assert.doesNotMatch(renderArsuCommandDescription(skill), /Near-miss routing/);
});

function firstSkill(catalog: ArsuRoutingCatalog): ArsuRoutingCatalog["skills"][number] {
  const value = catalog.skills[0];
  if (!value) throw new Error("Fixture catalog has no Skill.");
  return value;
}

function firstRoute(catalog: ArsuRoutingCatalog): ArsuRoutingCatalog["skills"][number]["routes"][number] {
  const value = firstSkill(catalog).routes[0];
  if (!value) throw new Error("Fixture catalog has no route.");
  return value;
}

function firstNearMiss(catalog: ArsuRoutingCatalog): ArsuRoutingCatalog["skills"][number]["near_misses"][number] {
  const value = firstSkill(catalog).near_misses[0];
  if (!value) throw new Error("Fixture catalog has no near miss.");
  return value;
}

function firstPrerequisiteGroup(catalog: ArsuRoutingCatalog): ArsuRoutingCatalog["skills"][number]["routes"][number]["prerequisite_groups"][number] {
  const value = firstRoute(catalog).prerequisite_groups[0];
  if (!value) throw new Error("Fixture route has no prerequisite group.");
  return value;
}
