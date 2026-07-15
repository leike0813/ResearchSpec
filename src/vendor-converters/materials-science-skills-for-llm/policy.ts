import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { sha256 } from "../../core/workspace/write-plan.js";
import { AuditRelativePathSchema } from "../../vendor-audits/contracts.js";
import {
  MaterialsScienceSkillsAuditSchema,
  type MaterialsScienceSkillsAudit,
} from "../../vendor-audits/materials-science-skills-for-llm.js";
import { posix, walkFiles } from "../shared/staging.js";

const SkillIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(96);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const ReviewSchema = z.strictObject({
  outcome: z.enum(["passed", "failed", "not-applicable"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  note: z.string().trim().min(1),
});
const LicenseSchema = z.strictObject({
  expression: z.literal("MIT"),
  evidence: z.array(AuditRelativePathSchema).min(1),
  text_source: z.literal("LICENSE"),
}).nullable();

export const MaterialsAdmissionDecisionSchema = z.strictObject({
  upstream_skill_id: SkillIdSchema,
  generated_skill_id: SkillIdSchema,
  disposition: z.enum(["admitted", "excluded"]),
  reason_codes: z.array(SkillIdSchema),
  license: LicenseSchema,
  content_review: ReviewSchema,
  permission_review: ReviewSchema,
  overlap: z.strictObject({
    targets: z.array(SkillIdSchema),
    evidence: z.array(AuditRelativePathSchema).min(1),
    conclusion: z.enum(["distinct", "duplicate", "not-applicable"]),
  }),
  curation_profile: SkillIdSchema.nullable(),
});

export const MaterialsAdmissionCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("materials-science-skills-for-llm"),
  release: z.literal("snapshot-fafd3ab"),
  revision: z.literal("fafd3ab011e4c363658a39c4bb62fc739839d58c"),
  decisions: z.array(MaterialsAdmissionDecisionSchema).length(12),
});

export const MaterialsRelationshipCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  decisions: z.array(z.strictObject({
    from: SkillIdSchema,
    to: SkillIdSchema,
    relation: z.literal("related"),
    disposition: z.enum(["advisory", "source-excluded"]),
    resolved_target: z.null(),
    evidence: z.array(AuditRelativePathSchema).min(1),
    note: z.string().trim().min(1),
  })).length(7),
});

const FileDecisionBase = {
  upstream_skill_id: SkillIdSchema,
  source_path: AuditRelativePathSchema,
  source_sha256: Sha256Schema,
};
export const MaterialsFileDecisionSchema = z.discriminatedUnion("disposition", [
  z.strictObject({ ...FileDecisionBase, disposition: z.literal("copy"), output_path: AuditRelativePathSchema }),
  z.strictObject({ ...FileDecisionBase, disposition: z.literal("curate"), output_path: AuditRelativePathSchema, replacement_asset: AuditRelativePathSchema, replacement_sha256: Sha256Schema }),
  z.strictObject({ ...FileDecisionBase, disposition: z.literal("exclude"), reason: z.string().trim().min(1) }),
]);
export const MaterialsFileCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  decisions: z.array(MaterialsFileDecisionSchema).length(24),
});

export const MaterialsExternalResourceCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  decisions: z.array(z.strictObject({
    upstream_skill_id: SkillIdSchema,
    resource_id: SkillIdSchema,
    kind: z.enum(["software", "model", "data", "service", "documentation", "compute-environment"]),
    disposition: z.enum(["preconfigured", "reference-only", "removed"]),
    evidence: z.array(AuditRelativePathSchema).min(1),
    note: z.string().trim().min(1),
  })).min(7),
});

export type MaterialsAdmissionCatalog = z.infer<typeof MaterialsAdmissionCatalogSchema>;
export type MaterialsAdmissionDecision = z.infer<typeof MaterialsAdmissionDecisionSchema>;
export type MaterialsRelationshipCatalog = z.infer<typeof MaterialsRelationshipCatalogSchema>;
export type MaterialsFileCatalog = z.infer<typeof MaterialsFileCatalogSchema>;
export type MaterialsFileDecision = z.infer<typeof MaterialsFileDecisionSchema>;
export type MaterialsExternalResourceCatalog = z.infer<typeof MaterialsExternalResourceCatalogSchema>;

