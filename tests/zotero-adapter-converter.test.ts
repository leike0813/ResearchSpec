import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, cp, mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

import { sha256 } from "../src/core/workspace/write-plan.js";
import { checkZoteroIdempotence, checkZoteroOutput, convertZoteroBundle } from "../src/vendor-converters/zotero-library-agent-bundle/converter.js";
import { loadZoteroBundleAudit, renderZoteroBundleAuditReport } from "../src/vendor-audits/zotero-library-agent-bundle.js";

const execFileAsync = promisify(execFile);

void test("Zotero immutable audit covers the complete approved tag tree", async () => {
  const audit = await loadZoteroBundleAudit(process.cwd());
  assert.equal(audit.files.length, audit.counts.tracked_files);
  assert.equal(audit.counts.tracked_files, 65);
  assert.equal(audit.counts.included, 56);
  assert.equal(audit.counts.excluded, 9);
  assert.equal(audit.review.cross_component_patch_equality_required, false);
  assert.equal(audit.identity.runtimes.length, 7);
  assert.equal(await readFile("audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a/report.md", "utf8"), renderZoteroBundleAuditReport(audit));
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
  assert.equal(manifest.release_set_id, "hbrs-3d834c0f075f3122ac566e9a");
  assert.equal(manifest.runtime_platforms.length, 7);
  assert.deepEqual(manifest.generated_skill_ids, ["zotero-library-agent", "zotero-bridge-cli"]);
  for (const excluded of ["install.sh", "install.ps1", "skills/zotero-library-agent/agents/openai.yaml", "skills/zotero-library-agent/assets/runner.json", "skills/zotero-library-agent/assets/output.schema.json"]) {
    await assert.rejects(stat(path.join("literature-adapters/zotero", excluded)));
  }
  const runtime = await readFile("literature-adapters/zotero/bin/linux-x64/zotero-bridge");
  assert.equal(sha256(runtime), "18510ca1f85d1ffa1a5c9e5375078f1af5dbd7295fb5478f0a7d35b3e552b64a");
  if (process.platform !== "win32") assert.equal((await stat("literature-adapters/zotero/bin/linux-x64/zotero-bridge")).mode & 0o111, 0o111);
});

void test("dirty Zotero source blocks conversion before output", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-zotero-dirty-"));
  try {
    await mkdir(path.join(root, "vendor"), { recursive: true });
    await execFileAsync("git", ["clone", "--quiet", "--no-hardlinks", path.resolve("vendor/zotero-library-agent-bundle"), path.join(root, "vendor/zotero-library-agent-bundle")]);
    await mkdir(path.join(root, "audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a"), { recursive: true });
    await cp("audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a", path.join(root, "audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a"), { recursive: true });
    await mkdir(path.join(root, "LICENSES"), { recursive: true });
    await cp("LICENSES/AGPL-3.0.txt", path.join(root, "LICENSES/AGPL-3.0.txt"));
    await writeFile(path.join(root, "vendor/zotero-library-agent-bundle/README.md"), "dirty source", "utf8");
    await assert.rejects(convertZoteroBundle({ repoRoot: root, outputRoot: path.join(root, "output"), force: true }), /must be clean/);
  } finally {
    await chmod(root, 0o755).catch(() => undefined);
    await rm(root, { recursive: true, force: true });
  }
});
