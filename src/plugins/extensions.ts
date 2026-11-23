import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";
import { z } from "zod";

import {
  CapabilityManifestSchema,
  type CapabilityManifest,
} from "../core/contracts/capability-manifest.js";
import {
  CapabilityGraphProfileSchema,
  type CapabilityGraphProfile,
} from "../core/contracts/capability-graph.js";
import { loadBaseCapabilityRegistry, validateGraphAgainstCapabilityRegistry, type LoadedCapabilityRegistry } from "../capabilities/registry.js";
import type { Diagnostic } from "../core/validation/types.js";
import { loadBaseGraphProfileRegistry } from "../graph-profiles/registry.js";
import { INTELLECTUAL_PROPERTY_DOMAIN_ID, OPTIONAL_PATENT_CAPABILITY_IDS, OPTIONAL_PATENT_PROFILE_IDS } from "../graph-profiles/intellectual-property.js";

const PLUGIN_EXTENSION_SCHEMA_VERSION = "1" as const;

const NonEmptySchema = z.string().trim().min(1);
const HexSha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "hash must be a lowercase SHA-256 hex string");
const StableIdSchema = z.string().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const RelativeSourcePathSchema = z.string().min(1).refine(isSafeRelativePath, "must be a safe relative POSIX path");

const CapabilityEntrySchema = z.strictObject({
  capability_id: StableIdSchema,
  source_path: RelativeSourcePathSchema,
  source_root: z.literal("bundled").optional(),
  manifest_sha256: HexSha256Schema,
});

const ProfileEntrySchema = z.strictObject({
  profile_id: StableIdSchema,
  source_path: RelativeSourcePathSchema,
  source_root: z.literal("bundled").optional(),
  profile_sha256: HexSha256Schema,
});

const DomainAssignmentSchema = z.strictObject({
  domain_id: StableIdSchema,
  capabilities: z.array(StableIdSchema),
  profiles: z.array(StableIdSchema),
});

export const PluginExtensionRegistrySchema = z.strictObject({
  schema_version: z.literal(PLUGIN_EXTENSION_SCHEMA_VERSION),
  registry_version: NonEmptySchema,
  capabilities: z.array(CapabilityEntrySchema),
  profiles: z.array(ProfileEntrySchema),
  domains: z.array(DomainAssignmentSchema),
});

export type PluginExtensionRegistry = z.infer<typeof PluginExtensionRegistrySchema>;
export type PluginCapabilityRegistryEntry = PluginExtensionRegistry["capabilities"][number];
export type PluginProfileRegistryEntry = PluginExtensionRegistry["profiles"][number];
export type PluginDomainAssignment = PluginExtensionRegistry["domains"][number];

export interface RegisteredPluginCapability {
  entry: PluginCapabilityRegistryEntry;
  manifest: CapabilityManifest;
  packageRoot: string;
  manifestPath: string;
  manifestSha256: string;
  files: readonly string[];
}

export interface RegisteredPluginProfile {
  entry: PluginProfileRegistryEntry;
  profile: CapabilityGraphProfile;
  sourcePath: string;
  profileSha256: string;
}

export interface LoadedPluginExtensionRegistry {
  root: string;
  registryPath: string;
  registry: PluginExtensionRegistry;
  capabilities: ReadonlyMap<string, RegisteredPluginCapability>;
  profiles: ReadonlyMap<string, RegisteredPluginProfile>;
  domains: ReadonlyMap<string, PluginDomainAssignment>;
  diagnostics: readonly Diagnostic[];
}

export interface ResolvedDomainExtensions {
  capabilityIds: string[];
  profileIds: string[];
}

export class PluginExtensionRegistryError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "PluginExtensionRegistryError";
  }
}

export const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const PLUGIN_EXTENSION_ROOT = path.join(PACKAGE_ROOT, "skills/plugins/extensions");

export async function loadPluginExtensionRegistry(root = PLUGIN_EXTENSION_ROOT): Promise<LoadedPluginExtensionRegistry> {
  const registryPath = path.join(root, "registry.json");
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
  } catch (error) {
    throw new PluginExtensionRegistryError([fatal("plugin_extension_registry_unreadable", `Cannot read plugin extension registry: ${error instanceof Error ? error.message : String(error)}`, registryPath)]);
  }
  return validatePluginExtensionRegistry(raw, root, registryPath);
}

