import { z } from "zod";

const IdentifierSchema = z.string().trim().min(1);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const SemverSchema = z.string().regex(/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/);

export const LiteratureAdapterRuntimeSchema = z.strictObject({
  platform: z.enum(["win32-x64", "darwin-x64", "darwin-arm64", "linux-x86", "linux-x64", "linux-arm", "linux-arm64"]),
  source_path: z.string().min(1),
  binary: z.enum(["zotero-bridge", "zotero-bridge.exe"]),
  sha256: Sha256Schema,
  bytes: z.number().int().positive(),
  executable: z.literal(true),
});

export const LiteratureAdapterDefinitionSchema = z.strictObject({
  adapter_id: IdentifierSchema,
  install_policy: z.literal("fixed"),
  primary_skill_id: IdentifierSchema,
  helper_skill_id: IdentifierSchema,
  skill_source_paths: z.record(IdentifierSchema, z.string().min(1)),
  profile_template_path: z.string().min(1),
  source: z.strictObject({
    bundle_repository: IdentifierSchema,
    bundle_tag: IdentifierSchema,
    bundle_commit: z.string().regex(/^[a-f0-9]{40}$/),
    bundle_tree: z.string().regex(/^[a-f0-9]{40}$/),
    source_repository: IdentifierSchema,
    source_commit: z.string().regex(/^[a-f0-9]{40}$/),
  }),
  versions: z.strictObject({
    bundle: SemverSchema,
    cli: SemverSchema,
    skills: z.record(IdentifierSchema, SemverSchema),
  }),
  identity: z.strictObject({
    release_set_id: IdentifierSchema,
    protocol: IdentifierSchema,
    cli_schema: IdentifierSchema,
    build_fingerprint: Sha256Schema,
    command_catalog_checksum: Sha256Schema,
    binary_aggregate_sha256: Sha256Schema,
    content_digests: z.strictObject({
      cli_bundle: Sha256Schema,
      library_agent: Sha256Schema,
      librarian_profile: Sha256Schema,
    }),
  }),
  license: z.strictObject({
    expression: z.literal("AGPL-3.0-only"),
    source_path: z.literal("LICENSES/AGPL-3.0.txt"),
  }),
  capabilities: z.array(z.enum([
    "bounded-library-query",
    "current-context-read",
    "evidence-export",
    "host-approved-mutation",
    "host-approved-workflow",
  ])).min(1),
  runtimes: z.array(LiteratureAdapterRuntimeSchema).length(7),
});

export type LiteratureAdapterRuntime = z.infer<typeof LiteratureAdapterRuntimeSchema>;
export type LiteratureAdapterDefinition = z.infer<typeof LiteratureAdapterDefinitionSchema>;

export function validateLiteratureAdapterCatalog(value: unknown): LiteratureAdapterDefinition[] {
  const parsed = z.array(LiteratureAdapterDefinitionSchema).min(1).parse(value);
  const adapterIds = new Set<string>();
  for (const adapter of parsed) {
    if (adapterIds.has(adapter.adapter_id)) throw new Error(`Duplicate literature adapter ID: ${adapter.adapter_id}`);
    adapterIds.add(adapter.adapter_id);
    const skillIds = [adapter.primary_skill_id, adapter.helper_skill_id];
    if (new Set(skillIds).size !== 2) throw new Error(`Literature adapter Skills must be distinct: ${adapter.adapter_id}`);
    for (const skillId of skillIds) {
      if (!adapter.skill_source_paths[skillId] || !adapter.versions.skills[skillId]) {
        throw new Error(`Literature adapter Skill identity is incomplete: ${adapter.adapter_id}/${skillId}`);
      }
    }
    const platforms = adapter.runtimes.map((runtime) => runtime.platform);
    if (new Set(platforms).size !== platforms.length) throw new Error(`Duplicate literature adapter runtime platform: ${adapter.adapter_id}`);
  }
  return parsed;
}
