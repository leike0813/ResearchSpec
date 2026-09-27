import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";
import { TOOL_IDS } from "../src/adapters/tools.js";

interface DogfoodingCatalog {
  schema_version: "1";
  canonical_playbook: string;
  adapters: string[];
  fixture_variants: Array<{ fixture_variant: string; paths: string[] }>;
  release_mappings: Array<{ checklist_ref: string; scenario_id: string }>;
  scenarios: Array<{
    scenario_id: string;
    tier: number;
    title: string;
    intent: string;
    personas: string[];
    route_refs: string[];
    fixture_variant: string;
    initial_state: string;
    prompts: string[];
    checkpoints: string[];
    prohibited_actions: string[];
    hard_assertions: string[];
    required_evidence: string[];
    soft_rubric: string;
    cleanup: string[];
    release_checklist_ref?: string;
    acceptance_journey_refs: string[];
  }>;
}

interface RoutingCatalog {
  skills: Array<{ routes: Array<{ route_ref: string }> }>;
}

void test("dogfooding playbook catalog covers routes, fixtures, and release mappings", async () => {
  const root = path.resolve("playbooks/dogfooding");
  const catalog = parse(await readFile(path.join(root, "scenarios.yaml"), "utf8")) as DogfoodingCatalog;
  assert.equal(catalog.schema_version, "1");
  await assertContainedFile(root, catalog.canonical_playbook);
  for (const adapter of catalog.adapters) await assertContainedFile(root, adapter);

  const fixtureIds = new Set<string>();
  for (const fixture of catalog.fixture_variants) {
    assert.ok(fixture.fixture_variant.length > 0);
    assert.equal(fixtureIds.has(fixture.fixture_variant), false, `Duplicate fixture variant: ${fixture.fixture_variant}`);
    fixtureIds.add(fixture.fixture_variant);
    assert.ok(fixture.paths.length > 0, `Fixture has no paths: ${fixture.fixture_variant}`);
    for (const fixturePath of fixture.paths) await assertContainedFile(root, fixturePath);
  }

  const scenarioIds = new Set<string>();
  const referencedRoutes = new Set<string>();
  for (const scenario of catalog.scenarios) {
    assert.match(scenario.scenario_id, /^DF-T[0-3]-[A-Z0-9-]+$/);
    assert.equal(scenarioIds.has(scenario.scenario_id), false, `Duplicate scenario ID: ${scenario.scenario_id}`);
    scenarioIds.add(scenario.scenario_id);
    assert.ok([0, 1, 2, 3].includes(scenario.tier), `Invalid tier: ${scenario.scenario_id}`);
    assert.ok(scenario.title.length > 0 && scenario.intent.length > 0 && scenario.initial_state.length > 0);
    assert.ok(scenario.personas.length > 0 && scenario.prompts.length > 0 && scenario.checkpoints.length > 0);
    assert.ok(scenario.prohibited_actions.length > 0 && scenario.hard_assertions.length > 0);
    assert.ok(scenario.required_evidence.length > 0 && scenario.cleanup.length > 0);
    assert.equal(scenario.soft_rubric, "default");
    assert.ok(fixtureIds.has(scenario.fixture_variant), `Unknown fixture: ${scenario.fixture_variant}`);
    for (const routeRef of scenario.route_refs) referencedRoutes.add(routeRef);
  }

  const routing = JSON.parse(await readFile("skills/arsu/routing-catalog.json", "utf8")) as RoutingCatalog;
  const canonicalRoutes = new Set(routing.skills.flatMap((skill) => skill.routes.map((route) => route.route_ref)));
  assert.equal(canonicalRoutes.size, 27);
  assert.deepEqual([...referencedRoutes].sort(), [...canonicalRoutes].sort());

  const manualChecklist = (await readFile("artifacts/release/mvp-release-checklist.md", "utf8"))
    .split("## Manual dogfooding\n")[1]?.split("\n## ")[0];
  assert.ok(manualChecklist);
  const manualItems = manualChecklist.split("\n").filter((line) => line.startsWith("- ["));
  const checklistRefs = manualItems.map((line) => {
    const match = /^- \[ \] \[([a-z0-9-]+)\] (.+)$/.exec(line);
    assert.ok(match, `Manual item needs exactly one scenario slug: ${line}`);
    return match[1];
  });
  assert.equal(new Set(checklistRefs).size, checklistRefs.length);
  assert.deepEqual(new Set(catalog.release_mappings.map((item) => item.checklist_ref)), new Set(checklistRefs));
  for (const mapping of catalog.release_mappings) {
    const scenario = catalog.scenarios.find((item) => item.scenario_id === mapping.scenario_id);
    assert.ok(scenario, `Unknown release scenario: ${mapping.scenario_id}`);
    assert.equal(scenario.tier, 1);
    assert.equal(scenario.release_checklist_ref, mapping.checklist_ref);
  }

  const byId = new Map(catalog.scenarios.map((scenario) => [scenario.scenario_id, scenario]));
  const groups = {
    positive: ["DF-T1-NAT-LITERATURE", "DF-T1-NAT-WRITING", "DF-T1-NAT-EVIDENCE", "DF-T1-NAT-REVIEW"],
    continuity: ["DF-T1-NOTE-RESUME", "DF-T1-RESUME", "DF-T2-NOTE-DIVERGENCE", "DF-T2-NOTE-MATERIAL-CHANGE", "DF-T2-NOTE-AMBIGUITY", "DF-T2-RUN-PRECEDENCE", "DF-T2-COMPLETED-RUN"],
    discovery: ["DF-T2-FIRST-SEARCH-MISS", "DF-T2-SECOND-SEARCH-MISS", "DF-T2-TWO-CAPABILITIES"],
    ambiguity: ["DF-T2-MISSING-INPUT"],
    negative: ["DF-T2-UNRELATED", "DF-T2-DECLINE-FRAMEWORK"],
  };
  for (const ids of Object.values(groups)) for (const id of ids) assert.ok(byId.get(id)?.hard_assertions.length, `Missing acceptance case: ${id}`);
  for (const id of ["DF-T1-STANDALONE", "DF-T1-NOTE-RESUME", ...groups.positive]) {
    assert.deepEqual(byId.get(id)?.route_refs, [], `${id} must remain run-free`);
  }
  assert.ok(byId.get("DF-T1-STANDALONE")?.required_evidence.includes("before-after-status"));
  assert.ok(byId.get("DF-T1-RESUME")?.required_evidence.includes("run"));
  assert.ok(byId.get("DF-T1-RESUME")?.required_evidence.includes("graph"));
  assert.ok(byId.get("DF-T1-RESUME")?.required_evidence.includes("handoff"));
  assert.ok(byId.get("DF-T2-RUN-PRECEDENCE")?.route_refs.length);

  const intake = parse(await readFile("skills/capabilities/design-review-response-intake/manifest.yaml", "utf8")) as { outputs: Array<{ role: string }> };
  const atomization = parse(await readFile("skills/capabilities/transform-review-response-comment-atomization/manifest.yaml", "utf8")) as { inputs: Array<{ role: string; required: boolean }> };
  assert.deepEqual(atomization.inputs.filter((input) => input.required).map((input) => input.role), ["review_response_workspace"]);
  assert.ok(intake.outputs.some((output) => output.role === atomization.inputs[0]?.role));
});

