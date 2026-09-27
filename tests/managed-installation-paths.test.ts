import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  reconcileAgentToolInstallations,
  ManagedInstallationSchema,
  type ManagedInstallation,
} from "../src/adapters/installations.js";
import { resolveManagedTarget, validateManagedTarget } from "../src/adapters/managed-target.js";
import { planToolDelivery } from "../src/adapters/delivery.js";
import { entryOwnedBytes, inspectProjectEntries, planProjectEntryDelivery } from "../src/adapters/project-entry.js";
import { TOOLS } from "../src/adapters/tools.js";
import { executeWritePlan, sha256 } from "../src/core/workspace/write-plan.js";
import { reconcileLiteratureAdapterInstallations } from "../src/literature-adapters/delivery.js";
import { PluginProjectionError, planPluginProjection } from "../src/plugins/graph-delivery.js";
import type { LoadedPluginRegistry } from "../src/plugins/registry.js";
import type { LoadedPluginExtensionRegistry } from "../src/plugins/extensions.js";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");

void test("managed installation schema bounds project paths while allowing framework profiles", () => {
  const base = {
    owner: "framework" as const,
    tool_id: null,
    source: { kind: "plugin-profile" as const, profile_id: "retired-profile", profile_version: "1.0.0" },
    target: { scope: "project" as const, path: "../report.md", executable: false },
    sha256: hash("report"),
  };
  assert.equal(ManagedInstallationSchema.safeParse(base).success, false);
  assert.equal(ManagedInstallationSchema.safeParse({
    ...base,
    target: { ...base.target, path: "researchspec/profiles/retired-profile.yaml" },
  }).success, true);
  for (const invalidPath of ["", ".", "../escape.md", "a/../escape.md", "/tmp/escape.md", "C:/escape.md", "a\\escape.md", "a//escape.md", "nul\0escape.md"]) {
    assert.equal(ManagedInstallationSchema.safeParse({ ...base, target: { ...base.target, path: invalidPath } }).success, false, invalidPath);
  }
});

