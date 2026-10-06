import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const maintenanceScript = path.join(root, "scripts/own-vendor-maintenance.mjs");
const FIXTURE_VENDOR = "fixture-vendor";
const FIXTURE_ANCHOR = "snapshot-fixture";
const FIXTURE_GUARD = "hooks/fixture/guard.md";
const FIXTURE_INJECT = "hooks/fixture/inject.cjs";

void test("own-vendor maintenance skill documents both vendors and the add-vendor path", async () => {
  const skill = await readFile(path.join(root, ".agents/skills/own-vendor-maintenance/SKILL.md"), "utf8");
  assert.match(skill, /paper-humanizer/);
  assert.match(skill, /revision-master/);
  assert.match(skill, /add-vendor/);
  assert.match(skill, /audits\/own-vendors\/catalog\.json/);
  assert.match(skill, /Agent 语义审阅门/);
  assert.match(skill, /05-semantic-review\.md/);
});

void test("own-vendor catalog declares the two current vendors", async () => {
  const catalog = JSON.parse(await readFile(path.join(root, "audits/own-vendors/catalog.json"), "utf8")) as {
    schema_version: string;
    vendors: Array<{ vendor_id: string; anchor_id: string; capability_ids: string[]; delivery_assets?: string[] }>;
  };
  assert.equal(catalog.schema_version, "1");
  assert.equal(catalog.vendors.length, 2);
  assert.deepEqual(catalog.vendors.map((item) => item.vendor_id), ["paper-humanizer", "revision-master"]);
  assert.deepEqual(catalog.vendors[0]?.capability_ids.length, 4);
  assert.deepEqual(catalog.vendors[1]?.capability_ids.length, 5);
  assert.deepEqual(catalog.vendors[0]?.delivery_assets, ["hooks/paper-humanizer/guard.md", "hooks/paper-humanizer/inject.cjs", "hooks/paper-humanizer/LICENSE"]);
  assert.equal(catalog.vendors[1]?.delivery_assets, undefined);
});

void test("own-vendor anchors contain generated records and completed semantic reviews", async () => {
  const catalog = JSON.parse(await readFile(path.join(root, "audits/own-vendors/catalog.json"), "utf8")) as {
    vendors: Array<{ vendor_id: string; anchor_id: string }>;
  };
  for (const { vendor_id: vendor, anchor_id: anchor } of catalog.vendors) {
    const dir = path.join(root, "audits/own-vendors", vendor, anchor);
    const analysis = await readFile(path.join(dir, "01-analysis.md"), "utf8");
    const ingestion = await readFile(path.join(dir, "02-ingestion.md"), "utf8");
    const conversion = await readFile(path.join(dir, "03-conversion.md"), "utf8");
    const review = await readFile(path.join(dir, "04-review.md"), "utf8");
    const semantic = await readFile(path.join(dir, "05-semantic-review.md"), "utf8");
    assert.match(analysis, /Own Vendor Anchor Analysis/);
    assert.match(ingestion, vendor === "paper-humanizer" ? /PH-CAP-01/ : /RM-CAP-01/);
    assert.match(conversion, vendor === "paper-humanizer" ? /check-paper-humanization-review/ : /design-review-response-intake/);
    assert.match(review, /Parity Summary/);
    assert.doesNotMatch(semantic, /\[NOT-COMPLETED\]/);
    assert.match(semantic, /## 结论/);
    assert.match(semantic, /declared-fit/);
  }
});

void test("own-vendor maintenance check passes for every current anchor", async () => {
  const catalog = JSON.parse(await readFile(path.join(root, "audits/own-vendors/catalog.json"), "utf8")) as {
    vendors: Array<{ vendor_id: string; anchor_id: string }>;
  };
  const stdout = execFileSync(process.execPath, ["scripts/own-vendor-maintenance.mjs", "check"], { encoding: "utf8" });
  assert.deepEqual(stdout.trim().split("\n"), catalog.vendors.map(({ vendor_id, anchor_id }) => `OK ${vendor_id}@${anchor_id}`));
});

void test("package scripts expose the own-vendor maintenance loop", async () => {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts["own-vendor-maintenance:artifacts"] ?? "", /own-vendor-maintenance\.mjs artifacts/);
  assert.match(pkg.scripts["own-vendor-maintenance:records"] ?? "", /own-vendor-maintenance\.mjs records/);
  assert.match(pkg.scripts["own-vendor-maintenance:baseline"] ?? "", /own-vendor-maintenance\.mjs baseline/);
  assert.match(pkg.scripts["own-vendor-maintenance:check"] ?? "", /own-vendor-maintenance\.mjs check/);
});

const GUARD_BODY = "# fixture guard\n";
const INJECT_BODY = "module.exports = {};\n";

