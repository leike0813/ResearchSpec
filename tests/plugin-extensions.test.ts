import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  loadPluginExtensionRegistry,
  PLUGIN_EXTENSION_ROOT,
  resolveDomainExtensions,
} from "../src/plugins/extensions.js";
import { loadPluginRegistry } from "../src/plugins/registry.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("plugin extension registry loads the ecology pilot package", async () => {
  const extensions = await loadPluginExtensionRegistry();
  assert.equal(extensions.registry.schema_version, "1");
  assert.equal(extensions.capabilities.size, 2);
  assert.equal(extensions.profiles.size, 2);

  const capability = extensions.capabilities.get("plugin-ecology-biodiversity");
  assert.ok(capability);
  assert.equal(capability.manifest.node_kind, "producer");
  assert.equal(capability.manifest.provenance.origin, "vendor-derived");
  assert.equal(capability.files.includes(path.join(PLUGIN_EXTENSION_ROOT, "capabilities/plugin-ecology-biodiversity/SKILL.md")), true);

  const profile = extensions.profiles.get("plugin-ecology-biodiversity");
  assert.ok(profile);
  assert.equal(profile.profile.profile_version, "0.1.0");
  assert.deepEqual(resolveDomainExtensions(extensions, ["ecology"]), {
    capabilityIds: ["plugin-ecology-biodiversity"],
    profileIds: ["plugin-ecology-biodiversity"],
  });

  const plugins = await loadPluginRegistry(undefined, false);
  assert.equal(plugins.domains.get("ecology") !== undefined, true);
  assert.equal(plugins.skills.has("plugin-ecology-biodiversity"), false);
});

void test("plugin graph extensions project and run through the graph engine", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ resolved_capability_ids: string[]; resolved_profile_ids: string[] }>(
      runCli(["plugin", "install", "ecology", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.deepEqual(installed.data?.resolved_capability_ids ?? [], ["plugin-ecology-biodiversity"]);
    assert.deepEqual(installed.data?.resolved_profile_ids ?? [], ["plugin-ecology-biodiversity"]);

    const status = parseEnvelope<{ plugins: { resolved_capability_ids: string[]; resolved_profile_ids: string[]; projected_capability_ids: string[]; projected_profile_ids: string[] } }>(runCli(["status", "--json"], root));
    assert.equal(status.ok, true, JSON.stringify(status.error));
    assert.deepEqual(status.data?.plugins.resolved_capability_ids ?? [], ["plugin-ecology-biodiversity"]);
    assert.deepEqual(status.data?.plugins.resolved_profile_ids ?? [], ["plugin-ecology-biodiversity"]);
    assert.deepEqual(status.data?.plugins.projected_capability_ids ?? [], ["plugin-ecology-biodiversity"]);
    assert.deepEqual(status.data?.plugins.projected_profile_ids ?? [], ["plugin-ecology-biodiversity"]);

    const capabilityPath = path.join(root, ".agents/skills/plugin-ecology-biodiversity/manifest.yaml");
    const profilePath = path.join(root, "researchspec/profiles/plugin-ecology-biodiversity.yaml");
    await readFile(capabilityPath, "utf8");
    await readFile(profilePath, "utf8");

    const startInput = path.join(root, "start.yaml");
    await writeFile(startInput, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-16T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "research",
      prerequisites: [],
      handoff_inputs: [{ role: "task_request", type: "markdown", path: "task.md", purpose: "ecology task" }],
      planned_outputs: [{ role: "research_brief", type: "markdown", path: "brief.md", purpose: "research brief" }],
      formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ run_id: string }>(runCli(["start", "plugin-ecology-biodiversity", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true, JSON.stringify(started.error));
    const runId = started.data?.run_id ?? "";
    assert.match(runId, /^run-[a-f0-9]+$/);

    const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
    assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
    assert.equal(instructions.data?.capability.capability_id, "plugin-ecology-biodiversity");

    const advanceInput = path.join(root, "advance.yaml");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: "brief.md" }] }), "utf8");
    const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
    assert.equal(advanced.ok, true, JSON.stringify(advanced.error));
    assert.equal(advanced.data?.node.state, "complete");

    const uninstalled = parseEnvelope(runCli(["plugin", "uninstall", "ecology", "--yes", "--json"], root));
    assert.equal(uninstalled.ok, true, JSON.stringify(uninstalled.error));
    await assert.rejects(readFile(capabilityPath, "utf8"), { code: "ENOENT" });
    await assert.rejects(readFile(profilePath, "utf8"), { code: "ENOENT" });
  } finally {
    await cleanup(root);
  }
});

void test("script-validated plugin extension capability runs through advance", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));
    const installed = parseEnvelope<{ resolved_capability_ids: string[] }>(
      runCli(["plugin", "install", "accounting-auditing-and-accountability", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.equal(installed.data?.resolved_capability_ids.includes("plugin-financial-statement-analysis"), true);

    const startInput = path.join(root, "start.yaml");
    await writeFile(startInput, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-16T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "research",
      prerequisites: [],
      handoff_inputs: [{ role: "task_request", type: "markdown", path: "task.md", purpose: "financial statement task" }],
      planned_outputs: [{ role: "research_brief", type: "json", path: "statement-brief.json", purpose: "statement analysis brief" }],
      formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ run_id: string }>(runCli(["start", "plugin-financial-statement-analysis", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true, JSON.stringify(started.error));
    const runId = started.data?.run_id ?? "";

    const briefPath = path.join(root, "statement-brief.json");
    const advanceInput = path.join(root, "advance.yaml");

    await writeFile(briefPath, JSON.stringify({ scope: "Acme 2024" }), "utf8");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefPath }] }), "utf8");
    const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
    assert.equal(invalid.ok, false);
    assert.match(invalid.error?.code ?? "", /node_validators_failed/);

    await writeFile(briefPath, JSON.stringify({
      scope: "Acme 2024 annual statements",
      source_ledger: [{ source: "10-K", period: "2024" }],
      normalized_statements: [{ period: "2024", revenue: 100 }],
      metrics: { net_margin: 0.1 },
      conclusions: "Traceable normalized results with unresolved assumptions noted.",
    }), "utf8");
    const valid = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
    assert.equal(valid.ok, true, JSON.stringify(valid.error));
    assert.equal(valid.data?.node.state, "complete");
  } finally {
    await cleanup(root);
  }
});

void test("plugin show exposes graph extension counts", async () => {
  const root = await tempProject();
  try {
    const shown = parseEnvelope<{ domain: { capabilities: number; profiles: number } }>(runCli(["plugin", "show", "ecology", "--summary", "--json"], root));
    assert.equal(shown.ok, true, JSON.stringify(shown.error));
    assert.equal(shown.data?.domain.capabilities, 1);
    assert.equal(shown.data?.domain.profiles, 1);
  } finally {
    await cleanup(root);
  }
});
