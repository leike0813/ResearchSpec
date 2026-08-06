import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { strFromU8, unzipSync } from "fflate";

import { COMPANION_INTENTS, renderCompanionSkill } from "../src/adapters/companion/index.js";
import { sha256 } from "../src/core/workspace/write-plan.js";
import { MIT_LICENSE_TEXT } from "../src/licensing.js";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("fresh init creates only the current workspace authority tree", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    assert.deepEqual((await readdir(workspace)).sort(), ["changes", "config.yaml", "profiles", "specs", "subflows", "tool-installation-manifest.json"]);
    for (const relativePath of ["runs", "playbooks", "draft-patches", "artifact-registry.json"]) assert.equal(existsSync(path.join(workspace, relativePath)), false);
    const config = await readFile(path.join(workspace, "config.yaml"), "utf8");
    assert.match(config, /^schema_version: "1"$/m);
    assert.match(config, /^literature_adapters:\n {2}selected: \[\]$/m);
    assert.doesNotMatch(config, /^profile:/m);
    assert.match(await readFile(path.join(workspace, "specs/manuscript.yaml"), "utf8"), /delivery:\n {2}working_format: null\n {2}final_output_format: null/);
    const manifest = JSON.parse(await readFile(path.join(workspace, "tool-installation-manifest.json"), "utf8")) as { installations: Array<{ owner: string; source: { kind: string } }>; literature_adapter_resolutions: unknown[] };
    assert.equal(manifest.installations.filter((item) => item.owner === "framework" && item.source.kind === "framework-profile").length, 3);
    assert.deepEqual(manifest.literature_adapter_resolutions, []);
    assert.equal(existsSync(path.join(root, ".zotero-bridge")), false);
    const status = parseEnvelope<{ literature_adapters: Array<{ adapter_id: string; state: string; diagnostics: unknown[] }> }>(runCli(["status", "--json"], root));
    assert.equal(status.ok, true);
    assert.deepEqual(status.data?.literature_adapters.map((adapter) => ({ adapter_id: adapter.adapter_id, state: adapter.state })), [
      { adapter_id: "zotero-library", state: "not-selected" },
    ]);
    assert.deepEqual(status.data?.literature_adapters[0]?.diagnostics, []);
    assert.equal(parseEnvelope(runCli(["check", "profiles", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["doctor", "--json"], root)).ok, true);
    assert.deepEqual(parseEnvelope<{ domains: unknown[] }>(runCli(["plugin", "list", "--installed", "--json"], root)).data?.domains, []);
    const refreshed = parseEnvelope(runCli(["init", root, "--tools", "none", "--json"]));
    assert.equal(refreshed.ok, true);
    assert.equal(refreshed.command, "init");
  } finally {
    await cleanup(root);
  }
});