function fixtureSha(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function fixtureCatalog(deliveryAssets?: unknown): Record<string, unknown> {
  const vendor: Record<string, unknown> = {
    vendor_id: FIXTURE_VENDOR,
    release_label: FIXTURE_ANCHOR,
    anchor_id: FIXTURE_ANCHOR,
    source_meta: "vendor/fixture/SOURCE.json",
    upstream_root: "vendor/fixture/upstream",
    extraction_index: "authoring/fixture/extraction-index.json",
    author_script: "fixture:author",
    capability_ids: ["fixture-capability"],
  };
  if (deliveryAssets !== undefined) vendor.delivery_assets = deliveryAssets;
  return { schema_version: "1", catalog_id: "fixture", vendors: [vendor] };
}

async function writeText(file: string, content: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await writeText(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function createFixture(deliveryAssets?: unknown): Promise<string> {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "researchspec-own-vendor-"));
  const manifestYaml = [
    "capability_id: fixture-capability",
    "title: Fixture Capability",
    "class: generation",
    "node_kind: producer",
    "execution_type: llm",
    "gate_policy: none",
    "maturity: operational",
    "inputs: []",
    "outputs: []",
    "knowledge_refs: []",
    "validators: []",
    "",
  ].join("\n");
  await writeJson(path.join(fixtureRoot, "vendor/fixture/SOURCE.json"), { commit: "fixture-commit" });
  await writeText(path.join(fixtureRoot, "vendor/fixture/upstream/readme.md"), "# fixture upstream\n");
  await writeJson(path.join(fixtureRoot, "authoring/fixture/extraction-index.json"), {
    artifact_count: 1,
    verification_summary: { pass: 1, fail: 0, error: 0 },
    artifacts: [{ artifact_id: "FX-01", milestone: "conversion", kind: "skill", path: "skills/fixture/SKILL.md", sha256: "0".repeat(64) }],
  });
  await writeText(path.join(fixtureRoot, "skills/capabilities/fixture-capability/manifest.yaml"), manifestYaml);
  await writeText(path.join(fixtureRoot, "skills/capabilities/fixture-capability/SKILL.md"), "# Fixture capability\n");
  await writeJson(path.join(fixtureRoot, "skills/capabilities/registry.json"), {
    capabilities: [{ capability_id: "fixture-capability", source_path: "fixture-capability", manifest_sha256: fixtureSha(manifestYaml) }],
  });
  await writeJson(path.join(fixtureRoot, "artifacts/generated/capability-parity-report.json"), {
    packages: [{
      capability_id: "fixture-capability",
      maturity: "operational",
      section_coverage: 1,
      rule_coverage: 1,
      output_format_preserved: true,
      knowledge_coverage: 1,
      knowledge_refs_referenced: 1,
      flow_sections_retained: [],
      skill_lines: 12,
      knowledge_refs: 0,
    }],
  });
  await writeText(path.join(fixtureRoot, ".agents/skills/own-vendor-maintenance/SKILL.md"), "# fixture maintenance skill\n");
  await writeText(path.join(fixtureRoot, FIXTURE_GUARD), GUARD_BODY);
  await writeText(path.join(fixtureRoot, FIXTURE_INJECT), INJECT_BODY);
  await writeJson(path.join(fixtureRoot, "audits/own-vendors/catalog.json"), fixtureCatalog(deliveryAssets));
  return fixtureRoot;
}

interface MaintenanceResult {
  status: number;
  stdout: string;
  stderr: string;
}

function runMaintenance(fixtureRoot: string, ...args: string[]): MaintenanceResult {
  const options: { cwd: string; encoding: "utf8" } = { cwd: fixtureRoot, encoding: "utf8" };
  const result = spawnSync(process.execPath, [maintenanceScript, ...args], options);
  return { status: result.status ?? -1, stdout: result.stdout, stderr: result.stderr };
}

async function completeFixtureReview(fixtureRoot: string): Promise<void> {
  await writeText(path.join(fixtureRoot, "audits", "own-vendors", FIXTURE_VENDOR, FIXTURE_ANCHOR, "05-semantic-review.md"), "# Fixture semantic review\n\n## 结论\n\ndeclared-fit\n");
}

async function readFixtureManifest(fixtureRoot: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path.join(fixtureRoot, "audits", "own-vendors", FIXTURE_VENDOR, FIXTURE_ANCHOR, "manifest.json"), "utf8")) as Record<string, unknown>;
}

