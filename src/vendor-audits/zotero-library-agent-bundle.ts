import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { z } from "zod";

import { sha256 } from "../core/workspace/write-plan.js";
import {
  LITERATURE_ADAPTER_AUTHORITY_BOUNDARIES,
  LITERATURE_ADAPTER_REVIEWED_CAPABILITIES,
  LITERATURE_ADAPTER_SKILL_ROLES,
  LITERATURE_ADAPTER_SKILL_VISIBILITIES,
} from "../literature-adapters/contracts.js";

const execFileAsync = promisify(execFile);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const SkillIdSchema = z.enum([
  "zotero-library-agent",
  "zotero-library-query",
  "zotero-literature-acquisition",
  "zotero-literature-analysis",
  "zotero-research-synthesis",
  "zotero-library-curation",
  "zotero-bridge-cli",
]);

export const ZOTERO_BUNDLE_RELEASE_SET_ID = "hbrs-8c6de08010d459a0e87e74f2";
export const ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH = `audits/zotero-library-agent-bundle/${ZOTERO_BUNDLE_RELEASE_SET_ID}/bundle-audit.json`;
export const ZOTERO_BUNDLE_AUDIT_REPORT_RELATIVE_PATH = `audits/zotero-library-agent-bundle/${ZOTERO_BUNDLE_RELEASE_SET_ID}/report.md`;
export const ZOTERO_BUNDLE_SOURCE_RELATIVE_PATH = "vendor/zotero-library-agent-bundle";

const RuntimeSchema = z.strictObject({
  platform: z.enum(["win32-x64", "darwin-x64", "darwin-arm64", "linux-x86", "linux-x64", "linux-arm", "linux-arm64"]),
  binary: z.enum(["zotero-bridge", "zotero-bridge.exe"]),
  sha256: Sha256Schema,
  bytes: z.number().int().positive(),
});

const AuditFileSchema = z.strictObject({
  path: z.string().min(1),
  sha256: Sha256Schema,
  bytes: z.number().int().nonnegative(),
  disposition: z.enum(["included", "excluded"]),
  reason: z.enum(["required-by-fixed-adapter", "installer-provider-config-or-documentation"]),
});

const AuditedSkillSchema = z.strictObject({
  skill_id: SkillIdSchema,
  version: z.literal("0.5.2"),
  role: z.enum(LITERATURE_ADAPTER_SKILL_ROLES),
  visibility: z.enum(LITERATURE_ADAPTER_SKILL_VISIBILITIES),
  reviewed_capabilities: z.array(z.enum(LITERATURE_ADAPTER_REVIEWED_CAPABILITIES)).min(1),
  authority_boundary: z.enum(LITERATURE_ADAPTER_AUTHORITY_BOUNDARIES),
  researchspec_workflow_authority: z.literal("none"),
  hard_skill_dependencies: z.array(SkillIdSchema),
  required_paths: z.array(z.string().min(1)).min(1),
});

const OpaqueRuntimeMetadataSchema = z.strictObject({
  skill_id: SkillIdSchema,
  kind: z.enum(["runner", "output-schema"]),
  path: z.string().min(1),
  sha256: Sha256Schema,
  bytes: z.number().int().positive(),
  classification: z.literal("opaque-runtime-metadata"),
  researchspec_execution: z.literal("forbidden"),
});