void test("new workspaces default to Skills and delivery switches reconcile both surfaces", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope<{
      delivery: string;
      next_steps: string[];
      plan: { counts: Record<string, number>; directories: Array<{ directory: string }> };
    }>(runCli(["init", root, "--tools", "codex,kimi,qwen", "--json"]));
    assert.equal(initialized.ok, true);
    assert.equal(initialized.data?.delivery, "skills");
    assert.ok(initialized.data?.next_steps.includes("Codex: $researchspec-navigate"));
    assert.ok(initialized.data?.next_steps.includes("Kimi Code: /skill:researchspec-navigate"));
    assert.equal(Array.isArray(initialized.data?.plan), false);
    assert.equal(JSON.stringify(initialized.data?.plan).includes("SKILL.md"), false);
    assert.equal(existsSync(path.join(root, ".agents/skills/researchspec-navigate/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".kimi-code/skills/researchspec-navigate/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".qwen/skills/researchspec-navigate/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".qwen/commands/researchspec-status.md")), false);

    const commands = parseEnvelope<{ delivery: string }>(runCli(["update", "--delivery", "commands", "--json"], root));
    assert.equal(commands.ok, true);
    assert.equal(commands.data?.delivery, "commands");
    assert.equal(existsSync(path.join(root, ".agents/skills/researchspec-navigate/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".kimi-code/skills/researchspec-navigate/SKILL.md")), false);
    assert.equal(existsSync(path.join(root, ".qwen/skills/researchspec-navigate/SKILL.md")), false);
    assert.equal(existsSync(path.join(root, ".qwen/commands/researchspec-status.md")), true);

    const both = parseEnvelope<{ delivery: string }>(runCli(["update", "--delivery", "both", "--json"], root));
    assert.equal(both.ok, true);
    assert.equal(both.data?.delivery, "both");
    assert.equal(existsSync(path.join(root, ".kimi-code/skills/researchspec-navigate/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".qwen/skills/researchspec-navigate/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".qwen/commands/researchspec-status.md")), true);
  } finally {
    await cleanup(root);
  }
});

void test("Codex and Kimi migrate known Skills while preserving personal files and prompt cleanup stays allowlisted", async () => {
  const root = await tempProject();
  const codexHome = path.join(root, "codex-home");
  const promptRoot = path.join(codexHome, "prompts");
  const intent = COMPANION_INTENTS.find((item) => item.skillId === "researchspec-propose");
  assert.ok(intent);
  try {
    for (const legacyRoot of [".codex", ".kimi"]) {
      const skillRoot = path.join(root, legacyRoot, "skills/researchspec-propose");
      await mkdir(skillRoot, { recursive: true });
      await writeFile(path.join(skillRoot, "SKILL.md"), renderCompanionSkill(intent), "utf8");
      await writeFile(path.join(skillRoot, "LICENSE"), MIT_LICENSE_TEXT, "utf8");
      await mkdir(path.join(root, legacyRoot, "skills/personal-skill"), { recursive: true });
      await writeFile(path.join(root, legacyRoot, "skills/personal-skill/SKILL.md"), "personal\n", "utf8");
    }
    await writeFile(path.join(root, ".kimi/config.toml"), "personal = true\n", "utf8");
    await mkdir(promptRoot, { recursive: true });
    await writeFile(path.join(promptRoot, "researchspec-status.md"), "legacy generated prompt\n", "utf8");
    await writeFile(path.join(promptRoot, "researchspec-personal.md"), "personal prompt\n", "utf8");

    const initialized = runCli(["init", root, "--tools", "codex,kimi", "--json"], root, { CODEX_HOME: codexHome });
    assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
    assert.equal(existsSync(path.join(root, ".agents/skills/researchspec-propose/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".kimi-code/skills/researchspec-propose/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".codex/skills/researchspec-propose")), false);
    assert.equal(existsSync(path.join(root, ".kimi/skills/researchspec-propose")), false);
    assert.equal(await readFile(path.join(root, ".codex/skills/personal-skill/SKILL.md"), "utf8"), "personal\n");
    assert.equal(await readFile(path.join(root, ".kimi/skills/personal-skill/SKILL.md"), "utf8"), "personal\n");
    assert.equal(await readFile(path.join(root, ".kimi/config.toml"), "utf8"), "personal = true\n");
    assert.equal(existsSync(path.join(promptRoot, "researchspec-status.md")), false);
    assert.equal(await readFile(path.join(promptRoot, "researchspec-personal.md"), "utf8"), "personal prompt\n");

    await writeFile(path.join(promptRoot, "researchspec-status.md"), "legacy generated prompt\n", "utf8");
    const deferred = parseEnvelope(runCli(["update", "--json"], root, { CODEX_HOME: codexHome }));
    assert.equal(deferred.ok, true);
    assert.equal(existsSync(path.join(promptRoot, "researchspec-status.md")), true);
    assert.ok(deferred.diagnostics.some((item) => JSON.stringify(item).includes("legacy_global_cleanup_deferred")));
    assert.equal(runCli(["update", "--force", "--json"], root, { CODEX_HOME: codexHome }).status, 0);
    assert.equal(existsSync(path.join(promptRoot, "researchspec-status.md")), false);
    assert.equal(await readFile(path.join(promptRoot, "researchspec-personal.md"), "utf8"), "personal prompt\n");
  } finally {
    await cleanup(root);
  }
});

void test("explicit Zotero selection installs the adapter and update can cleanly deselect it", async () => {
  const root = await tempProject();
  try {
    const initialized = runCli(["init", root, "--tools", "forgecode", "--literature-adapters", "zotero-library", "--json"]);
    assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
    assert.equal(existsSync(path.join(root, ".zotero-bridge/bin/zotero-bridge")), true);
    assert.equal(existsSync(path.join(root, ".forge/skills/zotero-library-agent/SKILL.md")), true);
    assert.match(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /^literature_adapters:\n {2}selected:\n {4}- zotero-library$/m);

    const preserved = runCli(["update", "--tools", "forgecode", "--json"], root);
    assert.equal(preserved.status, 0, preserved.stderr || preserved.stdout);
    assert.equal(existsSync(path.join(root, ".zotero-bridge/bin/zotero-bridge")), true);

    const deselected = runCli(["update", "--literature-adapters", "none", "--json"], root);
    assert.equal(deselected.status, 0, deselected.stderr || deselected.stdout);
    assert.equal(existsSync(path.join(root, ".zotero-bridge/bin/zotero-bridge")), false);
    assert.equal(existsSync(path.join(root, ".forge/skills/zotero-library-agent/SKILL.md")), false);
    assert.match(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /^literature_adapters:\n {2}selected: \[\]$/m);
    const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as {
      installations: Array<{ source: { kind: string } }>;
      literature_adapter_resolutions: unknown[];
    };
    assert.equal(manifest.installations.some((item) => item.source.kind === "literature-adapter"), false);
    assert.deepEqual(manifest.literature_adapter_resolutions, []);
    const status = parseEnvelope<{ literature_adapters: Array<{ state: string; diagnostics: unknown[] }> }>(runCli(["status", "--json"], root));
    assert.equal(status.data?.literature_adapters[0]?.state, "not-selected");
    assert.deepEqual(status.data?.literature_adapters[0]?.diagnostics, []);
  } finally {
    await cleanup(root);
  }
});

void test("deselecting Zotero preserves locally modified managed files and reports retained evidence", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode", "--literature-adapters", "zotero-library"]).status, 0);
    const skillPath = path.join(root, ".forge/skills/zotero-library-agent/SKILL.md");
    await writeFile(skillPath, "locally modified adapter skill\n", "utf8");
    const deselected = runCli(["update", "--literature-adapters", "none", "--json"], root);
    assert.equal(deselected.status, 0, deselected.stderr || deselected.stdout);
    assert.equal(await readFile(skillPath, "utf8"), "locally modified adapter skill\n");
    const status = parseEnvelope<{ literature_adapters: Array<{ state: string; diagnostics: Array<{ code: string }> }> }>(runCli(["status", "--json"], root));
    assert.equal(status.data?.literature_adapters[0]?.state, "not-selected");
    assert.equal(status.data?.literature_adapters[0]?.diagnostics.some((diagnostic) => diagnostic.code === "literature_adapter_not_selected_files_retained"), true);
  } finally {
    await cleanup(root);
  }
});

void test("unknown literature adapter expressions fail before workspace creation", async () => {
  const root = await tempProject();
  try {
    const result = runCli(["init", root, "--tools", "none", "--literature-adapters", "unknown-adapter", "--json"]);
    assert.equal(result.status, 2);
    assert.equal(parseEnvelope(result).error?.code, "invalid_literature_adapters");
    assert.equal(existsSync(path.join(root, "researchspec")), false);
  } finally {
    await cleanup(root);
  }
});

void test("packaged instructions stay read-only and QMD format start requires available Quarto", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const manuscriptPath = path.join(workspace, "specs/manuscript.yaml");
    const initial = await readFile(manuscriptPath, "utf8");
    const beforeEntries = await readdir(root);
    const instructions = parseEnvelope<{
      manuscript_delivery: { selection_required: boolean };
      tool_requirements: { quarto: { probe_command: string[]; read_only: boolean } };
    }>(runCli(["instructions", "route:academic-paper:full", "--json"], root));
    assert.equal(instructions.data?.manuscript_delivery.selection_required, true);
    assert.deepEqual(instructions.data?.tool_requirements.quarto.probe_command, ["quarto", "--version"]);
    assert.equal(instructions.data?.tool_requirements.quarto.read_only, true);
    assert.equal(await readFile(manuscriptPath, "utf8"), initial);
    assert.deepEqual(await readdir(root), beforeEntries);

    await writeFile(manuscriptPath, initial
      .replace("working_format: null", "working_format: qmd")
      .replace("final_output_format: null", "final_output_format: pdf"), "utf8");
    await writeFile(path.join(root, "paper.qmd"), "---\ntitle: Test\n---\n\n# Paper\n", "utf8");
    const inputPath = path.join(root, "format-start.json");
    const base = {
      schema_version: "1",
      confirmed_at: "2026-08-05T12:00:00+08:00",
      prerequisites: [],
      handoff_inputs: [{ role: "manuscript_source", type: "manuscript", path: "paper.qmd", purpose: "render", format: "qmd" }],
      planned_outputs: [{ role: "formatted_manuscript", type: "manuscript", path: "paper.pdf", purpose: "submit", format: "pdf", renderer: "quarto" }],
      manuscript_delivery: { working_format: "qmd", final_output_format: "pdf" },
      formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    };
    await writeFile(inputPath, JSON.stringify({ ...base, quarto_probe: { status: "unavailable", checked_at: base.confirmed_at, reason: "not installed" } }), "utf8");
    assert.equal(parseEnvelope(runCli(["start", "academic-paper:format-convert", "--input", inputPath, "--confirmed-by", "researcher", "--json"], root)).error?.code, "quarto_unavailable");
    await writeFile(inputPath, JSON.stringify({ ...base, quarto_probe: { status: "unknown", checked_at: base.confirmed_at, reason: "timeout" } }), "utf8");
    assert.equal(parseEnvelope(runCli(["start", "academic-paper:format-convert", "--input", inputPath, "--confirmed-by", "researcher", "--json"], root)).error?.code, "quarto_status_unknown");
    await writeFile(inputPath, JSON.stringify({ ...base, quarto_probe: { status: "available", checked_at: base.confirmed_at, version: "1.7.32" } }), "utf8");
    assert.equal(runCli(["start", "academic-paper:format-convert", "--input", inputPath, "--confirmed-by", "researcher", "--json"], root).status, 0);

    await writeFile(inputPath, JSON.stringify({ ...base, manuscript_delivery: { working_format: "markdown", final_output_format: null } }), "utf8");
    assert.equal(parseEnvelope(runCli(["start", "academic-paper:format-convert", "--input", inputPath, "--confirmed-by", "researcher", "--json"], root)).error?.code, "manuscript_delivery_snapshot_stale");
  } finally {
    await cleanup(root);
  }
});

