import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { loadPluginRegistry } from "../src/plugins/registry.js";
import { checkScientificAgentSkillsIdempotence, checkScientificAgentSkillsOutput, type ScientificAgentSkillsConversionManifest } from "../src/vendor-converters/scientific-agent-skills/converter.js";
import { loadScientificAgentSkillsPolicies } from "../src/vendor-converters/scientific-agent-skills/policy.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");
const DOMAIN_CATALOG_PATH = path.resolve("src/plugins/domain-catalog.json");
const GENERATED_ROOT = path.join(PLUGIN_ROOT, "vendors/scientific-agent-skills");

void test("Scientific Agent Skills admission policy resolves every audited record", async () => {
  const policies = await loadScientificAgentSkillsPolicies(REPO_ROOT);
  const admitted = policies.admission.decisions.filter((decision) => decision.disposition === "admitted");
  const excluded = policies.admission.decisions.filter((decision) => decision.disposition === "excluded");
  const auditedIds = policies.audit.skills.map((skill) => skill.skill_id).sort();

  assert.deepEqual([...admitted, ...excluded].map((decision) => decision.upstream_skill_id).sort(), auditedIds);
  assert.equal(new Set([...admitted, ...excluded].map((decision) => decision.upstream_skill_id)).size, auditedIds.length);
  assert.ok(admitted.every((decision) => decision.generated_skill_id === "scientific-agent-skills-" + decision.upstream_skill_id));
  assert.ok(admitted.every((decision) => decision.license && decision.security_review.outcome === "passed" && decision.content_review.outcome === "passed"));
  assert.ok(admitted.every((decision) => !decision.arsu_overlap.targets.length && !decision.tooluniverse_overlap.targets.length && decision.domain_eligibility !== "none"));
  for (const skill of policies.audit.skills.filter((item) => item.scope_disposition === "exclude")) {
    assert.equal(policies.admission.decisions.find((decision) => decision.upstream_skill_id === skill.skill_id)?.disposition, "excluded", skill.skill_id);
  }

  const auditedRelations = new Set(policies.audit.skills.flatMap((skill) => skill.relationships.map((relation) => skill.skill_id + "\0" + relation.target_skill_id + "\0" + relation.relation)));
  assert.equal(policies.dependencies.decisions.length, auditedRelations.size);
  assert.ok(policies.dependencies.decisions.every((decision) => decision.disposition !== "installed"));

  const admittedIds = new Set(admitted.map((decision) => decision.upstream_skill_id));
  const excludedIds = new Set(excluded.map((decision) => decision.upstream_skill_id));
  const clearedReviews = policies.securityReview.reviews.filter((review) => !review.independent_blockers.length && review.maintainer_decision !== "fail");
  assert.ok(clearedReviews.every((review) => admittedIds.has(review.skill_id)));
  assert.ok(policies.securityReview.reviews.filter((review) => review.independent_blockers.length || review.maintainer_decision === "fail").every((review) => excludedIds.has(review.skill_id)));
});

void test("Scientific Agent Skills generated bundle preserves reviewed resources and normalized entries", async () => {
  const policies = await loadScientificAgentSkillsPolicies(REPO_ROOT);
  const admitted = policies.admission.decisions.filter((decision) => decision.disposition === "admitted");
  const bundle = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-bundles/scientific-agent-skills.json"), "utf8")) as {
    vendor: { vendor_id: string; skills: Array<{ skill_id: string; license: string; dependencies: string[] }> };
  };
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/scientific-agent-skills.json"), "utf8")) as ScientificAgentSkillsConversionManifest;
  const decisionByGenerated = new Map(admitted.map((decision) => [decision.generated_skill_id, decision]));

  assert.equal(bundle.vendor.vendor_id, "scientific-agent-skills");
  assert.equal(bundle.vendor.skills.length, admitted.length);
  for (const skill of bundle.vendor.skills) {
    const decision = decisionByGenerated.get(skill.skill_id);
    assert.ok(decision, skill.skill_id);
    assert.equal(skill.license, decision.license?.expression);
    assert.deepEqual(skill.dependencies, []);
  }
  assert.equal(manifest.audited_skills, policies.audit.skills.length);
  assert.equal(manifest.reviewed_candidates, policies.audit.skills.filter((skill) => skill.scope_disposition === "candidate").length);
  assert.equal(manifest.converter_version, "2");
  assert.equal(manifest.generated_skills.length, admitted.length);
  assert.equal(manifest.excluded_skill_ids.length, policies.admission.decisions.filter((decision) => decision.disposition === "excluded").length);
  assert.equal(manifest.file_dispositions.filter((item) => item.disposition === "excluded").length, policies.resources.decisions.length);
  assert.match(manifest.security_review_policy_sha256, /^[a-f0-9]{64}$/);

  for (const decision of admitted) {
    const text = await entry(decision.generated_skill_id);
    const frontmatterValue = frontmatter(text);
    assert.equal(frontmatterValue.name, decision.generated_skill_id);
    assert.equal(frontmatterValue.license, decision.license?.expression);
    assert.match(String(frontmatterValue.compatibility), /never executes scripts/);
    assert.match(text, /ResearchSpec boundary/);
  }

  for (const decision of policies.resources.decisions) {
    const audit = policies.audit.skills.find((skill) => skill.skill_id === decision.upstream_skill_id);
    assert.ok(audit, decision.upstream_skill_id);
    const relative = decision.source_path.slice(audit.source_path.length + 1);
    assert.ok(relative.length > 0 && !relative.startsWith("/") && !relative.includes(".."), decision.source_path);
    const generated = path.join(GENERATED_ROOT, "scientific-agent-skills-" + decision.upstream_skill_id, ...relative.split("/"));
    await assert.rejects(access(generated), decision.source_path);
  }
});

