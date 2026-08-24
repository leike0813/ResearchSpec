import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { GraphNodeInstanceSchema, RunHandoffSchema } from "../src/core/contracts/graph-workspace.js";
import { isSafeProjectRelativePath } from "../src/core/contracts/project-path.js";
import { BoundaryPathError, resolveBoundaryPath } from "../src/core/runtime/boundary-path.js";

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
