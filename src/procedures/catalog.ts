import { readFile } from "node:fs/promises";
import path from "node:path";

import { COMPANION_INTENTS, renderCompanionSkill } from "../adapters/companion/index.js";
import { loadCapabilityRegistry } from "../capabilities/registry.js";
import type { CapabilityManifest } from "../core/contracts/capability-manifest.js";
import { loadGraphProfileRegistry } from "../graph-profiles/registry.js";
import { ARSU_ROUTING_CATALOG } from "../arsu-converter/routing/catalog.js";
import { PACKAGE_ROOT } from "../capabilities/registry.js";
import { loadPluginExtensionRegistry } from "../plugins/extensions.js";

export type ProcedureKind = "arsu" | "companion" | "capability" | "plugin";
export type ProcedureMode = "standalone" | "graph";

export interface ProcedureDefinition {
  id: string;
  selector: `procedure:${string}`;
  kind: ProcedureKind;
  title: string;
  description: string;
  modes: readonly ProcedureMode[];
  domains: readonly string[];
  profiles: readonly string[];
  packageRoot: string;
  contentPath?: string;
  content?: string;
  manifest?: CapabilityManifest;
}

export interface ProcedureCard {
  selector: `procedure:${string}`;
  procedure_id: string;
  kind: ProcedureKind;
  title: string;
  description: string;
  modes: readonly ProcedureMode[];
  domains: readonly string[];
  profiles: readonly string[];
  resource_count: number;
}

export async function loadProcedureCatalog(packageRoot = PACKAGE_ROOT): Promise<ReadonlyMap<string, ProcedureDefinition>> {
  const core = await loadCapabilityRegistry(path.join(packageRoot, "skills/capabilities"));
  const [profiles, extensions] = await Promise.all([
    loadGraphProfileRegistry(path.join(packageRoot, "skills/arsu/profiles"), core),
    loadPluginExtensionRegistry(path.join(packageRoot, "skills/plugins/extensions")),
  ]);
  const result = new Map<string, ProcedureDefinition>();
  const add = (procedure: ProcedureDefinition) => {
    if (result.has(procedure.id)) throw new Error(`Duplicate procedure ID: ${procedure.id}`);
    result.set(procedure.id, procedure);
  };

  for (const skill of ARSU_ROUTING_CATALOG.skills) {
    add({
      id: skill.skill_id,
      selector: `procedure:${skill.skill_id}`,
      kind: "arsu",
      title: skill.title,
      description: skill.summary,
      modes: ["standalone"],
      domains: [],
      profiles: [...profiles.profiles.values()]
        .filter(({ profile }) => profile.entries.some((entry) => entry.route_ref?.startsWith(`${skill.skill_id}:`)))
        .map(({ profile }) => profile.profile_id)
        .sort(compareText),
      packageRoot: path.join(packageRoot, "skills/arsu", skill.skill_id),
      contentPath: path.join(packageRoot, "skills/arsu", skill.skill_id, "SKILL.md"),
    });
  }

  for (const intent of COMPANION_INTENTS.filter((item) => item.id !== "navigate")) {
    add({
      id: intent.skillId,
      selector: `procedure:${intent.skillId}`,
      kind: "companion",
      title: intent.name,
      description: intent.description,
      modes: ["standalone"],
      domains: [],
      profiles: [],
      packageRoot: path.join(packageRoot, "skills"),
      content: renderCompanionSkill(intent),
    });
  }

  const coreProfiles = profileMembership([...profiles.profiles.values()].map((item) => item.profile));
  for (const registered of core.capabilities.values()) {
    const manifest = registered.manifest;
    add({
      id: manifest.capability_id,
      selector: `procedure:${manifest.capability_id}`,
      kind: "capability",
      title: manifest.title,
      description: manifest.description,
      modes: ["standalone", "graph"],
      domains: [],
      profiles: coreProfiles.get(manifest.capability_id) ?? [],
      packageRoot: registered.packageRoot,
      contentPath: path.join(registered.packageRoot, "SKILL.md"),
      manifest,
    });
  }

  const extensionProfiles = profileMembership([...extensions.profiles.values()].map((item) => item.profile));
  const extensionDomains = new Map<string, string[]>();
  for (const assignment of extensions.domains.values()) {
    for (const capabilityId of assignment.capabilities) {
      const domains = extensionDomains.get(capabilityId) ?? [];
      domains.push(assignment.domain_id);
      extensionDomains.set(capabilityId, domains);
    }
  }
  for (const registered of extensions.capabilities.values()) {
    const manifest = registered.manifest;
    add({
      id: manifest.capability_id,
      selector: `procedure:${manifest.capability_id}`,
      kind: "plugin",
      title: manifest.title,
      description: manifest.description,
      modes: ["standalone", "graph"],
      domains: (extensionDomains.get(manifest.capability_id) ?? []).sort(compareText),
      profiles: extensionProfiles.get(manifest.capability_id) ?? [],
      packageRoot: registered.packageRoot,
      contentPath: path.join(registered.packageRoot, "SKILL.md"),
      manifest,
    });
  }

  return new Map([...result].sort(([left], [right]) => compareText(left, right)));
}

export function procedureCard(procedure: ProcedureDefinition): ProcedureCard {
  return {
    selector: procedure.selector,
    procedure_id: procedure.id,
    kind: procedure.kind,
    title: procedure.title,
    description: compact(procedure.description),
    modes: procedure.modes,
    domains: procedure.domains,
    profiles: procedure.profiles,
    resource_count: procedure.manifest?.knowledge_refs.length ?? 0,
  };
}

export function searchProcedures(catalog: ReadonlyMap<string, ProcedureDefinition>, query?: string): ProcedureDefinition[] {
  const terms = normalize(query ?? "").split(" ").filter(Boolean);
  return [...catalog.values()]
    .map((procedure) => ({ procedure, score: procedureScore(procedure, terms) }))
    .filter((item) => terms.length === 0 || item.score > 0)
    .sort((left, right) => right.score - left.score || compareText(left.procedure.id, right.procedure.id))
    .map((item) => item.procedure);
}

export async function readProcedureContent(procedure: ProcedureDefinition): Promise<string> {
  if (procedure.content !== undefined) return procedure.content;
  if (!procedure.contentPath) throw new Error(`Procedure content is unavailable: ${procedure.id}`);
  return readFile(procedure.contentPath, "utf8");
}

function procedureScore(procedure: ProcedureDefinition, terms: readonly string[]): number {
  if (terms.length === 0) return 0;
  const id = normalize(procedure.id);
  const title = normalize(procedure.title);
  const haystack = normalize([procedure.id, procedure.title, procedure.description, ...procedure.domains, ...procedure.profiles].join(" "));
  const query = terms.join(" ");
  if (id === query || title === query) return 4;
  if (terms.every((term) => haystack.includes(term))) return 3;
  return terms.some((term) => haystack.includes(term)) ? 2 : 0;
}

function profileMembership(profiles: readonly { profile_id: string; nodes: readonly { capability_id?: string }[] }[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const profile of profiles) {
    for (const capabilityId of new Set(profile.nodes.flatMap((node) => node.capability_id ? [node.capability_id] : []))) {
      const memberships = result.get(capabilityId) ?? [];
      memberships.push(profile.profile_id);
      result.set(capabilityId, memberships);
    }
  }
  for (const memberships of result.values()) memberships.sort(compareText);
  return result;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();
}

function compact(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= 240 ? normalized : `${normalized.slice(0, 237)}...`;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
