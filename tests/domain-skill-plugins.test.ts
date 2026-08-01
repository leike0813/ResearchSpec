import assert from "node:assert/strict";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { planToolDelivery } from "../src/adapters/delivery.js";
import { isDomainSkillInstallation, type ManagedInstallation } from "../src/adapters/installations.js";
import { TOOL_IDS, TOOLS } from "../src/adapters/tools.js";
import { handleCurrentUpdate, handlePluginInstall, handlePluginInstructions, handlePluginList, handlePluginShow, handlePluginUninstall, handlePluginUpdate } from "../src/cli/handlers.js";
import type { CommandContext } from "../src/cli/types.js";
import { runCurrentWorkspaceChecks } from "../src/core/validation/current-check.js";
import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { availableDomains, loadPluginRegistry, PluginRegistryError, resolveDomainSelection, validatePluginRegistry } from "../src/plugins/registry.js";
import { pluginStatusSummary } from "../src/plugins/status.js";
import { cleanup, runCli, tempProject } from "./helpers/cli.js";

const FIXTURE_ROOT = path.resolve("tests/fixtures/domain-skill-plugins");

void test("production registry contains the fixed taxonomy and six reviewed vendors", async () => {
  const loaded = await loadPluginRegistry();
  assert.equal(loaded.registry.schema_version, "1");
  assert.deepEqual(loaded.registry.domain_taxonomy, { discipline_system: "ANZSRC FoR", discipline_version: "2020", source_release: "2025-10-24" });
  assert.equal(loaded.vendors.get("tooluniverse")?.skills.length, 130);
  assert.equal(loaded.vendors.get("scientific-agent-skills")?.skills.length, 49);
  assert.equal(loaded.vendors.get("materials-science-skills-for-llm")?.skills.length, 7);
  assert.equal(loaded.vendors.get("finrobot")?.skills.length, 6);
  assert.equal(loaded.vendors.get("histagent")?.skills.length, 3);
  assert.equal(loaded.vendors.get("education-agent-skills")?.skills.length, 136);
  assert.equal(loaded.domains.size, 218);
  assert.equal(availableDomains(loaded).length, 56);
  assert.equal(loaded.domains.get("scientific-visualization-and-communication")?.skills.length, 12);
  assert.equal(loaded.domains.has("genomics-and-systems-biology"), false);
});

void test("registry validates multi-vendor domains, resources, provenance, and dependency closure", async () => {
  const loaded = await loadPluginRegistry(FIXTURE_ROOT);
  assert.deepEqual([...loaded.domains.keys()], ["geoscience", "quantitative-methods", "empty-tool"]);
  assert.deepEqual(availableDomains(loaded).map((domain) => domain.domain_id), ["geoscience", "quantitative-methods"]);
  assert.ok(loaded.skillFiles.get("rock-mechanics")?.includes("scripts/calculate.py"));
  assert.deepEqual(resolveDomainSelection(loaded, ["geoscience"]).resolvedSkillIds, ["research-tables", "rock-mechanics"]);
  const listed = await handlePluginList({}, context(process.cwd()), loaded);
  assert.equal((listed.data as { domains: unknown[] }).domains.length, 2);
  const compact = await handlePluginList({ summary: true }, context(process.cwd()), loaded);
  const compactDomain = (compact.data as { domains: Array<Record<string, unknown>> }).domains[0];
  assert.equal(typeof compactDomain?.direct_skill_count, "number");
  assert.equal("direct_skills" in (compactDomain ?? {}), false);
  const shown = await handlePluginShow("geoscience", {}, context(process.cwd()), loaded);
  const domain = (shown.data as { domain: { domain_id: string; direct_skills: unknown[]; resolved_skills: Array<{ vendor: { license: string } }> } }).domain;
  assert.equal(domain.domain_id, "geoscience");
  assert.equal(domain.direct_skills.length, 1);
  assert.equal(domain.resolved_skills.length, 2);
  assert.equal(domain.resolved_skills[0]?.vendor.license, "MIT");
  const compactShow = await handlePluginShow("geoscience", { summary: true }, context(process.cwd()), loaded);
  const compactSkill = (compactShow.data as { domain: { resolved_skills: Array<{ description: string; entry_sha256: string }> } }).domain.resolved_skills[0];
  assert.ok(compactSkill?.description.length);
  assert.match(compactSkill?.entry_sha256 ?? "", /^[a-f0-9]{64}$/);
  await assert.rejects(handlePluginShow("empty-tool", {}, context(process.cwd()), loaded), (error: unknown) => isCliCode(error, "plugin_not_found"));
  await assert.rejects(handlePluginInstall(["empty-tool"], {}, context(process.cwd()), loaded), (error: unknown) => isCliCode(error, "plugin_unavailable"));
});

