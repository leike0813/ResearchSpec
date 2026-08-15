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
  type CapabilityGraphProfile,
  validateGraphCapabilityReferences,
  type CapabilityGraphDiagnostic,
} from "../core/contracts/capability-graph.js";
import type { Diagnostic } from "../core/validation/types.js";

const NonEmptySchema = z.string().trim().min(1);
const HexSha256Schema = z.string().regex(/^[0-9a-f]{64}$/, "manifest hash must be a lowercase SHA-256 hex string");
const RelativeSourcePathSchema = z.string().min(1).refine(isSafeRelativePath, "must be a safe relative POSIX path");

export const CAPABILITY_REGISTRY_SCHEMA_VERSION = "1" as const;
export const CAPABILITY_REGISTRY_FILENAME = "registry.json" as const;

export const CapabilityRegistryEntrySchema = z.strictObject({
  capability_id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."), "ID cannot contain '..'"),
  source_path: RelativeSourcePathSchema,
  manifest_sha256: HexSha256Schema,
});

export const CapabilityRegistrySchema = z.strictObject({
  schema_version: z.literal(CAPABILITY_REGISTRY_SCHEMA_VERSION),
  registry_version: NonEmptySchema,
  capabilities: z.array(CapabilityRegistryEntrySchema),
});

export type CapabilityRegistry = z.infer<typeof CapabilityRegistrySchema>;
export type CapabilityRegistryEntry = CapabilityRegistry["capabilities"][number];

export interface RegisteredCapability {
  entry: CapabilityRegistryEntry;
  manifest: CapabilityManifest;
  packageRoot: string;
  manifestPath: string;
  manifestSha256: string;
  files: readonly string[];
}

export interface LoadedCapabilityRegistry {
  root: string;
  registryPath: string;
  registry: CapabilityRegistry;
  capabilities: ReadonlyMap<string, RegisteredCapability>;
  diagnostics: readonly Diagnostic[];
}

export interface CapabilityRegistryResolutionOptions {
  /** When provided, every input/output `schema_ref` must resolve in this set. */
  knownSchemaIds?: ReadonlySet<string>;
  /** When provided, provenance extraction artifact IDs must resolve in this set. */
  extractionArtifactIds?: ReadonlySet<string>;
}

export class CapabilityRegistryError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "CapabilityRegistryError";
  }
}

export const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const CAPABILITY_ROOT = path.join(PACKAGE_ROOT, "skills/capabilities");

export async function loadCapabilityRegistry(
  capabilityRoot = CAPABILITY_ROOT,
  options: CapabilityRegistryResolutionOptions = {},
): Promise<LoadedCapabilityRegistry> {
  const registryPath = path.join(capabilityRoot, CAPABILITY_REGISTRY_FILENAME);
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
  } catch (error) {
    throw new CapabilityRegistryError([fatal("capability_registry_unreadable", `Cannot read capability registry: ${error instanceof Error ? error.message : String(error)}`, registryPath)]);
  }
  return validateCapabilityRegistry(raw, capabilityRoot, registryPath, options);
}

