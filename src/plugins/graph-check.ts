import { readFile } from "node:fs/promises";
import path from "node:path";

import { capabilityIds, loadCapabilityRegistry, validateGraphAgainstCapabilityRegistry } from "../capabilities/registry.js";
import type { CapabilityManifest } from "../core/contracts/capability-manifest.js";
import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import type { Diagnostic } from "../core/validation/types.js";
import { sha256 } from "../core/workspace/write-plan.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions } from "./extensions.js";
import { domainIsAvailable, loadPluginRegistry, resolveDomainSelection } from "./registry.js";

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
  let baseRegistry;
  try {
    baseRegistry = await loadCapabilityRegistry();
    for (const capabilityId of capabilityIds(baseRegistry)) baseCapabilityIds.add(capabilityId);
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

  const resolvedExtensions = extensions ? resolveDomainExtensions(extensions, selected) : { capabilityIds: [], profileIds: [] };
  if (extensions) {
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
      if (!baseRegistry) continue;
      const capabilities = new Map<string, { manifest: CapabilityManifest }>(baseRegistry.capabilities);
      for (const [id, capability] of extensions.capabilities) capabilities.set(id, capability);
      const references = validateGraphAgainstCapabilityRegistry({ registry: baseRegistry.registry, capabilities }, profile.profile);
      for (const reference of references) {
        diagnostics.push({
          severity: "error",
          code: reference.code ?? "plugin_extension_profile_capability_unknown",
          message: `Plugin extension profile ${profileId}: ${reference.message}`,
          path: profile.sourcePath,
          blocking: true,
          details: reference,
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
    const expectedSkills = resolveDomainSelection(registry, [domainId]).resolvedSkillIds;
    const domainExtensions = extensions ? resolveDomainExtensions(extensions, [domainId]) : { capabilityIds: [], profileIds: [] };
    const staleVersion = snapshot.domain_version !== domain.version;
    const staleSkills = sortedJoin(snapshot.resolved_skill_ids) !== sortedJoin(expectedSkills);
    const staleCapabilities = sortedJoin(snapshot.resolved_capability_ids ?? []) !== sortedJoin(domainExtensions.capabilityIds);
    const staleProfiles = sortedJoin(snapshot.resolved_profile_ids ?? []) !== sortedJoin(domainExtensions.profileIds);
    if (staleVersion || staleSkills || staleCapabilities || staleProfiles) {
      diagnostics.push({
        severity: "warning",
        code: "plugin_resolution_snapshot_stale",
        message: `Plugin installation snapshot is stale for: ${domainId}`,
        blocking: false,
        details: {
          domain_id: domainId,
          expected_skills: expectedSkills,
          recorded_skills: snapshot.resolved_skill_ids,
          expected_capabilities: domainExtensions.capabilityIds,
          recorded_capabilities: snapshot.resolved_capability_ids ?? [],
          expected_profiles: domainExtensions.profileIds,
          recorded_profiles: snapshot.resolved_profile_ids ?? [],
        },
      });
    }
  }

  if (extensions) {
    for (const profileId of resolvedExtensions.profileIds) {
      const profile = extensions.profiles.get(profileId);
      if (!profile) continue;
      const target = path.join(index.workspace, "profiles", `${profileId}.yaml`);
      const manifestPath = path.relative(index.projectRoot, target).split(path.sep).join("/");
      await checkProjectedFile(diagnostics, index, target, manifestPath, "project", {
        kind: "plugin-profile",
        profile_id: profileId,
      }, `Plugin graph profile: ${profileId}`);
    }
  }

  return diagnostics;
}

async function checkProjectedFile(
  diagnostics: Diagnostic[],
  index: GraphWorkspaceIndex,
  target: string,
  manifestPath: string,
  scope: "project" | "shared-global",
  source: { kind: "domain-skill"; skill_id: string } | { kind: "plugin-capability"; capability_id: string } | { kind: "plugin-profile"; profile_id: string },
  label: string,
): Promise<void> {
  const installation = index.manifest.installations.find((item) =>
    item.target.scope === scope
    && item.target.path === manifestPath
    && item.source.kind === source.kind
    && (source.kind === "domain-skill" && item.source.kind === "domain-skill" ? item.source.skill_id === source.skill_id : true)
    && (source.kind === "plugin-capability" && item.source.kind === "plugin-capability" ? item.source.capability_id === source.capability_id : true)
    && (source.kind === "plugin-profile" && item.source.kind === "plugin-profile" ? item.source.profile_id === source.profile_id : true),
  );
  if (!installation) {
    diagnostics.push({
      severity: "error",
      code: "plugin_projection_incomplete",
      message: `${label} is not manifest-owned`,
      path: target,
      blocking: true,
      details: { source },
    });
    return;
  }
  try {
    const currentHash = sha256(await readFile(target));
    if (currentHash !== installation.sha256) {
      diagnostics.push({
        severity: "warning",
        code: "plugin_projection_drift",
        message: `${label} has user modifications`,
        path: target,
        blocking: false,
        details: { source },
      });
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      diagnostics.push({
        severity: "error",
        code: "plugin_projection_incomplete",
        message: `${label} is missing`,
        path: target,
        blocking: true,
        details: { source },
      });
    } else {
      throw error;
    }
  }
}

function sortedJoin(values: readonly string[]): string {
  return [...values].sort().join("\n");
}
