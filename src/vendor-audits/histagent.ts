import { z } from "zod";

import {
  AnzsrcAuditMetadataSchema,
  AuditRelativePathSchema,
  ContentLicenseReviewSchema,
  VendorAuditFindingSchema,
  VendorAuditRepositorySourceSchema,
} from "./contracts.js";

const AuditIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const AuditObjectIdSchema = z.string().regex(/^[a-f0-9]{40}$/);
const AuditSha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

export const HistAgentDispositionSchema = z.enum([
  "retain",
  "adapt",
  "replace",
  "exclude",
  "confirmed-failure",
]);

export const HistAgentProspectiveDomainSchema = z.enum([
  "heritage-archive-and-museum-studies",
  "historical-studies",
]);

export const HistAgentSourceEntrySchema = z.strictObject({
  path: AuditRelativePathSchema,
  kind: z.literal("file"),
  git_mode: z.literal("100644"),
  git_object_id: AuditObjectIdSchema,
  bytes: z.number().int().nonnegative(),
  sha256: AuditSha256Schema,
  content_origin_id: AuditIdSchema,
  disposition: HistAgentDispositionSchema,
});

export const HistAgentContentOriginSchema = z.strictObject({
  origin_id: AuditIdSchema,
  kind: z.enum([
    "upstream-root",
    "attributed-borrowing",
    "unattributed-import",
    "compiled-artifact",
    "unverified-media",
  ]),
  scope: z.array(AuditRelativePathSchema).min(1),
  content_license: ContentLicenseReviewSchema,
  disposition: HistAgentDispositionSchema,
  note: z.string().min(1),
});

export const HistAgentLicenseClaimSchema = z.strictObject({
  claim_id: AuditIdSchema,
  expression: z.string().min(1).nullable(),
  status: z.enum(["confirmed", "requires-source-verification", "missing", "unverified"]),
  scope: z.array(AuditRelativePathSchema).min(1),
  evidence: z.array(AuditRelativePathSchema).min(1),
  disposition: HistAgentDispositionSchema,
  note: z.string().min(1),
});

