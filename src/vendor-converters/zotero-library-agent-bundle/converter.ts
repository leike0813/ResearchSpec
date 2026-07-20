import { execFile } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { sha256 } from "../../core/workspace/write-plan.js";
import { loadZoteroBundleAudit, renderZoteroBundleAuditReport, type ZoteroBundleAudit } from "../../vendor-audits/zotero-library-agent-bundle.js";

const execFileAsync = promisify(execFile);
const SOURCE_PATH = "vendor/zotero-library-agent-bundle";
const OUTPUT_PATH = "literature-adapters/zotero";
const AUDIT_REPORT_PATH = "audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a/report.md";
const LICENSE_PATH = "LICENSES/AGPL-3.0.txt";

export interface ZoteroConversionManifest {
  schema_version: "1";
  converter_version: "1";
  adapter_id: "zotero-library";
  release_set_id: string;
  bundle_revision: string;
  bundle_tree: string;
  source_commit: string;
  audit_sha256: string;
  audit_included_tree_sha256: string;
  protocol: string;
  cli_schema: string;
  versions: { bundle: string; cli: string; skills: Record<string, string> };
  build_fingerprint: string;
  command_catalog_checksum: string;
  binary_aggregate_sha256: string;
  generated_skill_ids: ["zotero-library-agent", "zotero-bridge-cli"];
  runtime_platforms: string[];
  generated_file_dispositions: Array<{ path: string; sha256: string; bytes: number; executable: boolean }>;
}

