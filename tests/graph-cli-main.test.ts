import assert from "node:assert/strict";
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { ExitPromptError } from "@inquirer/core";
import { parse as parseYaml, stringify } from "yaml";

import { handleGraphInit, type GraphBootstrapPromptPort } from "../src/cli/handlers/graph-bootstrap.js";
import { CliError, type CommandContext } from "../src/cli/types.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("source-compiled CLI initializes and completes a schema 2 graph workspace", async () => {
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
      route_ref: "deep-research:quick",
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

    const afterStart = parseEnvelope<{ frontier: Array<{ selector: string }>; run_summaries: Array<{ run_id: string; profile_id: string; unfinished: boolean; declared_delivery: { outputs: Array<{ role: string; purpose?: string }> }; next_inspections: string[] }> }>(runCli(["status", "--json"], root));
    assert.equal(afterStart.data?.frontier[0]?.selector, `node:${runId}/rq`);
    const [activeSummary] = afterStart.data?.run_summaries ?? [];
    assert.equal(activeSummary?.run_id, runId);
    assert.equal(activeSummary?.profile_id, "minimal");
    assert.equal(activeSummary?.unfinished, true);
    assert.deepEqual(activeSummary?.declared_delivery.outputs.map((output) => [output.role, output.purpose]),
      [["rq_brief", "research question brief"], ["research_report", "research report"]]);
    assert.deepEqual(activeSummary?.next_inspections, [`instructions node:${runId}/rq`]);

    const advanceInput = path.join(root, "advance.yaml");
    const steps = [
      { nodeId: "rq", role: "rq_brief", path: "rq-brief.md" },
      { nodeId: "methodology", role: "methodology_blueprint", path: "methodology.md" },
      { nodeId: "literature", role: "annotated_bibliography", path: "bibliography.md" },
      { nodeId: "grading", role: "graded_sources", path: "graded-sources.md" },
      { nodeId: "synthesis", role: "synthesis_report", path: "synthesis.md" },
      { nodeId: "report", role: "research_report", path: "report.md" },
    ];
    for (const [index, step] of steps.entries()) {
      await writeFile(advanceInput, stringify({ outputs: [{ role: step.role, path: step.path }] }), "utf8");
      await writeFile(path.join(root, step.path), `${step.role}\n`, "utf8");
      assert.equal(runCli(["advance", `node:${runId}/${step.nodeId}`, "--input", advanceInput, "--json"], root).status, 0, step.nodeId);
      if (index < steps.length - 1) {
        const next = steps[index + 1];
        const statusAfterAdvance = parseEnvelope<{ frontier: Array<{ selector: string }> }>(runCli(["status", "--json"], root));
        assert.equal(statusAfterAdvance.data?.frontier[0]?.selector, `node:${runId}/${next?.nodeId}`);
        if (next?.nodeId === "report") {
          const reportInstructions: { data: { resolved_inputs: Array<{ role: string }> } | null } = parseEnvelope(runCli(["instructions", `node:${runId}/report`, "--json"], root));
          assert.deepEqual(reportInstructions.data?.resolved_inputs.map((resolved) => resolved.role), ["synthesis_report", "methodology_blueprint"]);
        }
      }
    }
    const runPath = path.join(workspace, "runs", runId, "run.yaml");
    const completedRun = await readFile(runPath, "utf8");
    assert.equal((parseYaml(completedRun) as { status: string }).status, "complete");
    const completed = parseEnvelope<{ runs: { active: number }; frontier: unknown[]; run_summaries: unknown[] }>(runCli(["status", "--json"], root));
    assert.equal(completed.data?.runs.active, 0);
    assert.deepEqual(completed.data?.frontier, []);
    assert.deepEqual(completed.data?.run_summaries, []);
    const instructions = parseEnvelope<{ completion_ready: boolean; summary: { run_id: string; profile_id: string; unfinished: boolean; next_inspections: string[] } }>(runCli(["instructions", `run:${runId}`, "--json"], root));
    assert.equal(instructions.data?.completion_ready, true);
    assert.deepEqual(
      { run_id: instructions.data?.summary.run_id, profile_id: instructions.data?.summary.profile_id, unfinished: instructions.data?.summary.unfinished, next_inspections: instructions.data?.summary.next_inspections },
      { run_id: runId, profile_id: "minimal", unfinished: false, next_inspections: [] },
    );
    const rejected = parseEnvelope(runCli(["advance", `node:${runId}/report`, "--input", advanceInput, "--json"], root));
    assert.equal(rejected.error?.code, "run_not_active");
    assert.equal(await readFile(runPath, "utf8"), completedRun);
    assert.equal(parseEnvelope(runCli(["check", "all", "--strict", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["check", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["doctor", "--json"], root)).ok, true);
    assert.ok(workspace);
  } finally {
    await cleanup(root);
  }
});

