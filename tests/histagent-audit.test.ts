import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { loadPluginRegistry } from "../src/plugins/registry.js";
import { loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";
import { HistAgentAuditSchema } from "../src/vendor-audits/histagent.js";
import { assertAuditSourceInitialized, assertEvidencePaths, gitOutput } from "./helpers/vendor-audit.js";

const SOURCE_ROOT = path.resolve("vendor/histagent");
const AUDIT_PATH = path.resolve("audits/histagent/snapshot-47bbe21/capability-audit.json");
const REPORT_PATH = path.resolve("audits/histagent/snapshot-47bbe21/report.md");
const TAXONOMY_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");
const REVISION = "47bbe21dc81618489f5d5929358032883a3fe448";
const REPOSITORY_URL = "https://github.com/CharlesQ9/HistAgent";
const ENTRY_SET_SHA256 = "04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02";
const COOKIE_SHA256 = "527392dc67924e2f7512f0c60c677edfebdd51dfc430d357abebe3b6d5583e12";

void test("HistAgent audit pins the official clean untagged snapshot", async () => {
  await assertAuditSourceInitialized(SOURCE_ROOT, "LICENSE", "git submodule update --init vendor/histagent");
  const audit = await readAudit();

  assert.equal(gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["config", "--get", "remote.origin.url"]), REPOSITORY_URL);
  assert.equal(gitOutput(SOURCE_ROOT, ["tag", "--points-at", "HEAD"]), "");
  assert.equal(gitOutput(SOURCE_ROOT, ["status", "--porcelain"]), "");
  assert.equal(gitOutput(SOURCE_ROOT, ["ls-files", "--", "*SKILL.md"]), "");
  assert.deepEqual(audit.source, {
    source_id: "histagent",
    name: "HistAgent",
    repository_url: REPOSITORY_URL,
    release: "snapshot-47bbe21",
    revision: REVISION,
    root_license: "Apache-2.0 with per-origin review",
    license_path: "LICENSE",
  });
});

void test("audit reproduces all 120 entries and the canonical set hash without reading Cookie content", async () => {
  const audit = await readAudit();
  const tree = parseGitTree();
  assert.equal(tree.length, 120);
  assert.equal(audit.summary.file_bytes, 3_632_711);
  assert.deepEqual(audit.source_entries.map((entry) => entry.path), tree.map((entry) => entry.path));
  assert.equal(new Set(audit.source_entries.map((entry) => entry.path)).size, 120);

  for (const [index, entry] of audit.source_entries.entries()) {
    const treeEntry = tree[index];
    assert.equal(entry.kind, "file", entry.path);
    assert.equal(entry.git_mode, treeEntry.mode, entry.path);
    assert.equal(entry.git_object_id, treeEntry.objectId, entry.path);
    if (entry.path === "scripts/cookies.py") continue;
    const contents = await readFile(path.join(SOURCE_ROOT, entry.path));
    assert.equal(entry.bytes, contents.byteLength, entry.path);
    assert.equal(entry.sha256, createHash("sha256").update(contents).digest("hex"), entry.path);
  }

  const manifest = audit.source_entries.map((entry) => `${entry.sha256}  ${entry.path}\n`).join("");
  assert.equal(createHash("sha256").update(manifest).digest("hex"), ENTRY_SET_SHA256);
  assert.equal(audit.summary.tracked_entry_set_sha256, ENTRY_SET_SHA256);
});

void test("Cookie failure contains safe metadata only", async () => {
  const audit = await readAudit();
  const cookie = audit.source_entries.find((entry) => entry.path === "scripts/cookies.py");
  assert.ok(cookie);
  assert.deepEqual(Object.keys(cookie).sort(), [
    "bytes",
    "content_origin_id",
    "disposition",
    "git_mode",
    "git_object_id",
    "kind",
    "path",
    "sha256",
  ]);
  assert.equal(cookie.git_object_id, "8e42333561e5b2e72e84b3ed02bb0468b6047cd2");
  assert.equal(cookie.bytes, 23_304);
  assert.equal(cookie.sha256, COOKIE_SHA256);
  assert.equal(cookie.disposition, "confirmed-failure");
  assert.equal(audit.security_findings.find((item) => item.code === "COOKIE-PAYLOAD")?.disposition, "confirmed-failure");

  const report = await readFile(REPORT_PATH, "utf8");
  assert.match(report, /scripts\/cookies\.py/);
  assert.match(report, /COOKIE-PAYLOAD/);
});

