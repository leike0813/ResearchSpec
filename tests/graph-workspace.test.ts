import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  inspectGraphWorkspaceFormat,
  loadGraphWorkspaceIndex,
} from "../src/core/runtime/graph-workspace-index.js";
import {
  GRAPH_TEXT,
  runValue,
  sha256,
  writeBaseWorkspace,
  writeRun,
} from "./helpers/graph-workspace.js";

void test("graph workspace format accepts schema 2 and rejects schema 1", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-workspace-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    assert.deepEqual(await inspectGraphWorkspaceFormat(workspace), { current: true });
    await writeFile(path.join(workspace, "config.yaml"), stringify({ schema_version: "1", agent_tools: { selected: [], delivery: "skills" }, literature_adapters: { selected: [] }, plugins: { selected: [] } }), "utf8");
    const legacy = await inspectGraphWorkspaceFormat(workspace);
    assert.equal(legacy.current, false);
    assert.match(legacy.reason, /schema 2/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph workspace index loads a fresh schema 2 workspace with no runs", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-workspace-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(index.config.schema_version, "2");
    assert.equal(index.profiles.get("minimal")?.profile_id, "minimal");
    assert.equal(index.runs.length, 0);
    assert.deepEqual(index.diagnostics, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph workspace index scans runs, frozen graphs, nodes and handoffs", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-workspace-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeRun(workspace, runValue(), GRAPH_TEXT, true);
    const index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(index.runs.length, 1);
    assert.equal(index.runs[0].run?.run_id, "run-1");
    assert.equal(index.runs[0].graph?.profile_id, "minimal");
    assert.equal(index.runs[0].handoff?.frontmatter.run_id, "run-1");
    assert.equal(index.runs[0].nodeEntries.length, 1);
    assert.equal(index.runs[0].nodeEntries[0].node?.node_instance_id, "rq-1");
    assert.deepEqual(index.diagnostics, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph workspace index reports frozen graph hash mismatch", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-workspace-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeRun(workspace, { ...runValue(), profile_sha256: sha256("different graph") });
    const index = await loadGraphWorkspaceIndex(workspace);
    assert.ok(index.diagnostics.some((item) => item.code === "run_graph_hash_mismatch"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph workspace index reports unknown and duplicate node instances", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-workspace-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeRun(workspace, runValue(), GRAPH_TEXT, false);
    const runDir = path.join(workspace, "runs", "run-1", "nodes");
    const baseNode = {
      schema_version: "2",
      node_instance_id: "unknown-node-1",
      run_id: "run-1",
      node_id: "not-in-graph",
      state: "pending",
      updated_at: "2026-08-15T12:10:00+08:00",
      outputs: [],
      gate_attempts: [],
      decisions: [],
    };
    await writeFile(path.join(runDir, "unknown-a.yaml"), stringify({ ...baseNode, node_instance_id: "unknown-a" }), "utf8");
    await writeFile(path.join(runDir, "unknown-b.yaml"), stringify({ ...baseNode, node_instance_id: "unknown-b" }), "utf8");
    const index = await loadGraphWorkspaceIndex(workspace);
    assert.ok(index.diagnostics.some((item) => item.code === "node_graph_unknown"));
    assert.ok(index.diagnostics.some((item) => item.code === "node_id_duplicate"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
