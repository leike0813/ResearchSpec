import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { parse, stringify } from "yaml";

import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import {
  loadPluginExtensionRegistry,
  loadRuntimePluginExtensionRegistry,
  PluginExtensionRegistryError,
  resolveDomainExtensions,
} from "../src/plugins/extensions.js";
import { loadWorkspaceCapabilityRegistry } from "../src/plugins/runtime-capabilities.js";
import { loadProcedureCatalog } from "../src/procedures/catalog.js";
import { writeBaseWorkspace } from "./helpers/graph-workspace.js";

const REPO_ROOT = process.cwd();
const EXTENSION_ROOT = path.join(REPO_ROOT, "skills/plugins/extensions");
const BROKEN_CAPABILITY_ID = "plugin-financial-statement-analysis";
const UNAFFECTED_CAPABILITY_ID = "plugin-financial-company-fundamentals";
const BROKEN_KNOWLEDGE_PATH = "capabilities/plugin-financial-statement-analysis/tools/statements.py";

interface CliResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface CliEnvelope<T = unknown> {
  ok: boolean;
  data: T | null;
  diagnostics: Array<{ code?: string }>;
  error?: { code?: string; message?: string };
}

async function createFaultedExtensionPackage(): Promise<{ root: string; extensionRoot: string }> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-plugin-fault-"));
  await mkdir(path.join(root, "skills/plugins"), { recursive: true });
  await symlink(path.join(REPO_ROOT, "skills/capabilities"), path.join(root, "skills/capabilities"), "dir");
  await symlink(path.join(REPO_ROOT, "skills/arsu"), path.join(root, "skills/arsu"), "dir");
  const extensionRoot = path.join(root, "skills/plugins/extensions");
  await cp(EXTENSION_ROOT, extensionRoot, { recursive: true });
  await rm(path.join(extensionRoot, BROKEN_KNOWLEDGE_PATH));
  const registryPath = path.join(extensionRoot, "registry.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8")) as { profiles: Array<{ profile_id: string; profile_sha256: string }> };
  const patentApplication = registry.profiles.find((profile) => profile.profile_id === "patent-application");
  assert.ok(patentApplication);
  patentApplication.profile_sha256 = "0".repeat(64);
  await writeFile(registryPath, JSON.stringify(registry));
  return { root, extensionRoot };
}

async function createFaultedCliPackage(): Promise<{ root: string; cli: string }> {
  const { root } = await createFaultedExtensionPackage();
  await cp(path.join(REPO_ROOT, ".test-dist/src"), path.join(root, ".test-dist/src"), { recursive: true });
  await cp(path.join(REPO_ROOT, "package.json"), path.join(root, "package.json"));
  await symlink(path.join(REPO_ROOT, "node_modules"), path.join(root, "node_modules"), "dir");
  await symlink(path.join(REPO_ROOT, "hooks"), path.join(root, "hooks"), "dir");
  await symlink(path.join(REPO_ROOT, "skills/plugins/registry.json"), path.join(root, "skills/plugins/registry.json"));
  await symlink(path.join(REPO_ROOT, "skills/plugins/vendors"), path.join(root, "skills/plugins/vendors"), "dir");
  return { root, cli: path.join(root, ".test-dist/src/cli/bin.js") };
}

function runPackagedCli(cli: string, args: string[], cwd: string): CliResult {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env: process.env });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function parseCli<T>(result: CliResult): CliEnvelope<T> {
  assert.notEqual(result.stdout.trim(), "", result.stderr);
  return JSON.parse(result.stdout) as CliEnvelope<T>;
}

