import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { loadPluginRegistry } from "../src/plugins/registry.js";
import { loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";
import { VendorAuditRepositorySourceSchema, VendorAuditSourceSchema } from "../src/vendor-audits/contracts.js";
import { FinRobotAuditSchema } from "../src/vendor-audits/finrobot.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";
import { assertAuditSourceInitialized, assertEvidencePaths, gitOutput } from "./helpers/vendor-audit.js";

const SOURCE_ROOT = path.resolve("vendor/finrobot");
const AUDIT_PATH = path.resolve("audits/finrobot/snapshot-2717499/capability-audit.json");
const OLD_AUDIT_PATH = path.resolve("audits/finrobot/snapshot-297a8d2/capability-audit.json");
const REPORT_PATH = path.resolve("audits/finrobot/snapshot-2717499/report.md");
const TAXONOMY_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");
const REVISION = "2717499b8e30f242640af08c4ad9afd1113c2d45";
const REPOSITORY_URL = "https://github.com/AI4Finance-Foundation/FinRobot.git";

void test("FinRobot audit pins the official untagged snapshot without initializing FinNLP", async () => {
  await assertAuditSourceInitialized(SOURCE_ROOT, "LICENSE", "git submodule update --init vendor/finrobot");
  const audit = await readAudit();

  assert.equal(gitOutput(SOURCE_ROOT, ["rev-parse", "HEAD"]), REVISION);
  assert.equal(gitOutput(SOURCE_ROOT, ["config", "--get", "remote.origin.url"]), REPOSITORY_URL);
  assert.equal(gitOutput(SOURCE_ROOT, ["tag", "--points-at", "HEAD"]), "");
  assert.equal(gitOutput(SOURCE_ROOT, ["status", "--porcelain"]), "");
  assert.match(gitOutput(SOURCE_ROOT, ["submodule", "status", "finrobot_autogen/FinNLP"]), /^-587f04f473507ddea6453e43796797fce17155ce /);
  assert.deepEqual(audit.source, {
    source_id: "finrobot",
    name: "FinRobot",
    repository_url: REPOSITORY_URL,
    release: "snapshot-2717499",
    revision: REVISION,
    root_license: "Apache-2.0",
    license_path: "LICENSE",
  });
});

void test("repository source extraction preserves the existing Skill-source contract", () => {
  const repository = {
    source_id: "example",
    name: "Example",
    repository_url: "https://example.com/repository",
    release: "snapshot-example",
    revision: "a".repeat(40),
    root_license: "MIT",
    license_path: "LICENSE",
  };
  assert.deepEqual(VendorAuditRepositorySourceSchema.parse(repository), repository);
  assert.deepEqual(VendorAuditSourceSchema.parse({ ...repository, skill_root: "." }), { ...repository, skill_root: "." });
  assert.throws(() => VendorAuditRepositorySourceSchema.parse({ ...repository, skill_root: "." }));
  assert.throws(() => VendorAuditSourceSchema.parse(repository));
});

void test("audit reproduces all 1049 tracked entries and records 60 upstream Skill documents", async () => {
  const audit = await readAudit();
  const tree = parseGitTree();
  assert.equal(tree.length, 1049);
  assert.deepEqual(audit.source_entries.map((entry) => entry.path), tree.map((entry) => entry.path));
  assert.equal(new Set(audit.source_entries.map((entry) => entry.path)).size, 1049);
  assert.equal(audit.source_entries.filter((entry) => entry.kind === "file").length, 1042);
  assert.equal(audit.source_entries.filter((entry) => entry.kind === "executable").length, 6);
  assert.equal(audit.source_entries.filter((entry) => entry.kind === "gitlink").length, 1);
  assert.equal(audit.source_entries.filter((entry) => path.basename(entry.path) === "SKILL.md").length, 60);
  assert.equal(gitOutput(SOURCE_ROOT, ["ls-files", "--", "*SKILL.md"]).split("\n").length, 60);

  for (const [index, sourceEntry] of audit.source_entries.entries()) {
    const treeEntry = tree[index];
    assert.equal(sourceEntry.git_mode, treeEntry.mode, sourceEntry.path);
    assert.equal(sourceEntry.git_object_id, treeEntry.objectId, sourceEntry.path);
    if (sourceEntry.kind === "gitlink") {
      assert.equal(sourceEntry.path, "finrobot_autogen/FinNLP");
      assert.equal(sourceEntry.bytes, null);
      assert.equal(sourceEntry.sha256, null);
    } else {
      const contents = await readFile(path.join(SOURCE_ROOT, sourceEntry.path));
      assert.equal(sourceEntry.bytes, contents.byteLength, sourceEntry.path);
      assert.equal(sourceEntry.sha256, createHash("sha256").update(contents).digest("hex"), sourceEntry.path);
    }
  }
  assert.equal(audit.summary.file_bytes, 45_380_198);
});

void test("origins and license claims preserve conflicts and external boundaries", async () => {
  const audit = await readAudit();
  assert.deepEqual(audit.content_origins.map((origin) => origin.origin_id), ["attributed-autogen", "external-finnlp", "external-dataset-fixture", "root-apache", "unclear-filings", "unclear-marker", "native-desktop", "anthropic-derived"]);
  assert.equal(audit.content_origins.find((origin) => origin.origin_id === "root-apache")?.content_license.status, "confirmed");
  assert.equal(audit.content_origins.filter((origin) => origin.redistribution_status === "blocked").length, 6);
  assert.equal(audit.license_claims.find((claim) => claim.claim_id === "anthropic-skills-attribution")?.status, "conflicting");
  assert.equal(audit.license_claims.find((claim) => claim.claim_id === "finnlp-external")?.status, "external");
  assert.equal(audit.source_entries.find((entry) => entry.path === "finrobot_autogen/FinNLP")?.content_origin_id, "external-finnlp");
  assert.equal(audit.source_entries.find((entry) => entry.path === "finrobot_autogen/finrobot/functional/coding.py")?.content_origin_id, "attributed-autogen");

  assert.match(await readFile(path.join(SOURCE_ROOT, "LICENSE"), "utf8"), /Apache License/);
  assert.doesNotMatch(await readFile(path.join(SOURCE_ROOT, "setup.py"), "utf8"), /license\s*=\s*"MIT"/);
  for (const origin of audit.content_origins) {
    await assertEvidencePaths(SOURCE_ROOT, origin.scope);
    await assertEvidencePaths(SOURCE_ROOT, origin.content_license.evidence);
  }
  for (const claim of audit.license_claims) {
    await assertEvidencePaths(SOURCE_ROOT, claim.scope);
    await assertEvidencePaths(SOURCE_ROOT, claim.evidence);
  }
});

void test("audit covers 129 source-bound knowledge surfaces and six candidate capabilities", async () => {
  const audit = await readAudit();
  const surfaceIds = audit.knowledge_surfaces.map((surface) => surface.surface_id);
  assert.equal(surfaceIds.length, 129);
  assert.equal(new Set(surfaceIds).size, 129);
  const priorAudit = await readOldAudit();
  const priorSurfaces = priorAudit.knowledge_surfaces.map((surface) => surface.surface_id);
  assert.equal(priorSurfaces.length, 66);
  assert.deepEqual(priorSurfaces, [...priorSurfaces].sort(compareText));
  assert.ok(priorSurfaces.every((surfaceId) => surfaceIds.includes(surfaceId)), "every immutable prior surface must remain in the new audit");
  assert.deepEqual(audit.candidate_capabilities.map((candidate) => candidate.capability_id), [
    "company-fundamentals-analysis",
    "competitive-position-analysis",
    "corporate-risk-analysis",
    "financial-news-impact-analysis",
    "financial-statement-analysis",
    "relative-valuation-analysis",
  ]);

  const fieldIds = new Set((await loadAnzsrcSnapshot(TAXONOMY_PATH)).fields.map((field) => field.code));
  for (const surface of audit.knowledge_surfaces) {
    await assertEvidencePaths(SOURCE_ROOT, [surface.source_path]);
    for (const item of surface.findings) {
      for (const evidencePath of item.evidence) {
        const historical = priorAudit.knowledge_surfaces.find((prior) => prior.surface_id === surface.surface_id)
          ?.findings.some((prior) => prior.code === item.code && prior.evidence.includes(evidencePath));
        if (historical && !audit.source_entries.some((entry) => entry.path === evidencePath)) {
          const priorEntry = priorAudit.source_entries.find((entry) => entry.path === evidencePath);
          assert.ok(priorEntry, evidencePath);
          const currentEntry = audit.source_entries.find((entry) => entry.git_object_id === priorEntry.git_object_id);
          assert.ok(currentEntry, evidencePath);
          assert.equal(currentEntry.sha256, priorEntry.sha256, evidencePath);
          await assertEvidencePaths(SOURCE_ROOT, [currentEntry.path]);
        } else {
          await assertEvidencePaths(SOURCE_ROOT, [evidencePath]);
        }
      }
    }
  }
  for (const candidate of audit.candidate_capabilities) {
    assert.ok(candidate.source_surface_ids.every((surfaceId) => surfaceIds.includes(surfaceId)), candidate.capability_id);
    assert.ok(candidate.primary_anzsrc_field && fieldIds.has(candidate.primary_anzsrc_field), candidate.capability_id);
    assert.ok(candidate.additional_anzsrc_fields.every((field) => fieldIds.has(field)), candidate.capability_id);
    assert.deepEqual(candidate.safety_constraints, [
      "deterministic-calculation",
      "human-review",
      "no-credential-handling",
      "no-personalized-advice",
      "no-provider-assumption",
      "no-transaction-authority",
      "provenance-required",
      "source-freshness-required",
    ]);
    await assertEvidencePaths(SOURCE_ROOT, candidate.content_license.evidence);
    for (const item of candidate.findings) await assertEvidencePaths(SOURCE_ROOT, item.evidence);
  }
  assert.deepEqual(audit.candidate_capabilities.filter((candidate) => candidate.readiness === "blocked-review").map((candidate) => candidate.capability_id), ["financial-news-impact-analysis", "relative-valuation-analysis"]);
});

void test("audit records implementation drift, fixed assumptions, provider risks, and authority limits", async () => {
  const audit = await readAudit();
  const findingCodes = new Set(audit.findings.map((item) => item.code));
  assert.deepEqual(findingCodes, new Set([
    "DATA-FRESHNESS",
    "EXTERNAL-DATA-REDISTRIBUTION",
    "FIXED-ASSUMPTION",
    "IMPLEMENTATION-DOC-DRIFT",
    "NO-TRANSACTION-AUTHORITY",
    "PROVIDER-BINDING",
    "RUNTIME-NOT-DISTRIBUTED",
    "SKILL-RESOURCE-CLOSURE-LOST",
    "THIRD-PARTY-SKILL-ORIGIN-UNVERIFIED",
    "UNINITIALIZED-SUBMODULE",
    "UNKNOWN-ORIGIN",
    "UPSTREAM-SKILLS-PRESENT",
  ]));
  for (const item of audit.findings) await assertEvidencePaths(SOURCE_ROOT, item.evidence);

  const valuation = await readFile(path.join(SOURCE_ROOT, "finrobot_equity/core/src/modules/valuation_engine.py"), "utf8");
  assert.deepEqual([...valuation.matchAll(/^ {4}def (calculate_[a-z_]+_valuation)\(/gm)].map((match) => match[1]), [
    "calculate_ev_ebitda_valuation",
    "calculate_peer_comparison_valuation",
    "calculate_dcf_valuation",
  ]);
  assert.match(valuation, /default_assumptions/);
  assert.match(await readFile(path.join(SOURCE_ROOT, "finrobot_equity/core/src/modules/sensitivity_analyzer.py"), "utf8"), /std_ratio = 0\.15/);
  const sourcePaths = audit.source_entries.map((entry) => entry.path);
  assert.equal(sourcePaths.some((entry) => /(?:^|\/)(?:package\.json|Cargo\.toml)$|\.(?:rs|tsx?)$/.test(entry)), true);

  assert.deepEqual(audit.policy, {
    audit_is_admission: false,
    future_change: "ingest-finrobot",
    source_has_upstream_skills: true,
    nested_gitlinks_initialized: false,
    allowed_domains: ["accounting-auditing-and-accountability", "banking-finance-and-investment"],
    anzsrc_field_creates_membership: false,
    converter_executes_upstream_content: false,
    transaction_authority: false,
    personalized_advice_authority: false,
  });
});

void test("audit remains immutable while production ingestion is separately policy governed", async () => {
  const registry = await loadPluginRegistry();
  assert.deepEqual([...registry.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);
  assert.deepEqual(registry.domains.get("accounting-auditing-and-accountability")?.skills, ["financial-research-company-fundamentals", "financial-research-statement-analysis"]);
  assert.equal(registry.domains.get("banking-finance-and-investment")?.skills.length, 6);
  assert.equal(registry.vendors.get("finrobot")?.skills.length, 6);

  const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.deepEqual(Object.keys(packageJson.scripts).filter((script) => script.startsWith("finrobot:")).sort(), ["finrobot:check", "finrobot:convert", "finrobot:idempotence"]);
  const report = await readFile(REPORT_PATH, "utf8");
  assert.match(report, /snapshot-2717499/);
  assert.match(report, /2717499b8e30f242640af08c4ad9afd1113c2d45/);
  assert.ok(report.length > 500);
});

async function readAudit() {
  return FinRobotAuditSchema.parse(JSON.parse(await readFile(AUDIT_PATH, "utf8")));
}

async function readOldAudit() {
  return FinRobotAuditSchema.parse(JSON.parse(await readFile(OLD_AUDIT_PATH, "utf8")));
}

function parseGitTree(): Array<{ mode: string; objectId: string; path: string }> {
  const output = execFileSync("git", ["-C", SOURCE_ROOT, "ls-tree", "-r", "-z", "HEAD"], { encoding: "utf8" });
  return output.split("\0").filter(Boolean).map((record) => {
    const match = record.match(/^(\d+) \w+ ([a-f0-9]{40})\t(.+)$/s);
    assert.ok(match, record);
    return { mode: match[1], objectId: match[2], path: match[3] };
  }).sort((left, right) => compareCodePoint(left.path, right.path));
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en");
}

function compareCodePoint(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