void test("production domain installation projects Scientific Agent Skills without new wrappers", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "claude"]).status, 0);
    const registry = await loadPluginRegistry();
    await handlePluginInstall(["quantum-physics"], {}, context(root), registry);
    for (const id of ["cirq", "pennylane", "qiskit"]) {
      assert.equal(await exists(path.join(root, ".claude/skills", `scientific-agent-skills-${id}`, "SKILL.md")), true);
    }
    const snapshot = await loadCurrentWorkspaceIndex(path.join(root, "researchspec"));
    assert.deepEqual(pluginStatusSummary(snapshot.config, snapshot.manifest, registry).selected, ["quantum-physics"]);
    const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as { installations: ManagedInstallation[] };
    assert.equal(manifest.installations.filter((item) => item.source.kind === "command").length, 16);
    await handlePluginUninstall(["quantum-physics"], context(root), registry);
    assert.equal(await exists(path.join(root, ".claude/skills/scientific-agent-skills-qiskit/SKILL.md")), false);
  } finally { await cleanup(root); }
});

void test("production Education domain installs complete static Skills without new wrappers", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "claude"]).status, 0);
    const registry = await loadPluginRegistry();
    await handlePluginInstall(["education-systems"], {}, context(root), registry);
    const educationSkills = registry.domains.get("education-systems")?.skills ?? [];
    assert.equal(educationSkills.length, 9);
    for (const id of educationSkills) {
      const skillRoot = path.join(root, ".claude/skills", id);
      assert.equal(await exists(path.join(skillRoot, "SKILL.md")), true);
      assert.equal(await exists(path.join(skillRoot, "LICENSE")), true);
      assert.equal(await exists(path.join(skillRoot, "NOTICE.md")), true);
      assert.equal(await exists(path.join(skillRoot, "scripts")), false);
    }
    const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as { installations: ManagedInstallation[] };
    assert.equal(manifest.installations.filter((item) => item.source.kind === "command").length, 16);
    await handlePluginUninstall(["education-systems"], context(root), registry);
    assert.equal(await exists(path.join(root, ".claude/skills", educationSkills[0] ?? "missing", "SKILL.md")), false);
  } finally { await cleanup(root); }
});

void test("registry rejects invalid identities, references, paths, and provenance", async () => {
  const valid = JSON.parse(await readFile(path.join(FIXTURE_ROOT, "registry.json"), "utf8")) as RegistryObject;
  const cases: Array<{ code: string; mutate(value: RegistryObject): void }> = [
    { code: "plugin_vendor_id_duplicate", mutate: (value) => { value.vendors.push(structuredClone(value.vendors[0])); } },
    { code: "plugin_domain_id_duplicate", mutate: (value) => { value.domains.push(structuredClone(value.domains[0])); } },
    { code: "plugin_skill_id_duplicate", mutate: (value) => { value.vendors[1].skills[0].skill_id = "rock-mechanics"; } },
    { code: "plugin_skill_id_conflict", mutate: (value) => { value.vendors[0].skills[0].skill_id = "deep-research"; } },
    { code: "plugin_dependency_unknown", mutate: (value) => { value.vendors[0].skills[0].dependencies = ["missing-skill"]; } },
    { code: "plugin_dependency_self", mutate: (value) => { value.vendors[0].skills[0].dependencies = ["rock-mechanics"]; } },
    { code: "plugin_domain_skill_unknown", mutate: (value) => { value.domains[0].skills = ["missing-skill"]; } },
    { code: "plugin_registry_invalid", mutate: (value) => { value.vendors[0].skills[0].upstreams[0].source_paths = ["../escape"]; } },
    { code: "plugin_skill_missing", mutate: (value) => { value.vendors[0].skills[0].skill_id = "missing-skill"; value.domains[0].skills = ["missing-skill"]; } },
  ];
  for (const item of cases) {
    const value = structuredClone(valid); item.mutate(value);
    await assert.rejects(validatePluginRegistry(value, FIXTURE_ROOT), hasDiagnostic(item.code));
  }
});

