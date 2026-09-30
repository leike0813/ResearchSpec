import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { sha256 } from "../../core/workspace/write-plan.js";
import { FinRobotAuditSchema, type FinRobotAudit } from "../../vendor-audits/finrobot.js";
import { FINROBOT_SKILL_DEFINITIONS, type FinRobotSkillDefinition } from "./skill-definitions.js";

const VENDOR_ID = "finrobot" as const;
const RELEASE = "snapshot-2717499" as const;
const REVISION = "2717499b8e30f242640af08c4ad9afd1113c2d45" as const;
const AUDIT_SHA256 = "3a592982ff4bd9f53853ef56b958e330593d7b70594622580975bafa3727884b" as const;

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
  release: z.string().min(1),
  revision: GitObjectIdSchema,
  audit_sha256: Sha256Schema,
};

export const FinRobotAdmissionCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  review_status: ReviewStatusSchema,
  decisions: z.array(z.strictObject({
    capability_id: CapabilityIdSchema,
    generated_skill_id: GeneratedSkillIdSchema,
    disposition: z.literal("admitted"),
    source_surface_ids: z.array(IdSchema).min(1),
    domain_ids: z.array(DomainIdSchema).min(1),
    license_expression: z.literal("Apache-2.0"),
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
    production_action: z.enum(["evidence-only", "excluded"]),
    output_assets: z.array(RelativePathSchema),
    required_symbols: z.array(z.string().min(1)),
    copied_symbols: z.array(z.string().min(1)),
    adapted_symbols: z.array(z.string().min(1)),
    omitted_symbols: z.array(z.string().min(1)),
    replacement_contracts: z.array(RelativePathSchema),
    prompt_business_logic: z.literal("none"),
    symbol_action: z.literal("none"),
    converter_execution: z.literal("never"),
    skill_execution: z.literal("not-distributed"),
    credential_policy: z.literal("not-applicable"),
    sensitive_scan: z.literal("not-applicable"),
    derivation_notice: z.literal("not-applicable"),
    reason_code: IdSchema,
  })).min(1),
});

export const FinRobotSurfaceCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    surface_id: IdSchema,
    source_path: RelativePathSchema,
    symbol: z.string().min(1),
    content_origin_id: IdSchema,
    disposition: z.enum(["admitted-capability", "excluded"]),
    generated_skill_id: GeneratedSkillIdSchema.nullable(),
    output_assets: z.array(RelativePathSchema),
    implementation_kind: z.enum(["agent-procedure", "bundled-script", "external-tool", "none"]),
    reason_code: IdSchema,
  })).min(1),
});

export const FinRobotOriginCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    origin_id: IdSchema,
    disposition: z.enum(["production-source", "excluded"]),
    license_expression: z.literal("Apache-2.0").nullable(),
    reason_code: IdSchema,
    note: z.string().trim().min(1),
  })).min(1),
});

export const FinRobotLicenseCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    claim_id: IdSchema,
    disposition: z.enum(["preserve", "excluded"]),
    effective_expression: z.literal("Apache-2.0").nullable(),
    reason_code: IdSchema,
    note: z.string().trim().min(1),
  })).min(1),
});

export const FinRobotResourceCatalogSchema = z.strictObject({
  ...CatalogMetadataShape,
  decisions: z.array(z.strictObject({
    resource_id: IdSchema,
    kind: z.enum(["disclosure", "report", "user-data", "calculation-tool", "financial-service", "remote-access", "upstream-runtime"]),
    disposition: z.enum(["reference-only", "bundled", "user-configured", "excluded"]),
    applies_to: z.array(GeneratedSkillIdSchema).min(1),
    note: z.string().trim().min(1),
  })).length(8),
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
  published: z.strictObject({
    review_status: z.literal("approved"),
    tree_set_sha256: Sha256Schema,
    approval_note: z.string().trim().min(1),
    approved_at: z.iso.datetime(),
    converter_version: z.enum(["1", "2"]),
  }),
  candidate: z.strictObject({
    review_status: z.enum(["pending-human-review", "rejected"]),
    tree_set_sha256: Sha256Schema.nullable(),
    review_note: z.string().trim().min(1),
  }).nullable(),
}).superRefine((value, context) => {
  if (value.candidate?.tree_set_sha256 === value.published.tree_set_sha256) {
    context.addIssue({ code: "custom", message: "candidate and published tree hashes must differ" });
  }
});