void test("host verification record follows runtime target IDs and keeps behaviour unverified", async () => {
  const record = await readFile("playbooks/dogfooding/host-verification.md", "utf8");
  const table = record.split("| Target ID |")[1]?.split("\n\n")[0];
  assert.ok(table);
  const rows = table.split("\n").filter((line) => /^\| `[^`]+` \|/.test(line));
  const targets = rows.map((line) => /^\| `([^`]+)` \|/.exec(line)?.[1]);
  assert.equal(new Set(targets).size, targets.length);
  assert.deepEqual(new Set(targets), new Set(TOOL_IDS));
  for (const row of rows) assert.equal(row.split("|")[5]?.trim(), "unverified");
  const agents = rows.find((row) => row.startsWith("| `agents` |"));
  assert.ok(agents);
  assert.deepEqual(agents.split("|").slice(6, 9).map((value) => value.trim()), ["—", "—", "0"]);
});

void test("dogfooding benchmark is synthetic and playbooks stay outside the package", async () => {
  const root = path.resolve("playbooks/dogfooding");
  const catalog = parse(await readFile(path.join(root, "scenarios.yaml"), "utf8")) as DogfoodingCatalog;
  const benchmarkPaths = new Set(catalog.fixture_variants.flatMap((fixture) => fixture.paths).filter((item) => item.startsWith("benchmark/")));
  for (const benchmarkPath of benchmarkPaths) {
    const content = await readFile(path.join(root, benchmarkPath), "utf8");
    assert.match(content, /synthetic|TEST FIXTURE|FAULT-INJECTION FIXTURE/i, `Missing synthetic marker: ${benchmarkPath}`);
  }
  const sources = parse(await readFile(path.join(root, "benchmark/sources.yaml"), "utf8")) as { synthetic?: boolean };
  const claims = parse(await readFile(path.join(root, "benchmark/claims.yaml"), "utf8")) as { synthetic?: boolean };
  assert.equal(sources.synthetic, true);
  assert.equal(claims.synthetic, true);

  const packageJson = JSON.parse(await readFile("package.json", "utf8")) as { files: string[] };
  assert.equal(packageJson.files.some((item) => item === "playbooks" || item.startsWith("playbooks/")), false);
  assert.equal(packageJson.files.includes("artifacts/researchspec_dogfooding_guide.md"), false);
  await assert.rejects(stat("artifacts/researchspec_dogfooding_guide.md"));
});

async function assertContainedFile(root: string, relativePath: string): Promise<void> {
  assert.equal(path.isAbsolute(relativePath), false, `Expected relative path: ${relativePath}`);
  const target = path.resolve(root, relativePath);
  const relative = path.relative(root, target);
  assert.ok(relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative), `Path escapes playbook root: ${relativePath}`);
  assert.equal((await stat(target)).isFile(), true, `Expected file: ${relativePath}`);
}
