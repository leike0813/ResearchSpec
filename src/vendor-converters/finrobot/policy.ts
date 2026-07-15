import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { sha256 } from "../../core/workspace/write-plan.js";
import { FinRobotAuditSchema, type FinRobotAudit } from "../../vendor-audits/finrobot.js";

const VENDOR_ID = "finrobot" as const;
const RELEASE = "snapshot-297a8d2" as const;
const REVISION = "297a8d28d099be328c8a8eb658b4f782b93f3651" as const;
const AUDIT_SHA256 = "6b518a933f036333203276263b94cc5b4bd45a924f426972c4547165c5cbb9c3" as const;

const IdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(128);
const RelativePathSchema = z.string().min(1).refine(
  (value) => !path.posix.isAbsolute(value) && !value.split("/").includes(".."),
  "expected a safe relative path",
);
const GitObjectIdSchema = z.string().regex(/^[a-f0-9]{40}$/);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const CapabilityIdSchema = z.enum([
  "company-fundamentals-analysis",
  "competitive-position-analysis",
  "corporate-risk-analysis",
  "financial-news-impact-analysis",
  "financial-statement-analysis",
  "relative-valuation-analysis",
]);
const GeneratedSkillIdSchema = z.enum([
  "financial-research-company-fundamentals",
  "financial-research-competitive-position",
  "financial-research-corporate-risk",
  "financial-research-event-evidence",
  "financial-research-relative-valuation",
  "financial-research-statement-analysis",
]);
const DomainIdSchema = z.enum([
  "accounting-auditing-and-accountability",
  "banking-finance-and-investment",
]);
const ReviewStatusSchema = z.enum(["pending-human-review", "approved", "rejected"]);
const CatalogMetadataShape = {
  schema_version: z.literal("2"),
  vendor_id: z.literal(VENDOR_ID),
  release: z.literal(RELEASE),
  revision: z.literal(REVISION),
  audit_sha256: z.literal(AUDIT_SHA256),
};

export const FinRobotAdmissionCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  review_status: ReviewStatusSchema,
  decisions: z.array(z.strictObject({
    capability_id: CapabilityIdSchema,
    generated_skill_id: GeneratedSkillIdSchema,
    disposition: z.literal("proposed-admission"),
    source_surface_ids: z.array(IdSchema).min(1),
    domain_ids: z.array(DomainIdSchema).min(1),
    license_expression: z.literal("Apache-2.0"),
    curation_profile: IdSchema,
    dependencies: z.array(IdSchema).length(0),
    content_review: ReviewStatusSchema,
    safety_constraints: z.array(IdSchema).min(1),
  })).length(6),
});

export const FinRobotSourceEntryCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    source_path: RelativePathSchema,
    git_object_id: GitObjectIdSchema,
    sha256: Sha256Schema.nullable(),
    content_origin_id: IdSchema,
    license_claim_id: IdSchema.nullable(),
    candidate_surface_ids: z.array(IdSchema),
    generated_skill_ids: z.array(GeneratedSkillIdSchema),
    finrobot_coupling: z.enum(["hard", "light", "none", "not-applicable"]),
    external_dependencies: z.array(z.string().min(1)),
    dependency_closure: z.array(RelativePathSchema),
    production_action: z.enum(["direct-resource", "adapted-resource", "prompt-resource", "evidence-only", "excluded"]),
    output_assets: z.array(RelativePathSchema),
    required_symbols: z.array(z.string().min(1)),
    copied_symbols: z.array(z.string().min(1)),
    adapted_symbols: z.array(z.string().min(1)),
    omitted_symbols: z.array(z.string().min(1)),
    replacement_contracts: z.array(RelativePathSchema),
    prompt_business_logic: z.enum(["copied", "adapted", "none"]),
    symbol_action: z.enum(["preserved-with-explicit-assumptions", "prompt-and-schema-preserved", "provider-boundary-adapted", "none"]),
    converter_execution: z.literal("never"),
    skill_execution: z.enum(["agent-invoked", "not-distributed"]),
    credential_policy: z.enum(["user-configured-not-persisted", "not-applicable"]),
    sensitive_scan: z.enum(["required-on-derived-assets", "not-applicable"]),
    derivation_notice: z.enum(["required", "not-applicable"]),
    reason_code: IdSchema,
  })).length(146),
});

