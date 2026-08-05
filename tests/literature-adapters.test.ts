import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { planWorkspaceDelivery } from "../src/adapters/workspace-delivery.js";
import { executeWritePlan } from "../src/core/workspace/write-plan.js";
import {
  LITERATURE_ADAPTER_CATALOG,
  LiteratureAdapterDefinitionSchema,
  normalizeLiteratureAdapterPlatform,
  parseLiteratureAdapterExpression,
  planLiteratureAdapterDelivery,
  resolveLiteratureAdapterPlatform,
  validateLiteratureAdapterCatalog,
} from "../src/literature-adapters/index.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");

void test("optional Zotero catalog binds the approved release set, setup guidance, and seven runtimes", () => {
  const [adapter] = LITERATURE_ADAPTER_CATALOG;
  assert.equal(adapter?.adapter_id, "zotero-library");
  assert.equal(adapter?.install_policy, "optional");
  assert.equal(adapter?.display.name, "Zotero Agents");
  assert.match(adapter?.display.description ?? "", /Requires Zotero.*zotero-agents plugin/);
  assert.equal(adapter?.display.setup_url, "https://github.com/leike0813/zotero-agents");
  assert.equal(adapter?.identity.release_set_id, "hbrs-8c6de08010d459a0e87e74f2");
  assert.equal(adapter?.skills.length, 7);
  assert.deepEqual(adapter?.skills.map((skill) => skill.role), ["router", "task", "task", "task", "task", "task", "mechanism"]);
  assert.equal(adapter?.skills.every((skill) => skill.researchspec_workflow_authority === "none"), true);
  assert.equal(adapter?.runtimes.length, 7);
  assert.equal(new Set(adapter?.runtimes.map((runtime) => runtime.platform)).size, 7);
});

void test("literature adapter expressions support none, all, and catalog IDs", () => {
  assert.deepEqual(parseLiteratureAdapterExpression("none"), []);
  assert.deepEqual(parseLiteratureAdapterExpression("all"), ["zotero-library"]);
  assert.deepEqual(parseLiteratureAdapterExpression("zotero-library,zotero-library"), ["zotero-library"]);
  assert.throws(() => parseLiteratureAdapterExpression("unknown-adapter"), /Unknown literature Adapter/);
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
  adapter.versions.bundle = "0.4.7";
  adapter.versions.cli = "0.4.1";
  const firstSkill = adapter.skills[0];
  assert.ok(firstSkill);
  firstSkill.version = "0.5.9";
  assert.equal(LiteratureAdapterDefinitionSchema.safeParse(adapter).success, true);
  assert.equal(validateLiteratureAdapterCatalog([adapter]).length, 1);
});

void test("workspace delivery projects seventeen Skills and sixteen wrappers when Zotero is selected", async () => {
  const root = await tempProject();
  try {
    const delivery = await planWorkspaceDelivery({
      projectRoot: root,
      toolIds: ["claude"],
      selectedToolIds: ["claude"],
      reconciledToolIds: ["claude"],
      selectedLiteratureAdapterIds: ["zotero-library"],
      existingInstallations: [],
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    const skillIds = new Set(delivery.installations.flatMap((item) => {
      if (item.tool_id !== "claude") return [];
      if (item.source.kind === "arsu-skill" || item.source.kind === "core-skill" || item.source.kind === "companion-skill" || item.source.kind === "domain-skill") return [item.source.skill_id];
      return item.source.kind === "literature-adapter" && item.source.component === "skill" && item.source.skill_id ? [item.source.skill_id] : [];
    }));
    const wrappers = delivery.installations.filter((item) => item.tool_id === "claude" && item.source.kind === "command");
    assert.equal(skillIds.size, 17);
    assert.equal(wrappers.length, 16);
    assert.equal(delivery.literatureAdapterResolutions[0]?.projection_state, "complete");
    assert.equal(delivery.literatureAdapterResolutions[0]?.runtime_asset?.installed_path, ".zotero-bridge/bin/zotero-bridge");
    await executeWritePlan({ operations: delivery.operations });
    assert.equal((await lstat(path.join(root, ".zotero-bridge/bin/zotero-bridge"))).mode & 0o777, 0o755);
  } finally {
    await cleanup(root);
  }
});

void test("unselected literature adapters produce no managed delivery", async () => {
  const root = await tempProject();
  try {
    const delivery = await planLiteratureAdapterDelivery({
      projectRoot: root,
      toolIds: ["claude"],
      selectedAdapterIds: [],
      existingInstallations: [],
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    assert.deepEqual(delivery.operations, []);
    assert.deepEqual(delivery.installations, []);
    assert.deepEqual(delivery.resolutions, []);
  } finally {
    await cleanup(root);
  }
});

void test("selected runtime installs without Agent tools and defers only Skill projection", async () => {
  const root = await tempProject();
  try {
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: [], selectedAdapterIds: ["zotero-library"], existingInstallations: [], force: false, platform: "linux", architecture: "x64" });
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
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: ["claude"], selectedAdapterIds: ["zotero-library"], existingInstallations: [], force: false, platform: "freebsd", architecture: "x64" });
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
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: [], selectedAdapterIds: ["zotero-library"], existingInstallations: [], force: false, platform: "win32", architecture: "x64" });
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
    const delivery = await planLiteratureAdapterDelivery({ projectRoot: root, toolIds: [], selectedAdapterIds: ["zotero-library"], existingInstallations: [], force: true, platform: "linux", architecture: "x64" });
    assert.equal(delivery.operations.find((item) => item.path === target)?.action, "conflict");
    assert.equal(delivery.resolutions[0]?.projection_state, "incomplete");
    await executeWritePlan({ operations: delivery.operations });
    assert.equal(await readFile(target, "utf8"), "user binary");
  } finally {
    await cleanup(root);
  }
});

