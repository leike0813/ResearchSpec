import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";
import { z } from "zod";

import {
  validateGraphAgainstCapabilityRegistry,
  loadCapabilityRegistry,
  type LoadedCapabilityRegistry,
} from "../capabilities/registry.js";
import {
  CapabilityGraphProfileSchema,
  type CapabilityGraphProfile,
} from "../core/contracts/capability-graph.js";
import { StableIdSchema } from "../core/contracts/stable-specs.js";
import type { Diagnostic } from "../core/validation/types.js";

const HexSha256Schema = z.string().regex(/^[0-9a-f]{64}$/, "profile hash must be a lowercase SHA-256 hex string");
const NonEmptySchema = z.string().trim().min(1);
const RelativeSourcePathSchema = z.string().min(1).refine(isSafeRelativePath, "must be a safe relative POSIX path");

export const GRAPH_PROFILE_REGISTRY_SCHEMA_VERSION = "1" as const;
export const GRAPH_PROFILE_REGISTRY_FILENAME = "registry.json" as const;

export const GraphProfileRegistryEntrySchema = z.strictObject({
  profile_id: StableIdSchema,
  profile_version: NonEmptySchema,
  source_path: RelativeSourcePathSchema,
  profile_sha256: HexSha256Schema,
});

export const GraphProfileRegistrySchema = z.strictObject({
  schema_version: z.literal(GRAPH_PROFILE_REGISTRY_SCHEMA_VERSION),
  registry_version: NonEmptySchema,
  profiles: z.array(GraphProfileRegistryEntrySchema).min(1),
});

export type GraphProfileRegistry = z.infer<typeof GraphProfileRegistrySchema>;
export type GraphProfileRegistryEntry = GraphProfileRegistry["profiles"][number];

export interface RegisteredGraphProfile {
  entry: GraphProfileRegistryEntry;
  profile: CapabilityGraphProfile;
  sourcePath: string;
  projection: string;
  profileSha256: string;
}

export interface LoadedGraphProfileRegistry {
  root: string;
  registryPath: string;
  registry: GraphProfileRegistry;
  profiles: ReadonlyMap<string, RegisteredGraphProfile>;
  diagnostics: readonly Diagnostic[];
}

export class GraphProfileRegistryError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "GraphProfileRegistryError";
  }
}

export const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const GRAPH_PROFILE_ROOT = path.join(PACKAGE_ROOT, "skills/arsu/profiles");

export async function loadGraphProfileRegistry(
  root = GRAPH_PROFILE_ROOT,
  registry?: LoadedCapabilityRegistry,
): Promise<LoadedGraphProfileRegistry> {
  const registryPath = path.join(root, GRAPH_PROFILE_REGISTRY_FILENAME);
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
  } catch (error) {
    throw new GraphProfileRegistryError([
      fatal("graph_profile_registry_unreadable", `Cannot read graph profile registry: ${error instanceof Error ? error.message : String(error)}`, registryPath),
    ]);
  }
  return validateGraphProfileRegistry(raw, root, registryPath, registry ?? await loadCapabilityRegistry());
}