void test("graph init prompts for tools and Adapters and preserves omitted machine selections", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, ".qwen"));
    const calls: Array<Parameters<GraphBootstrapPromptPort["multiSelect"]>[0]> = [];
    const prompts: GraphBootstrapPromptPort = {
      confirm: () => Promise.resolve(false),
      multiSelect(config) {
        calls.push(config);
        return Promise.resolve(config.id === "agent-tools" ? ["qwen"] : ["zotero-library"]);
      },
    };
    const context: CommandContext = {
      command: "init", cwd: root, json: false, dryRun: false, force: false, yes: true, quiet: false, interactive: true,
    };

    const initialized = await handleGraphInit(root, {}, context, prompts);
    assert.equal(initialized.ok, true);
    assert.deepEqual(calls.map((call) => call.id), ["agent-tools", "literature-adapters"]);
    const qwen = calls[0]?.choices.find((choice) => choice.value === "qwen");
    assert.deepEqual({ detected: qwen?.detected, preSelected: qwen?.preSelected }, { detected: true, preSelected: true });
    const zotero = calls[1]?.choices.find((choice) => choice.value === "zotero-library");
    assert.deepEqual({ configured: zotero?.configured, preSelected: zotero?.preSelected }, { configured: false, preSelected: false });

    const preserved = parseEnvelope<{ selected_tools: string[]; selected_literature_adapters: string[] }>(runCli(["init", root, "--json"], root));
    assert.deepEqual(preserved.data?.selected_tools, ["qwen"]);
    assert.deepEqual(preserved.data?.selected_literature_adapters, ["zotero-library"]);

    const reconfigureCalls: typeof calls = [];
    await handleGraphInit(root, {}, context, {
      confirm: () => { throw new Error("Existing search selection must be preserved"); },
      multiSelect(config) {
        reconfigureCalls.push(config);
        return Promise.resolve([]);
      },
    });
    assert.deepEqual(reconfigureCalls.map((call) => call.id), ["agent-tools", "literature-adapters"]);
    const configuredQwen = reconfigureCalls[0]?.choices.find((choice) => choice.value === "qwen");
    assert.deepEqual({ configured: configuredQwen?.configured, preSelected: configuredQwen?.preSelected }, { configured: true, preSelected: true });
    const config = parseYaml(await readFile(path.join(root, "researchspec/config.yaml"), "utf8")) as {
      agent_tools: { selected: string[] };
      literature_adapters: { selected: string[] };
    };
    assert.deepEqual(config.agent_tools.selected, []);
    assert.deepEqual(config.literature_adapters.selected, []);

    const configPath = path.join(root, "researchspec/config.yaml");
    const beforeCancellation = await readFile(configPath, "utf8");
    await assert.rejects(
      handleGraphInit(root, {}, context, { multiSelect: () => Promise.reject(new ExitPromptError("SIGINT")), confirm: () => Promise.resolve(false) }),
      (error: unknown) => error instanceof CliError && error.code === "cancelled",
    );
    assert.equal(await readFile(configPath, "utf8"), beforeCancellation);
  } finally {
    await cleanup(root);
  }
});

