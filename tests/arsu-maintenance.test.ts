import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

void test("ARSU maintenance skill documents the four-stage auditable path", async () => {
  const skill = await readFile(path.join(".agents", "skills", "arsu-maintenance", "SKILL.md"), "utf8");
  assert.match(skill, /分析 -> 吸纳 -> 转换 -> 审阅 -> 审计/);
  assert.match(skill, /anchor-baseline/);
  assert.match(skill, /incremental-update/);
  assert.match(skill, /audit-check/);
});

void test("ARSU maintenance skill includes HTML artifact generation and record regeneration", async () => {
  const skill = await readFile(path.join(".agents", "skills", "arsu-maintenance", "SKILL.md"), "utf8");
  assert.match(skill, /pnpm arsu-maintenance:artifacts/);
  assert.match(skill, /scripts\/arsu-maintenance\.mjs records/);
});

void test("ARSU maintenance skill requires an agent-authored semantic review gate", async () => {
  const skill = await readFile(path.join(".agents", "skills", "arsu-maintenance", "SKILL.md"), "utf8");
  assert.match(skill, /Agent 语义审阅门/);
  assert.match(skill, /05-semantic-review\.md/);
  assert.match(skill, /declared-fit/);
});

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
  assert.match(conversion, /academic-paper-reviewer\.ts/);
  assert.match(review, /deep-research:full/);
  assert.match(review, /academic-pipeline:end-to-end/);
});

void test("first ARSU anchor HTML artifacts live in the unified audit directory", async () => {
  const dir = path.join("audits", "arsu", "v3.19.0-828ef3b", "artifacts");
  await readFile(path.join(dir, "arsu-mode-capability-review.html"), "utf8");
  await readFile(path.join(dir, "arsu-mode-graph-match-assessment.html"), "utf8");
  await readFile(path.join(dir, "arsu-mode-gap-semantic-review.html"), "utf8");
});

void test("first ARSU anchor audit check passes", () => {
  const stdout = execFileSync(process.execPath, [
    "scripts/arsu-maintenance.mjs",
    "check",
    "v3.19.0-828ef3b",
  ], { encoding: "utf8" });
  assert.match(stdout, /^OK v3\.19\.0-828ef3b/);
});