/**
 * Load the extension registry for runtime discovery. Unlike the strict loader,
 * invalid individual capabilities, profiles, and domain references are omitted
 * with non-blocking diagnostics so unrelated core and extension work remains usable.
 */
export async function loadRuntimePluginExtensionRegistry(
  root = PLUGIN_EXTENSION_ROOT,
  packageRoot = PACKAGE_ROOT,
  base?: LoadedCapabilityRegistry,
): Promise<LoadedPluginExtensionRegistry> {
  const registryPath = path.join(root, "registry.json");
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
  } catch (error) {
    return runtimeRegistryUnavailable(root, registryPath, [fatal(
      "plugin_extension_registry_unreadable",
      `Cannot read plugin extension registry: ${error instanceof Error ? error.message : String(error)}`,
      registryPath,
    )]);
  }
  const parsed = PluginExtensionRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    return runtimeRegistryUnavailable(root, registryPath, parsed.error.issues.map((issue) => fatal(
      "plugin_extension_registry_invalid",
      `Invalid plugin extension registry at ${issue.path.join(".") || "root"}: ${issue.message}`,
      registryPath,
      issue,
    )));
  }
  return validatePluginExtensionRegistryData(parsed.data, root, registryPath, false, packageRoot, base);
}

export async function validatePluginExtensionRegistry(
  raw: unknown,
  root: string,
  registryPath = path.join(root, "registry.json"),
): Promise<LoadedPluginExtensionRegistry> {
  const parsed = PluginExtensionRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    throw new PluginExtensionRegistryError(parsed.error.issues.map((issue) => fatal("plugin_extension_registry_invalid", `Invalid plugin extension registry at ${issue.path.join(".") || "root"}: ${issue.message}`, registryPath, issue)));
  }

  return validatePluginExtensionRegistryData(parsed.data, root, registryPath, true, PACKAGE_ROOT);
}

