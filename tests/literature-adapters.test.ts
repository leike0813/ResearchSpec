import assert from "node:assert/strict";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { planWorkspaceDelivery } from "../src/adapters/workspace-delivery.js";
import { executeWritePlan } from "../src/core/workspace/write-plan.js";
import {
  LITERATURE_ADAPTER_CATALOG,
  LiteratureAdapterDefinitionSchema,
  normalizeLiteratureAdapterPlatform,
  planLiteratureAdapterDelivery,
  resolveLiteratureAdapterPlatform,
  validateLiteratureAdapterCatalog,
} from "../src/literature-adapters/index.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("fixed Zotero catalog binds the approved release set and seven runtimes", () => {
  const [adapter] = LITERATURE_ADAPTER_CATALOG;
  assert.equal(adapter?.adapter_id, "zotero-library");
  assert.equal(adapter?.install_policy, "fixed");
  assert.equal(adapter?.identity.release_set_id, "hbrs-3d834c0f075f3122ac566e9a");
  assert.equal(adapter?.runtimes.length, 7);
  assert.equal(new Set(adapter?.runtimes.map((runtime) => runtime.platform)).size, 7);
});

void test("platform normalization is exact and unsupported combinations do not fall back", () => {
  assert.equal(normalizeLiteratureAdapterPlatform("win32", "x64"), "win32-x64");
  assert.equal(normalizeLiteratureAdapterPlatform("darwin", "arm64"), "darwin-arm64");
  assert.equal(normalizeLiteratureAdapterPlatform("linux", "ia32"), "linux-x86");
  assert.equal(normalizeLiteratureAdapterPlatform("freebsd", "x64"), undefined);
  const fixedAdapter = LITERATURE_ADAPTER_CATALOG[0];
  assert.ok(fixedAdapter);
  const resolution = resolveLiteratureAdapterPlatform(fixedAdapter, "freebsd", "x64");
  assert.deepEqual(resolution, { supported: false, platform: "freebsd-x64", runtime: null });
});

void test("component patch versions are independently valid", () => {
  const fixedAdapter = LITERATURE_ADAPTER_CATALOG[0];
  assert.ok(fixedAdapter);
  const adapter = structuredClone(fixedAdapter);
  adapter.versions.bundle = "0.3.7";
  adapter.versions.cli = "0.4.1";
  adapter.versions.skills[adapter.primary_skill_id] = "0.5.9";
  assert.equal(LiteratureAdapterDefinitionSchema.safeParse(adapter).success, true);
  assert.equal(validateLiteratureAdapterCatalog([adapter]).length, 1);
});

void test("workspace delivery projects ten fixed Skills while retaining eight wrappers", async () => {
  const root = await tempProject();
  try {
    const delivery = await planWorkspaceDelivery({
      projectRoot: root,
      toolIds: ["claude"],
      selectedToolIds: ["claude"],
      reconciledToolIds: ["claude"],
      existingInstallations: [],
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    const skillIds = new Set(delivery.installations.flatMap((item) => {
      if (item.tool_id !== "claude") return [];
      if (item.source.kind === "arsu-skill" || item.source.kind === "companion-skill" || item.source.kind === "domain-skill") return [item.source.skill_id];
      return item.source.kind === "literature-adapter" && item.source.component === "skill" && item.source.skill_id ? [item.source.skill_id] : [];
    }));
    const wrappers = delivery.installations.filter((item) => item.tool_id === "claude" && item.source.kind === "command");
    assert.equal(skillIds.size, 10);
    assert.equal(wrappers.length, 8);
    assert.equal(delivery.literatureAdapterResolutions[0]?.projection_state, "complete");
    assert.equal(delivery.literatureAdapterResolutions[0]?.runtime_asset?.installed_path, ".zotero-bridge/bin/zotero-bridge");
    await executeWritePlan({ operations: delivery.operations });
    assert.equal((await lstat(path.join(root, ".zotero-bridge/bin/zotero-bridge"))).mode & 0o777, 0o755);
  } finally {
    await cleanup(root);
  }
});

void test("fixed runtime installs without Agent tools and defers only Skill projection", async () => {
  const root = await tempProject();
  try {
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: [], existingInstallations: [], force: false, platform: "linux", architecture: "x64" });
    assert.equal(delivery.resolutions[0]?.projection_state, "deferred");
    assert.ok(delivery.resolutions[0]?.runtime_asset);
    assert.equal(delivery.installations.filter((item) => item.source.kind === "literature-adapter" && item.source.component === "skill").length, 0);
    assert.ok(delivery.installations.some((item) => item.target.path === ".zotero-bridge/profile.template.json"));
    assert.ok(delivery.installations.some((item) => item.target.path === ".zotero-bridge/bin/zotero-bridge"));
  } finally {
    await cleanup(root);
  }
});

void test("unsupported targets keep static projection but do not select a runtime", async () => {
  const root = await tempProject();
  try {
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: ["claude"], existingInstallations: [], force: false, platform: "freebsd", architecture: "x64" });
    assert.equal(delivery.resolutions[0]?.target_platform, "freebsd-x64");
    assert.equal(delivery.resolutions[0]?.runtime_asset, null);
    assert.equal(delivery.resolutions[0]?.projection_state, "complete");
    assert.ok(delivery.installations.some((item) => item.source.kind === "literature-adapter" && item.source.component === "skill"));
    assert.ok(delivery.diagnostics.some((item) => item.code === "literature_adapter_platform_unsupported"));
  } finally {
    await cleanup(root);
  }
});

void test("Windows delivery selects the exe and deterministic cmd shim", async () => {
  const root = await tempProject();
  try {
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: [], existingInstallations: [], force: false, platform: "win32", architecture: "x64" });
    const targets = new Set(delivery.installations.map((item) => item.target.path));
    assert.ok(targets.has(".zotero-bridge/bin/zotero-bridge.exe"));
    assert.ok(targets.has(".zotero-bridge/bin/zotero-bridge.cmd"));
    const shim = delivery.operations.find((item) => item.relativePath === ".zotero-bridge/bin/zotero-bridge.cmd");
    assert.equal(shim?.content, "@echo off\r\n\"%~dp0zotero-bridge.exe\" %*\r\n");
  } finally {
    await cleanup(root);
  }
});

void test("adapter delivery never adopts or overwrites an unowned target", async () => {
  const root = await tempProject();
  const target = path.join(root, ".zotero-bridge/bin/zotero-bridge");
  try {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, "user binary");
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: [], existingInstallations: [], force: true, platform: "linux", architecture: "x64" });
    assert.equal(delivery.operations.find((item) => item.path === target)?.action, "conflict");
    assert.equal(delivery.resolutions[0]?.projection_state, "incomplete");
    await executeWritePlan({ operations: delivery.operations });
    assert.equal(await readFile(target, "utf8"), "user binary");
  } finally {
    await cleanup(root);
  }
});