void test("fresh machine init requires an explicit or detected tool selection", async () => {
  const root = await tempProject();
  try {
    const result = parseEnvelope(runCli(["init", root, "--json"], root, { HOME: path.join(root, "home") }));
    assert.equal(result.ok, false);
    assert.equal(result.error?.code, "tools_required");
    await assert.rejects(access(path.join(root, "researchspec")));
  } finally {
    await cleanup(root);
  }
});

void test("source-compiled CLI consumes writing handoffs and forwards research child outputs", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope<{ workspace: string }>(runCli(["init", root, "--tools", "none", "--json"]));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));
    const workspace = initialized.data?.workspace ?? path.join(root, "researchspec");
    const bibliography = "research/bibliography.md";
    const synthesis = "research/synthesis.md";
    await mkdir(path.join(root, "research"), { recursive: true });
    await writeFile(path.join(root, bibliography), "Annotated bibliography\n", "utf8");
    await writeFile(path.join(root, synthesis), "Synthesis report\n", "utf8");

    const writingStart = path.join(root, "writing-start.yaml");
    await writeFile(writingStart, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-15T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "intake",
      route_ref: "academic-paper:full",
      prerequisites: [],
      handoff_inputs: [
        { role: "annotated_bibliography", type: "markdown", path: bibliography, purpose: "Research bibliography." },
        { role: "synthesis_report", type: "markdown", path: synthesis, purpose: "Research synthesis." },
      ],
      planned_outputs: [{ role: "manuscript_draft", type: "markdown", path: "paper/draft.md", purpose: "Draft manuscript." }],
      formal_gates: [],
      cost: { effort: "medium", interaction: "iterative" },
    }), "utf8");
    const writing = parseEnvelope<{ run_id: string }>(runCli(["start", "academic-paper", "--input", writingStart, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(writing.ok, true, JSON.stringify(writing.error));
    const writingRunId = writing.data?.run_id;
    assert.ok(writingRunId);

    const advance = path.join(root, "advance.yaml");
    await writeFile(path.join(root, "writing-config.md"), "Writing configuration\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "writing_configuration", path: "writing-config.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writingRunId}/intake`, "--input", advance, "--json"], root).status, 0);

    const nodesDirectory = path.join(workspace, "runs", writingRunId, "nodes");
    const beforeMissing = await readdir(nodesDirectory);
    await rm(path.join(root, bibliography));
    await writeFile(advance, stringify({ outputs: [{ role: "paper_outline", path: "paper/outline.md" }] }), "utf8");
    const missing = parseEnvelope(runCli(["advance", `node:${writingRunId}/structure`, "--input", advance, "--json"], root));
    assert.equal(missing.ok, false);
    assert.equal(missing.error?.code, "boundary_input_missing");
    assert.deepEqual(await readdir(nodesDirectory), beforeMissing);

    await mkdir(path.join(root, "paper"), { recursive: true });
    await writeFile(path.join(root, bibliography), "Annotated bibliography\n", "utf8");
    await writeFile(path.join(root, "paper/outline.md"), "Outline\n", "utf8");
    assert.equal(runCli(["advance", `node:${writingRunId}/structure`, "--input", advance, "--json"], root).status, 0);
    await writeFile(path.join(root, "paper/argument.md"), "Argument\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "argument_blueprint", path: "paper/argument.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writingRunId}/argument`, "--input", advance, "--json"], root).status, 0);
    await writeFile(path.join(root, "paper/draft.md"), "Draft\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "manuscript_draft", path: "paper/draft.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writingRunId}/draft`, "--input", advance, "--json"], root).status, 0);

    const pipelineStart = path.join(root, "pipeline-start.yaml");
    await writeFile(pipelineStart, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-16T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "research",
      route_ref: "academic-pipeline:end-to-end",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [
        { role: "research_report", type: "markdown", path: "pipeline/report.md", purpose: "Research report." },
        { role: "annotated_bibliography", type: "markdown", path: "pipeline/bibliography.md", purpose: "Annotated bibliography." },
        { role: "synthesis_report", type: "markdown", path: "pipeline/synthesis.md", purpose: "Synthesis report." },
        { role: "manuscript_draft", type: "markdown", path: "pipeline/draft.md", purpose: "Draft manuscript." },
      ],
      formal_gates: ["research-gate"],
      cost: { effort: "high", interaction: "long_horizon" },
    }), "utf8");
    const pipeline = parseEnvelope<{ run_id: string }>(runCli(["start", "academic-pipeline", "--input", pipelineStart, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(pipeline.ok, true, JSON.stringify(pipeline.error));
    const pipelineRunId = pipeline.data?.run_id;
    assert.ok(pipelineRunId);
    const research = parseEnvelope<{ run_id: string }>(runCli(["start", `node:${pipelineRunId}/research`, "--json"], root));
    assert.equal(research.ok, true, JSON.stringify(research.error));
    const researchRunId = research.data?.run_id;
    assert.ok(researchRunId);

    const researchSteps = [
      ["research-question", "rq_brief", "pipeline/rq.md"],
      ["methodology", "methodology_blueprint", "pipeline/methodology.md"],
      ["literature", "annotated_bibliography", "pipeline/bibliography.md"],
      ["grading", "graded_sources", "pipeline/graded.md"],
      ["synthesis", "synthesis_report", "pipeline/synthesis.md"],
      ["report", "research_report", "pipeline/report.md"],
    ] as const;
    await mkdir(path.join(root, "pipeline"), { recursive: true });
    for (const [nodeId, role, outputPath] of researchSteps) {
      await writeFile(path.join(root, outputPath), `${role}\n`, "utf8");
      await writeFile(advance, stringify({ outputs: [{ role, path: outputPath }] }), "utf8");
      const advanced = runCli(["advance", `node:${researchRunId}/${nodeId}`, "--input", advance, "--json"], root);
      assert.equal(advanced.status, 0, `${nodeId}: ${advanced.stdout}`);
      if (nodeId === "research-question") {
        assert.equal(runCli(["decide", `gate:${researchRunId}/rq-gate`, "--verdict", "pass", "--actor-name", "researcher", "--reason", "Approved.", "--json"], root).status, 0);
      }
    }
    assert.equal(runCli(["decide", `gate:${pipelineRunId}/research-gate`, "--verdict", "pass", "--actor-name", "researcher", "--reason", "Approved.", "--json"], root).status, 0);
    const write = parseEnvelope<{ run_id: string }>(runCli(["start", `node:${pipelineRunId}/write`, "--json"], root));
    assert.equal(write.ok, true, JSON.stringify(write.error));
    const writeRunId = write.data?.run_id;
    assert.ok(writeRunId);

    await writeFile(path.join(root, "pipeline/writing-config.md"), "Writing configuration\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "writing_configuration", path: "pipeline/writing-config.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writeRunId}/intake`, "--input", advance, "--json"], root).status, 0);
    const structure = parseEnvelope<{ resolved_inputs: Array<{ role: string; path?: string }> }>(runCli(["instructions", `node:${writeRunId}/structure`, "--json"], root));
    assert.deepEqual(structure.data?.resolved_inputs.find((input) => input.role === "annotated_bibliography")?.path, "pipeline/bibliography.md");
    await writeFile(path.join(root, "pipeline/outline.md"), "Outline\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "paper_outline", path: "pipeline/outline.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writeRunId}/structure`, "--input", advance, "--json"], root).status, 0);
    await writeFile(path.join(root, "pipeline/argument.md"), "Argument\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "argument_blueprint", path: "pipeline/argument.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writeRunId}/argument`, "--input", advance, "--json"], root).status, 0);
    const draft = parseEnvelope<{ resolved_inputs: Array<{ role: string; path?: string }> }>(runCli(["instructions", `node:${writeRunId}/draft`, "--json"], root));
    assert.deepEqual(draft.data?.resolved_inputs.find((input) => input.role === "synthesis_report")?.path, "pipeline/synthesis.md");
    await writeFile(path.join(root, "pipeline/draft.md"), "Draft\n", "utf8");
    await writeFile(advance, stringify({ outputs: [{ role: "manuscript_draft", path: "pipeline/draft.md" }] }), "utf8");
    assert.equal(runCli(["advance", `node:${writeRunId}/draft`, "--input", advance, "--json"], root).status, 0);
  } finally {
    await cleanup(root);
  }
});