void test("origins, licenses, authorities, resources, findings, and surfaces have complete evidence", async () => {
  const audit = await readAudit();
  assert.deepEqual(audit.summary.source_dispositions, {
    retain: 6,
    adapt: 16,
    replace: 3,
    exclude: 94,
    "confirmed-failure": 1,
  });

  for (const origin of audit.content_origins) {
    await assertEvidencePaths(SOURCE_ROOT, origin.scope);
    await assertEvidencePaths(SOURCE_ROOT, origin.content_license.evidence);
  }
  for (const claim of audit.license_claims) {
    await assertEvidencePaths(SOURCE_ROOT, claim.scope);
    await assertEvidencePaths(SOURCE_ROOT, claim.evidence);
  }
  for (const authority of audit.runtime_authorities) await assertEvidencePaths(SOURCE_ROOT, authority.evidence);
  for (const resource of audit.external_resources) await assertEvidencePaths(SOURCE_ROOT, resource.evidence);
  for (const finding of audit.security_findings) await assertEvidencePaths(SOURCE_ROOT, finding.evidence);
  for (const surface of audit.knowledge_surfaces) {
    await assertEvidencePaths(SOURCE_ROOT, [surface.source_path]);
    for (const finding of surface.findings) await assertEvidencePaths(SOURCE_ROOT, finding.evidence);
  }
  for (const candidate of audit.candidate_skills) {
    await assertEvidencePaths(SOURCE_ROOT, candidate.content_license.evidence);
    for (const relationship of candidate.advisory_relationships) await assertEvidencePaths(SOURCE_ROOT, relationship.evidence);
    for (const overlap of candidate.overlaps) await assertEvidencePaths(SOURCE_ROOT, overlap.evidence);
    for (const finding of candidate.findings) await assertEvidencePaths(SOURCE_ROOT, finding.evidence);
  }

  assert.equal(audit.source_entries.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.content_origins.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.license_claims.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.runtime_authorities.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.external_resources.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.security_findings.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.knowledge_surfaces.every((entry) => typeof entry.disposition === "string"), true);
  assert.equal(audit.candidate_skills.every((entry) => entry.disposition === "adapt"), true);

  const attributedFiles = [
    "scripts/agent_web_browser.py",
    "scripts/image_web_browser.py",
    "scripts/mdconvert.py",
    "scripts/reformulator.py",
    "scripts/text_web_browser.py",
  ];
  assert.deepEqual(audit.content_origins.find((origin) => origin.origin_id === "microsoft-autogen")?.scope, attributedFiles);
  assert.deepEqual(audit.license_claims.find((claim) => claim.claim_id === "autogen-derived-mit")?.scope, attributedFiles);
  for (const sourcePath of attributedFiles) {
    assert.equal(audit.source_entries.find((entry) => entry.path === sourcePath)?.content_origin_id, "microsoft-autogen");
    assert.equal(
      audit.knowledge_surfaces.filter((surface) => surface.source_path === sourcePath).every((surface) => surface.content_origin_id === "microsoft-autogen"),
      true,
    );
  }
});

