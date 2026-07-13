import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const SOURCE_ROOT = path.resolve("vendor/tooluniverse");
const SKILLS_ROOT = path.join(SOURCE_ROOT, "skills");
const AUDIT_PATH = path.resolve("audits/tooluniverse/v1.3.1/skill-audit.json");
const REGISTRY_PATH = path.resolve("skills/plugins/registry.json");
const REVISION = "9b7ff91ddb45b567cac2fa8ea31b82851e877617";
const REPOSITORY_URL = "https://github.com/mims-harvard/ToolUniverse";

const DOMAIN_IDS = new Set([
  "evidence-and-discovery",
  "genomics-and-genetics",
  "omics-and-systems-biology",
  "molecular-and-structural-biology",
  "drug-discovery-and-pharmacology",
  "clinical-and-translational",
  "chemistry-and-toxicology",
  "microbiology-and-ecology",
  "quantitative-and-data-analysis",
]);

void test("ToolUniverse audit pins the official v1.3.1 source", async () => {
  await assertSourceInitialized();
  const audit = await readAudit();

  assert.equal(gitOutput(["rev-parse", "HEAD"]), REVISION);
  assert.equal(gitOutput(["config", "--get", "remote.origin.url"]), REPOSITORY_URL);
  assert.equal(gitOutput(["rev-list", "-n", "1", "v1.3.1"]), REVISION);
  assert.equal(gitOutput(["status", "--porcelain"]), "");
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
  await assertSourceInitialized();
  const audit = await readAudit();
  const sourceIds = await topLevelSkillIds();
  const auditIds = audit.skills.map((item) => item.skill_id);

  assert.equal(sourceIds.length, 150);
  assert.equal(auditIds.length, 150);
  assert.equal(new Set(auditIds).size, auditIds.length);
  assert.deepEqual(auditIds, sourceIds);

  for (const item of audit.skills) {
    assert.equal(item.source_path, `skills/${item.skill_id}`);
    assert.ok(["candidate", "exclude"].includes(item.scope_disposition));
    assert.ok(["standard-adaptation", "needs-curation", "not-applicable"].includes(item.ingest_readiness));
    assert.equal(item.scope_disposition === "candidate", item.primary_domain !== null);
    if (item.primary_domain !== null) assert.ok(DOMAIN_IDS.has(item.primary_domain));
    assert.ok(item.secondary_domains.every((domainId) => DOMAIN_IDS.has(domainId) && domainId !== item.primary_domain));
    assert.equal(new Set(item.secondary_domains).size, item.secondary_domains.length);
    assert.ok(item.findings.every((finding) => ["blocking", "review", "advisory"].includes(finding.severity)));

    const actualResources = await resourceSummary(path.join(SOURCE_ROOT, item.source_path));
    assert.deepEqual(item.resources, actualResources, item.skill_id);

    const skillText = await readFile(path.join(SOURCE_ROOT, item.source_path, "SKILL.md"), "utf8");
    const references = [...new Set(skillText.match(/(?<![a-z0-9-])tooluniverse-[a-z0-9-]+/g) ?? [])]
      .filter((skillId) => sourceIds.includes(skillId) && skillId !== item.skill_id)
      .sort();
    assert.deepEqual(item.cross_skill_references, references, item.skill_id);

    for (const finding of item.findings) {
      assert.ok(finding.evidence.length > 0, `${item.skill_id}:${finding.code}`);
      for (const evidence of finding.evidence) {
        assert.equal(path.isAbsolute(evidence), false);
        assert.equal(evidence.split("/").includes(".."), false);
        await access(path.join(SOURCE_ROOT, evidence));
      }
    }
  }
});

void test("ToolUniverse audit summaries and known findings are reproducible", async () => {
  const audit = await readAudit();
  const candidates = audit.skills.filter((item) => item.scope_disposition === "candidate");
  const excluded = audit.skills.filter((item) => item.scope_disposition === "exclude");
  const candidateIds = new Set(candidates.map((item) => item.skill_id));
  const domainCounts = Object.fromEntries([...DOMAIN_IDS].map((domainId) => [domainId, 0]));
  for (const item of candidates) domainCounts[item.primary_domain as string] += 1;

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
  assert.deepEqual(audit.summary.domain_counts, domainCounts);

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
  const registry = JSON.parse(await readFile(REGISTRY_PATH, "utf8")) as { schema_version?: string; vendors?: Array<{ vendor_id: string; revision: string; skills: unknown[] }>; domains?: unknown[] };
  assert.equal(registry.schema_version, "1");
  assert.equal(registry.vendors?.length, 1);
  assert.equal(registry.vendors?.[0]?.vendor_id, "tooluniverse");
  assert.equal(registry.vendors?.[0]?.revision, REVISION);
  assert.equal(registry.vendors?.[0]?.skills.length, 130);
  assert.equal(registry.domains?.length, 3);
});

async function assertSourceInitialized(): Promise<void> {
  await assert.doesNotReject(
    stat(path.join(SKILLS_ROOT, "README.md")),
    "vendor/tooluniverse is not initialized; run git submodule update --init vendor/tooluniverse",
  );
}

function gitOutput(args: string[]): string {
  return execFileSync("git", ["-C", SOURCE_ROOT, ...args], { encoding: "utf8" }).trim();
}

async function topLevelSkillIds(): Promise<string[]> {
  const entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await access(path.join(SKILLS_ROOT, entry.name, "SKILL.md"));
      result.push(entry.name);
    } catch {
      // Non-Skill directories are outside the top-level Skill inventory.
    }
  }
  return result.sort();
}

async function resourceSummary(skillRoot: string): Promise<AuditResources> {
  const files = await walkFiles(skillRoot);
  const relative = files.map((file) => ({ file, path: path.relative(skillRoot, file).split(path.sep).join("/") }));
  return {
    files: files.length,
    bytes: (await Promise.all(files.map(async (file) => (await stat(file)).size))).reduce((sum, size) => sum + size, 0),
    scripts: relative.filter((item) => item.path.split("/")[0] === "scripts").length,
    tests_or_evals: relative.filter((item) => {
      const name = path.basename(item.path);
      return name.startsWith("test_") || name.endsWith("_test.py") || item.path.split("/")[0] === "evals";
    }).length,
    environment_templates: relative.filter((item) => path.basename(item.path) === ".env.template").length,
  };
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort();
}

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
  primary_domain: string | null;
  secondary_domains: string[];
  resources: AuditResources;
  cross_skill_references: string[];
  findings: AuditFinding[];
}

interface Audit {
  source: Record<string, string>;
  summary: {
    domain_counts: Record<string, number>;
    known_frontmatter_parse_errors: string[];
    known_description_over_1024: string[];
    known_skill_md_over_500_lines: string[];
  };
  skills: AuditSkill[];
}
