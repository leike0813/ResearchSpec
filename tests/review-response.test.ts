import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { strFromU8, unzipSync } from "fflate";

import { getArsuRoute } from "../src/arsu-converter/routing/catalog.js";
import { REVIEW_RESPONSE_PROFILE } from "../src/arsu-converter/workflow/review-response.js";
import { HandoffInputSchema } from "../src/core/contracts/subflow-handoff.js";
import { buildCurrentContextPack } from "../src/core/runtime/pack.js";
import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("review-response is a standalone route and profile with six checkpoints", () => {
  const route = getArsuRoute("review-response:full");
  assert.equal(route.route_ref, "review-response:full");
  assert.equal(REVIEW_RESPONSE_PROFILE.entries[0]?.checkpoint, "intake");
  assert.deepEqual(REVIEW_RESPONSE_PROFILE.children.map((item) => item.node_id), [
    "intake", "manuscript-analysis", "comment-atomization", "workboard", "strategy-execution", "final-assembly",
  ]);
  assert.equal(REVIEW_RESPONSE_PROFILE.gates.length, 5);
});

void test("review-response start creates instance-root views and pack excludes them", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const manuscriptPath = path.join(workspace, "specs/manuscript.yaml");
    const manuscript = await readFile(manuscriptPath, "utf8");
    await writeFile(manuscriptPath, manuscript.replace("working_format: null", "working_format: markdown"), "utf8");
    const inputPath = path.join(root, "review-start.json");
    await writeFile(inputPath, JSON.stringify({
      schema_version: "1",
      confirmed_at: "2026-08-05T12:00:00+08:00",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [
        { role: "revised_manuscript", type: "manuscript", path: "outputs/revised.md", purpose: "revised manuscript", format: "markdown" },
        { role: "response_to_reviewers", type: "response-letter", path: "outputs/response.md", purpose: "response letter", format: "markdown" },
        { role: "review-response-summary", type: "summary", path: "outputs/summary.md", purpose: "summary", format: "markdown" },
      ],
      manuscript_delivery: { working_format: "markdown", final_output_format: null },
      formal_gates: REVIEW_RESPONSE_PROFILE.gates.map((gate) => gate.gate_id),
      cost: { effort: "high", interaction: "iterative" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string; directory: string }>(runCli(["start", "review-response:full", "--input", inputPath, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true);
    const directory = started.data?.directory;
    assert.ok(directory);
    assert.deepEqual((await readdir(directory!)).sort(), ["control.yaml", "handoff.md", "views", "work"]);
    assert.equal((await readdir(path.join(directory!, "work", "review-response"))).length, 0);

    const pack = buildCurrentContextPack(await loadCurrentWorkspaceIndex(workspace));
    const entries = Object.keys(unzipSync(pack.bytes));
    assert.ok(entries.some((entry) => entry.endsWith("/control.yaml")));
    assert.equal(entries.some((entry) => entry.includes("/views/") || entry.includes("/work/")), false);
  } finally {
    await cleanup(root);
  }
});

void test("review-response SQLite helper initializes schema and fails closed on control drift", async () => {
  const root = await tempProject();
  try {
    const instance = path.join(root, "subflows/sf-review");
    await mkdir(path.join(instance, "work/review-response"), { recursive: true });
    await writeFile(path.join(instance, "control.yaml"), "schema_version: \"1\"\ninstance_id: sf-review\nroute_ref: review-response:full\nstatus: active\ncheckpoint: intake\n", "utf8");
    await writeFile(path.join(instance, "handoff.md"), "---\nschema_version: \"1\"\nsubflow_instance_id: sf-review\nupdated_at: 2026-08-05T12:00:00+08:00\ninputs: []\noutputs: []\n---\n", "utf8");
    const scripts = path.resolve("skills/review-response/scripts");
    const init = spawnSync("uv", ["run", "--project=/home/joshua/.ar", "--locked", "--", "python", path.join(scripts, "init_artifact_workspace.py"), "--instance-root", instance, "--document-language", "en", "--working-language", "zh-CN"], { encoding: "utf8" });
    assert.equal(init.status, 0, init.stderr);
    assert.equal(await readFile(path.join(instance, "work/review-response/review-response.db")).then(() => true), true);
    assert.deepEqual((await readdir(path.join(instance, "views"))).sort(), [
      "01-agent-resume.md", "02-manuscript-structure-summary.md", "03-style-profile.md",
      "04-raw-review-thread-list.md", "05-atomic-review-comment-list.md", "06-thread-to-atomic-mapping.md",
      "07-review-comment-coverage.md", "08-atomic-comment-workboard.md", "09-supplement-suggestion-plan.md",
      "10-supplement-intake-plan.md", "11-manuscript-revision-guide.md", "12-manuscript-execution-graph.md",
      "13-revision-action-log.md", "14-response-coverage-matrix.md", "15-response-letter-preview.md",
      "16-response-letter-preview.tex", "17-final-assembly-checklist.md", "response-strategy-cards",
    ]);
    const render = spawnSync("uv", ["run", "--project=/home/joshua/.ar", "--locked", "--", "python", path.join(scripts, "gate_and_render_workspace.py"), "--instance-root", instance], { encoding: "utf8" });
    assert.equal(render.status, 0, render.stderr);
    const resumeView = await readFile(path.join(instance, "views/01-agent-resume.md"), "utf8");
    assert.equal(resumeView.includes("resume_status"), true);
    await writeFile(path.join(instance, "control.yaml"), "schema_version: \"1\"\ninstance_id: sf-review\nroute_ref: review-response:full\nstatus: active\ncheckpoint: manuscript-analysis\n", "utf8");
    const drift = spawnSync("uv", ["run", "--project=/home/joshua/.ar", "--locked", "--", "python", path.join(scripts, "gate_and_render_workspace.py"), "--instance-root", instance], { encoding: "utf8" });
    assert.notEqual(drift.status, 0);
    assert.match(drift.stdout, /control_projection_drift/);
  } finally {
    await cleanup(root);
  }
});

void test("LaTeX handoffs require explicit file or project shape", () => {
  assert.equal(HandoffInputSchema.safeParse({ role: "source", type: "manuscript", path: "paper/main.tex", purpose: "read", format: "latex" }).success, true);
  assert.equal(HandoffInputSchema.safeParse({ role: "project", type: "manuscript", path: "paper", purpose: "read", format: "latex-project", path_kind: "directory", entry_path: "main.tex" }).success, true);
  assert.equal(HandoffInputSchema.safeParse({ role: "project", type: "manuscript", path: "paper", purpose: "read", format: "latex-project" }).success, false);
});