export interface ConvertZoteroOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function convertZoteroBundle(options: ConvertZoteroOptions): Promise<ZoteroConversionManifest> {
  const repoRoot = path.resolve(options.repoRoot);
  const sourceRoot = path.join(repoRoot, SOURCE_PATH);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, OUTPUT_PATH));
  const audit = await validateZoteroSource(repoRoot, sourceRoot);
  const stage = await mkdtemp(path.join(tmpdir(), "researchspec-zotero-adapter-"));
  try {
    const manifest = await generateZoteroTree(repoRoot, sourceRoot, stage, audit);
    if (options.dryRun) return manifest;
    const drift = await directoryDiff(stage, outputRoot);
    if (!options.force && await pathExists(outputRoot) && drift.length) {
      throw new Error("Zotero adapter generated output has drift; run with --force after reviewing the admitted source and converter diff.");
    }
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(path.dirname(outputRoot), { recursive: true });
    await cp(stage, outputRoot, { recursive: true, preserveTimestamps: false });
    return manifest;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

export async function checkZoteroOutput(repoRoot: string): Promise<{ ok: boolean; errors: string[]; warnings: string[] }> {
  const root = path.resolve(repoRoot);
  const errors: string[] = [];
  try {
    const audit = await validateZoteroSource(root, path.join(root, SOURCE_PATH));
    const stage = await mkdtemp(path.join(tmpdir(), "researchspec-zotero-check-"));
    try {
      await generateZoteroTree(root, path.join(root, SOURCE_PATH), stage, audit);
      errors.push(...await directoryDiff(stage, path.join(root, OUTPUT_PATH)));
    } finally {
      await rm(stage, { recursive: true, force: true });
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export async function checkZoteroIdempotence(repoRoot: string): Promise<{ ok: boolean; drift_paths: string[] }> {
  const root = path.resolve(repoRoot);
  const audit = await validateZoteroSource(root, path.join(root, SOURCE_PATH));
  const left = await mkdtemp(path.join(tmpdir(), "researchspec-zotero-idempotence-a-"));
  const right = await mkdtemp(path.join(tmpdir(), "researchspec-zotero-idempotence-b-"));
  try {
    await generateZoteroTree(root, path.join(root, SOURCE_PATH), left, audit);
    await generateZoteroTree(root, path.join(root, SOURCE_PATH), right, audit);
    const repeated = await directoryDiff(left, right);
    const committed = await directoryDiff(left, path.join(root, OUTPUT_PATH));
    return { ok: repeated.length === 0 && committed.length === 0, drift_paths: [...new Set([...repeated, ...committed])].sort(compareText) };
  } finally {
    await rm(left, { recursive: true, force: true });
    await rm(right, { recursive: true, force: true });
  }
}

async function validateZoteroSource(repoRoot: string, sourceRoot: string): Promise<ZoteroBundleAudit> {
  const auditPath = path.join(repoRoot, "audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a/bundle-audit.json");
  const auditBytes = await readFile(auditPath);
  const audit = await loadZoteroBundleAudit(repoRoot);
  const { stdout: revision } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  const { stdout: tree } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD^{tree}"]);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain"]);
  const { stdout: listed } = await execFileAsync("git", ["-C", sourceRoot, "ls-files"]);
  if (revision.trim() !== audit.source.revision) throw new Error(`Zotero bundle revision differs from audit: ${revision.trim()}`);
  if (tree.trim() !== audit.source.tree) throw new Error(`Zotero bundle tree differs from audit: ${tree.trim()}`);
  if (status.trim()) throw new Error("Zotero bundle checkout must be clean before conversion.");
  const actualPaths = listed.trim().split("\n").filter(Boolean).sort(compareText);
  const auditedPaths = audit.files.map((file) => file.path);
  if (!sameArray(actualPaths, auditedPaths)) throw new Error("Zotero bundle tracked-file set differs from the immutable audit.");
  for (const file of audit.files) {
    const bytes = await readFile(path.join(sourceRoot, file.path));
    if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw new Error(`Zotero bundle file differs from audit: ${file.path}`);
  }
  const trackedHash = aggregateFileEntries(audit.files);
  const includedHash = aggregateFileEntries(audit.files.filter((file) => file.disposition === "included"));
  if (trackedHash !== audit.tracked_tree_sha256 || includedHash !== audit.included_tree_sha256) throw new Error("Zotero bundle audit aggregate hashes are invalid.");
  const upstreamManifest = JSON.parse(await readFile(path.join(sourceRoot, "manifest.json"), "utf8")) as Record<string, unknown>;
  validateUpstreamIdentity(upstreamManifest, audit);
  const license = await readFile(path.join(repoRoot, LICENSE_PATH));
  if (sha256(license) !== audit.license.source_sha256) throw new Error("Zotero source license differs from the admitted source commit.");
  const report = await readFile(path.join(repoRoot, AUDIT_REPORT_PATH), "utf8");
  if (report !== renderZoteroBundleAuditReport(audit)) throw new Error("Zotero audit report differs from the immutable audit.");
  if (sha256(auditBytes).length !== 64) throw new Error("Zotero audit bytes could not be hashed.");
  return audit;
}

function validateUpstreamIdentity(value: Record<string, unknown>, audit: ZoteroBundleAudit): void {
  const releaseSet = record(value.releaseSet);
  const cli = record(releaseSet.cli);
  const surfaces = record(releaseSet.surfaces);
  const libraryAgent = record(surfaces.libraryAgent);
  const cliBundle = record(surfaces.cliBundle);
  if (value.releaseSetId !== audit.source.release_set_id || value.sourceCommit !== audit.source.source_commit) throw new Error("Zotero upstream manifest release-set identity differs from audit.");
  if (releaseSet.protocol !== audit.identity.protocol || releaseSet.cliSchema !== audit.identity.cli_schema) throw new Error("Zotero upstream protocol or CLI schema differs from audit.");
  if (cli.version !== audit.identity.cli_version || cli.buildFingerprint !== audit.identity.build_fingerprint || cli.commandCatalogChecksum !== audit.identity.command_catalog_checksum || cli.binaryAggregateSha256 !== audit.identity.binary_aggregate_sha256) {
    throw new Error("Zotero CLI component identity differs from audit.");
  }
  if (libraryAgent.version !== audit.identity.skill_versions["zotero-library-agent"] || cliBundle.version !== audit.identity.skill_versions["zotero-bridge-cli"]) {
    throw new Error("Zotero Skill component identity differs from audit.");
  }
  const actualRuntimes = Array.isArray(cli.binaries) ? cli.binaries.map(record) : [];
  for (const runtime of audit.identity.runtimes) {
    const actual = actualRuntimes.find((candidate) => candidate.platform === runtime.platform);
    if (!actual || actual.binary !== runtime.binary || actual.sha256 !== runtime.sha256 || actual.bytes !== runtime.bytes) throw new Error(`Zotero runtime identity differs from audit: ${runtime.platform}`);
  }
  // Bundle, CLI, and Skill component versions are intentionally not compared with one another.
}

async function generateZoteroTree(repoRoot: string, sourceRoot: string, outputRoot: string, audit: ZoteroBundleAudit): Promise<ZoteroConversionManifest> {
  const license = await readFile(path.join(repoRoot, LICENSE_PATH));
  for (const entry of audit.files.filter((file) => file.disposition === "included")) {
    const targetPath = outputPathFor(entry.path);
    const source = await readFile(path.join(sourceRoot, entry.path));
    const content = adaptIncludedFile(entry.path, source);
    await writeGeneratedFile(path.join(outputRoot, targetPath), content, entry.path.startsWith("bin/") && !entry.path.endsWith(".sha256"));
  }
  await writeGeneratedFile(path.join(outputRoot, "profile.template.json"), await readFile(path.join(sourceRoot, "skills/zotero-bridge-cli/assets/profile.template.json")), false);

  const notice = renderNotice(audit);
  const derivation = renderDerivation(audit);
  await writeGeneratedFile(path.join(outputRoot, "LICENSE"), license, false);
  await writeGeneratedFile(path.join(outputRoot, "NOTICE.md"), notice, false);
  await writeGeneratedFile(path.join(outputRoot, "DERIVATION.json"), derivation, false);
  for (const skillId of ["zotero-library-agent", "zotero-bridge-cli"] as const) {
    const skillRoot = path.join(outputRoot, "skills", skillId);
    await writeGeneratedFile(path.join(skillRoot, "LICENSE"), license, false);
    await writeGeneratedFile(path.join(skillRoot, "NOTICE.md"), notice, false);
    await writeGeneratedFile(path.join(skillRoot, "DERIVATION.json"), `${JSON.stringify({ ...JSON.parse(derivation) as object, generated_skill_id: skillId }, null, 2)}\n`, false);
  }

  const generatedFiles = await fileInventory(outputRoot);
  const auditBytes = await readFile(path.join(repoRoot, "audits/zotero-library-agent-bundle/hbrs-3d834c0f075f3122ac566e9a/bundle-audit.json"));
  const manifest: ZoteroConversionManifest = {
    schema_version: "1",
    converter_version: "1",
    adapter_id: "zotero-library",
    release_set_id: audit.source.release_set_id,
    bundle_revision: audit.source.revision,
    bundle_tree: audit.source.tree,
    source_commit: audit.source.source_commit,
    audit_sha256: sha256(auditBytes),
    audit_included_tree_sha256: audit.included_tree_sha256,
    protocol: audit.identity.protocol,
    cli_schema: audit.identity.cli_schema,
    versions: { bundle: audit.identity.bundle_version, cli: audit.identity.cli_version, skills: audit.identity.skill_versions },
    build_fingerprint: audit.identity.build_fingerprint,
    command_catalog_checksum: audit.identity.command_catalog_checksum,
    binary_aggregate_sha256: audit.identity.binary_aggregate_sha256,
    generated_skill_ids: ["zotero-library-agent", "zotero-bridge-cli"],
    runtime_platforms: audit.identity.runtimes.map((runtime) => runtime.platform),
    generated_file_dispositions: generatedFiles,
  };
  await writeGeneratedFile(path.join(outputRoot, "conversion-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, false);
  await writeGeneratedFile(path.join(outputRoot, "conversion-report.md"), renderConversionReport(manifest), false);
  return manifest;
}

function adaptIncludedFile(sourcePath: string, bytes: Uint8Array): Uint8Array | string {
  if (sourcePath === "skills/zotero-library-agent/assets/bundle-manifest-source.json") {
    const value = JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown;
    return `${JSON.stringify(filterExcludedArrayValues(value), null, 2)}\n`;
  }
  if (!sourcePath.endsWith(".md")) return bytes;
  let text = Buffer.from(bytes).toString("utf8");
  if (sourcePath === "skills/zotero-library-agent/SKILL.md") {
    text = text.replace(
      "- In interactive mode, use the runner's pending envelope only when a user decision is actually required; the final business result still follows `assets/output.schema.json`.",
      "- When a user decision is required, pause and ask for that decision. Return the normal Agent-native result after the decision; this packaged Skill has no generic runner or output-envelope contract.",
    );
  }
  if (sourcePath === "skills/zotero-bridge-cli/SKILL.md") {
    text = text.replace(
      "- Use the bundled installer only when the run-local shim and PATH command are unavailable.",
      "- Use the project-local runtime installed by ResearchSpec. If it is missing, stop and run `researchspec update`; do not invoke an upstream installer or modify PATH.",
    );
  }
  if (sourcePath.endsWith("references/host-bridge.md") || sourcePath.endsWith("references/host-bridge-cli.md")) {
    text = text.replace(
      /The published bundle includes[\s\S]*?\n\n## Resolver Payloads/,
      "ResearchSpec installs the reviewed current-platform runtime and `profile.template.json` inside the project. Use that project-local runtime; do not invoke an upstream installer, modify PATH, or write a real profile during ResearchSpec delivery. A user may explicitly configure `ZOTERO_BRIDGE_PROFILE`, `ZOTERO_BRIDGE_ENDPOINT`, `ZOTERO_BRIDGE_TOKEN`, `ZOTERO_BRIDGE_SCOPE`, and `ZOTERO_BRIDGE_CONNECTION_MODE`; never print token values.\n\n## Resolver Payloads",
    );
  }
  return text;
}

function filterExcludedArrayValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item !== "string" || !/(?:runner\.json|output\.schema\.json|agents\/openai\.yaml|install\.(?:sh|ps1))$/.test(item)).map(filterExcludedArrayValues);
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, filterExcludedArrayValues(child)]));
}

