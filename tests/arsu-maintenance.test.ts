import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

void test("first ARSU anchor records contain full ingestion, conversion and review tables", async () => {
  const dir = path.join("audits", "arsu", "v3.19.0-828ef3b");
  const ingestion = await readFile(path.join(dir, "02-ingestion.md"), "utf8");
  const conversion = await readFile(path.join(dir, "03-conversion.md"), "utf8");
  const review = await readFile(path.join(dir, "04-review.md"), "utf8");
  const semantic = await readFile(path.join(dir, "05-semantic-review.md"), "utf8");
  assert.doesNotMatch(semantic, /\[NOT-COMPLETED\]/);
  assert.match(semantic, /## 结论/);
  assert.match(semantic, /declared-fit/);
  assert.match(ingestion, /CAP-M1-01/);
  assert.match(ingestion, /KP-M5-33/);
  assert.match(conversion, /analysis-evidence-synthesis/);
  assert.match(conversion, /academic-paper-reviewer\.yaml/);
  assert.match(review, /deep-research:full/);
  assert.match(review, /academic-pipeline:end-to-end/);
});

void test("first ARSU anchor HTML artifacts live in the unified audit directory", async () => {
  const dir = path.join("audits", "arsu", "v3.19.0-828ef3b", "artifacts");
  await readFile(path.join(dir, "arsu-mode-capability-review.html"), "utf8");
  await readFile(path.join(dir, "arsu-mode-graph-match-assessment.html"), "utf8");
  await readFile(path.join(dir, "arsu-mode-gap-semantic-review.html"), "utf8");
});

void test("current ARSU anchor audit check passes", () => {
  const stdout = execFileSync(process.execPath, [
    "scripts/arsu-maintenance.mjs",
    "check",
  ], { encoding: "utf8" });
  assert.match(stdout, /^OK /);
});

void test("semantic review rendering uses the selected anchor and reports missing review", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "arsu-review-"));
  try {
    const artifacts = path.join(dir, "artifacts");
    await mkdir(artifacts);
    const output = path.join(artifacts, "review.html");
    const render = () => execFileSync(process.execPath, ["scripts/generate-arsu-gap-semantic-review-html.mjs", output]);
    render();
    assert.match(await readFile(output, "utf8"), /\[NOT-COMPLETED\]/);
    await writeFile(path.join(dir, "05-semantic-review.md"), "# Review\n\nEvidence: SELECTED-ANCHOR <script>alert(1)</script>\n");
    render();
    const html = await readFile(output, "utf8");
    assert.match(html, /SELECTED-ANCHOR/);
    assert.doesNotMatch(html, /\[NOT-COMPLETED\]|<script>/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
