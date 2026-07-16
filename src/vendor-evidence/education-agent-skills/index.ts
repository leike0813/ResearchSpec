import { createHash } from "node:crypto";

import {
  EDUCATION_AGENT_SKILLS,
  EducationAgentSkillsAuditSchema,
  type EducationAgentSkillsAudit,
} from "../../vendor-audits/education-agent-skills.js";
import {
  EducationAgentSkillsEvidenceMapSchema,
  EvidenceExistenceStatusSchema,
  EvidenceMappingTypeSchema,
  ScholarDiscoveryOutcomeSchema,
  type EducationAgentSkillsEvidenceMap,
} from "./schema.js";

export const EDUCATION_AGENT_SKILLS_EVIDENCE = {
  mapPath: "audits/education-agent-skills/snapshot-32fce5c/evidence-map.json",
  reportPath: "audits/education-agent-skills/snapshot-32fce5c/evidence-report.md",
} as const;

export {
  EducationAgentSkillsEvidenceMapSchema,
  EvidenceDeclarationMappingSchema,
  EvidenceExistenceStatusSchema,
  EvidenceMappingTypeSchema,
  EvidenceVerificationSourceSchema,
  EvidenceWorkSchema,
  EvidenceWorkTypeSchema,
  ScholarDiscoveryCandidateSchema,
  ScholarDiscoveryResultSchema,
  ScholarDiscoverySchema,
  ScholarDiscoveryOutcomeSchema,
  type EducationAgentSkillsEvidenceMap,
  type EvidenceDeclarationMapping,
  type EvidenceWork,
  type ScholarDiscovery,
} from "./schema.js";

export function parseEducationAgentSkillsEvidenceMap(json: string): EducationAgentSkillsEvidenceMap {
  return EducationAgentSkillsEvidenceMapSchema.parse(JSON.parse(json));
}

export function validateEvidenceMapAgainstAudit(
  evidenceMap: EducationAgentSkillsEvidenceMap,
  audit: EducationAgentSkillsAudit,
  auditJson: string,
): void {
  const value = EducationAgentSkillsEvidenceMapSchema.parse(evidenceMap);
  const auditValue = EducationAgentSkillsAuditSchema.parse(audit);
  const expectedBinding = {
    audit_path: EDUCATION_AGENT_SKILLS.auditPath,
    audit_sha256: sha256(auditJson),
    snapshot_id: auditValue.snapshot.snapshot_id,
    revision: auditValue.snapshot.revision,
    tree_hash: auditValue.snapshot.tree_hash,
  };
  if (JSON.stringify(value.audit_binding) !== JSON.stringify(expectedBinding)) {
    throw new Error("Education Agent Skills evidence map audit binding differs from the immutable audit.");
  }
  const auditEvidenceById = new Map(auditValue.evidence.map((entry) => [entry.evidence_id, entry]));
  if (auditEvidenceById.size !== value.declaration_mappings.length) {
    throw new Error("Education Agent Skills evidence map does not cover the exact audit evidence set.");
  }
  for (const mapping of value.declaration_mappings) {
    const declaration = auditEvidenceById.get(mapping.evidence_id);
    if (!declaration) throw new Error(`Evidence mapping is not present in the audit: ${mapping.evidence_id}`);
    const copied = {
      skill_id: mapping.skill_id,
      source_path: mapping.source_path,
      source_sha256: mapping.source_sha256,
      citation: mapping.citation,
    };
    const expected = {
      skill_id: declaration.skill_id,
      source_path: declaration.source_path,
      source_sha256: declaration.source_sha256,
      citation: declaration.citation,
    };
    if (JSON.stringify(copied) !== JSON.stringify(expected)) {
      throw new Error(`Evidence mapping source identity differs from the audit: ${mapping.evidence_id}`);
    }
  }
}

export function renderEducationAgentSkillsEvidenceJson(
  evidenceMap: EducationAgentSkillsEvidenceMap,
): string {
  return `${JSON.stringify(EducationAgentSkillsEvidenceMapSchema.parse(evidenceMap), null, 2)}\n`;
}

