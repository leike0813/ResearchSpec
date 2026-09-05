import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  handleGraphAdvance,
  handleGraphCheck,
  handleGraphDoctor,
  handleGraphInstructions,
  handleGraphStart,
  handleGraphStatus,
} from "../src/cli/handlers/graph.js";
import type { CommandContext } from "../src/cli/types.js";
import { MINIMAL_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/minimal.js";
import { writeBaseWorkspace } from "./helpers/graph-workspace.js";

function context(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    command: "status",
    cwd: process.cwd(),
    json: true,
    dryRun: false,
    force: false,
    yes: false,
    quiet: false,
    interactive: false,
    ...overrides,
  };
}

const START_INPUT = {
  schema_version: "2",
  confirmed_at: "2026-08-15T12:00:00+08:00",
  entry_id: "main",
  entry_node_id: "rq",
  route_ref: "deep-research:quick",
  prerequisites: [],
  handoff_inputs: [],
  planned_outputs: [
    { role: "rq_brief", type: "markdown", path: "rq-brief.md", purpose: "research question brief" },
    { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
  ],
  formal_gates: [],
  cost: { effort: "low", interaction: "low" },
};

async function writePresetWorkspace(root: string): Promise<string> {
  const workspace = await writeBaseWorkspace(root);
  await writeFile(path.join(workspace, "profiles", "minimal.yaml"), MINIMAL_GRAPH_PROFILE_TEXT, "utf8");
  return workspace;
}

void test("graph status and check/doctor read a fresh schema 2 workspace", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-cli-"));
  try {
    await writePresetWorkspace(root);
    const ctx = context({ cwd: root });
    const status = await handleGraphStatus(ctx);
    assert.equal(status.ok, true);
    assert.equal((status.data as { schema_version: string }).schema_version, "2");
    assert.equal((await handleGraphCheck(false, ctx)).ok, true);
    assert.equal((await handleGraphDoctor(ctx)).ok, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph start, instructions and advance form a CLI node loop", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-cli-"));
  try {
    await writePresetWorkspace(root);
    const startInput = path.join(root, "start.yaml");
    await writeFile(startInput, stringify(START_INPUT), "utf8");
    const ctx = context({ cwd: root, command: "start" });
    const started = await handleGraphStart({ input: startInput, selector: "minimal", confirmedBy: "researcher" }, ctx);
    assert.equal(started.ok, true);
    const runId = (started.data as { run_id: string }).run_id;

    const status = await handleGraphStatus(context({ cwd: root, command: "status" }));
    assert.equal((status.data as { runs: { total: number } }).runs.total, 1);
    assert.deepEqual((status.data as { frontier: Array<{ node_id: string }> }).frontier.map((item) => item.node_id), ["rq"]);

    const card = await handleGraphInstructions(`node:${runId}/rq`, context({ cwd: root, command: "instructions" }));
    assert.equal((card.data as { eligible: boolean }).eligible, true);

    const advanceInput = path.join(root, "advance-rq.yaml");
    await writeFile(path.join(root, "rq-brief.md"), "Research question brief\n", "utf8");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "rq_brief", path: "rq-brief.md" }] }), "utf8");
    const advanced = await handleGraphAdvance(`node:${runId}/rq`, { input: advanceInput }, context({ cwd: root, command: "advance" }));
    assert.equal(advanced.ok, true);

    const after = await handleGraphStatus(context({ cwd: root, command: "status" }));
    assert.deepEqual((after.data as { frontier: Array<{ node_id: string }> }).frontier.map((item) => item.node_id), ["methodology"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph profile instructions expose a start template", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-cli-"));
  try {
    await writePresetWorkspace(root);
    const result = await handleGraphInstructions("profile:minimal", context({ cwd: root, command: "instructions" }));
    assert.equal((result.data as { kind: string }).kind, "profile");
    assert.equal((result.data as { start_input: { schema_version: string } }).start_input.schema_version, "2");
    const entries = (result.data as { entries: Array<{ entry_id: string; entry_node_id: string }> }).entries;
    assert.deepEqual(entries.map((entry) => [entry.entry_id, entry.entry_node_id]), [["main", "rq"]]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
