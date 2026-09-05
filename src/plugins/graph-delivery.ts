import { randomUUID } from "node:crypto";
import { readFile, rename, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  deduplicateInstallations,
  installationKey,
  isDomainSkillInstallation,
  isPluginCapabilityInstallation,
  isPluginProfileInstallation,
  ToolInstallationManifestSchema,
  type DomainResolutionSnapshot,
  type ManagedInstallation,
} from "../adapters/installations.js";
import { selectSkillWriters } from "../adapters/delivery.js";
import { managedTargetDiagnostic, resolveManagedTarget, validateManagedTarget } from "../adapters/managed-target.js";
import { getTool, toolSkillsRoot, type DeliveryMode } from "../adapters/tools.js";
import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import type { Diagnostic } from "../core/validation/types.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { assertPathWithinRoot } from "../core/workspace/path-boundary.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions, type LoadedPluginExtensionRegistry } from "./extensions.js";
import { domainIsAvailable, filesForSkill, pluginSkillRoot, resolveDomainSelection, type LoadedPluginRegistry } from "./registry.js";

export interface PlanPluginProjectionInput {
  projectRoot: string;
  workspaceRoot: string;
  toolIds: readonly string[];
  delivery: DeliveryMode;
  registry: LoadedPluginRegistry;
  extensions?: LoadedPluginExtensionRegistry;
  selectedDomainIds: readonly string[];
  existingInstallations: readonly ManagedInstallation[];
  existingResolutions: readonly DomainResolutionSnapshot[];
  force: boolean;
  /** Block the whole transaction when any removal candidate has drifted. */
  strictRemoval?: boolean;
}

export interface PlannedPluginProjection {
  operations: PlannedWrite[];
  desiredInstallations: ManagedInstallation[];
  retainedInstallations: ManagedInstallation[];
  finalInstallations: ManagedInstallation[];
  resolutions: DomainResolutionSnapshot[];
  resolvedSkillIds: string[];
  resolvedCapabilityIds: string[];
  resolvedProfileIds: string[];
  skillToolIds: string[];
  diagnostics: Diagnostic[];
  removedSkillRoots: Array<{ toolId: string; skillId: string }>;
  removedCapabilityRoots: Array<{ toolId: string; capabilityId: string }>;
}

export interface WorkspacePluginProjectionInput {
  workspace: string;
  index: GraphWorkspaceIndex;
  registry: LoadedPluginRegistry;
  extensions?: LoadedPluginExtensionRegistry;
  selectedDomainIds: readonly string[];
  force: boolean;
  dryRun?: boolean;
  writeManifest?: boolean;
  strictRemoval?: boolean;
}

export interface WorkspacePluginProjectionResult {
  plan: PlannedPluginProjection;
  selectedDomainIds: string[];
  resolvedSkillIds: string[];
  resolvedCapabilityIds: string[];
  resolvedProfileIds: string[];
  skillToolIds: string[];
  created: number;
  refreshed: number;
  removed: number;
  unchanged: number;
  dry_run: boolean;
}

export class PluginProjectionError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "PluginProjectionError";
  }
}

export function selectedDomainResolutionSnapshots(
  registry: LoadedPluginRegistry,
  selectedDomainIds: readonly string[],
  existingResolutions: readonly DomainResolutionSnapshot[],
  extensions?: LoadedPluginExtensionRegistry,
): DomainResolutionSnapshot[] {
  const previous = new Map(existingResolutions.map((item) => [item.domain_id, item]));
  return uniqueSorted(selectedDomainIds).flatMap((domainId) => {
    const domain = registry.domains.get(domainId);
    const domainVersion = domain?.version ?? "unknown";
    if (domainIsAvailable(domain)) {
      const skills = resolveDomainSelection(registry, [domainId]).resolvedSkillIds;
      const extension = extensions ? resolveDomainExtensions(extensions, [domainId]) : { capabilityIds: [], profileIds: [] };
      return [{
        domain_id: domainId,
        domain_version: domainVersion,
        resolved_skill_ids: skills,
        resolved_capability_ids: extension.capabilityIds,
        resolved_profile_ids: extension.profileIds,
      }];
    }
    const snapshot = previous.get(domainId);
    return [snapshot ?? {
      domain_id: domainId,
      domain_version: domainVersion,
      resolved_skill_ids: [],
      resolved_capability_ids: [],
      resolved_profile_ids: [],
    }];
  });
}

