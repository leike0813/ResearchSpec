import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { sha256 } from "../../core/workspace/write-plan.js";
import { HistAgentAuditSchema, type HistAgentAudit } from "../../vendor-audits/histagent.js";

export const HISTAGENT_RELEASE = "snapshot-47bbe21" as const;
export const HISTAGENT_REVISION = "47bbe21dc81618489f5d5929358032883a3fe448" as const;
export const HISTAGENT_AUDIT_SHA256 = "0f0de44a13204fbbc139ec78b6f9320c4078a786e700f1f5bdcda1688cf36269" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const RelativePathSchema = z.string().min(1).refine((value) => !path.posix.isAbsolute(value) && !value.split("/").includes(".."));
const SkillIdSchema = z.enum([
  "histagent-historical-research",
  "histagent-historical-source-identification",
  "histagent-historical-source-analysis",
]);
const ProductionActionSchema = z.enum(["excluded", "retained-evidence", "independent-reimplementation"]);

const DecisionSchema = z.strictObject({
  id: z.string().min(1),
  audit_disposition: z.enum(["retain", "adapt", "replace", "exclude", "confirmed-failure"]),
  production_action: ProductionActionSchema,
});

export const HistAgentProductionPolicySchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("histagent"),
  release: z.literal(HISTAGENT_RELEASE),
  revision: z.literal(HISTAGENT_REVISION),
  audit: z.strictObject({
    path: z.literal("audits/histagent/snapshot-47bbe21/capability-audit.json"),
    sha256: z.literal(HISTAGENT_AUDIT_SHA256),
  }),
  source_evidence_path: z.literal("src/vendor-converters/histagent/source-evidence.json"),
  decisions: z.strictObject({
    source_entries: z.array(DecisionSchema).length(120),
    knowledge_surfaces: z.array(DecisionSchema).length(31),
    content_origins: z.array(DecisionSchema).length(5),
    license_claims: z.array(DecisionSchema).length(4),
    runtime_authorities: z.array(DecisionSchema).length(10),
    external_resources: z.array(DecisionSchema).length(16),
    security_findings: z.array(DecisionSchema).length(10),
    candidates: z.array(DecisionSchema).length(3),
  }),
  capability_map: z.array(z.strictObject({
    surface_id: z.string().min(1),
    skill_id: SkillIdSchema,
    command: z.string().min(1),
    implementation: z.string().min(1),
    implementation_kind: z.enum(["bundled-script", "configured-http-adapter", "optional-local-tool"]),
    optional_dependency: z.string().min(1).nullable(),
    derivation: z.literal("independent-reimplementation"),
    representative_test: z.string().min(1),
  })).length(21),
  skill_contracts: z.array(z.strictObject({
    skill_id: SkillIdSchema,
    formal_entrypoint: RelativePathSchema,
    commands: z.array(z.string().min(1)).min(1),
    hard_dependencies: z.array(z.never()).length(0),
    advisory_relationships: z.array(z.looseObject({})).length(2),
    prospective_domains: z.array(z.enum(["heritage-archive-and-museum-studies", "historical-studies"])).min(1),
  })).length(3),
});

export const HistAgentSourceEvidenceSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("histagent"),
  source_repository: z.literal("https://github.com/microsoft/autogen"),
  code_license: z.literal("MIT"),
  license_evidence: z.strictObject({ path: z.literal("LICENSE-CODE"), sha256: Sha256Schema }),
  files: z.array(z.strictObject({
    histagent_path: RelativePathSchema,
    official_revision: z.string().regex(/^[a-f0-9]{40}$/),
    official_path: RelativePathSchema,
    official_sha256: Sha256Schema,
    claimed_symbols: z.array(z.string().min(1)).min(1),
    source_match: z.enum(["not-found-in-attributed-file", "attributed-baseline-confirmed", "functional-origin-confirmed"]),
    production_action: z.literal("independent-reimplementation"),
    notice_action: z.literal("record-evidence-no-copied-code"),
  })).length(5),
});

export const HistAgentReviewDecisionSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("histagent"),
  release: z.literal(HISTAGENT_RELEASE),
  revision: z.literal(HISTAGENT_REVISION),
  review_status: z.enum(["pending-human-review", "approved", "rejected"]),
  tree_set_sha256: Sha256Schema.nullable(),
  approved_tree_set_sha256: Sha256Schema.nullable(),
  approval_note: z.string().min(1).nullable(),
  approved_at: z.iso.datetime().nullable(),
}).superRefine((value, context) => {
  const approved = value.review_status === "approved";
  if (approved !== (value.approved_tree_set_sha256 !== null && value.approval_note !== null && value.approved_at !== null)) {
    context.addIssue({ code: "custom", message: "approval must bind a tree hash, note, and timestamp" });
  }
  if (approved && value.tree_set_sha256 !== value.approved_tree_set_sha256) {
    context.addIssue({ code: "custom", message: "approval hash must equal the current tree-set hash" });
  }
});

