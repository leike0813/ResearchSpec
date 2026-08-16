import { randomUUID } from "node:crypto";
import { readFile, rename, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  deduplicateInstallations,
  installationKey,
  isDomainSkillInstallation,
  ToolInstallationManifestSchema,
  type DomainResolutionSnapshot,
  type ManagedInstallation,
} from "../adapters/installations.js";
import { selectSkillWriters } from "../adapters/delivery.js";
import { getTool, toolSkillsRoot, type DeliveryMode } from "../adapters/tools.js";
import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import type { Diagnostic } from "../core/validation/types.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { domainIsAvailable, filesForSkill, pluginSkillRoot, resolveDomainSelection, type LoadedPluginRegistry } from "./registry.js";

export interface PlanPluginProjectionInput {
  projectRoot: string;
  toolIds: readonly string[];
  delivery: DeliveryMode;
  registry: LoadedPluginRegistry;
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
  skillToolIds: string[];
  diagnostics: Diagnostic[];
  removedSkillRoots: Array<{ toolId: string; skillId: string }>;
}

export interface WorkspacePluginProjectionInput {
  workspace: string;
  index: GraphWorkspaceIndex;
  registry: LoadedPluginRegistry;
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
): DomainResolutionSnapshot[] {
  const previous = new Map(existingResolutions.map((item) => [item.domain_id, item]));
  return uniqueSorted(selectedDomainIds).flatMap((domainId) => {
    const domain = registry.domains.get(domainId);
    const domainVersion = domain?.version ?? "unknown";
    if (domainIsAvailable(domain)) {
      const resolution = resolveDomainSelection(registry, [domainId]);
      return [{ domain_id: domainId, domain_version: domainVersion, resolved_skill_ids: resolution.resolvedSkillIds }];
    }
    const snapshot = previous.get(domainId);
    return [snapshot ?? { domain_id: domainId, domain_version: domainVersion, resolved_skill_ids: [] }];
  });
}

export async function planPluginProjection(input: PlanPluginProjectionInput): Promise<PlannedPluginProjection> {
  const resolution = resolveDomainSelection(input.registry, input.selectedDomainIds);
  const skillToolIds = selectSkillWriters(input.toolIds, input.delivery);
  const existingByKey = new Map(input.existingInstallations.map((item) => [installationKey(item), item]));
  const operations: PlannedWrite[] = [];
  const desiredInstallations: ManagedInstallation[] = [];
  const retainedInstallations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const removedSkillRoots: Array<{ toolId: string; skillId: string }> = [];
  const preservedSkillIds = new Set(selectedDomainResolutionSnapshots(input.registry, input.selectedDomainIds, input.existingResolutions)
    .filter((snapshot) => !input.registry.domains.get(snapshot.domain_id) || !domainIsAvailable(input.registry.domains.get(snapshot.domain_id)))
    .flatMap((snapshot) => snapshot.resolved_skill_ids));

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
        const operation = await planFile({
          path: target,
          relativePath: manifestPath,
          content,
          scope: root.scope,
          ownership: "generated",
          recordedHash,
          force: input.force,
        });
        operations.push(operation);
        if (operation.action === "conflict") {
          diagnostics.push({
            severity: "error",
            code: "plugin_projection_conflict",
            message: `Cannot project plugin Skill ${skill.skill_id} for ${toolId}: ${operation.reason}`,
            path: target,
            blocking: true,
            details: { tool_id: toolId, skill_id: skill.skill_id, action: operation.action },
          });
        } else if (operation.action === "skip-drift") {
          diagnostics.push({
            severity: "warning",
            code: "plugin_projection_drift",
            message: `Plugin Skill file has user modifications and was preserved: ${skill.skill_id}`,
            path: target,
            blocking: false,
            details: { tool_id: toolId, skill_id: skill.skill_id },
          });
        }
        desiredInstallations.push({
          owner: "agent-tool",
          tool_id: toolId,
          source: {
            kind: "domain-skill",
            vendor_id: registered.vendor.vendor_id,
            vendor_release: registered.vendor.release,
            skill_id: skill.skill_id,
          },
          target: { scope: root.scope, path: manifestPath, executable: false },
          sha256: operation.action === "skip-drift" && recordedHash ? recordedHash : sha256(content),
        });
      }
    }
  }

  const desiredKeys = new Set(desiredInstallations.map(installationKey));
  for (const existing of input.existingInstallations) {
    if (!isDomainSkillInstallation(existing)) continue;
    if (desiredKeys.has(installationKey(existing))) continue;
    if (preservedSkillIds.has(existing.source.skill_id)) {
      retainedInstallations.push(existing);
      continue;
    }
    if (existing.target.scope !== "project") {
      retainedInstallations.push(existing);
      continue;
    }
    const target = path.resolve(input.projectRoot, existing.target.path);
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
          ? `Cannot uninstall because a generated plugin Skill file has user modifications: ${existing.source.skill_id}`
          : `Stale plugin Skill file has user modifications and was preserved: ${existing.source.skill_id}`,
        path: target,
        blocking: input.strictRemoval ?? false,
        details: { source: existing.source },
      });
      continue;
    }
    operations.push({
      action: "remove-owned",
      path: target,
      relativePath: existing.target.path,
      scope: "project",
      ownership: "generated",
      previousHash: existing.sha256,
      reason: "plugin selection no longer resolves this generated Skill file",
    });
    if (existing.tool_id !== null) {
      removedSkillRoots.push({ toolId: existing.tool_id, skillId: existing.source.skill_id });
    }
  }

  const finalInstallations = deduplicateInstallations([
    ...input.existingInstallations.filter((item) => !isDomainSkillInstallation(item)),
    ...retainedInstallations,
    ...desiredInstallations,
  ]);

  return {
    operations,
    desiredInstallations,
    retainedInstallations,
    finalInstallations,
    resolutions: selectedDomainResolutionSnapshots(input.registry, input.selectedDomainIds, input.existingResolutions),
    resolvedSkillIds: resolution.resolvedSkillIds,
    skillToolIds,
    diagnostics,
    removedSkillRoots,
  };
}

