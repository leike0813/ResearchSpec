import { homedir } from "node:os";
import path from "node:path";

import type { Diagnostic } from "../core/validation/types.js";
import { isCanonicalAbsolutePath, isSafePathComponent, isSafeRelativePath } from "../core/contracts/project-path.js";
import { assertPathWithinRoot } from "../core/workspace/path-boundary.js";
import { getLiteratureAdapter } from "../literature-adapters/catalog.js";
import { COMMAND_WRAPPER_CONTENTS, LEGACY_COMMAND_IDS } from "./command-renderer.js";
import { renderAgentProfileFiles } from "./agent-profiles.js";
import { getTool, sharedSkillTarget, toolSkillsRoot } from "./tools.js";
import type { ManagedInstallation, ManagedInstallationSource } from "./installations.js";

/** The absolute target and the trusted root used for all later filesystem work. */
export interface ManagedTarget {
  path: string;
  boundaryRoot: string;
}

export class ManagedTargetError extends Error {
  readonly code = "managed_target_invalid";

  constructor(message: string) {
    super(message);
    this.name = "ManagedTargetError";
  }
}

const COMMAND_IDS = new Set<string>([...LEGACY_COMMAND_IDS, ...COMMAND_WRAPPER_CONTENTS.map((item) => item.id)]);

/**
 * Resolve a manifest record without touching the filesystem.
 *
 * The manifest path is only an address inside a destination derived from the
 * record's owner, source and tool.  It never supplies the trusted root.
 */
export function resolveManagedTarget(projectRoot: string, installation: ManagedInstallation): ManagedTarget {
  const root = path.resolve(projectRoot);
  const record = installation as unknown as Record<string, unknown>;
  if (!record || typeof record !== "object") fail("managed installation is not an object");

  const owner = record.owner;
  const toolId = record.tool_id;
  const target = asRecord(record.target, "target");
  const source = asRecord(record.source, "source") as ManagedInstallationSource;
  const scope = target.scope;
  const targetPath = target.path;
  if (scope !== "project" && scope !== "shared-global") fail("target scope is invalid");
  if (typeof targetPath !== "string" || targetPath.length === 0) fail("target path is empty");
  if (source.kind === "project-entry" && target.executable !== false) fail("project entry cannot be executable");

  if (owner === "framework") return resolveFrameworkTarget(root, toolId, scope, targetPath, source);
  if (owner === "literature-adapter") return resolveLiteratureTarget(root, toolId, scope, targetPath, source);
  if (owner === "agent-tool") return resolveAgentTarget(root, toolId, scope, targetPath, source);
  fail("installation owner is invalid");
}

/** Resolve and check the lexical/symlink boundary before any target read. */
export async function validateManagedTarget(projectRoot: string, installation: ManagedInstallation): Promise<ManagedTarget> {
  const target = resolveManagedTarget(projectRoot, installation);
  await assertPathWithinRoot(target.boundaryRoot, target.path);
  return target;
}

export function managedTargetDiagnostic(record: unknown, error: unknown): Diagnostic {
  const value = record as { target?: { path?: unknown }; source?: unknown } | null;
  const targetPath = typeof value?.target?.path === "string" ? value.target.path : undefined;
  return {
    severity: "error",
    code: "managed_target_invalid",
    message: error instanceof Error ? error.message : "Managed installation target is invalid.",
    ...(targetPath === undefined ? {} : { path: targetPath }),
    blocking: true,
    details: { source: value?.source },
  };
}

