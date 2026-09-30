import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";
import { assertAuditSourceInitialized, assertEvidencePaths, gitOutput, repositoryResourceSummary, topLevelSkillIds } from "./helpers/vendor-audit.js";

const SOURCE_ROOT = path.resolve("vendor/tooluniverse");
const AUDIT_PATH = path.resolve("audits/tooluniverse/v1.3.1/skill-audit.json");
const TAXONOMY_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");
const REVISION = "9b7ff91ddb45b567cac2fa8ea31b82851e877617";
const REPOSITORY_URL = "https://github.com/mims-harvard/ToolUniverse";

void test("ToolUniverse audit pins the official v1.3.1 source", async () => {
  await assertAuditSourceInitialized(SOURCE_ROOT, "skills/README.md", "git submodule update --init vendor/tooluniverse");
  const audit = await readAudit();

  assert.equal(gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["config", "--get", "remote.origin.url"]), REPOSITORY_URL);
  assert.equal(gitOutput(SOURCE_ROOT, ["rev-list", "-n", "1", "v1.3.1"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["status", "--porcelain"]), "");
  assert.deepEqual(audit.source, {
    source_id: "tooluniverse",
    name: "ToolUniverse",
    repository_url: REPOSITORY_URL,
    release: "v1.3.1",
    revision: REVISION,
    license: "Apache-2.0",
    license_path: "LICENSE",
    skill_root: "skills",
  });
});

void test("ToolUniverse audit covers every top-level Skill exactly once", async () => {
  await assertAuditSourceInitialized(SOURCE_ROOT, "skills/README.md", "git submodule update --init vendor/tooluniverse");
  const audit = await readAudit();
  const sourceIds = await topLevelSkillIds(SOURCE_ROOT);
  const auditIds = audit.skills.map((item) => item.skill_id);
  const fieldIds = new Set((await loadAnzsrcSnapshot(TAXONOMY_PATH)).fields.map((field) => field.code));

  assert.equal(sourceIds.length, 150);
  assert.equal(auditIds.length, 150);
  assert.equal(new Set(auditIds).size, auditIds.length);
  assert.deepEqual(auditIds, sourceIds);

  for (const item of audit.skills) {
    assert.equal(item.source_path, `skills/${item.skill_id}`);
    assert.ok(["candidate", "exclude"].includes(item.scope_disposition));
    assert.ok(["standard-adaptation", "needs-curation", "not-applicable"].includes(item.ingest_readiness));
    assert.equal(item.scope_disposition === "candidate", item.primary_anzsrc_field !== null);
    if (item.primary_anzsrc_field !== null) {
      assert.ok(fieldIds.has(item.primary_anzsrc_field));
      assert.equal(item.anzsrc_unclassified_reason, null);
    } else assert.ok(item.anzsrc_unclassified_reason);
    assert.ok(item.additional_anzsrc_fields.every((fieldId) => fieldIds.has(fieldId) && fieldId !== item.primary_anzsrc_field));
    assert.equal(new Set(item.additional_anzsrc_fields).size, item.additional_anzsrc_fields.length);
    assert.ok(item.findings.every((finding) => ["blocking", "review", "advisory"].includes(finding.severity)));

    const summary = await repositoryResourceSummary(path.join(SOURCE_ROOT, item.source_path));
    const actualResources = {
      files: summary.files,
      bytes: summary.bytes,
      scripts: summary.scripts,
      tests_or_evals: summary.tests_or_evals,
      environment_templates: summary.environment_templates,
    };
    assert.deepEqual(item.resources, actualResources, item.skill_id);

    const skillText = await readFile(path.join(SOURCE_ROOT, item.source_path, "SKILL.md"), "utf8");
    const references = [...new Set(skillText.match(/(?<![a-z0-9-])tooluniverse-[a-z0-9-]+/g) ?? [])]
      .filter((skillId) => sourceIds.includes(skillId) && skillId !== item.skill_id)
      .sort();
    assert.deepEqual(item.cross_skill_references, references, item.skill_id);

    for (const finding of item.findings) {
      await assertEvidencePaths(SOURCE_ROOT, finding.evidence);
    }
  }
});