export async function planWorkspacePluginProjection(
  index: GraphWorkspaceIndex,
  registry: LoadedPluginRegistry,
  selectedDomainIds: readonly string[],
  force: boolean,
  strictRemoval = false,
): Promise<PlannedPluginProjection> {
  return planPluginProjection({
    projectRoot: index.projectRoot,
    toolIds: index.config.agent_tools.selected,
    delivery: index.config.agent_tools.delivery,
    registry,
    selectedDomainIds,
    existingInstallations: index.manifest.installations,
    existingResolutions: index.manifest.plugin_resolutions,
    force,
    strictRemoval,
  });
}

export async function projectWorkspacePlugins(input: WorkspacePluginProjectionInput): Promise<WorkspacePluginProjectionResult> {
  const plan = await planWorkspacePluginProjection(input.index, input.registry, input.selectedDomainIds, input.force, input.strictRemoval);
  const blocking = plan.diagnostics.filter((item) => item.blocking);
  if (blocking.length > 0) throw new PluginProjectionError(blocking);
  if (!input.dryRun) {
    await executeWritePlan({ operations: plan.operations });
    await removeEmptyRemovedSkillDirectories(input.index.projectRoot, plan.removedSkillRoots);
    if (input.writeManifest !== false) await writePluginManifest(input.workspace, input.index, plan);
  }
  return {
    plan,
    selectedDomainIds: [...new Set(input.selectedDomainIds)].sort(compareText),
    resolvedSkillIds: plan.resolvedSkillIds,
    skillToolIds: plan.skillToolIds,
    created: plan.operations.filter((item) => item.action === "create").length,
    refreshed: plan.operations.filter((item) => item.action === "refresh").length,
    removed: plan.operations.filter((item) => item.action === "remove-owned").length,
    unchanged: plan.operations.filter((item) => item.action === "skip-unchanged" || item.action === "skip-drift").length,
    dry_run: input.dryRun ?? false,
  };
}

async function removeEmptyRemovedSkillDirectories(projectRoot: string, roots: readonly { toolId: string; skillId: string }[]): Promise<void> {
  for (const root of roots) {
    const tool = getTool(root.toolId);
    if (!tool) continue;
    const target = path.join(toolSkillsRoot(tool, projectRoot).root, root.skillId);
    try {
      await rmdir(target);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT" && code !== "ENOTEMPTY" && code !== "EEXIST") throw error;
    }
  }
}

export async function writeWorkspacePluginManifest(workspace: string, index: GraphWorkspaceIndex, plan: PlannedPluginProjection): Promise<void> {
  const manifest = ToolInstallationManifestSchema.parse({
    ...index.manifest,
    plugin_resolutions: plan.resolutions,
    installations: plan.finalInstallations,
  });
  const manifestPath = path.join(workspace, "tool-installation-manifest.json");
  const temporary = `${manifestPath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
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
