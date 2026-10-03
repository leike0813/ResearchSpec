#!/usr/bin/env node
import path from "node:path";
import { mkdtemp, readFile, readdir, realpath, rm, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

import type { AuthoringOptions, CapabilityAuthoringSource } from "../../arsu-converter/authoring/author.js";
import { authorCapabilityPackage } from "../../arsu-converter/authoring/author.js";
import {
  PATENT_AUTHORING_OPTIONS,
  PATENT_AUTHORING_SOURCES,
  assertRuntimeAssetGroups,
  assertRuntimeAssetsPresent,
  buildPatentAuthoringSources,
} from "./capabilities.js";
import type { RuntimeAssetGroups } from "./capabilities.js";

export const DEFAULT_PATENT_OUTPUT_ROOT = "skills/capabilities";

const HELP = [
  "ResearchSpec patent-disclosure-skill vendor converter",
  "",
  "Usage:",
  "  node dist/src/vendor-converters/patent-disclosure-skill/cli.js author [outputRoot] [--dry-run] [--json]",
  "  node dist/src/vendor-converters/patent-disclosure-skill/cli.js check [shippedRoot] [--repo <dir>] [--json]",
  "  node dist/src/vendor-converters/patent-disclosure-skill/cli.js idempotence [--json]",
  "",
].join("\n");

export interface PatentAuthoringEntry {
  capability_id: string;
  files: string[];
  registry_version: string;
}

export interface PatentAuthoringReport {
  schema_version: "1";
  output_root: string;
  dry_run: boolean;
  capabilities: PatentAuthoringEntry[];
}

export interface PatentCheckResult {
  ok: boolean;
  errors: string[];
  drift_paths: string[];
}

export interface RegistryEntry {
  capability_id: string;
  source_path: string;
  manifest_sha256: string;
}

/** Overrides used by tests and dry runs; production uses the checked-in manifest. */
export interface PatentAuthoringContext {
  extractionIndexPath?: string;
  groups?: RuntimeAssetGroups;
}

function resolveSources(context: PatentAuthoringContext, requireAssets: boolean): CapabilityAuthoringSource[] {
  if (context.groups) {
    if (requireAssets) assertRuntimeAssetGroups(context.groups);
    return buildPatentAuthoringSources(context.groups);
  }
  if (requireAssets) assertRuntimeAssetsPresent();
  return [...PATENT_AUTHORING_SOURCES];
}

function resolveOptions(context: PatentAuthoringContext): AuthoringOptions {
  return context.extractionIndexPath === undefined
    ? PATENT_AUTHORING_OPTIONS
    : { ...PATENT_AUTHORING_OPTIONS, extractionIndexPath: context.extractionIndexPath };
}

export async function generatePatentPackages(outputRoot: string, context: PatentAuthoringContext = {}): Promise<PatentAuthoringEntry[]> {
  const sources = resolveSources(context, true);
  const options = resolveOptions(context);
  const results: PatentAuthoringEntry[] = [];
  for (const source of sources) {
    const previous = await readManifestResourcePaths(path.join(outputRoot, source.capability_id, "manifest.yaml"));
    for (const resource of previous) await assertOwnedResourceUnchanged(path.join(outputRoot, source.capability_id), resource);
    const result = await authorCapabilityPackage(outputRoot, source, options);
    await reconcilePackageResources(outputRoot, source.capability_id, previous, result.files);
    results.push({ capability_id: result.capability_id, files: result.files, registry_version: result.registry_version });
  }
  return results;
}

interface OwnedResource { path: string; content_hash: string }

async function readManifestResourcePaths(manifestPath: string): Promise<OwnedResource[]> {
  let text: string;
  try {
    text = await readFile(manifestPath, "utf8");
  } catch {
    return [];
  }
  const parsed: unknown = parse(text);
  if (!isRecord(parsed) || !Array.isArray(parsed["knowledge_refs"])) return [];
  const paths: OwnedResource[] = [];
  for (const ref of parsed["knowledge_refs"]) {
    if (isRecord(ref) && typeof ref["path"] === "string" && typeof ref["content_hash"] === "string") {
      paths.push({ path: ref["path"], content_hash: ref["content_hash"] });
    }
  }
  return paths;
}

async function reconcilePackageResources(outputRoot: string, capabilityId: string, previousPaths: OwnedResource[], producedFiles: string[]): Promise<void> {
  const packageRoot = path.join(outputRoot, capabilityId);
  const produced = new Set(producedFiles);
  for (const resource of previousPaths) {
    const relative = resource.path;
    if (produced.has(relative)) continue;
    if (await assertOwnedResourceUnchanged(packageRoot, resource)) await unlink(path.join(packageRoot, relative));
  }
}

async function assertOwnedResourceUnchanged(packageRoot: string, resource: OwnedResource): Promise<boolean> {
  const relative = resource.path;
  const segments = relative.split("/");
  if (path.isAbsolute(relative) || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new Error(`Invalid owned resource path: ${relative}`);
  }
  const target = path.join(packageRoot, ...segments);
  const resolved = await realpath(target).catch(() => undefined);
  if (resolved === undefined) return false;
  if (path.relative(await realpath(packageRoot), resolved).startsWith("..")) throw new Error(`Resource escapes its package: ${relative}`);
  if (createHash("sha256").update(await readFile(target)).digest("hex") !== resource.content_hash) {
    throw new Error(`Previously generated resource has local edits: ${path.basename(packageRoot)}/${relative}`);
  }
  return true;
}

export async function runPatentAuthoring(
  outputRoot: string = DEFAULT_PATENT_OUTPUT_ROOT,
  options: { dryRun?: boolean } & PatentAuthoringContext = {},
): Promise<PatentAuthoringReport> {
  const dryRun = options.dryRun ?? false;
  const sources = resolveSources(options, !dryRun);
  const capabilities = dryRun
    ? sources.map((source) => ({ capability_id: source.capability_id, files: [] as string[], registry_version: "dry-run" }))
    : await generatePatentPackages(path.resolve(outputRoot), options);
  return { schema_version: "1", output_root: outputRoot, dry_run: dryRun, capabilities };
}

export async function checkPatentOutput(
  repoRoot: string = process.cwd(),
  shippedRoot: string = DEFAULT_PATENT_OUTPUT_ROOT,
  context: PatentAuthoringContext = {},
): Promise<PatentCheckResult> {
  const sources = resolveSources(context, true);
  const temp = await mkdtemp(path.join(tmpdir(), "researchspec-patent-check-"));
  try {
    await generatePatentPackages(temp, context);
    const errors: string[] = [];
    for (const source of sources) {
      await compareTrees(path.join(temp, source.capability_id), path.join(repoRoot, shippedRoot, source.capability_id), source.capability_id, errors);
    }
    const generatedRegistry = await readRegistryEntries(path.join(temp, "registry.json"));
    const shippedRegistry = await readRegistryEntries(path.join(repoRoot, shippedRoot, "registry.json"));
    for (const source of sources) {
      const generated = generatedRegistry.get(source.capability_id);
      const shipped = shippedRegistry.get(source.capability_id);
      if (!generated) {
        errors.push(source.capability_id + ": generated registry entry is missing");
        continue;
      }
      if (!shipped) {
        errors.push(source.capability_id + ": shipped registry entry is missing");
        continue;
      }
      if (generated.manifest_sha256 !== shipped.manifest_sha256) errors.push(source.capability_id + ": registry manifest_sha256 drift");
      if (generated.source_path !== shipped.source_path) errors.push(source.capability_id + ": registry source_path drift");
    }
    return { ok: errors.length === 0, errors, drift_paths: errors.slice() };
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

export async function checkPatentIdempotence(context: PatentAuthoringContext = {}): Promise<PatentCheckResult> {
  const sources = resolveSources(context, true);
  const first = await mkdtemp(path.join(tmpdir(), "researchspec-patent-idempotence-a-"));
  const second = await mkdtemp(path.join(tmpdir(), "researchspec-patent-idempotence-b-"));
  try {
    await generatePatentPackages(first, context);
    await generatePatentPackages(second, context);
    const errors: string[] = [];
    for (const source of sources) {
      await compareTrees(path.join(first, source.capability_id), path.join(second, source.capability_id), source.capability_id, errors);
    }
    const firstRegistry = await readFile(path.join(first, "registry.json"), "utf8");
    const secondRegistry = await readFile(path.join(second, "registry.json"), "utf8");
    if (firstRegistry !== secondRegistry) errors.push("registry.json differs between generation passes");
    return { ok: errors.length === 0, errors, drift_paths: errors.slice() };
  } finally {
    await rm(first, { recursive: true, force: true });
    await rm(second, { recursive: true, force: true });
  }
}

async function compareTrees(generatedRoot: string, referenceRoot: string, label: string, errors: string[]): Promise<void> {
  const generated = await listFiles(generatedRoot);
  const reference = await listFiles(referenceRoot);
  if (!generated) {
    errors.push(label + ": generated package is missing");
    return;
  }
  if (!reference) {
    errors.push(label + ": reference package is missing");
    return;
  }
  for (const relative of generated) {
    const referenceBytes = await readFileOrUndefined(path.join(referenceRoot, ...relative.split("/")));
    if (!referenceBytes) {
      errors.push(label + ": file missing from reference: " + relative);
      continue;
    }
    const generatedBytes = await readFile(path.join(generatedRoot, ...relative.split("/")));
    if (!generatedBytes.equals(referenceBytes)) errors.push(label + ": byte drift at " + relative);
  }
  for (const relative of reference) {
    if (!generated.includes(relative)) errors.push(label + ": unexpected reference file: " + relative);
  }
}

async function listFiles(root: string): Promise<string[] | undefined> {
  let entries: Dirent[];
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return undefined;
  }
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = await listFiles(path.join(root, entry.name));
      if (!nested) continue;
      for (const relative of nested) files.push(entry.name + "/" + relative);
    } else if (entry.isFile()) {
      files.push(entry.name);
    }
  }
  return files.sort();
}

