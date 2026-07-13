import assert from "node:assert/strict";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { planToolDelivery } from "../src/adapters/delivery.js";
import { TOOL_IDS, TOOLS } from "../src/adapters/tools.js";
import { handlePluginInstall, handlePluginList, handlePluginShow, handlePluginUninstall, handlePluginUpdate, handleUpdate } from "../src/cli/handlers.js";
import type { CommandContext } from "../src/cli/types.js";
import { loadPluginRegistry, PluginRegistryError, validatePluginRegistry } from "../src/plugins/registry.js";
import { pluginStatusSummary } from "../src/plugins/status.js";
import { runWorkspaceChecks } from "../src/core/validation/check.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { cleanup, runCli, tempProject } from "./helpers/cli.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/domain-skill-plugins");

void test("production registry is Schema 1 and intentionally empty", async () => {
  const loaded = await loadPluginRegistry();
  assert.equal(loaded.registry.schema_version, "1");
  assert.deepEqual(loaded.registry.sources, []);
  assert.deepEqual(loaded.registry.plugins, []);
});

void test("registry validates Open Agent Skills resources and exact provenance", async () => {
  const loaded = await loadPluginRegistry(FIXTURE_ROOT);
  assert.deepEqual([...loaded.plugins.keys()], ["geoscience", "quantitative-methods"]);
  assert.ok(loaded.skillFiles.get("geoscience:rock-mechanics")?.includes("scripts/calculate.py"));
  assert.equal(loaded.plugins.get("geoscience")?.skills[0]?.upstreams[0]?.adaptation, "curated");
  const listed = await handlePluginList({}, context(process.cwd()), loaded);
  assert.equal((listed.data as { plugins: unknown[] }).plugins.length, 2);
  const shown = await handlePluginShow("geoscience", context(process.cwd()), loaded);
  const item = (shown.data as { plugin: { domain: string; skills: Array<{ upstreams: Array<{ source: { license: string } }> }> } }).plugin;
  assert.equal(item.domain, "geoscience");
  assert.equal(item.skills[0].upstreams[0].source.license, "MIT");
});

void test("registry rejects identity, path, provenance, and Skill structure defects", async () => {
  const valid = JSON.parse(await readFile(path.join(FIXTURE_ROOT, "registry.json"), "utf8")) as RegistryObject;
  const cases: Array<{ code: string; mutate(value: RegistryObject): void }> = [
    { code: "plugin_plugin_id_duplicate", mutate: (value) => { value.plugins.push(structuredClone(value.plugins[0])); } },
    { code: "plugin_skill_id_duplicate", mutate: (value) => { value.plugins[1].skills[0].skill_id = "rock-mechanics"; } },
    { code: "plugin_skill_id_conflict", mutate: (value) => { value.plugins[0].skills[0].skill_id = "deep-research"; } },
    { code: "plugin_source_unknown", mutate: (value) => { value.plugins[0].skills[0].upstreams[0].source_id = "missing-source"; } },
    { code: "plugin_registry_invalid", mutate: (value) => { value.plugins[0].skills[0].upstreams[0].source_paths = ["../escape"]; } },
    { code: "plugin_registry_invalid", mutate: (value) => { value.plugins[0].skills[0].upstreams[0].revision = "main"; } },
    { code: "plugin_registry_invalid", mutate: (value) => { value.plugins[0].skills[0].upstreams[0].adaptation = "generated"; } },
    { code: "plugin_skill_missing", mutate: (value) => { value.plugins[0].skills[0].skill_id = "missing-skill"; } },
  ];
  for (const item of cases) {
    const value = structuredClone(valid);
    item.mutate(value);
    await assert.rejects(validatePluginRegistry(value, FIXTURE_ROOT), (error: unknown) => error instanceof PluginRegistryError && error.diagnostics.some((diagnostic) => diagnostic.code === item.code));
  }
});

