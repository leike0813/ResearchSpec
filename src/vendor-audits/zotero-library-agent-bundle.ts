import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

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
  reason: z.enum(["required-by-fixed-adapter", "installer-or-unconsumed-surface"]),
});

export const ZoteroBundleAuditSchema = z.strictObject({
  schema_version: z.literal("1"),
  audit_id: z.literal("zotero-library-agent-bundle-hbrs-48630ca514e3146c2c89a8d5"),
  source: z.strictObject({
    repository: z.literal("https://github.com/leike0813/zotero-library-agent-bundle"),
    immutable_tag: z.literal("host-bridge/hbrs-48630ca514e3146c2c89a8d5"),
    revision: z.literal("8eef49d72574084244514fb612b96e7f5e7967a8"),
    tree: z.literal("d4cb943c0370e5104ec8c7074606c69980dec090"),
    clean: z.literal(true),
    release_set_id: z.literal("hbrs-48630ca514e3146c2c89a8d5"),
    source_repository: z.literal("https://github.com/leike0813/zotero-agents"),
    source_commit: z.literal("4436cf4a91f12ea555a54ddbba9278480ceaf56d"),
  }),
  license: z.strictObject({
    expression: z.literal("AGPL-3.0-only"),
    source_path: z.literal("LICENSE"),
    source_sha256: z.literal("76a97c878c9c7a8321bb395c2b44d3fe2f8d81314d219b20138ed0e2dddd5182"),
  }),
  identity: z.strictObject({
    protocol: z.literal("host-bridge.v1"),
    cli_schema: z.literal("zotero-bridge.cli.v2"),
    bundle_version: z.string().min(1),
    cli_version: z.string().min(1),
    skill_versions: z.strictObject({ "zotero-library-agent": z.string().min(1), "zotero-bridge-cli": z.string().min(1) }),
    build_fingerprint: Sha256Schema,
    command_catalog_checksum: Sha256Schema,
    binary_aggregate_sha256: Sha256Schema,
    content_digests: z.strictObject({ cli_bundle: Sha256Schema, library_agent: Sha256Schema, librarian_profile: Sha256Schema }),
    runtimes: z.array(RuntimeSchema).length(7),
  }),
  review: z.strictObject({
    release_status_observed: z.string().min(1),
    release_status_is_admission_gate: z.literal(false),
    github_release_is_admission_gate: z.literal(false),
    cross_component_patch_equality_required: z.literal(false),
  }),
  counts: z.strictObject({ tracked_files: z.number().int().positive(), included: z.number().int().positive(), excluded: z.number().int().positive() }),
  tracked_tree_sha256: Sha256Schema,
  included_tree_sha256: Sha256Schema,
  files: z.array(AuditFileSchema).min(1),
}).superRefine((audit, context) => {
  const paths = audit.files.map((file) => file.path);
  if (new Set(paths).size !== paths.length) context.addIssue({ code: "custom", path: ["files"], message: "audit file paths must be unique" });
  if (paths.some((value, index) => {
    const previous = paths[index - 1];
    return previous !== undefined && value < previous;
  })) context.addIssue({ code: "custom", path: ["files"], message: "audit file paths must be sorted" });
  const included = audit.files.filter((file) => file.disposition === "included").length;
  const excluded = audit.files.length - included;
  if (audit.counts.tracked_files !== audit.files.length || audit.counts.included !== included || audit.counts.excluded !== excluded) {
    context.addIssue({ code: "custom", path: ["counts"], message: "audit counts must cover the complete tracked tree" });
  }
  for (const excludedPath of ["install.sh", "install.ps1", "skills/zotero-library-agent/agents/openai.yaml", "skills/zotero-library-agent/assets/runner.json", "skills/zotero-library-agent/assets/output.schema.json", "skills/zotero-bridge-cli/assets/runner.json", "skills/zotero-bridge-cli/assets/output.schema.json"]) {
    if (audit.files.find((file) => file.path === excludedPath)?.disposition !== "excluded") {
      context.addIssue({ code: "custom", path: ["files"], message: `required exclusion is absent: ${excludedPath}` });
    }
  }
  if (new Set(audit.identity.runtimes.map((runtime) => runtime.platform)).size !== 7) {
    context.addIssue({ code: "custom", path: ["identity", "runtimes"], message: "runtime platforms must be unique" });
  }
});

export type ZoteroBundleAudit = z.infer<typeof ZoteroBundleAuditSchema>;

export async function loadZoteroBundleAudit(repoRoot: string): Promise<ZoteroBundleAudit> {
  const auditPath = path.join(repoRoot, "audits/zotero-library-agent-bundle/hbrs-48630ca514e3146c2c89a8d5/bundle-audit.json");
  return ZoteroBundleAuditSchema.parse(JSON.parse(await readFile(auditPath, "utf8")) as unknown);
}

export function renderZoteroBundleAuditReport(audit: ZoteroBundleAudit): string {
  return `# Zotero Library Agent Bundle Audit\n\n- Immutable tag: \`${audit.source.immutable_tag}\`\n- Bundle revision: \`${audit.source.revision}\`\n- Bundle tree: \`${audit.source.tree}\`\n- Source commit: \`${audit.source.source_commit}\`\n- Release set: \`${audit.source.release_set_id}\`\n- Protocol: \`${audit.identity.protocol}\`\n- CLI schema: \`${audit.identity.cli_schema}\`\n- Build fingerprint: \`${audit.identity.build_fingerprint}\`\n- Binary aggregate SHA-256: \`${audit.identity.binary_aggregate_sha256}\`\n- Tracked files: ${String(audit.counts.tracked_files)}\n- Included files: ${String(audit.counts.included)}\n- Excluded files: ${String(audit.counts.excluded)}\n- Included tree SHA-256: \`${audit.included_tree_sha256}\`\n- License: ${audit.license.expression} from \`${audit.source.source_repository}@${audit.source.source_commit}/${audit.license.source_path}\`\n\nBundle, CLI, and Skill versions are independent component identities. Cross-component patch equality is not an admission rule. The immutable release set, supported protocol and CLI schema, build fingerprint, command catalog, and binary checksums define compatibility. Conversion and checking are offline and never execute bundled files.\n`;
}