export const HistAgentRuntimeAuthoritySchema = z.strictObject({
  authority_id: AuditIdSchema,
  kind: z.enum([
    "browser-control",
    "credential-access",
    "dependency-installation",
    "external-request",
    "filesystem-read",
    "filesystem-write",
    "provider-inference",
    "subprocess-execution",
    "telemetry",
    "benchmark-execution",
  ]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  granted_by_explicit_invocation: z.boolean(),
  governed_by_host_policy: z.literal(true),
  disposition: HistAgentDispositionSchema,
  note: z.string().min(1),
});

export const HistAgentExternalResourceSchema = z.strictObject({
  resource_id: AuditIdSchema,
  kind: z.enum(["dataset", "model", "provider", "search-service", "website", "media-service", "local-service"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  data_flow: z.enum(["download", "upload", "request-response", "local-only"]),
  disposition: HistAgentDispositionSchema,
  note: z.string().min(1),
});

export const HistAgentSecurityFindingSchema = VendorAuditFindingSchema.extend({
  disposition: HistAgentDispositionSchema,
});

export const HistAgentKnowledgeSurfaceSchema = z.strictObject({
  surface_id: AuditIdSchema,
  source_path: AuditRelativePathSchema,
  symbol: z.string().min(1),
  kind: z.enum([
    "agent-orchestration",
    "archival-retrieval",
    "benchmark-runtime",
    "browser-runtime",
    "document-processing",
    "evaluation-runtime",
    "image-processing",
    "literature-retrieval",
    "media-processing",
    "ocr",
    "prompt-adaptation",
    "secret-payload",
    "telemetry-runtime",
    "translation",
  ]),
  capability_scope: z.enum([
    "historical-research",
    "source-identification",
    "source-analysis",
    "shared-runtime",
    "evaluation-only",
  ]),
  content_origin_id: AuditIdSchema,
  runtime_authority_ids: z.array(AuditIdSchema),
  external_resource_ids: z.array(AuditIdSchema),
  disposition: HistAgentDispositionSchema,
  findings: z.array(VendorAuditFindingSchema),
  recommendation: z.string().min(1),
}).superRefine((value, context) => {
  for (const field of ["runtime_authority_ids", "external_resource_ids"] as const) {
    if (new Set(value[field]).size !== value[field].length) context.addIssue({ code: "custom", message: `${field} must be unique`, path: [field] });
  }
});

export const HistAgentAdvisoryRelationshipSchema = z.strictObject({
  target_skill_id: z.enum([
    "histagent-historical-research",
    "histagent-historical-source-identification",
    "histagent-historical-source-analysis",
  ]),
  relation: z.literal("advisory"),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().min(1),
});

export const HistAgentCandidateSkillSchema = z.strictObject({
  skill_id: z.enum([
    "histagent-historical-research",
    "histagent-historical-source-identification",
    "histagent-historical-source-analysis",
  ]),
  source_surface_ids: z.array(AuditIdSchema).min(1),
  implementation_strategy: z.literal("self-contained-executable-capability-reimplementation"),
  execution_contract: z.strictObject({
    extensions: z.array(z.enum(["script-assisted", "resource-backed", "stateful"])).min(2),
    formal_entrypoint: AuditRelativePathSchema,
    commands: z.array(AuditIdSchema).min(1),
    state_authority: z.enum(["run-directory-json", "artifact-directory"]),
    resource_library: z.literal("lib/historical_support.py"),
    cli_contract: z.literal("conventional-command-options-and-domain-files"),
    success_contract: z.literal("command-specific-json-and-artifacts"),
    failure_contract: z.literal("nonzero-exit-stderr-error-object"),
    dependency_policy: z.literal("documented-user-managed-no-auto-install"),
    self_contained: z.literal(true),
  }),
  output_layers: z.array(z.enum([
    "raw-observation-or-ocr",
    "normalized-transcription",
    "emendation",
    "translation",
    "interpretation",
  ])).length(5),
  hard_dependencies: z.array(z.never()).length(0),
  advisory_relationships: z.array(HistAgentAdvisoryRelationshipSchema).min(1),
  ...AnzsrcAuditMetadataSchema.shape,
  prospective_domains: z.array(HistAgentProspectiveDomainSchema).min(1),
  content_license: ContentLicenseReviewSchema,
  overlaps: z.array(z.strictObject({
    target_kind: z.enum(["arsu", "existing-vendor", "upstream-sibling"]),
    target_id: z.string().min(1),
    disposition: z.enum(["complementary", "related", "replace-implementation"]),
    evidence: z.array(AuditRelativePathSchema).min(1),
    note: z.string().min(1),
  })),
  safety_constraints: z.array(z.enum([
    "host-access-control",
    "human-review",
    "no-embedded-credentials",
    "no-unmarked-completion",
    "output-layer-separation",
    "provider-neutral",
    "provenance-required",
  ])).min(1),
  disposition: z.literal("adapt"),
  findings: z.array(VendorAuditFindingSchema),
  recommendation: z.string().min(1),
}).superRefine((value, context) => {
  for (const field of ["source_surface_ids", "output_layers", "prospective_domains", "safety_constraints"] as const) {
    if (new Set(value[field]).size !== value[field].length) context.addIssue({ code: "custom", message: `${field} must be unique`, path: [field] });
  }
  if (value.advisory_relationships.some((relationship) => relationship.target_skill_id === value.skill_id)) {
    context.addIssue({ code: "custom", message: "candidate cannot relate to itself", path: ["advisory_relationships"] });
  }
  if (new Set(value.execution_contract.commands).size !== value.execution_contract.commands.length) {
    context.addIssue({ code: "custom", message: "execution commands must be unique", path: ["execution_contract", "commands"] });
  }
  const expectedExtensions = value.skill_id === "histagent-historical-research"
    ? ["script-assisted", "resource-backed", "stateful"]
    : ["script-assisted", "resource-backed"];
  if (JSON.stringify(value.execution_contract.extensions) !== JSON.stringify(expectedExtensions)) {
    context.addIssue({ code: "custom", message: "candidate extensions do not match the reviewed Skill thickness", path: ["execution_contract", "extensions"] });
  }
});

export const HistAgentAuditSchema = z.strictObject({
  schema_version: z.literal("1"),
  source: VendorAuditRepositorySourceSchema,
  policy: z.strictObject({
    audit_is_admission: z.literal(false),
    future_change: z.literal("ingest-histagent"),
    source_has_upstream_skills: z.literal(false),
    generated_production_skills: z.literal(false),
    converter_executes_upstream_content: z.literal(false),
    parallel_ingest_preparation_allowed: z.literal(true),
    production_requires_audit_validation: z.literal(true),
    production_requires_hash_bound_human_review: z.literal(true),
    benchmark_content_admitted: z.literal(false),
    tool_domain_membership: z.literal(false),
    explicit_invocation_authorizes_configured_providers_and_task_materials: z.literal(true),
    access_control_owned_by_host: z.literal(true),
    culture_specific_policy_added: z.literal(false),
    allowed_domains: z.array(HistAgentProspectiveDomainSchema).length(2),
    anzsrc_field_creates_membership: z.literal(false),
  }),
  summary: z.strictObject({
    tracked_entries: z.literal(120),
    tracked_entry_set_sha256: z.literal("04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02"),
    files: z.literal(120),
    file_bytes: z.number().int().nonnegative(),
    upstream_skills: z.literal(0),
    content_origins: z.number().int().positive(),
    license_claims: z.number().int().positive(),
    runtime_authorities: z.number().int().positive(),
    external_resources: z.number().int().positive(),
    security_findings: z.number().int().positive(),
    knowledge_surfaces: z.number().int().positive(),
    candidate_skills: z.literal(3),
    source_dispositions: z.record(HistAgentDispositionSchema, z.number().int().nonnegative()),
  }),
  content_origins: z.array(HistAgentContentOriginSchema).min(1),
  license_claims: z.array(HistAgentLicenseClaimSchema).min(1),
  runtime_authorities: z.array(HistAgentRuntimeAuthoritySchema).min(1),
  external_resources: z.array(HistAgentExternalResourceSchema).min(1),
  security_findings: z.array(HistAgentSecurityFindingSchema).min(1),
  source_entries: z.array(HistAgentSourceEntrySchema).length(120),
  knowledge_surfaces: z.array(HistAgentKnowledgeSurfaceSchema).min(1),
  candidate_skills: z.array(HistAgentCandidateSkillSchema).length(3),
}).superRefine((value, context) => {
  validateUnique(value.content_origins.map((item) => item.origin_id), "content origins", ["content_origins"], context);
  validateUnique(value.license_claims.map((item) => item.claim_id), "license claims", ["license_claims"], context);
  validateUnique(value.runtime_authorities.map((item) => item.authority_id), "runtime authorities", ["runtime_authorities"], context);
  validateUnique(value.external_resources.map((item) => item.resource_id), "external resources", ["external_resources"], context);
  validateUnique(value.security_findings.map((item) => item.code), "security findings", ["security_findings"], context);
  validateUnique(value.source_entries.map((item) => item.path), "source entries", ["source_entries"], context);
  validateUnique(value.knowledge_surfaces.map((item) => item.surface_id), "knowledge surfaces", ["knowledge_surfaces"], context);
  validateUnique(value.candidate_skills.map((item) => item.skill_id), "candidate skills", ["candidate_skills"], context);

  const origins = new Set(value.content_origins.map((item) => item.origin_id));
  const sourcePaths = new Set(value.source_entries.map((item) => item.path));
  const authorityIds = new Set(value.runtime_authorities.map((item) => item.authority_id));
  const resourceIds = new Set(value.external_resources.map((item) => item.resource_id));
  const surfaceIds = new Set(value.knowledge_surfaces.map((item) => item.surface_id));
  const skillIds = new Set(value.candidate_skills.map((item) => item.skill_id));

  for (const [index, entry] of value.source_entries.entries()) if (!origins.has(entry.content_origin_id)) context.addIssue({ code: "custom", message: "unknown content origin", path: ["source_entries", index, "content_origin_id"] });
  for (const [index, surface] of value.knowledge_surfaces.entries()) {
    if (!origins.has(surface.content_origin_id)) context.addIssue({ code: "custom", message: "unknown content origin", path: ["knowledge_surfaces", index, "content_origin_id"] });
    if (!sourcePaths.has(surface.source_path)) context.addIssue({ code: "custom", message: "surface path is not inventoried", path: ["knowledge_surfaces", index, "source_path"] });
    for (const authorityId of surface.runtime_authority_ids) if (!authorityIds.has(authorityId)) context.addIssue({ code: "custom", message: "unknown runtime authority", path: ["knowledge_surfaces", index, "runtime_authority_ids"] });
    for (const resourceId of surface.external_resource_ids) if (!resourceIds.has(resourceId)) context.addIssue({ code: "custom", message: "unknown external resource", path: ["knowledge_surfaces", index, "external_resource_ids"] });
  }
  for (const [index, candidate] of value.candidate_skills.entries()) {
    for (const surfaceId of candidate.source_surface_ids) if (!surfaceIds.has(surfaceId)) context.addIssue({ code: "custom", message: "candidate references unknown surface", path: ["candidate_skills", index, "source_surface_ids"] });
    for (const relationship of candidate.advisory_relationships) if (!skillIds.has(relationship.target_skill_id)) context.addIssue({ code: "custom", message: "candidate references unknown related Skill", path: ["candidate_skills", index, "advisory_relationships"] });
  }

  const expectedSummary = {
    file_bytes: value.source_entries.reduce((sum, entry) => sum + entry.bytes, 0),
    content_origins: value.content_origins.length,
    license_claims: value.license_claims.length,
    runtime_authorities: value.runtime_authorities.length,
    external_resources: value.external_resources.length,
    security_findings: value.security_findings.length,
    knowledge_surfaces: value.knowledge_surfaces.length,
  };
  for (const [field, expected] of Object.entries(expectedSummary)) if (value.summary[field as keyof typeof expectedSummary] !== expected) context.addIssue({ code: "custom", message: `${field} summary mismatch`, path: ["summary", field] });
  for (const disposition of HistAgentDispositionSchema.options) {
    const expected = value.source_entries.filter((entry) => entry.disposition === disposition).length;
    if (value.summary.source_dispositions[disposition] !== expected) context.addIssue({ code: "custom", message: `${disposition} source disposition mismatch`, path: ["summary", "source_dispositions", disposition] });
  }
});

function validateUnique(values: string[], label: string, path: PropertyKey[], context: z.RefinementCtx): void {
  if (new Set(values).size !== values.length) context.addIssue({ code: "custom", message: `${label} must be unique`, path });
}

export type HistAgentAudit = z.infer<typeof HistAgentAuditSchema>;
export type HistAgentCandidateSkill = z.infer<typeof HistAgentCandidateSkillSchema>;