export type FinRobotAdmissionCatalog = z.infer<typeof FinRobotAdmissionCatalogSchema>;
export type FinRobotSourceEntryCatalog = z.infer<typeof FinRobotSourceEntryCatalogSchema>;
export type FinRobotSurfaceCatalog = z.infer<typeof FinRobotSurfaceCatalogSchema>;
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
  origins: "origin-decisions.json",
  licenses: "license-decisions.json",
  resources: "resource-decisions.json",
  relationships: "relationship-decisions.json",
  review: "review-decision.json",
} as const;

export interface FinRobotPolicyInputs {
  policyRoot?: string;
  auditPath?: string;
  sourceRoot?: string;
  definitions?: Record<string, FinRobotSkillDefinition>;
}

export async function loadFinRobotDraftPolicies(repoRoot: string, inputs: FinRobotPolicyInputs = {}): Promise<FinRobotDraftPolicies> {
  const root = inputs.policyRoot ?? path.join(repoRoot, "src/vendor-converters/finrobot");
  const auditBytes = await readFile(inputs.auditPath ?? path.join(repoRoot, `audits/finrobot/${RELEASE}/capability-audit.json`));
  const auditHash = sha256(auditBytes);
  if (!inputs.auditPath && auditHash !== AUDIT_SHA256) throw new Error("FinRobot immutable audit hash differs from the ingestion contract.");
  const policies: FinRobotDraftPolicies = {
    audit: FinRobotAuditSchema.parse(JSON.parse(auditBytes.toString("utf8")) as unknown),
    admission: FinRobotAdmissionCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.admission))),
    sourceEntries: FinRobotSourceEntryCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.sourceEntries))),
    surfaces: FinRobotSurfaceCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.surfaces))),
    origins: FinRobotOriginCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.origins))),
    licenses: FinRobotLicenseCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.licenses))),
    resources: FinRobotResourceCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.resources))),
    relationships: FinRobotRelationshipCatalogSchema.parse(await readJson(path.join(root, POLICY_FILES.relationships))),
    review: FinRobotReviewDecisionSchema.parse(await readJson(path.join(root, POLICY_FILES.review))),
  };
  for (const catalog of [policies.admission, policies.sourceEntries, policies.surfaces, policies.origins, policies.licenses, policies.resources, policies.relationships, policies.review]) {
    if (catalog.audit_sha256 !== auditHash || catalog.release !== policies.audit.source.release || catalog.revision !== policies.audit.source.revision) throw new Error("FinRobot catalog provenance differs from its immutable audit.");
  }
  await validateFinRobotDraftPolicies(repoRoot, policies, inputs);
  return policies;
}

