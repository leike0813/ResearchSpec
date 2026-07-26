import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { sha256 } from "../../core/workspace/write-plan.js";
import {
  checkZoteroBundleAudit,
  ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH,
  ZOTERO_BUNDLE_SOURCE_RELATIVE_PATH,
  type ZoteroBundleAudit,
} from "../../vendor-audits/zotero-library-agent-bundle.js";

const SOURCE_PATH = ZOTERO_BUNDLE_SOURCE_RELATIVE_PATH;
const OUTPUT_PATH = "literature-adapters/zotero";
const LICENSE_PATH = "LICENSES/AGPL-3.0.txt";

export interface ZoteroConversionManifest {
  schema_version: "1";
  converter_version: "2";
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
  generated_skill_ids: string[];
  opaque_runtime_metadata_assets: number;
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
  const audit = await checkZoteroBundleAudit(repoRoot);
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
    const audit = await checkZoteroBundleAudit(root);
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
  const audit = await checkZoteroBundleAudit(root);
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
  for (const skill of audit.skills) {
    const skillId = skill.skill_id;
    const skillRoot = path.join(outputRoot, "skills", skillId);
    await writeGeneratedFile(path.join(skillRoot, "LICENSE"), license, false);
    await writeGeneratedFile(path.join(skillRoot, "NOTICE.md"), notice, false);
    await writeGeneratedFile(path.join(skillRoot, "DERIVATION.json"), `${JSON.stringify({ ...JSON.parse(derivation) as object, generated_skill_id: skillId }, null, 2)}\n`, false);
  }

  const generatedFiles = await fileInventory(outputRoot);
  const auditBytes = await readFile(path.join(repoRoot, ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH));
  const manifest: ZoteroConversionManifest = {
    schema_version: "1",
    converter_version: "2",
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
    generated_skill_ids: audit.skills.map((skill) => skill.skill_id),
    opaque_runtime_metadata_assets: audit.opaque_runtime_metadata.length,
    runtime_platforms: audit.identity.runtimes.map((runtime) => runtime.platform),
    generated_file_dispositions: generatedFiles,
  };
  await writeGeneratedFile(path.join(outputRoot, "conversion-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, false);
  await writeGeneratedFile(path.join(outputRoot, "conversion-report.md"), renderConversionReport(manifest), false);
  return manifest;
}

function adaptIncludedFile(sourcePath: string, bytes: Uint8Array): Uint8Array | string {
  if (!sourcePath.endsWith(".md")) return bytes;
  let text = Buffer.from(bytes).toString("utf8");
  if (sourcePath === "skills/zotero-library-agent/SKILL.md") {
    text = text.replace(
      "Use the runner pending envelope only while a concrete user decision is required.",
      "A supported Agent host may use the preserved runner pending envelope only while a concrete user decision is required. ResearchSpec itself never executes or interprets that runner.",
    );
  }
  if (sourcePath === "skills/zotero-bridge-cli/SKILL.md") {
    text = text.replace(
      "Prefer a run-local shim supplied with the current workspace. Otherwise use the installed executable. Use the bundled installer only when neither exists.",
      "Use the project-local runtime installed by ResearchSpec. If it is missing, stop and run `researchspec update`; do not invoke an upstream installer or modify PATH.",
    );
  }
  return text;
}

function outputPathFor(sourcePath: string): string {
  if (sourcePath === "manifest.json") return "assets/upstream-manifest.json";
  if (sourcePath === "cli-release.json") return "assets/cli-release.json";
  return sourcePath;
}

function renderNotice(audit: ZoteroBundleAudit): string {
  return `# Zotero Literature Adapter Notice\n\nThis distribution contains adapted material and native CLI binaries from [zotero-library-agent-bundle](${audit.source.repository}) at immutable tag \`${audit.source.immutable_tag}\`, bundle commit \`${audit.source.revision}\`, and source commit \`${audit.source.source_commit}\`.\n\nThe redistributed material is licensed under AGPL-3.0-only. ResearchSpec excludes the upstream installers and provider-specific Agent configuration. The seven runner files and seven output schemas are preserved as opaque upstream runtime metadata. ResearchSpec delivery does not execute bundled binaries, runners, or output schemas.\n`;
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
      "added ResearchSpec project-local runtime guidance",
      "preserved reviewed runner and output schema bytes as opaque runtime metadata",
    ],
  }, null, 2)}\n`;
}

function renderConversionReport(manifest: ZoteroConversionManifest): string {
  return `# Zotero Literature Adapter Conversion\n\n- Release set: \`${manifest.release_set_id}\`\n- Bundle revision: \`${manifest.bundle_revision}\`\n- Source commit: \`${manifest.source_commit}\`\n- Protocol: \`${manifest.protocol}\`\n- CLI schema: \`${manifest.cli_schema}\`\n- Bundle version: \`${manifest.versions.bundle}\`\n- CLI version: \`${manifest.versions.cli}\`\n- Runtime platforms: ${String(manifest.runtime_platforms.length)}\n- Generated Skills: ${manifest.generated_skill_ids.map((id) => `\`${id}\``).join(", ")}\n- Opaque runtime metadata assets: ${String(manifest.opaque_runtime_metadata_assets)}\n- Generated files: ${String(manifest.generated_file_dispositions.length)}\n\nComponent versions are validated independently. Release-set, protocol, schema, build fingerprint, command catalog, binary checksums, Skill closure, and opaque runtime-metadata hashes define the admitted runtime identity. Conversion is deterministic and does not execute bundled programs, runners, or output schemas and does not access Zotero.\n`;
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

function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