void test("forced adapter refresh replaces a drifted v1 managed profile with the v2 release", async () => {
  const root = await tempProject();
  const relativePath = ".zotero-bridge/profile.template.json";
  const target = path.join(root, relativePath);
  const priorContent = "{\"protocol\":\"host-bridge.v1\"}\n";
  try {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, "locally modified v1 profile\n", "utf8");
    const delivery = await planLiteratureAdapterDelivery({
      projectRoot: root,
      toolIds: [],
      selectedAdapterIds: ["zotero-library"],
      existingInstallations: [{
        owner: "literature-adapter",
        tool_id: null,
        source: {
          kind: "literature-adapter",
          adapter_id: "zotero-library",
          release_set_id: "hbrs-f9f28ddce98be3008e13bbdb",
          component: "profile-template",
        },
        target: { scope: "project", path: relativePath, executable: false },
        sha256: hash(priorContent),
      }],
      force: true,
      platform: "linux",
      architecture: "x64",
    });
    assert.equal(delivery.resolutions[0]?.release_set_id, "hbrs-8c6de08010d459a0e87e74f2");
    assert.equal(delivery.operations.find((item) => item.path === target)?.action, "refresh");
    await executeWritePlan({ operations: delivery.operations });
    const profile = JSON.parse(await readFile(target, "utf8")) as { protocol?: string; endpoint?: string };
    assert.equal(profile.protocol, "host-bridge.v2");
    assert.equal(profile.endpoint, "http://127.0.0.1:26570/bridge/v2");
  } finally {
    await cleanup(root);
  }
});

void test("owner-aware upgrade adds five Skill trees and preserves drifted legacy files", async () => {
  const root = await tempProject();
  const legacySkillIds = new Set(["zotero-library-agent", "zotero-bridge-cli"]);
  try {
    const initial = await planLiteratureAdapterDelivery({
      projectRoot: root,
      toolIds: ["claude"],
      selectedAdapterIds: ["zotero-library"],
      existingInstallations: [],
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    const legacyInstallations = initial.installations.filter((installation) =>
      installation.source.kind !== "literature-adapter"
      || installation.source.component !== "skill"
      || (installation.source.skill_id !== undefined && legacySkillIds.has(installation.source.skill_id))
    );
    const legacyPaths = new Set(legacyInstallations.map((installation) => installation.target.path));
    await executeWritePlan({
      operations: initial.operations.filter(
        (operation) => operation.relativePath !== undefined && legacyPaths.has(operation.relativePath),
      ),
    });

    const legacyEntry = legacyInstallations.find((installation) =>
      installation.source.kind === "literature-adapter"
      && installation.source.component === "skill"
      && installation.source.skill_id === "zotero-library-agent"
      && installation.target.path.endsWith("/SKILL.md")
    );
    assert.ok(legacyEntry);
    const legacyTarget = path.join(root, legacyEntry.target.path);
    await writeFile(legacyTarget, "user-owned drift\n", "utf8");

    const upgraded = await planLiteratureAdapterDelivery({
      projectRoot: root,
      toolIds: ["claude"],
      selectedAdapterIds: ["zotero-library"],
      existingInstallations: legacyInstallations,
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    assert.ok(upgraded.diagnostics.some((diagnostic) => diagnostic.code === "literature_adapter_file_drift"));
    assert.equal(upgraded.resolutions[0]?.projection_state, "incomplete");
    const projectedSkillIds = new Set(upgraded.installations.flatMap((installation) =>
      installation.source.kind === "literature-adapter"
      && installation.source.component === "skill"
      && installation.source.skill_id
        ? [installation.source.skill_id]
        : []
    ));
    assert.equal(projectedSkillIds.size, 7);
    await executeWritePlan({ operations: upgraded.operations });
    assert.equal(await readFile(legacyTarget, "utf8"), "user-owned drift\n");
    for (const skillId of ["zotero-library-query", "zotero-literature-acquisition", "zotero-literature-analysis", "zotero-research-synthesis", "zotero-library-curation"]) {
      assert.equal(await readFile(path.join(root, ".claude/skills", skillId, "SKILL.md"), "utf8").then(() => true), true);
    }
  } finally {
    await cleanup(root);
  }
});
