import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";

export const CAPABILITY_MANIFEST_SCHEMA_VERSION = "1" as const;

export const CapabilityClassSchema = z.enum([
  "discovery",
  "design",
  "analysis",
  "generation",
  "verification",
  "judgment",
  "transformation",
]);

export const CapabilityNodeKindSchema = z.enum([
  "producer",
  "checker",
  "observer",
]);

export const CapabilityExecutionTypeSchema = z.enum([
  "llm",
  "script",
  "mixed",
]);

export const CapabilityInputSourcePolicySchema = z.enum([
  "stable_spec",
  "handoff",
  "node_output",
  "parameter",
]);

export const CapabilityValidatorKindSchema = z.enum([
  "schema",
  "script",
  "policy",
]);

export const CapabilityGatePolicySchema = z.enum([
  "none",
  "advisory",
  "required",
]);

export const CapabilityMaturitySchema = z.enum([
  "skeleton",
  "operational",
  "deprecated",
]);

export const CapabilityOriginSchema = z.enum([
  "original",
  "ars-derived",
  "vendor-derived",
  "mixed",
]);

const NonEmptySchema = z.string().trim().min(1);
const HexSha256Schema = z.string().regex(/^[0-9a-f]{64}$/, "content hash must be a lowercase SHA-256 hex string");
export const CapabilitySkillIdSchema = z.string().min(1).max(128).regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "capability_id must be a lowercase kebab-case Open Agent Skills name",
);
const PackagePathSchema = z.string().trim().min(1)
  .refine((value) => !value.startsWith("/") && !/^[A-Za-z]:/.test(value), "package paths must be relative")
  .refine((value) => !value.split(/[\\/]/).includes(".."), "package paths cannot escape the package root");

export const CapabilityInputRoleSchema = z.strictObject({
  role: StableIdSchema,
  schema_ref: StableIdSchema,
  required: z.boolean().optional(),
  source_policy: z.union([
    CapabilityInputSourcePolicySchema,
    z.array(CapabilityInputSourcePolicySchema).min(1).refine((sources) => new Set(sources).size === sources.length, "Input sources must be unique."),
  ]).default("handoff"),
});

export const CapabilityOutputRoleSchema = z.strictObject({
  role: StableIdSchema,
  schema_ref: StableIdSchema,
  required: z.boolean().optional(),
});

export const CapabilityValidatorSchema = z.strictObject({
  validator_id: StableIdSchema,
  kind: CapabilityValidatorKindSchema,
  inputs: z.array(StableIdSchema),
  outputs: z.array(StableIdSchema),
  error_codes: z.array(z.string().regex(/^[a-z][a-z0-9_-]*$/, "error code must be a stable lowercase identifier")).min(1),
  network: z.boolean().optional(),
  degraded_verdict: NonEmptySchema.optional(),
  runner: z.strictObject({
    argv0: NonEmptySchema,
    args_template: z.array(z.string()),
  }).optional(),
}).superRefine((value, context) => {
  if (value.kind === "script" && value.runner === undefined) {
    context.addIssue({ code: "custom", path: ["runner"], message: "Script validators require an explicit runner contract." });
  }
  if (value.network === true && value.degraded_verdict === undefined) {
    context.addIssue({ code: "custom", path: ["degraded_verdict"], message: "Network validators require a degraded verdict such as unresolvable." });
  }
});

export const CapabilityKnowledgeRefSchema = z.strictObject({
  knowledge_id: StableIdSchema,
  path: PackagePathSchema,
  content_hash: HexSha256Schema,
  license: NonEmptySchema,
});

export const CapabilityUpstreamSourceSchema = z.strictObject({
  path: PackagePathSchema,
  lines: z.strictObject({
    start_line: z.number().int().positive(),
    end_line: z.number().int().positive(),
  }).optional(),
  sha256: HexSha256Schema,
});

export const CapabilityProvenanceSchema = z.strictObject({
  origin: CapabilityOriginSchema,
  extraction_artifact_ids: z.array(StableIdSchema).optional(),
  upstream_sources: z.array(CapabilityUpstreamSourceSchema).optional(),
  notes: z.string().trim().min(1).optional(),
});

export const CapabilityPresetSchema = z.strictObject({
  preset_id: StableIdSchema,
  name: NonEmptySchema,
  values: z.record(z.string(), z.unknown()),
});

export const CapabilityManifestSchema = z.strictObject({
  schema_version: z.literal(CAPABILITY_MANIFEST_SCHEMA_VERSION),
  capability_id: CapabilitySkillIdSchema,
  title: NonEmptySchema,
  description: NonEmptySchema,
  class: CapabilityClassSchema,
  node_kind: CapabilityNodeKindSchema,
  execution_type: CapabilityExecutionTypeSchema,
  maturity: CapabilityMaturitySchema.optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  presets: z.array(CapabilityPresetSchema).optional(),
  inputs: z.array(CapabilityInputRoleSchema),
  outputs: z.array(CapabilityOutputRoleSchema),
  validators: z.array(CapabilityValidatorSchema),
  knowledge_refs: z.array(CapabilityKnowledgeRefSchema),
  gate_policy: CapabilityGatePolicySchema,
  provenance: CapabilityProvenanceSchema,
  license: NonEmptySchema,
}).superRefine((value, context) => {
  unique(value.inputs, (item) => item.role, ["inputs"], "input role", context);
  unique(value.outputs, (item) => item.role, ["outputs"], "output role", context);
  unique(value.validators, (item) => item.validator_id, ["validators"], "validator ID", context);
  unique(value.knowledge_refs, (item) => item.knowledge_id, ["knowledge_refs"], "knowledge ID", context);
  if (value.presets) unique(value.presets, (item) => item.preset_id, ["presets"], "preset ID", context);
  if (value.node_kind === "producer" && value.outputs.length === 0) {
    context.addIssue({ code: "custom", path: ["outputs"], message: "Producer capabilities require at least one output role." });
  }
  const roleIds = new Set(value.inputs.map((item) => item.role));
  for (const [index, validator] of value.validators.entries()) {
    for (const input of validator.inputs) {
      if (!roleIds.has(input) && input !== "*") {
        context.addIssue({ code: "custom", path: ["validators", index, "inputs"], message: `Validator input is not a declared input role: ${input}` });
      }
    }
  }
});

function unique<T>(
  values: readonly T[],
  key: (value: T) => string,
  path: (string | number)[],
  label: string,
  context: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    const id = key(value);
    if (seen.has(id)) context.addIssue({ code: "custom", path: [...path, index], message: `Duplicate ${label}: ${id}` });
    seen.add(id);
  }
}

export type CapabilityClass = z.infer<typeof CapabilityClassSchema>;
export type CapabilityNodeKind = z.infer<typeof CapabilityNodeKindSchema>;
export type CapabilityExecutionType = z.infer<typeof CapabilityExecutionTypeSchema>;
export type CapabilityInputRole = z.infer<typeof CapabilityInputRoleSchema>;
export type CapabilityOutputRole = z.infer<typeof CapabilityOutputRoleSchema>;
export type CapabilityValidator = z.infer<typeof CapabilityValidatorSchema>;
export type CapabilityKnowledgeRef = z.infer<typeof CapabilityKnowledgeRefSchema>;
export type CapabilityPreset = z.infer<typeof CapabilityPresetSchema>;
export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;

export function parseCapabilityManifest(value: unknown): CapabilityManifest {
  return CapabilityManifestSchema.parse(value);
}