export function renderEducationAgentSkillsEvidenceReport(
  evidenceMap: EducationAgentSkillsEvidenceMap,
): string {
  const value = EducationAgentSkillsEvidenceMapSchema.parse(evidenceMap);
  const statusRows = EvidenceExistenceStatusSchema.options
    .map((status) => {
      const affected = value.summary.affected_skills_by_status[status];
      return `| ${status} | ${String(value.summary.existence_status_counts[status])} | ${String(affected.length)} |`;
    })
    .join("\n");
  const mappingRows = EvidenceMappingTypeSchema.options
    .map((type) => `| ${type} | ${String(value.summary.mapping_type_counts[type])} |`)
    .join("\n");
  const discoveryRows = ScholarDiscoveryOutcomeSchema.options
    .map((outcome) => `| ${outcome} | ${String(value.summary.google_scholar_discovery.outcome_counts[outcome])} |`)
    .join("\n");
  const detailSections = EvidenceExistenceStatusSchema.options.map((status) => {
    const works = value.works.filter((work) => work.existence_status === status);
    const skills = value.summary.affected_skills_by_status[status];
    const workList = works.length === 0
      ? "- None."
      : works.map((work) => `- \`${work.work_id}\` — ${work.canonical.authors.join(", ")} (${work.canonical.year ?? "n.d."}), *${work.canonical.title}*: ${work.review_reason}`).join("\n");
    const skillList = skills.length === 0 ? "None." : skills.map((skill) => `\`${skill}\``).join(", ");
    return `## ${status}\n\nAffected Skills: ${skillList}\n\n${workList}`;
  }).join("\n\n");

  return `# Education Agent Skills Evidence Verification — ${value.audit_binding.snapshot_id}

## Scope and binding

- Immutable audit: \`${value.audit_binding.audit_path}\`
- Audit SHA-256: \`${value.audit_binding.audit_sha256}\`
- Revision: \`${value.audit_binding.revision}\`
- Git tree: \`${value.audit_binding.tree_hash}\`
- Network research completed: ${value.review_scope.network_research_completed_on}
- Evidence declarations: ${String(value.summary.declarations)}
- Normalized works: ${String(value.summary.works)}
- Skills covered: ${String(value.summary.skills)}

This evidence map reviews bibliographic existence and identity only. It does not
review whether a work supports an Education Agent Skills claim, effect size,
interpretation, framework, or recommended practice; \`claim_support_reviewed\`
is false for every work. Routine checking is deterministic and offline.

## Existence outcomes

| Status | Works | Affected Skills |
|---|---:|---:|
${statusRows}

## Declaration mapping

| Match type | Declarations |
|---|---:|
${mappingRows}

Repeated declarations may share one normalized work. Multiple work IDs are
permitted only for explicit composite citations such as separate editions,
translations, or publications.

## Google Scholar supplementary discovery

The ${String(value.summary.google_scholar_discovery.searches)} works that were
unresolved after the initial reliable-source review were targeted through the
Google Scholar lookup endpoint. Returned results, no-result lookups, and the
provider-blocked remainder are recorded separately. Scholar results are
discovery metadata only; every verified outcome still depends on a matched
reliable source in the work record.

| Search outcome | Works |
|---|---:|
${discoveryRows}

Blocked reason: ${value.google_scholar_discovery.blocked_reason ?? "None."}

${detailSections}

## Production boundary

This verification does not change the immutable audit, licensing conclusions,
production registry, domain catalog, vendor bundles, public CLI, or Skill
admission. A separately reviewed \`ingest-education-agent-skills\` change must
consume these results and make its own production decisions.
`;
}

export function checkEducationAgentSkillsEvidenceArtifacts(
  auditJson: string,
  mapJson: string | null,
  report: string | null,
): string[] {
  const errors: string[] = [];
  if (mapJson === null) return [`${EDUCATION_AGENT_SKILLS_EVIDENCE.mapPath} is missing.`];
  let audit: EducationAgentSkillsAudit;
  let evidenceMap: EducationAgentSkillsEvidenceMap;
  try {
    audit = EducationAgentSkillsAuditSchema.parse(JSON.parse(auditJson));
  } catch (error) {
    return [`${EDUCATION_AGENT_SKILLS.auditPath} is invalid: ${errorMessage(error)}`];
  }
  try {
    evidenceMap = parseEducationAgentSkillsEvidenceMap(mapJson);
    validateEvidenceMapAgainstAudit(evidenceMap, audit, auditJson);
  } catch (error) {
    return [`${EDUCATION_AGENT_SKILLS_EVIDENCE.mapPath} is invalid: ${errorMessage(error)}`];
  }
  const expectedJson = renderEducationAgentSkillsEvidenceJson(evidenceMap);
  const expectedReport = renderEducationAgentSkillsEvidenceReport(evidenceMap);
  if (mapJson !== expectedJson) {
    errors.push(`${EDUCATION_AGENT_SKILLS_EVIDENCE.mapPath} differs from canonical deterministic JSON.`);
  }
  if (report !== expectedReport) {
    errors.push(`${EDUCATION_AGENT_SKILLS_EVIDENCE.reportPath} differs from the JSON-derived report.`);
  }
  return errors;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