export async function validateCapabilityRegistry(
  raw: unknown,
  capabilityRoot: string,
  registryPath = path.join(capabilityRoot, CAPABILITY_REGISTRY_FILENAME),
  options: CapabilityRegistryResolutionOptions = {},
): Promise<LoadedCapabilityRegistry> {
  const parsed = CapabilityRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    throw new CapabilityRegistryError(parsed.error.issues.map((issue) => fatal("capability_registry_invalid", `Invalid capability registry at ${issue.path.join(".") || "root"}: ${issue.message}`, registryPath, issue)));
  }

  const registry = parsed.data;
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  uniqueIds(registry.capabilities.map((entry) => entry.capability_id), "capability", errors, registryPath);

  const capabilities = new Map<string, RegisteredCapability>();
  for (const [index, entry] of registry.capabilities.entries()) {
    const packageRoot = path.join(capabilityRoot, ...entry.source_path.split("/"));
    const manifestPath = path.join(packageRoot, "manifest.yaml");
    const basePath = ["capabilities", index];
    let manifestText: string | undefined;
    try {
      manifestText = await readFile(manifestPath, "utf8");
    } catch {
      errors.push(fatal("capability_manifest_missing", `Capability ${entry.capability_id} is missing manifest.yaml.`, manifestPath));
      continue;
    }
    const manifestSha256 = createHash("sha256").update(manifestText, "utf8").digest("hex");
    if (manifestSha256 !== entry.manifest_sha256) {
      errors.push(fatal("capability_manifest_hash_mismatch", `Capability ${entry.capability_id} manifest hash does not match the registry.`, manifestPath, { expected: entry.manifest_sha256, actual: manifestSha256 }));
    }

    let manifestValue: unknown;
    try {
      manifestValue = parse(manifestText) as unknown;
    } catch (error) {
      errors.push(fatal("capability_manifest_invalid", `Cannot parse manifest.yaml for ${entry.capability_id}: ${error instanceof Error ? error.message : String(error)}`, manifestPath));
      continue;
    }
    const manifestResult = CapabilityManifestSchema.safeParse(manifestValue);
    if (!manifestResult.success) {
      errors.push(...manifestResult.error.issues.map((issue) => fatal("capability_manifest_invalid", `Invalid manifest for ${entry.capability_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, manifestPath, issue)));
      continue;
    }
    const manifest = manifestResult.data;
    if (manifest.capability_id !== entry.capability_id) {
      errors.push(fatal("capability_manifest_id_mismatch", `Capability ${entry.capability_id} manifest declares ${manifest.capability_id}.`, manifestPath));
    }

    const skillPath = path.join(packageRoot, "SKILL.md");
    let skillText = "";
    try {
      skillText = await readFile(skillPath, "utf8");
    } catch {
      errors.push(fatal("capability_skill_missing", `Capability ${entry.capability_id} is missing SKILL.md.`, skillPath));
    }
    if (skillText && skillText.trim().length === 0) {
      errors.push(fatal("capability_skill_empty", `Capability ${entry.capability_id} SKILL.md is empty.`, skillPath));
    }

    for (const knowledge of manifest.knowledge_refs) {
      const knowledgePath = path.join(packageRoot, ...knowledge.path.split("/"));
      let knowledgeText: string;
      try {
        knowledgeText = await readFile(knowledgePath, "utf8");
      } catch {
        errors.push(fatal("capability_knowledge_missing", `Capability ${entry.capability_id} references missing knowledge file ${knowledge.path}.`, knowledgePath));
        continue;
      }
      const knowledgeHash = createHash("sha256").update(knowledgeText, "utf8").digest("hex");
      if (knowledgeHash !== knowledge.content_hash) {
        errors.push(fatal("capability_knowledge_hash_mismatch", `Capability ${entry.capability_id} knowledge file ${knowledge.path} hash does not match the manifest.`, knowledgePath, { expected: knowledge.content_hash, actual: knowledgeHash }));
      }
    }

    if (options.knownSchemaIds) {
      for (const [roleIndex, role] of [...manifest.inputs.map((item) => item as { role: string; schema_ref: string }), ...manifest.outputs].entries()) {
        if (!options.knownSchemaIds.has(role.schema_ref)) {
          errors.push(fatal("capability_schema_ref_unknown", `Capability ${entry.capability_id} role ${role.role} references unknown schema ${role.schema_ref}.`, manifestPath, { path: [...basePath, "roles", roleIndex], role: role.role, schema_ref: role.schema_ref }));
        }
      }
    }

    if (manifest.provenance.origin === "ars-derived") {
      const artifactIds = manifest.provenance.extraction_artifact_ids ?? [];
      if (artifactIds.length === 0) {
        errors.push(fatal("capability_provenance_artifacts_required", `ARS-derived capability ${entry.capability_id} must reference extraction artifacts.`, manifestPath));
      } else if (options.extractionArtifactIds) {
        for (const artifactId of artifactIds) {
          if (!options.extractionArtifactIds.has(artifactId)) {
            errors.push(fatal("capability_provenance_artifact_unknown", `Capability ${entry.capability_id} references unknown extraction artifact ${artifactId}.`, manifestPath, { artifact_id: artifactId }));
          }
        }
      }
    }

    const files = [manifestPath, skillPath, ...manifest.knowledge_refs.map((item) => path.join(packageRoot, ...item.path.split("/")))];
    capabilities.set(entry.capability_id, { entry, manifest, packageRoot, manifestPath, manifestSha256, files });
  }

  if (errors.length > 0) throw new CapabilityRegistryError(errors);
  return {
    root: capabilityRoot,
    registryPath,
    registry,
    capabilities,
    diagnostics: warnings,
  };
}

export function capabilityIds(loaded: LoadedCapabilityRegistry): Set<string> {
  return new Set(loaded.capabilities.keys());
}

export function validateGraphAgainstCapabilityRegistry(
  loaded: LoadedCapabilityRegistry,
  profile: CapabilityGraphProfile,
): CapabilityGraphDiagnostic[] {
  const diagnostics = validateGraphCapabilityReferences(profile, capabilityIds(loaded));
  if (profile.capability_registry_version !== loaded.registry.registry_version) {
    diagnostics.push({
      path: "capability_registry_version",
      message: `Graph profile expects capability registry ${profile.capability_registry_version}; loaded registry is ${loaded.registry.registry_version}.`,
    });
  }
  return diagnostics;
}

function uniqueIds(values: readonly string[], label: string, errors: Diagnostic[], registryPath: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) errors.push(fatal("capability_registry_id_duplicate", `Duplicate ${label} ID: ${value}`, registryPath, { capability_id: value }));
    seen.add(value);
  }
}

function isSafeRelativePath(value: string): boolean {
  if (value.includes("\\") || value.startsWith("/") || value.includes("\0")) return false;
  return value.split("/").every((segment) => Boolean(segment) && segment !== "." && segment !== "..");
}

function fatal(code: string, message: string, filePath: string, details?: unknown): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true, ...(details === undefined ? {} : { details }) };
}
