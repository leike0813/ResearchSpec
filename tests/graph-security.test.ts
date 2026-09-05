import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { GraphNodeInstanceSchema, RunHandoffSchema } from "../src/core/contracts/graph-workspace.js";
import { isSafeProjectRelativePath } from "../src/core/contracts/project-path.js";
import { BoundaryPathError, resolveBoundaryPath } from "../src/core/runtime/boundary-path.js";
import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import { hashPath, sha256 } from "../src/core/workspace/write-plan.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";
import type { ToolInstallationManifest } from "../src/adapters/installations.js";

const INVALID_PATHS = ["", ".", "../escape.md", "a/../escape.md", "/tmp/escape.md", "C:/escape.md", "a\\escape.md", "researchspec/run.yaml"];

void test("graph boundary contracts reject unsafe project paths", () => {
  for (const value of INVALID_PATHS) {
    assert.equal(isSafeProjectRelativePath(value), false, value);
    assert.equal(RunHandoffSchema.safeParse({
      schema_version: "2",
      run_id: "run-1",
      updated_at: "2026-08-24T00:00:00Z",
      inputs: [],
      outputs: [{ role: "report", type: "markdown", path: value, purpose: "report" }],
    }).success, false, value);
    assert.equal(GraphNodeInstanceSchema.safeParse({
      schema_version: "2",
      node_instance_id: "node-1",
      run_id: "run-1",
      node_id: "report",
      state: "complete",
      updated_at: "2026-08-24T00:00:00Z",
      outputs: [{ role: "report", path: value }],
      gate_attempts: [],
      decisions: [],
    }).success, false, value);
  }
});

void test("boundary resolution rejects an existing symlink component", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-boundary-"));
  const outside = await mkdtemp(path.join(tmpdir(), "researchspec-boundary-outside-"));
  try {
    await mkdir(path.join(root, "outputs"));
    await symlink(outside, path.join(root, "outputs", "linked"));
    await assert.rejects(
      resolveBoundaryPath(root, "outputs/linked/report.md"),
      (error: unknown) => error instanceof BoundaryPathError && error.code === "boundary_path_symlink",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

void test("invalid installation manifests block every projection mutation without writes", async () => {
  const container = await tempProject();
  const root = path.join(container, "project");
  try {
    await mkdir(root);
    assert.equal(parseEnvelope(runCli(["init", root, "--tools", "none", "--json"])).ok, true);
    const workspace = path.join(root, "researchspec");
    const manifestPath = path.join(workspace, "tool-installation-manifest.json");
    const original = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(original) as ToolInstallationManifest;
    const victim = path.join(container, "report.md");
    await writeFile(victim, "external report");
    const malicious = structuredClone(manifest);
    malicious.installations.push({
      owner: "framework", tool_id: null,
      source: { kind: "plugin-profile", profile_id: "retired", profile_version: "1" },
      target: { scope: "project", path: "../report.md", executable: false },
      sha256: sha256("external report"),
    });
    await writeFile(manifestPath, JSON.stringify(malicious));
    const before = await hashPath(root);
    for (const args of [
      ["init", root, "--tools", "none"], ["update", "--tools", "none"],
      ["plugin", "install", "ecology", "--yes"], ["plugin", "update"],
      ["plugin", "uninstall", "ecology"],
    ]) {
      const result = runCli([...args, "--force", "--json"], root);
      assert.notEqual(result.status, 0, args.join(" "));
      assert.equal(parseEnvelope(result).error?.code, "invalid_current_contract", result.stdout);
      assert.equal(await hashPath(root), before);
      assert.equal(await readFile(victim, "utf8"), "external report");
    }
    const inspected = parseEnvelope(runCli(["check", "all", "--json"], root));
    assert.ok(inspected.diagnostics.some((item) => (item as { code: string }).code === "invalid_current_contract"));
    for (const args of [["plugin", "list", "--installed"], ["plugin", "instructions", "missing-skill"]]) {
      assert.equal(parseEnvelope(runCli([...args, "--json"], root)).error?.code, "invalid_current_contract");
    }
    assert.equal(await hashPath(root), before);

    for (const invalid of ["{", JSON.stringify({ ...manifest, installations: [{ ...malicious.installations.at(-1), target: { scope: "project", path: "report.md", executable: false } }] })]) {
      await writeFile(manifestPath, invalid);
      const bytesBefore = await hashPath(root);
      assert.equal(parseEnvelope(runCli(["update", "--json"], root)).error?.code, "invalid_current_contract");
      assert.equal(await hashPath(root), bytesBefore);
    }
    await rm(manifestPath);
    await symlink(victim, manifestPath);
    assert.equal((await loadGraphWorkspaceIndex(workspace)).manifestStatus, "invalid");
    assert.equal(parseEnvelope(runCli(["update", "--json"], root)).error?.code, "invalid_current_contract");
    await rm(manifestPath);
    await mkdir(manifestPath);
    assert.equal((await loadGraphWorkspaceIndex(workspace)).manifestStatus, "invalid");
    await rm(manifestPath, { recursive: true });
    assert.equal((await loadGraphWorkspaceIndex(workspace)).manifestStatus, "missing");
    const missing = parseEnvelope(runCli(["update", "--json"], root));
    assert.equal(missing.error?.code, "workspace_projection_conflict");
    await writeFile(manifestPath, original);
    assert.equal(parseEnvelope(runCli(["update", "--json"], root)).ok, true);
    assert.equal((await loadGraphWorkspaceIndex(workspace)).manifestStatus, "valid");
  } finally { await cleanup(container); }
});

void test("CLI projection rejects a symlinked profile parent without changing its destination", async () => {
  const container = await tempProject();
  const root = path.join(container, "project");
  try {
    await mkdir(root);
    assert.equal(parseEnvelope(runCli(["init", root, "--tools", "none", "--json"])).ok, true);
    const profiles = path.join(root, "researchspec/profiles");
    const outside = path.join(container, "profiles");
    await rename(profiles, outside);
    await symlink(outside, profiles, "dir");
    const before = await hashPath(container);
    const result = runCli(["update", "--force", "--json"], root);
    assert.notEqual(result.status, 0);
    assert.equal(await hashPath(container), before);
  } finally { await cleanup(container); }
});