void test("unsupported workspace is rejected without mutation", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await mkdir(path.join(workspace, "runs/current"), { recursive: true });
    const configPath = path.join(workspace, "config.yaml");
    const statePath = path.join(workspace, "runs/current/state.yaml");
    await writeFile(configPath, "schema_version: \"0.1\"\nprofile: adaptive\n", "utf8");
    await writeFile(statePath, "semantic: user-data\n", "utf8");
    for (const command of [["status", "--json"], ["check", "--json"], ["doctor", "--json"], ["update", "--tools", "none", "--json"]]) {
      const result = runCli(command, root);
      assert.equal(result.status, 1, command.join(" "));
      assert.equal(parseEnvelope(result).error?.code, "workspace_unsupported");
    }
    assert.equal(await readFile(configPath, "utf8"), "schema_version: \"0.1\"\nprofile: adaptive\n");
    assert.equal(await readFile(statePath, "utf8"), "semantic: user-data\n");
  } finally {
    await cleanup(root);
  }
});

void test("profile drift is reported, preserved, and force-refreshable", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const profile = path.join(root, "researchspec/profiles/academic-pipeline.yaml");
    await writeFile(profile, "schema_version: \"1\"\nprofile_id: drifted\n", "utf8");
    assert.equal(parseEnvelope(runCli(["check", "profiles", "--json"], root)).ok, false);
    assert.equal(runCli(["update", "--tools", "none"], root).status, 0);
    assert.equal(await readFile(profile, "utf8"), "schema_version: \"1\"\nprofile_id: drifted\n");
    assert.equal(runCli(["update", "--tools", "none", "--force"], root).status, 0);
    assert.match(await readFile(profile, "utf8"), /^profile_id: academic-pipeline$/m);
  } finally {
    await cleanup(root);
  }
});

