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
  validateGraphCapabilityReferences,
  type CapabilityGraphProfile,
} from "../core/contracts/capability-graph.js";
import { capabilityIds, loadCapabilityRegistry } from "../capabilities/registry.js";
import type { Diagnostic } from "../core/validation/types.js";

const PLUGIN_EXTENSION_SCHEMA_VERSION = "1" as const;

const NonEmptySchema = z.string().trim().min(1);
const HexSha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "hash must be a lowercase SHA-256 hex string");
const StableIdSchema = z.string().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const RelativeSourcePathSchema = z.string().min(1).refine(isSafeRelativePath, "must be a safe relative POSIX path");

const CapabilityEntrySchema = z.strictObject({
  capability_id: StableIdSchema,
  source_path: RelativeSourcePathSchema,
  manifest_sha256: HexSha256Schema,
});

const ProfileEntrySchema = z.strictObject({
  profile_id: StableIdSchema,
  source_path: RelativeSourcePathSchema,
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

export async function validatePluginExtensionRegistry(
  raw: unknown,
  root: string,
  registryPath = path.join(root, "registry.json"),
): Promise<LoadedPluginExtensionRegistry> {
  const parsed = PluginExtensionRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    throw new PluginExtensionRegistryError(parsed.error.issues.map((issue) => fatal("plugin_extension_registry_invalid", `Invalid plugin extension registry at ${issue.path.join(".") || "root"}: ${issue.message}`, registryPath, issue)));
  }

  const registry = parsed.data;
  const errors: Diagnostic[] = [];
  uniqueIds(registry.capabilities.map((item) => item.capability_id), "capability", errors, registryPath);
  uniqueIds(registry.profiles.map((item) => item.profile_id), "profile", errors, registryPath);
  uniqueIds(registry.domains.map((item) => item.domain_id), "domain", errors, registryPath);

  const capabilities = new Map<string, RegisteredPluginCapability>();
  for (const [index, entry] of registry.capabilities.entries()) {
    const packageRoot = path.join(root, ...entry.source_path.split("/"));
    const manifestPath = path.join(packageRoot, "manifest.yaml");
    let manifestText: string;
    try {
      manifestText = await readFile(manifestPath, "utf8");
    } catch {
      errors.push(fatal("plugin_extension_capability_manifest_missing", `Plugin extension capability ${entry.capability_id} is missing manifest.yaml.`, manifestPath));
      continue;
    }
    const manifestSha256 = sha256(manifestText);
    if (manifestSha256 !== entry.manifest_sha256) {
      errors.push(fatal("plugin_extension_capability_hash_mismatch", `Plugin extension capability ${entry.capability_id} manifest hash does not match the registry.`, manifestPath, { expected: entry.manifest_sha256, actual: manifestSha256 }));
    }
    let manifestValue: unknown;
    try {
      manifestValue = parse(manifestText) as unknown;
    } catch (error) {
      errors.push(fatal("plugin_extension_capability_manifest_invalid", `Cannot parse manifest.yaml for ${entry.capability_id}: ${error instanceof Error ? error.message : String(error)}`, manifestPath));
      continue;
    }
    const manifestResult = CapabilityManifestSchema.safeParse(manifestValue);
    if (!manifestResult.success) {
      errors.push(...manifestResult.error.issues.map((issue) => fatal("plugin_extension_capability_manifest_invalid", `Invalid manifest for ${entry.capability_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, manifestPath, issue)));
      continue;
    }
    const manifest = manifestResult.data;
    if (manifest.capability_id !== entry.capability_id) {
      errors.push(fatal("plugin_extension_capability_id_mismatch", `Plugin extension capability ${entry.capability_id} manifest declares ${manifest.capability_id}.`, manifestPath));
    }

    const skillPath = path.join(packageRoot, "SKILL.md");
    let skillText = "";
    try {
      skillText = await readFile(skillPath, "utf8");
    } catch {
      errors.push(fatal("plugin_extension_capability_skill_missing", `Plugin extension capability ${entry.capability_id} is missing SKILL.md.`, skillPath));
    }
    if (skillText && skillText.trim().length === 0) {
      errors.push(fatal("plugin_extension_capability_skill_empty", `Plugin extension capability ${entry.capability_id} SKILL.md is empty.`, skillPath));
    }

    for (const knowledge of manifest.knowledge_refs) {
      const knowledgePath = path.join(packageRoot, ...knowledge.path.split("/"));
      let knowledgeBytes: Buffer;
      try {
        knowledgeBytes = await readFile(knowledgePath);
      } catch {
        errors.push(fatal("plugin_extension_capability_knowledge_missing", `Plugin extension capability ${entry.capability_id} references missing knowledge file ${knowledge.path}.`, knowledgePath));
        continue;
      }
      if (sha256(knowledgeBytes) !== knowledge.content_hash) {
        errors.push(fatal("plugin_extension_capability_knowledge_hash_mismatch", `Plugin extension capability ${entry.capability_id} knowledge file ${knowledge.path} hash does not match the manifest.`, knowledgePath, { expected: knowledge.content_hash, actual: sha256(knowledgeBytes) }));
      }
    }

    capabilities.set(entry.capability_id, {
      entry,
      manifest,
      packageRoot,
      manifestPath,
      manifestSha256,
      files: [manifestPath, skillPath, ...manifest.knowledge_refs.map((item) => path.join(packageRoot, ...item.path.split("/")))],
    });
    void index;
  }

  const profiles = new Map<string, RegisteredPluginProfile>();
  for (const [index, entry] of registry.profiles.entries()) {
    const sourcePath = path.join(root, ...entry.source_path.split("/"));
    let profileText: string;
    try {
      profileText = await readFile(sourcePath, "utf8");
    } catch {
      errors.push(fatal("plugin_extension_profile_missing", `Plugin extension profile ${entry.profile_id} is missing.`, sourcePath));
      continue;
    }
    const profileSha256 = sha256(profileText);
    if (profileSha256 !== entry.profile_sha256) {
      errors.push(fatal("plugin_extension_profile_hash_mismatch", `Plugin extension profile ${entry.profile_id} hash does not match the registry.`, sourcePath, { expected: entry.profile_sha256, actual: profileSha256 }));
    }
    let profileValue: unknown;
    try {
      profileValue = parse(profileText) as unknown;
    } catch (error) {
      errors.push(fatal("plugin_extension_profile_invalid", `Cannot parse profile ${entry.profile_id}: ${error instanceof Error ? error.message : String(error)}`, sourcePath));
      continue;
    }
    const profileResult = CapabilityGraphProfileSchema.safeParse(profileValue);
    if (!profileResult.success) {
      errors.push(...profileResult.error.issues.map((issue) => fatal("plugin_extension_profile_invalid", `Invalid plugin extension profile ${entry.profile_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, sourcePath, issue)));
      continue;
    }
    const profile = profileResult.data;
    if (profile.profile_id !== entry.profile_id) {
      errors.push(fatal("plugin_extension_profile_id_mismatch", `Plugin extension profile ${entry.profile_id} declares ${profile.profile_id}.`, sourcePath));
    }
    profiles.set(entry.profile_id, { entry, profile, sourcePath, profileSha256 });
    void index;
  }

  const knownCapabilityIds = new Set(capabilities.keys());
  try {
    for (const capabilityId of capabilityIds(await loadCapabilityRegistry())) knownCapabilityIds.add(capabilityId);
  } catch (error) {
    errors.push(fatal("capability_registry_unavailable", `Cannot load base capability registry while validating plugin extensions: ${error instanceof Error ? error.message : String(error)}`, registryPath));
  }
  for (const [profileIndex, registered] of [...profiles.values()].entries()) {
    const references = validateGraphCapabilityReferences(registered.profile, knownCapabilityIds);
    for (const reference of references) {
      errors.push(fatal("plugin_extension_profile_capability_unknown", `Plugin extension profile ${registered.entry.profile_id}: ${reference.message}`, registered.sourcePath, { path: reference.path }));
    }
    void profileIndex;
  }

  const domains = new Map<string, PluginDomainAssignment>();
  for (const assignment of registry.domains) {
    for (const capabilityId of assignment.capabilities) {
      if (!capabilities.has(capabilityId)) errors.push(fatal("plugin_extension_domain_capability_unknown", `Plugin extension domain ${assignment.domain_id} references unknown capability ${capabilityId}.`, registryPath, { domain_id: assignment.domain_id, capability_id: capabilityId }));
    }
    for (const profileId of assignment.profiles) {
      if (!profiles.has(profileId)) errors.push(fatal("plugin_extension_domain_profile_unknown", `Plugin extension domain ${assignment.domain_id} references unknown profile ${profileId}.`, registryPath, { domain_id: assignment.domain_id, profile_id: profileId }));
    }
    domains.set(assignment.domain_id, assignment);
  }

  if (errors.length > 0) throw new PluginExtensionRegistryError(errors);
  return {
    root,
    registryPath,
    registry,
    capabilities,
    profiles,
    domains,
    diagnostics: [],
  };
}

export function resolveDomainExtensions(loaded: LoadedPluginExtensionRegistry, domainIds: readonly string[]): ResolvedDomainExtensions {
  const capabilities = new Set<string>();
  const profiles = new Set<string>();
  for (const domainId of new Set(domainIds)) {
    const assignment = loaded.domains.get(domainId);
    if (!assignment) continue;
    for (const capabilityId of assignment.capabilities) capabilities.add(capabilityId);
    for (const profileId of assignment.profiles) profiles.add(profileId);
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

function fatal(code: string, message: string, filePath: string, details?: unknown): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true, ...(details === undefined ? {} : { details }) };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