export const FinRobotSurfaceCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    surface_id: IdSchema,
    source_path: RelativePathSchema,
    symbol: z.string().min(1),
    content_origin_id: IdSchema,
    disposition: z.enum(["admitted-resource", "excluded"]),
    generated_skill_id: GeneratedSkillIdSchema.nullable(),
    output_assets: z.array(RelativePathSchema),
    symbol_action: z.enum(["business-logic-preserved", "prompt-and-output-schema-preserved", "provider-boundary-adapted", "none"]),
    reason_code: IdSchema,
  })).length(66),
});

export const FinRobotCurationCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  shared_contract_path: RelativePathSchema,
  required_output_sections: z.array(z.enum([
    "Scope / As-of", "Evidence", "Calculations", "Assumptions", "Analysis",
    "Limitations", "Human Review", "ARSU Handoff",
  ])).length(8),
  profiles: z.array(z.strictObject({
    profile_id: IdSchema,
    capability_id: CapabilityIdSchema,
    generated_skill_id: GeneratedSkillIdSchema,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    compatibility: z.string().trim().min(1),
    fragment_path: RelativePathSchema,
    resource_paths: z.array(RelativePathSchema).min(1),
    runtime_requirements: z.array(z.string().min(1)),
  })).length(6),
});

export const FinRobotOriginCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    origin_id: IdSchema,
    disposition: z.enum(["production-source", "excluded"]),
    license_expression: z.literal("Apache-2.0").nullable(),
    reason_code: IdSchema,
    note: z.string().trim().min(1),
  })).length(5),
});

export const FinRobotLicenseCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    claim_id: IdSchema,
    disposition: z.enum(["preserve", "excluded"]),
    effective_expression: z.literal("Apache-2.0").nullable(),
    reason_code: IdSchema,
    note: z.string().trim().min(1),
  })).length(6),
});

export const FinRobotResourceCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    resource_id: IdSchema,
    kind: z.enum(["disclosure", "report", "user-data", "calculation-tool", "agent-spec", "model-sdk", "financial-service", "credential", "remote-access", "upstream-runtime"]),
    disposition: z.enum(["reference-only", "bundled", "user-configured", "excluded"]),
    applies_to: z.array(GeneratedSkillIdSchema).min(1),
    note: z.string().trim().min(1),
  })).min(10),
});

export const FinRobotRelationshipCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    from: GeneratedSkillIdSchema,
    to: GeneratedSkillIdSchema,
    relation: z.literal("related"),
    disposition: z.literal("advisory"),
    note: z.string().trim().min(1),
  })).min(1),
});

export const FinRobotReviewDecisionSchema = z.strictObject({
  ...CatalogMetadataShape,
  review_status: ReviewStatusSchema,
  draft_set_sha256: Sha256Schema.nullable(),
  approved_draft_set_sha256: Sha256Schema.nullable(),
  approval_note: z.string().trim().min(1).nullable(),
  approved_at: z.iso.datetime().nullable(),
}).superRefine((value, context) => {
  const approved = value.review_status === "approved";
  if (approved !== (value.approved_draft_set_sha256 !== null && value.approval_note !== null && value.approved_at !== null)) {
    context.addIssue({ code: "custom", message: "approved review requires a bound draft hash, approval note, and timestamp" });
  }
  if (approved && value.draft_set_sha256 !== value.approved_draft_set_sha256) {
    context.addIssue({ code: "custom", message: "approval must bind the current draft set" });
  }
});