export const ZoteroBundleAuditSchema = z.strictObject({
  schema_version: z.literal("2"),
  audit_id: z.literal("zotero-library-agent-bundle-hbrs-8c6de08010d459a0e87e74f2"),
  source: z.strictObject({
    repository: z.literal("https://github.com/leike0813/zotero-library-agent-bundle"),
    immutable_tag: z.literal("host-bridge/hbrs-8c6de08010d459a0e87e74f2"),
    revision: z.literal("ff1475eea7d3fb6cb07dbdd872e3c7603e7f1a19"),
    tree: z.literal("a648caba463dbd30bae69315ae57c39e44ca5902"),
    clean: z.literal(true),
    release_set_id: z.literal("hbrs-8c6de08010d459a0e87e74f2"),
    source_repository: z.literal("https://github.com/leike0813/zotero-agents"),
    source_commit: z.literal("a0fe8e324834e2fcfd1b513552f9013e9be4b491"),
  }),
  license: z.strictObject({
    expression: z.literal("AGPL-3.0-only"),
    source_path: z.literal("LICENSE"),
    source_sha256: z.literal("76a97c878c9c7a8321bb395c2b44d3fe2f8d81314d219b20138ed0e2dddd5182"),
  }),
  identity: z.strictObject({
    protocol: z.literal("host-bridge.v2"),
    cli_schema: z.literal("zotero-bridge.cli.v5"),
    bundle_version: z.literal("0.5.2"),
    cli_version: z.literal("0.5.1"),
    skill_versions: z.record(SkillIdSchema, z.literal("0.5.2")),
    build_fingerprint: Sha256Schema,
    command_catalog_checksum: Sha256Schema,
    binary_aggregate_sha256: Sha256Schema,
    content_digests: z.strictObject({
      cli_bundle: Sha256Schema,
      library_agent: Sha256Schema,
      librarian_profile: Sha256Schema,
    }),
    runtimes: z.array(RuntimeSchema).length(7),
  }),
  review: z.strictObject({
    release_status_observed: z.string().min(1),
    release_status_is_admission_gate: z.literal(false),
    github_release_is_admission_gate: z.literal(false),
    cross_component_patch_equality_required: z.literal(false),
  }),
  counts: z.strictObject({
    tracked_files: z.literal(176),
    included: z.literal(172),
    excluded: z.literal(4),
  }),
  tracked_tree_sha256: Sha256Schema,
  included_tree_sha256: Sha256Schema,
  files: z.array(AuditFileSchema).length(176),
  skills: z.array(AuditedSkillSchema).length(7),
  opaque_runtime_metadata: z.array(OpaqueRuntimeMetadataSchema).length(14),
}).superRefine((audit, context) => {
  const paths = audit.files.map((file) => file.path);
  if (new Set(paths).size !== paths.length) {
    context.addIssue({ code: "custom", path: ["files"], message: "audit file paths must be unique" });
  }
  if (!isSorted(paths)) {
    context.addIssue({ code: "custom", path: ["files"], message: "audit file paths must be sorted" });
  }
  const included = audit.files.filter((file) => file.disposition === "included").length;
  const excluded = audit.files.length - included;
  if (audit.counts.included !== included || audit.counts.excluded !== excluded) {
    context.addIssue({ code: "custom", path: ["counts"], message: "audit counts must cover the complete tracked tree" });
  }

  const requiredExclusions = new Set([
    "README.md",
    "install.ps1",
    "install.sh",
    "skills/zotero-library-agent/agents/openai.yaml",
  ]);
  const actualExclusions = audit.files.filter((file) => file.disposition === "excluded").map((file) => file.path);
  if (actualExclusions.length !== requiredExclusions.size || actualExclusions.some((filePath) => !requiredExclusions.has(filePath))) {
    context.addIssue({ code: "custom", path: ["files"], message: "audit exclusions must be exactly the reviewed four-file set" });
  }

  const skillIds = audit.skills.map((skill) => skill.skill_id);
  if (new Set(skillIds).size !== 7 || audit.skills.filter((skill) => skill.role === "router").length !== 1
    || audit.skills.filter((skill) => skill.role === "task").length !== 5
    || audit.skills.filter((skill) => skill.role === "mechanism").length !== 1) {
    context.addIssue({ code: "custom", path: ["skills"], message: "audit must contain one router, five task Skills, and one mechanism" });
  }
  const skillSet = new Set(skillIds);
  for (const skill of audit.skills) {
    for (const dependency of skill.hard_skill_dependencies) {
      if (!skillSet.has(dependency) || dependency === skill.skill_id) {
        context.addIssue({ code: "custom", path: ["skills"], message: `invalid hard Skill dependency: ${skill.skill_id}/${dependency}` });
      }
    }
    for (const requiredPath of skill.required_paths) {
      if (audit.files.find((file) => file.path === requiredPath)?.disposition !== "included") {
        context.addIssue({ code: "custom", path: ["skills"], message: `required Skill path is not included: ${requiredPath}` });
      }
    }
  }

  const metadataKeys = audit.opaque_runtime_metadata.map((item) => `${item.skill_id}:${item.kind}`);
  if (new Set(metadataKeys).size !== 14) {
    context.addIssue({ code: "custom", path: ["opaque_runtime_metadata"], message: "every Skill must retain one runner and one output schema record" });
  }
  for (const metadata of audit.opaque_runtime_metadata) {
    const file = audit.files.find((candidate) => candidate.path === metadata.path);
    if (!file || file.disposition !== "included" || file.sha256 !== metadata.sha256 || file.bytes !== metadata.bytes) {
      context.addIssue({ code: "custom", path: ["opaque_runtime_metadata"], message: `opaque runtime metadata differs from file audit: ${metadata.path}` });
    }
  }
  if (new Set(audit.identity.runtimes.map((runtime) => runtime.platform)).size !== 7) {
    context.addIssue({ code: "custom", path: ["identity", "runtimes"], message: "runtime platforms must be unique" });
  }
  if (Object.keys(audit.identity.skill_versions).length !== 7 || skillIds.some((skillId) => audit.identity.skill_versions[skillId] !== "0.5.2")) {
    context.addIssue({ code: "custom", path: ["identity", "skill_versions"], message: "Skill version identities must match the complete audited Skill closure" });
  }
});

