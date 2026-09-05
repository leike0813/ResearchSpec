import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import { loadPluginExtensionRegistry, resolveDomainExtensions } from "../src/plugins/extensions.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

function brief(scope: string) {
  return {
    scope,
    source_ledger: [{ source: "local-input", state: "reviewed" }],
    method_plan: [{ step: 1, method: "reviewed ToolUniverse workflow" }],
    work_products: [{ path: "work.json", state: "reviewed" }],
    validation_results: [{ check: "evidence", result: "complete" }],
    conclusions: "Evidence-backed ToolUniverse result with limitations.",
  };
}

void test("ToolUniverse bulk registry and domain assignments are complete", async () => {
  const extensions = await loadPluginExtensionRegistry();
  const ids = [...extensions.capabilities.keys()].filter((id) => id.startsWith("plugin-tooluniverse-"));
  assert.equal(ids.length, 130);
  assert.equal([...extensions.profiles.keys()].filter((id) => id.startsWith("plugin-tooluniverse-")).length, 130);
  assert.equal(ids.filter((id) => extensions.capabilities.get(id)?.manifest.execution_type === "mixed").length, 42);
  assert.equal(ids.filter((id) => extensions.capabilities.get(id)?.manifest.execution_type === "llm").length, 88);

  const catalog = JSON.parse(await readFile(path.resolve(".", "src/plugins/domain-catalog.json"), "utf8")) as {
    domains: Array<{ domain_id: string; skills: string[] }>;
  };
  const mappedDomains = catalog.domains.filter((domain) => domain.skills.some((skill) => skill.startsWith("tooluniverse-")));
  assert.equal(mappedDomains.length, 30);
  for (const domain of mappedDomains) {
    const expected = domain.skills
      .filter((skill) => skill.startsWith("tooluniverse-"))
      .map((skill) => `plugin-tooluniverse-${skill.slice("tooluniverse-".length)}`)
      .sort();
    const actualCapabilities = resolveDomainExtensions(extensions, [domain.domain_id]).capabilityIds.filter((id) => id.startsWith("plugin-tooluniverse-"));
    const actualProfiles = resolveDomainExtensions(extensions, [domain.domain_id]).profileIds.filter((id) => id.startsWith("plugin-tooluniverse-"));
    assert.deepEqual(actualCapabilities, expected, domain.domain_id);
    assert.deepEqual(actualProfiles, expected, domain.domain_id);
  }
});

void test("representative ToolUniverse profiles run through the graph engine", async () => {
  const cases = [
    { domain_id: "analytical-chemistry", profile_id: "plugin-tooluniverse-metabolomics" },
    { domain_id: "computational-modeling-and-simulation", profile_id: "plugin-tooluniverse-computational-biophysics" },
  ] as const;

  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    for (const entry of cases) {
      const installed = parseEnvelope<{ resolved_capability_ids: string[] }>(
        runCli(["plugin", "install", entry.domain_id, "--yes", "--json"], root),
      );
      assert.equal(installed.ok, true, JSON.stringify(installed.error));
      assert.equal(installed.data?.resolved_capability_ids.includes(entry.profile_id), true, entry.profile_id);

      const startInput = path.join(root, `start-${entry.profile_id}.yaml`);
      const advanceInput = path.join(root, `advance-${entry.profile_id}.yaml`);
      const briefRelative = `brief-${entry.profile_id}.json`;
      const briefPath = path.join(root, briefRelative);
      await writeFile(path.join(root, `task-${entry.profile_id}.md`), "# Research task\n", "utf8");
      await writeFile(startInput, stringify({
        schema_version: "2",
        confirmed_at: "2026-08-17T03:00:00+08:00",
        entry_id: "main",
        entry_node_id: "research",
        prerequisites: [],
        handoff_inputs: [{ role: "task_request", type: "markdown", path: `task-${entry.profile_id}.md`, purpose: entry.profile_id }],
        planned_outputs: [{ role: "research_brief", type: "json", path: briefRelative, purpose: `${entry.profile_id} brief` }],
        formal_gates: [],
        cost: { effort: "low", interaction: "single_pass" },
      }), "utf8");

      const started = parseEnvelope<{ run_id: string }>(runCli(["start", entry.profile_id, "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
      assert.equal(started.ok, true, `${entry.profile_id}: ${JSON.stringify(started.error)}`);
      const runId = started.data?.run_id ?? "";
      assert.match(runId, /^run-[a-f0-9]+$/);

      const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
      assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
      assert.equal(instructions.data?.capability.capability_id, entry.profile_id);

      await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefRelative }] }), "utf8");
      await writeFile(briefPath, JSON.stringify({ scope: "incomplete" }), "utf8");
      const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(invalid.ok, false, `${entry.profile_id} invalid advance unexpectedly succeeded`);
      assert.match(invalid.error?.code ?? "", /node_validators_failed/);

      await writeFile(briefPath, JSON.stringify(brief(entry.profile_id)), "utf8");
      const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(advanced.ok, true, `${entry.profile_id}: ${JSON.stringify(advanced.error)}`);
      assert.equal(advanced.data?.node.state, "complete");
    }
  } finally {
    await cleanup(root);
  }
});
