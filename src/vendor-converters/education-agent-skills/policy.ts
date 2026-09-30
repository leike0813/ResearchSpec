import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { z } from "zod";

import { sha256 } from "../../core/workspace/write-plan.js";
import {
  EducationAgentSkillsAuditSchema,
  EDUCATION_AGENT_SKILLS,
  type EducationAgentSkill,
  type EducationAgentSkillsAudit,
} from "../../vendor-audits/education-agent-skills.js";
import {
  EducationAgentSkillsEvidenceMapSchema,
  validateEvidenceMapAgainstAudit,
  type EducationAgentSkillsEvidenceMap,
} from "../../vendor-evidence/education-agent-skills/index.js";

const execFileAsync = promisify(execFile);

export const EDUCATION_VENDOR_ID = "education-agent-skills";
export const EDUCATION_RELEASE = EDUCATION_AGENT_SKILLS.snapshotId;
export const EDUCATION_REVISION = EDUCATION_AGENT_SKILLS.revision;
export const EDUCATION_TREE = EDUCATION_AGENT_SKILLS.tree;
export const EDUCATION_AUDIT_SHA256 = "57b93c4668e6ca29fcb191e35cdea56e85ab0a7888b78256c6e64096422c6406";
export const EDUCATION_EVIDENCE_SHA256 = "5d970cbb765a08f33444f6c9fcabcf4095e469e3fe1dc05730843fd2e7506fd2";
export const EDUCATION_LICENSE_SHA256 = "f8366f5391f49974ea29b26f167b40f9c673714680666651c6fa047dc2314e4f";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const SkillIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
const DomainIdSchema = z.enum([
  "curriculum-and-pedagogy",
  "education-systems",
  "specialist-studies-in-education",
]);
const BoundaryKeySchema = z.enum([
  "authority",
  "minors",
  "privacy",
  "learning-analytics",
  "wellbeing",
  "diagnosis",
]);

const ProductionPolicySchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal(EDUCATION_VENDOR_ID),
  release: z.literal(EDUCATION_RELEASE),
  revision: z.literal(EDUCATION_REVISION),
  tree_hash: z.literal(EDUCATION_TREE),
  converter_version: z.literal("1"),
  audit: z.strictObject({
    path: z.literal(EDUCATION_AGENT_SKILLS.auditPath),
    sha256: z.literal(EDUCATION_AUDIT_SHA256),
    expected_skills: z.literal(165),
  }),
  evidence: z.strictObject({
    path: z.literal(`audits/education-agent-skills/${EDUCATION_RELEASE}/evidence-map.json`),
    sha256: z.literal(EDUCATION_EVIDENCE_SHA256),
    expected_declarations: z.literal(872),
    marker_open: z.literal("⟦UNRESOLVED⟧"),
    marker_close: z.literal("⟦/UNRESOLVED⟧"),
    rule: z.string().trim().min(1),
  }),
  license: z.strictObject({
    expression: z.literal("CC-BY-SA-4.0"),
    author: z.literal("Gareth Manning"),
    url: z.literal("https://creativecommons.org/licenses/by-sa/4.0/"),
    text_path: z.literal("LICENSES/CC-BY-SA-4.0.txt"),
    text_sha256: z.literal(EDUCATION_LICENSE_SHA256),
    upstream_evidence: z.tuple([
      z.literal("LICENSE"),
      z.literal("README.md"),
      z.literal(".claude-plugin/plugin.json"),
      z.literal(".codex-plugin/plugin.json"),
    ]),
  }),
  admission: z.strictObject({
    expected_admitted: z.literal(136),
    expected_excluded: z.literal(29),
    original_framework_exclusions: z.array(SkillIdSchema).length(19),
    third_party_author_exclusions: z.array(SkillIdSchema).length(10),
  }),
  relationships: z.strictObject({
    expected_declarations: z.literal(813),
    semantics: z.literal("advisory"),
    hard_dependency: z.literal(false),
  }),
  domains: z.strictObject({
    allowed: z.tuple([
      z.literal("curriculum-and-pedagogy"),
      z.literal("education-systems"),
      z.literal("specialist-studies-in-education"),
    ]),
    expected_admitted_counts: z.strictObject({
      "curriculum-and-pedagogy": z.literal(54),
      "education-systems": z.literal(9),
      "specialist-studies-in-education": z.literal(73),
    }),
  }),
  safety: z.strictObject({
    principled_blockers: z.tuple([
      z.literal("clinical-diagnosis-or-treatment"),
      z.literal("hidden-profiling-or-monitoring"),
      z.literal("no-human-high-risk-learner-decision"),
      z.literal("unavoidable-unauthorized-sensitive-data-transfer-or-persistence"),
      z.literal("researchspec-workflow-authority"),
      z.literal("unproved-content-origin"),
    ]),
    boundaries: z.record(BoundaryKeySchema, z.string().trim().min(1)),
  }),
  generation: z.strictObject({
    retained_sources: z.array(z.strictObject({
      audit_path: z.string().regex(/^audits\/education-agent-skills\/snapshot-[a-f0-9]+\/skill-audit\.json$/),
      audit_sha256: Sha256Schema,
    })),
    generated_id_prefix: z.literal("education-agent-skills-"),
    source_root: z.literal("vendor/education-agent-skills"),
    copied_skill_files: z.tuple([z.literal("SKILL.md")]),
    excluded_source_surfaces: z.tuple([
      z.literal("installer"),
      z.literal("mcp-runtime"),
      z.literal("test"),
      z.literal("maintenance"),
      z.literal("generated"),
      z.literal("showcase"),
      z.literal("project-doc"),
    ]),
  }),
});

const ReviewDecisionSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal(EDUCATION_VENDOR_ID),
  release: z.literal(EDUCATION_RELEASE),
  revision: z.literal(EDUCATION_REVISION),
  audit_sha256: z.literal(EDUCATION_AUDIT_SHA256),
  evidence_map_sha256: z.literal(EDUCATION_EVIDENCE_SHA256),
  production_policy_sha256: Sha256Schema.nullable(),
  license_sha256: z.literal(EDUCATION_LICENSE_SHA256),
  candidate_tree_set_sha256: Sha256Schema.nullable(),
  review_status: z.enum(["pending-human-review", "approved", "rejected"]),
  approved_tree_set_sha256: Sha256Schema.nullable(),
  approved_by: z.string().trim().min(1).nullable(),
  approved_at: z.iso.datetime({ offset: true }).nullable(),
  note: z.string().trim().min(1),
}).superRefine((value, context) => {
  if (value.review_status === "approved") {
    if (!value.candidate_tree_set_sha256 || value.approved_tree_set_sha256 !== value.candidate_tree_set_sha256 || !value.approved_by || !value.approved_at) {
      context.addIssue({ code: "custom", path: ["review_status"], message: "approved review must bind the candidate hash, reviewer, and approval time" });
    }
  } else if (value.approved_tree_set_sha256 || value.approved_by || value.approved_at) {
    context.addIssue({ code: "custom", path: ["review_status"], message: "non-approved review cannot carry approval fields" });
  }
});

export interface EducationAdmissionDecision {
  upstream_skill_id: string;
  generated_skill_id: string;
  source_path: string;
  source_sha256: string;
  source_release: string;
  source_revision: string;
  disposition: "admitted" | "excluded";
  reason_code: "approved-gareth-cc-by-sa" | "original-framework-origin-unproved" | "third-party-author-authorization-required";
  license: "CC-BY-SA-4.0" | null;
}

export interface EducationEvidenceAdaptationDecision {
  evidence_id: string;
  skill_id: string;
  source_path: string;
  source_sha256: string;
  citation: string;
  work_ids: string[];
  work_statuses: Array<"verified" | "unresolved" | "conflicting" | "not-applicable">;
  generated_skill_admitted: boolean;
  frontmatter_disposition: "marked-unresolved" | "unmarked";
  body_strategy: "author-year-complete-unit" | "none";
}