function outputPathFor(sourcePath: string): string {
  if (sourcePath === "manifest.json") return "assets/upstream-manifest.json";
  if (sourcePath === "cli-release.json") return "assets/cli-release.json";
  return sourcePath;
}

function renderNotice(audit: ZoteroBundleAudit): string {
  return `# Zotero Literature Adapter Notice\n\nThis distribution contains adapted material and native CLI binaries from [zotero-library-agent-bundle](${audit.source.repository}) at immutable tag \`${audit.source.immutable_tag}\`, bundle commit \`${audit.source.revision}\`, and source commit \`${audit.source.source_commit}\`.\n\nThe redistributed material is licensed under AGPL-3.0-only. ResearchSpec excludes the upstream installers, provider-specific Agent configuration, generic runners, and generic output schemas. ResearchSpec delivery does not execute the bundled binaries or helper.\n`;
}

function renderDerivation(audit: ZoteroBundleAudit): string {
  return `${JSON.stringify({
    schema_version: "1",
    adapter_id: "zotero-library",
    release_set_id: audit.source.release_set_id,
    upstream: {
      repository: audit.source.repository,
      immutable_tag: audit.source.immutable_tag,
      bundle_revision: audit.source.revision,
      bundle_tree: audit.source.tree,
      source_repository: audit.source.source_repository,
      source_commit: audit.source.source_commit,
    },
    audit_included_tree_sha256: audit.included_tree_sha256,
    license: audit.license,
    adaptations: [
      "removed upstream installer guidance",
      "removed generic runner and output-envelope guidance",
      "filtered excluded files from bundled manifest-source arrays",
      "added ResearchSpec project-local runtime guidance",
    ],
  }, null, 2)}\n`;
}

