import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";
import { ScientificAgentSkillsAuditSchema, type ScientificAgentSkillsAudit } from "../src/vendor-audits/scientific-agent-skills.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";
import { assertAuditSourceInitialized, assertEvidencePaths, gitOutput, repositoryResourceSummary, topLevelSkillIds, type RepositoryResourceSummary } from "./helpers/vendor-audit.js";

const CATALOG_PATH = path.resolve("audits/scientific-agent-skills/catalog.json");
const TAXONOMY_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");
const DOMAIN_CATALOG_PATH = path.resolve("src/plugins/domain-catalog.json");
const PLUGIN_ROOT = path.resolve("skills/plugins");

interface MaintenanceCatalog {
  vendor_id: string;
  upstream_root: string;
  generated_root: string;
  release: string;
  revision: string;
  repository_url: string;
  audit_file: string;
}

void test("Scientific Agent Skills audit pins the official pinned source", async () => {
  const catalog = await readCatalog();
  const sourceRoot = path.resolve(catalog.upstream_root);
  await assertAuditSourceInitialized(sourceRoot, "LICENSE.md", "git submodule update --init vendor/scientific-agent-skills");
  const audit = await readAudit(catalog);

  assert.equal(gitOutput(sourceRoot, ["rev-parse", "HEAD"]), catalog.revision);
  assert.equal(gitOutput(sourceRoot, ["config", "--get", "remote.origin.url"]), catalog.repository_url);
  assert.equal(gitOutput(sourceRoot, ["rev-list", "-n", "1", catalog.release]), catalog.revision);
  assert.equal(gitOutput(sourceRoot, ["status", "--porcelain"]), "");
  assert.equal(audit.source.source_id, "scientific-agent-skills");
  assert.equal(audit.source.release, catalog.release);
  assert.equal(audit.source.revision, catalog.revision);
  assert.equal(audit.source.repository_url, catalog.repository_url.replace(/\.git$/, ""));
  assert.ok(audit.source.root_license.length > 0);
  assert.ok(audit.source.license_path.length > 0);
  assert.equal(audit.source.skill_root, "skills");
});

void test("Scientific Agent Skills audit covers every Skill and evidence path", async () => {
  const catalog = await readCatalog();
  const sourceRoot = path.resolve(catalog.upstream_root);
  const audit = await readAudit(catalog);
  const sourceIds = await topLevelSkillIds(sourceRoot, audit.source.skill_root);
  const auditIds = audit.skills.map((item) => item.skill_id);
  const categoryTitles = new Set(audit.upstream_categories.map((item) => item.title));
  const fieldIds = new Set((await loadAnzsrcSnapshot(TAXONOMY_PATH)).fields.map((field) => field.code));

  assert.equal(audit.skills.length, sourceIds.length);
  assert.deepEqual(auditIds, sourceIds);
  assert.equal(new Set(auditIds).size, auditIds.length);

  for (const item of audit.skills) {
    assert.equal(item.source_path, audit.source.skill_root + "/" + item.skill_id);
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
      await repositoryResourceSummary(path.join(sourceRoot, item.source_path)),
      item.skill_id,
    );

    const relationshipTargets = new Set<string>();
    for (const relationship of item.relationships) {
      assert.ok(sourceIds.includes(relationship.target_skill_id));
      assert.notEqual(relationship.target_skill_id, item.skill_id);
      assert.equal(relationshipTargets.has(relationship.target_skill_id), false);
      relationshipTargets.add(relationship.target_skill_id);
      await assertEvidencePaths(sourceRoot, relationship.evidence);
    }
    await assertEvidencePaths(sourceRoot, item.content_license.evidence);
    await assertEvidencePaths(sourceRoot, item.security.evidence);
    for (const finding of item.findings) await assertEvidencePaths(sourceRoot, finding.evidence);
  }
});