async function validatePluginExtensionRegistryData(
  registry: PluginExtensionRegistry,
  root: string,
  registryPath: string,
  strict: boolean,
  packageRoot: string,
  baseRegistry?: LoadedCapabilityRegistry,
): Promise<LoadedPluginExtensionRegistry> {
  const errors: Diagnostic[] = [];
  uniqueIds(registry.capabilities.map((item) => item.capability_id), "capability", errors, registryPath);
  uniqueIds(registry.profiles.map((item) => item.profile_id), "profile", errors, registryPath);
  uniqueIds(registry.domains.map((item) => item.domain_id), "domain", errors, registryPath);
  const duplicateCapabilityIds = duplicateIds(registry.capabilities.map((item) => item.capability_id));
  const duplicateProfileIds = duplicateIds(registry.profiles.map((item) => item.profile_id));
  const duplicateDomainIds = duplicateIds(registry.domains.map((item) => item.domain_id));

  const capabilities = new Map<string, RegisteredPluginCapability>();
  for (const entry of registry.capabilities) {
    const entryErrors: Diagnostic[] = [];
    if (entry.source_root === "bundled" && (!OPTIONAL_PATENT_CAPABILITY_IDS.has(entry.capability_id) || entry.source_path !== entry.capability_id)) {
      errors.push(fatal("plugin_extension_bundled_source_invalid", `Invalid bundled capability source: ${entry.capability_id}.`, registryPath));
      continue;
    }
    const capabilityRoot = path.join(entry.source_root === "bundled" ? path.join(packageRoot, "skills/capabilities") : root, entry.source_path);
    const manifestPath = path.join(capabilityRoot, "manifest.yaml");
    let manifestText: string;
    try {
      manifestText = await readFile(manifestPath, "utf8");
    } catch {
      entryErrors.push(fatal("plugin_extension_capability_manifest_missing", `Plugin extension capability ${entry.capability_id} is missing manifest.yaml.`, manifestPath));
      errors.push(...entryErrors);
      continue;
    }
    const manifestSha256 = sha256(manifestText);
    if (manifestSha256 !== entry.manifest_sha256) {
      entryErrors.push(fatal("plugin_extension_capability_hash_mismatch", `Plugin extension capability ${entry.capability_id} manifest hash does not match the registry.`, manifestPath, { expected: entry.manifest_sha256, actual: manifestSha256 }));
    }
    let manifestValue: unknown;
    try {
      manifestValue = parse(manifestText) as unknown;
    } catch (error) {
      entryErrors.push(fatal("plugin_extension_capability_manifest_invalid", `Cannot parse manifest.yaml for ${entry.capability_id}: ${error instanceof Error ? error.message : String(error)}`, manifestPath));
      errors.push(...entryErrors);
      continue;
    }
    const manifestResult = CapabilityManifestSchema.safeParse(manifestValue);
    if (!manifestResult.success) {
      entryErrors.push(...manifestResult.error.issues.map((issue) => fatal("plugin_extension_capability_manifest_invalid", `Invalid manifest for ${entry.capability_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, manifestPath, issue)));
      errors.push(...entryErrors);
      continue;
    }
    const manifest = manifestResult.data;
    if (manifest.capability_id !== entry.capability_id) {
      entryErrors.push(fatal("plugin_extension_capability_id_mismatch", `Plugin extension capability ${entry.capability_id} manifest declares ${manifest.capability_id}.`, manifestPath));
    }

    const skillPath = path.join(capabilityRoot, "SKILL.md");
    try {
      const skillText = await readFile(skillPath, "utf8");
      if (!skillText.trim()) {
        entryErrors.push(fatal("plugin_extension_capability_skill_empty", `Plugin extension capability ${entry.capability_id} SKILL.md is empty.`, skillPath));
      }
    } catch {
      entryErrors.push(fatal("plugin_extension_capability_skill_missing", `Plugin extension capability ${entry.capability_id} is missing SKILL.md.`, skillPath));
    }

    for (const knowledge of manifest.knowledge_refs) {
      const knowledgePath = path.join(capabilityRoot, ...knowledge.path.split("/"));
      let knowledgeBytes: Buffer;
      try {
        knowledgeBytes = await readFile(knowledgePath);
      } catch {
        entryErrors.push(fatal("plugin_extension_capability_knowledge_missing", `Plugin extension capability ${entry.capability_id} references missing knowledge file ${knowledge.path}.`, knowledgePath));
        continue;
      }
      if (sha256(knowledgeBytes) !== knowledge.content_hash) {
        entryErrors.push(fatal("plugin_extension_capability_knowledge_hash_mismatch", `Plugin extension capability ${entry.capability_id} knowledge file ${knowledge.path} hash does not match the manifest.`, knowledgePath, { expected: knowledge.content_hash, actual: sha256(knowledgeBytes) }));
      }
    }

    errors.push(...entryErrors);
    if (entryErrors.length === 0 && !duplicateCapabilityIds.has(entry.capability_id)) {
      capabilities.set(entry.capability_id, {
        entry,
        manifest,
        packageRoot: capabilityRoot,
        manifestPath,
        manifestSha256,
        files: [manifestPath, skillPath, ...manifest.knowledge_refs.map((item) => path.join(capabilityRoot, ...item.path.split("/")))],
      });
    }
  }

  const localProfiles = new Map<string, RegisteredPluginProfile>();
  for (const entry of registry.profiles) {
    const entryErrors: Diagnostic[] = [];
    if (entry.source_root === "bundled" && (!OPTIONAL_PATENT_PROFILE_IDS.has(entry.profile_id) || entry.source_path !== `${entry.profile_id}.yaml`)) {
      errors.push(fatal("plugin_extension_bundled_source_invalid", `Invalid bundled profile source: ${entry.profile_id}.`, registryPath));
      continue;
    }
    const sourcePath = path.join(entry.source_root === "bundled" ? path.join(packageRoot, "skills/arsu/profiles") : root, entry.source_path);
    let profileText: string;
    try {
      profileText = await readFile(sourcePath, "utf8");
    } catch {
      entryErrors.push(fatal("plugin_extension_profile_missing", `Plugin extension profile ${entry.profile_id} is missing.`, sourcePath));
      errors.push(...entryErrors);
      continue;
    }
    const profileSha256 = sha256(profileText);
    if (profileSha256 !== entry.profile_sha256) {
      entryErrors.push(fatal("plugin_extension_profile_hash_mismatch", `Plugin extension profile ${entry.profile_id} hash does not match the registry.`, sourcePath, { expected: entry.profile_sha256, actual: profileSha256 }));
    }
    let profileValue: unknown;
    try {
      profileValue = parse(profileText) as unknown;
    } catch (error) {
      entryErrors.push(fatal("plugin_extension_profile_invalid", `Cannot parse profile ${entry.profile_id}: ${error instanceof Error ? error.message : String(error)}`, sourcePath));
      errors.push(...entryErrors);
      continue;
    }
    const profileResult = CapabilityGraphProfileSchema.safeParse(profileValue);
    if (!profileResult.success) {
      entryErrors.push(...profileResult.error.issues.map((issue) => fatal("plugin_extension_profile_invalid", `Invalid plugin extension profile ${entry.profile_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, sourcePath, issue)));
      errors.push(...entryErrors);
      continue;
    }
    const profile = profileResult.data;
    if (profile.profile_id !== entry.profile_id) {
      entryErrors.push(fatal("plugin_extension_profile_id_mismatch", `Plugin extension profile ${entry.profile_id} declares ${profile.profile_id}.`, sourcePath));
    }
    errors.push(...entryErrors);
    if (entryErrors.length === 0 && !duplicateProfileIds.has(entry.profile_id)) {
      localProfiles.set(entry.profile_id, { entry, profile, sourcePath, profileSha256 });
    }
  }

  const profiles = new Map<string, RegisteredPluginProfile>();
  try {
    const base = baseRegistry ?? await loadBaseCapabilityRegistry(path.join(packageRoot, "skills/capabilities"));
    const combined = new Map<string, { manifest: CapabilityManifest }>(base.capabilities);
    for (const [id, capability] of capabilities) combined.set(id, capability);
    for (const registered of localProfiles.values()) {
      const references = validateGraphAgainstCapabilityRegistry({ registry: base.registry, capabilities: combined }, registered.profile);
      if (references.length === 0) {
        profiles.set(registered.entry.profile_id, registered);
        continue;
      }
      for (const reference of references) {
        errors.push(fatal(reference.code ?? "plugin_extension_profile_capability_unknown", `Plugin extension profile ${registered.entry.profile_id}: ${reference.message}`, registered.sourcePath, reference));
      }
    }
    if ([...profiles.values()].some(({ profile }) => profile.subgraphs.length > 0)) {
      const baseProfiles = await loadBaseGraphProfileRegistry(path.join(packageRoot, "skills/arsu/profiles"), base);
      // A fault in a child profile also makes every extension parent that needs it unavailable.
      let previousSize: number;
      do {
        previousSize = profiles.size;
        for (const [id, registered] of profiles) {
          for (const subgraph of registered.profile.subgraphs) {
            const child = profiles.get(subgraph.profile_id)?.profile ?? baseProfiles.profiles.get(subgraph.profile_id)?.profile;
            const entry = child?.entries.find((item) => item.entry_id === subgraph.entry_id);
            const exposesEntry = entry?.kind === "end-to-end"
              ? entry.node_id === subgraph.entry_node_id : entry?.entry_points.includes(subgraph.entry_node_id);
            if (child?.profile_version === subgraph.profile_version && exposesEntry) continue;
            profiles.delete(id);
            errors.push(fatal("plugin_extension_profile_subgraph_unavailable", `Plugin extension profile ${id} requires ${subgraph.profile_id}@${subgraph.profile_version}.`, registered.sourcePath));
            break;
          }
        }
      } while (profiles.size < previousSize);
    }
  } catch (error) {
    errors.push(fatal("capability_registry_unavailable", `Cannot load base capability registry while validating plugin extensions: ${error instanceof Error ? error.message : String(error)}`, registryPath));
  }

  const domains = new Map<string, PluginDomainAssignment>();
  for (const assignment of registry.domains) {
    const validCapabilityIds: string[] = [];
    const validProfileIds: string[] = [];
    for (const capabilityId of assignment.capabilities) {
      if (OPTIONAL_PATENT_CAPABILITY_IDS.has(capabilityId) && assignment.domain_id !== INTELLECTUAL_PROPERTY_DOMAIN_ID) {
        errors.push(fatal("plugin_extension_bundled_domain_invalid", `Invalid domain for bundled capability ${capabilityId}: ${assignment.domain_id}.`, registryPath));
      } else if (capabilities.has(capabilityId)) validCapabilityIds.push(capabilityId);
      else errors.push(fatal("plugin_extension_domain_capability_unknown", `Plugin extension domain ${assignment.domain_id} references unknown capability ${capabilityId}.`, registryPath, { domain_id: assignment.domain_id, capability_id: capabilityId }));
    }
    for (const profileId of assignment.profiles) {
      if (OPTIONAL_PATENT_PROFILE_IDS.has(profileId) && assignment.domain_id !== INTELLECTUAL_PROPERTY_DOMAIN_ID) {
        errors.push(fatal("plugin_extension_bundled_domain_invalid", `Invalid domain for bundled profile ${profileId}: ${assignment.domain_id}.`, registryPath));
      } else if (profiles.has(profileId)) validProfileIds.push(profileId);
      else errors.push(fatal("plugin_extension_domain_profile_unknown", `Plugin extension domain ${assignment.domain_id} references unknown profile ${profileId}.`, registryPath, { domain_id: assignment.domain_id, profile_id: profileId }));
    }
    if (!duplicateDomainIds.has(assignment.domain_id)) {
      domains.set(assignment.domain_id, {
        ...assignment,
        capabilities: validCapabilityIds,
        profiles: validProfileIds,
      });
    }
  }

  if (errors.length > 0 && strict) throw new PluginExtensionRegistryError(errors);
  return {
    root,
    registryPath,
    registry,
    capabilities,
    profiles,
    domains,
    diagnostics: strict ? [] : errors.map(runtimeDiagnostic),
  };
}

export function resolveDomainExtensions(loaded: LoadedPluginExtensionRegistry, domainIds: readonly string[]): ResolvedDomainExtensions {
  const capabilities = new Set<string>();
  const profiles = new Set<string>();
  for (const domainId of new Set(domainIds)) {
    const assignment = loaded.domains.get(domainId);
    if (!assignment) continue;
    for (const capabilityId of assignment.capabilities) if (loaded.capabilities.has(capabilityId)) capabilities.add(capabilityId);
    for (const profileId of assignment.profiles) if (loaded.profiles.has(profileId)) profiles.add(profileId);
  }
  return {
    capabilityIds: [...capabilities].sort(compareText),
    profileIds: [...profiles].sort(compareText),
  };
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function isSafeRelativePath(value: string): boolean {
  if (value.includes("\\") || value.startsWith("/") || value.includes("\0")) return false;
  return value.split("/").every((segment) => Boolean(segment) && segment !== "." && segment !== "..");
}

function uniqueIds(ids: readonly string[], label: string, errors: Diagnostic[], registryPath: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(fatal(`plugin_extension_${label}_id_duplicate`, `Duplicate plugin extension ${label} ID: ${id}`, registryPath));
    seen.add(id);
  }
}

function duplicateIds(ids: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return duplicates;
}

function runtimeRegistryUnavailable(root: string, registryPath: string, diagnostics: readonly Diagnostic[]): LoadedPluginExtensionRegistry {
  return {
    root,
    registryPath,
    registry: {
      schema_version: PLUGIN_EXTENSION_SCHEMA_VERSION,
      registry_version: "runtime-unavailable",
      capabilities: [],
      profiles: [],
      domains: [],
    },
    capabilities: new Map(),
    profiles: new Map(),
    domains: new Map(),
    diagnostics: diagnostics.map(runtimeDiagnostic),
  };
}

function runtimeDiagnostic(diagnostic: Diagnostic): Diagnostic {
  return { ...diagnostic, severity: "warning", blocking: false };
}

function fatal(code: string, message: string, filePath: string, details?: unknown): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true, ...(details === undefined ? {} : { details }) };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