void test("an unowned existing profile blocks update without claiming ownership", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { installations: Array<{ owner: string }> };
    manifest.installations = manifest.installations.filter((item) => item.owner !== "framework");
    const changed = `${JSON.stringify(manifest, null, 2)}\n`;
    await writeFile(manifestPath, changed, "utf8");
    const update = runCli(["update", "--tools", "none", "--json"], root);
    assert.equal(update.status, 1);
    assert.equal(parseEnvelope(update).error?.code, "static_projection_conflict");
    assert.equal(await readFile(manifestPath, "utf8"), changed);
  } finally {
    await cleanup(root);
  }
});

void test("fresh CLI processes read instructions, start idempotently, decide a Gate and advance the owning control", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const before = await readFile(path.join(workspace, "config.yaml"), "utf8");
    const instructions = runCli(["instructions", "route:deep-research:full", "--json"], root);
    assert.equal(instructions.status, 0);
    assert.equal(parseEnvelope<{ confirmation_required: boolean }>(instructions).data?.confirmation_required, true);
    assert.equal(await readFile(path.join(workspace, "config.yaml"), "utf8"), before);

    const evidence = path.join(root, "outputs/research-report.md");
    await mkdir(path.dirname(evidence), { recursive: true });
    await writeFile(evidence, "report\n", "utf8");
    const startInput = path.join(root, "start.json");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1",
      confirmed_at: "2026-08-02T15:00:00+08:00",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [{ role: "research-report", type: "report", path: "outputs/research-report.md", purpose: "Gate evidence" }],
      formal_gates: ["evidence-quality"],
      cost: { effort: "high", interaction: "long_horizon" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:full", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true);
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    assert.equal(parseEnvelope<{ status: string }>(runCli(["start", "deep-research:full", "--input", startInput, "--confirmed-by", "researcher", "--json"], root)).data?.status, "already_started");
    assert.equal((await readdir(path.join(workspace, "subflows"))).length, 1);

    const decided = runCli(["decide", `gate:${instanceId}/evidence-quality`, "--verdict", "pass", "--reason", "Evidence reviewed.", "--evidence-role", "research-report", "--actor-name", "researcher", "--json"], root);
    assert.equal(decided.status, 0, decided.stderr);
    assert.equal(runCli(["decide", `decision:${instanceId}/scope-choice`, "--kind", "scope", "--choice", "bounded", "--reason", "Keep the stated scope.", "--actor-name", "researcher", "--json"], root).status, 0);
    for (const type of ["subflows", "changes", "gates", "decisions", "handoffs", "profiles", "tools", "diagnostics", "history"]) {
      assert.equal(runCli(["list", type, "--json"], root).status, 0, type);
    }
    for (const selector of [`gate:${instanceId}/evidence-quality`, `decision:${instanceId}/scope-choice`, `handoff:${instanceId}`, "spec:sources"]) {
      assert.equal(runCli(["show", selector, "--json"], root).status, 0, selector);
    }
    const advanced = runCli(["advance", `subflow:${instanceId}`, "--transition", "complete", "--actor-name", "academic-pipeline", "--json"], root);
    assert.equal(advanced.status, 0, advanced.stderr);
    const status = parseEnvelope<{ active_instances: Array<{ instance_id: string }>; subflows: Record<string, number>; frontier: unknown[] }>(runCli(["status", "--json"], root));
    assert.equal(status.data?.subflows.complete, 1);
    assert.equal(status.data?.active_instances.some((item) => item.instance_id === instanceId), false);
  } finally { await cleanup(root); }
});

