import path from "node:path";

import { selectSkillWriters } from "../adapters/delivery.js";
import { getTool, toolSkillsRoot } from "../adapters/tools.js";
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
    let projectedCapabilityIds: string[] = [];
    let projectedProfileIds: string[] = [];
    try {
      extensions = await loadPluginExtensionRegistry();
      const resolved = resolveDomainExtensions(extensions, selected);
      resolvedCapabilityIds = resolved.capabilityIds;
      resolvedProfileIds = resolved.profileIds;
      projectedCapabilityIds = projectedCapabilities(index, extensions, resolvedCapabilityIds);
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

function projectedCapabilities(index: GraphWorkspaceIndex, extensions: Awaited<ReturnType<typeof loadPluginExtensionRegistry>>, capabilityIds: readonly string[]): string[] {
  const tools = selectSkillWriters(index.config.agent_tools.selected, index.config.agent_tools.delivery);
  if (tools.length === 0) return [];
  return capabilityIds.filter((capabilityId) => {
    const capability = extensions.capabilities.get(capabilityId);
    if (!capability) return false;
    return tools.every((toolId) => {
      const tool = getTool(toolId);
      if (!tool) return false;
      const root = toolSkillsRoot(tool, index.projectRoot);
      return capability.files.every((source) => {
        const relativeAsset = path.relative(capability.packageRoot, source).split(path.sep).join("/");
        const target = path.join(root.root, capabilityId, relativeAsset);
        const manifestPath = root.scope === "project" ? path.relative(index.projectRoot, target).split(path.sep).join("/") : target;
        return index.manifest.installations.some((item) =>
          item.target.scope === root.scope
          && item.target.path === manifestPath
          && item.source.kind === "plugin-capability"
          && item.source.capability_id === capabilityId,
        );
      });
    });
  });
}

function projectedProfiles(index: GraphWorkspaceIndex, profileIds: readonly string[]): string[] {
  return profileIds.filter((profileId) => index.manifest.installations.some((item) => item.source.kind === "plugin-profile" && item.source.profile_id === profileId));
}
