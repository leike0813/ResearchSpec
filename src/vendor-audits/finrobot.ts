import { z } from "zod";

import {
  AnzsrcAuditMetadataSchema,
  AuditRelativePathSchema,
  ContentLicenseReviewSchema,
  VendorAuditFindingSchema,
  VendorAuditRepositorySourceSchema,
} from "./contracts.js";

const AuditObjectIdSchema = z.string().regex(/^[a-f0-9]{40}$/);
const AuditSha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const AuditIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const FinRobotProspectiveDomainSchema = z.enum([
  "accounting-auditing-and-accountability",
  "banking-finance-and-investment",
]);

export const FinRobotOperationalRiskSchema = z.enum([
  "code-execution",
  "credential",
  "data-freshness",
  "dependency-installation",
  "external-service",
  "fixed-assumption",
  "personalized-advice",
  "provider-binding",
  "resource-download",
  "runtime-coupling",
  "stateful-operation",
  "transaction-authority",
  "unsupported-numeric-output",
]);

export const FinRobotSourceEntrySchema = z.strictObject({
  path: AuditRelativePathSchema,
  kind: z.enum(["file", "executable", "gitlink"]),
  git_mode: z.enum(["100644", "100755", "160000"]),
  git_object_id: AuditObjectIdSchema,
  bytes: z.number().int().nonnegative().nullable(),
  sha256: AuditSha256Schema.nullable(),
  content_origin_id: AuditIdSchema,
  disposition: z.enum(["audit-only", "candidate-source", "excluded-scope", "external-reference", "blocked-origin"]),
}).superRefine((value, context) => {
  const gitlink = value.kind === "gitlink";
  if (gitlink !== (value.git_mode === "160000")) context.addIssue({ code: "custom", message: "gitlink kind and mode must agree", path: ["git_mode"] });
  if (gitlink ? value.bytes !== null || value.sha256 !== null : value.bytes === null || value.sha256 === null) context.addIssue({ code: "custom", message: "gitlinks require null bytes and sha256; files require both", path: ["sha256"] });
  if (value.kind === "executable" && value.git_mode !== "100755") context.addIssue({ code: "custom", message: "executable entries require mode 100755", path: ["git_mode"] });
  if (value.kind === "file" && value.git_mode !== "100644") context.addIssue({ code: "custom", message: "ordinary files require mode 100644", path: ["git_mode"] });
});

export const FinRobotContentOriginSchema = z.strictObject({
  origin_id: AuditIdSchema,
  kind: z.enum(["upstream-root", "external-gitlink", "attributed-borrowing", "unclear-import"]),
  scope: z.array(AuditRelativePathSchema).min(1),
  content_license: ContentLicenseReviewSchema,
  redistribution_status: z.enum(["reviewed", "blocked"]),
  note: z.string().min(1),
});

export const FinRobotLicenseClaimSchema = z.strictObject({
  claim_id: AuditIdSchema,
  expression: z.string().min(1).nullable(),
  status: z.enum(["declared", "conflicting", "external", "unknown"]),
  scope: z.array(AuditRelativePathSchema).min(1),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().min(1),
});

export const FinRobotKnowledgeSurfaceSchema = z.strictObject({
  surface_id: AuditIdSchema,
  source_path: AuditRelativePathSchema,
  symbol: z.string().min(1),
  kind: z.enum([
    "agent-role",
    "analysis-template",
    "configuration-prompt",
    "deterministic-method",
    "equity-agent-prompt",
    "financial-assumption",
    "orchestration-prompt",
    "text-generation-prompt",
    "skill-document",
  ]),
  scope: z.enum(["financial-research", "generic-agent-runtime", "execution-runtime", "data-provider-integration"]),
  disposition: z.enum(["candidate", "evidence-only", "exclude"]),
  content_origin_id: AuditIdSchema,
  operational_risks: z.array(FinRobotOperationalRiskSchema),
  findings: z.array(VendorAuditFindingSchema),
  recommendation: z.string().min(1),
}).superRefine((value, context) => {
  if (new Set(value.operational_risks).size !== value.operational_risks.length) context.addIssue({ code: "custom", message: "operational risks must be unique", path: ["operational_risks"] });
});

