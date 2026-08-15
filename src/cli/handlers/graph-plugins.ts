import { writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import { GraphWorkspaceConfigSchema, type GraphWorkspaceConfig } from "../../core/contracts/graph-workspace.js";
import { loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { requireGraphWorkspace } from "../../core/workspace/graph-discover.js";
import { domainIsAvailable, loadPluginRegistry } from "../../plugins/registry.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export interface PluginListOptions { installed?: boolean; summary?: boolean }
export interface PluginShowOptions { summary?: boolean }

async function graphWorkspace(context: CommandContext): Promise<string> {
  try { return await requireGraphWorkspace(context.cwd, context.workspace); }
  catch (error) { throw new CliError("workspace_unsupported", error instanceof Error ? error.message : String(error), 1); }
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
  const domains = [...registry.domains.values()]
    .filter(domainIsAvailable)
    .filter((domain) => !options.installed || selected.includes(domain.domain_id))
    .sort((left, right) => left.domain_id.localeCompare(right.domain_id));
  const items = domains.map((domain) => options.summary
    ? { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, version: domain.version, skills: domain.skills.length }
    : { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, description: domain.description, version: domain.version, skills: domain.skills });
  return success("plugin", { action: "list", workspace: workspace ?? null, selected_plugins: selected, domains: items, total: items.length }, { stdout: items.length ? `${items.map((item) => item.domain_id).join("\n")}\n` : "No plugins.\n" });
}

export async function handleGraphPluginShow(pluginId: string, options: { summary?: boolean }, context: CommandContext): Promise<CommandResult> {
  void context;
  const registry = await loadPluginRegistry();
  const domain = registry.domains.get(pluginId);
  if (!domainIsAvailable(domain)) throw new CliError("plugin_not_found", `Domain plugin not found or unavailable: ${pluginId}`, 1);
  const item = options.summary
    ? { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, version: domain.version, skills: domain.skills.length }
    : { domain_id: domain.domain_id, domain_type: domain.domain_type, title: domain.title, description: domain.description, version: domain.version, skills: domain.skills };
  return success("plugin", { action: "show", workspace: null, domain: item }, { stdout: `${JSON.stringify(item, null, 2)}\n` });
}

export async function handleGraphPluginInstall(pluginIds: readonly string[], context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const registry = await loadPluginRegistry();
  const requested = [...new Set(pluginIds)];
  const unavailable = requested.filter((id) => !domainIsAvailable(registry.domains.get(id)));
  if (unavailable.length) throw new CliError("plugin_unavailable", `Plugin unavailable: ${unavailable.join(", ")}`, 1);
  const selected = [...new Set([...index.config.plugins.selected, ...requested])];
  await writeConfigSelection(workspace, index.config, selected, context);
  return success("plugin", { action: "install", workspace, selected_plugins: selected, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would install" : "Installed"} ${requested.join(", ")}.\n` });
}

export async function handleGraphPluginUninstall(pluginIds: readonly string[], context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const requested = new Set(pluginIds);
  const missing = [...requested].filter((id) => !index.config.plugins.selected.includes(id));
  if (missing.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${missing.join(", ")}`, 1);
  const selected = index.config.plugins.selected.filter((id) => !requested.has(id));
  await writeConfigSelection(workspace, index.config, selected, context);
  return success("plugin", { action: "uninstall", workspace, selected_plugins: selected, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would uninstall" : "Uninstalled"} ${[...requested].join(", ")}.\n` });
}

export async function handleGraphPluginUpdate(pluginIds: readonly string[], context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const selected = pluginIds.length ? pluginIds : index.config.plugins.selected;
  const missing = selected.filter((id) => !index.config.plugins.selected.includes(id));
  if (missing.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${missing.join(", ")}`, 1);
  return success("plugin", { action: "update", workspace, selected_plugins: index.config.plugins.selected, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would update" : "Updated"} ${selected.join(", ") || "no plugins"}.\n` });
}

export function handleGraphPluginInstructions(skillId: string, context: CommandContext): Promise<CommandResult> {
  void context;
  return Promise.reject(new CliError("plugin_instructions_unavailable", `Plugin Skill projection is not available in the graph CLI yet: ${skillId}`, 1));
}

async function writeConfigSelection(workspace: string, config: GraphWorkspaceConfig, selected: string[], context: CommandContext): Promise<void> {
  if (context.dryRun) return;
  await writeFile(path.join(workspace, "config.yaml"), stringify(GraphWorkspaceConfigSchema.parse({ ...config, plugins: { selected } })), "utf8");
}
