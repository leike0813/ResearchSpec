import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import { loadPluginRegistry } from "./registry.js";
import { pluginStatusSummary } from "./status.js";

export interface GraphPluginStatusView {
  loadable: boolean;
  selected: string[];
  available: string[];
  unavailable: string[];
  projected: string[];
  resolved_skills: string[];
  error?: string;
}

export async function loadGraphPluginStatusView(index: GraphWorkspaceIndex): Promise<GraphPluginStatusView> {
  const selected = [...index.config.plugins.selected].sort();
  try {
    const registry = await loadPluginRegistry(undefined, false);
    return {
      loadable: true,
      ...pluginStatusSummary(index.config, index.manifest, registry),
    };
  } catch (error) {
    return {
      loadable: false,
      selected,
      available: [],
      unavailable: selected,
      projected: [],
      resolved_skills: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
