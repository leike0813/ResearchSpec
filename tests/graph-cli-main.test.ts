import assert from "node:assert/strict";
import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("packaged CLI initializes and runs a schema 2 graph workspace", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope<{ schema_version: string; workspace: string }>(runCli(["init", root, "--tools", "none", "--json"]));
    assert.equal(initialized.ok, true);
    assert.equal(initialized.data?.schema_version, "2");
    const workspace = initialized.data?.workspace ?? path.join(root, "researchspec");

    const firstStatus = runCli(["status", "--json"], root);
    const secondStatus = runCli(["status", "--json"], root);
    assert.equal(firstStatus.stdout, secondStatus.stdout);
    const status = parseEnvelope<{ schema_version: string; runs: { total: number }; frontier: unknown[] }>(firstStatus);
    assert.equal(status.ok, true);
    assert.equal(status.data?.schema_version, "2");
    assert.equal(status.data?.runs.total, 0);

    const startInput = path.join(root, "start.yaml");
    await writeFile(startInput, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-15T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "rq",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [
        { role: "rq_brief", type: "markdown", path: "rq-brief.md", purpose: "research question brief" },
        { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
      ],
      formal_gates: [],
      cost: { effort: "low", interaction: "low" },
    }), "utf8");
    const started = parseEnvelope<{ run_id: string }>(runCli(["start", "minimal", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true);
    const runId = started.data?.run_id;
    assert.ok(runId);

    const afterStart = parseEnvelope<{ frontier: Array<{ selector: string }> }>(runCli(["status", "--json"], root));
    assert.equal(afterStart.data?.frontier[0]?.selector, `node:${runId}/rq`);

    const advanceInput = path.join(root, "advance.yaml");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "rq_brief", path: "rq-brief.md" }] }), "utf8");
    const advanced = runCli(["advance", `node:${runId}/rq`, "--input", advanceInput, "--json"], root);
    assert.equal(advanced.status, 0);
    const afterAdvance = parseEnvelope<{ frontier: Array<{ selector: string }> }>(runCli(["status", "--json"], root));
    assert.equal(afterAdvance.data?.frontier[0]?.selector, `node:${runId}/report`);
    assert.equal(parseEnvelope(runCli(["check", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["doctor", "--json"], root)).ok, true);
    assert.ok(workspace);
  } finally {
    await cleanup(root);
  }
});

void test("schema 1 workspaces are rejected by the packaged CLI", async () => {
  const root = await tempProject();
  try {
    const workspace = path.join(root, "researchspec");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(workspace, { recursive: true });
    await writeFile(path.join(workspace, "config.yaml"), stringify({ schema_version: "1", agent_tools: { selected: [], delivery: "skills" }, literature_adapters: { selected: [] }, plugins: { selected: [] } }), "utf8");
    const status = runCli(["status", "--json"], root);
    assert.notEqual(status.status, 0);
    assert.match(status.stdout, /workspace_unsupported/);
  } finally {
    await cleanup(root);
  }
});

void test("graph init projects authored capability skills into selected Agent tools", async () => {
  const root = await tempProject();
  try {
    const codexHome = path.join(root, "codex-home");
    const initialized = parseEnvelope<{ projected_capability_files: number }>(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root, { CODEX_HOME: codexHome }));
    assert.equal(initialized.ok, true);
    assert.ok((initialized.data?.projected_capability_files ?? 0) > 0);
    await access(path.join(root, ".agents", "skills", "design-research-question-formulation", "SKILL.md"));
  } finally {
    await cleanup(root);
  }
});
