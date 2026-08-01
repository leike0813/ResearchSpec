import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import {
  buildEducationAgentSkillsAudit,
  checkEducationAgentSkillsAuditArtifacts,
  classifyEducationAgentSkillsFile,
  EDUCATION_AGENT_SKILLS,
  EducationAgentSkillsAuditSchema,
  EducationEvidenceSchema,
  EducationRelationshipSchema,
  EducationSkillLicenseSchema,
  parseEducationSkillFrontmatter,
  renderEducationAgentSkillsAuditJson,
  renderEducationAgentSkillsReport,
  validateEducationAgentSkillsSnapshotIdentity,
  type EducationAgentSkillsAudit,
} from "../src/vendor-audits/education-agent-skills.js";
import { CLI_TOP_LEVEL_COMMANDS } from "../src/cli/command-catalog.js";
import { gitOutput } from "./helpers/vendor-audit.js";
import { runCli } from "./helpers/cli.js";

const SOURCE_ROOT = path.resolve(EDUCATION_AGENT_SKILLS.sourcePath);
const AUDIT_PATH = path.resolve(EDUCATION_AGENT_SKILLS.auditPath);
const REPORT_PATH = path.resolve(EDUCATION_AGENT_SKILLS.reportPath);
let builtAudit: EducationAgentSkillsAudit | undefined;

void test("Education Agent Skills audit pins the official clean untagged snapshot and rejects all identity drift", () => {
  const identity = {
    revision: gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD"]),
    tree: gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD^{tree}"]),
    remote: gitOutput(SOURCE_ROOT, ["remote", "get-url", "origin"]),
    status: gitOutput(SOURCE_ROOT, ["status", "--porcelain=v1", "--untracked-files=all"]),
    tags: gitOutput(SOURCE_ROOT, ["tag", "--points-at", "HEAD"]),
  };
  assert.doesNotThrow(() => validateEducationAgentSkillsSnapshotIdentity(identity));
  assert.throws(() => validateEducationAgentSkillsSnapshotIdentity({ ...identity, revision: "0".repeat(40) }), /revision drift/);
  assert.throws(() => validateEducationAgentSkillsSnapshotIdentity({ ...identity, tree: "0".repeat(40) }), /tree drift/);
  assert.throws(() => validateEducationAgentSkillsSnapshotIdentity({ ...identity, remote: "https://example.test/wrong" }), /remote drift/);
  assert.throws(() => validateEducationAgentSkillsSnapshotIdentity({ ...identity, status: " M README.md" }), /must be clean/);
  assert.throws(() => validateEducationAgentSkillsSnapshotIdentity({ ...identity, tags: "v2.0.0" }), /must remain an untagged snapshot/);
});

void test("repository inventory covers every tracked file and Skill exactly once with stable hashes and classifications", async () => {
  const audit = getBuiltAudit();
  assert.equal(audit.repository_inventory.tracked_file_count, 238);
  assert.equal(audit.skills.length, 165);
  assert.deepEqual(Object.keys(audit.repository_inventory.classification_counts), [
    "skill-content", "license-provenance", "project-doc", "installer", "mcp-runtime", "maintenance", "test", "generated", "showcase",
  ]);
  const gitPaths = gitOutput(SOURCE_ROOT, ["ls-tree", "-r", "--name-only", "HEAD"]).split("\n").sort(compareText);
  const auditPaths = audit.repository_inventory.files.map((entry) => entry.path);
  assert.deepEqual(auditPaths, gitPaths);
  assert.equal(new Set(auditPaths).size, auditPaths.length);
  assert.ok(auditPaths.every((entry) => !entry.startsWith("/") && !entry.includes("..") && !entry.includes("\\")));
  for (const entry of audit.repository_inventory.files) {
    const bytes = await readFile(path.join(SOURCE_ROOT, entry.path));
    assert.equal(entry.bytes, bytes.length, entry.path);
    assert.equal(entry.sha256, createHash("sha256").update(bytes).digest("hex"), entry.path);
    assert.equal(entry.classification, classifyEducationAgentSkillsFile(entry.path), entry.path);
  }
  const skillPaths = auditPaths.filter((entry) => /^skills\/[^/]+\/[^/]+\/SKILL\.md$/.test(entry));
  assert.deepEqual(audit.skills.map((skill) => skill.source_path), skillPaths);
  assert.equal(new Set(audit.skills.map((skill) => skill.skill_id)).size, 165);
  assert.equal(new Set(audit.skills.map((skill) => skill.generated_id)).size, 165);
  const invalid = structuredClone(audit);
  if (invalid.repository_inventory.files[0] && invalid.repository_inventory.files[1]) invalid.repository_inventory.files[1].path = invalid.repository_inventory.files[0].path;
  assert.throws(() => EducationAgentSkillsAuditSchema.parse(invalid), /inventory paths must be unique|Skill records must exactly cover/);
});