async function readFileOrUndefined(filePath: string): Promise<Buffer | undefined> {
  try {
    return await readFile(filePath);
  } catch {
    return undefined;
  }
}

async function readRegistryEntries(registryPath: string): Promise<Map<string, RegistryEntry>> {
  const entries = new Map<string, RegistryEntry>();
  const raw = await readFile(registryPath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || !Array.isArray(parsed["capabilities"])) return entries;
  for (const item of parsed["capabilities"]) {
    if (!isRecord(item)) continue;
    const capabilityId = item["capability_id"];
    const sourcePath = item["source_path"];
    const manifestSha = item["manifest_sha256"];
    if (typeof capabilityId === "string" && typeof sourcePath === "string" && typeof manifestSha === "string") {
      entries.set(capabilityId, { capability_id: capabilityId, source_path: sourcePath, manifest_sha256: manifestSha });
    }
  }
  return entries;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function emit(json: boolean, value: unknown, message: string): void {
  process.stdout.write(json ? JSON.stringify(value, null, 2) + "\n" : message);
}

export interface PatentCliArgs {
  command: string;
  positional: string[];
  json: boolean;
  dryRun: boolean;
  repoRoot?: string;
}

export function parsePatentArgs(argv: string[]): PatentCliArgs {
  const commands = new Set(["author", "check", "idempotence"]);
  const valueFlags = new Set(["--repo"]);
  let command = "author";
  let repoRoot: string | undefined;
  const positional: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === undefined) continue;
    if (valueFlags.has(argument)) {
      repoRoot = argv[index + 1];
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) continue;
    if (commands.has(argument)) {
      command = argument;
      continue;
    }
    positional.push(argument);
  }
  return { command, positional, json: argv.includes("--json"), dryRun: argv.includes("--dry-run"), repoRoot };
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const { command, positional, json, dryRun, repoRoot } = parsePatentArgs(argv);
  if (command === "author") {
    const outputRoot = positional[0] ?? DEFAULT_PATENT_OUTPUT_ROOT;
    const report = await runPatentAuthoring(outputRoot, { dryRun });
    emit(json, report, "Authored " + String(report.capabilities.length) + " patent capabilities into " + report.output_root + ".\n");
    return;
  }
  if (command === "check") {
    const shippedRoot = positional[0] ?? DEFAULT_PATENT_OUTPUT_ROOT;
    const result = await checkPatentOutput(repoRoot ?? process.cwd(), shippedRoot);
    emit(json, result, result.ok ? "Patent generated output check passed.\n" : result.errors.join("\n") + "\n");
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (command === "idempotence") {
    const result = await checkPatentIdempotence();
    emit(json, result, result.ok ? "Patent generated output is idempotent.\n" : result.drift_paths.join("\n") + "\n");
    if (!result.ok) process.exitCode = 1;
    return;
  }
  process.stderr.write(HELP);
  process.exitCode = 1;
}

const invokedPath = process.argv[1];
if (invokedPath !== undefined && fileURLToPath(import.meta.url) === path.resolve(invokedPath)) {
  main().catch((error: unknown) => {
    process.stderr.write((error instanceof Error ? error.message : String(error)) + "\n");
    process.exitCode = 1;
  });
}