void test("three prospective Skills preserve domains, source layers, and advisory-only composition", async () => {
  const audit = await readAudit();
  const candidates = audit.candidate_skills;
  assert.deepEqual(candidates.map((candidate) => candidate.skill_id), [
    "histagent-historical-research",
    "histagent-historical-source-identification",
    "histagent-historical-source-analysis",
  ]);
  assert.deepEqual(candidates.map((candidate) => candidate.prospective_domains), [
    ["historical-studies"],
    ["heritage-archive-and-museum-studies", "historical-studies"],
    ["heritage-archive-and-museum-studies", "historical-studies"],
  ]);

  const fields = new Set((await loadAnzsrcSnapshot(TAXONOMY_PATH)).fields.map((field) => field.code));
  const surfaceIds = new Set(audit.knowledge_surfaces.map((surface) => surface.surface_id));
  const outputLayers = [
    "raw-observation-or-ocr",
    "normalized-transcription",
    "emendation",
    "translation",
    "interpretation",
  ];
  for (const candidate of candidates) {
    assert.deepEqual(candidate.hard_dependencies, []);
    assert.deepEqual(candidate.output_layers, outputLayers);
    assert.equal(candidate.implementation_strategy, "self-contained-executable-capability-reimplementation");
    assert.equal(candidate.execution_contract.self_contained, true);
    assert.deepEqual(candidate.execution_contract.extensions, candidate.skill_id === "histagent-historical-research"
      ? ["script-assisted", "resource-backed", "stateful"]
      : ["script-assisted", "resource-backed"]);
    assert.equal(candidate.execution_contract.resource_library, "lib/historical_support.py");
    assert.equal(candidate.execution_contract.cli_contract, "conventional-command-options-and-domain-files");
    assert.equal(candidate.execution_contract.success_contract, "command-specific-json-and-artifacts");
    assert.equal(candidate.execution_contract.failure_contract, "nonzero-exit-stderr-error-object");
    assert.equal(candidate.execution_contract.dependency_policy, "documented-user-managed-no-auto-install");
    assert.ok(candidate.execution_contract.commands.length > 0);
    assert.equal(candidate.advisory_relationships.every((relationship) => relationship.relation === "advisory"), true);
    assert.equal(candidate.source_surface_ids.every((surfaceId) => surfaceIds.has(surfaceId)), true);
    assert.ok(candidate.primary_anzsrc_field && fields.has(candidate.primary_anzsrc_field));
    assert.equal(candidate.additional_anzsrc_fields.every((field) => fields.has(field)), true);
  }
});

void test("audit remains non-admission while the separately approved converter owns production", async () => {
  const audit = await readAudit();
  assert.deepEqual(audit.policy, {
    audit_is_admission: false,
    future_change: "ingest-histagent",
    source_has_upstream_skills: false,
    generated_production_skills: false,
    converter_executes_upstream_content: false,
    parallel_ingest_preparation_allowed: true,
    production_requires_audit_validation: true,
    production_requires_hash_bound_human_review: true,
    benchmark_content_admitted: false,
    tool_domain_membership: false,
    explicit_invocation_authorizes_configured_providers_and_task_materials: true,
    access_control_owned_by_host: true,
    culture_specific_policy_added: false,
    allowed_domains: ["heritage-archive-and-museum-studies", "historical-studies"],
    anzsrc_field_creates_membership: false,
  });

  const registry = await loadPluginRegistry();
  assert.deepEqual([...registry.vendors.keys()], ["finrobot", "histagent", "materials-science-skills-for-llm", "scientific-agent-skills", "tooluniverse"]);
  assert.equal(registry.vendors.get("histagent")?.skills.length, 3);
  assert.equal(registry.domains.get("historical-studies")?.skills.filter((skill) => skill.startsWith("histagent-")).length, 3);
  assert.equal(registry.domains.get("heritage-archive-and-museum-studies")?.skills.filter((skill) => skill.startsWith("histagent-")).length, 2);

  const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as { files: string[]; scripts: Record<string, string> };
  assert.deepEqual(Object.keys(packageJson.scripts).filter((script) => script.startsWith("histagent:")).sort(), ["histagent:check", "histagent:convert", "histagent:idempotence"]);
  assert.equal(packageJson.files.some((entry) => entry === "audits" || entry.startsWith("audits/") || entry === "vendor" || entry.startsWith("vendor/")), false);
  await access(path.resolve("src/vendor-converters/histagent"));
  await access(path.resolve("src/vendor-converters/histagent/review-decision.json"));
  await access(path.resolve("skills/plugins/vendors/histagent"));

  const report = await readFile(REPORT_PATH, "utf8");
  assert.match(report, /snapshot-47bbe21/);
  assert.match(report, /ingest-histagent/);
  assert.ok(report.length > 1_000);
});

async function readAudit() {
  return HistAgentAuditSchema.parse(JSON.parse(await readFile(AUDIT_PATH, "utf8")));
}

function parseGitTree(): Array<{ mode: "100644"; objectId: string; path: string }> {
  const output = execFileSync("git", ["-C", SOURCE_ROOT, "ls-tree", "-r", "-z", "HEAD"], { encoding: "utf8" });
  return output.split("\0").filter(Boolean).map((record) => {
    const match = record.match(/^(100644) blob ([a-f0-9]{40})\t(.+)$/s);
    assert.ok(match, record);
    return { mode: "100644" as const, objectId: match[2], path: match[3] };
  }).sort((left, right) => compareCodePoint(left.path, right.path));
}

function compareCodePoint(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
