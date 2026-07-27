import { z } from "zod";

const IdentifierSchema = z.string().trim().min(1);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const TimestampSchema = z.iso.datetime({ offset: true });
const UniqueIdentifiersSchema = z.array(IdentifierSchema).refine(
  (values) => new Set(values).size === values.length,
  "Identifiers must be unique.",
);

export const LITERATURE_SOURCE_POLICY_MODES = [
  "adapter-native",
  "protocol-multi-source",
  "external-first",
  "library-bound",
] as const;

export const LiteratureSourcePolicySchema = z.enum(LITERATURE_SOURCE_POLICY_MODES);

const ReadinessCheckSchema = z.strictObject({
  status: z.enum(["ready", "not_ready", "not_required"]),
  diagnostic_codes: UniqueIdentifiersSchema,
});

export const ProviderReadinessSchema = z.strictObject({
  schema_version: z.literal("1"),
  invocation_id: IdentifierSchema,
  adapter_id: IdentifierSchema,
  release_set_id: IdentifierSchema,
  skill_id: IdentifierSchema,
  checked_at: TimestampSchema,
  status: z.enum(["ready", "unavailable"]),
  checks: z.strictObject({
    profile: ReadinessCheckSchema,
    bridge: ReadinessCheckSchema,
    authentication: ReadinessCheckSchema,
    capability: ReadinessCheckSchema,
  }),
}).superRefine((readiness, context) => {
  const checks = Object.values(readiness.checks);
  const hasFailure = checks.some((check) => check.status === "not_ready");
  if ((readiness.status === "ready" && hasFailure) || (readiness.status === "unavailable" && !hasFailure)) {
    context.addIssue({
      code: "custom",
      path: ["status"],
      message: "Overall readiness must agree with the component checks.",
    });
  }
});

const ProviderFilterSchema = z.strictObject({
  field: IdentifierSchema,
  operator: IdentifierSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

const ExternalProvenanceSchema = z.strictObject({
  source_id: IdentifierSchema,
  url: z.url().optional(),
  retrieved_at: TimestampSchema.optional(),
});

export const ProviderRetrievalHandoffSchema = z.strictObject({
  schema_version: z.literal("1"),
  handoff_id: IdentifierSchema,
  run_id: IdentifierSchema,
  route_ref: IdentifierSchema,
  source_policy: LiteratureSourcePolicySchema,
  provider: z.strictObject({
    adapter_id: IdentifierSchema,
    release_set_id: IdentifierSchema,
    skill_id: IdentifierSchema,
  }),
  operation: IdentifierSchema,
  request: z.strictObject({
    query: z.string().min(1).nullable(),
    filters: z.array(ProviderFilterSchema),
  }),
  scope: z.strictObject({
    library_ref: IdentifierSchema.nullable(),
    collection_refs: UniqueIdentifiersSchema,
    selection_refs: UniqueIdentifiersSchema,
    search_scope: z.string().min(1),
  }),
  retrieved_at: TimestampSchema,
  paging: z.strictObject({
    complete: z.boolean(),
    page_count: z.number().int().nonnegative(),
    continuation_ref: IdentifierSchema.nullable(),
  }),
  source_refs: z.strictObject({
    zotero_refs: UniqueIdentifiersSchema,
    external_provenance: z.array(ExternalProvenanceSchema),
  }),
  evidence_depth: z.enum(["metadata", "abstract", "full_text", "annotation", "synthesis"]),
  diagnostics: z.strictObject({
    readiness_codes: UniqueIdentifiersSchema,
    duplicate_codes: UniqueIdentifiersSchema,
  }),
  upstream_result: z.strictObject({
    path: z.string().min(1),
    sha256: Sha256Schema,
    schema_id: IdentifierSchema,
  }),
  coverage_limits: z.array(z.string().min(1)),
  managed_authorization_ref: z.strictObject({
    authorization_id: IdentifierSchema,
    sha256: Sha256Schema,
  }).nullable(),
});

export const MANAGED_LIBRARY_ACQUISITION_EFFECTS = [
  "item-import",
  "collection-link",
  "attachment-import",
] as const;

export const ManagedLibraryAuthorizationSchema = z.strictObject({
  schema_version: z.literal("1"),
  authorization_id: IdentifierSchema,
  run_id: IdentifierSchema,
  route_ref: IdentifierSchema,
  adapter_id: IdentifierSchema,
  acquisition_skill_id: z.literal("zotero-literature-acquisition"),
  target_library_ref: IdentifierSchema,
  target_collection_ref: IdentifierSchema,
  accepted_candidate_ids: UniqueIdentifiersSchema.min(1),
  allowed_effects: z.array(z.enum(MANAGED_LIBRARY_ACQUISITION_EFFECTS)).min(1).refine(
    (values) => new Set(values).size === values.length,
    "Allowed effects must be unique.",
  ),
  granted_by: z.strictObject({
    kind: z.literal("human"),
    name: IdentifierSchema,
  }),
  granted_at: TimestampSchema,
  expires_at: TimestampSchema,
  confirmation_basis_sha256: Sha256Schema,
  revocation: z.strictObject({
    revoked_at: TimestampSchema,
    revoked_by: IdentifierSchema,
    reason_code: IdentifierSchema,
  }).nullable(),
}).superRefine((authorization, context) => {
  if (Date.parse(authorization.expires_at) <= Date.parse(authorization.granted_at)) {
    context.addIssue({
      code: "custom",
      path: ["expires_at"],
      message: "Authorization expiry must follow grant time.",
    });
  }
  if (authorization.revocation && Date.parse(authorization.revocation.revoked_at) < Date.parse(authorization.granted_at)) {
    context.addIssue({
      code: "custom",
      path: ["revocation", "revoked_at"],
      message: "Authorization revocation cannot precede grant time.",
    });
  }
});

export const ManagedLibraryAuthorizationRequestSchema = z.strictObject({
  run_id: IdentifierSchema,
  route_ref: IdentifierSchema,
  adapter_id: IdentifierSchema,
  target_library_ref: IdentifierSchema,
  target_collection_ref: IdentifierSchema,
  candidate_id: IdentifierSchema,
  effect: z.enum(MANAGED_LIBRARY_ACQUISITION_EFFECTS),
  evaluated_at: TimestampSchema,
});

export type LiteratureSourcePolicy = z.infer<typeof LiteratureSourcePolicySchema>;
export type ProviderReadiness = z.infer<typeof ProviderReadinessSchema>;
export type ProviderRetrievalHandoff = z.infer<typeof ProviderRetrievalHandoffSchema>;
export type ManagedLibraryAuthorization = z.infer<typeof ManagedLibraryAuthorizationSchema>;
export type ManagedLibraryAuthorizationRequest = z.infer<typeof ManagedLibraryAuthorizationRequestSchema>;