export async function planPluginProjection(input: PlanPluginProjectionInput): Promise<PlannedPluginProjection> {
  for (const installation of input.existingInstallations) {
    try { await validateManagedTarget(input.projectRoot, installation); }
    catch (error) {
      throw new PluginProjectionError([managedTargetDiagnostic(installation, error)]);
    }
  }
  const resolution = resolveDomainSelection(input.registry, input.selectedDomainIds);
  const extensions = input.extensions ?? await loadPluginExtensionRegistry();
  const extensionResolution = resolveDomainExtensions(extensions, input.selectedDomainIds);
  const skillToolIds = selectSkillWriters(input.toolIds, input.delivery);
  const existingByKey = new Map(input.existingInstallations.map((item) => [installationKey(item), item]));
  const operations: PlannedWrite[] = [];
  const desiredInstallations: ManagedInstallation[] = [];
  const retainedInstallations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const removedSkillRoots: Array<{ toolId: string; skillId: string }> = [];
  const removedCapabilityRoots: Array<{ toolId: string; capabilityId: string }> = [];
  const snapshots = selectedDomainResolutionSnapshots(input.registry, input.selectedDomainIds, input.existingResolutions, extensions);
  const unavailableSnapshots = snapshots.filter((snapshot) => !domainIsAvailable(input.registry.domains.get(snapshot.domain_id)));
  const preservedSkillIds = new Set(unavailableSnapshots.flatMap((snapshot) => snapshot.resolved_skill_ids));
  const preservedCapabilityIds = new Set(unavailableSnapshots.flatMap((snapshot) => snapshot.resolved_capability_ids ?? []));
  const preservedProfileIds = new Set(unavailableSnapshots.flatMap((snapshot) => snapshot.resolved_profile_ids ?? []));

  for (const toolId of skillToolIds) {
    const tool = getTool(toolId);
    if (!tool) continue;
    const root = toolSkillsRoot(tool, input.projectRoot);
    for (const registered of resolution.skills) {
      const skill = registered.definition;
      const sourceRoot = pluginSkillRoot(input.registry.root, registered.vendor.vendor_id, skill.skill_id);
      for (const relativeAsset of filesForSkill(input.registry, skill.skill_id)) {
        const target = path.join(root.root, skill.skill_id, relativeAsset);
        const manifestPath = root.scope === "project" ? targetPath(path.relative(input.projectRoot, target)) : target;
        const recordedHash = existingByKey.get(installationKey({ target: { scope: root.scope, path: manifestPath, executable: false } }))?.sha256;
        const content = await readFile(path.join(sourceRoot, relativeAsset));
        const installation: ManagedInstallation = {
          owner: "agent-tool", tool_id: toolId,
          source: { kind: "domain-skill", vendor_id: registered.vendor.vendor_id, vendor_release: registered.vendor.release, skill_id: skill.skill_id },
          target: { scope: root.scope, path: manifestPath, executable: false }, sha256: sha256(content),
        };
        const operation = await planFile({
          boundaryRoot: resolveManagedTarget(input.projectRoot, installation).boundaryRoot,
          path: target,
          relativePath: manifestPath,
          content,
          scope: root.scope,
          ownership: "generated",
          recordedHash,
          requireRecordedOwnership: recordedHash === undefined,
          force: input.force,
        });
        operations.push(operation);
        pushProjectionDiagnostic(diagnostics, operation, "plugin_projection", `Cannot project plugin Skill ${skill.skill_id} for ${toolId}: ${operation.reason}`, `Plugin Skill file has user modifications and was preserved: ${skill.skill_id}`, target, { tool_id: toolId, skill_id: skill.skill_id });
        desiredInstallations.push({ ...installation, sha256: operation.action === "skip-drift" && recordedHash ? recordedHash : installation.sha256 });
      }
    }

    for (const capabilityId of extensionResolution.capabilityIds) {
      const registered = extensions.capabilities.get(capabilityId);
      if (!registered) continue;
      for (const source of registered.files) {
        const relativeAsset = targetPath(path.relative(registered.packageRoot, source));
        const target = path.join(root.root, capabilityId, relativeAsset);
        const manifestPath = root.scope === "project" ? targetPath(path.relative(input.projectRoot, target)) : target;
        const recordedHash = existingByKey.get(installationKey({ target: { scope: root.scope, path: manifestPath, executable: false } }))?.sha256;
        const content = await readFile(source);
        const installation: ManagedInstallation = {
          owner: "agent-tool", tool_id: toolId,
          source: { kind: "plugin-capability", capability_id: capabilityId, extension_registry_version: extensions.registry.registry_version },
          target: { scope: root.scope, path: manifestPath, executable: false }, sha256: sha256(content),
        };
        const operation = await planFile({
          boundaryRoot: resolveManagedTarget(input.projectRoot, installation).boundaryRoot,
          path: target,
          relativePath: manifestPath,
          content,
          scope: root.scope,
          ownership: "generated",
          recordedHash,
          requireRecordedOwnership: recordedHash === undefined,
          force: input.force,
        });
        operations.push(operation);
        pushProjectionDiagnostic(diagnostics, operation, "plugin_extension_projection", `Cannot project plugin capability ${capabilityId} for ${toolId}: ${operation.reason}`, `Plugin capability file has user modifications and was preserved: ${capabilityId}`, target, { tool_id: toolId, capability_id: capabilityId });
        desiredInstallations.push({ ...installation, sha256: operation.action === "skip-drift" && recordedHash ? recordedHash : installation.sha256 });
      }
    }
  }

  for (const profileId of extensionResolution.profileIds) {
    const registered = extensions.profiles.get(profileId);
    if (!registered) continue;
    const target = path.join(input.workspaceRoot, "profiles", `${profileId}.yaml`);
    const manifestPath = targetPath(path.relative(input.projectRoot, target));
    const recordedHash = existingByKey.get(installationKey({ target: { scope: "project", path: manifestPath, executable: false } }))?.sha256;
    const content = await readFile(registered.sourcePath);
    const installation: ManagedInstallation = {
      owner: "framework", tool_id: null,
      source: { kind: "plugin-profile", profile_id: profileId, profile_version: registered.profile.profile_version },
      target: { scope: "project", path: manifestPath, executable: false }, sha256: sha256(content),
    };
    const operation = await planFile({
      boundaryRoot: resolveManagedTarget(input.projectRoot, installation).boundaryRoot,
      path: target,
      relativePath: manifestPath,
      content,
      scope: "project",
      ownership: "generated",
      recordedHash,
      requireRecordedOwnership: recordedHash === undefined,
      force: input.force,
    });
    operations.push(operation);
    pushProjectionDiagnostic(diagnostics, operation, "plugin_extension_projection", `Cannot project plugin graph profile ${profileId}: ${operation.reason}`, `Plugin graph profile has user modifications and was preserved: ${profileId}`, target, { profile_id: profileId });
    desiredInstallations.push({ ...installation, sha256: operation.action === "skip-drift" && recordedHash ? recordedHash : installation.sha256 });
  }

  const desiredKeys = new Set(desiredInstallations.map(installationKey));
  for (const existing of input.existingInstallations) {
    if (!isDomainSkillInstallation(existing) && !isPluginCapabilityInstallation(existing) && !isPluginProfileInstallation(existing)) continue;
    if (desiredKeys.has(installationKey(existing))) continue;

    const sourceId = isDomainSkillInstallation(existing)
      ? existing.source.skill_id
      : isPluginCapabilityInstallation(existing)
        ? existing.source.capability_id
        : existing.source.profile_id;
    const preserved = isDomainSkillInstallation(existing)
      ? preservedSkillIds.has(sourceId)
      : isPluginCapabilityInstallation(existing)
        ? preservedCapabilityIds.has(sourceId)
        : preservedProfileIds.has(sourceId);
    if (preserved) {
      retainedInstallations.push(existing);
      continue;
    }
    if (existing.target.scope !== "project") {
      retainedInstallations.push(existing);
      continue;
    }

    const resolved = await validateManagedTarget(input.projectRoot, existing);
    const target = resolved.path;
    let currentHash: string | undefined;
    try {
      currentHash = sha256(await readFile(target));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (currentHash === undefined) continue;
    if (currentHash !== existing.sha256) {
      retainedInstallations.push(existing);
      diagnostics.push({
        severity: input.strictRemoval ? "error" : "warning",
        code: input.strictRemoval ? "plugin_projection_drift_blocks_uninstall" : "plugin_projection_drift",
        message: input.strictRemoval
          ? `Cannot uninstall because a generated plugin projection has user modifications: ${sourceId}`
          : `Stale plugin projection has user modifications and was preserved: ${sourceId}`,
        path: target,
        blocking: input.strictRemoval ?? false,
        details: { source: existing.source },
      });
      continue;
    }
    operations.push({
      action: "remove-owned",
      boundaryRoot: resolved.boundaryRoot,
      path: target,
      relativePath: existing.target.path,
      scope: "project",
      ownership: "generated",
      previousHash: existing.sha256,
      reason: "plugin selection no longer resolves this generated projection",
    });
    if (existing.tool_id !== null && isPluginCapabilityInstallation(existing)) {
      removedCapabilityRoots.push({ toolId: existing.tool_id, capabilityId: sourceId });
    } else if (existing.tool_id !== null) {
      removedSkillRoots.push({ toolId: existing.tool_id, skillId: sourceId });
    }
  }

  const finalInstallations = deduplicateInstallations([
    ...input.existingInstallations.filter((item) => !isDomainSkillInstallation(item) && !isPluginCapabilityInstallation(item) && !isPluginProfileInstallation(item)),
    ...retainedInstallations,
    ...desiredInstallations,
  ]);

  return {
    operations,
    desiredInstallations,
    retainedInstallations,
    finalInstallations,
    resolutions: snapshots,
    resolvedSkillIds: resolution.resolvedSkillIds,
    resolvedCapabilityIds: extensionResolution.capabilityIds,
    resolvedProfileIds: extensionResolution.profileIds,
    skillToolIds,
    diagnostics,
    removedSkillRoots,
    removedCapabilityRoots,
  };
}

export async function planWorkspacePluginProjection(
  index: GraphWorkspaceIndex,
  registry: LoadedPluginRegistry,
  selectedDomainIds: readonly string[],
  force: boolean,
  strictRemoval = false,
  extensions?: LoadedPluginExtensionRegistry,
): Promise<PlannedPluginProjection> {
  if (index.manifestStatus === "invalid") throw new PluginProjectionError(index.diagnostics.filter((item) => item.blocking));
  return planPluginProjection({
    projectRoot: index.projectRoot,
    workspaceRoot: index.workspace,
    toolIds: index.config.agent_tools.selected,
    delivery: index.config.agent_tools.delivery,
    registry,
    extensions,
    selectedDomainIds,
    existingInstallations: index.manifest.installations,
    existingResolutions: index.manifest.plugin_resolutions,
    force,
    strictRemoval,
  });
}

export async function projectWorkspacePlugins(input: WorkspacePluginProjectionInput): Promise<WorkspacePluginProjectionResult> {
  const plan = await planWorkspacePluginProjection(input.index, input.registry, input.selectedDomainIds, input.force, input.strictRemoval, input.extensions);
  const blocking = plan.diagnostics.filter((item) => item.blocking);
  if (blocking.length > 0) throw new PluginProjectionError(blocking);
  if (!input.dryRun) {
    await executeWritePlan({ boundaryRoot: input.index.projectRoot, operations: plan.operations });
    await removeEmptyRemovedSkillDirectories(input.index.projectRoot, plan.removedSkillRoots);
    await removeEmptyRemovedCapabilityDirectories(input.index.projectRoot, plan.removedCapabilityRoots);
    if (input.writeManifest !== false) await writePluginManifest(input.workspace, input.index, plan);
  }
  return {
    plan,
    selectedDomainIds: [...new Set(input.selectedDomainIds)].sort(compareText),
    resolvedSkillIds: plan.resolvedSkillIds,
    resolvedCapabilityIds: plan.resolvedCapabilityIds,
    resolvedProfileIds: plan.resolvedProfileIds,
    skillToolIds: plan.skillToolIds,
    created: plan.operations.filter((item) => item.action === "create").length,
    refreshed: plan.operations.filter((item) => item.action === "refresh").length,
    removed: plan.operations.filter((item) => item.action === "remove-owned").length,
    unchanged: plan.operations.filter((item) => item.action === "skip-unchanged" || item.action === "skip-drift").length,
    dry_run: input.dryRun ?? false,
  };
}

function pushProjectionDiagnostic(
  diagnostics: Diagnostic[],
  operation: PlannedWrite,
  codePrefix: string,
  conflictMessage: string,
  driftMessage: string,
  target: string,
  details: unknown,
): void {
  if (operation.action === "conflict") {
    diagnostics.push({
      severity: "error",
      code: `${codePrefix}_conflict`,
      message: conflictMessage,
      path: target,
      blocking: true,
      details,
    });
  } else if (operation.action === "skip-drift") {
    diagnostics.push({
      severity: "warning",
      code: `${codePrefix}_drift`,
      message: driftMessage,
      path: target,
      blocking: false,
      details,
    });
  }
}

async function removeEmptyRemovedSkillDirectories(projectRoot: string, roots: readonly { toolId: string; skillId: string }[]): Promise<void> {
  await removeEmptyProjectionDirectories(projectRoot, roots);
}

async function removeEmptyRemovedCapabilityDirectories(projectRoot: string, roots: readonly { toolId: string; capabilityId: string }[]): Promise<void> {
  await removeEmptyProjectionDirectories(projectRoot, roots);
}

async function removeEmptyProjectionDirectories(
  projectRoot: string,
  roots: readonly { toolId: string; [key: string]: string }[],
): Promise<void> {
  for (const root of roots) {
    const tool = getTool(root.toolId);
    if (!tool) continue;
    const projectionId = "skillId" in root ? root.skillId : root.capabilityId;
    const target = path.join(toolSkillsRoot(tool, projectRoot).root, projectionId);
    try {
      await assertPathWithinRoot(projectRoot, target);
      await rmdir(target);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT" && code !== "ENOTEMPTY" && code !== "EEXIST") throw error;
    }
  }
}

export async function writeWorkspacePluginManifest(workspace: string, index: GraphWorkspaceIndex, plan: PlannedPluginProjection): Promise<void> {
  if (index.manifestStatus === "invalid") throw new PluginProjectionError(index.diagnostics.filter((item) => item.blocking));
  const manifest = ToolInstallationManifestSchema.parse({
    ...index.manifest,
    plugin_resolutions: plan.resolutions,
    installations: plan.finalInstallations,
  });
  const manifestPath = path.join(workspace, "tool-installation-manifest.json");
  const temporary = `${manifestPath}.${randomUUID()}.tmp`;
  for (const installation of manifest.installations) await validateManagedTarget(index.projectRoot, installation);
  await assertPathWithinRoot(index.projectRoot, manifestPath);
  await assertPathWithinRoot(index.projectRoot, temporary);
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await assertPathWithinRoot(index.projectRoot, manifestPath);
  await assertPathWithinRoot(index.projectRoot, temporary);
  await rename(temporary, manifestPath);
}

async function writePluginManifest(workspace: string, index: GraphWorkspaceIndex, plan: PlannedPluginProjection): Promise<void> {
  await writeWorkspacePluginManifest(workspace, index, plan);
}

export function targetPath(value: string): string {
  return value.split(path.sep).join("/");
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareText);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
