import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { AuditRelativePathSchema } from "../../vendor-audits/contracts.js";
import { ScientificAgentSkillsAuditSchema, type ScientificAgentSkillsAudit } from "../../vendor-audits/scientific-agent-skills.js";

const SkillIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(64);
const ReviewSchema = z.strictObject({
  outcome: z.enum(["passed", "failed", "not-applicable"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().trim().min(1),
});

const LicenseResolutionSchema = z.strictObject({
  expression: z.string().trim().min(1),
  evidence: z.array(AuditRelativePathSchema).min(1),
  text_source: AuditRelativePathSchema,
}).nullable();

export const ScientificAgentSkillsAdmissionDecisionSchema = z.strictObject({
  upstream_skill_id: SkillIdSchema,
  generated_skill_id: SkillIdSchema,
  disposition: z.enum(["admitted", "excluded"]),
  reason_codes: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
  license: LicenseResolutionSchema,
  security_review: ReviewSchema,
  content_review: ReviewSchema,
  arsu_overlap: z.strictObject({ targets: z.array(SkillIdSchema), evidence: z.array(AuditRelativePathSchema) }),
  tooluniverse_overlap: z.strictObject({ targets: z.array(SkillIdSchema), evidence: z.array(AuditRelativePathSchema) }),
  domain_eligibility: z.enum(["classified", "tool-fit", "none"]),
});

export const ScientificAgentSkillsAdmissionCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("scientific-agent-skills"),
  release: z.literal("v2.53.0"),
  revision: z.literal("9c9bd2e92af12311ecd0c1a643e0931643f9ea04"),
  decisions: z.array(ScientificAgentSkillsAdmissionDecisionSchema).length(147),
});

export const ScientificAgentSkillsDependencyDecisionSchema = z.strictObject({
  from: SkillIdSchema,
  to: SkillIdSchema,
  relation: z.enum(["required", "related", "routing"]),
  resolved_target: SkillIdSchema.nullable(),
  disposition: z.enum(["installed", "advisory", "source-excluded"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().trim().min(1),
});

export const ScientificAgentSkillsDependencyCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  decisions: z.array(ScientificAgentSkillsDependencyDecisionSchema).length(22),
});

export const ScientificAgentSkillsResourceDecisionSchema = z.strictObject({
  upstream_skill_id: SkillIdSchema,
  source_path: AuditRelativePathSchema,
  disposition: z.literal("excluded"),
  reason: z.string().trim().min(1),
  skill_remains_complete: z.literal(true),
});

export const ScientificAgentSkillsResourceCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  default_disposition: z.literal("included"),
  decisions: z.array(ScientificAgentSkillsResourceDecisionSchema),
});

export type ScientificAgentSkillsAdmissionCatalog = z.infer<typeof ScientificAgentSkillsAdmissionCatalogSchema>;
export type ScientificAgentSkillsAdmissionDecision = z.infer<typeof ScientificAgentSkillsAdmissionDecisionSchema>;
export type ScientificAgentSkillsDependencyDecision = z.infer<typeof ScientificAgentSkillsDependencyDecisionSchema>;
export type ScientificAgentSkillsResourceDecision = z.infer<typeof ScientificAgentSkillsResourceDecisionSchema>;

export interface ScientificAgentSkillsPolicies {
  audit: ScientificAgentSkillsAudit;
  admission: ScientificAgentSkillsAdmissionCatalog;
  dependencies: z.infer<typeof ScientificAgentSkillsDependencyCatalogSchema>;
  resources: z.infer<typeof ScientificAgentSkillsResourceCatalogSchema>;
}

export async function loadScientificAgentSkillsPolicies(repoRoot: string): Promise<ScientificAgentSkillsPolicies> {
  const policyRoot = path.join(repoRoot, "src/vendor-converters/scientific-agent-skills");
  const audit = ScientificAgentSkillsAuditSchema.parse(await readJson(path.join(repoRoot, "audits/scientific-agent-skills/v2.53.0/skill-audit.json")));
  const admission = ScientificAgentSkillsAdmissionCatalogSchema.parse(await readJson(path.join(policyRoot, "admission-decisions.json")));
  const dependencies = ScientificAgentSkillsDependencyCatalogSchema.parse(await readJson(path.join(policyRoot, "dependency-decisions.json")));
  const resources = ScientificAgentSkillsResourceCatalogSchema.parse(await readJson(path.join(policyRoot, "resource-decisions.json")));
  validateScientificAgentSkillsPolicies({ audit, admission, dependencies, resources });
  return { audit, admission, dependencies, resources };
}