export const FinRobotCandidateCapabilitySchema = z.strictObject({
  capability_id: z.enum([
    "company-fundamentals-analysis",
    "competitive-position-analysis",
    "corporate-risk-analysis",
    "financial-news-impact-analysis",
    "financial-statement-analysis",
    "relative-valuation-analysis",
  ]),
  source_surface_ids: z.array(AuditIdSchema).min(1),
  readiness: z.enum(["needs-curation", "blocked-review"]),
  ...AnzsrcAuditMetadataSchema.shape,
  prospective_domains: z.array(FinRobotProspectiveDomainSchema).min(1),
  content_license: ContentLicenseReviewSchema,
  overlaps: z.array(z.strictObject({
    target_kind: z.enum(["arsu", "existing-vendor", "upstream-sibling"]),
    target_id: z.string().min(1),
    disposition: z.enum(["complementary", "related", "review"]),
    evidence: z.array(AuditRelativePathSchema).min(1),
    note: z.string().min(1),
  })),
  safety_constraints: z.array(z.enum([
    "deterministic-calculation",
    "human-review",
    "no-credential-handling",
    "no-personalized-advice",
    "no-provider-assumption",
    "no-transaction-authority",
    "provenance-required",
    "source-freshness-required",
  ])).min(1),
  findings: z.array(VendorAuditFindingSchema),
  recommendation: z.string().min(1),
}).superRefine((value, context) => {
  for (const [field, values] of [["source_surface_ids", value.source_surface_ids], ["prospective_domains", value.prospective_domains], ["safety_constraints", value.safety_constraints]] as const) {
    if (new Set(values).size !== values.length) context.addIssue({ code: "custom", message: `${field} must be unique`, path: [field] });
  }
});