function resolveAgentTarget(
  projectRoot: string,
  toolId: unknown,
  scope: unknown,
  targetPath: string,
  source: ManagedInstallationSource,
): ManagedTarget {
  if (typeof toolId !== "string" || toolId.length === 0) fail("agent-tool installation requires a tool_id");
  const tool = getTool(toolId);
  if (!tool) fail(`unknown agent tool: ${toolId}`);

  if (source.kind === "framework-profile" || source.kind === "plugin-profile") {
    fail("profile sources require framework ownership");
  }
  if (source.kind === "literature-adapter" && source.component !== "skill") {
    fail("literature adapter runtime files require literature-adapter ownership");
  }

  const root = toolSkillsRoot(tool, projectRoot);
  if (scope !== root.scope) fail(`target scope does not match tool ${tool.id}`);

  if (source.kind === "project-entry") {
    if (tool.entry.mechanism !== source.mode || !tool.entry.path) fail(`project entry mode is not defined for tool ${tool.id}`);
    if (source.mode === "region" ? source.region_id !== "researchspec-entry" : source.region_id !== undefined) fail("project entry region ID is invalid");
    return resolveExactTarget(projectRoot, scope, targetPath, path.join(projectRoot, ...tool.entry.path.split("/")), projectRoot);
  }

  if (source.kind === "prompt-guard") {
    const definition = tool.promptGuard;
    if (!definition || ![definition.path, definition.alternatePath].includes(targetPath) || source.component !== (definition.format === "script" || ["opencode", "kilo", "pi", "omp"].includes(definition.format) ? "script" : "config")) fail("prompt guard destination is not defined for this tool");
    if (scope !== "project") fail("prompt guards are project-scoped");
    const file = source.component === "script";
    if (source.mode !== (file ? "file" : "entries") || (file ? source.entry_key !== undefined : source.entry_key !== "researchspec-paper-humanizer")) fail("prompt guard ownership mode is invalid");
    return resolveExactTarget(projectRoot, scope, targetPath, path.join(projectRoot, targetPath), projectRoot);
  }

  if (source.kind === "command") {
    assertSafeComponent(source.command_id, "command_id");
    if (!COMMAND_IDS.has(source.command_id)) {
      fail(`command destination is not a ResearchSpec wrapper: ${source.command_id}`);
    }
    if (!tool.command) fail(`tool ${tool.id} does not define command destinations`);
    if (tool.command.scope !== scope) fail(`command scope does not match tool ${tool.id}`);
    const expected = path.resolve(tool.command.path(source.command_id, projectRoot));
    return resolveExactTarget(projectRoot, scope, targetPath, expected, boundaryForScope(projectRoot, scope));
  }

  if (source.kind === "shared-skill-target") {
    const expectedTarget = sharedSkillTarget(tool.id);
    if (expectedTarget !== source.target_id) fail(`marker source does not match tool ${tool.id}`);
    const expected = path.join(root.root, ".researchspec-target");
    return resolveExactTarget(projectRoot, scope, targetPath, expected, boundaryForScope(projectRoot, scope));
  }

  if (source.kind === "custom-agent") {
    if (scope !== "project") fail("custom-agent files are project-scoped");
    const expected = renderAgentProfileFiles(tool.id, projectRoot).find(
      (file) => file.roleId === source.role_id && file.component === source.component,
    );
    if (!expected) fail(`custom-agent destination is not defined for tool ${tool.id}`);
    return resolveExactTarget(projectRoot, scope, targetPath, expected.target, projectRoot);
  }

  const namespaceId = agentNamespaceId(source);
  assertSafeComponent(namespaceId, "source namespace");
  const namespaceRoot = path.join(root.root, namespaceId);
  return resolveNamespaceTarget(projectRoot, scope, targetPath, namespaceRoot, boundaryForScope(projectRoot, scope));
}

function resolveFrameworkTarget(
  projectRoot: string,
  toolId: unknown,
  scope: unknown,
  targetPath: string,
  source: ManagedInstallationSource,
): ManagedTarget {
  if (source.kind === "prompt-guard") {
    if (toolId !== null || scope !== "project" || source.mode !== "file" || source.entry_key !== undefined || !["guard", "publisher"].includes(source.component)) fail("invalid shared prompt guard resource");
    const name = source.component === "guard" ? "guard.md" : "inject.cjs";
    return resolveExactTarget(projectRoot, scope, targetPath, path.join(projectRoot, "researchspec", "hooks", "paper-humanizer", name), projectRoot);
  }
  if (toolId !== null) fail("framework profile installations require null tool_id");
  if (scope !== "project") fail("framework profiles are project-scoped");
  if (source.kind !== "framework-profile" && source.kind !== "plugin-profile") {
    fail("framework ownership requires a profile source");
  }
  const profileId = source.profile_id;
  assertSafeComponent(profileId, "profile_id");
  const expected = path.join(projectRoot, "researchspec", "profiles", `${profileId}.yaml`);
  return resolveExactTarget(projectRoot, scope, targetPath, expected, projectRoot);
}