void test("own-vendor delivery assets freeze raw byte identities and fail check on asset drift", async () => {
  const fixtureRoot = await createFixture([FIXTURE_GUARD, FIXTURE_INJECT]);
  try {
    const records = runMaintenance(fixtureRoot, "records", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(records.status, 0, records.stderr);
    const anchorDir = path.join(fixtureRoot, "audits", "own-vendors", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    for (const name of ["03-conversion.md", "04-review.md"]) {
      const text = await readFile(path.join(anchorDir, name), "utf8");
      assert.match(text, /## Delivery Assets/);
      assert.ok(text.includes(`| \`${FIXTURE_GUARD}\` | \`${fixtureSha(GUARD_BODY)}\` |`));
      assert.ok(text.includes(`| \`${FIXTURE_INJECT}\` | \`${fixtureSha(INJECT_BODY)}\` |`));
    }
    await completeFixtureReview(fixtureRoot);
    const baseline = runMaintenance(fixtureRoot, "baseline", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(baseline.status, 0, baseline.stderr);
    const manifest = await readFixtureManifest(fixtureRoot);
    assert.deepEqual(manifest["delivery"], {
      assets: [
        { path: FIXTURE_GUARD, sha256: fixtureSha(GUARD_BODY) },
        { path: FIXTURE_INJECT, sha256: fixtureSha(INJECT_BODY) },
      ],
    });
    const ok = runMaintenance(fixtureRoot, "check", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(ok.stdout.trim(), `OK ${FIXTURE_VENDOR}@${FIXTURE_ANCHOR}`);

    await writeText(path.join(fixtureRoot, FIXTURE_GUARD), "# drifted guard\n");
    const drifted = runMaintenance(fixtureRoot, "check", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(drifted.status, 1);
    assert.match(drifted.stderr, /^FAIL /m);
    assert.match(drifted.stderr, /delivery: expected/);
    assert.ok(drifted.stderr.includes(FIXTURE_GUARD));
    assert.doesNotMatch(drifted.stderr, /conversion/);

    await writeText(path.join(fixtureRoot, FIXTURE_GUARD), GUARD_BODY);
    assert.equal(runMaintenance(fixtureRoot, "check", FIXTURE_VENDOR, FIXTURE_ANCHOR).status, 0);

    await writeJson(path.join(fixtureRoot, "audits/own-vendors/catalog.json"), fixtureCatalog());
    const removed = runMaintenance(fixtureRoot, "check", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(removed.status, 1);
    assert.match(removed.stderr, /delivery: expected .*, actual undefined/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

void test("own-vendor without delivery declaration stays unchanged and detects a later declaration", async () => {
  const fixtureRoot = await createFixture();
  try {
    const records = runMaintenance(fixtureRoot, "records", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(records.status, 0, records.stderr);
    const anchorDir = path.join(fixtureRoot, "audits", "own-vendors", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    for (const name of ["03-conversion.md", "04-review.md"]) {
      assert.doesNotMatch(await readFile(path.join(anchorDir, name), "utf8"), /## Delivery Assets/);
    }
    await completeFixtureReview(fixtureRoot);
    const baseline = runMaintenance(fixtureRoot, "baseline", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(baseline.status, 0, baseline.stderr);
    assert.equal((await readFixtureManifest(fixtureRoot))["delivery"], undefined);
    assert.equal(runMaintenance(fixtureRoot, "check", FIXTURE_VENDOR, FIXTURE_ANCHOR).status, 0);

    await writeJson(path.join(fixtureRoot, "audits/own-vendors/catalog.json"), fixtureCatalog([FIXTURE_GUARD, FIXTURE_INJECT]));
    const added = runMaintenance(fixtureRoot, "check", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(added.status, 1);
    assert.match(added.stderr, /delivery: expected undefined/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

void test("own-vendor delivery declarations reject unsafe, duplicate, missing and non-regular assets", async () => {
  const fixtureRoot = await createFixture();
  try {
    const catalogPath = path.join(fixtureRoot, "audits/own-vendors/catalog.json");
    const cases: Array<{ assets: unknown; pattern: RegExp }> = [
      { assets: ["hooks/../outside.md"], pattern: /Unsafe delivery asset path/ },
      { assets: ["/etc/hostname"], pattern: /Unsafe delivery asset path/ },
      { assets: [FIXTURE_GUARD, FIXTURE_GUARD], pattern: /Duplicate delivery asset path/ },
      { assets: ["hooks/fixture/missing.md"], pattern: /Missing delivery asset/ },
      { assets: "hooks/fixture/guard.md", pattern: /delivery_assets must be a string array/ },
    ];
    for (const item of cases) {
      await writeJson(catalogPath, fixtureCatalog(item.assets));
      const result = runMaintenance(fixtureRoot, "records", FIXTURE_VENDOR, FIXTURE_ANCHOR);
      assert.equal(result.status, 1);
      assert.match(result.stderr, item.pattern);
    }
    await symlink(path.join(fixtureRoot, FIXTURE_GUARD), path.join(fixtureRoot, "hooks/fixture/link.md"));
    await writeJson(catalogPath, fixtureCatalog(["hooks/fixture/link.md"]));
    const linked = runMaintenance(fixtureRoot, "records", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(linked.status, 1);
    assert.match(linked.stderr, /symlink/);
    await mkdir(path.join(fixtureRoot, "hooks/linked-dir"), { recursive: true });
    await writeText(path.join(fixtureRoot, "hooks/linked-dir/asset.md"), "# linked asset\n");
    await symlink(path.join(fixtureRoot, "hooks/linked-dir"), path.join(fixtureRoot, "hooks/dir-link"));
    await writeJson(catalogPath, fixtureCatalog(["hooks/dir-link/asset.md"]));
    const ancestorLinked = runMaintenance(fixtureRoot, "records", FIXTURE_VENDOR, FIXTURE_ANCHOR);
    assert.equal(ancestorLinked.status, 1);
    assert.match(ancestorLinked.stderr, /contains a symlink/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