void test("dependency cycles are finite and diagnosed", async () => {
  const valid = JSON.parse(await readFile(path.join(FIXTURE_ROOT, "registry.json"), "utf8")) as RegistryObject;
  valid.vendors[1].skills[0].dependencies = ["rock-mechanics"];
  const loaded = await validatePluginRegistry(valid, FIXTURE_ROOT);
  assert.deepEqual(resolveDomainSelection(loaded, ["geoscience"]).resolvedSkillIds, ["research-tables", "rock-mechanics"]);
  assert.ok(loaded.diagnostics.some((item) => item.code === "plugin_dependency_cycle"));
});

void test("registry rejects invalid frontmatter, name mismatch, and missing attribution", async () => {
  const root = await fixtureCopy();
  const skillRoot = path.join(root, "vendors/domain-source/rock-mechanics");
  try {
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

void test("resolved domain delivery reaches all adapters without wrappers or script execution", async () => {
  const root = await tempProject();
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = path.join(root, "codex-home");
  try {
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    const delivery = await planToolDelivery({ projectRoot: root, toolIds: TOOL_IDS, existingInstallations: [], force: false, pluginRegistry: registry, selectedPluginIds: ["geoscience"] });
    const domainFiles = delivery.installations.filter(isDomainSkillInstallation);
    const resourcesPerTool = (registry.skillFiles.get("rock-mechanics")?.length ?? 0) + (registry.skillFiles.get("research-tables")?.length ?? 0);
    assert.equal(domainFiles.length, TOOL_IDS.length * resourcesPerTool);
    assert.equal(new Set(domainFiles.map((item) => item.tool_id)).size, 31);
    assert.deepEqual([...new Set(domainFiles.map((item) => item.source.skill_id))].sort(), ["research-tables", "rock-mechanics"]);
    assert.ok(domainFiles.every((item) => item.source.vendor_id && item.source.vendor_release));
    assert.equal(delivery.installations.filter((item) => item.source.kind === "command").length, TOOLS.filter((tool) => tool.command).length * 16);
    assert.equal(await exists(path.join(root, "researchspec-plugin-script-executed")), false);
  } finally {
    if (previousCodexHome === undefined) Reflect.deleteProperty(process.env, "CODEX_HOME"); else process.env.CODEX_HOME = previousCodexHome;
    await cleanup(root);
  }
});

void test("domain selection persists without tools and tool update backfills the closure", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    const install = await handlePluginInstall(["geoscience"], {}, context(root), registry);
    assert.ok(install.diagnostics.some((item) => item.code === "plugin_projection_deferred"));
    await handleCurrentUpdate(undefined, { tools: "forgecode" }, context(root), registry);
    const script = path.join(root, ".forge/skills/rock-mechanics/scripts/calculate.py");
    assert.equal(await readFile(script, "utf8"), await readFile(path.join(FIXTURE_ROOT, "vendors/domain-source/rock-mechanics/scripts/calculate.py"), "utf8"));
    assert.equal(await exists(path.join(root, ".forge/skills/research-tables/SKILL.md")), true);
    const snapshot = await loadCurrentWorkspaceIndex(path.join(root, "researchspec"));
    assert.deepEqual(pluginStatusSummary(snapshot.config, snapshot.manifest, registry), { selected: ["geoscience"], available: ["geoscience", "quantitative-methods"], unavailable: [], projected: ["geoscience"], resolved_skills: ["research-tables", "rock-mechanics"] });
    assert.equal((await runCurrentWorkspaceChecks(snapshot.workspace, "plugins", false)).ok, true);
    await rm(script);
    await assert.rejects(
      handlePluginInstructions("rock-mechanics", context(root), registry),
      (error: unknown) => isCliCode(error, "plugin_skill_projection_drift"),
    );
  } finally { await cleanup(root); }
});

void test("agent install requires explicit consent and installed Skill instructions require a clean projection", async () => {
  const root = await tempProject();
  const fixture = await fixtureCopy();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const registry = await loadPluginRegistry(fixture);
    const preview = await handlePluginInstall(
      ["geoscience"],
      { summary: true },
      { ...context(root), dryRun: true, interactive: false, yes: false },
      registry,
    );
    const previewData = preview.data as { plan: { operation_count: number; actions: Record<string, number> } };
    assert.ok(previewData.plan.operation_count > 0);
    await assert.rejects(
      handlePluginInstall(["geoscience"], {}, { ...context(root), interactive: false, yes: false }, registry),
      (error: unknown) => isCliCode(error, "confirmation_required"),
    );
    const installed = await handlePluginInstall(
      ["geoscience"],
      { summary: true },
      { ...context(root), interactive: false, yes: true },
      registry,
    );
    assert.equal("plan_sha256" in (installed.data as Record<string, unknown>), false);

    const instructions = await handlePluginInstructions("rock-mechanics", context(root), registry);
    const packet = instructions.data as {
      skill_id: string;
      entry_sha256: string;
      instructions: string;
      resource_paths: string[];
      authority: { kind: string; producer_unchanged: boolean };
    };
    assert.equal(packet.skill_id, "rock-mechanics");
    assert.match(packet.entry_sha256, /^[a-f0-9]{64}$/);
    assert.match(packet.instructions, /^---\nname: rock-mechanics/m);
    assert.ok(packet.resource_paths.includes("scripts/calculate.py"));
    assert.equal(packet.authority.kind, "advisory-semantic-helper");
    assert.equal(packet.authority.producer_unchanged, true);

    await writeFile(path.join(root, ".forge/skills/rock-mechanics/SKILL.md"), "drift", "utf8");
    await assert.rejects(
      handlePluginInstructions("rock-mechanics", context(root), registry),
      (error: unknown) => isCliCode(error, "plugin_skill_projection_drift"),
    );
    await writeFile(
      path.join(root, ".forge/skills/rock-mechanics/SKILL.md"),
      packet.instructions,
      "utf8",
    );
    await writeFile(
      path.join(fixture, "vendors/domain-source/rock-mechanics/SKILL.md"),
      `${packet.instructions}\nSource drift\n`,
      "utf8",
    );
    await assert.rejects(
      handlePluginInstructions("rock-mechanics", context(root), registry),
      (error: unknown) => isCliCode(error, "plugin_skill_projection_drift"),
    );
  } finally { await cleanup(root); await cleanup(fixture); }
});