void test("runtime extension discovery isolates a damaged capability and its dependent profile", async () => {
  const fixture = await createFaultedExtensionPackage();
  try {
    await assert.rejects(
      loadPluginExtensionRegistry(fixture.extensionRoot),
      (error: unknown) => error instanceof PluginExtensionRegistryError
        && error.diagnostics.some((diagnostic) => diagnostic.code === "plugin_extension_capability_knowledge_missing"),
    );

    const runtime = await loadRuntimePluginExtensionRegistry(fixture.extensionRoot);
    assert.equal(runtime.capabilities.has(BROKEN_CAPABILITY_ID), false);
    assert.equal(runtime.profiles.has(BROKEN_CAPABILITY_ID), false);
    assert.equal(runtime.capabilities.has(UNAFFECTED_CAPABILITY_ID), true);
    assert.equal(runtime.profiles.has(UNAFFECTED_CAPABILITY_ID), true);
    for (const profileId of ["patent-application", "patent-docket", "research-to-patent"]) {
      assert.equal(runtime.profiles.has(profileId), false, profileId);
    }
    assert.equal(runtime.profiles.has("patent-disclosure"), true);
    assert.equal(runtime.diagnostics.some((diagnostic) => diagnostic.code === "plugin_extension_capability_knowledge_missing"), true);
    assert.equal(runtime.diagnostics.some((diagnostic) => diagnostic.code === "plugin_extension_profile_capability_unknown"), true);
    assert.equal(runtime.diagnostics.every((diagnostic) => diagnostic.severity === "warning" && !diagnostic.blocking), true);

    const finance = resolveDomainExtensions(runtime, ["banking-finance-and-investment"]);
    assert.equal(finance.capabilityIds.includes(BROKEN_CAPABILITY_ID), false);
    assert.equal(finance.profileIds.includes(BROKEN_CAPABILITY_ID), false);
    assert.equal(finance.capabilityIds.includes(UNAFFECTED_CAPABILITY_ID), true);
    assert.equal(finance.profileIds.includes(UNAFFECTED_CAPABILITY_ID), true);

    const catalog = await loadProcedureCatalog(fixture.root);
    assert.equal(catalog.has("deep-research"), true);
    assert.equal(catalog.has("discovery-patent-search"), true);
    assert.equal(catalog.has(UNAFFECTED_CAPABILITY_ID), true);
    assert.equal(catalog.has(BROKEN_CAPABILITY_ID), false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

void test("workspace capability loading keeps core and unaffected selected capabilities", async () => {
  const fixture = await createFaultedExtensionPackage();
  const project = await mkdtemp(path.join(tmpdir(), "researchspec-plugin-workspace-"));
  try {
    const workspace = await writeBaseWorkspace(project);
    const configPath = path.join(workspace, "config.yaml");
    const config = parse(await readFile(configPath, "utf8")) as { plugins: { selected: string[] } };
    config.plugins.selected = ["banking-finance-and-investment"];
    await writeFile(configPath, stringify(config), "utf8");

    const index = await loadGraphWorkspaceIndex(workspace);
    const runtime = await loadRuntimePluginExtensionRegistry(fixture.extensionRoot);
    const registry = await loadWorkspaceCapabilityRegistry(index, runtime);

    assert.equal(registry.capabilities.has("design-research-question-formulation"), true);
    assert.equal(registry.capabilities.has(UNAFFECTED_CAPABILITY_ID), true);
    assert.equal(registry.capabilities.has(BROKEN_CAPABILITY_ID), false);
    assert.equal(registry.diagnostics.some((diagnostic) => diagnostic.code === "plugin_extension_capability_knowledge_missing"), true);
    assert.equal(registry.diagnostics.every((diagnostic) => !diagnostic.blocking), true);
  } finally {
    await rm(project, { recursive: true, force: true });
    await rm(fixture.root, { recursive: true, force: true });
  }
});

void test("CLI fault isolation preserves strict plugin failures and core graph work", async () => {
  const packaged = await createFaultedCliPackage();
  const project = await mkdtemp(path.join(tmpdir(), "researchspec-plugin-cli-"));
  try {
    const initialized = parseCli<{ workspace: string }>(runPackagedCli(packaged.cli, ["init", project, "--tools", "none", "--json"], project));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));
    const workspace = initialized.data?.workspace ?? path.join(project, "researchspec");

    const updatedWithoutOwners = parseCli(runPackagedCli(packaged.cli, ["update", "--tools", "none", "--json"], project));
    assert.equal(updatedWithoutOwners.ok, true, JSON.stringify(updatedWithoutOwners.error));

    const rejectedInstall = runPackagedCli(packaged.cli, ["plugin", "install", "banking-finance-and-investment", "--yes", "--json"], project);
    assert.notEqual(rejectedInstall.status, 0);
    const rejectedInstallEnvelope = parseCli(rejectedInstall);
    assert.equal(rejectedInstallEnvelope.ok, false);
    assert.equal(rejectedInstallEnvelope.data, null);

    const configPath = path.join(workspace, "config.yaml");
    const config = parse(await readFile(configPath, "utf8")) as { plugins: { selected: string[] } };
    assert.deepEqual(config.plugins.selected, []);

    const checked = parseCli<{ target: string; diagnostics: Array<{ code?: string }> }>(
      runPackagedCli(packaged.cli, ["check", "plugins", "--json"], project),
    );
    assert.equal(checked.ok, false);
    assert.equal(checked.data?.target, "plugins");
    assert.equal(checked.data?.diagnostics.some((diagnostic) => diagnostic.code === "plugin_extension_registry_unavailable"), true);

    config.plugins.selected = ["banking-finance-and-investment"];
    await writeFile(configPath, stringify(config), "utf8");
    const rejectedUpdate = runPackagedCli(packaged.cli, ["update", "--tools", "none", "--json"], project);
    assert.notEqual(rejectedUpdate.status, 0);
    const rejectedUpdateEnvelope = parseCli(rejectedUpdate);
    assert.equal(rejectedUpdateEnvelope.ok, false);
    assert.equal(rejectedUpdateEnvelope.data, null);
    const afterRejectedUpdate = parse(await readFile(configPath, "utf8")) as { plugins: { selected: string[] } };
    assert.deepEqual(afterRejectedUpdate.plugins.selected, ["banking-finance-and-investment"]);

    const startInput = path.join(project, "start.yaml");
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
    const started = parseCli<{ run_id: string }>(
      runPackagedCli(packaged.cli, ["start", "minimal", "--input", startInput, "--confirmed-by", "researcher", "--json"], project),
    );
    assert.equal(started.ok, true, JSON.stringify(started.error));
    const runId = started.data?.run_id;
    assert.ok(runId);

    const nodeInstructions = parseCli<{ procedure_packet: { procedure: { id: string } } }>(
      runPackagedCli(packaged.cli, ["instructions", `node:${runId}/rq`, "--json"], project),
    );
    assert.equal(nodeInstructions.ok, true, JSON.stringify(nodeInstructions.error));
    assert.equal(nodeInstructions.data?.procedure_packet.procedure.id, "design-research-question-formulation");

    await writeFile(path.join(project, "rq-brief.md"), "Research question brief\n", "utf8");
    const advanceInput = path.join(project, "advance.yaml");
    await writeFile(advanceInput, stringify({ outputs: [{ role: "rq_brief", path: "rq-brief.md" }] }), "utf8");
    const advanced = parseCli(runPackagedCli(packaged.cli, ["advance", `node:${runId}/rq`, "--input", advanceInput, "--json"], project));
    assert.equal(advanced.ok, true, JSON.stringify(advanced.error));

    const coreProcedure = parseCli<{ packet: { procedure: { id: string } } }>(
      runPackagedCli(packaged.cli, ["instructions", "procedure:deep-research", "--json"], project),
    );
    assert.equal(coreProcedure.ok, true, JSON.stringify(coreProcedure.error));
    assert.equal(coreProcedure.data?.packet.procedure.id, "deep-research");

    const unaffectedProcedure = parseCli<{ packet: { procedure: { id: string; content: string } } }>(
      runPackagedCli(packaged.cli, ["instructions", `procedure:${UNAFFECTED_CAPABILITY_ID}`, "--json"], project),
    );
    assert.equal(unaffectedProcedure.ok, true, JSON.stringify(unaffectedProcedure.error));
    assert.equal(unaffectedProcedure.data?.packet.procedure.id, UNAFFECTED_CAPABILITY_ID);

    const brokenProcedure = runPackagedCli(packaged.cli, ["instructions", `procedure:${BROKEN_CAPABILITY_ID}`, "--json"], project);
    assert.equal(brokenProcedure.status, 1);
    const brokenEnvelope = parseCli(brokenProcedure);
    assert.equal(brokenEnvelope.ok, false);
    assert.equal(brokenEnvelope.error?.code, "procedure_not_found");
    assert.equal(brokenEnvelope.data, null);
    assert.equal(brokenProcedure.stdout.includes("\"packet\""), false);
  } finally {
    await rm(project, { recursive: true, force: true });
    await rm(packaged.root, { recursive: true, force: true });
  }
});