void test("frontmatter parser preserves the standard and upstream sections and rejects malformed representatives", async () => {
  const normal = parseEducationSkillFrontmatter(await readFile(path.join(SOURCE_ROOT, "skills/memory-learning-science/spaced-practice-scheduler/SKILL.md"), "utf8"));
  assert.deepEqual(normal.standard.keys, ["name", "description", "disable-model-invocation", "user-invocable", "effort"]);
  assert.equal(normal.upstream.value.skill_id, "memory-learning-science/spaced-practice-scheduler");
  const student = parseEducationSkillFrontmatter(await readFile(path.join(SOURCE_ROOT, "skills/student-learning/ai-claim-checker/SKILL.md"), "utf8"));
  assert.equal(student.upstream.value.audience, "student");
  assert.equal("output_schema" in student.upstream.value, false);
  assert.throws(() => parseEducationSkillFrontmatter("---\nname: x\nname: y\n---\n"), /Invalid SKILL.md frontmatter/);
  assert.throws(() => parseEducationSkillFrontmatter("---\nname: x\ndescription: y\ndisable-model-invocation: false\nuser-invocable: true\neffort: low\n---\n"), /standard and upstream metadata sections/);
});

void test("evidence, license, and relationship schemas preserve unresolved and conflicting review states without permissive defaults", async () => {
  const audit = await readAudit();
  const evidence = audit.evidence[0];
  const license = audit.skills[0]?.license;
  const relationship = audit.relationships.find((entry) => entry.resolution === "missing");
  assert.ok(evidence && license && relationship);
  assert.throws(() => EducationEvidenceSchema.parse({ ...evidence, evidence_strength: "strong" }));
  assert.doesNotThrow(() => EducationEvidenceSchema.parse({ ...evidence, existence: "conflicting", author_match: "conflicting", year_match: "conflicting", title_match: "conflicting", support_scope: "conflicting", misattribution: "conflicting", evidence_strength: "conflicting" }));
  const licenseWithoutEvidence: Partial<typeof license> = { ...license };
  delete licenseWithoutEvidence.evidence;
  assert.throws(() => EducationSkillLicenseSchema.parse(licenseWithoutEvidence));
  assert.doesNotThrow(() => EducationRelationshipSchema.parse(relationship));
  assert.throws(() => EducationRelationshipSchema.parse({ ...relationship, hard_dependency: true }));
});

void test("all named evidence, relationships, provenance, overlaps, risks, and prospective domains carry explicit conclusions", async () => {
  const audit = await readAudit();
  assert.deepEqual(audit.summary, {
    tracked_files: 238,
    skills: 165,
    upstream_domains: 20,
    prospective_domains: 3,
    evidence_declarations: 872,
    distinct_evidence_strings: 737,
    evidence_strength_counts: { verified: 0, partial: 216, unverified: 656, conflicting: 0 },
    relationships: 813,
    unresolved_relationships: 17,
    license_status_counts: { clear: 0, conditional: 0, unresolved: 165 },
    recommendation_counts: { candidate: 0, defer: 0, exclude: 165 },
    risk_counts: { minors: 164, privacy: 24, "learning-analytics": 16, wellbeing: 70, diagnosis: 1, "original-framework": 19 },
    blocking_findings: 2,
  });
  assert.ok(audit.evidence.every((entry) => entry.review_basis && entry.blocker && entry.source_sha256));
  const evidenceWithoutYear = audit.evidence.filter((entry) => entry.parsed_identity.years.length === 0);
  assert.equal(evidenceWithoutYear.length, 9);
  assert.ok(evidenceWithoutYear.every((entry) => entry.year_match === "unverified"));
  assert.ok(audit.relationships.every((entry) => entry.future_semantics === "advisory" && !entry.hard_dependency && entry.conclusion));
  assert.ok(audit.relationships.some((entry) => entry.resolution === "resolved" && entry.resolved_target_skill_id));
  assert.ok(audit.relationships.some((entry) => entry.resolution === "missing" && entry.resolved_target_skill_id === null));
  assert.ok(audit.skills.every((skill) => skill.license.status === "unresolved" && skill.license.conclusion));
  assert.ok(audit.skills.every((skill) => skill.provenance.length >= 1 && skill.contributors.length >= 1));
  assert.ok(audit.skills.every((skill) => skill.overlaps.length === 6 && new Set(skill.overlaps.map((entry) => entry.target)).size === 6));
  assert.ok(audit.skills.every((skill) => skill.risks.length === 6 && new Set(skill.risks.map((entry) => entry.risk)).size === 6));
  assert.ok(audit.skills.every((skill) => skill.prospective_domains.every((domain) => domain.manual_reviewed && domain.rationale)));
  assert.ok(audit.skills.every((skill) => skill.recommendation.disposition === "exclude" && skill.recommendation.blockers.length >= 1));
  assert.ok(audit.skills.some((skill) => skill.recommendation.content_fit_without_license_blocker === "candidate"));
  assert.ok(audit.skills.some((skill) => skill.recommendation.content_fit_without_license_blocker === "defer"));
  const student = audit.skills.filter((skill) => skill.audience.kind === "student-facing");
  assert.equal(student.length, 13);
  assert.ok(student.every((skill) => skill.risks.find((risk) => risk.risk === "minors")?.status === "present"));
  assert.ok(audit.skills.filter((skill) => skill.skill_id.startsWith("original-frameworks/")).every((skill) => skill.risks.find((risk) => risk.risk === "original-framework")?.status === "present"));
});