void test("lifecycle is idempotent, force-refreshes drift, and retains shared dependencies", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    await handlePluginInstall(["geoscience", "quantitative-methods"], {}, context(root), registry);
    const repeated = await handlePluginInstall(["geoscience"], {}, context(root), registry);
    assert.ok(planActions(repeated).every((action) => action === "skip-unchanged"));
    const skillPath = path.join(root, ".forge/skills/rock-mechanics/SKILL.md");
    await writeFile(skillPath, "user drift", "utf8");
    const preserved = await handlePluginUpdate(["geoscience"], context(root), registry);
    assert.ok(preserved.diagnostics.some((item) => item.code === "generated_file_drift"));
    await handlePluginUpdate(["geoscience"], { ...context(root), force: true }, registry);
    assert.match(await readFile(skillPath, "utf8"), /^---\nname: rock-mechanics/);
    await handlePluginUninstall(["geoscience"], context(root));
    assert.equal(await exists(skillPath), false);
    assert.equal(await exists(path.join(root, ".forge/skills/research-tables/SKILL.md")), true);
  } finally { await cleanup(root); }
});

void test("uninstall drift blocks the transaction and retired domains use snapshots", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const registry = await loadPluginRegistry(FIXTURE_ROOT);
    await handlePluginInstall(["geoscience"], {}, context(root), registry);
    const driftPath = path.join(root, ".forge/skills/rock-mechanics/SKILL.md");
    const dependencyPath = path.join(root, ".forge/skills/research-tables/SKILL.md");
    await writeFile(driftPath, "user drift", "utf8");
    await assert.rejects(handlePluginUninstall(["geoscience"], { ...context(root), force: true }), (error: unknown) => isCliCode(error, "plugin_uninstall_drift"));
    assert.equal(await exists(dependencyPath), true);
    await writeFile(driftPath, await readFile(path.join(FIXTURE_ROOT, "vendors/domain-source/rock-mechanics/SKILL.md"), "utf8"), "utf8");
    await handlePluginUninstall(["geoscience"], context(root));
    assert.equal(await exists(dependencyPath), false);
  } finally { await cleanup(root); }
});