export type FinRobotAdmissionCatalog = z.infer<typeof FinRobotAdmissionCatalogSchema>;
export type FinRobotSourceEntryCatalog = z.infer<typeof FinRobotSourceEntryCatalogSchema>;
export type FinRobotSurfaceCatalog = z.infer<typeof FinRobotSurfaceCatalogSchema>;
export type FinRobotCurationCatalog = z.infer<typeof FinRobotCurationCatalogSchema>;
export type FinRobotOriginCatalog = z.infer<typeof FinRobotOriginCatalogSchema>;
export type FinRobotLicenseCatalog = z.infer<typeof FinRobotLicenseCatalogSchema>;
export type FinRobotResourceCatalog = z.infer<typeof FinRobotResourceCatalogSchema>;
export type FinRobotRelationshipCatalog = z.infer<typeof FinRobotRelationshipCatalogSchema>;
export type FinRobotReviewDecision = z.infer<typeof FinRobotReviewDecisionSchema>;

export interface FinRobotDraftPolicies {
  audit: FinRobotAudit;
  admission: FinRobotAdmissionCatalog;
  sourceEntries: FinRobotSourceEntryCatalog;
  surfaces: FinRobotSurfaceCatalog;
  curation: FinRobotCurationCatalog;
  origins: FinRobotOriginCatalog;
  licenses: FinRobotLicenseCatalog;
  resources: FinRobotResourceCatalog;
  relationships: FinRobotRelationshipCatalog;
  review: FinRobotReviewDecision;
}

const EXPECTED_SKILLS: Readonly<Record<z.infer<typeof CapabilityIdSchema>, z.infer<typeof GeneratedSkillIdSchema>>> = {
  "company-fundamentals-analysis": "financial-research-company-fundamentals",
  "competitive-position-analysis": "financial-research-competitive-position",
  "corporate-risk-analysis": "financial-research-corporate-risk",
  "financial-news-impact-analysis": "financial-research-event-evidence",
  "financial-statement-analysis": "financial-research-statement-analysis",
  "relative-valuation-analysis": "financial-research-relative-valuation",
};

const POLICY_FILES = {
  admission: "admission-decisions.json",
  sourceEntries: "source-entry-decisions.json",
  surfaces: "surface-decisions.json",
  curation: "curation-decisions.json",
  origins: "origin-decisions.json",
  licenses: "license-decisions.json",
  resources: "resource-decisions.json",
  relationships: "relationship-decisions.json",
  review: "review-decision.json",
} as const;

export async function loadFinRobotDraftPolicies(repoRoot: string): Promise<FinRobotDraftPolicies> {
  const root = path.join(repoRoot, "src/vendor-converters/finrobot");
  const auditBytes = await readFile(path.join(repoRoot, "audits/finrobot/snapshot-297a8d2/capability-audit.json"));
  if (sha256(auditBytes) !== AUDIT_SHA256) throw new Error("FinRobot immutable audit hash differs from the ingestion contract.");
  const policies: FinRobotDraftPolicies = {
    audit: FinRobotAuditSchema.parse(JSON.parse(auditBytes.toString("utf8")) as unknown),
    admission: FinRobotAdmissionCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.admission))),
    sourceEntries: FinRobotSourceEntryCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.sourceEntries))),
    surfaces: FinRobotSurfaceCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.surfaces))),
    curation: FinRobotCurationCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.curation))),
    origins: FinRobotOriginCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.origins))),
    licenses: FinRobotLicenseCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.licenses))),
    resources: FinRobotResourceCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.resources))),
    relationships: FinRobotRelationshipCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.relationships))),
    review: FinRobotReviewDecisionSchema.parse(await readJson(path.join(root, POLICY_FILES.review))),
  };
  await validateFinRobotDraftPolicies(repoRoot, policies);
  return policies;
}