export interface EducationRelationshipDecision {
  relationship_id: string;
  source_skill_id: string;
  source_path: string;
  source_sha256: string;
  declared_target: string;
  resolved_target_skill_id: string | null;
  source_skill_admitted: boolean;
  semantics: "advisory";
  hard_dependency: false;
}

export interface EducationSafetyDomainDecision {
  upstream_skill_id: string;
  generated_skill_id: string;
  audience: "teacher-facing" | "student-facing" | "mixed";
  present_risks: Array<"minors" | "privacy" | "learning-analytics" | "wellbeing" | "diagnosis">;
  boundary_keys: Array<z.infer<typeof BoundaryKeySchema>>;
  principled_blockers: [];
  domain_id: z.infer<typeof DomainIdSchema>;
}

export interface EducationPolicies {
  policy: z.infer<typeof ProductionPolicySchema>;
  review: z.infer<typeof ReviewDecisionSchema>;
  audit: EducationAgentSkillsAudit;
  evidenceMap: EducationAgentSkillsEvidenceMap;
  policySha256: string;
  licenseText: string;
  admission: EducationAdmissionDecision[];
  evidenceAdaptations: EducationEvidenceAdaptationDecision[];
  relationships: EducationRelationshipDecision[];
  safetyDomains: EducationSafetyDomainDecision[];
}

export async function loadEducationAgentSkillsPolicies(repoRoot: string): Promise<EducationPolicies> {
  const policyPath = path.join(repoRoot, "src/vendor-converters/education-agent-skills/production-policy.json");
  const reviewPath = path.join(repoRoot, "src/vendor-converters/education-agent-skills/review-decision.json");
  const policyBytes = await readFile(policyPath);
  const policy = ProductionPolicySchema.parse(JSON.parse(policyBytes.toString("utf8")) as unknown);
  const review = ReviewDecisionSchema.parse(JSON.parse(await readFile(reviewPath, "utf8")) as unknown);
  const auditJson = await readFile(path.join(repoRoot, policy.audit.path), "utf8");
  const evidenceJson = await readFile(path.join(repoRoot, policy.evidence.path), "utf8");
  const audit = EducationAgentSkillsAuditSchema.parse(JSON.parse(auditJson) as unknown);
  const evidenceMap = EducationAgentSkillsEvidenceMapSchema.parse(JSON.parse(evidenceJson) as unknown);
  validateEvidenceMapAgainstAudit(evidenceMap, audit, auditJson);
  const policySha256 = sha256(policyBytes);
  const licenseText = await readFile(path.join(repoRoot, policy.license.text_path), "utf8");

  if (sha256(auditJson) !== policy.audit.sha256) throw new Error("Education Agent Skills audit bytes differ from production policy.");
  if (sha256(evidenceJson) !== policy.evidence.sha256) throw new Error("Education Agent Skills evidence-map bytes differ from production policy.");
  if (sha256(licenseText) !== policy.license.text_sha256) throw new Error("Education Agent Skills license bytes differ from production policy.");
  if (review.production_policy_sha256 && review.production_policy_sha256 !== policySha256) throw new Error("Education Agent Skills review binds a different production policy.");

  await validatePinnedSource(repoRoot, policy, audit);
  const admission = buildAdmission(policy, audit);
  for (const retained of policy.generation.retained_sources) {
    const bytes = await readFile(path.join(repoRoot, retained.audit_path), "utf8");
    if (sha256(bytes) !== retained.audit_sha256) throw new Error("Education retained source audit differs from policy.");
    const previous = z.object({
      snapshot: z.object({ snapshot_id: z.string().min(1), revision: z.string().regex(/^[a-f0-9]{40}$/) }),
      skills: z.array(z.object({ skill_id: SkillIdSchema, source_sha256: Sha256Schema })),
    }).parse(JSON.parse(bytes) as unknown);
    const previousById = new Map(previous.skills.map((skill) => [skill.skill_id, skill.source_sha256]));
    for (const decision of admission) {
      if (decision.source_revision !== policy.revision || previousById.get(decision.upstream_skill_id) !== decision.source_sha256) continue;
      const { stdout: source } = await execFileAsync("git", ["-C", path.join(repoRoot, policy.generation.source_root), "show", `${previous.snapshot.revision}:${decision.source_path}`]);
      if (sha256(source) !== decision.source_sha256) throw new Error(`Education retained source identity differs: ${decision.upstream_skill_id}`);
      decision.source_release = previous.snapshot.snapshot_id;
      decision.source_revision = previous.snapshot.revision;
    }
  }
  const evidenceAdaptations = buildEvidenceAdaptations(policy, audit, evidenceMap, admission);
  const relationships = buildRelationships(policy, audit, admission);
  const safetyDomains = buildSafetyDomains(policy, audit, admission);
  return { policy, review, audit, evidenceMap, policySha256, licenseText, admission, evidenceAdaptations, relationships, safetyDomains };
}

