import type { LoadedPluginRegistry, DomainSkillPlugin } from "./registry.js";

export interface PluginStatusSummary {
  selected: string[];
  available: string[];
  unavailable: string[];
  projected: string[];
}

export function selectedPluginIds(config: Record<string, unknown>): string[] {
  const plugins = record(config.plugins);
  return uniqueSorted(strings(plugins.selected));
}

export function pluginStatusSummary(config: Record<string, unknown>, manifest: Record<string, unknown>, loaded: LoadedPluginRegistry): PluginStatusSummary {
  const selected = selectedPluginIds(config);
  const available = [...loaded.plugins.keys()].sort(compareText);
  const unavailable = selected.filter((id) => !loaded.plugins.has(id));
  const tools = uniqueSorted(strings(record(config.agent_tools).selected));
  const records = installationRecords(manifest.installations);
  const projected = selected.filter((pluginId) => {
    if (!loaded.plugins.has(pluginId) || tools.length === 0) return false;
    return tools.every((toolId) => records.some((item) => item.tool_id === toolId && item.plugin_id === pluginId));
  });
  return { selected, available, unavailable, projected };
}

export function pluginCatalogItem(plugin: DomainSkillPlugin, loaded: LoadedPluginRegistry, selected: readonly string[]) {
  const sources = new Map(loaded.registry.sources.map((source) => [source.source_id, source]));
  return {
    plugin_id: plugin.plugin_id,
    title: plugin.title,
    description: plugin.description,
    version: plugin.version,
    domain: plugin.domain,
    installed: selected.includes(plugin.plugin_id),
    skills: plugin.skills.map((skill) => ({
      skill_id: skill.skill_id,
      upstreams: skill.upstreams.map((upstream) => ({ ...upstream, source: sources.get(upstream.source_id) ?? null })),
    })),
  };
}

function installationRecords(value: unknown): Array<{ tool_id: string; plugin_id?: string }> {
  return records(value).filter((item): item is Record<string, unknown> & { tool_id: string; plugin_id?: string } => typeof item.tool_id === "string" && (item.plugin_id === undefined || typeof item.plugin_id === "string"));
}
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function uniqueSorted(values: readonly string[]): string[] { return [...new Set(values)].sort(compareText); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