export async function validateFinRobotDraftPolicies(repoRoot: string, policies: FinRobotDraftPolicies): Promise<void> {
  if (policies.audit.source.release !== RELEASE || policies.audit.source.revision !== REVISION) throw new Error("FinRobot audit provenance differs from the ingestion contract.");

  const candidates = new Map(policies.audit.candidate_capabilities.map((item) => [item.capability_id, item]));
  const admissionByCapability = uniqueMap(policies.admission.decisions, (item) => item.capability_id, "FinRobot admission");
  if (admissionByCapability.size !== 6) throw new Error("FinRobot admissions must cover all six candidates exactly once.");
  for (const [capabilityId, candidate] of candidates) {
    const admission = admissionByCapability.get(capabilityId);
    if (!admission || admission.generated_skill_id !== EXPECTED_SKILLS[capabilityId]) throw new Error(`Invalid FinRobot Skill mapping for ${capabilityId}.`);
    if (!sameSet(admission.source_surface_ids, candidate.source_surface_ids)) throw new Error(`FinRobot admission surfaces differ from the audit for ${capabilityId}.`);
    if (admission.content_review !== policies.review.review_status) throw new Error(`FinRobot review state differs for ${capabilityId}.`);
  }

  const auditedSources = uniqueMap(policies.audit.source_entries, (item) => item.path, "audited FinRobot source");
  const sourceDecisions = uniqueMap(policies.sourceEntries.decisions, (item) => item.source_path, "FinRobot source decision");
  if (sourceDecisions.size !== 146) throw new Error("FinRobot source decisions must cover all 146 entries.");
  for (const [sourcePath, source] of auditedSources) {
    const decision = sourceDecisions.get(sourcePath);
    if (!decision || decision.git_object_id !== source.git_object_id || decision.sha256 !== source.sha256 || decision.content_origin_id !== source.content_origin_id) throw new Error(`FinRobot source decision differs from the audit: ${sourcePath}`);
  }
  const distributedSources = policies.sourceEntries.decisions.filter((item) => ["direct-resource", "adapted-resource", "prompt-resource"].includes(item.production_action));
  if (distributedSources.length !== 16) throw new Error("FinRobot production inputs must contain twelve capability sources and four provider-helper sources.");
  if (distributedSources.filter((item) => item.production_action === "direct-resource").length !== 4) throw new Error("FinRobot must directly admit four runtime-independent modules.");
  if (distributedSources.filter((item) => item.production_action === "prompt-resource").length !== 6) throw new Error("FinRobot must preserve six AgentSpec prompt resources.");
  if (distributedSources.some((item) => item.finrobot_coupling === "hard")) throw new Error("A hard FinRobot runtime dependency cannot be distributed.");
  for (const decision of distributedSources) {
    if (decision.content_origin_id !== "root-apache" || !decision.sha256 || decision.output_assets.length === 0) throw new Error(`Distributed FinRobot source lacks evidence or output assets: ${decision.source_path}`);
    const sourceBytes = await readFile(path.join(repoRoot, "vendor/finrobot", decision.source_path));
    if (sha256(sourceBytes) !== decision.sha256) throw new Error(`FinRobot source hash changed: ${decision.source_path}`);
  }

  const candidateSurfaceIds = new Set(policies.audit.candidate_capabilities.flatMap((item) => item.source_surface_ids));
  const auditedSurfaces = uniqueMap(policies.audit.knowledge_surfaces, (item) => item.surface_id, "audited FinRobot surface");
  const surfaceDecisions = uniqueMap(policies.surfaces.decisions, (item) => item.surface_id, "FinRobot surface decision");
  if (candidateSurfaceIds.size !== 32 || surfaceDecisions.size !== 66) throw new Error("FinRobot surface policy must resolve 32 admitted and 34 excluded surfaces.");
  for (const [surfaceId, surface] of auditedSurfaces) {
    const decision = surfaceDecisions.get(surfaceId);
    if (!decision || decision.source_path !== surface.source_path || decision.symbol !== surface.symbol || decision.content_origin_id !== surface.content_origin_id) throw new Error(`FinRobot surface decision differs from the audit: ${surfaceId}`);
    const admitted = candidateSurfaceIds.has(surfaceId);
    if ((decision.disposition === "admitted-resource") !== admitted) throw new Error(`Invalid FinRobot surface disposition: ${surfaceId}`);
  }

  validateDecisionCoverage(policies.audit.content_origins.map((item) => item.origin_id), policies.origins.decisions.map((item) => item.origin_id), "FinRobot origin");
  const productionOrigins = policies.origins.decisions.filter((item) => item.disposition === "production-source");
  if (productionOrigins.length !== 1 || productionOrigins[0]?.origin_id !== "root-apache") throw new Error("Only root-Apache FinRobot content may be distributed.");
  validateDecisionCoverage(policies.audit.license_claims.map((item) => item.claim_id), policies.licenses.decisions.map((item) => item.claim_id), "FinRobot license claim");

  const profiles = uniqueMap(policies.curation.profiles, (item) => item.generated_skill_id, "FinRobot curation profile");
  if (profiles.size !== 6) throw new Error("FinRobot curation profiles must cover all admitted Skills.");
  const curationRoot = path.join(repoRoot, "src/vendor-converters/finrobot");
  const resourcePaths = new Set<string>();
  for (const relative of [policies.curation.shared_contract_path, ...policies.curation.profiles.flatMap((item) => [item.fragment_path, ...item.resource_paths])]) {
    const bytes = await readFile(path.join(curationRoot, relative));
    if (relative.includes("curation/resources/")) {
      resourcePaths.add(relative);
      assertNoSensitiveValues(bytes.toString("utf8"), relative);
      if (relative.endsWith(".py") && /(?:^|\n)\s*(?:from|import)\s+finrobot(?:\.|\s|$)/m.test(bytes.toString("utf8"))) throw new Error(`Derived FinRobot resource retains an upstream runtime import: ${relative}`);
    }
  }
  if (resourcePaths.size !== 14) throw new Error(`FinRobot curation must expose fourteen distinct derived assets, found ${String(resourcePaths.size)}.`);

  const allSkills = new Set(Object.values(EXPECTED_SKILLS));
  const relationKeys = new Set<string>();
  for (const relation of policies.relationships.decisions) {
    if (relation.from === relation.to || !allSkills.has(relation.from) || !allSkills.has(relation.to)) throw new Error(`Invalid FinRobot advisory relation: ${relation.from} -> ${relation.to}`);
    const key = `${relation.from}\0${relation.to}`;
    if (relationKeys.has(key)) throw new Error(`Duplicate FinRobot advisory relation: ${relation.from} -> ${relation.to}`);
    relationKeys.add(key);
  }
}