void test("registry rejects invalid frontmatter, name mismatch, and missing attribution", async () => {
  const root = await fixtureCopy();
  try {
    const skillRoot = path.join(root, "geoscience/rock-mechanics");
    await writeFile(path.join(skillRoot, "SKILL.md"), "---\nname: wrong-name\ndescription: useful\n---\n\nBody\n", "utf8");
    await assert.rejects(loadPluginRegistry(root), hasDiagnostic("plugin_skill_name_mismatch"));

    await cp(FIXTURE_ROOT, root, { recursive: true, force: true });
    await writeFile(path.join(skillRoot, "SKILL.md"), "name: rock-mechanics\n", "utf8");
    await assert.rejects(loadPluginRegistry(root), hasDiagnostic("plugin_skill_frontmatter_invalid"));

    await cp(FIXTURE_ROOT, root, { recursive: true, force: true });
    await writeFile(path.join(skillRoot, "LICENSE"), "", "utf8");
    await assert.rejects(loadPluginRegistry(root), hasDiagnostic("plugin_skill_license_missing"));
  } finally { await cleanup(root); }
});

void test("plugin delivery reaches all 31 Skill adapters without adding wrappers or executing scripts", async () => {
  const root = await tempProject();
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = path.join(root, "codex-home");
  try {
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    const delivery = await planToolDelivery({ projectRoot: root, toolIds: TOOL_IDS, existingInstallations: [], force: false, pluginRegistry: registry, selectedPluginIds: ["geoscience"] });
    const pluginFiles = delivery.installations.filter((item) => item.plugin_id === "geoscience");
    const resourcesPerTool = registry.skillFiles.get("geoscience:rock-mechanics")?.length ?? 0;
    assert.equal(pluginFiles.length, TOOL_IDS.length * resourcesPerTool);
    assert.equal(new Set(pluginFiles.map((item) => item.tool_id)).size, 31);
    assert.ok(pluginFiles.every((item) => item.skill_id === "rock-mechanics" && item.plugin_version === "1.0.0"));
    assert.equal(delivery.installations.filter((item) => item.source.startsWith("command:")).length, TOOLS.filter((tool) => tool.command).length * 8);
    assert.equal(await exists(path.join(root, "researchspec-plugin-script-executed")), false);
  } finally {
    if (previousCodexHome === undefined) Reflect.deleteProperty(process.env, "CODEX_HOME"); else process.env.CODEX_HOME = previousCodexHome;
    await cleanup(root);
  }
});

void test("plugin selection persists without tools and a later tool update backfills resources", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    const install = await handlePluginInstall(["geoscience"], context(root), registry);
    assert.ok(install.diagnostics.some((item) => item.code === "plugin_projection_deferred"));
    assert.match(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /plugins:\n\s+selected:\n\s+- geoscience/);
    await handleUpdate(undefined, { tools: "forgecode" }, context(root), registry);
    const script = path.join(root, ".forge/skills/rock-mechanics/scripts/calculate.py");
    assert.equal(await readFile(script, "utf8"), await readFile(path.join(FIXTURE_ROOT, "geoscience/rock-mechanics/scripts/calculate.py"), "utf8"));
    assert.equal(await exists(path.join(root, "researchspec-plugin-script-executed")), false);
    const snapshot = await loadWorkspaceSnapshot(path.join(root, "researchspec"));
    assert.deepEqual(pluginStatusSummary(snapshot.config, snapshot.manifest, registry), { selected: ["geoscience"], available: ["geoscience", "quantitative-methods"], unavailable: [], projected: ["geoscience"] });
    assert.equal((await runWorkspaceChecks(snapshot.workspace, "plugins", false, registry)).ok, true);
    await rm(script);
    assert.ok((await runWorkspaceChecks(snapshot.workspace, "plugins", false, registry)).diagnostics.some((item) => item.code === "plugin_file_missing"));
  } finally { await cleanup(root); }
});

