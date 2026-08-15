import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

function init(root: string): void {
  const result = runCli(["init", root, "--tools", "none", "--json"]);
  assert.equal(result.status, 0, result.stderr);
}

void test("graph list and show inspect profiles and changes", async () => {
  const root = await tempProject();
  try {
    init(root);
    const listed = parseEnvelope<{ items: Array<{ selector: string }> }>(runCli(["list", "profiles", "--json"], root));
    assert.equal(listed.ok, true);
    assert.ok(listed.data?.items.some((item) => item.selector === "profile:minimal"));

    const shown = parseEnvelope<{ kind: string; profile: { profile_id: string } }>(runCli(["show", "profile:minimal", "--json"], root));
    assert.equal(shown.ok, true);
    assert.equal(shown.data?.kind, "profile");
    assert.equal(shown.data?.profile.profile_id, "minimal");
  } finally {
    await cleanup(root);
  }
});

void test("graph propose, decide and archive manage schema 2 project changes", async () => {
  const root = await tempProject();
  try {
    init(root);
    const proposedRaw = runCli(["propose", "rejected-change", "--targets", "claims.yaml", "--with", "design,tasks", "--json"], root);
    const proposed = parseEnvelope(proposedRaw);
    assert.equal(proposed.ok, true, proposedRaw.stdout);
    const listedChanges = runCli(["list", "changes", "--json"], root);
    const listed = parseEnvelope<{ items: Array<{ id: string }> }>(listedChanges);
    assert.equal(listed.ok, true, listedChanges.stdout);
    assert.equal(listed.data?.items.some((item) => item.id === "rejected-change"), true, listedChanges.stdout);

    const decided = parseEnvelope(runCli(["decide", "change:rejected-change", "--decision", "reject", "--actor-name", "Researcher", "--reason", "Out of scope.", "--json"], root));
    assert.equal(decided.ok, true);
    const archived = parseEnvelope(runCli(["archive", "rejected-change", "--json"], root));
    assert.equal(archived.ok, true);
    assert.equal(parseEnvelope<{ items: Array<{ id: string; archived: boolean }> }>(runCli(["list", "changes", "--json"], root)).data?.items.some((item) => item.id === "rejected-change" && item.archived), true);
  } finally {
    await cleanup(root);
  }
});

void test("graph pack writes a deterministic context bundle", async () => {
  const root = await tempProject();
  try {
    init(root);
    const output = path.join(root, "pack.zip");
    const packed = parseEnvelope<{ bytes: number; sha256: string }>(runCli(["pack", "--output", output, "--scope", "all", "--json"], root));
    assert.equal(packed.ok, true);
    assert.ok((packed.data?.bytes ?? 0) > 0);
    assert.match(packed.data?.sha256 ?? "", /^[0-9a-f]{64}$/);
  } finally {
    await cleanup(root);
  }
});

void test("graph handoff renders a run handoff", async () => {
  const root = await tempProject();
  try {
    init(root);
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
    const rendered = parseEnvelope<{ handoff: { run_id: string } }>(runCli(["handoff", `run:${started.data?.run_id ?? ""}`, "--json"], root));
    assert.equal(rendered.ok, true);
    assert.equal(rendered.data?.handoff.run_id, started.data?.run_id);
  } finally {
    await cleanup(root);
  }
});

void test("plugin list works outside and inside a schema 2 workspace", async () => {
  const root = await tempProject();
  try {
    const outside = parseEnvelope(runCli(["plugin", "list", "--summary", "--json"], root));
    assert.equal(outside.ok, true);
    init(root);
    const installed = parseEnvelope<{ selected_plugins: string[] }>(runCli(["plugin", "list", "--installed", "--json"], root));
    assert.equal(installed.ok, true);
    assert.deepEqual(installed.data?.selected_plugins ?? [], []);
  } finally {
    await cleanup(root);
  }
});
