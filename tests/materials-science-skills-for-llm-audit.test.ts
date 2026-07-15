import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";
import { AuditRelativePathSchema, AuditSkillRootSchema } from "../src/vendor-audits/contracts.js";
import { MaterialsScienceSkillsAuditSchema } from "../src/vendor-audits/materials-science-skills-for-llm.js";
import { assertAuditSourceInitialized, assertEvidencePaths, gitOutput, repositoryResourceSummary, topLevelSkillIds } from "./helpers/vendor-audit.js";

const SOURCE_ROOT = path.resolve("vendor/materials-science-skills-for-llm");
const AUDIT_PATH = path.resolve("audits/materials-science-skills-for-llm/snapshot-fafd3ab/skill-audit.json");
const REPORT_PATH = path.resolve("audits/materials-science-skills-for-llm/snapshot-fafd3ab/report.md");
const TAXONOMY_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");
const REVISION = "fafd3ab011e4c363658a39c4bb62fc739839d58c";
const REPOSITORY_URL = "https://github.com/IntelligentMat/Materials-Science-Skills-For-LLM.git";

void test("Materials-Science-Skills-For-LLM audit pins the official untagged snapshot", async () => {
  await assertAuditSourceInitialized(
    SOURCE_ROOT,
    "apex-alloy-workflows/SKILL.md",
    "git submodule update --init vendor/materials-science-skills-for-llm",
  );
  const audit = await readAudit();

  assert.equal(gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["config", "--get", "remote.origin.url"]), REPOSITORY_URL);
  assert.equal(gitOutput(SOURCE_ROOT, ["tag", "--points-at", "HEAD"]), "");
  assert.equal(gitOutput(SOURCE_ROOT, ["status", "--porcelain"]), "");
  assert.deepEqual(audit.source, {
    source_id: "materials-science-skills-for-llm",
    name: "Materials-Science-Skills-For-LLM",
    repository_url: "https://github.com/IntelligentMat/Materials-Science-Skills-For-LLM",
    release: "snapshot-fafd3ab",
    revision: REVISION,
    root_license: "MIT",
    license_path: "LICENSE",
    skill_root: ".",
  });
  assert.match(await readFile(path.join(SOURCE_ROOT, "LICENSE"), "utf8"), /Permission is hereby granted/);
});

void test("Skill-root path accepts repository root without weakening evidence paths", () => {
  assert.equal(AuditSkillRootSchema.parse("."), ".");
  assert.equal(AuditSkillRootSchema.parse("skills"), "skills");
  assert.throws(() => AuditSkillRootSchema.parse("../skills"));
  assert.throws(() => AuditRelativePathSchema.parse("."));
  assert.throws(() => AuditRelativePathSchema.parse("/absolute/SKILL.md"));
});

void test("audit covers all twelve Skills with reproducible resources and evidence", async () => {
  const audit = await readAudit();
  const sourceIds = await topLevelSkillIds(SOURCE_ROOT, ".");
  const auditIds = audit.skills.map((item) => item.skill_id);
  const fieldIds = new Set((await loadAnzsrcSnapshot(TAXONOMY_PATH)).fields.map((field) => field.code));

  assert.equal(sourceIds.length, 12);
  assert.deepEqual(auditIds, sourceIds);
  assert.equal(new Set(auditIds).size, auditIds.length);

  for (const item of audit.skills) {
    assert.equal(item.source_path, item.skill_id);
    assert.deepEqual(item.resources, await repositoryResourceSummary(path.join(SOURCE_ROOT, item.source_path)), item.skill_id);
    assert.ok(item.primary_anzsrc_field && fieldIds.has(item.primary_anzsrc_field), item.skill_id);
    assert.equal(item.anzsrc_unclassified_reason, null, item.skill_id);
    assert.ok(item.additional_anzsrc_fields.every((field) => fieldIds.has(field) && field !== item.primary_anzsrc_field), item.skill_id);
    assert.equal(item.scope_disposition === "exclude", item.ingest_readiness === "not-applicable", item.skill_id);
    assert.equal(item.scope_disposition === "exclude", item.prospective_domains.length === 0, item.skill_id);

    const skillText = await readFile(path.join(SOURCE_ROOT, item.source_path, "SKILL.md"), "utf8");
    const match = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(match, item.skill_id);
    try {
      const frontmatter = parse(match[1]) as Record<string, unknown>;
      assert.equal(item.frontmatter.yaml_valid, true, item.skill_id);
      assert.equal(item.frontmatter.validation_error, null, item.skill_id);
      assert.equal(frontmatter.name, item.skill_id);
      assert.equal(typeof frontmatter.description, "string");
      assert.deepEqual(item.frontmatter.keys, Object.keys(frontmatter).sort(compareText));
      assert.equal(item.frontmatter.name, frontmatter.name);
      assert.equal(item.frontmatter.compatibility_declared, Object.hasOwn(frontmatter, "compatibility"));
    } catch (error) {
      assert.equal(item.skill_id, "deeptb-helper");
      assert.equal(item.frontmatter.yaml_valid, false);
      assert.ok(item.frontmatter.validation_error);
      assert.ok(item.findings.some((finding) => finding.code === "invalid-yaml-frontmatter"));
      assert.match(String(error), /Nested mappings are not allowed/);
    }

    const relationshipTargets = new Set<string>();
    for (const relationship of item.relationships) {
      assert.ok(sourceIds.includes(relationship.target_skill_id), relationship.target_skill_id);
      assert.notEqual(relationship.target_skill_id, item.skill_id);
      assert.equal(relationshipTargets.has(relationship.target_skill_id), false);
      relationshipTargets.add(relationship.target_skill_id);
      await assertEvidencePaths(SOURCE_ROOT, relationship.evidence);
    }
    await assertEvidencePaths(SOURCE_ROOT, item.content_license.evidence);
    for (const risk of item.operational_risks) await assertEvidencePaths(SOURCE_ROOT, risk.evidence);
    for (const overlap of item.overlaps) await assertEvidencePaths(SOURCE_ROOT, overlap.evidence);
    for (const finding of item.findings) await assertEvidencePaths(SOURCE_ROOT, finding.evidence);
  }
});

