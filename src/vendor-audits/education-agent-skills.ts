import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { parseDocument } from "yaml";
import { z } from "zod";

import { AuditRelativePathSchema, isSafeAuditPath } from "./contracts.js";

export const EDUCATION_AGENT_SKILLS = {
  vendorId: "education-agent-skills",
  name: "Education Agent Skills",
  repositoryUrl: "https://github.com/GarethManning/education-agent-skills",
  snapshotId: "snapshot-32fce5c",
  revision: "32fce5c0d097ec675cf81c750a65a379e4d87e3c",
  tree: "3223d79299ae10391c22549debef7ffc9ef7a0e2",
  sourcePath: "vendor/education-agent-skills",
  auditPath: "audits/education-agent-skills/snapshot-32fce5c/skill-audit.json",
  reportPath: "audits/education-agent-skills/snapshot-32fce5c/report.md",
} as const;

const EDUCATION_DOMAIN_REVIEWS = {
  "ai-learning-science": ["3904", "specialist-studies-in-education", "AI-mediated learning design is a specialist education research area; this reviewed audit mapping is not production membership."],
  "ai-literacy": ["3904", "specialist-studies-in-education", "Critical AI literacy is a specialist education capability; the upstream label is evidence only."],
  "curriculum-alignment": ["3901", "curriculum-and-pedagogy", "Curriculum alignment directly concerns curriculum design and pedagogical coherence."],
  "curriculum-assessment": ["3901", "curriculum-and-pedagogy", "Curriculum and classroom assessment capabilities belong prospectively with curriculum and pedagogy."],
  "eal-language-development": ["3904", "specialist-studies-in-education", "EAL and academic-language development is a specialist study in education."],
  "environmental-experiential-learning": ["3904", "specialist-studies-in-education", "Environmental and experiential learning is reviewed as a specialist educational pedagogy."],
  "explicit-instruction": ["3901", "curriculum-and-pedagogy", "Explicit instruction concerns instructional design and classroom pedagogy."],
  "global-cross-cultural-pedagogies": ["3904", "specialist-studies-in-education", "Cross-cultural and place-responsive pedagogies require specialist education review."],
  "historical-thinking": ["3904", "specialist-studies-in-education", "Historical-thinking instruction is a discipline-specific specialist education capability."],
  "inclusive-design": ["3904", "specialist-studies-in-education", "Inclusive and universal learning design is a specialist study in education."],
  "literacy-critical-thinking": ["3901", "curriculum-and-pedagogy", "Literacy and critical-thinking task design concerns curriculum and pedagogy across disciplines."],
  "memory-learning-science": ["3901", "curriculum-and-pedagogy", "Classroom applications of memory and learning science concern instructional pedagogy."],
  "montessori-alternative-approaches": ["3904", "specialist-studies-in-education", "Montessori and alternative approaches are specialist educational pedagogies."],
  "original-frameworks": ["3901", "curriculum-and-pedagogy", "The claimed frameworks concern curriculum and pedagogical design, but originality and provenance remain separately blocked."],
  "professional-learning": ["3903", "education-systems", "Teacher professional learning and institutional improvement concern education systems."],
  "questioning-discussion": ["3901", "curriculum-and-pedagogy", "Classroom questioning and discussion protocols are pedagogical methods."],
  "self-regulated-learning": ["3901", "curriculum-and-pedagogy", "Instructional support for self-regulated learning is a curriculum and pedagogy concern."],
  "student-learning": ["3904", "specialist-studies-in-education", "Live student-facing learning support is a specialist educational surface with additional minor-safety review."],
  "systems-thinking": ["3901", "curriculum-and-pedagogy", "Systems-thinking learning tasks are reviewed as curriculum and pedagogical design."],
  "wellbeing-motivation-agency": ["3904", "specialist-studies-in-education", "Wellbeing, motivation, and agency interventions are specialist education content with diagnostic boundaries."],
} as const satisfies Record<string, readonly ["3901" | "3903" | "3904", "curriculum-and-pedagogy" | "education-systems" | "specialist-studies-in-education", string]>;

export const EducationFileClassificationSchema = z.enum([
  "skill-content",
  "license-provenance",
  "project-doc",
  "installer",
  "mcp-runtime",
  "maintenance",
  "test",
  "generated",
  "showcase",
]);

export const EducationEvidenceStrengthSchema = z.enum(["verified", "partial", "unverified", "conflicting"]);
export const EducationLicenseStatusSchema = z.enum(["clear", "conditional", "unresolved"]);
export const EducationIngestDispositionSchema = z.enum(["candidate", "defer", "exclude"]);
const ReviewConclusionSchema = z.enum(["verified", "partial", "unverified", "conflicting"]);
const JsonValueSchema = z.json();
type JsonValue = z.infer<typeof JsonValueSchema>;
const JsonObjectSchema = z.record(z.string(), JsonValueSchema);

const InventoryFileSchema = z.strictObject({
  path: AuditRelativePathSchema,
  mode: z.string().regex(/^\d{6}$/),
  git_object_id: z.string().regex(/^[a-f0-9]{40}$/),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  classification: EducationFileClassificationSchema,
});

const FrontmatterSectionSchema = z.strictObject({
  keys: z.array(z.string().min(1)),
  value: JsonObjectSchema,
});

