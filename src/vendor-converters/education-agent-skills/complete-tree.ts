import { readFile } from "node:fs/promises";
import path from "node:path";

import { sha256 } from "../../core/workspace/write-plan.js";
import { adaptEducationBodyEvidence, adaptEducationSkill, type BodyEvidenceMatch } from "./adaptation.js";
import {
  loadEducationAgentSkillsPolicies,
  type EducationAdmissionDecision,
  type EducationPolicies,
} from "./policy.js";

export interface EducationTreeFile {
  path: string;
  content: Buffer;
  sha256: string;
  sourcePath?: string;
  sourceSha256?: string;
}

type EducationReferenceFile = EducationTreeFile & { sourcePath: string; sourceSha256: string };

export interface EducationCompleteTree {
  upstreamSkillId: string;
  skillId: string;
  sourcePath: string;
  sourceSha256: string;
  domainId: "curriculum-and-pedagogy" | "education-systems" | "specialist-studies-in-education";
  audience: "teacher-facing" | "student-facing" | "mixed";
  presentRisks: string[];
  boundaryKeys: string[];
  markedFrontmatterEvidenceIds: string[];
  bodyEvidenceMatches: BodyEvidenceMatch[];
  unmatchedBodyEvidenceIds: string[];
  sourceBodySha256: string;
  treeSha256: string;
  files: EducationTreeFile[];
}

export interface EducationCompleteTreeSet {
  policies: EducationPolicies;
  trees: EducationCompleteTree[];
  treeSetSha256: string;
}

export async function renderEducationCompleteTrees(repoRoot: string): Promise<EducationCompleteTreeSet> {
  const policies = await loadEducationAgentSkillsPolicies(repoRoot);
  const auditEvidenceById = new Map(policies.audit.evidence.map((item) => [item.evidence_id, item]));
  const safetyById = new Map(policies.safetyDomains.map((item) => [item.upstream_skill_id, item]));
  const evidenceBySkill = new Map<string, EducationPolicies["evidenceAdaptations"]>();
  for (const decision of policies.evidenceAdaptations) {
    const entries = evidenceBySkill.get(decision.skill_id) ?? [];
    entries.push(decision);
    evidenceBySkill.set(decision.skill_id, entries);
  }
  const sourceRoot = path.join(repoRoot, policies.policy.generation.source_root);
  const auditedFiles = new Map(policies.audit.repository_inventory.files.map((file) => [file.path, file.sha256]));
  const referencePaths = Object.keys(policies.policy.generation.reviewed_references).sort(compareText);
  const trees: EducationCompleteTree[] = [];
  for (const admission of policies.admission.filter((item) => item.disposition === "admitted")) {
    const safety = safetyById.get(admission.upstream_skill_id);
    if (!safety) throw new Error(`Education admitted Skill lacks safety/domain decision: ${admission.upstream_skill_id}`);
    const source = await readFile(path.join(sourceRoot, admission.source_path), "utf8");
    const evidenceDecisions = evidenceBySkill.get(admission.upstream_skill_id) ?? [];
    const adapted = adaptEducationSkill(
      source,
      admission,
      safety,
      evidenceDecisions,
      auditEvidenceById,
      policies,
    );
    const skillRoot = path.posix.dirname(admission.source_path);
    const references = await Promise.all(referencePaths.filter((file) => file.startsWith(skillRoot + "/")).map(async (sourcePath): Promise<EducationReferenceFile> => {
      const relative = path.posix.relative(skillRoot, sourcePath);
      if (!adapted.sourceBody.includes(`](${relative})`)) {
        throw new Error(`Education reference lacks a source link: ${sourcePath}`);
      }
      const bytes = await readFile(path.join(sourceRoot, sourcePath));
      const sourceSha256 = sha256(bytes);
      if (sourceSha256 !== auditedFiles.get(sourcePath)) throw new Error(`Education reference differs from audit: ${sourcePath}`);
      const sourceBody = bytes.toString("utf8");
      const body = adaptEducationBodyEvidence(sourceBody, evidenceDecisions, auditEvidenceById, policies).body;
      const content = body === sourceBody ? bytes : Buffer.from(body, "utf8");
      return { path: relative, sourcePath, sourceSha256, content, sha256: sha256(content) };
    }));
    const files = [
      { ...treeFile("SKILL.md", adapted.content), sourcePath: admission.source_path },
      treeFile("LICENSE", policies.licenseText),
      treeFile("NOTICE.md", renderNotice(admission, policies, adapted.markedFrontmatterEvidenceIds.length, adapted.bodyMatches.length, references)),
      ...references,
    ];
    const treeSha256 = sha256(files.map((file) => `${file.path}\0${file.sha256}`).join("\n"));
    trees.push({
      upstreamSkillId: admission.upstream_skill_id,
      skillId: admission.generated_skill_id,
      sourcePath: admission.source_path,
      sourceSha256: admission.source_sha256,
      domainId: safety.domain_id,
      audience: safety.audience,
      presentRisks: safety.present_risks,
      boundaryKeys: safety.boundary_keys,
      markedFrontmatterEvidenceIds: adapted.markedFrontmatterEvidenceIds,
      bodyEvidenceMatches: adapted.bodyMatches,
      unmatchedBodyEvidenceIds: adapted.unmatchedEvidenceIds,
      sourceBodySha256: sha256(adapted.sourceBody),
      treeSha256,
      files,
    });
  }
  trees.sort((left, right) => compareText(left.skillId, right.skillId));
  const treeSetSha256 = sha256(trees.map((tree) => `${tree.skillId}\0${tree.treeSha256}`).join("\n"));
  return { policies, trees, treeSetSha256 };
}