export function validateScientificAgentSkillsPolicies(policies: ScientificAgentSkillsPolicies): void {
  const auditById = new Map(policies.audit.skills.map((skill) => [skill.skill_id, skill]));
  const decisions = new Map<string, ScientificAgentSkillsAdmissionDecision>();
  for (const decision of policies.admission.decisions) {
    const audit = auditById.get(decision.upstream_skill_id);
    if (!audit) throw new Error(`Admission decision references unknown Skill ${decision.upstream_skill_id}.`);
    if (decisions.has(decision.upstream_skill_id)) throw new Error(`Admission decision repeats Skill ${decision.upstream_skill_id}.`);
    decisions.set(decision.upstream_skill_id, decision);
    const expectedId = `scientific-agent-skills-${decision.upstream_skill_id}`;
    if (decision.generated_skill_id !== expectedId) throw new Error(`Generated Skill ID must be ${expectedId}.`);
    for (const evidence of reviewEvidence(decision)) if (!safeEvidenceExists(policies.audit, audit.source_path, evidence)) throw new Error(`Decision evidence is outside the pinned source: ${decision.upstream_skill_id}:${evidence}`);
    if (audit.scope_disposition === "exclude" && decision.disposition !== "excluded") throw new Error(`Audit hard exclusion cannot be admitted: ${decision.upstream_skill_id}`);
    if (decision.disposition === "admitted") {
      if (decision.reason_codes.length || !decision.license || decision.security_review.outcome !== "passed" || decision.content_review.outcome !== "passed") throw new Error(`Admitted Skill has unresolved review state: ${decision.upstream_skill_id}`);
      if (decision.arsu_overlap.targets.length || decision.tooluniverse_overlap.targets.length || decision.domain_eligibility === "none") throw new Error(`Admitted Skill has overlap or no domain eligibility: ${decision.upstream_skill_id}`);
    } else if (!decision.reason_codes.length) throw new Error(`Excluded Skill requires a reason: ${decision.upstream_skill_id}`);
  }
  if (decisions.size !== auditById.size || [...auditById.keys()].some((id) => !decisions.has(id))) throw new Error("Admission decisions must cover every audited Skill exactly once.");

  const relationKeys = new Set<string>();
  const auditedRelations = policies.audit.skills.flatMap((skill) => skill.relationships.map((relation) => ({ from: skill.skill_id, ...relation })));
  for (const decision of policies.dependencies.decisions) {
    const key = `${decision.from}\0${decision.to}\0${decision.relation}`;
    if (relationKeys.has(key)) throw new Error(`Dependency decision repeats ${decision.from} -> ${decision.to}.`);
    relationKeys.add(key);
    const source = decisions.get(decision.from);
    const target = decisions.get(decision.to);
    if (!source || !target) throw new Error(`Dependency decision references unknown Skill: ${decision.from} -> ${decision.to}.`);
    if (source.disposition === "excluded" && decision.disposition !== "source-excluded") throw new Error(`Excluded dependency source must use source-excluded: ${decision.from}`);
    if (decision.disposition === "installed" && (decision.relation !== "required" || source.disposition !== "admitted" || !decision.resolved_target)) throw new Error(`Installed dependency is not a resolved admitted hard edge: ${decision.from} -> ${decision.to}`);
    if (decision.relation !== "required" && decision.disposition === "installed") throw new Error(`Only required relations may trigger installation: ${decision.from} -> ${decision.to}`);
  }
  const expectedRelations = new Set(auditedRelations.map((item) => `${item.from}\0${item.target_skill_id}\0${item.relation}`));
  if (expectedRelations.size !== relationKeys.size || [...expectedRelations].some((key) => !relationKeys.has(key))) throw new Error("Dependency decisions must classify every audited relationship exactly once.");

  const resourceKeys = new Set<string>();
  for (const decision of policies.resources.decisions) {
    const admission = decisions.get(decision.upstream_skill_id);
    if (!admission || admission.disposition !== "admitted") throw new Error(`Resource exception belongs to a non-admitted Skill: ${decision.upstream_skill_id}`);
    const audit = auditById.get(decision.upstream_skill_id);
    if (!audit) throw new Error(`Resource exception belongs to an unknown Skill: ${decision.upstream_skill_id}`);
    const expectedPrefix = `${audit.source_path}/`;
    if (!decision.source_path.startsWith(expectedPrefix)) throw new Error(`Resource exception is outside its Skill: ${decision.source_path}`);
    if (resourceKeys.has(decision.source_path)) throw new Error(`Resource exception repeats ${decision.source_path}.`);
    resourceKeys.add(decision.source_path);
  }
}

function reviewEvidence(decision: ScientificAgentSkillsAdmissionDecision): string[] {
  return [
    ...(decision.license?.evidence ?? []),
    decision.license?.text_source,
    ...decision.security_review.evidence,
    ...decision.content_review.evidence,
    ...decision.arsu_overlap.evidence,
    ...decision.tooluniverse_overlap.evidence,
  ].filter((value): value is string => Boolean(value));
}

function safeEvidenceExists(audit: ScientificAgentSkillsAudit, skillRoot: string, evidence: string): boolean {
  return evidence === audit.source.license_path || evidence === "SECURITY.md" || evidence === "docs/skills.md" || evidence === skillRoot || evidence.startsWith(`${skillRoot}/`);
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}