export type ZoteroBundleAudit = z.infer<typeof ZoteroBundleAuditSchema>;
export type AuditedZoteroSkill = ZoteroBundleAudit["skills"][number];

export async function loadZoteroBundleAudit(repoRoot: string): Promise<ZoteroBundleAudit> {
  return ZoteroBundleAuditSchema.parse(JSON.parse(await readFile(path.join(repoRoot, ZOTERO_BUNDLE_AUDIT_RELATIVE_PATH), "utf8")) as unknown);
}

export async function checkZoteroBundleAudit(repoRoot: string): Promise<ZoteroBundleAudit> {
  const root = path.resolve(repoRoot);
  const sourceRoot = path.join(root, ZOTERO_BUNDLE_SOURCE_RELATIVE_PATH);
  const audit = await loadZoteroBundleAudit(root);
  const { stdout: revision } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  const { stdout: tree } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD^{tree}"]);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain"]);
  const { stdout: listed } = await execFileAsync("git", ["-C", sourceRoot, "ls-files"]);
  if (revision.trim() !== audit.source.revision) throw new Error(`Zotero bundle revision differs from audit: ${revision.trim()}`);
  if (tree.trim() !== audit.source.tree) throw new Error(`Zotero bundle tree differs from audit: ${tree.trim()}`);
  if (status.trim()) throw new Error("Zotero bundle checkout must be clean before audit or conversion.");

  const actualPaths = listed.trim().split("\n").filter(Boolean).sort(compareText);
  const auditedPaths = audit.files.map((file) => file.path);
  if (!sameArray(actualPaths, auditedPaths)) throw new Error("Zotero bundle tracked-file set differs from the immutable audit.");
  for (const file of audit.files) {
    const bytes = await readFile(path.join(sourceRoot, file.path));
    if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) {
      throw new Error(`Zotero bundle file differs from audit: ${file.path}`);
    }
  }
  if (aggregateFileEntries(audit.files) !== audit.tracked_tree_sha256
    || aggregateFileEntries(audit.files.filter((file) => file.disposition === "included")) !== audit.included_tree_sha256) {
    throw new Error("Zotero bundle audit aggregate hashes are invalid.");
  }

  const upstreamManifest = JSON.parse(await readFile(path.join(sourceRoot, "manifest.json"), "utf8")) as Record<string, unknown>;
  validateUpstreamIdentity(upstreamManifest, audit);
  const license = await readFile(path.join(root, "LICENSES/AGPL-3.0.txt"));
  if (sha256(license) !== audit.license.source_sha256) {
    throw new Error("Zotero source license differs from the admitted source commit.");
  }
  const report = await readFile(path.join(root, ZOTERO_BUNDLE_AUDIT_REPORT_RELATIVE_PATH), "utf8");
  if (report !== renderZoteroBundleAuditReport(audit)) {
    throw new Error("Zotero audit report differs from the immutable audit.");
  }
  return audit;
}

