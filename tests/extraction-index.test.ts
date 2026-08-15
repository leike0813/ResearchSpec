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

void test("extraction index records all 119 verified artifacts", async () => {
  const index = JSON.parse(await readFile("docs/ars_extraction/extraction-index.json", "utf8")) as ExtractionIndex;
  assert.equal(index.schema_version, "1");
  assert.equal(index.artifact_count, 119);
  assert.deepEqual(index.verification_summary, { pass: 119 });
  assert.equal(index.artifacts.length, 119);
  assert.ok(index.artifacts.every((item) => item.verification.status === "pass"));
  assert.deepEqual(
    Object.entries(index.milestones).map(([name, value]) => [name, value.total, value.pass]),
    [
      ["m1-research", 16, 16],
      ["m2-writing", 15, 15],
      ["m3-integrity-review", 25, 25],
      ["m4-revision-finalize", 15, 15],
      ["m5-side-branches", 48, 48],
    ],
  );
});

void test("extraction index check mode reports no drift", async () => {
  await execFileAsync(process.execPath, ["scripts/generate-extraction-index.mjs", "--check"]);
});
