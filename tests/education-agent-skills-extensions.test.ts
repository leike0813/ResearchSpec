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
    method_plan: [{ step: 1, method: "reviewed education workflow" }],
    work_products: [{ path: "work.json", state: "reviewed" }],
    validation_results: [{ check: "evidence", result: "complete" }],
    conclusions: "Evidence-backed education result with limitations and human oversight.",
  };
}

void test("Education Agent Skills bulk registry and domain assignments are complete", async () => {
  const extensions = await loadPluginExtensionRegistry();
  const ids = [...extensions.capabilities.keys()].filter((id) => id.startsWith("plugin-education-agent-skills-"));
  assert.equal(ids.length, 136);
  assert.equal([...extensions.profiles.keys()].filter((id) => id.startsWith("plugin-education-agent-skills-")).length, 136);
  assert.equal(ids.filter((id) => extensions.capabilities.get(id)?.manifest.execution_type === "llm").length, 136);
  for (const id of ids) assert.deepEqual(extensions.capabilities.get(id)?.manifest.knowledge_refs, []);

  const catalog = JSON.parse(await readFile(path.resolve(".", "src/plugins/domain-catalog.json"), "utf8")) as {
    domains: Array<{ domain_id: string; skills: string[] }>;
  };
  const mappedDomains = catalog.domains.filter((domain) => domain.skills.some((skill) => skill.startsWith("education-agent-skills-")));
  assert.equal(mappedDomains.length, 3);
  for (const domain of mappedDomains) {
    const expected = domain.skills
      .filter((skill) => skill.startsWith("education-agent-skills-"))
      .map((skill) => `plugin-education-agent-skills-${skill.slice("education-agent-skills-".length)}`)
      .sort();
    const actualCapabilities = resolveDomainExtensions(extensions, [domain.domain_id]).capabilityIds.filter((id) => id.startsWith("plugin-education-agent-skills-"));
    const actualProfiles = resolveDomainExtensions(extensions, [domain.domain_id]).profileIds.filter((id) => id.startsWith("plugin-education-agent-skills-"));
    assert.deepEqual(actualCapabilities, expected, domain.domain_id);
    assert.deepEqual(actualProfiles, expected, domain.domain_id);
  }
});

void test("representative Education Agent Skills profiles run through the graph engine", async () => {
  const cases = [
    "plugin-education-agent-skills-instructional-coaching-conversation-guide",
    "plugin-education-agent-skills-lesson-observation-protocol-designer",
  ] as const;

  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ resolved_capability_ids: string[] }>(
      runCli(["plugin", "install", "education-systems", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    for (const profileId of cases) assert.equal(installed.data?.resolved_capability_ids.includes(profileId), true, profileId);

    for (const profileId of cases) {
      const startInput = path.join(root, `start-${profileId}.yaml`);
      const advanceInput = path.join(root, `advance-${profileId}.yaml`);
      const briefRelative = `brief-${profileId}.json`;
      const briefPath = path.join(root, briefRelative);
      await writeFile(startInput, stringify({
        schema_version: "2",
        confirmed_at: "2026-08-17T05:00:00+08:00",
        entry_id: "main",
        entry_node_id: "research",
        prerequisites: [],
        handoff_inputs: [{ role: "task_request", type: "markdown", path: `task-${profileId}.md`, purpose: profileId }],
        planned_outputs: [{ role: "research_brief", type: "json", path: briefRelative, purpose: `${profileId} brief` }],
        formal_gates: [],
        cost: { effort: "low", interaction: "single_pass" },
      }), "utf8");

      const started = parseEnvelope<{ run_id: string }>(runCli(["start", profileId, "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
      assert.equal(started.ok, true, `${profileId}: ${JSON.stringify(started.error)}`);
      const runId = started.data?.run_id ?? "";
      assert.match(runId, /^run-[a-f0-9]+$/);

      const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", `node:${runId}/research`, "--json"], root));
      assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
      assert.equal(instructions.data?.capability.capability_id, profileId);

      await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefRelative }] }), "utf8");
      await writeFile(briefPath, JSON.stringify({ scope: "incomplete" }), "utf8");
      const invalid = parseEnvelope(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(invalid.ok, false, `${profileId} invalid advance unexpectedly succeeded`);
      assert.match(invalid.error?.code ?? "", /node_validators_failed/);

      await writeFile(briefPath, JSON.stringify(brief(profileId)), "utf8");
      const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", `node:${runId}/research`, "--input", advanceInput, "--json"], root));
      assert.equal(advanced.ok, true, `${profileId}: ${JSON.stringify(advanced.error)}`);
      assert.equal(advanced.data?.node.state, "complete");
    }
  } finally {
    await cleanup(root);
  }
});
