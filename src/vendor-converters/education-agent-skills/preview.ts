#!/usr/bin/env node

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderEducationCompleteTrees } from "./complete-tree.js";

export async function writeEducationAgentSkillsPreview(repoRoot: string, outputRoot: string) {
  const rendered = await renderEducationCompleteTrees(repoRoot);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  for (const tree of rendered.trees) {
    for (const file of tree.files) {
      const target = path.join(outputRoot, "vendors", rendered.policies.policy.vendor_id, tree.skillId, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
    }
  }
  const manifest = {
    schema_version: "1",
    review_status: rendered.policies.review.review_status,
    vendor_id: rendered.policies.policy.vendor_id,
    release: rendered.policies.policy.release,
    revision: rendered.policies.policy.revision,
    audit_sha256: rendered.policies.policy.audit.sha256,
    evidence_map_sha256: rendered.policies.policy.evidence.sha256,
    production_policy_sha256: rendered.policies.policySha256,
    license_sha256: rendered.policies.policy.license.text_sha256,
    tree_set_sha256: rendered.treeSetSha256,
    counts: previewCounts(rendered),
    trees: rendered.trees.map((tree) => ({
      upstream_skill_id: tree.upstreamSkillId,
      skill_id: tree.skillId,
      source_path: tree.sourcePath,
      source_sha256: tree.sourceSha256,
      domain_id: tree.domainId,
      audience: tree.audience,
      present_risks: tree.presentRisks,
      boundary_keys: tree.boundaryKeys,
      source_body_sha256: tree.sourceBodySha256,
      tree_sha256: tree.treeSha256,
      marked_frontmatter_evidence_ids: tree.markedFrontmatterEvidenceIds,
      body_evidence_matches: tree.bodyEvidenceMatches,
      unmatched_body_evidence_ids: tree.unmatchedBodyEvidenceIds,
      files: tree.files.map((file) => ({ path: file.path, sha256: file.sha256 })),
    })),
  };
  const catalogs = {
    schema_version: "1",
    admission: rendered.policies.admission,
    evidence_adaptations: rendered.policies.evidenceAdaptations,
    relationships: rendered.policies.relationships,
    safety_domains: rendered.policies.safetyDomains,
  };
  await writeFile(path.join(outputRoot, "preview-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outputRoot, "decision-catalogs.json"), `${JSON.stringify(catalogs, null, 2)}\n`);
  await writeFile(path.join(outputRoot, "review-report.zh-CN.md"), renderChineseReview(rendered));
  return rendered;
}

function previewCounts(rendered: Awaited<ReturnType<typeof renderEducationCompleteTrees>>) {
  return {
    audited_skills: rendered.policies.admission.length,
    admitted_skills: rendered.trees.length,
    excluded_skills: rendered.policies.admission.filter((item) => item.disposition === "excluded").length,
    evidence_declarations: rendered.policies.evidenceAdaptations.length,
    unresolved_frontmatter_declarations: rendered.trees.reduce((sum, tree) => sum + tree.markedFrontmatterEvidenceIds.length, 0),
    marked_body_units: rendered.trees.reduce((sum, tree) => sum + tree.bodyEvidenceMatches.length, 0),
    unresolved_declarations_without_body_use: rendered.trees.reduce((sum, tree) => sum + tree.unmatchedBodyEvidenceIds.length, 0),
    advisory_relationships: rendered.policies.relationships.length,
    hard_dependencies: 0,
    domain_membership: {
      "curriculum-and-pedagogy": rendered.trees.filter((tree) => tree.domainId === "curriculum-and-pedagogy").length,
      "education-systems": rendered.trees.filter((tree) => tree.domainId === "education-systems").length,
      "specialist-studies-in-education": rendered.trees.filter((tree) => tree.domainId === "specialist-studies-in-education").length,
    },
    audience: {
      "teacher-facing": rendered.trees.filter((tree) => tree.audience === "teacher-facing").length,
      mixed: rendered.trees.filter((tree) => tree.audience === "mixed").length,
      "student-facing": rendered.trees.filter((tree) => tree.audience === "student-facing").length,
    },
  };
}

function renderChineseReview(rendered: Awaited<ReturnType<typeof renderEducationCompleteTrees>>): string {
  const counts = previewCounts(rendered);
  const exclusions = rendered.policies.admission.filter((item) => item.disposition === "excluded");
  const original = exclusions.filter((item) => item.reason_code === "original-framework-origin-unproved");
  const thirdParty = exclusions.filter((item) => item.reason_code === "third-party-author-authorization-required");
  const approved = rendered.policies.review.review_status === "approved";
  const domainState = approved
    ? "这些成员关系已写入生产 domain catalog 和 registry。"
    : "这些成员关系尚未写入生产 domain catalog 或 registry。";
  const reviewState = approved
    ? `## 人工批准

- 批准人：\`${rendered.policies.review.approved_by ?? "unknown"}\`
- 批准时间：\`${rendered.policies.review.approved_at ?? "unknown"}\`
- 批准聚合 SHA-256：\`${rendered.policies.review.approved_tree_set_sha256 ?? "missing"}\`

生产转换只允许发布与该聚合 SHA-256 完全一致的完整树。`
    : `## 人工门

生产转换必须由人工明确批准聚合 SHA-256
\`${rendered.treeSetSha256}\`。批准前不得注册第六 vendor、写入生产 registry、发布生成树或修改三个教育域的生产成员。`;
  return `# Education Agent Skills 正式 ingest 预览审阅

## 绑定

- Snapshot：\`${rendered.policies.policy.release}\`
- Revision：\`${rendered.policies.policy.revision}\`
- Audit SHA-256：\`${rendered.policies.policy.audit.sha256}\`
- Evidence map SHA-256：\`${rendered.policies.policy.evidence.sha256}\`
- Production policy SHA-256：\`${rendered.policies.policySha256}\`
- License SHA-256：\`${rendered.policies.policy.license.text_sha256}\`
- 完整树聚合 SHA-256：\`${rendered.treeSetSha256}\`
- 当前审阅状态：\`${rendered.policies.review.review_status}\`

## 准入结果

- 审查 Skill：${String(counts.audited_skills)}
- 预览准入：${String(counts.admitted_skills)}
- 固定排除：${String(counts.excluded_skills)}
- 原创框架来源无法证明：${String(original.length)}
- Sean Hu 独立授权缺失：${String(thirdParty.length)}

## Evidence 适配

- declaration 总数：${String(counts.evidence_declarations)}
- 准入树中 unresolved frontmatter citation：${String(counts.unresolved_frontmatter_declarations)}
- 正文标记单元：${String(counts.marked_body_units)}
- 正文未实际使用、仅标 frontmatter 的 unresolved declaration：${String(counts.unresolved_declarations_without_body_use)}

所有未标记 citation 仅完成书目身份核验，不代表 claim-support review。正文标记只使用 immutable audit 的作者/年份身份定位完整句、列表项、表格行或无法安全细分的段落；标记成对且不嵌套。

## 能力与安全

- 教师向：${String(counts.audience["teacher-facing"])}
- 混合：${String(counts.audience.mixed)}
- 学生向：${String(counts.audience["student-facing"])}

转换只改变 frontmatter envelope，并插入 evidence、ResearchSpec authority、未成年人、隐私、学习分析、福祉及教育性 diagnosis 边界。完整上游 body、输入、输出、Prompt、示例和学生向交互保持不删减。所有 813 条 \`chains_well_with\` 仅为 advisory relationship，硬依赖为 0。

## 域预览

- \`curriculum-and-pedagogy\`：${String(counts.domain_membership["curriculum-and-pedagogy"])}
- \`education-systems\`：${String(counts.domain_membership["education-systems"])}
- \`specialist-studies-in-education\`：${String(counts.domain_membership["specialist-studies-in-education"])}

${domainState}

${reviewState}
`;
}

async function main(argv = process.argv.slice(2)): Promise<number> {
  const outputRoot = path.resolve(argv[0] ?? ".tmp/education-agent-skills-preview");
  const rendered = await writeEducationAgentSkillsPreview(process.cwd(), outputRoot);
  process.stdout.write(`${JSON.stringify({
    ok: true,
    output_root: outputRoot,
    review_status: rendered.policies.review.review_status,
    tree_set_sha256: rendered.treeSetSha256,
    admitted_skills: rendered.trees.length,
  }, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