function resolveLiteratureTarget(
  projectRoot: string,
  toolId: unknown,
  scope: unknown,
  targetPath: string,
  source: ManagedInstallationSource,
): ManagedTarget {
  if (toolId !== null) fail("literature adapter installations require null tool_id");
  if (source.kind !== "literature-adapter" || source.component === "skill") {
    fail("literature adapter ownership requires a runtime, profile or shim source");
  }
  const adapter = getLiteratureAdapter(source.adapter_id);
  if (!adapter) fail(`unknown literature Adapter: ${source.adapter_id}`);
  if (scope !== "project") fail("literature adapter files are project-scoped");

  let expectedRelative: string;
  if (source.component === "profile-template") {
    expectedRelative = ".zotero-bridge/profile.template.json";
  } else if (source.component === "windows-shim") {
    if (source.platform !== "win32-x64") fail("Windows shim source has an unsupported platform");
    expectedRelative = ".zotero-bridge/bin/zotero-bridge.cmd";
  } else {
    if (source.platform === undefined) fail("runtime source requires a platform");
    const runtime = adapter?.runtimes.find((item) => item.platform === source.platform);
    if (!runtime) fail("runtime source does not match a registered Adapter platform");
    expectedRelative = path.posix.join(".zotero-bridge", "bin", runtime.binary);
  }
  const expected = path.join(projectRoot, ...expectedRelative.split("/"));
  return resolveExactTarget(projectRoot, scope, targetPath, expected, projectRoot);
}

function agentNamespaceId(source: ManagedInstallationSource): string {
  switch (source.kind) {
    case "arsu-skill":
    case "core-skill":
    case "companion-skill":
      assertSafeComponent(source.skill_id, "skill_id");
      return source.skill_id;
    case "domain-skill":
      assertSafeComponent(source.skill_id, "skill_id");
      return source.skill_id;
    case "framework-capability":
      assertSafeComponent(source.capability_id, "capability_id");
      return source.capability_id;
    case "plugin-capability":
      assertSafeComponent(source.capability_id, "capability_id");
      return source.capability_id;
    case "literature-adapter": {
      if (source.component !== "skill" || source.skill_id === undefined) fail("literature adapter Skill source requires skill_id");
      const adapter = getLiteratureAdapter(source.adapter_id);
      if (!adapter || !adapter.skills.some((skill) => skill.skill_id === source.skill_id)) {
        fail(`literature adapter Skill is not registered: ${source.skill_id}`);
      }
      assertSafeComponent(source.skill_id, "skill_id");
      return source.skill_id;
    }
    default:
      fail(`source kind ${String((source as { kind?: unknown }).kind)} does not name a Skill namespace`);
  }
}

function resolveExactTarget(
  projectRoot: string,
  scope: unknown,
  targetPath: string,
  expected: string,
  boundaryRoot: string,
): ManagedTarget {
  const candidate = resolveScopedPath(projectRoot, scope, targetPath);
  if (candidate !== path.resolve(expected)) fail(`managed target does not match its defined destination: ${targetPath}`);
  return { path: candidate, boundaryRoot };
}

function resolveNamespaceTarget(
  projectRoot: string,
  scope: unknown,
  targetPath: string,
  namespaceRoot: string,
  boundaryRoot: string,
): ManagedTarget {
  const candidate = resolveScopedPath(projectRoot, scope, targetPath);
  const relative = path.relative(path.resolve(namespaceRoot), candidate);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    fail(`managed target is outside its source namespace: ${targetPath}`);
  }
  return { path: candidate, boundaryRoot };
}

function resolveScopedPath(projectRoot: string, scope: unknown, targetPath: string): string {
  if (scope === "project") {
    if (!isSafeRelativePath(targetPath)) fail(`project managed target is not a safe relative path: ${targetPath}`);
    return path.resolve(projectRoot, targetPath);
  }
  if (scope !== "shared-global") fail("target scope is invalid");
  if (!isCanonicalAbsolutePath(targetPath)) {
    fail(`shared-global managed target must be a canonical absolute path: ${targetPath}`);
  }
  return path.resolve(targetPath);
}

function boundaryForScope(projectRoot: string, scope: unknown): string {
  return scope === "shared-global" ? path.resolve(homedir()) : projectRoot;
}

function assertSafeComponent(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !isSafePathComponent(value)) {
    fail(`${label} is not a safe path component`);
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} is invalid`);
  return value as Record<string, unknown>;
}

function fail(message: string): never {
  throw new ManagedTargetError(message);
}