export function assertEducationProductionApproved(policies: EducationPolicies, treeSetSha256: string): void {
  const review = policies.review;
  if (review.production_policy_sha256 !== policies.policySha256) {
    throw new Error("Education Agent Skills production review does not bind the current production policy.");
  }
  if (review.review_status !== "approved" || review.candidate_tree_set_sha256 !== treeSetSha256 || review.approved_tree_set_sha256 !== treeSetSha256) {
    throw new Error(`Education Agent Skills production conversion requires explicit approval of aggregate SHA-256 ${treeSetSha256}.`);
  }
}

function buildAdmission(
  policy: z.infer<typeof ProductionPolicySchema>,
  audit: EducationAgentSkillsAudit,
): EducationAdmissionDecision[] {
  if (audit.skills.length !== policy.audit.expected_skills) throw new Error("Education Agent Skills audit Skill count differs from policy.");
  assertUniqueSorted(policy.admission.original_framework_exclusions, "original-framework exclusions");
  assertUniqueSorted(policy.admission.third_party_author_exclusions, "third-party-author exclusions");
  const originalActual = audit.skills.filter(hasOriginalFrameworkRisk).map((skill) => skill.skill_id);
  const thirdPartyActual = audit.skills.filter((skill) => skill.contributors.some((item) => item.name === "Sean Hu")).map((skill) => skill.skill_id);
  assertSameValues(policy.admission.original_framework_exclusions, originalActual, "original-framework exclusions");
  assertSameValues(policy.admission.third_party_author_exclusions, thirdPartyActual, "third-party-author exclusions");
  const overlap = policy.admission.original_framework_exclusions.filter((skillId) => policy.admission.third_party_author_exclusions.includes(skillId));
  if (overlap.length) throw new Error(`Education Agent Skills fixed exclusion sets overlap: ${overlap.join(", ")}`);
  const originalSet = new Set(policy.admission.original_framework_exclusions);
  const thirdPartySet = new Set(policy.admission.third_party_author_exclusions);
  const decisions = audit.skills.map((skill): EducationAdmissionDecision => {
    const expectedGenerated = `${policy.generation.generated_id_prefix}${skill.skill_id.split("/")[1]}`;
    if (skill.generated_id !== expectedGenerated) throw new Error(`Education generated ID differs from policy: ${skill.skill_id}`);
    if (originalSet.has(skill.skill_id)) return excluded(skill, "original-framework-origin-unproved");
    if (thirdPartySet.has(skill.skill_id)) return excluded(skill, "third-party-author-authorization-required");
    const contributorNames = [...new Set(skill.contributors.map((item) => item.name))];
    if (contributorNames.length !== 1 || contributorNames[0] !== policy.license.author) {
      throw new Error(`Education admitted Skill has unreviewed contributor provenance: ${skill.skill_id}`);
    }
    if (hasOriginalFrameworkRisk(skill)) throw new Error(`Education admitted Skill has original-framework risk: ${skill.skill_id}`);
    return {
      upstream_skill_id: skill.skill_id,
      generated_skill_id: skill.generated_id,
      source_path: skill.source_path,
      source_sha256: skill.source_sha256,
      source_release: policy.release,
      source_revision: policy.revision,
      disposition: "admitted",
      reason_code: "approved-gareth-cc-by-sa",
      license: policy.license.expression,
    };
  });
  const admitted = decisions.filter((decision) => decision.disposition === "admitted");
  const excludedDecisions = decisions.filter((decision) => decision.disposition === "excluded");
  if (admitted.length !== policy.admission.expected_admitted || excludedDecisions.length !== policy.admission.expected_excluded) {
    throw new Error("Education Agent Skills admission totals differ from production policy.");
  }
  return decisions;
}