void test("current start dry-run and unsafe boundary failures are zero-write", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const input = path.join(root, "unsafe-start.json");
    const base = {
      schema_version: "1",
      confirmed_at: "2026-08-02T16:00:00+08:00",
      prerequisites: [], handoff_inputs: [], formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    };
    await writeFile(input, JSON.stringify({ ...base, planned_outputs: [{ role: "brief", type: "report", path: "outputs/future.md", purpose: "result" }] }), "utf8");
    assert.equal(runCli(["start", "deep-research:quick", "--input", input, "--confirmed-by", "researcher", "--dry-run", "--json"], root).status, 0);
    assert.equal((await readdir(path.join(workspace, "subflows"))).length, 0);

    await writeFile(input, JSON.stringify({ ...base, planned_outputs: [{ role: "brief", type: "report", path: "researchspec/leak.md", purpose: "invalid" }] }), "utf8");
    const rejected = runCli(["start", "deep-research:quick", "--input", input, "--confirmed-by", "researcher", "--json"], root);
    assert.equal(rejected.status, 2);
    assert.equal(parseEnvelope(rejected).error?.code, "boundary_path_managed");
    assert.equal((await readdir(path.join(workspace, "subflows"))).length, 0);
  } finally { await cleanup(root); }
});

void test("current handoff update, query, and checks use only the owning files", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const startInput = path.join(root, "start.json");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1", confirmed_at: "2026-08-02T17:00:00+08:00", prerequisites: [], handoff_inputs: [],
      planned_outputs: [{ role: "brief", type: "report", path: "outputs/future.md", purpose: "downstream use" }],
      formal_gates: [], cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:quick", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    const [directoryName] = await readdir(path.join(workspace, "subflows"));
    assert.ok(directoryName);
    const directory = path.join(workspace, "subflows", directoryName);
    const controlPath = path.join(directory, "control.yaml");
    const handoffPath = path.join(directory, "handoff.md");
    const controlBefore = await readFile(controlPath, "utf8");
    const handoffInput = path.join(root, "handoff.json");
    await writeFile(handoffInput, JSON.stringify({
      inputs: [{ role: "upstream-report", type: "report", path: "outputs/not-created.md", purpose: "future consumption" }],
      outputs: [{ role: "brief", type: "report", path: "outputs/future.md", purpose: "downstream use" }],
      body: "# Notes\n\nReady for review.\n",
    }), "utf8");
    assert.equal(runCli(["handoff", `subflow:${instanceId}`, "--input", handoffInput, "--json"], root).status, 0);
    assert.equal(await readFile(controlPath, "utf8"), controlBefore);
    assert.match(await readFile(handoffPath, "utf8"), /upstream-report/);
    assert.equal(runCli(["check", "handoffs", "--json"], root).status, 0);
    const afterUpdate = await readFile(handoffPath, "utf8");
    for (const command of [
      ["status", "--json"], ["list", "subflows", "--json"], ["list", "history", "--json"],
      ["show", `subflow:${instanceId}`, "--json"], ["show", "spec:project", "--json"],
      ["show", "profile:academic-pipeline", "--json"], ["handoff", `subflow:${instanceId}`, "--json"],
    ]) assert.equal(runCli(command, root).status, 0, command.join(" "));
    assert.equal(await readFile(controlPath, "utf8"), controlBefore);
    assert.equal(await readFile(handoffPath, "utf8"), afterUpdate);
  } finally { await cleanup(root); }
});

