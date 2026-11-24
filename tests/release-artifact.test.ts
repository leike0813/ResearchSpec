import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { test } from "node:test";

void test("release artifact verification binds a clean commit and version to the tarball bytes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-release-artifact-"));
  const version = "0.1.1";
  const commit = "a".repeat(40);
  const filename = `researchspec-${version}.tgz`;
  const tarball = path.join(root, filename);
  const bytes = Buffer.from("verified tarball fixture");
  const verify = (expectedVersion = version, expectedCommit = commit) =>
    spawnSync(process.execPath, ["scripts/verify-release-artifact.mjs", root, expectedVersion, expectedCommit], { encoding: "utf8" });
  try {
    await writeFile(tarball, bytes);
    await writeFile(path.join(root, "release.json"), JSON.stringify({
      name: "researchspec", filename, version, commit, clean: true, size: bytes.length,
      integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
    }));
    const result = verify();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), tarball);
    assert.notEqual(verify("0.1.2").status, 0);
    assert.notEqual(verify(version, "b".repeat(40)).status, 0);
    bytes[0] = 0;
    await writeFile(tarball, bytes);
    assert.notEqual(verify().status, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
