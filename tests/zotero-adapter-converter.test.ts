import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, cp, mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

import { sha256 } from "../src/core/workspace/write-plan.js";
import { checkZoteroIdempotence, checkZoteroOutput, convertZoteroBundle } from "../src/vendor-converters/zotero-library-agent-bundle/converter.js";
import {
  checkZoteroBundleAudit,
  loadZoteroBundleAudit,
  renderZoteroBundleAuditReport,
  ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH,
  ZOTERO_BUNDLE_RELEASE_SET_ID,
  ZoteroBundleAuditSchema,
} from "../src/vendor-audits/zotero-library-agent-bundle.js";

const execFileAsync = promisify(execFile);

void test("Zotero immutable audit covers the complete approved tag tree", async () => {
  const audit = await loadZoteroBundleAudit(process.cwd());
  assert.deepEqual(await checkZoteroBundleAudit(process.cwd()), audit);
  assert.equal(audit.files.length, audit.counts.tracked_files);
  assert.equal(audit.counts.tracked_files, 176);
  assert.equal(audit.counts.included, 172);
  assert.equal(audit.counts.excluded, 4);
  assert.equal(audit.skills.length, 7);
  assert.equal(audit.opaque_runtime_metadata.length, 14);
  assert.equal(audit.review.cross_component_patch_equality_required, false);
  assert.equal(audit.identity.runtimes.length, 7);
  assert.equal(await readFile(`audits/zotero-library-agent-bundle/${ZOTERO_BUNDLE_RELEASE_SET_ID}/report.md`, "utf8"), renderZoteroBundleAuditReport(audit));

  const invalidDependency = structuredClone(audit);
  invalidDependency.skills[0]?.hard_skill_dependencies.push("zotero-library-agent");
  assert.equal(ZoteroBundleAuditSchema.safeParse(invalidDependency).success, false);
  const invalidOpaqueHash = structuredClone(audit);
  if (invalidOpaqueHash.opaque_runtime_metadata[0]) invalidOpaqueHash.opaque_runtime_metadata[0].sha256 = "0".repeat(64);
  assert.equal(ZoteroBundleAuditSchema.safeParse(invalidOpaqueHash).success, false);
});

void test("Zotero generated adapter output is admitted and byte-identical", async () => {
  const checked = await checkZoteroOutput(process.cwd());
  assert.deepEqual(checked, { ok: true, errors: [], warnings: [] });
  const idempotence = await checkZoteroIdempotence(process.cwd());
  assert.deepEqual(idempotence, { ok: true, drift_paths: [] });
  const manifest = JSON.parse(await readFile("literature-adapters/zotero/conversion-manifest.json", "utf8")) as {
    release_set_id: string;
    runtime_platforms: string[];
    generated_skill_ids: string[];
  };
  assert.equal(manifest.release_set_id, "hbrs-8c6de08010d459a0e87e74f2");
  assert.equal(manifest.runtime_platforms.length, 7);
  assert.deepEqual(manifest.generated_skill_ids, [
    "zotero-library-agent",
    "zotero-library-query",
    "zotero-literature-acquisition",
    "zotero-literature-analysis",
    "zotero-research-synthesis",
    "zotero-library-curation",
    "zotero-bridge-cli",
  ]);
  for (const excluded of ["install.sh", "install.ps1", "skills/zotero-library-agent/agents/openai.yaml"]) {
    await assert.rejects(stat(path.join("literature-adapters/zotero", excluded)));
  }
  const audit = await loadZoteroBundleAudit(process.cwd());
  for (const metadata of audit.opaque_runtime_metadata) {
    const bytes = await readFile(path.join("literature-adapters/zotero", metadata.path));
    assert.equal(bytes.byteLength, metadata.bytes);
    assert.equal(sha256(bytes), metadata.sha256);
  }
  const runtime = await readFile("literature-adapters/zotero/bin/linux-x64/zotero-bridge");
  assert.equal(sha256(runtime), "c0fbbd10ff6ee4333cf8c96711575d40a3435f008791c4a2d8eec252090563d3");
  if (process.platform !== "win32") assert.equal((await stat("literature-adapters/zotero/bin/linux-x64/zotero-bridge")).mode & 0o111, 0o111);
});

void test("dirty Zotero source blocks conversion before output", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-zotero-dirty-"));
  try {
    await mkdir(path.join(root, "vendor"), { recursive: true });
    await execFileAsync("git", ["clone", "--quiet", "--no-hardlinks", path.resolve("vendor/zotero-library-agent-bundle"), path.join(root, "vendor/zotero-library-agent-bundle")]);
    await mkdir(path.dirname(path.join(root, ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH)), { recursive: true });
    await cp(path.dirname(ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH), path.dirname(path.join(root, ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH)), { recursive: true });
    await mkdir(path.join(root, "LICENSES"), { recursive: true });
    await cp("LICENSES/AGPL-3.0.txt", path.join(root, "LICENSES/AGPL-3.0.txt"));
    await writeFile(path.join(root, "vendor/zotero-library-agent-bundle/README.md"), "dirty source", "utf8");
    await assert.rejects(convertZoteroBundle({ repoRoot: root, outputRoot: path.join(root, "output"), force: true }), /must be clean/);
  } finally {
    await chmod(root, 0o755).catch(() => undefined);
    await rm(root, { recursive: true, force: true });
  }
});