void test("audit summaries, references, licenses, and named risk boundaries are reproducible", async () => {
  const audit = await readAudit();
  const totals = audit.skills.reduce(
    (result, item) => ({
      files: result.files + item.resources.files,
      bytes: result.bytes + item.resources.bytes,
      references: result.references + item.resources.references,
    }),
    { files: 0, bytes: 0, references: 0 },
  );
  assert.deepEqual(totals, { files: 43, bytes: 82_860, references: 31 });
  assert.equal(audit.summary.candidate_skills, audit.skills.filter((item) => item.scope_disposition === "candidate").length);
  assert.equal(audit.summary.excluded_skills, audit.skills.filter((item) => item.scope_disposition === "exclude").length);
  assert.equal(audit.summary.blocked_review_skills, audit.skills.filter((item) => item.ingest_readiness === "blocked-review").length);
  assert.deepEqual(audit.summary.license_status_counts, countValues(audit.skills.map((item) => item.content_license.status)));
  assert.deepEqual(audit.summary.risk_counts, countValues(audit.skills.flatMap((item) => item.operational_risks.map((risk) => risk.risk))));
  assert.ok(audit.skills.every((item) => item.content_license.status === "ambiguous"));
  assert.ok(audit.skills.every((item) => item.findings.some((finding) => finding.code === "content-license-scope-unconfirmed")));

  const missingReferences: string[] = [];
  for (const item of audit.skills) {
    const skillText = await readFile(path.join(SOURCE_ROOT, item.source_path, "SKILL.md"), "utf8");
    for (const match of skillText.matchAll(/`(references\/[^`#]+)(?:#[^`]*)?`/g)) {
      try {
        await access(path.join(SOURCE_ROOT, item.source_path, match[1]));
      } catch {
        missingReferences.push(`${item.skill_id}/${match[1]}`);
      }
    }
  }
  assert.deepEqual([...new Set(missingReferences)], ["atomsk-cli/references/quick-recipes.md"]);

  const atomsk = findSkill(audit, "atomsk-cli");
  assert.ok(atomsk.findings.some((finding) => finding.code === "missing-quick-recipes-reference"));
  const cms = findSkill(audit, "cms-scripts");
  assert.equal(cms.scope_disposition, "exclude");
  assert.ok(cms.operational_risks.some((risk) => risk.risk === "absolute-path"));
  assert.match(await readFile(path.join(SOURCE_ROOT, "cms-scripts/SKILL.md"), "utf8"), /\/Users\/siyuliu\/Desktop\/tools\/scripts-main/);
  const pymatgen = findSkill(audit, "pymatgen-usage");
  assert.deepEqual(pymatgen.overlaps.map((overlap) => overlap.target_id), ["scientific-agent-skills-pymatgen"]);
  assert.equal(findSkill(audit, "ase").scope, "development-maintenance");
  assert.equal(findSkill(audit, "deepmd-kit").scope, "development-maintenance");
  assert.ok(findSkill(audit, "apex-alloy-workflows").operational_risks.some((risk) => risk.risk === "credential"));
  assert.ok(findSkill(audit, "slurm-workload-manager").operational_risks.some((risk) => risk.risk === "privileged-operation"));
  assert.ok(findSkill(audit, "unimol-ops").operational_risks.some((risk) => risk.risk === "resource-download"));
});

void test("audit remains immutable while production ingestion is separately policy governed", async () => {
  const audit = await readAudit();
  assert.deepEqual(audit.policy, {
    audit_is_admission: false,
    future_change: "ingest-materials-science-skills-for-llm",
    generated_id_prefix: "materials-science-skills-",
    allowed_domains: [
      "materials-engineering",
      "macromolecular-and-materials-chemistry",
      "computational-modeling-and-simulation",
      "research-computing-infrastructure",
    ],
    anzsrc_field_creates_membership: false,
    converter_executes_upstream_content: false,
  });

  const registry = await loadPluginRegistry();
  assert.deepEqual([...registry.vendors.keys()], ["finrobot", "materials-science-skills-for-llm", "scientific-agent-skills", "tooluniverse"]);
  assert.equal(registry.domains.size, 218);
  assert.equal(availableDomains(registry).length, 51);
  assert.equal(registry.vendors.get("materials-science-skills-for-llm")?.skills.length, 7);
  assert.equal(registry.registry.domains.some((domain) => domain.skills.some((skill) => skill.startsWith("materials-science-skills-"))), true);
  await access(path.resolve("skills/plugins/vendors/materials-science-skills-for-llm"));

  const report = await readFile(REPORT_PATH, "utf8");
  assert.match(report, /snapshot-fafd3ab/);
  assert.match(report, /ingest-materials-science-skills-for-llm/);
  assert.match(report, /materials-engineering/);
  assert.match(report, /slurm-workload-manager/);
});

async function readAudit() {
  return MaterialsScienceSkillsAuditSchema.parse(JSON.parse(await readFile(AUDIT_PATH, "utf8")));
}

function findSkill(audit: Awaited<ReturnType<typeof readAudit>>, skillId: string) {
  const item = audit.skills.find((skill) => skill.skill_id === skillId);
  assert.ok(item, skillId);
  return item;
}

function countValues(values: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(result).sort(([left], [right]) => compareText(left, right)));
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en");
}