const RiskSchema = z.strictObject({
  risk: z.enum(["minors", "privacy", "learning-analytics", "wellbeing", "diagnosis", "original-framework"]),
  status: z.enum(["present", "not-observed"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  conclusion: z.string().min(1),
});

const OverlapSchema = z.strictObject({
  target: z.enum(["arsu", "tooluniverse", "scientific-agent-skills", "materials-science-skills-for-llm", "finrobot", "histagent"]),
  conclusion: z.enum(["distinct", "related", "complementary", "overlap-review"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  rationale: z.string().min(1),
});

const ProspectiveDomainSchema = z.strictObject({
  group_code: z.enum(["3901", "3903", "3904"]),
  domain_id: z.enum(["curriculum-and-pedagogy", "education-systems", "specialist-studies-in-education"]),
  manual_reviewed: z.literal(true),
  rationale: z.string().min(1),
});

const SkillLicenseSchema = z.strictObject({
  status: EducationLicenseStatusSchema,
  expression: z.string().min(1).nullable(),
  evidence: z.array(AuditRelativePathSchema).min(1),
  source_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  conclusion: z.string().min(1),
});

const EducationSkillSchema = z.strictObject({
  skill_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/),
  generated_id: z.string().regex(/^education-agent-skills-[a-z0-9]+(?:-[a-z0-9]+)*$/),
  source_path: AuditRelativePathSchema,
  source_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  frontmatter: z.strictObject({
    yaml_valid: z.literal(true),
    document_count: z.literal(1),
    section_count: z.literal(2),
    standard: FrontmatterSectionSchema,
    upstream: FrontmatterSectionSchema,
    upstream_evidence_strength: z.string().min(1),
  }),
  upstream_metadata: JsonObjectSchema,
  audience: z.strictObject({
    kind: z.enum(["teacher-facing", "student-facing", "mixed"]),
    declared: z.string().min(1).nullable(),
    evidence: z.array(AuditRelativePathSchema).min(1),
    conclusion: z.string().min(1),
  }),
  capabilities: z.array(z.string().min(1)).min(1),
  inputs: z.strictObject({ schema: z.json(), conclusion: z.string().min(1) }),
  outputs: z.strictObject({ schema: z.json().nullable(), conclusion: z.string().min(1) }),
  resources: z.array(z.strictObject({
    kind: z.enum(["network-reference", "learner-data", "external-platform", "none-observed"]),
    external_permission: z.enum(["required", "conditional", "not-required"]),
    evidence: z.array(AuditRelativePathSchema).min(1),
    conclusion: z.string().min(1),
  })).min(1),
  license: SkillLicenseSchema,
  contributors: z.array(z.strictObject({ name: z.string().min(1), source: z.enum(["git-history", "frontmatter"]) })).min(1),
  provenance: z.array(z.strictObject({
    path: AuditRelativePathSchema,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    origin: z.enum(["upstream-git", "declared-contribution"]),
    conclusion: z.string().min(1),
  })).min(1),
  evidence_ids: z.array(z.string().regex(/^evidence-\d{4}$/)).min(1),
  relationship_ids: z.array(z.string().regex(/^relationship-\d{4}$/)),
  overlaps: z.array(OverlapSchema).length(6),
  risks: z.array(RiskSchema).length(6),
  prospective_domains: z.array(ProspectiveDomainSchema).min(1),
  recommendation: z.strictObject({
    disposition: EducationIngestDispositionSchema,
    content_fit_without_license_blocker: z.enum(["candidate", "defer"]),
    rationale: z.string().min(1),
    blockers: z.array(z.string().min(1)).min(1),
  }),
});

const EvidenceSchema = z.strictObject({
  evidence_id: z.string().regex(/^evidence-\d{4}$/),
  skill_id: z.string().min(1),
  source_path: AuditRelativePathSchema,
  source_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  citation: z.string().min(1),
  parsed_identity: z.strictObject({
    authors: z.string().min(1),
    years: z.array(z.string().regex(/^\d{4}$/)),
    title_or_claim: z.string().min(1),
  }),
  existence: ReviewConclusionSchema,
  author_match: ReviewConclusionSchema,
  year_match: ReviewConclusionSchema,
  title_match: ReviewConclusionSchema,
  support_scope: ReviewConclusionSchema,
  misattribution: ReviewConclusionSchema,
  evidence_strength: EducationEvidenceStrengthSchema,
  review_basis: z.string().min(1),
  blocker: z.string().min(1).nullable(),
});

const RelationshipSchema = z.strictObject({
  relationship_id: z.string().regex(/^relationship-\d{4}$/),
  source_skill_id: z.string().min(1),
  source_path: AuditRelativePathSchema,
  source_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  declared_target: z.string().min(1),
  resolved_target_skill_id: z.string().min(1).nullable(),
  resolution: z.enum(["resolved", "missing", "ambiguous", "duplicate"]),
  future_semantics: z.literal("advisory"),
  hard_dependency: z.literal(false),
  conclusion: z.string().min(1),
});

const FindingSchema = z.strictObject({
  code: z.string().min(1),
  severity: z.enum(["blocking", "review", "advisory"]),
  evidence: z.array(AuditRelativePathSchema).min(1),
  conclusion: z.string().min(1),
});

export {
  EducationSkillSchema,
  EvidenceSchema as EducationEvidenceSchema,
  RelationshipSchema as EducationRelationshipSchema,
  SkillLicenseSchema as EducationSkillLicenseSchema,
};

export const EducationAgentSkillsAuditSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor: z.strictObject({
    vendor_id: z.literal("education-agent-skills"),
    name: z.literal("Education Agent Skills"),
    repository_url: z.literal("https://github.com/GarethManning/education-agent-skills"),
    audit_is_admission: z.literal(false),
    future_change: z.literal("ingest-education-agent-skills"),
    generated_id_prefix: z.literal("education-agent-skills-"),
    contributors: z.array(z.string().min(1)).min(1),
  }),
  snapshot: z.strictObject({
    snapshot_id: z.literal("snapshot-32fce5c"),
    release_tag: z.null(),
    revision: z.literal("32fce5c0d097ec675cf81c750a65a379e4d87e3c"),
    tree_hash: z.literal("3223d79299ae10391c22549debef7ffc9ef7a0e2"),
    checkout_path: z.literal("vendor/education-agent-skills"),
    clean: z.literal(true),
    tracked_entry_set_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  repository_inventory: z.strictObject({
    tracked_file_count: z.number().int().positive(),
    total_bytes: z.number().int().positive(),
    classification_counts: z.record(EducationFileClassificationSchema, z.number().int().nonnegative()),
    files: z.array(InventoryFileSchema).min(1),
  }),
  skills: z.array(EducationSkillSchema).min(1),
  evidence: z.array(EvidenceSchema).min(1),
  relationships: z.array(RelationshipSchema),
  findings: z.array(FindingSchema).min(1),
  summary: z.strictObject({
    tracked_files: z.number().int().positive(),
    skills: z.number().int().positive(),
    upstream_domains: z.number().int().positive(),
    prospective_domains: z.number().int().positive(),
    evidence_declarations: z.number().int().positive(),
    distinct_evidence_strings: z.number().int().positive(),
    evidence_strength_counts: z.record(EducationEvidenceStrengthSchema, z.number().int().nonnegative()),
    relationships: z.number().int().nonnegative(),
    unresolved_relationships: z.number().int().nonnegative(),
    license_status_counts: z.record(EducationLicenseStatusSchema, z.number().int().nonnegative()),
    recommendation_counts: z.record(EducationIngestDispositionSchema, z.number().int().nonnegative()),
    risk_counts: z.record(z.enum(["minors", "privacy", "learning-analytics", "wellbeing", "diagnosis", "original-framework"]), z.number().int().nonnegative()),
    blocking_findings: z.number().int().nonnegative(),
  }),
}).superRefine((audit, context) => {
  const filePaths = audit.repository_inventory.files.map((entry) => entry.path);
  checkUniqueAndSorted(filePaths, context, ["repository_inventory", "files"], "inventory paths");
  if (audit.repository_inventory.tracked_file_count !== audit.repository_inventory.files.length) {
    context.addIssue({ code: "custom", path: ["repository_inventory", "tracked_file_count"], message: "tracked file total does not match inventory" });
  }
  const inventoryBytes = audit.repository_inventory.files.reduce((sum, entry) => sum + entry.bytes, 0);
  if (audit.repository_inventory.total_bytes !== inventoryBytes) context.addIssue({ code: "custom", path: ["repository_inventory", "total_bytes"], message: "byte total does not match inventory" });
  for (const classification of EducationFileClassificationSchema.options) {
    const actual = audit.repository_inventory.files.filter((entry) => entry.classification === classification).length;
    if (audit.repository_inventory.classification_counts[classification] !== actual) context.addIssue({ code: "custom", path: ["repository_inventory", "classification_counts", classification], message: "classification count does not match inventory" });
  }
  const skillsById = new Map(audit.skills.map((skill) => [skill.skill_id, skill]));
  checkUniqueAndSorted(audit.skills.map((skill) => skill.skill_id), context, ["skills"], "Skill IDs");
  if (new Set(audit.skills.map((skill) => skill.generated_id)).size !== audit.skills.length) context.addIssue({ code: "custom", path: ["skills"], message: "generated Skill IDs must be unique" });
  const skillFiles = filePaths.filter((filePath) => /^skills\/[^/]+\/[^/]+\/SKILL\.md$/.test(filePath));
  if (!sameValues(skillFiles, audit.skills.map((skill) => skill.source_path))) context.addIssue({ code: "custom", path: ["skills"], message: "Skill records must exactly cover tracked SKILL.md paths" });
  const evidenceById = new Map(audit.evidence.map((entry) => [entry.evidence_id, entry]));
  const relationshipsById = new Map(audit.relationships.map((entry) => [entry.relationship_id, entry]));
  checkUniqueAndSorted(audit.evidence.map((entry) => entry.evidence_id), context, ["evidence"], "evidence IDs");
  checkUniqueAndSorted(audit.relationships.map((entry) => entry.relationship_id), context, ["relationships"], "relationship IDs");
  for (const skill of audit.skills) {
    for (const evidenceId of skill.evidence_ids) {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence || evidence.skill_id !== skill.skill_id || evidence.source_sha256 !== skill.source_sha256) context.addIssue({ code: "custom", path: ["skills", skill.skill_id, "evidence_ids"], message: `invalid evidence reference ${evidenceId}` });
    }
    for (const relationshipId of skill.relationship_ids) {
      const relationship = relationshipsById.get(relationshipId);
      if (!relationship || relationship.source_skill_id !== skill.skill_id || relationship.source_sha256 !== skill.source_sha256) context.addIssue({ code: "custom", path: ["skills", skill.skill_id, "relationship_ids"], message: `invalid relationship reference ${relationshipId}` });
    }
  }
  for (const relationship of audit.relationships) {
    if (relationship.resolved_target_skill_id && !skillsById.has(relationship.resolved_target_skill_id)) context.addIssue({ code: "custom", path: ["relationships", relationship.relationship_id], message: "resolved relationship target is absent" });
  }
  const expectedSummary = summarizeAudit(audit.repository_inventory.files, audit.skills, audit.evidence, audit.relationships, audit.findings);
  if (JSON.stringify(audit.summary) !== JSON.stringify(expectedSummary)) context.addIssue({ code: "custom", path: ["summary"], message: "summary must be derived from audit records" });
});

export type EducationAgentSkillsAudit = z.infer<typeof EducationAgentSkillsAuditSchema>;
export type EducationAgentSkill = z.infer<typeof EducationSkillSchema>;
export type EducationEvidence = z.infer<typeof EvidenceSchema>;
export type EducationRelationship = z.infer<typeof RelationshipSchema>;
type InventoryFile = z.infer<typeof InventoryFileSchema>;
type Finding = z.infer<typeof FindingSchema>;

export function buildEducationAgentSkillsAudit(repoRoot: string): EducationAgentSkillsAudit {
  const sourceRoot = path.join(repoRoot, EDUCATION_AGENT_SKILLS.sourcePath);
  verifySnapshot(sourceRoot);
  const files = readInventory(sourceRoot);
  const filesByPath = new Map(files.map((entry) => [entry.path, entry]));
  const skillPaths = files.map((entry) => entry.path).filter((filePath) => /^skills\/[^/]+\/[^/]+\/SKILL\.md$/.test(filePath));
  const canonicalEvidence = readFileSync(path.join(sourceRoot, "docs/EVIDENCE.md"), "utf8").toLowerCase();
  const parsedSkills = skillPaths.map((sourcePath) => parseSkill(sourceRoot, sourcePath, filesByPath.get(sourcePath), canonicalEvidence));
  const targetIndex = buildTargetIndex(parsedSkills.map((entry) => entry.skill));
  const evidence: EducationEvidence[] = [];
  const relationships: EducationRelationship[] = [];
  for (const parsed of parsedSkills) {
    parsed.skill.evidence_ids = parsed.evidenceSources.map((citation) => {
      const evidenceId = formatSequence("evidence", evidence.length + 1);
      evidence.push(reviewEvidence(evidenceId, parsed.skill, citation, canonicalEvidence));
      return evidenceId;
    });
    const seenTargets = new Set<string>();
    parsed.skill.relationship_ids = parsed.declaredRelationships.map((declaredTarget) => {
      const relationshipId = formatSequence("relationship", relationships.length + 1);
      const matches = targetIndex.get(declaredTarget) ?? [];
      const duplicate = seenTargets.has(declaredTarget);
      seenTargets.add(declaredTarget);
      const resolution = duplicate ? "duplicate" : matches.length === 1 ? "resolved" : matches.length > 1 ? "ambiguous" : "missing";
      relationships.push({
        relationship_id: relationshipId,
        source_skill_id: parsed.skill.skill_id,
        source_path: parsed.skill.source_path,
        source_sha256: parsed.skill.source_sha256,
        declared_target: declaredTarget,
        resolved_target_skill_id: resolution === "resolved" ? matches[0] ?? null : null,
        resolution,
        future_semantics: "advisory",
        hard_dependency: false,
        conclusion: resolution === "resolved" ? "The upstream target resolves uniquely; any later relationship remains advisory." : `The upstream target is ${resolution} and is retained as an audit finding, not a dependency.`,
      });
      return relationshipId;
    });
  }
  const skills = parsedSkills.map((entry) => entry.skill);
  const findings = buildFindings(skills, evidence, relationships);
  const classificationCounts = Object.fromEntries(EducationFileClassificationSchema.options.map((classification) => [classification, files.filter((entry) => entry.classification === classification).length])) as Record<z.infer<typeof EducationFileClassificationSchema>, number>;
  const audit = {
    schema_version: "1" as const,
    vendor: {
      vendor_id: EDUCATION_AGENT_SKILLS.vendorId,
      name: EDUCATION_AGENT_SKILLS.name,
      repository_url: EDUCATION_AGENT_SKILLS.repositoryUrl,
      audit_is_admission: false as const,
      future_change: "ingest-education-agent-skills" as const,
      generated_id_prefix: "education-agent-skills-" as const,
      contributors: repositoryContributors(sourceRoot),
    },
    snapshot: {
      snapshot_id: EDUCATION_AGENT_SKILLS.snapshotId,
      release_tag: null,
      revision: EDUCATION_AGENT_SKILLS.revision,
      tree_hash: EDUCATION_AGENT_SKILLS.tree,
      checkout_path: EDUCATION_AGENT_SKILLS.sourcePath,
      clean: true as const,
      tracked_entry_set_sha256: sha256(files.map((entry) => `${entry.sha256}  ${entry.path}\n`).join("")),
    },
    repository_inventory: {
      tracked_file_count: files.length,
      total_bytes: files.reduce((sum, entry) => sum + entry.bytes, 0),
      classification_counts: classificationCounts,
      files,
    },
    skills,
    evidence,
    relationships,
    findings,
    summary: summarizeAudit(files, skills, evidence, relationships, findings),
  };
  return EducationAgentSkillsAuditSchema.parse(audit);
}

export function renderEducationAgentSkillsAuditJson(audit: EducationAgentSkillsAudit): string {
  return `${JSON.stringify(EducationAgentSkillsAuditSchema.parse(audit), null, 2)}\n`;
}

export function renderEducationAgentSkillsReport(audit: EducationAgentSkillsAudit): string {
  const value = EducationAgentSkillsAuditSchema.parse(audit);
  const classificationRows = EducationFileClassificationSchema.options.map((classification) => `| ${classification} | ${String(value.repository_inventory.classification_counts[classification])} |`).join("\n");
  const evidenceRows = EducationEvidenceStrengthSchema.options.map((status) => `| ${status} | ${String(value.summary.evidence_strength_counts[status])} |`).join("\n");
  const licenseRows = EducationLicenseStatusSchema.options.map((status) => `| ${status} | ${String(value.summary.license_status_counts[status])} |`).join("\n");
  const recommendationLabels = { candidate: "candidate（候选）", defer: "defer（推迟）", exclude: "exclude（排除）" } as const;
  const recommendationRows = EducationIngestDispositionSchema.options.map((status) => `| ${recommendationLabels[status]} | ${String(value.summary.recommendation_counts[status])} |`).join("\n");
  const riskLabels = {
    minors: "minors（未成年人）",
    privacy: "privacy（隐私）",
    "learning-analytics": "learning-analytics（学习分析）",
    wellbeing: "wellbeing（福祉）",
    diagnosis: "diagnosis（诊断）",
    "original-framework": "original-framework（原创框架）",
  } as const;
  const riskRows = Object.entries(value.summary.risk_counts).map(([risk, count]) => `| ${riskLabels[risk as keyof typeof riskLabels]} | ${String(count)} |`).join("\n");
  const prospectiveDomains = [...new Set(value.skills.flatMap((skill) => skill.prospective_domains.map((domain) => `${domain.group_code} ${domain.domain_id}`)))].sort(compareText);
  const findingRows = [
    `- **阻止 根许可证缺失：** 固定的仓库没有根许可证文本；README/插件的 CC BY-SA 4.0 声明和 MCP 子树许可证无法建立 Skill 级的再分发权限。`,
    `- **阻止 证据未独立验证：** 所有 ${String(value.summary.evidence_declarations)} 个证据声明都保留了明确的身份和支持阻止项，因为固定的检出未提供独立的书目标识符或已审查的来源摘录。`,
    `- **审查 上游审计漂移：** 上游兼容性审计报告了 131 个 Skills，而固定的 Git 清单包含 ${String(value.summary.skills)} 个；其抽样结论是过时的观察，不是审计输入。`,
    `- **审查 关系目标漂移：** ${String(value.summary.unresolved_relationships)} 个 chains_well_with 声明缺失、模糊或重复，并保持可见但不成为依赖。`,
    `- **审查 上游证据枚举异常：** ${String(value.findings.find((finding) => finding.code === "UPSTREAM-EVIDENCE-ENUM-ANOMALIES")?.evidence.length ?? 0)} 个 Skills 使用上游证据标签，超出文档化的枚举范围；任何上游标签都不被视为 ResearchSpec 结论。`,
    `- **审查 学生对话模式差异：** ${String(value.findings.find((finding) => finding.code === "STUDENT-DIALOGUE-SCHEMA-DIFFERENCE")?.evidence.length ?? 0)} 个面向学习者的 Skills 省略了 output_schema，而是定义了需要单独敏感内容审查的对话/证据捕获行为。`,
  ].join("\n");
  return `# Education Agent Skills 审计 — ${value.snapshot.snapshot_id}\n\n## 来源绑定\n\n- 官方远程仓库：\`${value.vendor.repository_url}\`\n- 未标记提交：\`${value.snapshot.revision}\`\n- Git 树：\`${value.snapshot.tree_hash}\`\n- 已跟踪条目集 SHA-256：\`${value.snapshot.tracked_entry_set_sha256}\`\n- 已跟踪文件：${String(value.summary.tracked_files)}\n- 来源字节数：${String(value.repository_inventory.total_bytes)}\n- Skills：${String(value.summary.skills)} 个，分布在 ${String(value.summary.upstream_domains)} 个上游域\n\n本审计仅限维护者使用，不构成生产准入。未执行上游代码、安装依赖、配置凭据、启动 MCP 服务器或联系上游服务。过时的上游 \`AUDIT.md\` 和 README 统计数据仅为观察结果；以下所有总计均派生自 \`skill-audit.json\`。\n\n## 仓库清单\n\n| 分类 | 文件数 |\n|---|---:|\n${classificationRows}\n\n## 证据审查\n\n固定的 Skills 声明了 ${String(value.summary.evidence_declarations)} 个命名证据出现（${String(value.summary.distinct_evidence_strings)} 个不同的引用字符串）。每个出现都有明确的存证、作者/年份/标题、支持范围和误归因结论。固定的仓库未提供独立的书目标识符或来源包来验证这些声明，因此未解决的声明仍是阻止项，上游评级不会被提升为 ResearchSpec 结论。常规审计检查处于离线状态。\n\n| ResearchSpec 证据强度 | 声明数 |\n|---|---:|\n${evidenceRows}\n\n## 许可证与来源\n\n仓库在 README 和插件元数据中声称 CC BY-SA 4.0，但固定的根目录不包含许可证文本。唯一已跟踪的 \`LICENSE\` 仅作用于 \`mcp-server/\`。因此，根声明无法为任何 Skill 或嵌入的命名框架清除再分发权限。Git 历史和声明的贡献者按 Skill 保留，但每个 Skill 级的许可证结论仍保持明确。\n\n| 许可证状态 | Skills 数 |\n|---|---:|\n${licenseRows}\n\n## 关系与重叠\n\n所有 ${String(value.summary.relationships)} 个 \`chains_well_with\` 声明均被保留。${String(value.summary.unresolved_relationships)} 个缺失、模糊或重复。已解析的关系仅为前瞻性建议链接；不创建硬依赖。每个 Skill 都包含对 ARSU 和五个现有供应商的明确重叠结论。\n\n## 敏感内容审查\n\n| 风险 | 存在风险的 Skills 数 |\n|---|---:|\n${riskRows}\n\n面向学生的实时辅导、学习者分析、福祉或动机诊断以及原创框架内容仍被阻止，以待后续人工审查。面向教师的内容仍可能间接影响未成年人，因此审计记录该暴露，而非假设仅限成人使用。\n\n## 前瞻性 ANZSRC Group 证据\n\n审计记录了 ${String(value.summary.prospective_domains)} 个手动推理的前瞻性 Groups：${prospectiveDomains.map((item) => `\`${item}\``).join("、")}。这些仅为审计证据，不创建域成员资格。上游域、标签或 Fields 不是自动分类权威。\n\n## 非生产引入建议\n\n| 处置 | Skills 数 |\n|---|---:|\n${recommendationRows}\n\n缺失的根许可证文本阻止了整个固定快照的生产许可，因此已完成的审计可以合理地不包含任何候选。内容适配分析仍按 Skill 保留：面向教师的学习科学、课程与评估、读写与批判性思维、课程对齐和专业学习是未来的候选重点，而学生辅导、分析、福祉/诊断、原创框架和不完整证据在应用许可证阻止项之前默认推迟。\n\n## 未来引入边界\n\n单独的 \`ingest-education-agent-skills\` 变更必须消费此不可变审计。它可以生成 \`education-agent-skills-<upstream-name>\` ID，合并两个前置元数据部分，并默认保留已批准的内容。每个已准出的输出都需要已审查的 CC BY-SA 4.0 许可证文本、Skill 本地的 \`NOTICE.md\` 和来源绑定。MCP 运行时、安装程序、编排器、测试、展示和维护表面被排除。任何内容适配和每个 ANZSRC Group 成员资格都需要单独的来源哈希绑定批准。\n\n## 发现\n\n${findingRows}\n\n阻止性发现：${String(value.summary.blocking_findings)} 个。即使所有前瞻性内容都被阻止，审计完成仍然有效；它不注册供应商、生成包、修改生产域或添加公共 CLI 命令。\n`;
}