void test("source-compiled CLI rejects schema 1 workspaces", async () => {
  const root = await tempProject();
  try {
    const workspace = path.join(root, "researchspec");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(workspace, { recursive: true });
    const configPath = path.join(workspace, "config.yaml");
    const config = stringify({ schema_version: "1", agent_tools: { selected: [], delivery: "skills" }, literature_adapters: { selected: [] }, plugins: { selected: [] } });
    await writeFile(configPath, config, "utf8");
    const status = runCli(["status", "--json"], root);
    assert.notEqual(status.status, 0);
    assert.match(status.stdout, /workspace_unsupported/);
    const update = runCli(["update", "--tools", "none", "--json"], root);
    assert.notEqual(update.status, 0);
    assert.match(update.stdout, /workspace_unsupported/);
    assert.equal(await readFile(configPath, "utf8"), config);
  } finally {
    await cleanup(root);
  }
});

void test("graph init projects only Navigate into selected Agent tools", async () => {
  const root = await tempProject();
  try {
    const codexHome = path.join(root, "codex-home");
    const initialized = parseEnvelope<{ projected_capability_files: number }>(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root, { CODEX_HOME: codexHome }));
    assert.equal(initialized.ok, true);
    assert.equal(initialized.data?.projected_capability_files ?? 0, 0);
    await access(path.join(root, ".agents", "skills", "researchspec-navigate", "SKILL.md"));
    const executor = path.join(root, ".codex", "agents", "researchspec-executor.toml");
    const reviewer = path.join(root, ".codex", "agents", "researchspec-reviewer.toml");
    await access(executor);
    await access(reviewer);
    const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as {
      installations: Array<{ source: { kind?: string } }>;
    };
    assert.equal(manifest.installations.filter((item) => item.source.kind === "custom-agent").length, 2);
    await assert.rejects(access(path.join(root, ".agents", "skills", "design-research-question-formulation", "SKILL.md")));
    assert.equal(runCli(["update", "--tools", "none", "--json"], root, { CODEX_HOME: codexHome }).status, 0);
    await assert.rejects(access(executor));
    await assert.rejects(access(reviewer));
  } finally {
    await cleanup(root);
  }
});