void test("selected empty domains stay unavailable and retain snapshot-based uninstall", async () => {
  const root = await tempProject(); const fixture = await fixtureCopy();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const original = await loadPluginRegistry(fixture);
    await handlePluginInstall(["geoscience"], {}, context(root), original);
    const registryPath = path.join(fixture, "registry.json");
    const raw = JSON.parse(await readFile(registryPath, "utf8")) as RegistryObject;
    const geoscience = raw.domains.find((domain) => domain.domain_id === "geoscience");
    const quantitativeMethods = raw.domains.find((domain) => domain.domain_id === "quantitative-methods");
    assert.ok(geoscience);
    assert.ok(quantitativeMethods);
    geoscience.skills = [];
    quantitativeMethods.skills.push("rock-mechanics");
    await writeFile(registryPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
    const emptied = await loadPluginRegistry(fixture);
    const installed = await handlePluginList({ installed: true }, context(root), emptied);
    assert.deepEqual((installed.data as { domains: Array<{ domain_id: string; available: boolean }> }).domains.map((item) => [item.domain_id, item.available]), [["geoscience", false]]);
    await assert.rejects(handlePluginUpdate([], context(root), emptied), (error: unknown) => isCliCode(error, "plugin_unavailable"));
    await handlePluginUninstall(["geoscience"], context(root), emptied);
    assert.equal(await exists(path.join(root, ".forge/skills/rock-mechanics/SKILL.md")), false);
  } finally { await cleanup(root); await cleanup(fixture); }
});

void test("domain update records new vendor release and domain version", async () => {
  const root = await tempProject(); const fixture = await fixtureCopy();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    await handlePluginInstall(["geoscience"], {}, context(root), await loadPluginRegistry(fixture));
    const registryPath = path.join(fixture, "registry.json");
    const raw = JSON.parse(await readFile(registryPath, "utf8")) as RegistryObject;
    raw.vendors[0].release = "v1.1.0"; raw.domains[0].version = "1.1.0";
    await writeFile(registryPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
    await writeFile(path.join(fixture, "vendors/domain-source/rock-mechanics/references/criteria.md"), "# Updated criteria\n", "utf8");
    await handlePluginUpdate(["geoscience"], context(root), await loadPluginRegistry(fixture));
    const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as { installations: ManagedInstallation[]; plugin_resolutions: Array<{ domain_id: string; domain_version: string }> };
    assert.ok(manifest.installations.filter(isDomainSkillInstallation).filter((item) => item.source.vendor_id === "domain-source").every((item) => item.source.vendor_release === "v1.1.0"));
    assert.equal(manifest.plugin_resolutions.find((item) => item.domain_id === "geoscience")?.domain_version, "1.1.0");
  } finally { await cleanup(root); await cleanup(fixture); }
});

function context(root: string): CommandContext { return { command: "plugin", cwd: root, json: true, dryRun: false, force: false, yes: true, quiet: true, interactive: true }; }
async function fixtureCopy(): Promise<string> { const root = await tempProject(); await cp(FIXTURE_ROOT, root, { recursive: true, force: true }); return root; }
function hasDiagnostic(code: string): (error: unknown) => boolean { return (error) => error instanceof PluginRegistryError && error.diagnostics.some((item) => item.code === code); }
function isCliCode(error: unknown, code: string): boolean { return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === code); }
function planActions(result: { data?: unknown }): string[] { return ((result.data as { plan?: Array<{ action?: string }> } | undefined)?.plan ?? []).map((item) => item.action ?? ""); }
async function exists(filePath: string): Promise<boolean> { try { await readFile(filePath); return true; } catch { return false; } }

interface RegistryObject {
  schema_version: "1";
  domain_taxonomy: { discipline_system: "ANZSRC FoR"; discipline_version: "2020"; source_release: string };
  vendors: Array<{ vendor_id: string; release: string; skills: Array<{ skill_id: string; license: string; dependencies: string[]; upstreams: Array<{ source_paths: string[]; adaptation: "curated" | "converted" }> }>; [key: string]: unknown }>;
  domains: Array<{ domain_id: string; version: string; skills: string[]; [key: string]: unknown }>;
}
