import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";
import { ScientificAgentSkillsAuditSchema } from "../src/vendor-audits/scientific-agent-skills.js";
import { assertAuditSourceInitialized, assertEvidencePaths, gitOutput, repositoryResourceSummary, topLevelSkillIds } from "./helpers/vendor-audit.js";

const SOURCE_ROOT = path.resolve("vendor/scientific-agent-skills");
const AUDIT_PATH = path.resolve("audits/scientific-agent-skills/v2.53.0/skill-audit.json");
const TAXONOMY_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");
const DERIVED_ROOT = path.resolve("skills/plugins/vendors/scientific-agent-skills");
const REVISION = "9c9bd2e92af12311ecd0c1a643e0931643f9ea04";
const REPOSITORY_URL = "https://github.com/K-Dense-AI/scientific-agent-skills.git";

void test("Scientific Agent Skills audit pins the official v2.53.0 source", async () => {
  await assertAuditSourceInitialized(SOURCE_ROOT, "skills/scanpy/SKILL.md", "git submodule update --init vendor/scientific-agent-skills");
  const audit = await readAudit();

  assert.equal(gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["config", "--get", "remote.origin.url"]), REPOSITORY_URL);
  assert.equal(gitOutput(SOURCE_ROOT, ["rev-list", "-n", "1", "v2.53.0"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["status", "--porcelain"]), "");
  assert.deepEqual(audit.source, {
    source_id: "scientific-agent-skills",
    name: "Scientific Agent Skills",
    repository_url: "https://github.com/K-Dense-AI/scientific-agent-skills",
    release: "v2.53.0",
    revision: REVISION,
    root_license: "MIT",
    license_path: "LICENSE.md",
    skill_root: "skills",
  });
});

void test("Scientific Agent Skills audit covers every Skill and evidence path", async () => {
  const audit = await readAudit();
  const sourceIds = await topLevelSkillIds(SOURCE_ROOT);
  const auditIds = audit.skills.map((item) => item.skill_id);
  const categoryTitles = new Set(audit.upstream_categories.map((item) => item.title));
  const fieldIds = new Set((await loadAnzsrcSnapshot(TAXONOMY_PATH)).fields.map((field) => field.code));

  assert.equal(sourceIds.length, 147);
  assert.deepEqual(auditIds, sourceIds);
  assert.equal(new Set(auditIds).size, auditIds.length);

  for (const item of audit.skills) {
    assert.equal(item.source_path, `skills/${item.skill_id}`);
    assert.ok(item.upstream_categories.every((category) => categoryTitles.has(category)));
    assert.equal(new Set(item.upstream_categories).size, item.upstream_categories.length);
    if (item.primary_anzsrc_field === null) {
      assert.ok(item.anzsrc_unclassified_reason);
      assert.deepEqual(item.additional_anzsrc_fields, []);
    } else {
      assert.ok(fieldIds.has(item.primary_anzsrc_field));
      assert.equal(item.anzsrc_unclassified_reason, null);
      assert.ok(item.additional_anzsrc_fields.every((fieldId) => fieldIds.has(fieldId) && fieldId !== item.primary_anzsrc_field));
    }
    assert.equal(item.scope_disposition === "exclude", item.ingest_readiness === "not-applicable");

    assert.deepEqual(
      item.resources,
      await repositoryResourceSummary(path.join(SOURCE_ROOT, item.source_path)),
      item.skill_id,
    );

    const relationshipTargets = new Set<string>();
    for (const relationship of item.relationships) {
      assert.ok(sourceIds.includes(relationship.target_skill_id));
      assert.notEqual(relationship.target_skill_id, item.skill_id);
      assert.equal(relationshipTargets.has(relationship.target_skill_id), false);
      relationshipTargets.add(relationship.target_skill_id);
      await assertEvidencePaths(SOURCE_ROOT, relationship.evidence);
    }
    await assertEvidencePaths(SOURCE_ROOT, item.content_license.evidence);
    await assertEvidencePaths(SOURCE_ROOT, item.security.evidence);
    for (const finding of item.findings) await assertEvidencePaths(SOURCE_ROOT, finding.evidence);
  }
});

