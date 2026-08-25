import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";

const options = parseArguments(process.argv.slice(2));
const root = path.resolve(options.root ?? process.cwd());
const catalogPath = resolveInsideRoot(root, options.catalog ?? "scripts/authored-whitespace-exemptions.json", "exemption catalog");

try {
  const exemptions = await loadVerifiedExemptions(root, catalogPath);
  const candidates = options.paths.length > 0 ? options.paths : changedPaths(root, options.base);
  const errors = [];

  for (const relativePath of uniqueSorted(candidates.map((candidate) => normalizeRelativePath(candidate, "candidate path")))) {
    const absolutePath = resolveInsideRoot(root, relativePath, "candidate path");
    const fileInfo = await statOrUndefined(absolutePath);
    if (!fileInfo?.isFile() || exemptions.has(relativePath)) continue;
    const bytes = await readFile(absolutePath);
    if (bytes.includes(0)) continue;
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      continue;
    }
    for (const [index, rawLine] of text.split("\n").entries()) {
      const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
      if (/[ \t]+$/.test(line)) errors.push(`${relativePath}:${String(index + 1)}: trailing whitespace`);
    }
  }

  if (errors.length > 0) throw new Error(errors.join("\n"));
  process.stdout.write(`OK authored whitespace (${String(candidates.length)} changed paths, ${String(exemptions.size)} verified exemptions)\n`);
} catch (error) {
  process.stderr.write(`Authored whitespace check failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

async function loadVerifiedExemptions(rootDirectory, exemptionCatalogPath) {
  const catalog = JSON.parse(await readFile(exemptionCatalogPath, "utf8"));
  if (catalog?.schema_version !== "1" || !Array.isArray(catalog.exemptions)) {
    throw new Error("exemption catalog must use schema 1 and contain an exemptions array");
  }

  const verified = new Set();
  const evidenceCache = new Map();
  for (const exemption of catalog.exemptions) {
    const relativePath = normalizeRelativePath(exemption?.path, "exemption path");
    if (verified.has(relativePath)) throw new Error(`duplicate exemption path: ${relativePath}`);
    if (exemption?.byte_preserved !== true) throw new Error(`exemption is not explicitly byte-preserved: ${relativePath}`);
    requireSha256(exemption?.sha256, `exemption hash for ${relativePath}`);

    const absolutePath = resolveInsideRoot(rootDirectory, relativePath, "exemption path");
    const bytes = await readFile(absolutePath);
    const actualHash = sha256(bytes);
    if (actualHash !== exemption.sha256) {
      throw new Error(`exemption hash mismatch for ${relativePath}: expected ${String(exemption.sha256)}, found ${actualHash}`);
    }

    const evidence = exemption?.evidence;
    const evidencePath = normalizeRelativePath(evidence?.catalog_path, `evidence catalog for ${relativePath}`);
    const artifactId = typeof evidence?.artifact_id === "string" && evidence.artifact_id.length > 0 ? evidence.artifact_id : undefined;
    const sourceHash = requireSha256(evidence?.source_sha256, `evidence source hash for ${relativePath}`);
    if (!artifactId) throw new Error(`evidence artifact_id is missing for ${relativePath}`);
    let evidenceCatalog = evidenceCache.get(evidencePath);
    if (!evidenceCatalog) {
      evidenceCatalog = JSON.parse(await readFile(resolveInsideRoot(rootDirectory, evidencePath, "evidence catalog"), "utf8"));
      evidenceCache.set(evidencePath, evidenceCatalog);
    }
    const artifact = Array.isArray(evidenceCatalog?.artifacts)
      ? evidenceCatalog.artifacts.find((candidate) => candidate?.artifact_id === artifactId)
      : undefined;
    if (!artifact) throw new Error(`evidence artifact ${artifactId} is missing for ${relativePath}`);
    const hashes = [artifact.sha256, artifact.verification?.expected_sha256, artifact.verification?.actual_sha256];
    if (artifact.verification?.status !== "pass" || hashes.some((hash) => hash !== sourceHash)) {
      throw new Error(`evidence artifact ${artifactId} is not a verified match for ${relativePath}`);
    }
    const explicitlyPreserved = Array.isArray(artifact.ledger)
      && artifact.ledger.some((entry) => typeof entry === "string" && /逐字节保留|byte[- ]preserved/i.test(entry));
    if (!explicitlyPreserved) throw new Error(`evidence artifact ${artifactId} is not explicitly byte-preserved`);
    verified.add(relativePath);
  }
  return verified;
}

function changedPaths(rootDirectory, base) {
  const paths = new Set();
  const diffArgs = base
    ? ["diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`]
    : ["diff", "--name-only", "--diff-filter=ACMR", "HEAD"];
  for (const value of runGit(rootDirectory, diffArgs)) paths.add(value);
  for (const value of runGit(rootDirectory, ["diff", "--name-only", "--diff-filter=ACMR"])) paths.add(value);
  for (const value of runGit(rootDirectory, ["diff", "--cached", "--name-only", "--diff-filter=ACMR"])) paths.add(value);
  for (const value of runGit(rootDirectory, ["ls-files", "--others", "--exclude-standard"])) paths.add(value);
  return uniqueSorted([...paths]);
}

function runGit(rootDirectory, args) {
  const result = spawnSync("git", args, { cwd: rootDirectory, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function parseArguments(args) {
  const parsed = { paths: [] };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!["--root", "--catalog", "--base", "--path"].includes(argument)) throw new Error(`unknown argument: ${String(argument)}`);
    const value = args[index + 1];
    if (!value) throw new Error(`missing value for ${argument}`);
    index += 1;
    if (argument === "--path") parsed.paths.push(value);
    else parsed[argument.slice(2)] = value;
  }
  return parsed;
}

function normalizeRelativePath(value, label) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\\") || path.posix.isAbsolute(value)) {
    throw new Error(`${label} must be a non-empty POSIX project-relative path`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === "." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error(`${label} escapes or is not normalized: ${value}`);
  }
  return normalized;
}

function resolveInsideRoot(rootDirectory, relativePath, label) {
  const normalized = normalizeRelativePath(path.isAbsolute(relativePath) ? path.relative(rootDirectory, relativePath).replaceAll("\\", "/") : relativePath, label);
  const absolute = path.resolve(rootDirectory, normalized);
  if (absolute !== rootDirectory && !absolute.startsWith(`${rootDirectory}${path.sep}`)) throw new Error(`${label} escapes the project root: ${relativePath}`);
  return absolute;
}

function requireSha256(value, label) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) throw new Error(`${label} must be a lowercase SHA-256`);
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function statOrUndefined(target) {
  try {
    return await stat(target);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}