export function checkEducationAgentSkillsAuditArtifacts(actualJson: string | null, actualReport: string | null, expectedJson: string, expectedReport: string): string[] {
  const errors: string[] = [];
  if (actualJson !== expectedJson) errors.push(`${EDUCATION_AGENT_SKILLS.auditPath} differs from the deterministic audit.`);
  if (actualReport !== expectedReport) errors.push(`${EDUCATION_AGENT_SKILLS.reportPath} differs from the JSON-derived report.`);
  return errors;
}

export function parseEducationSkillFrontmatter(content: string): { standard: z.infer<typeof FrontmatterSectionSchema>; upstream: z.infer<typeof FrontmatterSectionSchema>; metadata: Record<string, JsonValue> } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  if (!match?.[1]) throw new Error("SKILL.md must contain one leading YAML frontmatter document.");
  const source = match[1];
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length > 0) throw new Error(`Invalid SKILL.md frontmatter: ${document.errors.map((error) => error.message).join("; ")}`);
  const metadata = toJsonObject(document.toJS());
  const standardKeys = ["name", "description", "disable-model-invocation", "user-invocable", "effort"];
  const standardValue = pickKeys(metadata, standardKeys);
  const upstreamValue = pickKeys(metadata, Object.keys(metadata).filter((key) => !standardKeys.includes(key)));
  if (Object.keys(standardValue).length !== standardKeys.length || !("skill_id" in upstreamValue)) throw new Error("SKILL.md must retain the standard and upstream metadata sections.");
  return {
    standard: { keys: Object.keys(standardValue), value: standardValue },
    upstream: { keys: Object.keys(upstreamValue), value: upstreamValue },
    metadata,
  };
}

