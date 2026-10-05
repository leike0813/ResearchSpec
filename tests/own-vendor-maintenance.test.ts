import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();

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
    vendors: Array<{ vendor_id: string; anchor_id: string; capability_ids: string[] }>;
  };
  assert.equal(catalog.schema_version, "1");
  assert.equal(catalog.vendors.length, 2);
  assert.deepEqual(catalog.vendors.map((item) => item.vendor_id), ["paper-humanizer", "revision-master"]);
  assert.deepEqual(catalog.vendors[0]?.capability_ids.length, 4);
  assert.deepEqual(catalog.vendors[1]?.capability_ids.length, 5);
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
