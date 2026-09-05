import { loadCapabilityRegistry, type LoadedCapabilityRegistry, type RegisteredCapability } from "../capabilities/registry.js";
import type { GraphWorkspaceIndex } from "../core/runtime/graph-workspace-index.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions, type LoadedPluginExtensionRegistry } from "./extensions.js";

export async function loadWorkspaceCapabilityRegistry(
  index: GraphWorkspaceIndex,
  extensionRegistry?: LoadedPluginExtensionRegistry,
): Promise<LoadedCapabilityRegistry> {
  const base = await loadCapabilityRegistry();
  if (index.config.plugins.selected.length === 0) return base;
  const extensions = extensionRegistry ?? await loadPluginExtensionRegistry();
  const resolved = resolveDomainExtensions(extensions, index.config.plugins.selected);
  const capabilities = new Map<string, RegisteredCapability>(base.capabilities);

  for (const capabilityId of resolved.capabilityIds) {
    const registered = extensions.capabilities.get(capabilityId);
    if (!registered) continue;
    capabilities.set(capabilityId, {
      entry: {
        capability_id: capabilityId,
        source_path: capabilityId,
        manifest_sha256: registered.manifestSha256,
      },
      manifest: registered.manifest,
      packageRoot: registered.packageRoot,
      manifestPath: registered.manifestPath,
      manifestSha256: registered.manifestSha256,
      files: registered.files,
    });
  }

  const capabilitiesList = [...capabilities.values()].sort((left, right) => left.entry.capability_id.localeCompare(right.entry.capability_id));
  return {
    root: base.root,
    registryPath: base.registryPath,
    registry: {
      schema_version: "1",
      registry_version: base.registry.registry_version,
      capabilities: capabilitiesList.map((item) => item.entry),
    },
    capabilities,
    diagnostics: base.diagnostics,
  };
}
