import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import { selectSkillWriters } from "../../adapters/delivery.js";
import { getTool, toolSkillsRoot } from "../../adapters/tools.js";
import { GraphWorkspaceConfigSchema, type GraphWorkspaceConfig } from "../../core/contracts/graph-workspace.js";
import { loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { requireGraphWorkspace } from "../../core/workspace/graph-discover.js";
import { sha256 } from "../../core/workspace/write-plan.js";
import { PluginProjectionError, projectWorkspacePlugins, writeWorkspacePluginManifest } from "../../plugins/graph-delivery.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions, type LoadedPluginExtensionRegistry } from "../../plugins/extensions.js";
import { domainIsAvailable, filesForSkill, loadPluginRegistry, pluginSkillRoot, resolveDomainSelection } from "../../plugins/registry.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export interface PluginListOptions { installed?: boolean; summary?: boolean }
export interface PluginShowOptions { summary?: boolean }

async function graphWorkspace(context: CommandContext): Promise<string> {
  try { return await requireGraphWorkspace(context.cwd, context.workspace); }
  catch (error) { throw new CliError("workspace_unsupported", error instanceof Error ? error.message : String(error), 1); }
}

async function loadOptionalPluginExtensions(): Promise<LoadedPluginExtensionRegistry | undefined> {
  try {
    return await loadPluginExtensionRegistry();
  } catch {
    return undefined;
  }
}

function domainExtensionCounts(extensions: LoadedPluginExtensionRegistry | undefined, domainId: string): { capabilities: number; profiles: number } {
  if (!extensions) return { capabilities: 0, profiles: 0 };
  const resolved = resolveDomainExtensions(extensions, [domainId]);
  return { capabilities: resolved.capabilityIds.length, profiles: resolved.profileIds.length };
}

function projectionError(error: unknown): CliError {
  if (error instanceof CliError) return error;
  if (!(error instanceof PluginProjectionError)) return new CliError("plugin_projection_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError("plugin_projection_conflict", error.message, 3, "Resolve or remove the conflicting generated files, or update the owning manifest.", error.diagnostics);
}

export async function handleGraphPluginList(options: { installed?: boolean; summary?: boolean }, context: CommandContext): Promise<CommandResult> {
  const registry = await loadPluginRegistry();
  let selected: string[] = [];
  let workspace: string | null = null;
  try {
    workspace = await graphWorkspace(context);
    const index = await loadGraphWorkspaceIndex(workspace);
    selected = index.config.plugins.selected;
  } catch (error) {
    if (options.installed) throw error;
  }
  const extensions = await loadOptionalPluginExtensions();
  const domains = [...registry.domains.values()]
    .filter(domainIsAvailable)
    .filter((domain) => !options.installed || selected.includes(domain.domain_id))
    .sort((left, right) => left.domain_id.localeCompare(right.domain_id));
  const items = domains.map((domain) => {
    const resolved = resolveDomainSelection(registry, [domain.domain_id]);
    const extensionCounts = domainExtensionCounts(extensions, domain.domain_id);
    return options.summary
      ? { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, version: domain.version, skills: domain.skills.length, resolved_skills: resolved.resolvedSkillIds.length, ...extensionCounts }
      : { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, description: domain.description, version: domain.version, skills: domain.skills, resolved_skills: resolved.resolvedSkillIds, ...extensionCounts };
  });
  return success("plugin", { action: "list", workspace: workspace ?? null, selected_plugins: selected, domains: items, total: items.length }, { stdout: items.length ? `${items.map((item) => item.domain_id).join("\n")}\n` : "No plugins.\n" });
}

export async function handleGraphPluginShow(pluginId: string, options: { summary?: boolean }, context: CommandContext): Promise<CommandResult> {
  void context;
  const registry = await loadPluginRegistry();
  const domain = registry.domains.get(pluginId);
  if (!domainIsAvailable(domain)) throw new CliError("plugin_not_found", `Domain plugin not found or unavailable: ${pluginId}`, 1);
  const resolution = resolveDomainSelection(registry, [pluginId]);
  const extensions = await loadOptionalPluginExtensions();
  const extensionCounts = domainExtensionCounts(extensions, pluginId);
  const item = options.summary
    ? { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, version: domain.version, skills: domain.skills.length, resolved_skills: resolution.resolvedSkillIds.length, ...extensionCounts }
    : { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, description: domain.description, version: domain.version, skills: domain.skills, resolved_skills: resolution.resolvedSkillIds, ...extensionCounts };
  return success("plugin", { action: "show", workspace: null, domain: item }, { stdout: `${JSON.stringify(item, null, 2)}\n` });
}

export async function handleGraphPluginInstall(pluginIds: readonly string[], context: CommandContext): Promise<CommandResult> {
  if (pluginIds.length === 0) throw new CliError("plugin_ids_required", "Plugin installation requires at least one explicit domain ID.", 2);
  if (!context.interactive && !context.yes) {
    throw new CliError("plugin_confirmation_required", "Non-interactive plugin installation requires the global --yes flag.", 2);
  }
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const registry = await loadPluginRegistry();
  const requested = [...new Set(pluginIds)];
  const unavailable = requested.filter((id) => !domainIsAvailable(registry.domains.get(id)));
  if (unavailable.length) throw new CliError("plugin_unavailable", `Plugin unavailable: ${unavailable.join(", ")}`, 1);
  const selected = [...new Set([...index.config.plugins.selected, ...requested])];
  try {
    const extensions = await loadPluginExtensionRegistry();
    const projection = await projectWorkspacePlugins({ workspace, index, registry, extensions, selectedDomainIds: selected, force: context.force, dryRun: context.dryRun, writeManifest: false, strictRemoval: true });
    await writeConfigSelection(workspace, index.config, selected, context);
    if (!context.dryRun) await writeWorkspacePluginManifest(workspace, index, projection.plan);
    return success("plugin", {
      action: "install",
      workspace,
      selected_plugins: selected,
      resolved_skill_ids: projection.resolvedSkillIds,
      resolved_capability_ids: projection.resolvedCapabilityIds,
      resolved_profile_ids: projection.resolvedProfileIds,
      projected_tools: projection.skillToolIds,
      projected_files: {
        created: projection.created,
        refreshed: projection.refreshed,
        removed: projection.removed,
        unchanged: projection.unchanged,
      },
      dry_run: context.dryRun,
    }, { stdout: `${context.dryRun ? "Would install" : "Installed"} ${requested.join(", ")}.\n` });
  } catch (error) { throw projectionError(error); }
}

export async function handleGraphPluginUninstall(pluginIds: readonly string[], context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const requested = new Set(pluginIds);
  const missing = [...requested].filter((id) => !index.config.plugins.selected.includes(id));
  if (missing.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${missing.join(", ")}`, 1);
  const selected = index.config.plugins.selected.filter((id) => !requested.has(id));
  try {
    const registry = await loadPluginRegistry();
    const extensions = await loadPluginExtensionRegistry();
    const projection = await projectWorkspacePlugins({ workspace, index, registry, extensions, selectedDomainIds: selected, force: context.force, dryRun: context.dryRun, writeManifest: false, strictRemoval: true });
    await writeConfigSelection(workspace, index.config, selected, context);
    if (!context.dryRun) await writeWorkspacePluginManifest(workspace, index, projection.plan);
    return success("plugin", {
      action: "uninstall",
      workspace,
      selected_plugins: selected,
      resolved_skill_ids: projection.resolvedSkillIds,
      resolved_capability_ids: projection.resolvedCapabilityIds,
      resolved_profile_ids: projection.resolvedProfileIds,
      projected_tools: projection.skillToolIds,
      projected_files: {
        created: projection.created,
        refreshed: projection.refreshed,
        removed: projection.removed,
        unchanged: projection.unchanged,
      },
      dry_run: context.dryRun,
    }, { stdout: `${context.dryRun ? "Would uninstall" : "Uninstalled"} ${[...requested].join(", ")}.\n` });
  } catch (error) { throw projectionError(error); }
}

export async function handleGraphPluginUpdate(pluginIds: readonly string[], context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const selected = pluginIds.length ? pluginIds : index.config.plugins.selected;
  const missing = selected.filter((id) => !index.config.plugins.selected.includes(id));
  if (missing.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${missing.join(", ")}`, 1);
  try {
    const registry = await loadPluginRegistry();
    const unavailable = selected.filter((id) => !domainIsAvailable(registry.domains.get(id)));
    if (unavailable.length) throw new CliError("plugin_unavailable", `Plugin unavailable: ${unavailable.join(", ")}`, 1);
    const extensions = await loadPluginExtensionRegistry();
    const projection = await projectWorkspacePlugins({ workspace, index, registry, extensions, selectedDomainIds: selected, force: context.force, dryRun: context.dryRun });
    return success("plugin", {
      action: "update",
      workspace,
      selected_plugins: index.config.plugins.selected,
      resolved_skill_ids: projection.resolvedSkillIds,
      projected_tools: projection.skillToolIds,
      projected_files: {
        created: projection.created,
        refreshed: projection.refreshed,
        removed: projection.removed,
        unchanged: projection.unchanged,
      },
      dry_run: context.dryRun,
    }, { stdout: `${context.dryRun ? "Would update" : "Updated"} ${selected.join(", ") || "no plugins"}.\n` });
  } catch (error) { throw projectionError(error); }
}

export async function handleGraphPluginInstructions(skillId: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const registry = await loadPluginRegistry();
  const registered = registry.skills.get(skillId);
  if (!registered) throw new CliError("plugin_skill_not_found", `Plugin Skill is not registered: ${skillId}`, 1);
  const resolution = resolveDomainSelection(registry, index.config.plugins.selected);
  if (!resolution.resolvedSkillIds.includes(skillId)) throw new CliError("plugin_not_installed", `Plugin Skill is not installed in this workspace: ${skillId}`, 1);

  const metadata = registry.skillMetadata.get(skillId);
  const skillRoot = pluginSkillRoot(registry.root, registered.vendor.vendor_id, registered.definition.skill_id);
  const skillPath = path.join(skillRoot, "SKILL.md");
  const text = await readFile(skillPath, "utf8");
  if (!metadata || metadata.entrySha256 !== sha256(text)) throw new CliError("plugin_entry_hash_mismatch", `Plugin Skill entry hash does not match the validated registry: ${skillId}`, 1);

  const projectedTools = selectSkillWriters(index.config.agent_tools.selected, index.config.agent_tools.delivery);
  if (projectedTools.length === 0) throw new CliError("plugin_not_projected", `Plugin Skill is not projected because no skill-capable Agent tool is selected: ${skillId}`, 1, "Run `researchspec update --tools <tool-ids> --delivery skills|both` first.");
  const missingFiles: string[] = [];
  const projectedToolIds: string[] = [];
  for (const toolId of projectedTools) {
    const tool = getTool(toolId);
    if (!tool) continue;
    const root = toolSkillsRoot(tool, index.projectRoot);
    let complete = true;
    for (const relativeAsset of filesForSkill(registry, skillId)) {
      const target = path.join(root.root, skillId, relativeAsset);
      const manifestPath = root.scope === "project" ? path.relative(index.projectRoot, target).split(path.sep).join("/") : target;
      const installation = index.manifest.installations.find((item) => item.target.scope === root.scope && item.target.path === manifestPath && item.source.kind === "domain-skill" && item.source.skill_id === skillId);
      if (!installation) {
        missingFiles.push(`${toolId}:${relativeAsset}`);
        complete = false;
        continue;
      }
      try {
        if (sha256(await readFile(target)) !== installation.sha256) {
          missingFiles.push(`${toolId}:${relativeAsset}`);
          complete = false;
        }
      } catch {
        missingFiles.push(`${toolId}:${relativeAsset}`);
        complete = false;
      }
    }
    if (complete) projectedToolIds.push(toolId);
  }
  if (missingFiles.length > 0) throw new CliError("plugin_projection_incomplete", `Plugin Skill projection is missing or drifted for: ${missingFiles.join(", ")}`, 1, "Run `researchspec plugin update` after restoring the owning tool projection.");
  const providingDomains = index.config.plugins.selected.filter((domainId) => resolveDomainSelection(registry, [domainId]).resolvedSkillIds.includes(skillId));
  const resources = filesForSkill(registry, skillId).filter((item) => item !== "SKILL.md").sort();

  return success("plugin", {
    action: "instructions",
    workspace,
    skill_id: skillId,
    entry_sha256: metadata.entrySha256,
    content: text,
    providing_domains: providingDomains,
    projected_tools: projectedToolIds,
    resources,
    authority: "advisory",
  }, { stdout: text });
}

async function writeConfigSelection(workspace: string, config: GraphWorkspaceConfig, selected: string[], context: CommandContext): Promise<void> {
  if (context.dryRun) return;
  await writeFile(path.join(workspace, "config.yaml"), stringify(GraphWorkspaceConfigSchema.parse({ ...config, plugins: { selected } })), "utf8");
}
