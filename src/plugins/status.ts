import { availableDomains, domainIsAvailable, resolveDomainSelection, type DomainDefinition, type LoadedPluginRegistry } from "./registry.js";

export interface DomainResolutionSnapshot {
  domain_id: string;
  domain_version: string;
  resolved_skill_ids: string[];
}

export interface PluginStatusSummary {
  selected: string[];
  available: string[];
  unavailable: string[];
  projected: string[];
  resolved_skills: string[];
}

export function selectedPluginIds(config: Record<string, unknown>): string[] { return uniqueSorted(strings(record(config.plugins).selected)); }

export function resolutionSnapshots(value: unknown): DomainResolutionSnapshot[] {
  return records(value).filter((item): item is Record<string, unknown> & DomainResolutionSnapshot =>
    typeof item.domain_id === "string" && typeof item.domain_version === "string" && strings(item.resolved_skill_ids).length === (Array.isArray(item.resolved_skill_ids) ? item.resolved_skill_ids.length : -1))
    .map((item) => ({ domain_id: item.domain_id, domain_version: item.domain_version, resolved_skill_ids: uniqueSorted(item.resolved_skill_ids) }));
}

export function buildResolutionSnapshots(loaded: LoadedPluginRegistry, domainIds: readonly string[]): DomainResolutionSnapshot[] {
  return uniqueSorted(domainIds).flatMap((domainId) => {
    const domain = loaded.domains.get(domainId);
    if (!domainIsAvailable(domain)) return [];
    return [{ domain_id: domainId, domain_version: domain.version, resolved_skill_ids: resolveDomainSelection(loaded, [domainId]).resolvedSkillIds }];
  });
}

export function pluginStatusSummary(config: Record<string, unknown>, manifest: Record<string, unknown>, loaded: LoadedPluginRegistry): PluginStatusSummary {
  const selected = selectedPluginIds(config);
  const resolution = resolveDomainSelection(loaded, selected);
  const available = availableDomains(loaded).map((domain) => domain.domain_id);
  const tools = uniqueSorted(strings(record(config.agent_tools).selected));
  const recordsByTool = installationRecords(manifest.installations);
  const projected = resolution.availableDomainIds.filter((domainId) => {
    if (!tools.length) return false;
    const skillIds = new Set(resolveDomainSelection(loaded, [domainId]).resolvedSkillIds);
    return tools.every((toolId) => [...skillIds].every((skillId) => recordsByTool.some((item) => item.tool_id === toolId && item.skill_id === skillId)));
  });
  return { selected, available, unavailable: resolution.unavailableDomainIds, projected, resolved_skills: resolution.resolvedSkillIds };
}

export function pluginCatalogItem(domain: DomainDefinition, loaded: LoadedPluginRegistry, selected: readonly string[], projected = false) {
  const resolution = resolveDomainSelection(loaded, [domain.domain_id]);
  return {
    domain_id: domain.domain_id,
    title: domain.title,
    description: domain.description,
    version: domain.version,
    domain_type: domain.domain_type,
    anzsrc_group_code: domain.domain_type === "discipline" ? domain.anzsrc_group_code : null,
    available: domainIsAvailable(domain),
    installed: selected.includes(domain.domain_id),
    projected,
    direct_skills: domain.skills.map((skillId) => skillItem(skillId, loaded)),
    resolved_skills: resolution.resolvedSkillIds.map((skillId) => skillItem(skillId, loaded)),
  };
}

export function unavailablePluginCatalogItem(domainId: string, domain: DomainDefinition | undefined) {
  return {
    domain_id: domainId,
    title: domain?.title ?? domainId,
    description: domain?.description ?? "This previously selected domain is not present in the bundled catalog.",
    version: domain?.version ?? null,
    domain_type: domain?.domain_type ?? null,
    anzsrc_group_code: domain?.domain_type === "discipline" ? domain.anzsrc_group_code : null,
    available: false,
    installed: true,
    projected: false,
    direct_skills: [],
    resolved_skills: [],
  };
}

function skillItem(skillId: string, loaded: LoadedPluginRegistry) {
  const registered = loaded.skills.get(skillId);
  return {
    skill_id: skillId,
    license: registered?.definition.license ?? null,
    dependencies: registered?.definition.dependencies ?? [],
    upstreams: registered?.definition.upstreams ?? [],
    vendor: registered ? {
      vendor_id: registered.vendor.vendor_id,
      name: registered.vendor.name,
      release: registered.vendor.release,
      revision: registered.vendor.revision,
      repository_url: registered.vendor.repository_url,
      license: registered.vendor.license,
    } : null,
  };
}

function installationRecords(value: unknown): Array<{ tool_id: string; skill_id?: string }> { return records(value).filter((item): item is Record<string, unknown> & { tool_id: string; skill_id?: string } => typeof item.tool_id === "string" && (item.skill_id === undefined || typeof item.skill_id === "string")); }
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function uniqueSorted(values: readonly string[]): string[] { return [...new Set(values)].sort(compareText); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
