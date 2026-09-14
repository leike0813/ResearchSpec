import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions } from "./extensions.js";
import { loadPluginRegistry } from "./registry.js";
import { pluginStatusSummary } from "./status.js";

export interface GraphPluginStatusView {
  loadable: boolean;
  selected: string[];
  available: string[];
  unavailable: string[];
  projected: string[];
  resolved_skills: string[];
  resolved_capability_ids: string[];
  resolved_profile_ids: string[];
  projected_capability_ids: string[];
  projected_profile_ids: string[];
  error?: string;
}

export async function loadGraphPluginStatusView(index: GraphWorkspaceIndex): Promise<GraphPluginStatusView> {
  const selected = [...index.config.plugins.selected].sort();
  try {
    const registry = await loadPluginRegistry(undefined, false);
    const summary = pluginStatusSummary(index.config, index.manifest, registry);
    if (selected.length === 0) {
      return {
        loadable: true,
        ...summary,
        resolved_capability_ids: [],
        resolved_profile_ids: [],
        projected_capability_ids: [],
        projected_profile_ids: [],
      };
    }
    let extensions;
    let resolvedCapabilityIds: string[] = [];
    let resolvedProfileIds: string[] = [];
    const projectedCapabilityIds: string[] = [];
    let projectedProfileIds: string[] = [];
    try {
      extensions = await loadPluginExtensionRegistry();
      const resolved = resolveDomainExtensions(extensions, selected);
      resolvedCapabilityIds = resolved.capabilityIds;
      resolvedProfileIds = resolved.profileIds;
      projectedProfileIds = projectedProfiles(index, resolvedProfileIds);
    } catch {
      // Extension status is optional for the core graph status command.
    }
    return {
      loadable: true,
      ...summary,
      resolved_capability_ids: resolvedCapabilityIds,
      resolved_profile_ids: resolvedProfileIds,
      projected_capability_ids: projectedCapabilityIds,
      projected_profile_ids: projectedProfileIds,
    };
  } catch (error) {
    return {
      loadable: false,
      selected,
      available: [],
      unavailable: selected,
      projected: [],
      resolved_skills: [],
      resolved_capability_ids: [],
      resolved_profile_ids: [],
      projected_capability_ids: [],
      projected_profile_ids: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function projectedProfiles(index: GraphWorkspaceIndex, profileIds: readonly string[]): string[] {
  return profileIds.filter((profileId) => index.manifest.installations.some((item) => item.source.kind === "plugin-profile" && item.source.profile_id === profileId));
}