void test("list tools exposes discovery fallbacks and doctor reports entry warnings without writes", async () => {
  const root = await tempProject();
  try {
    const catalog = parseEnvelope<{ items: Array<{ tool_id: string; entry: { mechanism: string; runtime_status: string } }> }>(
      runCli(["list", "tools", "--limit", "50", "--json"], root),
    );
    assert.equal(catalog.ok, true);
    assert.equal(catalog.data?.items.length, 36);
    assert.equal(catalog.data?.items.filter((item) => item.entry.mechanism === "discovery").length, 30);
    assert.ok(catalog.data?.items.every((item) => item.entry.runtime_status === "unverified"));

    assert.equal(runCli(["init", root, "--tools", "codex", "--json"], root).status, 0);
    const agreement = path.join(root, "AGENTS.md");
    const installed = await readFile(agreement);
    await writeFile(path.join(root, "AGENTS.override.md"), "# Local override\n", "utf8");
    const shadowed = parseEnvelope<{ diagnostics: Array<{ code: string }> }>(runCli(["doctor", "--json"], root));
    assert.equal(shadowed.ok, true);
    assert.ok(shadowed.data?.diagnostics.some((item) => item.code === "project_entry_shadowed"));
    assert.match(runCli(["doctor"], root).stdout, /project_entry_shadowed/);
    assert.deepEqual(await readFile(agreement), installed);

    await rm(agreement);
    const missing = parseEnvelope<{ diagnostics: Array<{ code: string }> }>(runCli(["doctor", "--json"], root));
    assert.equal(missing.ok, true);
    assert.ok(missing.data?.diagnostics.some((item) => item.code === "project_entry_missing"));
    assert.match(runCli(["doctor"], root).stdout, /project_entry_missing/);
    await assert.rejects(access(agreement));
  } finally {
    await cleanup(root);
  }
});