function renderNotice(
  admission: EducationAdmissionDecision,
  policies: EducationPolicies,
  frontmatterMarkers: number,
  bodyMarkers: number,
  references: EducationReferenceFile[],
): string {
  const referenceNotices = references.map((file) => `- Worked example: \`${file.sourcePath}\` (source SHA-256 \`${file.sourceSha256}\`)\n`).join("");
  return `# Notice

This Skill is adapted from Education Agent Skills by Gareth Manning.

- Source: https://github.com/GarethManning/education-agent-skills
- Snapshot: ${admission.source_release}
- Revision: ${admission.source_revision}
- Upstream Skill: \`${admission.upstream_skill_id}\`
- Source path: \`${admission.source_path}\`
- Source SHA-256: \`${admission.source_sha256}\`
- Generated Skill: \`${admission.generated_skill_id}\`
- License: Creative Commons Attribution-ShareAlike 4.0 International
- License URL: ${policies.policy.license.url}
${referenceNotices}
ResearchSpec changed the global Skill identifier and frontmatter envelope, added
source-bound evidence-status disclosure (${String(frontmatterMarkers)}
frontmatter declarations and ${String(bodyMarkers)} body units marked in this
tree), and added privacy, learner-safety, wellbeing, human-oversight, and
ResearchSpec-authority boundaries where the immutable audit required them. The
complete upstream educational body, declared inputs, outputs, prompt, examples,
and student- or teacher-facing interaction are retained.

Unmarked citations have bibliographic identity verification only; ResearchSpec
has not reviewed whether a cited work supports the upstream claim. This
adaptation is distributed under the same CC BY-SA 4.0 license. ResearchSpec and
Education Agent Skills are independent projects, and this notice does not imply
endorsement by Gareth Manning.
`;
}

function treeFile(filePath: EducationTreeFile["path"], content: string): EducationTreeFile {
  const normalized = content.endsWith("\n") ? content : `${content}\n`;
  const bytes = Buffer.from(normalized, "utf8");
  return { path: filePath, content: bytes, sha256: sha256(bytes) };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
