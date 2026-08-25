import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CHECKER = path.join(ROOT, "scripts", "check-authored-whitespace.mjs");
const SOURCE_HASH = "a".repeat(64);

void test("authored whitespace checker accepts an exact hash-verified byte-preserved exemption", async () => {
  const fixture = await createFixture("preserved bytes  \n");
  try {
    const result = runChecker(fixture.root, fixture.catalogPath, "resource.txt");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 verified exemptions/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

void test("authored whitespace checker rejects authored whitespace and invalid exemptions", async () => {
  const cases = [
    {
      name: "authored trailing whitespace",
      prepare: async () => createFixture("authored text  \n", { exempt: false }),
      expected: /resource\.txt:1: trailing whitespace/,
    },
    {
      name: "altered exempt bytes",
      prepare: async () => createFixture("altered bytes  \n", { declaredContent: "reviewed bytes  \n" }),
      expected: /exemption hash mismatch for resource\.txt/,
    },
    {
      name: "unhashed exemption",
      prepare: async () => createFixture("preserved bytes  \n", { omitHash: true }),
      expected: /exemption hash for resource\.txt must be a lowercase SHA-256/,
    },
  ];

  for (const entry of cases) {
    const fixture = await entry.prepare();
    try {
      const result = runChecker(fixture.root, fixture.catalogPath, "resource.txt");
      assert.notEqual(result.status, 0, `${entry.name} unexpectedly passed`);
      assert.match(result.stderr, entry.expected);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  }
});

async function createFixture(content: string, options: { exempt?: boolean; declaredContent?: string; omitHash?: boolean } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-whitespace-"));
  const resourcePath = path.join(root, "resource.txt");
  const evidencePath = path.join(root, "evidence.json");
  const catalogPath = path.join(root, "catalog.json");
  await writeFile(resourcePath, content, "utf8");
  await writeFile(evidencePath, `${JSON.stringify({
    artifacts: [{
      artifact_id: "EVIDENCE-1",
      sha256: SOURCE_HASH,
      ledger: ["[preserve] byte-preserved source"],
      verification: { status: "pass", expected_sha256: SOURCE_HASH, actual_sha256: SOURCE_HASH },
    }],
  })}\n`, "utf8");
  const exemption = {
    path: "resource.txt",
    byte_preserved: true,
    ...options.omitHash ? {} : { sha256: hash(options.declaredContent ?? content) },
    evidence: { catalog_path: "evidence.json", artifact_id: "EVIDENCE-1", source_sha256: SOURCE_HASH },
  };
  await writeFile(catalogPath, `${JSON.stringify({
    schema_version: "1",
    exemptions: options.exempt === false ? [] : [exemption],
  })}\n`, "utf8");
  return { root, catalogPath };
}

function runChecker(root: string, catalogPath: string, candidate: string) {
  return spawnSync(process.execPath, [CHECKER, "--root", root, "--catalog", catalogPath, "--path", candidate], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function hash(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
