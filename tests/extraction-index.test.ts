import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { test } from "node:test";

const execFileAsync = promisify(execFile);

interface ExtractionIndex {
  schema_version: string;
  artifact_count: number;
  verification_summary: Record<string, number>;
  milestones: Record<string, { total: number; pass: number; fail: number; error: number; skip: number }>;
  artifacts: Array<{
    milestone: string;
    path: string;
    kind: string;
    artifact_id: string;
    verification: { status: string };
  }>;
}

void test("extraction index accounts for verified artifacts in every milestone", async () => {
  const index = JSON.parse(await readFile("authoring/ars/extraction-index.json", "utf8")) as ExtractionIndex;
  assert.equal(index.schema_version, "1");
  assert.equal(index.artifact_count, index.artifacts.length);
  assert.deepEqual(index.verification_summary, { pass: index.artifact_count });
  assert.ok(index.artifacts.every((item) => item.verification.status === "pass"));
  for (const milestone of ["m1-research", "m2-writing", "m3-integrity-review", "m4-revision-finalize", "m5-side-branches"]) {
    const count = index.artifacts.filter(item => item.milestone === milestone).length;
    assert.ok(count > 0);
    assert.equal(index.milestones[milestone]?.pass, count);
    assert.equal(index.milestones[milestone]?.total, count);
  }
});

void test("extraction index check mode reports no drift", async () => {
  await execFileAsync(process.execPath, ["scripts/generate-extraction-index.mjs", "--check"]);
});
