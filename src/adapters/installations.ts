import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type { Diagnostic } from "../core/validation/types.js";
import { sha256, type PlannedWrite } from "../core/workspace/write-plan.js";

const IdentifierSchema = z.string().trim().min(1);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

export const ManagedInstallationSourceSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("arsu-skill"), skill_id: IdentifierSchema }),
  z.strictObject({ kind: z.literal("companion-skill"), skill_id: IdentifierSchema }),
  z.strictObject({
    kind: z.literal("domain-skill"),
    vendor_id: IdentifierSchema,
    vendor_release: IdentifierSchema,
    skill_id: IdentifierSchema,
  }),
  z.strictObject({ kind: z.literal("command"), command_id: IdentifierSchema }),
  z.strictObject({
    kind: z.literal("literature-adapter"),
    adapter_id: IdentifierSchema,
    release_set_id: IdentifierSchema,
    component: z.enum(["skill", "runtime", "profile-template", "windows-shim"]),
    skill_id: IdentifierSchema.optional(),
    platform: IdentifierSchema.optional(),
  }),
]);

export const ManagedInstallationSchema = z.strictObject({
  owner: z.enum(["agent-tool", "literature-adapter"]),
  tool_id: IdentifierSchema.nullable(),
  source: ManagedInstallationSourceSchema,
  target: z.strictObject({
    scope: z.enum(["project", "shared-global"]),
    path: z.string().min(1),
    executable: z.boolean(),
  }),
  sha256: Sha256Schema,
}).superRefine((value, context) => {
  if (value.owner === "agent-tool" && value.tool_id === null) {
    context.addIssue({ code: "custom", path: ["tool_id"], message: "agent-tool installations require tool_id" });
  }
  if (value.owner === "literature-adapter" && value.tool_id !== null) {
    context.addIssue({ code: "custom", path: ["tool_id"], message: "shared literature-adapter installations require null tool_id" });
  }
  if (value.source.kind !== "literature-adapter" && value.owner !== "agent-tool") {
    context.addIssue({ code: "custom", path: ["owner"], message: "non-adapter sources require agent-tool ownership" });
  }
  if (value.source.kind === "literature-adapter") {
    const isSkill = value.source.component === "skill";
    if (isSkill && (value.owner !== "agent-tool" || !value.source.skill_id)) {
      context.addIssue({ code: "custom", path: ["source"], message: "literature adapter Skill projections require agent-tool ownership and skill_id" });
    }
    if (!isSkill && (value.owner !== "literature-adapter" || value.source.skill_id !== undefined)) {
      context.addIssue({ code: "custom", path: ["source"], message: "shared literature adapter components require adapter ownership and no skill_id" });
    }
    const isPlatformRuntime = value.source.component === "runtime" || value.source.component === "windows-shim";
    if (isPlatformRuntime !== (value.source.platform !== undefined)) {
      context.addIssue({ code: "custom", path: ["source", "platform"], message: "runtime and Windows shim sources require exactly one target platform" });
    }
  }
});

export const DomainResolutionSnapshotSchema = z.strictObject({
  domain_id: IdentifierSchema,
  domain_version: IdentifierSchema,
  resolved_skill_ids: z.array(IdentifierSchema),
});

export const LiteratureAdapterRuntimeResolutionSchema = z.strictObject({
  source_path: z.string().min(1),
  installed_path: z.string().min(1),
  sha256: Sha256Schema,
  bytes: z.number().int().nonnegative(),
  protocol: IdentifierSchema,
  cli_schema: IdentifierSchema,
  build_fingerprint: Sha256Schema,
  command_catalog_checksum: Sha256Schema,
  binary_aggregate_sha256: Sha256Schema,
});

export const LiteratureAdapterResolutionSchema = z.strictObject({
  adapter_id: IdentifierSchema,
  release_set_id: IdentifierSchema,
  bundle_version: IdentifierSchema,
  cli_version: IdentifierSchema,
  skill_versions: z.record(IdentifierSchema, IdentifierSchema),
  target_platform: IdentifierSchema,
  runtime_asset: LiteratureAdapterRuntimeResolutionSchema.nullable(),
  skill_ids: z.tuple([IdentifierSchema, IdentifierSchema]),
  projected_tool_ids: z.array(IdentifierSchema),
  projection_state: z.enum(["complete", "deferred", "incomplete"]),
});

export const ToolInstallationManifestSchema = z.strictObject({
  schema_version: z.literal("1"),
  package_version: IdentifierSchema,
  plugin_resolutions: z.array(DomainResolutionSnapshotSchema),
  literature_adapter_resolutions: z.array(LiteratureAdapterResolutionSchema),
  installations: z.array(ManagedInstallationSchema),
});

