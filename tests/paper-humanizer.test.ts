import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { PAPER_HUMANIZER_FULL_ROUTE, PAPER_HUMANIZER_REVIEW_ROUTE } from "../src/arsu-converter/routing/paper-humanizer.js";
import { PAPER_HUMANIZER_PROFILE } from "../src/arsu-converter/workflow/paper-humanizer.js";

const root = process.cwd();
const pythonProject = path.join(process.env.HOME ?? "/home/joshua", ".ar");
const pythonPrefix = ["run", `--project=${pythonProject}`, "--locked", "--", "python"];
const documentScript = path.join(root, "skills/paper-humanizer/scripts/document_pipeline.py");
const workflowScript = path.join(root, "skills/paper-humanizer/scripts/full_workflow.py");

function runPython(script: string, args: string[], cwd = root): { status: number | null; output: Record<string, unknown> } {
  const result = spawnSync("uv", [...pythonPrefix, script, ...args], { cwd, encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.stderr, "", result.stderr);
  return { status: result.status, output: JSON.parse(result.stdout) as Record<string, unknown> };
}

void test("paper-humanizer exposes independent review/full routes and a one-shot profile", () => {
  assert.equal(PAPER_HUMANIZER_REVIEW_ROUTE.route_ref, "paper-humanizer:review");
  assert.equal(PAPER_HUMANIZER_REVIEW_ROUTE.gate_policy.level, "none");
  assert.deepEqual(PAPER_HUMANIZER_FULL_ROUTE.gate_policy.gate_kinds, ["paper-humanizer-acceptance"]);
  assert.deepEqual(PAPER_HUMANIZER_PROFILE.entries.map((entry) => entry.route_ref), ["paper-humanizer:review", "paper-humanizer:full"]);
  assert.equal(PAPER_HUMANIZER_PROFILE.children.length, 0);
  assert.deepEqual(PAPER_HUMANIZER_PROFILE.gates.map((gate) => gate.gate_id), ["paper-humanizer-acceptance"]);
  assert.equal(PAPER_HUMANIZER_PROFILE.revision_round_template, null);
});

void test("published tree uses the complete Python operational surface", () => {
  const skillRoot = path.join(root, "skills/paper-humanizer");
  for (const relative of [
    "SKILL.md",
    "agents/review.md",
    "agents/full.md",
    "references/diagnostic-guidance.md",
    "references/document-yaml-contract.md",
    "scripts/document_pipeline.py",
    "scripts/full_workflow.py",
  ]) assert.equal(existsSync(path.join(skillRoot, relative)), true, relative);
  assert.equal(existsSync(path.join(skillRoot, "agents/openai.yaml")), false);
  assert.equal(existsSync(path.join(skillRoot, "scripts/document-pipeline.mjs")), false);
  assert.equal(existsSync(path.join(skillRoot, "scripts/full-workflow.mjs")), false);
  const metadata = JSON.parse(readFileSync(path.join(skillRoot, "metadata.json"), "utf8")) as { runtime?: string; excluded?: string[] };
  assert.equal(metadata.runtime, "python-3.11-standard-library");
  assert.ok(metadata.excluded?.includes("agents/openai.yaml"));
});

void test("Python document runtime preserves protected regions and round-trips Quarto", () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "paper-humanizer-document-"));
  try {
    const source = "---\ntitle: Demo\n---\nA sentence with enough words to produce a useful diagnostic for a human reader while preserving syntax.\n\n```js\nconst value = 1;\n```\nSee [source](https://example.com) and [@smith2020].\n";
    const input = path.join(temporary, "demo.qmd");
    const artifact = path.join(temporary, "document.yaml");
    const roundTrip = path.join(temporary, "roundtrip.qmd");
    writeFileSync(input, source);
    const extracted = runPython(documentScript, ["extract", "--input", input, "--format", "auto", "--output", artifact]);
    assert.equal(extracted.status, 0);
    const document = JSON.parse(readFileSync(artifact, "utf8")) as { source: { format: string }; segments: Array<{ kind: string }>; analysis: { sentence_count: number } };
    assert.equal(document.source.format, "quarto");
    assert.ok(document.segments.some((segment) => segment.kind === "protected"));
    assert.ok(document.analysis.sentence_count >= 1);
    const rendered = runPython(documentScript, ["render", "--input", artifact, "--output", roundTrip]);
    assert.equal(rendered.status, 0);
    assert.equal(readFileSync(roundTrip, "utf8"), source);
    const analyzed = path.join(temporary, "analyzed.yaml");
    const refreshed = runPython(documentScript, ["analyze", "--input", artifact, "--output", analyzed]);
    assert.equal(refreshed.status, 0);
    assert.equal(runPython(documentScript, ["validate", "--input", analyzed]).status, 0);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

void test("Python full workflow starts with a local gate without owning ResearchSpec control", () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "paper-humanizer-workflow-"));
  try {
    const input = path.join(temporary, "demo.md");
    const artifact = path.join(temporary, "document.yaml");
    const workspace = path.join(temporary, "work");
    writeFileSync(input, "A plain sentence for a deterministic workflow test.\n");
    assert.equal(runPython(documentScript, ["extract", "--input", input, "--format", "auto", "--output", artifact]).status, 0);
    const initialized = runPython(workflowScript, ["init", "--document", artifact, "--workspace", workspace]);
    assert.equal(initialized.status, 0);
    const gate = runPython(workflowScript, ["gate", "--workspace", workspace]);
    assert.equal(gate.status, 0);
    assert.equal((gate.output.summary as { next_action?: string }).next_action, "record_review");
    assert.equal(existsSync(path.join(workspace, "state.yaml")), true);
    assert.equal(existsSync(path.join(workspace, "review-report.md")), true);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