function parseSkill(sourceRoot: string, sourcePath: string, inventory: InventoryFile | undefined, canonicalEvidence: string): { skill: EducationAgentSkill; evidenceSources: string[]; declaredRelationships: string[] } {
  if (!inventory) throw new Error(`Inventory record missing for ${sourcePath}`);
  const content = readFileSync(path.join(sourceRoot, sourcePath), "utf8");
  const parsed = parseEducationSkillFrontmatter(content);
  const metadata = parsed.metadata;
  const skillId = requireString(metadata, "skill_id");
  const name = requireString(metadata, "name");
  const domain = requireString(metadata, "domain");
  if (skillId !== `${domain}/${name}` || sourcePath !== `skills/${skillId}/SKILL.md`) throw new Error(`Skill identity differs from source path: ${sourcePath}`);
  const evidenceSources = requireStringArray(metadata, "evidence_sources");
  const declaredRelationships = requireStringArray(metadata, "chains_well_with");
  const audience = audienceReview(domain, metadata, content, sourcePath);
  const license = licenseReview(sourcePath, inventory.sha256);
  const contentFit = contentFitReview(domain, metadata, content);
  const skill: EducationAgentSkill = {
    skill_id: skillId,
    generated_id: `education-agent-skills-${name}`,
    source_path: sourcePath,
    source_sha256: inventory.sha256,
    frontmatter: {
      yaml_valid: true,
      document_count: 1,
      section_count: 2,
      standard: parsed.standard,
      upstream: parsed.upstream,
      upstream_evidence_strength: requireString(metadata, "evidence_strength"),
    },
    upstream_metadata: metadata,
    audience,
    capabilities: [requireString(metadata, "description")],
    inputs: { schema: metadata.input_schema ?? null, conclusion: "The declared input schema is retained as upstream observation and does not authorize collection or access." },
    outputs: { schema: metadata.output_schema ?? null, conclusion: metadata.output_schema ? "The declared output schema is retained as upstream observation, not a ResearchSpec contract." : "No output_schema is declared; student-facing dialogue behavior must be reviewed before any ingest." },
    resources: resourceReview(metadata, content, sourcePath),
    license,
    contributors: fileContributors(sourceRoot, sourcePath, metadata),
    provenance: [{ path: sourcePath, sha256: inventory.sha256, origin: metadata.contributor ? "declared-contribution" : "upstream-git", conclusion: "The complete tracked file is bound to the pinned Git object and SHA-256; embedded third-party framework provenance remains subject to the license blocker." }],
    evidence_ids: evidenceSources.map(() => "evidence-0000"),
    relationship_ids: [],
    overlaps: overlapReview(domain, sourcePath),
    risks: riskReview(domain, metadata, content, sourcePath),
    prospective_domains: domainReview(domain),
    recommendation: {
      disposition: "exclude",
      content_fit_without_license_blocker: contentFit,
      rationale: `Content fit would be ${contentFit}, but the pinned root has no CC BY-SA 4.0 license text and therefore cannot support production redistribution.`,
      blockers: ["No tracked root license text proves the README/plugin CC BY-SA 4.0 claim or its scope over this Skill and embedded attributed frameworks."],
    },
  };
  void canonicalEvidence;
  return { skill, evidenceSources, declaredRelationships };
}