void test("plugin lifecycle is idempotent, force-refreshes desired drift, and cleanly uninstalls", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    await handlePluginInstall(["geoscience"], context(root), registry);
    const repeated = await handlePluginInstall(["geoscience"], context(root), registry);
    assert.ok(planActions(repeated).every((action) => action === "skip-unchanged"));

    const skillPath = path.join(root, ".forge/skills/rock-mechanics/SKILL.md");
    await writeFile(skillPath, "user drift", "utf8");
    const preserved = await handlePluginUpdate(["geoscience"], context(root), registry);
    assert.ok(preserved.diagnostics.some((item) => item.code === "generated_file_drift"));
    assert.equal(await readFile(skillPath, "utf8"), "user drift");
    await handlePluginUpdate(["geoscience"], { ...context(root), force: true }, registry);
    assert.match(await readFile(skillPath, "utf8"), /^---\nname: rock-mechanics/);

    await handlePluginUninstall(["geoscience"], context(root));
    assert.equal(await exists(skillPath), false);
    assert.doesNotMatch(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /- geoscience/);
  } finally { await cleanup(root); }
});

void test("uninstall drift blocks the whole transaction and retired plugins remain safely removable", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    await handlePluginInstall(["geoscience", "quantitative-methods"], context(root), registry);
    const driftPath = path.join(root, ".forge/skills/rock-mechanics/SKILL.md");
    const cleanPath = path.join(root, ".forge/skills/research-tables/SKILL.md");
    await assert.rejects(handlePluginUpdate([], context(root), await loadPluginRegistry()), (error: unknown) => isCliCode(error, "plugin_unavailable"));
    await writeFile(driftPath, "user drift", "utf8");
    await assert.rejects(handlePluginUninstall(["geoscience", "quantitative-methods"], { ...context(root), force: true }), (error: unknown) => isCliCode(error, "plugin_uninstall_drift"));
    assert.equal(await exists(cleanPath), true);
    assert.match(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /- geoscience/);

    await writeFile(driftPath, await readFile(path.join(FIXTURE_ROOT, "geoscience/rock-mechanics/SKILL.md"), "utf8"), "utf8");
    await handlePluginUninstall(["geoscience", "quantitative-methods"], context(root));
    assert.equal(await exists(cleanPath), false);
  } finally { await cleanup(root); }
});

void test("plugin update records a new bundled version", async () => {
  const root = await tempProject();
  const fixture = await fixtureCopy();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const first = await loadPluginRegistry(fixture);
    await handlePluginInstall(["geoscience"], context(root), first);
    const registryPath = path.join(fixture, "registry.json");
    const raw = JSON.parse(await readFile(registryPath, "utf8")) as RegistryObject;
    raw.plugins[0].version = "1.1.0";
    await writeFile(registryPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
    await writeFile(path.join(fixture, "geoscience/rock-mechanics/references/criteria.md"), "# Updated criteria\n", "utf8");
    await handlePluginUpdate(["geoscience"], context(root), await loadPluginRegistry(fixture));
    const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as { installations: Array<{ plugin_id?: string; plugin_version?: string }> };
    assert.ok(manifest.installations.filter((item) => item.plugin_id === "geoscience").every((item) => item.plugin_version === "1.1.0"));
  } finally { await cleanup(root); await cleanup(fixture); }
});

function context(root: string): CommandContext {
  return { command: "plugin", cwd: root, json: true, dryRun: false, force: false, yes: true, quiet: true, interactive: false };
}

async function fixtureCopy(): Promise<string> {
  const root = await tempProject();
  await cp(FIXTURE_ROOT, root, { recursive: true, force: true });
  return root;
}

function hasDiagnostic(code: string): (error: unknown) => boolean {
  return (error) => error instanceof PluginRegistryError && error.diagnostics.some((item) => item.code === code);
}

function isCliCode(error: unknown, code: string): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === code);
}

function planActions(result: { data?: unknown }): string[] {
  const data = result.data as { plan?: Array<{ action?: string }> } | undefined;
  return (data?.plan ?? []).map((item) => item.action ?? "");
}

async function exists(filePath: string): Promise<boolean> {
  try { await readFile(filePath); return true; } catch { return false; }
}

interface RegistryObject {
  schema_version: string;
  sources: Array<Record<string, unknown>>;
  plugins: Array<{
    plugin_id: string; version: string;
    skills: Array<{ skill_id: string; upstreams: Array<{ source_id: string; revision: string; source_paths: string[]; adaptation: string }> }>;
    [key: string]: unknown;
  }>;
}