export function assertNoSensitiveValues(content: string, label: string): void {
  const patterns: Array<[RegExp, string]> = [
    [/(?:^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{16,}/, "secret-like token"],
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
    [/(?:api[_-]?key|token|password)\s*=\s*["'][^"'\n]{8,}["']/i, "embedded credential value"],
    [/(?:\/home\/|\/Users\/)[^\s"']+/, "local user path"],
    [/https?:\/\/(?:localhost|127\.0\.0\.1|[^\s/]+\.internal)(?:[/:]|$)/i, "private endpoint"],
  ];
  for (const [pattern, finding] of patterns) if (pattern.test(content)) throw new Error(`${label} contains a ${finding}.`);
}

export function assertFinRobotProductionReady(policies: FinRobotDraftPolicies): void {
  if (policies.review.review_status !== "approved" || policies.admission.review_status !== "approved") throw new Error("FinRobot production conversion is blocked pending explicit human approval of the complete six-Skill trees.");
}

export const FINROBOT_POLICY = { vendorId: VENDOR_ID, release: RELEASE, revision: REVISION, auditSha256: AUDIT_SHA256, expectedSkills: EXPECTED_SKILLS } as const;

function uniqueMap<T>(items: T[], key: (item: T) => string, label: string): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const value = key(item);
    if (result.has(value)) throw new Error(`${label} identifiers must be unique: ${value}`);
    result.set(value, item);
  }
  return result;
}
function validateDecisionCoverage(expected: string[], actual: string[], label: string): void {
  if (!sameSet(expected, actual) || actual.length !== new Set(actual).size) throw new Error(`${label} decisions must cover the immutable audit exactly once.`);
}
function sameSet(left: string[], right: string[]): boolean { return left.length === right.length && left.every((item) => right.includes(item)); }
async function readJson(filePath: string): Promise<unknown> { return JSON.parse(await readFile(filePath, "utf8")) as unknown; }