function renderConversionReport(manifest: ZoteroConversionManifest): string {
  return `# Zotero Literature Adapter Conversion\n\n- Release set: \`${manifest.release_set_id}\`\n- Bundle revision: \`${manifest.bundle_revision}\`\n- Source commit: \`${manifest.source_commit}\`\n- Protocol: \`${manifest.protocol}\`\n- CLI schema: \`${manifest.cli_schema}\`\n- Bundle version: \`${manifest.versions.bundle}\`\n- CLI version: \`${manifest.versions.cli}\`\n- Runtime platforms: ${String(manifest.runtime_platforms.length)}\n- Generated Skills: ${manifest.generated_skill_ids.map((id) => `\`${id}\``).join(", ")}\n- Generated files: ${String(manifest.generated_file_dispositions.length)}\n\nComponent versions are validated independently. Release-set, protocol, schema, build fingerprint, command catalog, and binary checksums define the admitted runtime identity. Conversion is deterministic and does not execute bundled programs or access Zotero.\n`;
}

async function writeGeneratedFile(filePath: string, content: string | Uint8Array, executable: boolean): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
  await chmod(filePath, executable ? 0o755 : 0o644);
}

async function fileInventory(root: string): Promise<ZoteroConversionManifest["generated_file_dispositions"]> {
  const files = await walkFiles(root);
  return Promise.all(files.map(async (filePath) => {
    const bytes = await readFile(filePath);
    const stat = await lstat(filePath);
    return { path: posix(path.relative(root, filePath)), sha256: sha256(bytes), bytes: bytes.length, executable: Boolean(stat.mode & 0o111) };
  }));
}

async function directoryDiff(expectedRoot: string, actualRoot: string): Promise<string[]> {
  if (!await pathExists(actualRoot)) return (await walkFiles(expectedRoot)).map((filePath) => posix(path.relative(expectedRoot, filePath)));
  const expected = await fileInventory(expectedRoot);
  const actual = await fileInventory(actualRoot);
  const expectedMap = new Map(expected.map((entry) => [entry.path, entry]));
  const actualMap = new Map(actual.map((entry) => [entry.path, entry]));
  const paths = [...new Set([...expectedMap.keys(), ...actualMap.keys()])].sort(compareText);
  return paths.filter((filePath) => {
    const left = expectedMap.get(filePath);
    const right = actualMap.get(filePath);
    return !left || !right || left.sha256 !== right.sha256 || left.executable !== right.executable;
  });
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort(compareText);
}

async function pathExists(target: string): Promise<boolean> {
  try { await lstat(target); return true; } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}

function aggregateFileEntries(entries: Array<{ path: string; sha256: string }>): string {
  return sha256(entries.map((entry) => `${entry.path}\0${entry.sha256}`).join("\n"));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function sameArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