void test("Scientific Agent Skills structural, license, and security summaries are reproducible", async () => {
  const audit = await readAudit();
  const counts = (selector: (item: typeof audit.skills[number]) => string): Record<string, number> => {
    const result: Record<string, number> = {};
    for (const item of audit.skills) result[selector(item)] = (result[selector(item)] ?? 0) + 1;
    return Object.fromEntries(Object.entries(result).sort(([left], [right]) => left.localeCompare(right, "en")));
  };

  assert.equal(audit.summary.top_level_skills, 147);
  assert.equal(audit.summary.files, 1_468);
  assert.equal(audit.summary.bytes, 19_783_777);
  assert.equal(audit.summary.skills_with_references, 135);
  assert.equal(audit.summary.skills_with_scripts, 70);
  assert.equal(audit.summary.script_files, 387);
  assert.equal(audit.summary.skills_with_assets, 24);
  assert.equal(audit.summary.validator_adaptation_skills, 38);
  assert.equal(audit.summary.required_environment_variable_skills, 31);
  assert.equal(audit.summary.install_or_download_instruction_skills, 109);
  assert.equal(audit.summary.upstream_security_findings, 877);
  assert.equal(audit.summary.upstream_tabulated_skill_findings, 667);
  assert.deepEqual(audit.summary.upstream_severity_skill_counts, counts((item) => item.security.highest_severity));
  assert.deepEqual(audit.summary.license_status_counts, counts((item) => item.content_license.status));
  assert.equal(audit.skills.reduce((sum, item) => sum + item.security.findings, 0), 667);

  const frontmatterFindings = await recomputeFrontmatterFindings(auditIds(audit));
  assert.equal(frontmatterFindings.validatorAdaptation.size, 38);
  assert.equal(frontmatterFindings.requiredEnvironment.size, 31);
  assert.equal(frontmatterFindings.installInstructions.size, 109);
  for (const skillId of frontmatterFindings.validatorAdaptation) assert.ok(hasAnyFinding(audit, skillId, ["metadata-normalization-required", "allowed-tools-normalization-required", "description-over-limit"]));
  for (const skillId of frontmatterFindings.requiredEnvironment) assert.ok(hasAnyFinding(audit, skillId, ["environment-contract-normalization-required"]));

  assert.deepEqual(
    audit.skills.filter((item) => item.content_license.status === "prohibited").map((item) => item.skill_id),
    ["docx", "pdf", "pptx", "xlsx"],
  );
  assert.deepEqual(
    audit.skills.filter((item) => item.scope_disposition === "exclude").map((item) => item.skill_id),
    ["arbor", "autoskill", "docx", "get-available-resources", "pdf", "pi-agent", "pptx", "xlsx"],
  );
  for (const item of audit.skills.filter((skill) => ["critical", "high"].includes(skill.security.highest_severity))) {
    assert.ok(item.ingest_readiness === "blocked-review" || item.scope_disposition === "exclude");
  }
});

void test("Scientific Agent Skills production admission remains separately policy governed", async () => {
  const registry = await loadPluginRegistry();
  assert.deepEqual([...registry.vendors.keys()], ["materials-science-skills-for-llm", "scientific-agent-skills", "tooluniverse"]);
  assert.equal(registry.vendors.get("scientific-agent-skills")?.skills.length, 49);
  assert.equal(registry.domains.size, 218);
  assert.equal(availableDomains(registry).length, 49);
  assert.equal((await readFile(path.join(DERIVED_ROOT, "scientific-agent-skills-astropy", "SKILL.md"), "utf8")).startsWith("---\n"), true);
});

async function readAudit() {
  return ScientificAgentSkillsAuditSchema.parse(JSON.parse(await readFile(AUDIT_PATH, "utf8")));
}

function auditIds(audit: Awaited<ReturnType<typeof readAudit>>): string[] {
  return audit.skills.map((item) => item.skill_id);
}

function hasAnyFinding(audit: Awaited<ReturnType<typeof readAudit>>, skillId: string, codes: string[]): boolean {
  return Boolean(audit.skills.find((item) => item.skill_id === skillId)?.findings.some((finding) => codes.includes(finding.code)));
}

async function recomputeFrontmatterFindings(skillIds: string[]): Promise<{
  validatorAdaptation: Set<string>;
  requiredEnvironment: Set<string>;
  installInstructions: Set<string>;
}> {
  const validatorAdaptation = new Set<string>();
  const requiredEnvironment = new Set<string>();
  const installInstructions = new Set<string>();
  const installPattern = /(?:uv\s+(?:pip\s+)?install|pip(?:3)?\s+install|conda\s+install|mamba\s+install|apt(?:-get)?\s+install|brew\s+install|npm\s+install|npx\s+|git\s+clone|curl\s+[^\n|]*(?:\||-o|-O)|wget\s+)/i;

  for (const skillId of skillIds) {
    const text = await readFile(path.join(SOURCE_ROOT, "skills", skillId, "SKILL.md"), "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(match);
    const frontmatter = parse(match[1]) as Record<string, unknown>;
    assert.equal(frontmatter.name, skillId);
    const metadata = frontmatter.metadata;
    const metadataInvalid = metadata !== null && typeof metadata === "object" && !Array.isArray(metadata)
      && Object.values(metadata).some((value) => typeof value !== "string");
    if (metadataInvalid || Array.isArray(frontmatter["allowed-tools"]) || (typeof frontmatter.description === "string" && frontmatter.description.length > 1024)) validatorAdaptation.add(skillId);
    if (Array.isArray(frontmatter.required_environment_variables) && frontmatter.required_environment_variables.length > 0) requiredEnvironment.add(skillId);
    if (installPattern.test(text)) installInstructions.add(skillId);
  }
  return { validatorAdaptation, requiredEnvironment, installInstructions };
}
