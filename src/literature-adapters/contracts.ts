import { z } from "zod";

const IdentifierSchema = z.string().trim().min(1);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const SemverSchema = z.string().regex(/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/);

export const LITERATURE_ADAPTER_SKILL_ROLES = ["router", "task", "mechanism"] as const;
export const LITERATURE_ADAPTER_SKILL_VISIBILITIES = [
  "broad-route",
  "explicit-or-nested",
  "explicit-only",
  "mechanism-direct",
] as const;
export const LITERATURE_ADAPTER_AUTHORITY_BOUNDARIES = [
  "none",
  "zotero-read",
  "zotero-acquisition",
  "zotero-curation",
  "zotero-mechanism",
] as const;
export const LITERATURE_ADAPTER_REVIEWED_CAPABILITIES = [
  "bounded-task-routing",
  "current-library-query",
  "external-literature-acquisition",
  "source-evidence-analysis",
  "cross-source-synthesis",
  "approved-library-curation",
  "exact-cli-operations",
  "live-readiness-inspection",
  "structured-recovery",
  "provider-evidence-handoff",
  "duplicate-aware-selection",
] as const;

export const LiteratureAdapterRuntimeSchema = z.strictObject({
  platform: z.enum(["win32-x64", "darwin-x64", "darwin-arm64", "linux-x86", "linux-x64", "linux-arm", "linux-arm64"]),
  source_path: z.string().min(1),
  binary: z.enum(["zotero-bridge", "zotero-bridge.exe"]),
  sha256: Sha256Schema,
  bytes: z.number().int().positive(),
  executable: z.literal(true),
});

export const LiteratureAdapterSkillSchema = z.strictObject({
  skill_id: IdentifierSchema,
  version: SemverSchema,
  source_path: z.string().min(1),
  role: z.enum(LITERATURE_ADAPTER_SKILL_ROLES),
  visibility: z.enum(LITERATURE_ADAPTER_SKILL_VISIBILITIES),
  capabilities: z.array(z.enum(LITERATURE_ADAPTER_REVIEWED_CAPABILITIES)).min(1),
  authority_boundary: z.enum(LITERATURE_ADAPTER_AUTHORITY_BOUNDARIES),
  researchspec_workflow_authority: z.literal("none"),
  hard_skill_dependencies: z.array(IdentifierSchema),
});

export const LiteratureAdapterDefinitionSchema = z.strictObject({
  adapter_id: IdentifierSchema,
  install_policy: z.enum(["fixed", "optional"]),
  display: z.strictObject({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    setup_url: z.url(),
  }),
  skills: z.array(LiteratureAdapterSkillSchema).min(1),
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
  runtimes: z.array(LiteratureAdapterRuntimeSchema).length(7),
});

export type LiteratureAdapterRuntime = z.infer<typeof LiteratureAdapterRuntimeSchema>;
export type LiteratureAdapterSkill = z.infer<typeof LiteratureAdapterSkillSchema>;
export type LiteratureAdapterDefinition = z.infer<typeof LiteratureAdapterDefinitionSchema>;

export function validateLiteratureAdapterCatalog(value: unknown): LiteratureAdapterDefinition[] {
  const parsed = z.array(LiteratureAdapterDefinitionSchema).min(1).parse(value);
  const adapterIds = new Set<string>();
  for (const adapter of parsed) {
    if (adapterIds.has(adapter.adapter_id)) throw new Error(`Duplicate literature adapter ID: ${adapter.adapter_id}`);
    adapterIds.add(adapter.adapter_id);
    const skillIds = adapter.skills.map((skill) => skill.skill_id);
    if (new Set(skillIds).size !== skillIds.length) throw new Error(`Literature adapter Skills must be distinct: ${adapter.adapter_id}`);
    const skillSet = new Set(skillIds);
    for (const skill of adapter.skills) {
      for (const dependency of skill.hard_skill_dependencies) {
        if (!skillSet.has(dependency) || dependency === skill.skill_id) {
          throw new Error(`Literature adapter Skill dependency is invalid: ${adapter.adapter_id}/${skill.skill_id}/${dependency}`);
        }
      }
    }
    assertAcyclicSkills(adapter.adapter_id, adapter.skills);
    const platforms = adapter.runtimes.map((runtime) => runtime.platform);
    if (new Set(platforms).size !== platforms.length) throw new Error(`Duplicate literature adapter runtime platform: ${adapter.adapter_id}`);
  }
  return parsed;
}

function assertAcyclicSkills(adapterId: string, skills: LiteratureAdapterSkill[]): void {
  const byId = new Map(skills.map((skill) => [skill.skill_id, skill]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (skillId: string): void => {
    if (visiting.has(skillId)) throw new Error(`Literature adapter Skill dependency cycle: ${adapterId}/${skillId}`);
    if (visited.has(skillId)) return;
    visiting.add(skillId);
    for (const dependency of byId.get(skillId)?.hard_skill_dependencies ?? []) visit(dependency);
    visiting.delete(skillId);
    visited.add(skillId);
  };
  for (const skill of skills) visit(skill.skill_id);
}