function buildEvidenceAdaptations(
  policy: z.infer<typeof ProductionPolicySchema>,
  audit: EducationAgentSkillsAudit,
  evidenceMap: EducationAgentSkillsEvidenceMap,
  admission: EducationAdmissionDecision[],
): EducationEvidenceAdaptationDecision[] {
  if (evidenceMap.declaration_mappings.length !== policy.evidence.expected_declarations) throw new Error("Education evidence declaration total differs from policy.");
  const auditById = new Map(audit.evidence.map((item) => [item.evidence_id, item]));
  const workById = new Map(evidenceMap.works.map((item) => [item.work_id, item]));
  const admittedIds = new Set(admission.filter((item) => item.disposition === "admitted").map((item) => item.upstream_skill_id));
  return evidenceMap.declaration_mappings.map((mapping) => {
    const declaration = auditById.get(mapping.evidence_id);
    if (!declaration) throw new Error(`Education evidence adaptation references absent declaration: ${mapping.evidence_id}`);
    const statuses = [...new Set(mapping.work_ids.map((workId) => {
      const work = workById.get(workId);
      if (!work) throw new Error(`Education evidence adaptation references absent work: ${workId}`);
      return work.existence_status;
    }))].sort(compareText);
    const markerRequired = statuses.includes("unresolved") || statuses.includes("conflicting");
    return {
      evidence_id: mapping.evidence_id,
      skill_id: mapping.skill_id,
      source_path: mapping.source_path,
      source_sha256: mapping.source_sha256,
      citation: mapping.citation,
      work_ids: mapping.work_ids,
      work_statuses: statuses,
      generated_skill_admitted: admittedIds.has(mapping.skill_id),
      frontmatter_disposition: markerRequired ? "marked-unresolved" : "unmarked",
      body_strategy: markerRequired ? "author-year-complete-unit" : "none",
    };
  });
}

function buildRelationships(
  policy: z.infer<typeof ProductionPolicySchema>,
  audit: EducationAgentSkillsAudit,
  admission: EducationAdmissionDecision[],
): EducationRelationshipDecision[] {
  if (audit.relationships.length !== policy.relationships.expected_declarations) throw new Error("Education relationship total differs from policy.");
  const admittedIds = new Set(admission.filter((item) => item.disposition === "admitted").map((item) => item.upstream_skill_id));
  return audit.relationships.map((relationship) => ({
    relationship_id: relationship.relationship_id,
    source_skill_id: relationship.source_skill_id,
    source_path: relationship.source_path,
    source_sha256: relationship.source_sha256,
    declared_target: relationship.declared_target,
    resolved_target_skill_id: relationship.resolved_target_skill_id,
    source_skill_admitted: admittedIds.has(relationship.source_skill_id),
    semantics: policy.relationships.semantics,
    hard_dependency: policy.relationships.hard_dependency,
  }));
}