void test("current project change decisions stay separate from spec edits and resolved changes archive", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const claimsPath = path.join(workspace, "specs/claims.yaml");
    const claimsBefore = await readFile(claimsPath, "utf8");
    assert.equal(runCli(["propose", "accepted-change", "--targets", "claims.yaml", "--with", "design,delta", "--json"], root).status, 0);
    assert.deepEqual((await readdir(path.join(workspace, "changes/accepted-change"))).sort(), ["change.md", "delta.yaml", "design.md"]);
    assert.equal(runCli(["decide", "change:accepted-change", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Reviewed.", "--json"], root).status, 0);
    assert.equal(await readFile(claimsPath, "utf8"), claimsBefore);
    const blocked = runCli(["archive", "accepted-change", "--json"], root);
    assert.equal(blocked.status, 3);
    assert.equal(parseEnvelope(blocked).error?.code, "change_not_archivable");

    assert.equal(runCli(["propose", "rejected-change", "--targets", "project.md", "--json"], root).status, 0);
    assert.equal(runCli(["decide", "change:rejected-change", "--decision", "reject", "--actor-name", "Researcher", "--reason", "Out of scope.", "--json"], root).status, 0);
    assert.equal(runCli(["archive", "rejected-change", "--json"], root).status, 0);
    assert.equal(existsSync(path.join(workspace, "changes/archive/rejected-change/change.md")), true);
    assert.equal(runCli(["show", "change:rejected-change", "--json"], root).status, 0);
  } finally { await cleanup(root); }
});

void test("handoff command can recover a missing handoff without changing control", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const startInput = path.join(root, "start.json");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1", confirmed_at: "2026-08-02T17:30:00+08:00", prerequisites: [], handoff_inputs: [], planned_outputs: [],
      formal_gates: [], cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:quick", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    const [directoryName] = await readdir(path.join(workspace, "subflows"));
    assert.ok(directoryName);
    const directory = path.join(workspace, "subflows", directoryName);
    const controlPath = path.join(directory, "control.yaml");
    const handoffPath = path.join(directory, "handoff.md");
    const controlBefore = await readFile(controlPath, "utf8");
    await rm(handoffPath);
    const semantic = path.join(root, "handoff.json");
    await writeFile(semantic, JSON.stringify({ inputs: [], outputs: [] }), "utf8");
    assert.equal(runCli(["handoff", `subflow:${instanceId}`, "--input", semantic, "--json"], root).status, 0);
    assert.equal(existsSync(handoffPath), true);
    assert.equal(await readFile(controlPath, "utf8"), controlBefore);
  } finally { await cleanup(root); }
});