export interface MaterialsPolicies {
  audit: MaterialsScienceSkillsAudit;
  admission: MaterialsAdmissionCatalog;
  relationships: MaterialsRelationshipCatalog;
  files: MaterialsFileCatalog;
  externalResources: MaterialsExternalResourceCatalog;
}

export async function loadMaterialsPolicies(repoRoot: string): Promise<MaterialsPolicies> {
  const policyRoot = path.join(repoRoot, "src/vendor-converters/materials-science-skills-for-llm");
  const audit = MaterialsScienceSkillsAuditSchema.parse(await readJson(path.join(repoRoot, "audits/materials-science-skills-for-llm/snapshot-fafd3ab/skill-audit.json")));
  const admission = MaterialsAdmissionCatalogSchema.parse(await readJson(path.join(policyRoot, "admission-decisions.json")));
  const relationships = MaterialsRelationshipCatalogSchema.parse(await readJson(path.join(policyRoot, "relationship-decisions.json")));
  const files = MaterialsFileCatalogSchema.parse(await readJson(path.join(policyRoot, "file-decisions.json")));
  const externalResources = MaterialsExternalResourceCatalogSchema.parse(await readJson(path.join(policyRoot, "external-resource-decisions.json")));
  const policies = { audit, admission, relationships, files, externalResources };
  await validateMaterialsPolicies(repoRoot, policies);
  return policies;
}