export async function validateFinRobotDraftPolicies(repoRoot: string, policies: FinRobotDraftPolicies, inputs: FinRobotPolicyInputs = {}): Promise<void> {
  if (!inputs.auditPath && (policies.audit.source.release !== RELEASE || policies.audit.source.revision !== REVISION)) throw new Error("FinRobot audit provenance differs from the ingestion contract.");

  const candidates = new Map(policies.audit.candidate_capabilities.map((item) => [item.capability_id, item]));
  const admissionByCapability = uniqueMap(policies.admission.decisions, (item) => item.capability_id, "FinRobot admission");
  if (admissionByCapability.size !== 6) throw new Error("FinRobot admissions must cover all six candidates exactly once.");
  for (const [capabilityId, candidate] of candidates) {
    const admission = admissionByCapability.get(capabilityId);
    if (!admission || admission.generated_skill_id !== EXPECTED_SKILLS[capabilityId]) throw new Error(`Invalid FinRobot Skill mapping for ${capabilityId}.`);
    if (!sameSet(admission.source_surface_ids, candidate.source_surface_ids)) throw new Error(`FinRobot admission surfaces differ from the audit for ${capabilityId}.`);
    if (admission.content_review !== (inputs.auditPath ? policies.review.candidate?.review_status : policies.review.published.review_status)) throw new Error(`FinRobot review state differs for ${capabilityId}.`);
  }

  const auditedSources = uniqueMap(policies.audit.source_entries, (item) => item.path, "audited FinRobot source");
  const sourceDecisions = uniqueMap(policies.sourceEntries.decisions, (item) => item.source_path, "FinRobot source decision");
  if (sourceDecisions.size !== auditedSources.size) throw new Error("FinRobot source decisions must cover every audited entry.");
  for (const [sourcePath, source] of auditedSources) {
    const decision = sourceDecisions.get(sourcePath);
    if (!decision || decision.git_object_id !== source.git_object_id || decision.sha256 !== source.sha256 || decision.content_origin_id !== source.content_origin_id) throw new Error(`FinRobot source decision differs from the audit: ${sourcePath}`);
    if (decision.license_claim_id !== null && !policies.audit.license_claims.some((item) => item.claim_id === decision.license_claim_id)) throw new Error(`FinRobot source references an unknown license: ${sourcePath}`);
    if (decision.dependency_closure.some((item) => !auditedSources.has(item))) throw new Error(`FinRobot source dependency is not inventoried: ${sourcePath}`);
  }
  const capabilityEvidence = policies.sourceEntries.decisions.filter((item) => item.candidate_surface_ids.length > 0);
  const candidateSurfaceIds = new Set(policies.audit.candidate_capabilities.flatMap((item) => item.source_surface_ids));
  if (capabilityEvidence.length !== new Set(policies.audit.knowledge_surfaces.filter((item) => candidateSurfaceIds.has(item.surface_id)).map((item) => item.source_path)).size) throw new Error("FinRobot evidence must cover all admitted source paths.");
  for (const decision of capabilityEvidence) {
    if (decision.production_action !== "evidence-only" || decision.output_assets.length !== 0) throw new Error(`FinRobot source evidence must not publish a runtime asset: ${decision.source_path}`);
    if (!policies.origins.decisions.some((item) => item.origin_id === decision.content_origin_id && item.disposition === "production-source" && item.license_expression === "Apache-2.0") || !decision.sha256) throw new Error(`FinRobot source evidence lacks a reviewed Apache source hash: ${decision.source_path}`);
    const sourceBytes = await readFile(path.join(inputs.sourceRoot ?? path.join(repoRoot, "vendor/finrobot"), decision.source_path));
    if (sha256(sourceBytes) !== decision.sha256) throw new Error(`FinRobot source hash changed: ${decision.source_path}`);
    const sourceSurfaces = policies.audit.knowledge_surfaces.filter((item) => item.source_path === decision.source_path && candidateSurfaceIds.has(item.surface_id)).map((item) => item.surface_id);
    if (!sameSet(sourceSurfaces, decision.candidate_surface_ids)) throw new Error(`FinRobot source surface mapping differs: ${decision.source_path}`);
  }
  if (policies.sourceEntries.decisions.some((item) => item.output_assets.length > 0 || item.replacement_contracts.length > 0)) throw new Error("FinRobot source decisions must not retain obsolete curation or provider outputs.");

  const definedSkills = Object.values(inputs.definitions ?? FINROBOT_SKILL_DEFINITIONS);
  const definedCapabilities = uniqueMap(
    definedSkills.flatMap((definition) => definition.capabilities.map((capability) => ({ definition, capability }))),
    (item) => item.capability.id,
    "FinRobot capability implementation",
  );
  const definedCapabilityIds = new Set(definedSkills.flatMap((definition) => definition.capabilities.map((item) => item.id)));
  if (!sameSet([...candidateSurfaceIds], [...definedCapabilityIds])) throw new Error("FinRobot typed Skill definitions must map every admitted surface exactly once.");
  if (!sameSet(Object.values(EXPECTED_SKILLS), definedSkills.map((definition) => definition.skillId))) throw new Error("FinRobot typed Skill definitions must preserve the six fixed Skill IDs.");
  for (const definition of definedSkills) {
    const admission = policies.admission.decisions.find((item) => item.generated_skill_id === definition.skillId);
    if (!admission || !sameSet(admission.source_surface_ids, definition.capabilities.map((item) => item.id))) throw new Error(`FinRobot typed capability mapping differs from admission: ${definition.skillId}`);
    if (!sameSet(admission.domain_ids, definition.domainIds) || definition.hardDependencies.length !== 0) throw new Error(`FinRobot typed domains or dependencies differ from admission: ${definition.skillId}`);
  }
  const auditedSurfaces = uniqueMap(policies.audit.knowledge_surfaces, (item) => item.surface_id, "audited FinRobot surface");
  const surfaceDecisions = uniqueMap(policies.surfaces.decisions, (item) => item.surface_id, "FinRobot surface decision");
  if (surfaceDecisions.size !== policies.audit.knowledge_surfaces.length) throw new Error("FinRobot surface policy must resolve all audited surfaces.");
  for (const [surfaceId, surface] of auditedSurfaces) {
    const decision = surfaceDecisions.get(surfaceId);
    if (!decision || decision.source_path !== surface.source_path || decision.symbol !== surface.symbol || decision.content_origin_id !== surface.content_origin_id) throw new Error(`FinRobot surface decision differs from the audit: ${surfaceId}`);
    const admitted = candidateSurfaceIds.has(surfaceId);
    if ((decision.disposition === "admitted-capability") !== admitted) throw new Error(`Invalid FinRobot surface disposition: ${surfaceId}`);
    if (!admitted) {
      if (decision.generated_skill_id !== null || decision.output_assets.length !== 0 || decision.implementation_kind !== "none") throw new Error(`Excluded FinRobot surface retains an implementation: ${surfaceId}`);
      continue;
    }
    const implementation = definedCapabilities.get(surfaceId);
    if (!implementation || decision.generated_skill_id !== implementation.definition.skillId || decision.implementation_kind !== implementation.capability.implementation.kind) throw new Error(`FinRobot surface implementation differs from the typed definition: ${surfaceId}`);
    const implementationPath = implementation.capability.implementation.kind === "bundled-script"
      ? implementation.capability.implementation.scriptPath
      : "SKILL.md";
    const expectedAsset = `skills/${implementation.definition.skillId}/${implementationPath}`;
    if (!sameSet(decision.output_assets, [expectedAsset])) throw new Error(`FinRobot surface output asset differs from its implementation: ${surfaceId}`);
  }
  if (surfaceDecisions.size !== definedCapabilities.size + policies.surfaces.decisions.filter((item) => item.disposition === "excluded").length) throw new Error("FinRobot surface decisions contain unknown or unimplemented surfaces.");

  validateDecisionCoverage(policies.audit.content_origins.map((item) => item.origin_id), policies.origins.decisions.map((item) => item.origin_id), "FinRobot origin");
  const productionOrigins = policies.origins.decisions.filter((item) => item.disposition === "production-source");
  const reviewedOrigins = policies.audit.content_origins.filter((item) => item.redistribution_status === "reviewed" && item.content_license.expression === "Apache-2.0");
  if (!sameSet(productionOrigins.map((item) => item.origin_id), reviewedOrigins.map((item) => item.origin_id))) throw new Error("Only reviewed Apache FinRobot origins may support production evidence.");
  validateDecisionCoverage(policies.audit.license_claims.map((item) => item.claim_id), policies.licenses.decisions.map((item) => item.claim_id), "FinRobot license claim");

  const tierThreeSkills = definedSkills.filter((item) => item.tier === 3).map((item) => item.skillId);
  const bundledTools = policies.resources.decisions.filter((item) => item.disposition === "bundled");
  if (bundledTools.length !== 1 || bundledTools[0]?.kind !== "calculation-tool" || !sameSet(bundledTools[0].applies_to, tierThreeSkills)) throw new Error("FinRobot bundled resource decisions must identify exactly the four Tier 3 tools.");
  if (definedSkills.some((item) => item.references.length !== 0)) throw new Error("FinRobot references require a separate progressive-disclosure review.");

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
  if (policies.review.published.review_status !== "approved" || policies.review.published.converter_version !== "2" || policies.review.candidate !== null || policies.admission.review_status !== "approved") throw new Error("FinRobot production conversion requires the approved version 2 complete-tree review state.");
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