export type HistAgentProductionPolicy = z.infer<typeof HistAgentProductionPolicySchema>;
export type HistAgentSourceEvidence = z.infer<typeof HistAgentSourceEvidenceSchema>;
export type HistAgentReviewDecision = z.infer<typeof HistAgentReviewDecisionSchema>;

export interface HistAgentPolicies {
  audit: HistAgentAudit;
  production: HistAgentProductionPolicy;
  sourceEvidence: HistAgentSourceEvidence;
  review: HistAgentReviewDecision;
}

export async function loadHistAgentPolicies(repoRoot: string): Promise<HistAgentPolicies> {
  const root = path.join(repoRoot, "src/vendor-converters/histagent");
  const auditBytes = await readFile(path.join(repoRoot, "audits/histagent/snapshot-47bbe21/capability-audit.json"));
  if (sha256(auditBytes) !== HISTAGENT_AUDIT_SHA256) throw new Error("HistAgent production policy is bound to a different audit hash.");
  const audit = HistAgentAuditSchema.parse(JSON.parse(auditBytes.toString("utf8")));
  const production = HistAgentProductionPolicySchema.parse(JSON.parse(await readFile(path.join(root, "production-policy.json"), "utf8")));
  const sourceEvidence = HistAgentSourceEvidenceSchema.parse(JSON.parse(await readFile(path.join(root, "source-evidence.json"), "utf8")));
  const review = HistAgentReviewDecisionSchema.parse(JSON.parse(await readFile(path.join(root, "review-decision.json"), "utf8")));

  assertDecisionCoverage(production.decisions.source_entries, audit.source_entries, (item) => item.path, "source entry");
  assertDecisionCoverage(production.decisions.knowledge_surfaces, audit.knowledge_surfaces, (item) => item.surface_id, "knowledge surface");
  assertDecisionCoverage(production.decisions.content_origins, audit.content_origins, (item) => item.origin_id, "content origin");
  assertDecisionCoverage(production.decisions.license_claims, audit.license_claims, (item) => item.claim_id, "license claim");
  assertDecisionCoverage(production.decisions.runtime_authorities, audit.runtime_authorities, (item) => item.authority_id, "runtime authority");
  assertDecisionCoverage(production.decisions.external_resources, audit.external_resources, (item) => item.resource_id, "external resource");
  assertDecisionCoverage(production.decisions.security_findings, audit.security_findings, (item) => item.code, "security finding");
  assertDecisionCoverage(production.decisions.candidates, audit.candidate_skills, (item) => item.skill_id, "candidate");

  const admitted = audit.knowledge_surfaces.filter((item) => !["exclude", "confirmed-failure"].includes(item.disposition));
  assertExactIds(production.capability_map.map((item) => item.surface_id), admitted.map((item) => item.surface_id), "capability map");
  for (const mapping of production.capability_map) {
    const contract = production.skill_contracts.find((item) => item.skill_id === mapping.skill_id);
    if (!contract?.commands.includes(mapping.command)) throw new Error(`HistAgent capability command is not declared: ${mapping.surface_id}`);
  }
  assertExactIds(sourceEvidence.files.map((item) => item.histagent_path), audit.content_origins.find((item) => item.origin_id === "microsoft-autogen")?.scope ?? [], "AutoGen source evidence");
  return { audit, production, sourceEvidence, review };
}

export function assertHistAgentProductionReady(policies: HistAgentPolicies): void {
  if (policies.review.review_status !== "approved" || policies.review.approved_tree_set_sha256 === null) {
    throw new Error("HistAgent production conversion is blocked pending explicit human approval of the complete three-Skill tree set.");
  }
}

function assertDecisionCoverage<T extends { disposition: string }>(decisions: Array<{ id: string; audit_disposition: string; production_action: string }>, audited: T[], id: (item: T) => string, label: string): void {
  assertExactIds(decisions.map((item) => item.id), audited.map(id), `${label} decisions`);
  const byId = new Map(audited.map((item) => [id(item), item]));
  for (const decision of decisions) {
    const source = byId.get(decision.id);
    if (!source || source.disposition !== decision.audit_disposition) throw new Error(`HistAgent ${label} decision drift: ${decision.id}`);
    const mustExclude = source.disposition === "exclude" || source.disposition === "confirmed-failure";
    if (mustExclude !== (decision.production_action === "excluded")) throw new Error(`HistAgent ${label} exclusion mismatch: ${decision.id}`);
  }
}

function assertExactIds(actual: string[], expected: string[], label: string): void {
  const sortedActual = [...actual].sort(compareText);
  const sortedExpected = [...expected].sort(compareText);
  if (new Set(actual).size !== actual.length || JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) throw new Error(`HistAgent ${label} is not exhaustive and unique.`);
}

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