function reviewEvidence(evidenceId: string, skill: EducationAgentSkill, citation: string, canonicalEvidence: string): EducationEvidence {
  const years = [...citation.matchAll(/\b(?:18|19|20)\d{2}\b/g)].map((match) => match[0]);
  const separator = citation.includes(" — ") ? " — " : citation.includes(" - ") ? " - " : null;
  const [identity = citation, ...claimParts] = separator ? citation.split(separator) : [citation];
  const authorMatch = /^(.+?)\s*\(/.exec(identity);
  const authors = authorMatch?.[1]?.trim() || identity.trim();
  const titleOrClaim = claimParts.join(separator ?? " ").trim() || citation.trim();
  const normalizedSignal = `${authors} ${years[0] ?? ""} ${titleOrClaim.split(/[():]/)[0] ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const canonSignal = normalizedSignal.split(" ").filter((token) => token.length > 3).slice(0, 5);
  const representedInCanon = canonSignal.length >= 2 && canonSignal.every((token) => canonicalEvidence.includes(token));
  const identityStatus = representedInCanon ? "partial" : "unverified";
  return {
    evidence_id: evidenceId,
    skill_id: skill.skill_id,
    source_path: skill.source_path,
    source_sha256: skill.source_sha256,
    citation,
    parsed_identity: { authors, years: [...new Set(years)].sort(compareText), title_or_claim: titleOrClaim },
    existence: identityStatus,
    author_match: identityStatus,
    year_match: years.length > 0 ? identityStatus : "unverified",
    title_match: identityStatus,
    support_scope: "unverified",
    misattribution: "unverified",
    evidence_strength: identityStatus,
    review_basis: representedInCanon ? "The claim is also represented in the pinned upstream evidence canon, but that is not independent bibliographic or semantic verification." : "The pinned source supplies no independent DOI, stable bibliographic record, or reviewed source excerpt for this declaration.",
    blocker: "Existence, full identity, actual support scope, and absence of misattribution are not independently proved; upstream evidence labels are not ResearchSpec conclusions.",
  };
}

function verifySnapshot(sourceRoot: string): void {
  const revision = git(sourceRoot, ["rev-parse", "HEAD"]);
  const tree = git(sourceRoot, ["rev-parse", "HEAD^{tree}"]);
  const remote = git(sourceRoot, ["remote", "get-url", "origin"]).replace(/\.git$/, "");
  const status = git(sourceRoot, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const tags = git(sourceRoot, ["tag", "--points-at", "HEAD"]);
  validateEducationAgentSkillsSnapshotIdentity({ revision, tree, remote, status, tags });
}

export function validateEducationAgentSkillsSnapshotIdentity(identity: { revision: string; tree: string; remote: string; status: string; tags: string }): void {
  if (identity.revision !== EDUCATION_AGENT_SKILLS.revision) throw new Error(`Education Agent Skills revision drift: expected ${EDUCATION_AGENT_SKILLS.revision}, received ${identity.revision}`);
  if (identity.tree !== EDUCATION_AGENT_SKILLS.tree) throw new Error(`Education Agent Skills tree drift: expected ${EDUCATION_AGENT_SKILLS.tree}, received ${identity.tree}`);
  if (identity.remote.replace(/\.git$/, "") !== EDUCATION_AGENT_SKILLS.repositoryUrl) throw new Error(`Education Agent Skills remote drift: expected ${EDUCATION_AGENT_SKILLS.repositoryUrl}, received ${identity.remote}`);
  if (identity.status) throw new Error("Education Agent Skills checkout must be clean before audit generation or checking.");
  if (identity.tags) throw new Error(`snapshot-32fce5c must remain an untagged snapshot; found tags: ${identity.tags}`);
}

function readInventory(sourceRoot: string): InventoryFile[] {
  const output = execFileSync("git", ["-C", sourceRoot, "ls-tree", "-r", "-z", "--long", "HEAD"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  return output.split("\0").filter(Boolean).map((line) => {
    const match = /^(\d{6}) blob ([a-f0-9]{40})\s+(\d+)\t(.+)$/.exec(line);
    if (!match?.[1] || !match[2] || !match[3] || !match[4]) throw new Error(`Unsupported Git tree entry: ${line}`);
    const sourcePath = match[4];
    if (!isSafeAuditPath(sourcePath)) throw new Error(`Unsafe source path: ${sourcePath}`);
    const bytes = readFileSync(path.join(sourceRoot, sourcePath));
    if (bytes.length !== Number(match[3])) throw new Error(`Git byte count differs from checkout for ${sourcePath}`);
    return { path: sourcePath, mode: match[1], git_object_id: match[2], bytes: bytes.length, sha256: sha256(bytes), classification: classifyFile(sourcePath) };
  }).sort((left, right) => compareText(left.path, right.path));
}

export function classifyEducationAgentSkillsFile(filePath: string): z.infer<typeof EducationFileClassificationSchema> {
  return classifyFile(filePath);
}

function classifyFile(filePath: string): z.infer<typeof EducationFileClassificationSchema> {
  if (/^skills\/.+/.test(filePath)) return "skill-content";
  if (/(^|\/)(?:LICENSE|LICENCE|COPYING|NOTICE)(?:\.[^/]*)?$/.test(filePath)) return "license-provenance";
  if (/^(?:tests\/|mcp-server\/tests\/)|(?:^|\/)(?:playwright\.config\.ts)$/.test(filePath)) return "test";
  if (/^(?:registry\.json|mcp-server\/src\/skills\.json)$/.test(filePath)) return "generated";
  if (/^(?:assets\/|docs\/(?:AWESOME_AGENT_SKILLS_PR|SOCIAL_POSTS)\.md$|mcp-server\/(?:favicon\.svg|index\.html|google[^/]+\.html))/.test(filePath)) return "showcase";
  if (/^(?:\.agents\/plugins\/|\.claude-plugin\/|\.codex-plugin\/|package(?:-lock)?\.json$|mcp-server\/(?:package(?:-lock)?\.json|vercel\.json|\.gitignore)$)/.test(filePath)) return "installer";
  if (/^mcp-server\/(?:api\/|src\/|scripts\/|public\/|tsconfig\.json)/.test(filePath)) return "mcp-runtime";
  if (/^(?:\.github\/|scripts\/|\.gitignore$|AGENTS\.md$|CLAUDE\.md$|CONTRIBUTING\.md$|CHANGELOG\.md$|STATE\.md$|docs\/(?:migration-log|REVIEW)\.md$)/.test(filePath)) return "maintenance";
  return "project-doc";
}

function audienceReview(domain: string, metadata: Record<string, JsonValue>, content: string, sourcePath: string): EducationAgentSkill["audience"] {
  const declared = typeof metadata.audience === "string" ? metadata.audience : null;
  const studentFacing = domain === "student-learning" || declared === "student";
  const mixed = !studentFacing && /\b(?:student-facing|students directly|learner-facing)\b/i.test(content);
  return {
    kind: studentFacing ? "student-facing" : mixed ? "mixed" : "teacher-facing",
    declared,
    evidence: [sourcePath],
    conclusion: studentFacing ? "The Skill is explicitly learner-facing and may mediate live interactions with minors." : mixed ? "The Skill is teacher-oriented but includes direct learner-facing application that requires minor-safety review." : "The Skill is primarily teacher/designer-facing but its outputs can still affect learners and minors indirectly.",
  };
}

function resourceReview(metadata: Record<string, JsonValue>, content: string, sourcePath: string): EducationAgentSkill["resources"] {
  const resources: EducationAgentSkill["resources"] = [];
  if (/https?:\/\//i.test(content)) resources.push({ kind: "network-reference", external_permission: "conditional", evidence: [sourcePath], conclusion: "The body contains network references; following them requires target-Agent and user authorization and is not performed by this audit." });
  const serializedInputs = JSON.stringify(metadata.input_schema ?? "");
  if (/student_profiles|student work|learner data|assessment data|performance data|analytics|dashboard/i.test(`${serializedInputs} ${content}`)) resources.push({ kind: "learner-data", external_permission: "required", evidence: [sourcePath], conclusion: "The procedure may consume learner or assessment data; privacy, minimization, and authorization are prerequisites." });
  if (/\b(?:LMS|MCP|API|platform|dashboard|upload|hosted)\b/i.test(content)) resources.push({ kind: "external-platform", external_permission: "required", evidence: [sourcePath], conclusion: "The procedure mentions an external platform or service; the audit grants no credential, upload, or network authority." });
  if (resources.length === 0) resources.push({ kind: "none-observed", external_permission: "not-required", evidence: [sourcePath], conclusion: "No execution-critical external resource is declared in the Skill; ordinary user-provided task materials may still be required." });
  return resources;
}

function licenseReview(sourcePath: string, sourceSha256: string): EducationAgentSkill["license"] {
  return {
    status: "unresolved",
    expression: "CC BY-SA 4.0 (README and plugin metadata claim only)",
    evidence: ["README.md", ".codex-plugin/plugin.json", "mcp-server/LICENSE", sourcePath],
    source_sha256: sourceSha256,
    conclusion: "The pinned root has no tracked license text. mcp-server/LICENSE is subtree-scoped and cannot prove redistribution rights for Skill content or embedded frameworks.",
  };
}

function fileContributors(sourceRoot: string, sourcePath: string, metadata: Record<string, JsonValue>): EducationAgentSkill["contributors"] {
  const gitNames = git(sourceRoot, ["log", "--follow", "--format=%aN", "--", sourcePath]).split("\n").map((name) => normalizeContributor(name)).filter(Boolean);
  const records: EducationAgentSkill["contributors"] = [...new Set(gitNames)].sort(compareText).map((name) => ({ name, source: "git-history" }));
  if (typeof metadata.contributor === "string") records.push({ name: metadata.contributor, source: "frontmatter" });
  const unique = new Map(records.map((record) => [`${record.source}:${record.name}`, record]));
  return [...unique.values()].sort((left, right) => compareText(`${left.name}:${left.source}`, `${right.name}:${right.source}`));
}

function normalizeContributor(name: string): string {
  if (/^(?:GarethManning|gentlewarriormonk|Gareth Manning)$/.test(name)) return "Gareth Manning";
  return name.trim();
}

function overlapReview(domain: string, sourcePath: string): EducationAgentSkill["overlaps"] {
  const historical = domain === "historical-thinking";
  const literacy = domain === "literacy-critical-thinking" || domain === "ai-literacy";
  return [
    { target: "arsu", conclusion: literacy || historical ? "related" : "distinct", evidence: [sourcePath], rationale: literacy || historical ? "The Skill supports source, evidence, or writing judgment adjacent to ARSU work but does not implement an ARSU paper workflow." : "The pedagogical procedure does not reproduce ARSU research-paper workflow capability." },
    { target: "tooluniverse", conclusion: "distinct", evidence: [sourcePath], rationale: "The Skill is a pedagogical procedure, not a ToolUniverse scientific tool wrapper." },
    { target: "scientific-agent-skills", conclusion: domain === "ai-learning-science" ? "complementary" : "distinct", evidence: [sourcePath], rationale: domain === "ai-learning-science" ? "AI learning design can complement scientific computing Skills without duplicating their tools." : "No Scientific Agent Skills computational procedure is reproduced." },
    { target: "materials-science-skills-for-llm", conclusion: "distinct", evidence: [sourcePath], rationale: "The Skill does not operate a materials-science tool or workflow." },
    { target: "finrobot", conclusion: "distinct", evidence: [sourcePath], rationale: "The Skill does not reproduce financial research capability." },
    { target: "histagent", conclusion: historical ? "related" : "distinct", evidence: [sourcePath], rationale: historical ? "Historical-thinking pedagogy is adjacent to historical source analysis, but it remains an educational design procedure." : "The Skill does not reproduce HistAgent historical research capability." },
  ];
}

function riskReview(domain: string, metadata: Record<string, JsonValue>, content: string, sourcePath: string): EducationAgentSkill["risks"] {
  const haystack = `${domain}\n${JSON.stringify(metadata)}\n${content}`;
  const student = domain === "student-learning" || metadata.audience === "student";
  const conditions: Record<EducationAgentSkill["risks"][number]["risk"], boolean> = {
    minors: student || /\b(?:student|learner|child|pupil|classroom)\b/i.test(haystack),
    privacy: /\b(?:privacy|student profile|learner data|personal data|dashboard|analytics|upload|recording)\b/i.test(haystack),
    "learning-analytics": /\b(?:learning analytics|student profile|performance data|assessment data|engagement metric|dashboard)\b/i.test(haystack),
    wellbeing: domain === "wellbeing-motivation-agency" || /\b(?:wellbeing|well-being|trauma|emotion|belonging|motivation|mental health|PERMA|RULER)\b/i.test(haystack),
    diagnosis: /\b(?:diagnos|screening|classification of student|root cause of student|motivation profile)\b/i.test(haystack),
    "original-framework": domain === "original-frameworks" || /\boriginal (?:framework|methodology)\b/i.test(haystack),
  };
  return (Object.keys(conditions) as Array<keyof typeof conditions>).map((risk) => ({
    risk,
    status: conditions[risk] ? "present" : "not-observed",
    evidence: [sourcePath],
    conclusion: conditions[risk] ? `${risk} indicators are present in the pinned Skill and require explicit later review; the audit grants no diagnostic, surveillance, or learner-data authority.` : `No ${risk} indicator was observed by the complete source-bound review rules; this is not production approval.`,
  }));
}

function contentFitReview(domain: string, metadata: Record<string, JsonValue>, content: string): "candidate" | "defer" {
  if (domain === "student-learning" || domain === "wellbeing-motivation-agency" || domain === "original-frameworks") return "defer";
  if (/\b(?:learning analytics|diagnos|original methodology)\b/i.test(`${JSON.stringify(metadata)} ${content}`)) return "defer";
  return ["memory-learning-science", "curriculum-assessment", "literacy-critical-thinking", "curriculum-alignment", "professional-learning", "explicit-instruction", "questioning-discussion", "eal-language-development", "inclusive-design", "historical-thinking"].includes(domain) ? "candidate" : "defer";
}

function domainReview(domain: string): EducationAgentSkill["prospective_domains"] {
  const review = EDUCATION_DOMAIN_REVIEWS[domain as keyof typeof EDUCATION_DOMAIN_REVIEWS];
  if (!review) throw new Error(`No reviewed prospective ANZSRC Group conclusion for upstream domain: ${domain}`);
  return [{ group_code: review[0], domain_id: review[1], manual_reviewed: true, rationale: review[2] }];
}

function buildFindings(skills: EducationAgentSkill[], evidence: EducationEvidence[], relationships: EducationRelationship[]): Finding[] {
  const unresolvedRelationships = relationships.filter((entry) => entry.resolution !== "resolved");
  const nonstandardEvidence = skills.filter((skill) => !["strong", "moderate", "emerging", "original", "practitioner"].includes(skill.frontmatter.upstream_evidence_strength));
  const missingOutputs = skills.filter((skill) => skill.outputs.schema === null);
  return [
    { code: "ROOT-LICENSE-MISSING", severity: "blocking", evidence: ["README.md", ".codex-plugin/plugin.json", "mcp-server/LICENSE"], conclusion: "The pinned repository has no root license text; README/plugin CC BY-SA 4.0 claims and the MCP subtree license cannot establish Skill-level redistribution rights." },
    { code: "EVIDENCE-NOT-INDEPENDENTLY-VERIFIED", severity: "blocking", evidence: ["docs/EVIDENCE.md"], conclusion: `All ${String(evidence.length)} evidence declarations retain explicit identity and support blockers because the pinned checkout does not supply independent bibliographic identifiers or reviewed source excerpts.` },
    { code: "UPSTREAM-AUDIT-DRIFT", severity: "review", evidence: ["AUDIT.md"], conclusion: `The upstream compatibility audit reports 131 Skills while the pinned Git inventory contains ${String(skills.length)}; its sampled conclusions are stale observations, not an audit input.` },
    { code: "RELATIONSHIP-TARGET-DRIFT", severity: unresolvedRelationships.length ? "review" : "advisory", evidence: [...new Set(unresolvedRelationships.map((entry) => entry.source_path))].slice(0, 20).concat(unresolvedRelationships.length ? [] : ["registry.json"]), conclusion: `${String(unresolvedRelationships.length)} chains_well_with declarations are missing, ambiguous, or duplicated and remain visible without becoming dependencies.` },
    { code: "UPSTREAM-EVIDENCE-ENUM-ANOMALIES", severity: nonstandardEvidence.length ? "review" : "advisory", evidence: nonstandardEvidence.map((skill) => skill.source_path).concat(nonstandardEvidence.length ? [] : ["registry.json"]), conclusion: `${String(nonstandardEvidence.length)} Skills use upstream evidence labels outside the documented enum; no upstream label is treated as a ResearchSpec conclusion.` },
    { code: "STUDENT-DIALOGUE-SCHEMA-DIFFERENCE", severity: "review", evidence: missingOutputs.map((skill) => skill.source_path), conclusion: `${String(missingOutputs.length)} learner-facing Skills omit output_schema and instead define dialogue/evidence-capture behavior that requires separate sensitive-content review.` },
  ];
}

function summarizeAudit(files: InventoryFile[], skills: EducationAgentSkill[], evidence: EducationEvidence[], relationships: EducationRelationship[], findings: Finding[]): EducationAgentSkillsAudit["summary"] {
  return {
    tracked_files: files.length,
    skills: skills.length,
    upstream_domains: new Set(skills.map((skill) => requireString(skill.upstream_metadata, "domain"))).size,
    prospective_domains: new Set(skills.flatMap((skill) => skill.prospective_domains.map((domain) => domain.domain_id))).size,
    evidence_declarations: evidence.length,
    distinct_evidence_strings: new Set(evidence.map((entry) => entry.citation)).size,
    evidence_strength_counts: countEnum(EducationEvidenceStrengthSchema.options, evidence.map((entry) => entry.evidence_strength)),
    relationships: relationships.length,
    unresolved_relationships: relationships.filter((entry) => entry.resolution !== "resolved").length,
    license_status_counts: countEnum(EducationLicenseStatusSchema.options, skills.map((skill) => skill.license.status)),
    recommendation_counts: countEnum(EducationIngestDispositionSchema.options, skills.map((skill) => skill.recommendation.disposition)),
    risk_counts: countEnum(["minors", "privacy", "learning-analytics", "wellbeing", "diagnosis", "original-framework"] as const, skills.flatMap((skill) => skill.risks.filter((risk) => risk.status === "present").map((risk) => risk.risk))),
    blocking_findings: findings.filter((finding) => finding.severity === "blocking").length,
  };
}

function repositoryContributors(sourceRoot: string): string[] {
  return [...new Set(git(sourceRoot, ["log", "--format=%aN", EDUCATION_AGENT_SKILLS.revision]).split("\n").map(normalizeContributor).filter(Boolean))].sort(compareText);
}

function buildTargetIndex(skills: EducationAgentSkill[]): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const skill of skills) {
    const name = requireString(skill.upstream_metadata, "name");
    for (const key of [skill.skill_id, name]) index.set(key, [...(index.get(key) ?? []), skill.skill_id]);
  }
  return index;
}

function formatSequence(prefix: string, value: number): string { return `${prefix}-${String(value).padStart(4, "0")}`; }
function git(sourceRoot: string, args: string[]): string { return execFileSync("git", ["-C", sourceRoot, ...args], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }).trim(); }
function sha256(value: string | Buffer): string { return createHash("sha256").update(value).digest("hex"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function sameValues(left: string[], right: string[]): boolean { return JSON.stringify(left) === JSON.stringify(right); }

function countEnum<const T extends readonly string[]>(options: T, values: string[]): Record<T[number], number> {
  return Object.fromEntries(options.map((option) => [option, values.filter((value) => value === option).length])) as Record<T[number], number>;
}

function checkUniqueAndSorted(values: string[], context: z.RefinementCtx, pathValue: Array<string | number>, label: string): void {
  if (new Set(values).size !== values.length) context.addIssue({ code: "custom", path: pathValue, message: `${label} must be unique` });
  if (!sameValues(values, [...values].sort(compareText))) context.addIssue({ code: "custom", path: pathValue, message: `${label} must be sorted by code point` });
}

function toJsonObject(value: unknown): Record<string, JsonValue> {
  const serialized = JSON.parse(JSON.stringify(value)) as unknown;
  if (!serialized || Array.isArray(serialized) || typeof serialized !== "object") throw new Error("Frontmatter must parse to an object.");
  return serialized as Record<string, JsonValue>;
}

function pickKeys(value: Record<string, JsonValue>, keys: string[]): Record<string, JsonValue> {
  return Object.fromEntries(keys.filter((key) => key in value).map((key) => [key, value[key] ?? null]));
}

function requireString(value: Record<string, JsonValue>, key: string): string {
  const result = value[key];
  if (typeof result !== "string" || !result) throw new Error(`Expected non-empty string frontmatter field: ${key}`);
  return result;
}

function requireStringArray(value: Record<string, JsonValue>, key: string): string[] {
  const result = value[key];
  if (!Array.isArray(result) || result.some((entry) => typeof entry !== "string" || !entry)) throw new Error(`Expected string-array frontmatter field: ${key}`);
  return result as string[];
}