export type ManagedInstallationSource = z.infer<typeof ManagedInstallationSourceSchema>;
export type ManagedInstallation = z.infer<typeof ManagedInstallationSchema>;
export type DomainResolutionSnapshot = z.infer<typeof DomainResolutionSnapshotSchema>;
export type LiteratureAdapterResolution = z.infer<typeof LiteratureAdapterResolutionSchema>;
export type ToolInstallationManifest = z.infer<typeof ToolInstallationManifestSchema>;

export function parseToolInstallationManifest(value: unknown): ToolInstallationManifest | undefined {
  const parsed = ToolInstallationManifestSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function installationRecords(value: unknown): ManagedInstallation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = ManagedInstallationSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function domainResolutionSnapshots(value: unknown): DomainResolutionSnapshot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = DomainResolutionSnapshotSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function literatureAdapterResolutions(value: unknown): LiteratureAdapterResolution[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = LiteratureAdapterResolutionSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function renderToolInstallationManifest(input: Omit<ToolInstallationManifest, "schema_version">): string {
  const manifest = ToolInstallationManifestSchema.parse({ schema_version: "1", ...input });
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function installationKey(item: Pick<ManagedInstallation, "target">): string {
  return `${item.target.scope}:${item.target.path}`;
}

export function deduplicateInstallations(items: readonly ManagedInstallation[]): ManagedInstallation[] {
  return [...new Map(items.map((item) => [installationKey(item), item])).values()]
    .sort((left, right) => compareText(left.tool_id ?? "", right.tool_id ?? "") || compareText(left.target.path, right.target.path));
}

export function managedSkillId(item: ManagedInstallation): string | undefined {
  return item.source.kind === "arsu-skill" || item.source.kind === "companion-skill" || item.source.kind === "domain-skill"
    ? item.source.skill_id
    : item.source.kind === "literature-adapter" && item.source.component === "skill"
      ? item.source.skill_id
      : undefined;
}

export function isDomainSkillInstallation(item: ManagedInstallation): item is ManagedInstallation & {
  source: Extract<ManagedInstallationSource, { kind: "domain-skill" }>;
} {
  return item.source.kind === "domain-skill";
}

export async function reconcileAgentToolInstallations(input: {
  projectRoot: string;
  existingInstallations: readonly ManagedInstallation[];
  desiredInstallations: readonly ManagedInstallation[];
  reconciledToolIds: readonly string[];
  selectedToolIds: readonly string[];
  preserveSkillIds?: readonly string[];
}): Promise<{ operations: PlannedWrite[]; retainedInstallations: ManagedInstallation[]; diagnostics: Diagnostic[] }> {
  const operations: PlannedWrite[] = [];
  const retainedInstallations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const desiredKeys = new Set(input.desiredInstallations.map(installationKey));
  const reconciledTools = new Set(input.reconciledToolIds);
  const selectedTools = new Set(input.selectedToolIds);
  const preservedSkills = new Set(input.preserveSkillIds ?? []);

  for (const installation of input.existingInstallations) {
    if (desiredKeys.has(installationKey(installation))) continue;
    if (installation.owner !== "agent-tool" || installation.tool_id === null) {
      retainedInstallations.push(installation);
      continue;
    }
    const skillId = managedSkillId(installation);
    if (skillId && preservedSkills.has(skillId)) {
      retainedInstallations.push(installation);
      continue;
    }
    if (!reconciledTools.has(installation.tool_id)) {
      retainedInstallations.push(installation);
      continue;
    }

    const selected = selectedTools.has(installation.tool_id);
    if (installation.target.scope !== "project") {
      retainedInstallations.push(installation);
      continue;
    }

    const target = path.resolve(input.projectRoot, installation.target.path);
    const bytes = await readBytes(target);
    if (bytes === undefined) continue;
    if (sha256(bytes) !== installation.sha256) {
      retainedInstallations.push(installation);
      diagnostics.push({
        severity: "warning",
        code: "generated_file_drift",
        message: "Stale generated file has user modifications and was preserved.",
        path: target,
        blocking: false,
        details: { source: installation.source },
      });
      continue;
    }
    operations.push({
      action: "remove-owned",
      path: target,
      relativePath: installation.target.path,
      scope: installation.target.scope,
      ownership: "generated",
      previousHash: installation.sha256,
      reason: selected ? "remove stale manifest-owned generated file" : "tool was explicitly deselected",
    });
  }
  return { operations, retainedInstallations, diagnostics };
}

async function readBytes(filePath: string): Promise<Uint8Array | undefined> {
  try {
    return await readFile(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