function buildSafetyDomains(
  policy: z.infer<typeof ProductionPolicySchema>,
  audit: EducationAgentSkillsAudit,
  admission: EducationAdmissionDecision[],
): EducationSafetyDomainDecision[] {
  const admittedById = new Map(admission.filter((item) => item.disposition === "admitted").map((item) => [item.upstream_skill_id, item]));
  const decisions = audit.skills.flatMap((skill): EducationSafetyDomainDecision[] => {
    const admitted = admittedById.get(skill.skill_id);
    if (!admitted) return [];
    if (skill.prospective_domains.length !== 1) throw new Error(`Education admitted Skill must have exactly one reviewed domain: ${skill.skill_id}`);
    const domain = DomainIdSchema.parse(skill.prospective_domains[0]?.domain_id);
    const presentRisks = skill.risks
      .filter((risk) => risk.status === "present" && risk.risk !== "original-framework")
      .map((risk) => risk.risk) as EducationSafetyDomainDecision["present_risks"];
    const boundaryKeys = new Set<z.infer<typeof BoundaryKeySchema>>(["authority"]);
    if (skill.audience.kind !== "teacher-facing" || presentRisks.includes("minors")) boundaryKeys.add("minors");
    for (const risk of presentRisks) boundaryKeys.add(risk);
    return [{
      upstream_skill_id: skill.skill_id,
      generated_skill_id: admitted.generated_skill_id,
      audience: skill.audience.kind,
      present_risks: presentRisks,
      boundary_keys: [...boundaryKeys].sort(compareText),
      principled_blockers: [],
      domain_id: domain,
    }];
  });
  const counts = Object.fromEntries(DomainIdSchema.options.map((domain) => [domain, decisions.filter((item) => item.domain_id === domain).length]));
  if (JSON.stringify(counts) !== JSON.stringify(policy.domains.expected_admitted_counts)) {
    throw new Error("Education admitted domain totals differ from production policy.");
  }
  return decisions;
}

async function validatePinnedSource(
  repoRoot: string,
  policy: z.infer<typeof ProductionPolicySchema>,
  audit: EducationAgentSkillsAudit,
): Promise<void> {
  const sourceRoot = path.join(repoRoot, policy.generation.source_root);
  const { stdout: revision } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD"]);
  const { stdout: tree } = await execFileAsync("git", ["-C", sourceRoot, "rev-parse", "HEAD^{tree}"]);
  const { stdout: status } = await execFileAsync("git", ["-C", sourceRoot, "status", "--porcelain", "--ignore-submodules=all"]);
  if (revision.trim() !== policy.revision || tree.trim() !== policy.tree_hash || status.trim()) throw new Error("Education Agent Skills source checkout differs from the pinned clean snapshot.");
  for (const skill of audit.skills) {
    const source = await readFile(path.join(sourceRoot, skill.source_path));
    if (sha256(source) !== skill.source_sha256) throw new Error(`Education source Skill hash differs from audit: ${skill.skill_id}`);
  }
  for (const evidence of policy.license.upstream_evidence) {
    await readFile(path.join(sourceRoot, evidence));
  }
}

function excluded(skill: EducationAgentSkill, reason: EducationAdmissionDecision["reason_code"]): EducationAdmissionDecision {
  return {
    upstream_skill_id: skill.skill_id,
    generated_skill_id: skill.generated_id,
    source_path: skill.source_path,
    source_sha256: skill.source_sha256,
    source_release: EDUCATION_RELEASE,
    source_revision: EDUCATION_REVISION,
    disposition: "excluded",
    reason_code: reason,
    license: null,
  };
}

function hasOriginalFrameworkRisk(skill: EducationAgentSkill): boolean {
  return skill.risks.some((risk) => risk.risk === "original-framework" && risk.status === "present");
}

function assertUniqueSorted(values: string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`Education ${label} must be unique.`);
  if (JSON.stringify(values) !== JSON.stringify([...values].sort(compareText))) throw new Error(`Education ${label} must be sorted.`);
}

function assertSameValues(expected: string[], actual: string[], label: string): void {
  if (JSON.stringify(expected) !== JSON.stringify([...actual].sort(compareText))) throw new Error(`Education ${label} differ from immutable audit.`);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
