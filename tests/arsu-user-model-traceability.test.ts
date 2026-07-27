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
  active_delta_capabilities: Array<{
    capability_id: string;
    change_id: string;
    spec_path: string;
    requirements: Array<{
      requirement: string;
      scenarios: Array<{
        scenario: string;
        journey_ids?: string[];
        test_ids?: string[];
        test_files: string[];
        verifier_evidence?: Array<{
          kind: "guidance" | "documentation" | "package";
          paths: string[];
        }>;
      }>;
    }>;
  }>;
}

void test("[traceability.user-model] traceability covers every canonical user-model requirement and scenario", async () => {
  const manifest = JSON.parse(await readFile("tests/fixtures/arsu-user-model-traceability.json", "utf8")) as TraceabilityManifest;
  assert.equal(manifest.schema_version, "1");
  assert.deepEqual(manifest.capabilities.map((item) => item.capability_id).sort(), ["agent-surface-model", "arsu-run-usage", "arsu-user-routing"]);

  const journeyIds = new Set(manifest.journeys.map((item) => item.journey_id));
  const testIds = new Set(manifest.journeys.map((item) => item.test_id));
  assert.equal(journeyIds.size, 17);
  assert.equal(testIds.size, 17);
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
  const convergence = manifest.active_delta_capabilities.filter((item) => item.change_id === "converge-fluid-runtime-surface");
  assert.deepEqual(convergence.map((item) => item.capability_id).sort(), ["arsu-run-usage", "arsu-user-model-acceptance"]);
  assert.deepEqual(verifierEvidenceKinds(convergence), ["documentation", "guidance"]);
  const discoverability = manifest.active_delta_capabilities.filter((item) => item.change_id === "improve-cli-discoverability");
  assert.deepEqual(discoverability.map((item) => item.capability_id).sort(), [
    "agent-tool-delivery",
    "arsu-user-model-acceptance",
    "arsu-user-routing",
    "cli-interface",
    "companion-skills",
    "mvp-release-readiness",
  ]);
  assert.deepEqual(verifierEvidenceKinds(discoverability), ["documentation", "guidance", "package"]);

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

  for (const capability of manifest.active_delta_capabilities) {
    assert.ok(manifest.technical_changes.includes(capability.change_id));
    const text = await readFile(capability.spec_path, "utf8");
    const expected = parseSpec(text);
    const actual = new Map(capability.requirements.map((item) => [item.requirement, new Set(item.scenarios.map((scenario) => scenario.scenario))]));
    assert.deepEqual([...actual.keys()].sort(), [...expected.keys()].sort(), `${capability.capability_id} active requirement coverage`);
    for (const [requirement, scenarios] of expected) {
      assert.deepEqual([...(actual.get(requirement) ?? [])].sort(), [...scenarios].sort(), `${capability.capability_id}/${requirement} active scenario coverage`);
    }
    for (const requirement of capability.requirements) for (const scenario of requirement.scenarios) {
      assert.ok(scenario.test_files.length > 0, `${capability.capability_id}/${scenario.scenario} needs a test file`);
      for (const testFile of scenario.test_files) assert.equal(await fileExists(testFile), true, `Missing traceability test file: ${testFile}`);
      for (const journeyId of scenario.journey_ids ?? []) assert.ok(journeyIds.has(journeyId), `Unknown active journey ref: ${journeyId}`);
      for (const testId of scenario.test_ids ?? []) {
        const sources = await Promise.all(scenario.test_files.map((testFile) => readFile(testFile, "utf8")));
        assert.equal(sources.some((source) => source.includes(`[${testId}]`)), true, `Missing stable active test ID: ${testId}`);
      }
      for (const evidence of scenario.verifier_evidence ?? []) {
        assert.ok(evidence.paths.length > 0, `${capability.capability_id}/${scenario.scenario} needs ${evidence.kind} evidence`);
        for (const evidencePath of evidence.paths) assert.equal(await fileExists(evidencePath), true, `Missing ${evidence.kind} verifier evidence: ${evidencePath}`);
      }
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

async function fileExists(target: string): Promise<boolean> {
  try { await readFile(target); return true; } catch { return false; }
}

function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function verifierEvidenceKinds(capabilities: TraceabilityManifest["active_delta_capabilities"]): string[] {
  return [...new Set(capabilities.flatMap((item) =>
    item.requirements.flatMap((requirement) =>
      requirement.scenarios.flatMap((scenario) =>
        scenario.verifier_evidence?.map((evidence) => evidence.kind) ?? [],
      ),
    ),
  ))].sort();
}