void test("Scientific Agent Skills structural, license, and security summaries are reproducible", async () => {
  const catalog = await readCatalog();
  const sourceRoot = path.resolve(catalog.upstream_root);
  const audit = await readAudit(catalog);
  const sourceIds = await topLevelSkillIds(sourceRoot, audit.source.skill_root);

  const summaries = await Promise.all(sourceIds.map(async (skillId) => repositoryResourceSummary(path.join(sourceRoot, audit.source.skill_root, skillId))));
  const totals = summaries.reduce<RepositoryResourceSummary>((sum, item) => ({
    files: sum.files + item.files,
    bytes: sum.bytes + item.bytes,
    references: sum.references + item.references,
    scripts: sum.scripts + item.scripts,
    assets: sum.assets + item.assets,
    tests_or_evals: sum.tests_or_evals + item.tests_or_evals,
    environment_templates: sum.environment_templates + item.environment_templates,
  }), { files: 0, bytes: 0, references: 0, scripts: 0, assets: 0, tests_or_evals: 0, environment_templates: 0 });

  assert.equal(audit.summary.top_level_skills, sourceIds.length);
  assert.equal(audit.summary.files, totals.files);
  assert.equal(audit.summary.bytes, totals.bytes);
  assert.equal(audit.summary.skills_with_references, summaries.filter((item) => item.references > 0).length);
  assert.equal(audit.summary.skills_with_scripts, summaries.filter((item) => item.scripts > 0).length);
  assert.equal(audit.summary.script_files, totals.scripts);
  assert.equal(audit.summary.skills_with_assets, summaries.filter((item) => item.assets > 0).length);

  const frontmatter = await recomputeFrontmatterFindings(sourceRoot, audit.source.skill_root, sourceIds);
  assert.equal(audit.summary.validator_adaptation_skills, frontmatter.validatorAdaptation.size);
  assert.equal(audit.summary.required_environment_variable_skills, frontmatter.requiredEnvironment.size);
  assert.equal(audit.summary.install_or_download_instruction_skills, frontmatter.installInstructions.size);
  for (const skillId of frontmatter.validatorAdaptation) assert.ok(hasAnyFinding(audit, skillId, ["metadata-normalization-required", "allowed-tools-normalization-required", "description-over-limit"]));
  for (const skillId of frontmatter.requiredEnvironment) assert.ok(hasAnyFinding(audit, skillId, ["environment-contract-normalization-required"]));

  const counts = countsBy(audit.skills);
  assert.deepEqual(audit.summary.upstream_severity_skill_counts, counts((item) => item.security.highest_severity));
  assert.deepEqual(audit.summary.license_status_counts, counts((item) => item.content_license.status));
  assert.equal(audit.skills.reduce((sum, item) => sum + item.security.findings, 0), audit.summary.upstream_tabulated_skill_findings);
  assert.ok(audit.summary.upstream_security_findings >= audit.summary.upstream_tabulated_skill_findings);

  for (const item of audit.skills.filter((skill) => skill.content_license.status === "prohibited")) assert.equal(item.scope_disposition, "exclude", item.skill_id);
  for (const item of audit.skills.filter((skill) => ["critical", "high"].includes(skill.security.highest_severity))) {
    assert.ok(item.ingest_readiness === "blocked-review" || item.scope_disposition === "exclude", item.skill_id);
  }
});

void test("Scientific Agent Skills production admission remains separately policy governed", async () => {
  const catalog = await readCatalog();
  const registry = await loadPluginRegistry();
  assert.deepEqual([...registry.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);

  const bundle = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-bundles/scientific-agent-skills.json"), "utf8")) as {
    vendor: { skills: Array<{ skill_id: string }> };
  };
  assert.equal(registry.vendors.get("scientific-agent-skills")?.skills.length, bundle.vendor.skills.length);

  const domains = JSON.parse(await readFile(DOMAIN_CATALOG_PATH, "utf8")) as { domains: Array<{ skills: string[] }> };
  assert.equal(registry.domains.size, domains.domains.length);
  assert.equal(availableDomains(registry).length, domains.domains.filter((domain) => domain.skills.length > 0).length);

  const sample = bundle.vendor.skills[0]?.skill_id;
  assert.ok(sample);
  assert.equal((await readFile(path.join(path.resolve(catalog.generated_root), sample, "SKILL.md"), "utf8")).startsWith("---\n"), true);
});

async function readCatalog(): Promise<MaintenanceCatalog> {
  return JSON.parse(await readFile(CATALOG_PATH, "utf8")) as MaintenanceCatalog;
}

async function readAudit(catalog: MaintenanceCatalog): Promise<ScientificAgentSkillsAudit> {
  return ScientificAgentSkillsAuditSchema.parse(JSON.parse(await readFile(path.resolve(catalog.audit_file), "utf8")));
}

function countsBy(skills: ScientificAgentSkillsAudit["skills"]): (selector: (item: ScientificAgentSkillsAudit["skills"][number]) => string) => Record<string, number> {
  return (selector) => {
    const result: Record<string, number> = {};
    for (const item of skills) result[selector(item)] = (result[selector(item)] ?? 0) + 1;
    return Object.fromEntries(Object.entries(result).sort(([left], [right]) => left.localeCompare(right, "en")));
  };
}

function hasAnyFinding(audit: ScientificAgentSkillsAudit, skillId: string, codes: string[]): boolean {
  return Boolean(audit.skills.find((item) => item.skill_id === skillId)?.findings.some((finding) => codes.includes(finding.code)));
}

async function recomputeFrontmatterFindings(sourceRoot: string, skillRoot: string, skillIds: string[]): Promise<{
  validatorAdaptation: Set<string>;
  requiredEnvironment: Set<string>;
  installInstructions: Set<string>;
}> {
  const validatorAdaptation = new Set<string>();
  const requiredEnvironment = new Set<string>();
  const installInstructions = new Set<string>();
  const installPattern = /(?:uv\s+(?:pip\s+)?install|pip(?:3)?\s+install|conda\s+install|mamba\s+install|apt(?:-get)?\s+install|brew\s+install|npm\s+install|npx\s+|git\s+clone|curl\s+[^\n|]*(?:\||-o|-O)|wget\s+)/i;

  for (const skillId of skillIds) {
    const text = await readFile(path.join(sourceRoot, skillRoot, skillId, "SKILL.md"), "utf8");
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