void test("audit generation and the JSON-derived report are byte-identical and checked-in artifacts validate strictly", async () => {
  const first = getBuiltAudit();
  const second = buildEducationAgentSkillsAudit(path.resolve("."));
  const firstJson = renderEducationAgentSkillsAuditJson(first);
  const secondJson = renderEducationAgentSkillsAuditJson(second);
  const firstReport = renderEducationAgentSkillsReport(first);
  assert.equal(secondJson, firstJson);
  assert.equal(renderEducationAgentSkillsReport(second), firstReport);
  assert.equal(await readFile(AUDIT_PATH, "utf8"), firstJson);
  assert.equal(await readFile(REPORT_PATH, "utf8"), firstReport);
  assert.doesNotThrow(() => EducationAgentSkillsAuditSchema.parse(JSON.parse(firstJson)));
  const driftedJson = `${firstJson} `;
  const driftedReport = `${firstReport} `;
  assert.deepEqual(checkEducationAgentSkillsAuditArtifacts(driftedJson, driftedReport, firstJson, firstReport), [
    `${EDUCATION_AGENT_SKILLS.auditPath} differs from the deterministic audit.`,
    `${EDUCATION_AGENT_SKILLS.reportPath} differs from the JSON-derived report.`,
  ]);
  assert.equal(driftedJson.endsWith(" "), true);
  assert.equal(driftedReport.endsWith(" "), true);
});

void test("approved ingestion publishes only reviewed static Skills without changing the public CLI", async () => {
  const registry = JSON.parse(await readFile(path.resolve("skills/plugins/registry.json"), "utf8")) as { vendors: Array<{ vendor_id: string }> };
  assert.deepEqual(registry.vendors.map((vendor) => vendor.vendor_id), ["education-agent-skills", "finrobot", "histagent", "materials-science-skills-for-llm", "scientific-agent-skills", "tooluniverse"]);
  const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as { files: string[]; scripts: Record<string, string> };
  assert.equal(packageJson.files.some((entry) => entry === "vendor" || entry.startsWith("vendor/") || entry === "audits" || entry.startsWith("audits/")), false);
  assert.ok(packageJson.files.includes("!dist/src/vendor-converters/education-agent-skills"));
  assert.deepEqual(Object.keys(packageJson.scripts).filter((name) => name.startsWith("education-agent-skills:")).sort(compareText), [
    "education-agent-skills:audit",
    "education-agent-skills:audit:check",
    "education-agent-skills:check",
    "education-agent-skills:convert",
    "education-agent-skills:evidence:check",
    "education-agent-skills:idempotence",
    "education-agent-skills:preview",
  ]);
  const report = await readFile(REPORT_PATH, "utf8");
  assert.match(report, /`ingest-education-agent-skills`/);
  assert.match(report, /ANZSRC Group/);
  assert.match(report, /来源哈希绑定批准|source-hash-bound approval/);
  const help = runCli(["--help"]);
  assert.equal(help.status, 0);
  assert.equal(CLI_TOP_LEVEL_COMMANDS.length, 16);
  for (const command of CLI_TOP_LEVEL_COMMANDS) assert.match(help.stdout, new RegExp(`\\b${command.id}\\b`));
  assert.doesNotMatch(help.stdout, /\bsubmit\b/);
  assert.doesNotMatch(help.stdout, /education-agent-skills/);
});

function getBuiltAudit(): EducationAgentSkillsAudit {
  builtAudit ??= buildEducationAgentSkillsAudit(path.resolve("."));
  return builtAudit;
}

async function readAudit(): Promise<EducationAgentSkillsAudit> {
  return EducationAgentSkillsAuditSchema.parse(JSON.parse(await readFile(AUDIT_PATH, "utf8")));
}

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
