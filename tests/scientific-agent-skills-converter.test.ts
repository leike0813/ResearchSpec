import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { loadPluginRegistry } from "../src/plugins/registry.js";
import { checkScientificAgentSkillsIdempotence, checkScientificAgentSkillsOutput, type ScientificAgentSkillsConversionManifest } from "../src/vendor-converters/scientific-agent-skills/converter.js";
import { loadScientificAgentSkillsPolicies } from "../src/vendor-converters/scientific-agent-skills/policy.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");

void test("Scientific Agent Skills admission policy resolves every audited record", async () => {
  const policies = await loadScientificAgentSkillsPolicies(REPO_ROOT);
  const admitted = policies.admission.decisions.filter((decision) => decision.disposition === "admitted");
  const excluded = policies.admission.decisions.filter((decision) => decision.disposition === "excluded");
  assert.equal(policies.audit.skills.length, 147);
  assert.equal(policies.audit.skills.filter((skill) => skill.scope_disposition === "candidate").length, 139);
  assert.equal(admitted.length, 49);
  assert.equal(excluded.length, 98);
  assert.ok(admitted.every((decision) => decision.generated_skill_id === `scientific-agent-skills-${decision.upstream_skill_id}`));
  assert.ok(admitted.every((decision) => decision.license?.expression === "MIT" && decision.security_review.outcome === "passed" && decision.content_review.outcome === "passed"));
  assert.ok(admitted.every((decision) => !decision.arsu_overlap.targets.length && !decision.tooluniverse_overlap.targets.length && decision.domain_eligibility !== "none"));
  for (const id of ["arbor", "autoskill", "docx", "get-available-resources", "pdf", "pi-agent", "pptx", "xlsx"]) {
    assert.equal(policies.admission.decisions.find((decision) => decision.upstream_skill_id === id)?.disposition, "excluded");
  }
  assert.equal(policies.dependencies.decisions.length, 22);
  assert.equal(policies.dependencies.decisions.filter((decision) => decision.disposition === "installed").length, 0);
  assert.equal(policies.dependencies.decisions.filter((decision) => decision.disposition === "advisory").length, 3);
  const securityOnly = policies.securityReview.reviews.filter((review) => !review.independent_blockers.length && review.maintainer_decision !== "fail");
  assert.equal(securityOnly.length, 16);
  assert.ok(securityOnly.every((review) => admitted.some((decision) => decision.upstream_skill_id === review.skill_id)));
  assert.ok(policies.securityReview.reviews.filter((review) => review.independent_blockers.length || review.maintainer_decision === "fail").every((review) => excluded.some((decision) => decision.upstream_skill_id === review.skill_id)));
});

void test("Scientific Agent Skills generated bundle preserves reviewed resources and normalized entries", async () => {
  const policies = await loadScientificAgentSkillsPolicies(REPO_ROOT);
  const bundle = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-bundles/scientific-agent-skills.json"), "utf8")) as { vendor: { vendor_id: string; skills: Array<{ skill_id: string; license: string; dependencies: string[] }> } };
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/scientific-agent-skills.json"), "utf8")) as ScientificAgentSkillsConversionManifest;
  assert.equal(bundle.vendor.vendor_id, "scientific-agent-skills");
  assert.equal(bundle.vendor.skills.length, 49);
  assert.ok(bundle.vendor.skills.every((skill) => skill.skill_id.startsWith("scientific-agent-skills-") && skill.license === "MIT" && !skill.dependencies.length));
  assert.equal(manifest.audited_skills, 147);
  assert.equal(manifest.reviewed_candidates, 139);
  assert.equal(manifest.converter_version, "2");
  assert.equal(manifest.generated_skills.length, 49);
  assert.equal(manifest.excluded_skill_ids.length, 98);
  assert.equal(manifest.file_dispositions.filter((item) => item.disposition === "excluded").length, policies.resources.decisions.length);
  assert.equal(policies.resources.decisions.length, 28);
  assert.match(manifest.security_review_policy_sha256, /^[a-f0-9]{64}$/);

  const pennylane = await entry("scientific-agent-skills-pennylane");
  const pennylaneFrontmatter = frontmatter(pennylane);
  assert.equal(pennylaneFrontmatter.name, "scientific-agent-skills-pennylane");
  assert.equal(typeof pennylaneFrontmatter["allowed-tools"], "string");
  assert.equal(typeof pennylaneFrontmatter.metadata, "object");
  assert.match(String(pennylaneFrontmatter.compatibility), /never executes scripts/);

  const openNotebook = await entry("scientific-agent-skills-open-notebook");
  assert.match(openNotebook, /Bundled scripts/);
  await assert.rejects(readFile(path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills/scientific-agent-skills-open-notebook/scripts/test_open_notebook_skill.py")));
  assert.match(await readFile(path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills/scientific-agent-skills-open-notebook/scripts/chat_interaction.py"), "utf8"), /./);
  assert.match(await readFile(path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills/scientific-agent-skills-open-notebook/NOTICE.md"), "utf8"), /Explicit resource exclusions/);

  const infographics = await entry("scientific-agent-skills-infographics");
  assert.match(infographics, /Maintainer-approved curation/);
  assert.match(infographics, /target-Agent configured generic capabilities/);
  await assert.rejects(readFile(path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills/scientific-agent-skills-infographics/scripts/generate_infographic.py")));
  await assert.rejects(readFile(path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills/scientific-agent-skills-modal/references/secrets.md")));
  assert.match(await entry("scientific-agent-skills-transformers"), /trust_remote_code/);
});

void test("combined production registry reaches every admitted second-vendor Skill through reviewed domains", async () => {
  const policies = await loadScientificAgentSkillsPolicies(REPO_ROOT);
  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  const direct = new Set(loaded.registry.domains.flatMap((domain) => domain.skills));
  const admittedIds = policies.admission.decisions.filter((decision) => decision.disposition === "admitted").map((decision) => decision.generated_skill_id);
  assert.equal(loaded.vendors.size, 2);
  assert.ok(admittedIds.every((id) => direct.has(id)));
  assert.ok(policies.admission.decisions.filter((decision) => decision.disposition === "excluded").every((decision) => !loaded.skills.has(decision.generated_skill_id)));
  assert.equal(loaded.domains.get("machine-learning")?.skills.filter((id) => id.startsWith("scientific-agent-skills-")).length, 10);
  assert.equal(loaded.domains.get("laboratory-automation-and-informatics")?.skills.filter((id) => id.startsWith("scientific-agent-skills-")).length, 7);
  assert.equal(loaded.domains.get("scientific-visualization-and-communication")?.skills.filter((id) => id.startsWith("scientific-agent-skills-")).length, 12);
});

void test("Scientific Agent Skills generated output validates and regenerates idempotently", async () => {
  const check = await checkScientificAgentSkillsOutput(REPO_ROOT);
  assert.equal(check.ok, true, check.errors.join("\n"));
  const idempotence = await checkScientificAgentSkillsIdempotence(REPO_ROOT);
  assert.equal(idempotence.ok, true, idempotence.drift_paths.join("\n"));
});

async function entry(skillId: string): Promise<string> {
  return readFile(path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills", skillId, "SKILL.md"), "utf8");
}

function frontmatter(text: string): Record<string, unknown> {
  const end = text.indexOf("\n---\n", 4);
  assert.ok(end > 0);
  return parse(text.slice(4, end)) as Record<string, unknown>;
}