void test("Scientific Agent Skills citation trailers become passive notes and are never auto-inserted", async () => {
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/scientific-agent-skills.json"), "utf8")) as ScientificAgentSkillsConversionManifest;
  const passiveFragment = "do not fetch remote records to complete the citation";
  const normalized = new Set(manifest.citation_normalizations.map((item) => item.skill_id));
  assert.ok(normalized.size > 0);
  assert.equal(normalized.size, manifest.citation_normalizations.length);

  for (const item of manifest.citation_normalizations) {
    assert.equal(item.kind, "passive-citation-section");
    const upstream = await readFile(path.resolve("vendor/scientific-agent-skills", item.source_path), "utf8");
    assert.ok(upstream.includes("## Citing Scientific Agent Skills"), item.source_path);
    assert.ok(!upstream.includes(passiveFragment), item.source_path);
    assert.ok((await entry("scientific-agent-skills-" + item.skill_id)).includes(passiveFragment), item.skill_id);
  }

  for (const skillId of manifest.generated_skills) {
    if (normalized.has(skillId.slice("scientific-agent-skills-".length))) continue;
    assert.ok(!(await entry(skillId)).includes(passiveFragment), skillId);
  }
});


void test("combined production registry reaches every admitted second-vendor Skill through reviewed domains", async () => {
  const policies = await loadScientificAgentSkillsPolicies(REPO_ROOT);
  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  const direct = new Set(loaded.registry.domains.flatMap((domain) => domain.skills));
  const admittedIds = policies.admission.decisions.filter((decision) => decision.disposition === "admitted").map((decision) => decision.generated_skill_id);
  assert.deepEqual([...loaded.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);
  assert.ok(admittedIds.every((id) => direct.has(id)));
  assert.ok(policies.admission.decisions.filter((decision) => decision.disposition === "excluded").every((decision) => !loaded.skills.has(decision.generated_skill_id)));

  const catalog = JSON.parse(await readFile(DOMAIN_CATALOG_PATH, "utf8")) as { domains: Array<{ domain_id: string; skills: string[] }> };
  const mappedDomains = catalog.domains.filter((domain) => domain.skills.some((skill) => skill.startsWith("scientific-agent-skills-")));
  assert.ok(mappedDomains.length > 0);
  for (const domain of mappedDomains) {
    const expected = domain.skills.filter((skill) => skill.startsWith("scientific-agent-skills-")).sort();
    const actual = (loaded.domains.get(domain.domain_id)?.skills ?? []).filter((skill) => skill.startsWith("scientific-agent-skills-")).sort();
    assert.deepEqual(actual, expected, domain.domain_id);
  }
});

void test("Scientific Agent Skills generated output validates and regenerates idempotently", async () => {
  const check = await checkScientificAgentSkillsOutput(REPO_ROOT);
  assert.equal(check.ok, true, check.errors.join("\n"));
  const idempotence = await checkScientificAgentSkillsIdempotence(REPO_ROOT);
  assert.equal(idempotence.ok, true, idempotence.drift_paths.join("\n"));
});

async function entry(skillId: string): Promise<string> {
  return readFile(path.join(GENERATED_ROOT, skillId, "SKILL.md"), "utf8");
}

function frontmatter(text: string): Record<string, unknown> {
  const end = text.indexOf("\n---\n", 4);
  assert.ok(end > 0);
  return parse(text.slice(4, end)) as Record<string, unknown>;
}