void test("managed target resolution derives profile and project roots", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-managed-target-"));
  try {
    const profile = asInstallation({
      owner: "framework",
      tool_id: null,
      source: { kind: "plugin-profile", profile_id: "retired-profile", profile_version: "old-version/with-no-path-authority" },
      target: { scope: "project", path: "researchspec/profiles/retired-profile.yaml", executable: false },
      sha256: hash("profile"),
    });
    assert.deepEqual(resolveManagedTarget(root, profile), {
      path: path.join(root, "researchspec/profiles/retired-profile.yaml"),
      boundaryRoot: root,
    });
    await validateManagedTarget(root, profile);

    const customAgent = asInstallation({
      owner: "agent-tool", tool_id: "vibe",
      source: { kind: "custom-agent", role_id: "researchspec-reviewer", component: "prompt" },
      target: { scope: "project", path: ".vibe/prompts/researchspec-reviewer.md", executable: false }, sha256: hash("prompt"),
    });
    assert.deepEqual(resolveManagedTarget(root, customAgent), {
      path: path.join(root, ".vibe/prompts/researchspec-reviewer.md"),
      boundaryRoot: root,
    });
    await validateManagedTarget(root, customAgent);
    assert.throws(() => resolveManagedTarget(root, asInstallation({
      ...customAgent,
      target: { ...customAgent.target, path: ".vibe/prompts/other.md" },
    })));

    assert.throws(() => resolveManagedTarget(root, asInstallation({
      owner: "agent-tool", tool_id: "claude",
      source: { kind: "core-skill", skill_id: "retired-skill" },
      target: { scope: "project", path: ".claude/skills/other-skill/SKILL.md", executable: false }, sha256: hash("skill"),
    })));
    assert.throws(() => resolveManagedTarget(root, asInstallation({
      owner: "framework", tool_id: null,
      source: { kind: "plugin-profile", profile_id: "retired-profile", profile_version: "1" },
      target: { scope: "project", path: "researchspec/profiles/other-profile.yaml", executable: false }, sha256: hash("profile"),
    })));
    assert.throws(() => resolveManagedTarget(root, asInstallation({
      owner: "agent-tool", tool_id: "claude",
      source: { kind: "command", command_id: "unknown-wrapper" },
      target: { scope: "project", path: ".claude/commands/researchspec/plugin.md", executable: false }, sha256: hash("command"),
    })));
    assert.throws(() => resolveManagedTarget(root, asInstallation({
      owner: "agent-tool", tool_id: "claude",
      source: { kind: "shared-skill-target", target_id: "codex" },
      target: { scope: "project", path: ".claude/skills/.researchspec-target", executable: false }, sha256: hash("marker"),
    })));
    assert.throws(() => resolveManagedTarget(root, asInstallation({
      owner: "agent-tool", tool_id: "claude",
      source: { kind: "core-skill", skill_id: "retired-skill" },
      target: { scope: "shared-global", path: path.join(root, ".claude", "skills", "retired-skill", "SKILL.md"), executable: false }, sha256: hash("skill"),
    })));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("managed validation permits a symlinked project root and rejects descendant links", async () => {
  const container = await mkdtemp(path.join(tmpdir(), "researchspec-managed-links-"));
  const realRoot = path.join(container, "real");
  const linkedRoot = path.join(container, "project-link");
  const outside = path.join(container, "outside");
  try {
    await mkdir(realRoot);
    await mkdir(outside);
    await symlink(realRoot, linkedRoot, "dir");
    const record = asInstallation({
      owner: "agent-tool",
      tool_id: "claude",
      source: { kind: "core-skill", skill_id: "retired-skill" },
      target: { scope: "project", path: ".claude/skills/retired-skill/SKILL.md", executable: false },
      sha256: hash("skill"),
    });
    await validateManagedTarget(linkedRoot, record);

    await symlink(outside, path.join(realRoot, ".claude"), "dir");
    await assert.rejects(
      validateManagedTarget(realRoot, record),
      (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT",
    );
  } finally {
    await rm(container, { recursive: true, force: true });
  }
});

void test("agent reconciliation blocks a typed unsafe record before reading or removing it", async () => {
  const container = await mkdtemp(path.join(tmpdir(), "researchspec-managed-agent-"));
  const root = path.join(container, "project");
  const victim = path.join(container, "report.md");
  try {
    await mkdir(root);
    await writeFile(victim, "keep me", "utf8");
    const malicious = asInstallation({
      owner: "agent-tool",
      tool_id: "claude",
      source: { kind: "core-skill", skill_id: "retired-skill" },
      target: { scope: "project", path: "../report.md", executable: false },
      sha256: hash("keep me"),
    });
    const result = await reconcileAgentToolInstallations({
      projectRoot: root,
      existingInstallations: [malicious],
      desiredInstallations: [],
      reconciledToolIds: ["claude"],
      selectedToolIds: [],
    });
    assert.equal(result.operations.length, 0);
    assert.equal(result.retainedInstallations.length, 1);
    assert.ok(result.diagnostics.some((item) => item.code === "managed_target_invalid" && item.blocking));
    assert.equal(await readFile(victim, "utf8"), "keep me");
  } finally {
    await rm(container, { recursive: true, force: true });
  }
});

void test("agent reconciliation removes only a clean retired project record", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-managed-clean-"));
  try {
    const projectTarget = path.join(root, ".claude/skills/retired-skill/SKILL.md");
    await mkdir(path.dirname(projectTarget), { recursive: true });
    await writeFile(projectTarget, "retired", "utf8");
    const projectRecord = asInstallation({
      owner: "agent-tool", tool_id: "claude",
      source: { kind: "core-skill", skill_id: "retired-skill" },
      target: { scope: "project", path: ".claude/skills/retired-skill/SKILL.md", executable: false }, sha256: hash("retired"),
    });
    const projectResult = await reconcileAgentToolInstallations({
      projectRoot: root, existingInstallations: [projectRecord], desiredInstallations: [],
      reconciledToolIds: ["claude"], selectedToolIds: [],
    });
    assert.equal(projectResult.operations.length, 1);
    assert.equal(projectResult.operations[0]?.action, "remove-owned");
    assert.equal(projectResult.operations[0]?.boundaryRoot, root);

  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("custom-agent reconciliation removes clean profiles and preserves drift", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-managed-agents-"));
  try {
    const target = path.join(root, ".codex/agents/researchspec-executor.toml");
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, "managed", "utf8");
    const record = asInstallation({
      owner: "agent-tool", tool_id: "codex",
      source: { kind: "custom-agent", role_id: "researchspec-executor", component: "definition" },
      target: { scope: "project", path: ".codex/agents/researchspec-executor.toml", executable: false },
      sha256: hash("managed"),
    });
    const clean = await reconcileAgentToolInstallations({
      projectRoot: root, existingInstallations: [record], desiredInstallations: [],
      reconciledToolIds: ["codex"], selectedToolIds: [],
    });
    assert.equal(clean.operations[0]?.action, "remove-owned");

    await writeFile(target, "user edit", "utf8");
    const drift = await reconcileAgentToolInstallations({
      projectRoot: root, existingInstallations: [record], desiredInstallations: [],
      reconciledToolIds: ["codex"], selectedToolIds: [],
    });
    assert.equal(drift.operations.length, 0);
    assert.deepEqual(drift.retainedInstallations, [record]);
    assert.ok(drift.diagnostics.some((item) => item.code === "generated_file_drift"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("literature reconciliation blocks an unsafe typed record before target reads", async () => {
  const container = await mkdtemp(path.join(tmpdir(), "researchspec-managed-literature-"));
  const root = path.join(container, "project");
  const victim = path.join(container, "report.md");
  try {
    await mkdir(root);
    await writeFile(victim, "keep me", "utf8");
    const malicious = asInstallation({
      owner: "literature-adapter",
      tool_id: null,
      source: { kind: "literature-adapter", adapter_id: "zotero-library", release_set_id: "retired", component: "profile-template" },
      target: { scope: "project", path: "../report.md", executable: false },
      sha256: hash("keep me"),
    });
    const result = await reconcileLiteratureAdapterInstallations({ projectRoot: root, existingInstallations: [malicious], desiredInstallations: [] });
    assert.equal(result.operations.length, 0);
    assert.equal(result.retainedInstallations.length, 1);
    assert.ok(result.diagnostics.some((item) => item.code === "managed_target_invalid" && item.blocking));
    assert.equal(await readFile(victim, "utf8"), "keep me");
  } finally {
    await rm(container, { recursive: true, force: true });
  }
});

void test("plugin projection rejects an unsafe typed record before registry retirement reads", async () => {
  const container = await mkdtemp(path.join(tmpdir(), "researchspec-managed-plugin-"));
  const root = path.join(container, "project");
  const victim = path.join(container, "report.md");
  try {
    await mkdir(root);
    await writeFile(victim, "keep me", "utf8");
    const malicious = asInstallation({
      owner: "framework",
      tool_id: null,
      source: { kind: "plugin-profile", profile_id: "retired-profile", profile_version: "retired" },
      target: { scope: "project", path: "../report.md", executable: false },
      sha256: hash("keep me"),
    });
    await assert.rejects(
      planPluginProjection({
        projectRoot: root,
        workspaceRoot: path.join(root, "researchspec"),
        toolIds: [],
        delivery: "skills",
        registry: {} as LoadedPluginRegistry,
        extensions: {} as LoadedPluginExtensionRegistry,
        selectedDomainIds: [],
        existingInstallations: [malicious],
        existingResolutions: [],
        force: true,
      }),
      (error: unknown) => error instanceof PluginProjectionError
        && error.diagnostics.some((item) => item.code === "managed_target_invalid" && item.blocking),
    );
    assert.equal(await readFile(victim, "utf8"), "keep me");
  } finally {
    await rm(container, { recursive: true, force: true });
  }
});

void test("documented hosts receive mode-correct project entries and all other hosts retain discovery", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-entry-modes-"));
  try {
    const documented = TOOLS.filter((tool) => tool.entry.mechanism !== "discovery");
    assert.equal(documented.length, 6);
    assert.equal(TOOLS.filter((tool) => tool.entry.mechanism === "discovery").length, 30);
    for (const tool of TOOLS) for (const delivery of ["skills", "commands", "both"] as const) {
      const plan = await planToolDelivery({ projectRoot: root, toolIds: [tool.id], delivery, existingInstallations: [], force: false });
      const entry = plan.installations.find((item) => item.source.kind === "project-entry");
      if (tool.entry.mechanism === "discovery") {
        assert.equal(entry, undefined, `${tool.id}/${delivery}`);
        continue;
      }
      assert.ok(entry, `${tool.id}/${delivery}`);
      assert.equal(entry.target.path, tool.entry.path);
      assert.equal(entry.source.kind === "project-entry" && entry.source.mode, tool.entry.mechanism);
      const operation = plan.operations.find((item) => item.relativePath === entry.target.path);
      assert.ok(operation?.content);
      const text = Buffer.from(operation.content).toString("utf8");
      const references = [...text.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]);
      assert.ok(references.length > 0, `${tool.id}/${delivery}`);
      for (const reference of references) assert.ok(plan.installations.some((item) => item.target.path === reference), reference);
      if (delivery === "commands" && tool.command) assert.equal(references.some((reference) => reference?.endsWith("/SKILL.md")), false);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("shared entry keeps BOM, CRLF, user edits and surviving consumers while removing only owned bytes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-entry-region-"));
  const target = path.join(root, "AGENTS.md");
  const original = Buffer.from("\uFEFF# User rules\r\nKeep this text without a trailing newline");
  const codexAsset = navigateAsset("codex", ".agents/skills/researchspec-navigate/SKILL.md");
  const openCodeAsset = navigateAsset("opencode", ".opencode/commands/researchspec-navigate.md", "command");
  try {
    await writeFile(target, original);
    const first = await planProjectEntryDelivery({ projectRoot: root, toolIds: ["codex", "opencode"], installedEntries: [codexAsset, openCodeAsset], existingInstallations: [] });
    assert.equal(first.operations.length, 1);
    assert.equal(first.installations.length, 1);
    await executeWritePlan({ operations: first.operations });
    const record = first.installations[0];
    const created = await readFile(target);
    assert.deepEqual(created.subarray(0, original.length), original);
    assert.match(created.toString("utf8"), /\r\n<!-- researchspec:begin researchspec-entry -->\r\n/);
    const firstOwned = entryOwnedBytes(created, record);
    assert.ok(firstOwned);
    assert.equal(sha256(firstOwned), record.sha256);

    const userPrefix = Buffer.from("\uFEFF# User rules updated\r\nKeep this text without a trailing newline");
    await writeFile(target, Buffer.concat([userPrefix, created.subarray(original.length)]));
    const remaining = await planProjectEntryDelivery({ projectRoot: root, toolIds: ["opencode"], installedEntries: [openCodeAsset], existingInstallations: [record] });
    assert.equal(remaining.installations[0]?.tool_id, "opencode");
    await executeWritePlan({ operations: remaining.operations });
    assert.deepEqual((await readFile(target)).subarray(0, userPrefix.length), userPrefix);

    const retired = await reconcileAgentToolInstallations({ projectRoot: root, existingInstallations: remaining.installations,
      desiredInstallations: [], reconciledToolIds: ["opencode"], selectedToolIds: [] });
    assert.equal(retired.operations.length, 1);
    await executeWritePlan({ operations: retired.operations });
    assert.deepEqual(await readFile(target), Buffer.concat([userPrefix, Buffer.from("\r\n")]));
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("unowned, malformed and drifted regions are preserved and stale snapshots reject concurrent edits", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-entry-conflicts-"));
  const target = path.join(root, "AGENTS.md");
  const asset = navigateAsset("codex", ".agents/skills/researchspec-navigate/SKILL.md");
  const plan = (existingInstallations: ManagedInstallation[]) => planProjectEntryDelivery({ projectRoot: root,
    toolIds: ["codex"], installedEntries: [asset], existingInstallations });
  try {
    const initial = await plan([]);
    await executeWritePlan({ operations: initial.operations });
    const record = initial.installations[0];
    const owned = await readFile(target);
    assert.equal((await plan([])).operations.length, 0);
    await writeFile(target, Buffer.from(owned.toString("utf8").replace("researchspec:end", "researchspec:broken")));
    const malformed = await plan([record]);
    assert.equal(malformed.operations.length, 0);
    assert.ok(malformed.diagnostics.some((item) => item.code === "project_entry_content_conflict"));
    assert.ok((await inspectProjectEntries(root, ["codex"], [record])).some((item) => item.code === "project_entry_malformed"));
    const heading = owned.indexOf(Buffer.from("# "));
    assert.ok(heading >= 0);
    await writeFile(target, Buffer.concat([owned.subarray(0, heading + 2), Buffer.from("User edit: "), owned.subarray(heading + 2)]));
    assert.equal((await plan([record])).operations.length, 0);

    await writeFile(target, owned);
    const refresh = await planProjectEntryDelivery({ projectRoot: root, toolIds: ["codex", "opencode"],
      installedEntries: [asset, navigateAsset("opencode", ".opencode/commands/researchspec-navigate.md", "command")], existingInstallations: [record] });
    await writeFile(target, Buffer.concat([Buffer.from("Concurrent edit\n"), owned]));
    await assert.rejects(executeWritePlan({ operations: refresh.operations }));
    assert.match(await readFile(target, "utf8"), /^Concurrent edit/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("project entries reject unsafe manifests and symlinks, and restore missing owned files", async () => {
  const container = await mkdtemp(path.join(tmpdir(), "researchspec-entry-boundary-"));
  const root = path.join(container, "project");
  const outside = path.join(container, "outside.md");
  const asset = navigateAsset("codex", ".agents/skills/researchspec-navigate/SKILL.md");
  try {
    await mkdir(root);
    await writeFile(outside, "Keep this file\n", "utf8");
    const initial = await planProjectEntryDelivery({ projectRoot: root, toolIds: ["codex"], installedEntries: [asset], existingInstallations: [] });
    const record = initial.installations[0];
    for (const forged of [
      { ...record, target: { ...record.target, path: "../outside.md" } },
      { ...record, target: { ...record.target, path: "other.md" } },
      { ...record, target: { ...record.target, executable: true } },
      { ...record, source: { kind: "project-entry", mode: "file" } },
    ]) {
      assert.throws(() => resolveManagedTarget(root, asInstallation(forged)));
    }
    assert.equal(ManagedInstallationSchema.safeParse({ ...record, source: { kind: "project-entry", mode: "region", region_id: "unexpected" } }).success, false);

    await symlink(outside, path.join(root, "AGENTS.md"));
    await assert.rejects(planProjectEntryDelivery({ projectRoot: root, toolIds: ["codex"], installedEntries: [asset], existingInstallations: [] }));
    assert.equal(await readFile(outside, "utf8"), "Keep this file\n");
    await rm(path.join(root, "AGENTS.md"));

    const restored = await planProjectEntryDelivery({ projectRoot: root, toolIds: ["codex"], installedEntries: [asset], existingInstallations: [record] });
    assert.equal(restored.operations.length, 1);
    await executeWritePlan({ operations: restored.operations });
    const restoredOwned = entryOwnedBytes(await readFile(path.join(root, "AGENTS.md")), restored.installations[0]);
    assert.ok(restoredOwned);
    assert.equal(sha256(restoredOwned), record.sha256);
  } finally { await rm(container, { recursive: true, force: true }); }
});

void test("OpenCode fallback and optional entry collisions preserve user files without blocking other projections", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-entry-fallback-"));
  try {
    await writeFile(path.join(root, "CLAUDE.md"), "Existing OpenCode guidance\n", "utf8");
    const fallback = await planToolDelivery({ projectRoot: root, toolIds: ["codex", "opencode"], delivery: "commands", existingInstallations: [], force: false });
    assert.ok(fallback.diagnostics.some((item) => item.code === "project_entry_fallback_preserved" && !item.blocking));
    assert.equal(fallback.operations.some((item) => item.relativePath === "AGENTS.md"), false);
    assert.ok(fallback.operations.some((item) => item.relativePath?.includes("researchspec-navigate")));
    assert.equal(await readFile(path.join(root, "CLAUDE.md"), "utf8"), "Existing OpenCode guidance\n");

    await mkdir(path.join(root, ".claude/rules"), { recursive: true });
    await writeFile(path.join(root, ".claude/rules/researchspec.md"), "Personal rule\n", "utf8");
    const conflict = await planToolDelivery({ projectRoot: root, toolIds: ["claude"], delivery: "skills", existingInstallations: [], force: true });
    assert.ok(conflict.diagnostics.some((item) => item.code === "project_entry_content_conflict" && !item.blocking));
    assert.equal(conflict.operations.some((item) => item.relativePath === ".claude/rules/researchspec.md"), false);
    assert.ok(conflict.operations.some((item) => item.relativePath?.endsWith("/SKILL.md")));
    assert.equal(await readFile(path.join(root, ".claude/rules/researchspec.md"), "utf8"), "Personal rule\n");
  } finally { await rm(root, { recursive: true, force: true }); }
});

function navigateAsset(toolId: string, targetPath: string, kind: "command" | "companion-skill" = "companion-skill"): ManagedInstallation {
  return asInstallation({ owner: "agent-tool", tool_id: toolId,
    source: kind === "command" ? { kind, command_id: "navigate" } : { kind, skill_id: "researchspec-navigate" },
    target: { scope: "project", path: targetPath, executable: false }, sha256: hash("asset") });
}

function asInstallation(value: unknown): ManagedInstallation {
  return value as ManagedInstallation;
}
