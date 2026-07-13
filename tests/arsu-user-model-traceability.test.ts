import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

interface TraceabilityManifest {
  schema_version: "1";
  technical_changes: string[];
  journeys: Array<{ journey_id: string; test_id: string }>;
  capabilities: Array<{
    capability_id: string;
    requirements: Array<{
      requirement: string;
      scenarios: Array<{ scenario: string; technical_changes: string[]; journey_ids: string[]; test_ids: string[] }>;
    }>;
  }>;
}

void test("traceability covers every canonical user-model requirement and scenario", async () => {
  const manifest = JSON.parse(await readFile("tests/fixtures/arsu-user-model-traceability.json", "utf8")) as TraceabilityManifest;
  assert.equal(manifest.schema_version, "1");
  assert.deepEqual(manifest.capabilities.map((item) => item.capability_id).sort(), ["agent-surface-model", "arsu-run-usage", "arsu-user-routing"]);

  const journeyIds = new Set(manifest.journeys.map((item) => item.journey_id));
  const testIds = new Set(manifest.journeys.map((item) => item.test_id));
  assert.equal(journeyIds.size, 12);
  assert.equal(testIds.size, 12);
  const journeySource = (await Promise.all([
    readFile("tests/arsu-user-journeys.test.ts", "utf8"),
    readFile("tests/material-passport-import.test.ts", "utf8"),
  ])).join("\n");
  for (const testId of testIds) assert.match(journeySource, new RegExp(`\\[${escapeRegex(testId)}\\]`));

  const archived = await readdir("openspec/changes/archive");
  for (const change of manifest.technical_changes) {
    const active = await exists(path.join("openspec/changes", change));
    assert.equal(active || archived.some((entry) => entry.endsWith(`-${change}`)), true, `Unknown technical change: ${change}`);
  }

  for (const capability of manifest.capabilities) {
    const text = await readFile(path.join("openspec/specs", capability.capability_id, "spec.md"), "utf8");
    const expected = parseSpec(text);
    const actual = new Map(capability.requirements.map((item) => [item.requirement, new Set(item.scenarios.map((scenario) => scenario.scenario))]));
    assert.deepEqual([...actual.keys()].sort(), [...expected.keys()].sort(), `${capability.capability_id} requirement coverage`);
    for (const [requirement, scenarios] of expected) assert.deepEqual([...(actual.get(requirement) ?? [])].sort(), [...scenarios].sort(), `${capability.capability_id}/${requirement} scenario coverage`);

    for (const requirement of capability.requirements) for (const scenario of requirement.scenarios) {
      assert.ok(scenario.technical_changes.length > 0);
      assert.ok(scenario.journey_ids.length > 0);
      assert.ok(scenario.test_ids.length > 0);
      for (const change of scenario.technical_changes) assert.ok(manifest.technical_changes.includes(change), `Unknown change ref: ${change}`);
      for (const journey of scenario.journey_ids) assert.ok(journeyIds.has(journey), `Unknown journey ref: ${journey}`);
      for (const testId of scenario.test_ids) assert.ok(testIds.has(testId), `Unknown test ref: ${testId}`);
    }
  }
});

function parseSpec(text: string): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  const requirements = [...text.matchAll(/^### Requirement: (.+)$/gm)];
  for (const [index, match] of requirements.entries()) {
    const name = match[1]?.trim();
    assert.ok(name);
    const start = (match.index ?? 0) + match[0].length;
    const end = requirements[index + 1]?.index ?? text.length;
    result.set(name, new Set([...text.slice(start, end).matchAll(/^#### Scenario: (.+)$/gm)].map((item) => item[1]?.trim()).filter((item): item is string => Boolean(item))));
  }
  return result;
}

async function exists(target: string): Promise<boolean> {
  try { await readdir(target); return true; } catch { return false; }
}

function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
