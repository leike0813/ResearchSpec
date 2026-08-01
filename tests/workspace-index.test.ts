import assert from "node:assert/strict";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("current workspace index is derived and catches duplicate instance IDs", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    for (const directoryName of ["one", "two"]) {
      const directory = path.join(workspace, "subflows", directoryName);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "control.yaml"), stringify(control("sf-duplicate")), "utf8");
      await writeFile(path.join(directory, "handoff.md"), handoff("sf-duplicate"), "utf8");
    }
    const index = await loadCurrentWorkspaceIndex(workspace);
    assert.equal(index.subflows.length, 2);
    assert.deepEqual(index.subflows.map((item) => item.directoryName), ["one", "two"]);
    assert.ok(index.diagnostics.some((item) => item.code === "duplicate_subflow_instance_id"));
    assert.equal(index.files.has("runs/current/state.yaml"), false);
  } finally {
    await cleanup(root);
  }
});

void test("current workspace index refuses symlinked managed files", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    const project = path.join(workspace, "specs/project.md");
    const replacement = path.join(root, "project.md");
    await writeFile(replacement, "user data", "utf8");
    const { rm } = await import("node:fs/promises");
    await rm(project);
    await symlink(replacement, project);
    const index = await loadCurrentWorkspaceIndex(workspace);
    assert.ok(index.diagnostics.some((item) => item.code === "managed_file_invalid" && item.path === project));
  } finally {
    await cleanup(root);
  }
});

void test("current workspace index preserves partial subflows and scans archived changes", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    const subflow = path.join(workspace, "subflows/partial");
    await mkdir(subflow, { recursive: true });
    await writeFile(path.join(subflow, "control.yaml"), stringify(control("sf-partial")), "utf8");
    const archived = path.join(workspace, "changes/archive/old-change");
    await mkdir(archived, { recursive: true });
    await writeFile(path.join(archived, "change.md"), `---\nschema_version: "1"\nid: old-change\nstatus: rejected\ntargets:\n  - project.md\ndecision:\n  outcome: rejected\n  decided_by: user\n  decided_at: 2026-08-01T12:00:00+08:00\n  reason: Out of scope.\n---\n\n# Rejected change\n`, "utf8");
    const index = await loadCurrentWorkspaceIndex(workspace);
    assert.equal(index.subflowEntries.length, 1);
    assert.equal(index.subflows.length, 0);
    assert.equal(index.subflowEntries[0]?.control?.instance_id, "sf-partial");
    assert.ok(index.diagnostics.some((item) => item.code === "subflow_handoff_missing"));
    assert.equal(index.archivedChanges[0]?.id, "old-change");
    assert.equal(index.archivedChanges[0]?.archived, true);
  } finally { await cleanup(root); }
});

async function writeSkeleton(workspace: string): Promise<void> {
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, "utf8");
    }
  }
}

function control(instanceId: string) {
  return {
    schema_version: "1", instance_id: instanceId, route_ref: "deep-research:quick", skill_id: "deep-research", mode_id: "quick",
    profile: null, parent: null, started_at: "2026-08-01T12:00:00+08:00",
    start_confirmation: { confirmed_by: "user", confirmed_at: "2026-08-01T12:00:00+08:00", prerequisites: [], expected_outputs: ["research-brief"], formal_gates: [], cost: { effort: "low", interaction: "single-pass" } },
    status: "active", checkpoint: "research", gates: [], decisions: [], transitions: [],
  };
}

function handoff(instanceId: string): string {
  return `---\nschema_version: "1"\nsubflow_instance_id: ${instanceId}\nupdated_at: 2026-08-01T12:00:00+08:00\ninputs: []\noutputs: []\n---\n`;
}