export async function validateMaterialsPolicies(repoRoot: string, policies: MaterialsPolicies): Promise<void> {
  const sourceRoot = path.join(repoRoot, "vendor/materials-science-skills-for-llm");
  const policyRoot = path.join(repoRoot, "src/vendor-converters/materials-science-skills-for-llm");
  const auditById = new Map(policies.audit.skills.map((skill) => [skill.skill_id, skill]));
  const decisions = new Map<string, MaterialsAdmissionDecision>();
  for (const decision of policies.admission.decisions) {
    const audit = auditById.get(decision.upstream_skill_id);
    if (!audit || decisions.has(decision.upstream_skill_id)) throw new Error(`Invalid or duplicate Materials admission decision: ${decision.upstream_skill_id}`);
    decisions.set(decision.upstream_skill_id, decision);
    const expectedId = `materials-science-skills-${decision.upstream_skill_id}`;
    if (decision.generated_skill_id !== expectedId) throw new Error(`Generated Materials Skill ID must be ${expectedId}.`);
    for (const evidence of decisionEvidence(decision)) if (!evidenceExistsForSkill(audit.source_path, evidence)) throw new Error(`Materials decision evidence is outside the pinned source: ${decision.upstream_skill_id}:${evidence}`);
    if (decision.disposition === "admitted") {
      if (!decision.license || decision.reason_codes.length || decision.content_review.outcome !== "passed" || decision.permission_review.outcome !== "passed" || decision.overlap.conclusion !== "distinct" || !decision.curation_profile) {
        throw new Error(`Admitted Materials Skill has an unresolved production gate: ${decision.upstream_skill_id}`);
      }
    } else if (!decision.reason_codes.length || decision.curation_profile !== null) throw new Error(`Excluded Materials Skill requires reasons and no curation profile: ${decision.upstream_skill_id}`);
  }
  if (decisions.size !== 12 || [...auditById].some(([id]) => !decisions.has(id))) throw new Error("Materials admission decisions must cover all 12 audited Skills exactly once.");
  if ([...decisions.values()].filter((item) => item.disposition === "admitted").length !== 7) throw new Error("Materials production policy must admit exactly 7 Skills.");

  const auditedRelations = new Set(policies.audit.skills.flatMap((skill) => skill.relationships.map((item) => relationKey(skill.skill_id, item.target_skill_id, item.relation))));
  const decidedRelations = new Set<string>();
  for (const relation of policies.relationships.decisions) {
    const key = relationKey(relation.from, relation.to, relation.relation);
    if (decidedRelations.has(key) || !auditedRelations.has(key)) throw new Error(`Invalid or duplicate Materials relationship decision: ${relation.from} -> ${relation.to}`);
    decidedRelations.add(key);
    const source = decisions.get(relation.from);
    if (!source || relation.disposition !== (source.disposition === "admitted" ? "advisory" : "source-excluded")) throw new Error(`Materials relationship disposition does not match source admission: ${relation.from} -> ${relation.to}`);
  }
  if (decidedRelations.size !== auditedRelations.size || [...auditedRelations].some((key) => !decidedRelations.has(key))) throw new Error("Materials relationship decisions must cover all 7 audited relationships.");

  const admitted = new Set([...decisions.values()].filter((item) => item.disposition === "admitted").map((item) => item.upstream_skill_id));
  const expectedFiles = new Set<string>();
  for (const skillId of admitted) for (const file of await walkFiles(path.join(sourceRoot, skillId))) expectedFiles.add(posix(path.relative(sourceRoot, file)));
  const decidedFiles = new Set<string>();
  for (const decision of policies.files.decisions) {
    if (!admitted.has(decision.upstream_skill_id) || !decision.source_path.startsWith(`${decision.upstream_skill_id}/`) || decidedFiles.has(decision.source_path)) throw new Error(`Invalid or duplicate Materials file decision: ${decision.source_path}`);
    decidedFiles.add(decision.source_path);
    const sourceBytes = await readFile(path.join(sourceRoot, decision.source_path));
    if (sha256(sourceBytes) !== decision.source_sha256) throw new Error(`Materials source file hash changed: ${decision.source_path}`);
    if (decision.disposition === "curate") {
      const replacement = await readFile(path.join(policyRoot, decision.replacement_asset));
      if (sha256(replacement) !== decision.replacement_sha256) throw new Error(`Materials curation asset hash changed: ${decision.replacement_asset}`);
    }
  }
  if (expectedFiles.size !== 24 || decidedFiles.size !== expectedFiles.size || [...expectedFiles].some((file) => !decidedFiles.has(file))) throw new Error("Materials file decisions must cover all 24 admitted source files exactly once.");

  const resourcesBySkill = new Set<string>();
  const resourceKeys = new Set<string>();
  for (const resource of policies.externalResources.decisions) {
    if (!admitted.has(resource.upstream_skill_id)) throw new Error(`External resource belongs to a non-admitted Materials Skill: ${resource.upstream_skill_id}`);
    const key = `${resource.upstream_skill_id}\0${resource.resource_id}`;
    if (resourceKeys.has(key)) throw new Error(`Duplicate Materials external resource decision: ${key}`);
    resourceKeys.add(key);
    resourcesBySkill.add(resource.upstream_skill_id);
    for (const evidence of resource.evidence) if (!evidenceExistsForSkill(resource.upstream_skill_id, evidence)) throw new Error(`External resource evidence is outside its Skill: ${resource.upstream_skill_id}:${evidence}`);
  }
  if ([...admitted].some((id) => !resourcesBySkill.has(id))) throw new Error("Every admitted Materials Skill requires reviewed external-resource decisions.");
}

function decisionEvidence(decision: MaterialsAdmissionDecision): string[] {
  return [
    ...(decision.license?.evidence ?? []),
    ...decision.content_review.evidence,
    ...decision.permission_review.evidence,
    ...decision.overlap.evidence,
  ];
}
function evidenceExistsForSkill(skillRoot: string, evidence: string): boolean { return evidence === "LICENSE" || evidence === skillRoot || evidence.startsWith(`${skillRoot}/`); }
function relationKey(from: string, to: string, relation: string): string { return `${from}\0${to}\0${relation}`; }
async function readJson(filePath: string): Promise<unknown> { return JSON.parse(await readFile(filePath, "utf8")) as unknown; }
