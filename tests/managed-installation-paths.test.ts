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

function asInstallation(value: unknown): ManagedInstallation {
  return value as ManagedInstallation;
}