export async function validateGraphProfileRegistry(
  raw: unknown,
  root: string,
  registryPath = path.join(root, GRAPH_PROFILE_REGISTRY_FILENAME),
  capabilityRegistry?: LoadedCapabilityRegistry,
): Promise<LoadedGraphProfileRegistry> {
  const parsed = GraphProfileRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    throw new GraphProfileRegistryError(parsed.error.issues.map((issue) =>
      fatal("graph_profile_registry_invalid", `Invalid graph profile registry at ${issue.path.join(".") || "root"}: ${issue.message}`, registryPath, issue),
    ));
  }

  const registry = capabilityRegistry ?? await loadCapabilityRegistry();
  const errors: Diagnostic[] = [];
  const seen = new Set<string>();
  const profiles = new Map<string, RegisteredGraphProfile>();

  for (const entry of parsed.data.profiles) {
    if (seen.has(entry.profile_id)) {
      errors.push(fatal("graph_profile_registry_id_duplicate", `Duplicate graph profile ID: ${entry.profile_id}`, registryPath));
      continue;
    }
    seen.add(entry.profile_id);
    const sourcePath = path.join(root, ...entry.source_path.split("/"));
    let projection: string;
    try {
      projection = await readFile(sourcePath, "utf8");
    } catch {
      errors.push(fatal("graph_profile_missing", `Graph profile ${entry.profile_id} is missing.`, sourcePath));
      continue;
    }
    const profileSha256 = sha256(projection);
    if (profileSha256 !== entry.profile_sha256) {
      errors.push(fatal("graph_profile_hash_mismatch", `Graph profile ${entry.profile_id} hash does not match the registry.`, sourcePath, { expected: entry.profile_sha256, actual: profileSha256 }));
    }

    let value: unknown;
    try {
      value = parse(projection) as unknown;
    } catch (error) {
      errors.push(fatal("graph_profile_invalid", `Cannot parse graph profile ${entry.profile_id}: ${error instanceof Error ? error.message : String(error)}`, sourcePath));
      continue;
    }
    const profileResult = CapabilityGraphProfileSchema.safeParse(value);
    if (!profileResult.success) {
      errors.push(...profileResult.error.issues.map((issue) =>
        fatal("graph_profile_invalid", `Invalid graph profile ${entry.profile_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, sourcePath, issue),
      ));
      continue;
    }
    const profile = profileResult.data;
    if (profile.profile_id !== entry.profile_id) {
      errors.push(fatal("graph_profile_id_mismatch", `Graph profile registry entry ${entry.profile_id} declares ${profile.profile_id}.`, sourcePath));
    }
    if (profile.profile_version !== entry.profile_version) {
      errors.push(fatal("graph_profile_version_mismatch", `Graph profile ${entry.profile_id} version does not match the registry.`, sourcePath, { expected: entry.profile_version, actual: profile.profile_version }));
    }
    if (profile.capability_registry_version !== registry.registry.registry_version) {
      errors.push(fatal("graph_profile_capability_registry_version_mismatch", `Graph profile ${entry.profile_id} expects capability registry ${profile.capability_registry_version}; loaded registry is ${registry.registry.registry_version}.`, sourcePath));
    }
    for (const reference of validateGraphAgainstCapabilityRegistry(registry, profile)) {
      errors.push(fatal(reference.code ?? "graph_profile_capability_unknown", `Graph profile ${entry.profile_id}: ${reference.message}`, sourcePath, reference));
    }
    profiles.set(entry.profile_id, { entry, profile, sourcePath, projection, profileSha256 });
  }

  for (const registered of profiles.values()) {
    for (const subgraph of registered.profile.subgraphs) {
      const child = profiles.get(subgraph.profile_id);
      if (!child) {
        errors.push(fatal("graph_profile_subgraph_unknown", `Graph profile ${registered.profile.profile_id} references unknown child profile ${subgraph.profile_id}.`, registered.sourcePath));
        continue;
      }
      if (child.profile.profile_version !== subgraph.profile_version) {
        errors.push(fatal("graph_profile_subgraph_version_mismatch", `Graph profile ${registered.profile.profile_id} binds ${subgraph.profile_id}@${subgraph.profile_version}, but the registry provides ${child.profile.profile_version}.`, registered.sourcePath));
      }
      const childEntry = child.profile.entries.find((item) => item.entry_id === subgraph.entry_id);
      if (!childEntry) {
        errors.push(fatal("graph_profile_subgraph_entry_unknown", `Graph profile ${registered.profile.profile_id} references unknown entry ${subgraph.entry_id} in ${subgraph.profile_id}.`, registered.sourcePath));
      } else if (childEntry.kind === "end-to-end" ? childEntry.node_id !== subgraph.entry_node_id : !childEntry.entry_points.includes(subgraph.entry_node_id)) {
        errors.push(fatal("graph_profile_subgraph_entry_node_invalid", `Graph profile ${registered.profile.profile_id} entry binding ${subgraph.entry_id} does not expose ${subgraph.entry_node_id}.`, registered.sourcePath));
      }
    }
  }

  if (errors.length > 0) throw new GraphProfileRegistryError(errors);
  return { root, registryPath, registry: parsed.data, profiles, diagnostics: [] };
}

function isSafeRelativePath(value: string): boolean {
  if (value.includes("\\") || value.startsWith("/") || value.includes("\0")) return false;
  return value.split("/").every((segment) => Boolean(segment) && segment !== "." && segment !== "..");
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function fatal(code: string, message: string, filePath: string, details?: unknown): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true, ...(details === undefined ? {} : { details }) };
}