export const FinRobotAuditSchema = z.strictObject({
  schema_version: z.literal("1"),
  source: VendorAuditRepositorySourceSchema,
  policy: z.strictObject({
    audit_is_admission: z.literal(false),
    future_change: z.literal("ingest-finrobot"),
    source_has_upstream_skills: z.boolean(),
    nested_gitlinks_initialized: z.literal(false),
    allowed_domains: z.array(FinRobotProspectiveDomainSchema).length(2),
    anzsrc_field_creates_membership: z.literal(false),
    converter_executes_upstream_content: z.literal(false),
    transaction_authority: z.literal(false),
    personalized_advice_authority: z.literal(false),
  }),
  summary: z.strictObject({
    tracked_entries: z.number().int().positive(),
    files: z.number().int().nonnegative(),
    executables: z.number().int().nonnegative(),
    gitlinks: z.number().int().nonnegative(),
    file_bytes: z.number().int().nonnegative(),
    knowledge_surfaces: z.number().int().nonnegative(),
    candidate_capabilities: z.literal(6),
    content_origins: z.number().int().positive(),
    license_claims: z.number().int().positive(),
    risk_counts: z.record(z.string(), z.number().int().nonnegative()),
  }),
  content_origins: z.array(FinRobotContentOriginSchema).min(1),
  license_claims: z.array(FinRobotLicenseClaimSchema).min(1),
  findings: z.array(VendorAuditFindingSchema).min(1),
  source_entries: z.array(FinRobotSourceEntrySchema).min(1),
  knowledge_surfaces: z.array(FinRobotKnowledgeSurfaceSchema),
  candidate_capabilities: z.array(FinRobotCandidateCapabilitySchema).length(6),
}).superRefine((value, context) => {
  validateUnique(value.content_origins.map((item) => item.origin_id), "content origins", ["content_origins"], context);
  validateUnique(value.license_claims.map((item) => item.claim_id), "license claims", ["license_claims"], context);
  validateUnique(value.source_entries.map((item) => item.path), "source paths", ["source_entries"], context);
  validateUnique(value.knowledge_surfaces.map((item) => item.surface_id), "knowledge surfaces", ["knowledge_surfaces"], context);
  validateUnique(value.candidate_capabilities.map((item) => item.capability_id), "candidate capabilities", ["candidate_capabilities"], context);

  const origins = new Set(value.content_origins.map((item) => item.origin_id));
  const sourcePaths = new Set(value.source_entries.map((item) => item.path));
  const surfaceIds = new Set(value.knowledge_surfaces.map((item) => item.surface_id));
  for (const [index, entry] of value.source_entries.entries()) if (!origins.has(entry.content_origin_id)) context.addIssue({ code: "custom", message: "unknown content origin", path: ["source_entries", index, "content_origin_id"] });
  for (const [index, surface] of value.knowledge_surfaces.entries()) {
    if (!origins.has(surface.content_origin_id)) context.addIssue({ code: "custom", message: "unknown content origin", path: ["knowledge_surfaces", index, "content_origin_id"] });
    if (!sourcePaths.has(surface.source_path)) context.addIssue({ code: "custom", message: "knowledge surface source is not inventoried", path: ["knowledge_surfaces", index, "source_path"] });
    if (value.source_entries.find((entry) => entry.path === surface.source_path)?.content_origin_id !== surface.content_origin_id) context.addIssue({ code: "custom", message: "surface origin differs from its source", path: ["knowledge_surfaces", index, "content_origin_id"] });
  }
  for (const [index, candidate] of value.candidate_capabilities.entries()) {
    for (const surfaceId of candidate.source_surface_ids) if (!surfaceIds.has(surfaceId)) context.addIssue({ code: "custom", message: "candidate references unknown surface", path: ["candidate_capabilities", index, "source_surface_ids"] });
  }
  for (const [index, origin] of value.content_origins.entries()) {
    for (const scope of origin.scope) if (![...sourcePaths].some((source) => source === scope || source.startsWith(`${scope}/`))) context.addIssue({ code: "custom", message: "origin scope is not inventoried", path: ["content_origins", index] });
    for (const evidence of origin.content_license.evidence) if (!sourcePaths.has(evidence)) context.addIssue({ code: "custom", message: "origin evidence is not inventoried", path: ["content_origins", index] });
  }
  for (const [index, claim] of value.license_claims.entries()) {
    for (const scope of claim.scope) if (![...sourcePaths].some((source) => source === scope || source.startsWith(`${scope}/`))) context.addIssue({ code: "custom", message: "license scope is not inventoried", path: ["license_claims", index] });
    for (const evidence of claim.evidence) if (!sourcePaths.has(evidence)) context.addIssue({ code: "custom", message: "license evidence is not inventoried", path: ["license_claims", index] });
  }

  const files = value.source_entries.filter((entry) => entry.kind === "file").length;
  const executables = value.source_entries.filter((entry) => entry.kind === "executable").length;
  const bytes = value.source_entries.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0);
  const counts = {
    tracked_entries: value.source_entries.length,
    knowledge_surfaces: value.knowledge_surfaces.length,
    candidate_capabilities: value.candidate_capabilities.length,
    gitlinks: value.source_entries.filter((entry) => entry.kind === "gitlink").length,
  };
  const risks: Record<string, number> = {};
  for (const surface of value.knowledge_surfaces) for (const risk of surface.operational_risks) risks[risk] = (risks[risk] ?? 0) + 1;
  if (Object.entries(risks).some(([key, count]) => value.summary.risk_counts[key] !== count) || Object.keys(value.summary.risk_counts).some((key) => !(key in risks))) context.addIssue({ code: "custom", message: "risk summary mismatch", path: ["summary", "risk_counts"] });
  for (const [key, count] of Object.entries(counts)) {
    if (value.summary[key as keyof typeof counts] !== count) context.addIssue({ code: "custom", message: `${key} summary mismatch`, path: ["summary", key] });
  }
  if (value.policy.source_has_upstream_skills !== value.source_entries.some((entry) => entry.path.endsWith("/SKILL.md") || entry.path === "SKILL.md")) context.addIssue({ code: "custom", message: "upstream Skill presence mismatch", path: ["policy", "source_has_upstream_skills"] });
  if (value.summary.files !== files) context.addIssue({ code: "custom", message: "file summary mismatch", path: ["summary", "files"] });
  if (value.summary.executables !== executables) context.addIssue({ code: "custom", message: "executable summary mismatch", path: ["summary", "executables"] });
  if (value.summary.file_bytes !== bytes) context.addIssue({ code: "custom", message: "byte summary mismatch", path: ["summary", "file_bytes"] });
  if (value.summary.content_origins !== value.content_origins.length) context.addIssue({ code: "custom", message: "origin summary mismatch", path: ["summary", "content_origins"] });
  if (value.summary.license_claims !== value.license_claims.length) context.addIssue({ code: "custom", message: "license summary mismatch", path: ["summary", "license_claims"] });
});

function validateUnique(values: string[], label: string, path: PropertyKey[], context: z.RefinementCtx): void {
  if (new Set(values).size !== values.length) context.addIssue({ code: "custom", message: `${label} must be unique`, path });
}

export type FinRobotAudit = z.infer<typeof FinRobotAuditSchema>;
export type FinRobotCandidateCapability = z.infer<typeof FinRobotCandidateCapabilitySchema>;
export type FinRobotKnowledgeSurface = z.infer<typeof FinRobotKnowledgeSurfaceSchema>;