void test("ToolUniverse audit summaries and known findings are reproducible", async () => {
  const audit = await readAudit();
  const candidates = audit.skills.filter((item) => item.scope_disposition === "candidate");
  const excluded = audit.skills.filter((item) => item.scope_disposition === "exclude");
  const candidateIds = new Set(candidates.map((item) => item.skill_id));

  assert.equal(candidates.length, 130);
  assert.equal(excluded.length, 20);
  assert.equal(candidates.filter((item) => item.ingest_readiness === "standard-adaptation").length, 125);
  assert.equal(candidates.filter((item) => item.ingest_readiness === "needs-curation").length, 5);
  assert.equal(candidates.reduce((sum, item) => sum + item.resources.files, 0), 550);
  assert.equal(candidates.reduce((sum, item) => sum + item.resources.bytes, 0), 6_423_781);
  assert.equal(candidates.filter((item) => item.resources.scripts > 0).length, 33);
  assert.equal(candidates.reduce((sum, item) => sum + item.resources.scripts, 0), 88);
  assert.equal(candidates.filter((item) => item.resources.tests_or_evals > 0).length, 44);
  assert.equal(candidates.reduce((sum, item) => sum + item.cross_skill_references.filter((target) => candidateIds.has(target)).length, 0), 223);
  assert.deepEqual(audit.summary.known_frontmatter_parse_errors, ["tooluniverse-fastq-qc", "tooluniverse-phewas"]);
  assert.deepEqual(audit.summary.known_description_over_1024, [
    "tooluniverse-clinical-risk-scoring",
    "tooluniverse-mendelian-randomization",
    "tooluniverse-product-safety-surveillance",
  ]);
  assert.deepEqual(audit.summary.known_skill_md_over_500_lines, [
    "tooluniverse-phylogenetics",
    "tooluniverse-residue-functional-mechanism-interpretation",
    "tooluniverse-rnaseq-deseq2",
    "tooluniverse-statistical-modeling",
    "tooluniverse-variant-analysis",
  ]);
  for (const skillId of audit.summary.known_frontmatter_parse_errors) assert.ok(hasFinding(audit, skillId, "frontmatter-invalid"));
  for (const skillId of audit.summary.known_description_over_1024) assert.ok(hasFinding(audit, skillId, "description-over-limit"));
  for (const skillId of audit.summary.known_skill_md_over_500_lines) assert.ok(hasFinding(audit, skillId, "skill-body-over-recommendation"));
});

void test("ToolUniverse production vendor remains traceable to the audit", async () => {
  const registry = await loadPluginRegistry();
  assert.deepEqual([...registry.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);
  assert.equal(registry.vendors.get("tooluniverse")?.revision, REVISION);
  assert.equal(registry.vendors.get("tooluniverse")?.skills.length, 130);
  assert.equal(registry.domains.size, 218);
  const domainCatalog = JSON.parse(await readFile(path.resolve("src/plugins/domain-catalog.json"), "utf8")) as { domains: Array<{ skills: string[] }> };
  assert.equal(availableDomains(registry).length, domainCatalog.domains.filter((domain) => domain.skills.length > 0).length);
});

function hasFinding(audit: Audit, skillId: string, code: string): boolean {
  return Boolean(audit.skills.find((item) => item.skill_id === skillId)?.findings.some((finding) => finding.code === code));
}

async function readAudit(): Promise<Audit> {
  return JSON.parse(await readFile(AUDIT_PATH, "utf8")) as Audit;
}

interface AuditResources {
  files: number;
  bytes: number;
  scripts: number;
  tests_or_evals: number;
  environment_templates: number;
}

interface AuditFinding {
  code: string;
  severity: string;
  evidence: string[];
  note: string;
}

interface AuditSkill {
  skill_id: string;
  source_path: string;
  scope_disposition: "candidate" | "exclude";
  ingest_readiness: "standard-adaptation" | "needs-curation" | "not-applicable";
  primary_anzsrc_field: string | null;
  additional_anzsrc_fields: string[];
  anzsrc_unclassified_reason: string | null;
  resources: AuditResources;
  cross_skill_references: string[];
  findings: AuditFinding[];
}

interface Audit {
  source: Record<string, string>;
  summary: {
    known_frontmatter_parse_errors: string[];
    known_description_over_1024: string[];
    known_skill_md_over_500_lines: string[];
  };
  skills: AuditSkill[];
}