void test("current packs are deterministic, scoped, and exclude private or external bytes", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const startInput = path.join(root, "start.json");
    await mkdir(path.join(root, "outputs"), { recursive: true });
    await writeFile(path.join(root, "outputs/report.md"), "external secret bytes\n", "utf8");
    await writeFile(path.join(root, "outputs/manuscript.qmd"), "---\nformat: pdf\n---\n\n# Paper\n", "utf8");
    await writeFile(path.join(root, "outputs/manuscript.pdf"), "rendered bytes\n", "utf8");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1", confirmed_at: "2026-08-02T18:00:00+08:00", prerequisites: [], handoff_inputs: [],
      planned_outputs: [
        { role: "report", type: "report", path: "outputs/report.md", purpose: "handoff" },
        { role: "manuscript_source", type: "manuscript", path: "outputs/manuscript.qmd", purpose: "source", format: "qmd" },
        { role: "formatted_manuscript", type: "manuscript", path: "outputs/manuscript.pdf", purpose: "render", format: "pdf", renderer: "quarto" },
      ],
      formal_gates: [], cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:quick", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    assert.equal(runCli(["propose", "pack-change", "--targets", "project.md", "--json"], root).status, 0);
    const [directoryName] = await readdir(path.join(workspace, "subflows"));
    assert.ok(directoryName);
    const directory = path.join(workspace, "subflows", directoryName);
    await writeFile(path.join(directory, "work/private.md"), "private bytes\n", "utf8");
    const first = path.join(root, "first.zip");
    const second = path.join(root, "second.zip");
    assert.equal(runCli(["pack", "--output", first, "--json"], root).status, 0);
    assert.equal(runCli(["pack", "--output", second, "--scope", "all", "--json"], root).status, 0);
    assert.deepEqual(await readFile(first), await readFile(second));
    const archive = unzipSync(await readFile(first));
    const entries = Object.keys(archive).sort();
    assert.ok(entries.includes("manifest.json"));
    assert.ok(entries.some((entry) => entry.endsWith("/control.yaml")));
    assert.ok(entries.some((entry) => entry.endsWith("/handoff.md")));
    assert.equal(entries.some((entry) => entry.includes("/work/")), false);
    assert.equal(entries.some((entry) => entry.startsWith("outputs/")), false);
    assert.equal(entries.some((entry) => /registry|ledger|receipt|runs\//.test(entry)), false);
    const manifestBytes = archive["manifest.json"];
    assert.ok(manifestBytes);
    const manifest = JSON.parse(strFromU8(manifestBytes)) as { entries: Array<{ path: string; sha256: string }> };
    for (const entry of manifest.entries) {
      const entryBytes = archive[entry.path];
      assert.ok(entryBytes);
      assert.equal(sha256(entryBytes), entry.sha256);
    }
    const scoped = path.join(root, "subflow.zip");
    assert.equal(runCli(["pack", "--output", scoped, "--scope", `subflow:${instanceId}`, "--json"], root).status, 0);
    assert.deepEqual(Object.keys(unzipSync(await readFile(scoped))).sort().filter((entry) => entry !== "manifest.json").map((entry) => path.basename(entry)).sort(), ["control.yaml", "handoff.md"]);
    for (const scope of ["specs", "profile", "subflows", "changes", "change:pack-change"]) {
      const scopedOutput = path.join(root, `${scope.replace(/[:]/g, "-")}.zip`);
      assert.equal(runCli(["pack", "--output", scopedOutput, "--scope", scope, "--json"], root).status, 0, scope);
    }
    assert.equal(runCli(["pack", "--output", first, "--json"], root).status, 3);
  } finally { await cleanup(root); }
});