export function renderZoteroBundleAuditReport(audit: ZoteroBundleAudit): string {
  return `# Zotero Library Agent Bundle Audit\n\n- Audit schema: \`${audit.schema_version}\`\n- Immutable tag: \`${audit.source.immutable_tag}\`\n- Bundle revision: \`${audit.source.revision}\`\n- Bundle tree: \`${audit.source.tree}\`\n- Source commit: \`${audit.source.source_commit}\`\n- Release set: \`${audit.source.release_set_id}\`\n- Protocol: \`${audit.identity.protocol}\`\n- CLI schema: \`${audit.identity.cli_schema}\`\n- Build fingerprint: \`${audit.identity.build_fingerprint}\`\n- Binary aggregate SHA-256: \`${audit.identity.binary_aggregate_sha256}\`\n- Tracked files: ${String(audit.counts.tracked_files)}\n- Included files: ${String(audit.counts.included)}\n- Excluded files: ${String(audit.counts.excluded)}\n- Reviewed Skills: ${String(audit.skills.length)} (1 router, 5 tasks, 1 mechanism)\n- Opaque runtime metadata assets: ${String(audit.opaque_runtime_metadata.length)}\n- Included tree SHA-256: \`${audit.included_tree_sha256}\`\n- License: ${audit.license.expression} from \`${audit.source.source_repository}@${audit.source.source_commit}/${audit.license.source_path}\`\n\nBundle, CLI, and Skill versions are independent component identities. Cross-component patch equality is not an admission rule. The immutable release set, supported protocol and CLI schema, build fingerprint, command catalog, binary checksums, complete Skill closure, and reviewed runtime-metadata hashes define compatibility. Audit, conversion, and checking are offline and never execute bundled binaries, runners, or output schemas.\n`;
}

function validateUpstreamIdentity(value: Record<string, unknown>, audit: ZoteroBundleAudit): void {
  const releaseSet = record(value.releaseSet);
  const cli = record(releaseSet.cli);
  const surfaces = record(releaseSet.surfaces);
  const libraryAgent = record(surfaces.libraryAgent);
  const cliBundle = record(surfaces.cliBundle);
  const librarianProfile = record(surfaces.librarianProfile);
  if (value.releaseSetId !== audit.source.release_set_id || value.sourceCommit !== audit.source.source_commit) {
    throw new Error("Zotero upstream manifest release-set identity differs from audit.");
  }
  if (releaseSet.protocol !== audit.identity.protocol || releaseSet.cliSchema !== audit.identity.cli_schema) {
    throw new Error("Zotero upstream protocol or CLI schema differs from audit.");
  }
  if (cli.version !== audit.identity.cli_version || cli.buildFingerprint !== audit.identity.build_fingerprint
    || cli.commandCatalogChecksum !== audit.identity.command_catalog_checksum
    || cli.binaryAggregateSha256 !== audit.identity.binary_aggregate_sha256) {
    throw new Error("Zotero CLI component identity differs from audit.");
  }
  if (libraryAgent.version !== audit.identity.bundle_version || cliBundle.version !== audit.identity.skill_versions["zotero-bridge-cli"]
    || librarianProfile.version !== audit.identity.bundle_version) {
    throw new Error("Zotero bundle component identity differs from audit.");
  }
  if (libraryAgent.contentDigest !== audit.identity.content_digests.library_agent
    || cliBundle.contentDigest !== audit.identity.content_digests.cli_bundle
    || librarianProfile.contentDigest !== audit.identity.content_digests.librarian_profile) {
    throw new Error("Zotero content digest differs from audit.");
  }
  const actualRuntimes = Array.isArray(cli.binaries) ? cli.binaries.map(record) : [];
  for (const runtime of audit.identity.runtimes) {
    const actual = actualRuntimes.find((candidate) => candidate.platform === runtime.platform);
    if (!actual || actual.binary !== runtime.binary || actual.sha256 !== runtime.sha256 || actual.bytes !== runtime.bytes) {
      throw new Error(`Zotero runtime identity differs from audit: ${runtime.platform}`);
    }
  }
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

function isSorted(values: readonly string[]): boolean {
  return values.every((value, index) => index === 0 || (values[index - 1] ?? "") <= value);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
