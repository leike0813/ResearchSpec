import { readFile } from "node:fs/promises";
import path from "node:path";

import { selectSkillWriters } from "../adapters/delivery.js";
import { getTool, toolSkillsRoot } from "../adapters/tools.js";
import { capabilityIds, loadCapabilityRegistry } from "../capabilities/registry.js";
import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import type { Diagnostic } from "../core/validation/types.js";
import { sha256 } from "../core/workspace/write-plan.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions } from "./extensions.js";
import { validateGraphCapabilityReferences } from "../core/contracts/capability-graph.js";
import { domainIsAvailable, filesForSkill, loadPluginRegistry, resolveDomainSelection } from "./registry.js";

export async function pluginWorkspaceDiagnostics(index: GraphWorkspaceIndex, alwaysLoad = false): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const selected = [...new Set(index.config.plugins.selected)].sort();
  if (selected.length === 0 && !alwaysLoad) return diagnostics;

  let registry;
  try {
    registry = await loadPluginRegistry(undefined, false);
  } catch (error) {
    diagnostics.push({
      severity: "error",
      code: "plugin_registry_unavailable",
      message: `Cannot load plugin registry for workspace check: ${error instanceof Error ? error.message : String(error)}`,
      blocking: true,
    });
    return diagnostics;
  }

  for (const domainId of selected) {
    if (!domainIsAvailable(registry.domains.get(domainId))) {
      diagnostics.push({
        severity: "error",
        code: "plugin_domain_unavailable",
        message: `Selected plugin domain is missing or empty: ${domainId}`,
        blocking: true,
      });
    }
  }

  const baseCapabilityIds = new Set<string>();
  try {
    for (const capabilityId of capabilityIds(await loadCapabilityRegistry())) baseCapabilityIds.add(capabilityId);
  } catch (error) {
    diagnostics.push({
      severity: "error",
      code: "capability_registry_unavailable",
      message: `Cannot load base capability registry for plugin extension check: ${error instanceof Error ? error.message : String(error)}`,
      blocking: true,
    });
  }

  let extensions;
  try {
    extensions = await loadPluginExtensionRegistry();
  } catch (error) {
    diagnostics.push({
      severity: "error",
      code: "plugin_extension_registry_unavailable",
      message: `Cannot load plugin extension registry: ${error instanceof Error ? error.message : String(error)}`,
      blocking: true,
    });
  }

  if (extensions) {
    const resolvedExtensions = resolveDomainExtensions(extensions, selected);
    for (const capabilityId of resolvedExtensions.capabilityIds) {
      if (baseCapabilityIds.has(capabilityId)) {
        diagnostics.push({
          severity: "error",
          code: "plugin_extension_capability_collision",
          message: `Plugin extension capability collides with a bundled capability: ${capabilityId}`,
          blocking: true,
        });
      }
      if (registry.skills.has(capabilityId)) {
        diagnostics.push({
          severity: "error",
          code: "plugin_extension_capability_collision",
          message: `Plugin extension capability collides with a plugin Skill ID: ${capabilityId}`,
          blocking: true,
        });
      }
    }
    for (const profileId of resolvedExtensions.profileIds) {
      const profile = extensions.profiles.get(profileId);
      if (!profile) continue;
      const references = validateGraphCapabilityReferences(profile.profile, new Set([...baseCapabilityIds, ...extensions.capabilities.keys()]));
      for (const reference of references) {
        diagnostics.push({
          severity: "error",
          code: "plugin_extension_profile_capability_unknown",
          message: `Plugin extension profile ${profileId}: ${reference.message}`,
          path: profile.sourcePath,
          blocking: true,
          details: { path: reference.path },
        });
      }
    }
  }

  const resolution = resolveDomainSelection(registry, selected);
  const snapshots = new Map(index.manifest.plugin_resolutions.map((item) => [item.domain_id, item]));
  for (const domainId of resolution.availableDomainIds) {
    const snapshot = snapshots.get(domainId);
    const domain = registry.domains.get(domainId);
    if (!domain || !snapshot) {
      diagnostics.push({
        severity: "warning",
        code: "plugin_resolution_snapshot_missing",
        message: `Selected plugin domain has no installation snapshot: ${domainId}`,
        blocking: false,
      });
      continue;
    }
    const expected = resolveDomainSelection(registry, [domainId]).resolvedSkillIds;
    const staleVersion = snapshot.domain_version !== domain.version;
    const staleSkills = [...snapshot.resolved_skill_ids].sort().join("\n") !== [...expected].sort().join("\n");
    if (staleVersion || staleSkills) {
      diagnostics.push({
        severity: "warning",
        code: "plugin_resolution_snapshot_stale",
        message: `Plugin installation snapshot is stale for: ${domainId}`,
        blocking: false,
        details: { domain_id: domainId, expected_skills: expected, recorded_skills: snapshot.resolved_skill_ids },
      });
    }
  }

  const skillToolIds = selectSkillWriters(index.config.agent_tools.selected, index.config.agent_tools.delivery);
  if (resolution.resolvedSkillIds.length > 0 && skillToolIds.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "plugin_projection_deferred",
      message: "Selected plugins have no skill-capable Agent tool configured for projection.",
      blocking: false,
    });
    return diagnostics;
  }

  for (const toolId of skillToolIds) {
    const tool = getTool(toolId);
    if (!tool) continue;
    const root = toolSkillsRoot(tool, index.projectRoot);
    for (const skillId of resolution.resolvedSkillIds) {
      for (const relativeAsset of filesForSkill(registry, skillId)) {
        const target = path.join(root.root, skillId, relativeAsset);
        const manifestPath = root.scope === "project" ? path.relative(index.projectRoot, target).split(path.sep).join("/") : target;
        const installation = index.manifest.installations.find((item) =>
          item.target.scope === root.scope
          && item.target.path === manifestPath
          && item.source.kind === "domain-skill"
          && item.source.skill_id === skillId,
        );
        if (!installation) {
          diagnostics.push({
            severity: "error",
            code: "plugin_projection_incomplete",
            message: `Plugin Skill file is not manifest-owned: ${skillId}/${relativeAsset}`,
            path: target,
            blocking: true,
            details: { tool_id: toolId, skill_id: skillId },
          });
          continue;
        }
        try {
          const currentHash = sha256(await readFile(target));
          if (currentHash !== installation.sha256) {
            diagnostics.push({
              severity: "warning",
              code: "plugin_projection_drift",
              message: `Plugin Skill file has user modifications: ${skillId}/${relativeAsset}`,
              path: target,
              blocking: false,
              details: { tool_id: toolId, skill_id: skillId },
            });
          }
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          if (code === "ENOENT") {
            diagnostics.push({
              severity: "error",
              code: "plugin_projection_incomplete",
              message: `Plugin Skill file is missing: ${skillId}/${relativeAsset}`,
              path: target,
              blocking: true,
              details: { tool_id: toolId, skill_id: skillId },
            });
          } else {
            throw error;
          }
        }
      }
    }
  }

  return diagnostics;
}
