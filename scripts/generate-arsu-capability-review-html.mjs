#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml } from "yaml";

const ROOT = process.cwd();
const ARS = path.join(ROOT, "vendor", "ars");
const CAPABILITIES = path.join(ROOT, "skills", "capabilities");
const PROFILE_ROOT = path.join(ROOT, "skills", "arsu", "profiles");
const DEFAULT_ANCHOR = process.env.ARSU_ANCHOR ?? "v3.19.0-828ef3b";
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "audits", "arsu", DEFAULT_ANCHOR, "artifacts", "arsu-mode-capability-review.html");

const esc = (text) => String(text ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");
const read = (rel) => readFileSync(path.join(ARS, rel), "utf8");
const readCap = (rel) => readFileSync(path.join(CAPABILITIES, rel), "utf8");

const doc = (rel, kind, purpose) => ({ rel, kind, purpose });
const skillDoc = (skill) => doc(path.join(skill, "SKILL.md"), "SKILL", `${skill} 根 Skill：mode 选择、agent 团队、编排与契约总入口`);
const modeRegistryDoc = doc("MODE_REGISTRY.md", "REGISTRY", "全 ARS 27 个 mode 的单一事实源：spectrum / 输出 / oversight / triggers");
const md = (name) => name.endsWith(".md") ? name : `${name}.md`;
const agent = (skill, name, purpose) => doc(path.join(skill, "agents", md(name)), "AGENT", purpose);
const ref = (skill, name, purpose) => doc(path.join(skill, "references", md(name)), "REFERENCE", purpose);
const sharedRef = (name, purpose) => doc(path.join("shared", md(name)), "SHARED", purpose);
const template = (skill, name, purpose) => doc(path.join(skill, "templates", name), "TEMPLATE", purpose);

const DEEP = "deep-research";
const PAPER = "academic-paper";
const REVIEWER = "academic-paper-reviewer";
const PIPELINE = "academic-pipeline";

const DR_AGENT_PURPOSE = {
  research_question_agent: "FINER 评分与研究问题构建",
  research_architect_agent: "方法蓝图 / IRB / EQUATOR / preregistration 设计",
  bibliography_agent: "检索策略、PRISMA 筛选、注释书目",
  source_verification_agent: "证据分级、掠夺性期刊、事实核验",
  synthesis_agent: "跨来源综合、矛盾消解、gap 分析",
  report_compiler_agent: "APA 7.0 研究报告编写",
  editor_in_chief_agent: "研究报告编辑判断",
  devils_advocate_agent: "研究论证对抗性压力测试",
  ethics_review_agent: "伦理审查与 AI 披露",
  socratic_mentor_agent: "苏格拉底式研究规划对话",
  risk_of_bias_agent: "RoB 2 / ROBINS-I 偏倚风险评估",
  meta_analysis_agent: "效应量、异质性、GRADE 定量综合",
};
const PAPER_AGENT_PURPOSE = {
  intake_agent: "论文配置访谈与 Paper Configuration Record",
  literature_strategist_agent: "论文文献策略、筛选与 evidence map",
  structure_architect_agent: "论文结构与逐节大纲、字数分配",
  argument_builder_agent: "中心论点、CER 链、反驳与逻辑流",
  draft_writer_agent: "逐节撰写与 revision patch 应用",
  citation_compliance_agent: "引文格式、DOI、孤儿引用与自动修复",
  abstract_bilingual_agent: "中英双语摘要与关键词",
  peer_reviewer_agent: "五维模拟同行评审与修订建议",
  formatter_agent: "LaTeX/DOCX/PDF/Markdown 输出与投稿包",
  socratic_mentor_agent: "plan mode 的苏格拉底章节规划",
  visualization_agent: "出版级图表代码与 APA 规范",
  revision_coach_agent: "评审意见解析、revision roadmap 与回应信骨架",
};
const REVIEWER_AGENT_PURPOSE = {
  field_analyst_agent: "论文学科定位与 5 张评审人配置卡",
  eic_agent: "EIC 鸟瞰视角：期刊匹配、原创性、总体裁决",
  methodology_reviewer_agent: "R1 方法学深度评审",
  domain_reviewer_agent: "R2 领域文献与理论评审",
  perspective_reviewer_agent: "R3 跨学科 / 实践视角评审",
  devils_advocate_reviewer_agent: "DA 对抗性压力测试",
  editorial_synthesizer_agent: "编辑综合、仲裁、Decision Letter 与 Revision Roadmap",
};
const PIPELINE_AGENT_PURPOSE = {
  pipeline_orchestrator_agent: "10-stage 编排、checkpoint、transition 与完整性门",
  state_tracker_agent: "状态追踪与 progress dashboard",
  integrity_verification_agent: "Stage 2.5/4.5 引用、数据、原创性与 claim 验证",
  collaboration_depth_agent: "人机协作深度 advisory observer",
  claim_ref_alignment_audit_agent: "L3 claim 忠实性审计",
};

const drAgents = (...names) => names.map((n) => agent(DEEP, n, DR_AGENT_PURPOSE[n]));
const paperAgents = (...names) => names.map((n) => agent(PAPER, n, PAPER_AGENT_PURPOSE[n]));
const reviewerAgents = (...names) => names.map((n) => agent(REVIEWER, n, REVIEWER_AGENT_PURPOSE[n]));
const pipelineAgents = (...names) => names.map((n) => agent(PIPELINE, n, PIPELINE_AGENT_PURPOSE[n]));

const drRef = (name, purpose) => ref(DEEP, name, purpose);
const paperRef = (name, purpose) => ref(PAPER, name, purpose);
const reviewerRef = (name, purpose) => ref(REVIEWER, name, purpose);
const pipelineRef = (name, purpose) => ref(PIPELINE, name, purpose);

const DR_COMMON_REFS = [
  drRef("mode_selection_guide.md", "mode 选择流程图与对比表"),
  drRef("cross_agent_quality_definitions.md", "跨 agent 的证据等级、时效与严重度统一定义"),
];
const PAPER_COMMON_REFS = [
  paperRef("mode_selection_guide.md", "academic-paper mode 选择指南"),
  sharedRef("mode_spectrum.md", "全 skill fidelity / balanced / originality spectrum"),
  sharedRef("references/intent_clarification_protocol.md", "跨 skill 路由澄清协议"),
];
const REVIEWER_COMMON_REFS = [
  reviewerRef("review_criteria_framework.md", "按论文类型区分的结构化评审标准"),
  reviewerRef("quality_rubrics.md", "7 维 0-100 评分 rubric 与 decision mapping"),
];

const MODE_DEFINITIONS = [
  // ---------- deep-research ----------
  {
    route: "deep-research:full", skill: DEEP, mode: "full", title: "Full research",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("research_question_agent", "research_architect_agent", "bibliography_agent", "source_verification_agent", "synthesis_agent", "report_compiler_agent", "editor_in_chief_agent", "devils_advocate_agent", "ethics_review_agent"),
      ...DR_COMMON_REFS,
      drRef("apa7_style_guide.md", "APA 7 快速规范（报告编译器与编辑使用）"),
      drRef("source_quality_hierarchy.md", "证据金字塔 + 分级 rubric"),
      drRef("methodology_patterns.md", "研究设计模板"),
      drRef("logical_fallacies.md", "30+ 逻辑谬误目录"),
      drRef("ethics_checklist.md", "AI 披露、署名、dual-use 清单"),
      drRef("interdisciplinary_bridges.md", "跨学科连接模式"),
      drRef("failure_paths.md", "12 个失败场景与恢复路径"),
      drRef("irb_decision_tree.md", "IRB 决策树"),
      drRef("equator_reporting_guidelines.md", "EQUATOR 报告指南映射"),
      drRef("preregistration_guide.md", "预注册决策树与清单"),
      drRef("argumentation_reasoning_framework.md", "论证强度评估框架"),
      template(DEEP, "literature_matrix_template.md", "文献矩阵模板（证据映射）"),
      template(DEEP, "evidence_assessment_template.md", "证据评估模板"),
      template(DEEP, "preregistration_template.md", "预注册模板"),
    ],
    converted: { profile: "research-main" },
  },
  {
    route: "deep-research:quick", skill: DEEP, mode: "quick", title: "Quick research brief",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("research_question_agent", "bibliography_agent", "source_verification_agent", "report_compiler_agent"),
      ...DR_COMMON_REFS,
      drRef("apa7_style_guide.md", "简短报告的 APA 呈现"),
      drRef("source_quality_hierarchy.md", "证据快速分级"),
      template(DEEP, "research_brief_template.md", "research brief 输出模板"),
      template(DEEP, "evidence_assessment_template.md", "快速证据评估模板"),
    ],
    converted: { capabilities: ["design-research-question-formulation", "discovery-literature-search-screening", "discovery-source-quality-grading", "generation-report-compilation"], note: "research-main 的 quick 子集；尚无独立 quick profile，运行时可作为 research-main 的缩短实例。" },
  },
  {
    route: "deep-research:review", skill: DEEP, mode: "review", title: "Research text review",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("editor_in_chief_agent", "devils_advocate_agent", "ethics_review_agent"),
      drRef("logical_fallacies.md", "论证缺陷目录"),
      drRef("ethics_checklist.md", "伦理与披露核验"),
      drRef("cross_agent_quality_definitions.md", "严重度与证据标准"),
    ],
    converted: { capabilities: ["judgment-editorial-judgment", "judgment-devils-advocate-stress-test", "check-compliance-check"], note: "研究报告评审当前复用 reviewer 族能力 + RAISE/ethics 合规检查；尚无独立 deep-research:review profile。" },
  },
  {
    route: "deep-research:lit-review", skill: DEEP, mode: "lit-review", title: "Evidence literature review",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("bibliography_agent", "source_verification_agent", "synthesis_agent"),
      ...DR_COMMON_REFS,
      drRef("apa7_style_guide.md", "注释书目与综合报告 APA 呈现"),
      drRef("source_quality_hierarchy.md", "证据分级"),
      drRef("interdisciplinary_bridges.md", "跨主题连接"),
      drRef("argumentation_reasoning_framework.md", "跨来源论证评估"),
      template(DEEP, "literature_matrix_template.md", "文献矩阵模板"),
      template(DEEP, "evidence_assessment_template.md", "证据评估模板"),
    ],
    converted: { capabilities: ["discovery-literature-search-screening", "discovery-source-quality-grading", "analysis-evidence-synthesis"], note: "research-main 的 lit-review 片段。" },
  },
  {
    route: "deep-research:three-way-scan", skill: DEEP, mode: "three-way-scan", title: "WHY/HOW/WHAT scan",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("bibliography_agent", "source_verification_agent"),
      drRef("source_quality_hierarchy.md", "检索与验证分级"),
      drRef("cross_agent_quality_definitions.md", "来源与严重度标准"),
    ],
    converted: { capabilities: ["discovery-literature-search-screening", "discovery-source-quality-grading"], note: "轻量检索 + 验证片段；尚无独立 profile。" },
  },
  {
    route: "deep-research:fact-check", skill: DEEP, mode: "fact-check", title: "Claim fact-check",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("source_verification_agent"),
      drRef("source_quality_hierarchy.md", "证据分级与核验程序"),
      drRef("semantic_scholar_api_protocol.md", "Semantic Scholar API 核验协议"),
      drRef("crossref_api_protocol.md", "Crossref API 核验协议"),
      drRef("openalex_api_protocol.md", "OpenAlex API 核验协议"),
      drRef("arxiv_api_protocol.md", "arXiv API 核验协议"),
      drRef("cross_agent_quality_definitions.md", "核验结论与严重度"),
      template(DEEP, "evidence_assessment_template.md", "逐 claim 证据评估模板"),
    ],
    converted: { capabilities: ["discovery-source-quality-grading", "check-reference-integrity-verification"], note: "来源核验 + 引用完整性组合；尚无独立 fact-check profile。" },
  },
  {
    route: "deep-research:socratic", skill: DEEP, mode: "socratic", title: "Socratic research planning",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("socratic_mentor_agent", "research_question_agent", "devils_advocate_agent"),
      drRef("socratic_questioning_framework.md", "6 类苏格拉底问题 + 提示模式"),
      drRef("socratic_mode_protocol.md", "5 层对话流、管理规则、收敛条件"),
      drRef("logical_fallacies.md", "DA 挑战参考"),
      drRef("argumentation_reasoning_framework.md", "论证强度评估"),
      drRef("failure_paths.md", "对话停滞与恢复路径"),
    ],
    converted: { capabilities: ["transform-socratic-mentoring", "design-research-question-formulation", "judgment-devils-advocate-stress-test"], note: "对话引擎 + RQ 构建 + DA 挑战；尚无独立 socratic profile。" },
  },
  {
    route: "deep-research:systematic-review", skill: DEEP, mode: "systematic-review", title: "Systematic review",
    upstream: [
      skillDoc(DEEP), modeRegistryDoc,
      ...drAgents("research_question_agent", "research_architect_agent", "bibliography_agent", "source_verification_agent", "risk_of_bias_agent", "meta_analysis_agent", "synthesis_agent", "report_compiler_agent", "editor_in_chief_agent", "ethics_review_agent", "devils_advocate_agent"),
      ...DR_COMMON_REFS,
      drRef("systematic_review_protocol.md", "PRISMA 全流程与 checkpoint"),
      drRef("systematic_review_toolkit.md", "Cochrane / PRISMA 2020 / RoB 2 / ROBINS-I / I² / GRADE"),
      drRef("irb_decision_tree.md", "系统综述 IRB 判断"),
      drRef("equator_reporting_guidelines.md", "报告指南映射"),
      drRef("preregistration_guide.md", "PROSPERO 预注册"),
      drRef("apa7_style_guide.md", "PRISMA 报告 APA 呈现"),
      drRef("source_quality_hierarchy.md", "纳入研究证据分级"),
      drRef("logical_fallacies.md", "论证与偏倚检查"),
      drRef("ethics_checklist.md", "系统综述伦理披露"),
      template(DEEP, "prisma_protocol_template.md", "PRISMA 方案模板"),
      template(DEEP, "prisma_report_template.md", "PRISMA 2020 报告模板"),
      template(DEEP, "literature_matrix_template.md", "纳入研究矩阵模板"),
      template(DEEP, "evidence_assessment_template.md", "证据评估模板"),
      template(DEEP, "preregistration_template.md", "PROSPERO 预注册模板"),
    ],
    converted: { capabilities: ["design-research-question-formulation", "design-methodology-design", "discovery-literature-search-screening", "discovery-source-quality-grading", "analysis-risk-of-bias-assessment", "analysis-meta-analysis", "analysis-evidence-synthesis", "generation-report-compilation"], note: "systematic-review 尚无独立 graph profile；当前为 M1 + M5 能力的组合实例。" },
  },

  // ---------- academic-paper ----------
  {
    route: "academic-paper:full", skill: PAPER, mode: "full", title: "Full manuscript drafting",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("intake_agent", "literature_strategist_agent", "structure_architect_agent", "argument_builder_agent", "draft_writer_agent", "citation_compliance_agent", "abstract_bilingual_agent", "peer_reviewer_agent", "formatter_agent", "visualization_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("workflow_phase_details.md", "逐 phase agent 行为与输出"),
      paperRef("failure_paths.md", "失败路径与恢复"),
      paperRef("writing_quality_check.md", "写作质量自检清单"),
      sharedRef("style_calibration_protocol.md", "风格校准协议"),
      paperRef("academic_writing_style.md", "学术写作风格规范"),
      paperRef("anti_leakage_protocol.md", "材料隔离与反泄漏"),
      paperRef("apa7_extended_guide.md", "APA 7 扩展规范"),
      paperRef("apa7_chinese_citation_guide.md", "中文引文 APA 规范"),
      paperRef("citation_format_switcher.md", "五种引文格式转换规范"),
      paperRef("statistical_visualization_standards.md", "图表 APA 与色盲安全标准"),
      paperRef("vlm_figure_verification.md", "VLM 图表验证清单"),
      paperRef("abstract_writing_guide.md", "双语摘要写作"),
      paperRef("paper_structure_patterns.md", "6 种论文结构模式"),
      paperRef("writing_judgment_framework.md", "写作判断框架"),
      template(PAPER, "imrad_template.md", "IMRaD 结构模板"),
      template(PAPER, "literature_review_template.md", "文献综述结构模板"),
      template(PAPER, "case_study_template.md", "案例研究模板"),
      template(PAPER, "theoretical_paper_template.md", "理论论文模板"),
      template(PAPER, "policy_brief_template.md", "政策简报模板"),
      template(PAPER, "conference_paper_template.md", "会议论文模板"),
      template(PAPER, "bilingual_abstract_template.md", "双语摘要模板"),
      template(PAPER, "credit_statement_template.md", "CRediT 作者贡献模板"),
      template(PAPER, "funding_statement_template.md", "资助声明模板"),
      template(PAPER, "latex_article_template.tex", "LaTeX 文章模板"),
      template(PAPER, "revision_tracking_template.md", "修订追踪模板"),
    ],
    converted: { profile: "academic-paper" },
  },
  {
    route: "academic-paper:plan", skill: PAPER, mode: "plan", title: "Guided paper planning",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("intake_agent", "socratic_mentor_agent", "structure_architect_agent", "argument_builder_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("plan_mode_protocol.md", "plan mode 完整协议与收敛"),
      paperRef("paper_structure_patterns.md", "章节规划结构库"),
      paperRef("academic_writing_style.md", "章节计划写作规范"),
      template(PAPER, "imrad_template.md", "IMRaD 结构模板"),
      template(PAPER, "literature_review_template.md", "文献综述结构模板"),
      template(PAPER, "case_study_template.md", "案例研究模板"),
      template(PAPER, "theoretical_paper_template.md", "理论论文模板"),
      template(PAPER, "policy_brief_template.md", "政策简报模板"),
      template(PAPER, "conference_paper_template.md", "会议论文模板"),
    ],
    converted: { capabilities: ["design-writing-intake", "transform-socratic-mentoring", "design-manuscript-structure-design", "design-argument-blueprint"], note: "plan mode 尚无独立 graph profile；当前为 4 个能力的对话式组合。" },
  },
  {
    route: "academic-paper:outline-only", skill: PAPER, mode: "outline-only", title: "Outline only",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("intake_agent", "literature_strategist_agent", "structure_architect_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("paper_structure_patterns.md", "结构模式与字数模板"),
      paperRef("workflow_phase_details.md", "Phase 1-2 细节"),
      paperRef("domain_evidence_profiles.md", "文献筛选的学科证据标准"),
      template(PAPER, "imrad_template.md", "IMRaD 结构模板"),
      template(PAPER, "literature_review_template.md", "文献综述结构模板"),
      template(PAPER, "case_study_template.md", "案例研究模板"),
      template(PAPER, "theoretical_paper_template.md", "理论论文模板"),
      template(PAPER, "policy_brief_template.md", "政策简报模板"),
      template(PAPER, "conference_paper_template.md", "会议论文模板"),
    ],
    converted: { capabilities: ["design-writing-intake", "discovery-literature-search-screening", "design-manuscript-structure-design"], note: "academic-paper profile 的前 3 个节点。" },
  },
  {
    route: "academic-paper:revision", skill: PAPER, mode: "revision", title: "Manuscript revision",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("peer_reviewer_agent", "draft_writer_agent", "citation_compliance_agent"),
      paperRef("revision_patch_protocol.md", "确定性 revision patch 协议"),
      paperRef("writing_quality_check.md", "修订稿质量检查"),
      paperRef("anti_leakage_protocol.md", "修订材料边界"),
      paperRef("apa7_extended_guide.md", "APA 修订规范"),
      paperRef("citation_format_switcher.md", "修订后引文校验"),
      paperRef("mode_selection_guide.md", "revision 选择条件"),
      template(PAPER, "revision_tracking_template.md", "修订追踪模板（4 状态类型）"),
    ],
    converted: { capabilities: ["check-pre-submission-self-check", "generation-manuscript-drafting", "transform-revision-patching", "check-citation-format-compliance"], note: "revision 尚无独立 graph profile；当前为评审/补丁/引文能力组合。" },
  },
  {
    route: "academic-paper:revision-coach", skill: PAPER, mode: "revision-coach", title: "Revision coaching",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("revision_coach_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("failure_paths.md", "解析失败与歧义处理"),
      paperRef("revision_patch_protocol.md", "下游 revision 使用的 roadmap 契约"),
    ],
    converted: { capabilities: ["transform-revision-roadmap-parsing"], note: "单能力 mode。" },
  },
  {
    route: "academic-paper:abstract-only", skill: PAPER, mode: "abstract-only", title: "Abstract only",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("intake_agent", "abstract_bilingual_agent"),
      paperRef("abstract_writing_guide.md", "摘要结构、字数与独立性检查"),
      paperRef("apa7_extended_guide.md", "APA 摘要规范"),
      paperRef("hei_domain_glossary.md", "高教领域术语表"),
      paperRef("mode_selection_guide.md", "abstract-only 选择条件"),
      template(PAPER, "bilingual_abstract_template.md", "双语摘要模板"),
    ],
    converted: { capabilities: ["generation-abstract-writing"], note: "单能力 mode。" },
  },
  {
    route: "academic-paper:lit-review", skill: PAPER, mode: "lit-review", title: "Manuscript literature review",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("intake_agent", "literature_strategist_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("workflow_phase_details.md", "Phase 1 文献策略细节"),
      paperRef("domain_evidence_profiles.md", "学科证据准入标准"),
      paperRef("anti_leakage_protocol.md", "文献材料边界"),
      paperRef("academic_writing_style.md", "文献综述写作规范"),
      template(PAPER, "literature_review_template.md", "文献综述结构模板"),
    ],
    converted: { capabilities: ["design-writing-intake", "discovery-literature-search-screening", "discovery-source-quality-grading", "analysis-evidence-synthesis"], note: "写作入口 + research 文献能力组合。" },
  },
  {
    route: "academic-paper:format-convert", skill: PAPER, mode: "format-convert", title: "Format conversion",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("formatter_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("latex_template_reference.md", "LaTeX 模板与包配置"),
      paperRef("journal_submission_guide.md", "期刊格式与投稿要求"),
      paperRef("citation_format_switcher.md", "五种引文格式转换"),
      paperRef("apa7_extended_guide.md", "APA 7 格式细节"),
      paperRef("venue_disclosure_policies.md", "venue 披露要求"),
      template(PAPER, "latex_article_template.tex", "LaTeX 文章模板"),
    ],
    converted: { capabilities: ["generation-format-rendering"], note: "单能力 mode；terminal policy 由相邻 gate 能力承担。" },
  },
  {
    route: "academic-paper:citation-check", skill: PAPER, mode: "citation-check", title: "Citation check",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("citation_compliance_agent"),
      paperRef("citation_format_switcher.md", "引文格式规范"),
      paperRef("apa7_extended_guide.md", "APA 7 详细规则"),
      paperRef("apa7_chinese_citation_guide.md", "中文引文规则"),
      paperRef("mode_selection_guide.md", "citation-check 选择条件"),
    ],
    converted: { capabilities: ["check-citation-format-compliance", "check-citation-existence-verification"], note: "格式合规 + 存在性验证组合。" },
  },
  {
    route: "academic-paper:disclosure", skill: PAPER, mode: "disclosure", title: "AI disclosure",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("formatter_agent"),
      paperRef("disclosure_mode_protocol.md", "AI 使用披露 mode 协议"),
      paperRef("venue_disclosure_policies.md", "各 venue 披露政策"),
      paperRef("policy_anchor_disclosure_protocol.md", "政策锚定披露协议"),
      paperRef("policy_anchor_table.md", "政策锚点表"),
      paperRef("journal_submission_guide.md", "投稿披露位置要求"),
    ],
    converted: { capabilities: ["check-compliance-check", "generation-format-rendering"], note: "合规检查 + 格式输出组合；尚无独立 disclosure profile。" },
  },
  {
    route: "academic-paper:rebuttal-audit", skill: PAPER, mode: "rebuttal-audit", title: "Rebuttal audit",
    upstream: [
      skillDoc(PAPER), modeRegistryDoc,
      ...paperAgents("revision_coach_agent"),
      ...PAPER_COMMON_REFS,
      paperRef("failure_paths.md", "回应信 QA 风险路径"),
    ],
    converted: { capabilities: ["transform-revision-roadmap-parsing"], note: "复用 comment 解析能力；advisory QA 无独立 profile。" },
  },

  // ---------- academic-paper-reviewer ----------
  {
    route: "academic-paper-reviewer:full", skill: REVIEWER, mode: "full", title: "Full peer review",
    upstream: [
      skillDoc(REVIEWER), modeRegistryDoc,
      ...reviewerAgents("field_analyst_agent", "eic_agent", "methodology_reviewer_agent", "domain_reviewer_agent", "perspective_reviewer_agent", "devils_advocate_reviewer_agent", "editorial_synthesizer_agent"),
      ...REVIEWER_COMMON_REFS,
      reviewerRef("top_journals_by_field.md", "期刊匹配参考"),
      reviewerRef("editorial_decision_standards.md", "Accept/Minor/Major/Reject 标准"),
      reviewerRef("statistical_reporting_standards.md", "统计报告标准"),
      reviewerRef("review_quality_thinking.md", "评审认知框架与陷阱"),
      reviewerRef("sprint_contract_protocol.md", "盲态预承诺与 panel 合成硬门"),
      reviewerRef("integration_guide.md", "完整 pipeline 集成示例"),
      template(REVIEWER, "peer_review_report_template.md", "评审报告模板"),
      template(REVIEWER, "editorial_decision_template.md", "编辑决定信模板"),
      template(REVIEWER, "revision_response_template.md", "修改回应信模板"),
    ],
    converted: { profile: "academic-paper-reviewer" },
  },
  {
    route: "academic-paper-reviewer:re-review", skill: REVIEWER, mode: "re-review", title: "Revision re-review",
    upstream: [
      skillDoc(REVIEWER), modeRegistryDoc,
      ...reviewerAgents("eic_agent", "editorial_synthesizer_agent"),
      reviewerRef("re_review_mode_protocol.md", "验证评审逻辑与 R&R traceability"),
      reviewerRef("review_criteria_framework.md", "逐 concern 复核标准"),
      reviewerRef("editorial_decision_standards.md", "residual issue 决策"),
      template(REVIEWER, "peer_review_report_template.md", "复核报告模板"),
      template(REVIEWER, "revision_response_template.md", "R&R 回应信对照模板"),
    ],
    converted: { capabilities: ["judgment-review-synthesis", "transform-revision-roadmap-parsing", "check-pre-submission-self-check"], note: "re-review 尚无独立 graph profile；当前为综合 + 路线图 + 自检组合。" },
  },
  {
    route: "academic-paper-reviewer:quick", skill: REVIEWER, mode: "quick", title: "Quick review",
    upstream: [
      skillDoc(REVIEWER), modeRegistryDoc,
      ...reviewerAgents("eic_agent"),
      reviewerRef("editorial_decision_standards.md", "快速裁决标准"),
      reviewerRef("review_quality_thinking.md", "快速评审认知框架"),
    ],
    converted: { capabilities: ["judgment-editorial-judgment"], note: "单能力 mode。" },
  },
  {
    route: "academic-paper-reviewer:methodology-focus", skill: REVIEWER, mode: "methodology-focus", title: "Methodology-focused review",
    upstream: [
      skillDoc(REVIEWER), modeRegistryDoc,
      ...reviewerAgents("methodology_reviewer_agent"),
      reviewerRef("statistical_reporting_standards.md", "统计报告规范"),
      reviewerRef("quality_rubrics.md", "方法学评分 rubric"),
      reviewerRef("review_criteria_framework.md", "方法学维度标准"),
      template(REVIEWER, "peer_review_report_template.md", "方法学评审报告模板"),
    ],
    converted: { capabilities: ["judgment-specialist-review"], note: "R1 视角单能力 mode。" },
  },
  {
    route: "academic-paper-reviewer:guided", skill: REVIEWER, mode: "guided", title: "Guided review",
    upstream: [
      skillDoc(REVIEWER), modeRegistryDoc,
      ...reviewerAgents("eic_agent", "methodology_reviewer_agent", "domain_reviewer_agent", "perspective_reviewer_agent", "devils_advocate_reviewer_agent", "editorial_synthesizer_agent"),
      reviewerRef("guided_mode_protocol.md", "渐进揭示对话流与规则"),
      reviewerRef("review_criteria_framework.md", "逐视角揭示标准"),
      reviewerRef("review_quality_thinking.md", "对话中的评审认知约束"),
      template(REVIEWER, "peer_review_report_template.md", "guided 评审笔记模板"),
    ],
    converted: { capabilities: ["transform-socratic-mentoring", "judgment-editorial-judgment", "judgment-specialist-review"], note: "苏格拉底对话引擎 + 评审视角组合。" },
  },
  {
    route: "academic-paper-reviewer:calibration", skill: REVIEWER, mode: "calibration", title: "Reviewer calibration",
    upstream: [
      skillDoc(REVIEWER), modeRegistryDoc,
      ...reviewerAgents("field_analyst_agent", "eic_agent", "methodology_reviewer_agent", "domain_reviewer_agent", "perspective_reviewer_agent", "devils_advocate_reviewer_agent", "editorial_synthesizer_agent"),
      reviewerRef("calibration_mode_protocol.md", "FNR/FPR/AUC 测量、5x ensembling、置信披露"),
      reviewerRef("quality_rubrics.md", "gold set 评分 rubric"),
      reviewerRef("sprint_contract_protocol.md", "校准结果与硬门关系"),
      template(REVIEWER, "peer_review_report_template.md", "校准 gold set 评分模板"),
    ],
    converted: { capabilities: ["check-pre-submission-self-check", "judgment-specialist-review"], note: "尚无 calibration capability；当前使用可评分 checker 作为最近似节点。" },
  },

  // ---------- academic-pipeline ----------
  {
    route: "academic-pipeline:end-to-end", skill: PIPELINE, mode: "pipeline", title: "End-to-end pipeline",
    upstream: [
      skillDoc(PIPELINE), modeRegistryDoc,
      skillDoc(DEEP), skillDoc(PAPER), skillDoc(REVIEWER),
      ...pipelineAgents("pipeline_orchestrator_agent", "state_tracker_agent", "integrity_verification_agent", "collaboration_depth_agent", "claim_ref_alignment_audit_agent"),
      pipelineRef("pipeline_state_machine.md", "全部合法状态迁移、前置条件与动作"),
      pipelineRef("mode_advisor.md", "跨 skill 意图到 skill+mode 决策树"),
      pipelineRef("plagiarism_detection_protocol.md", "Phase D 原创性验证协议"),
      pipelineRef("claim_verification_protocol.md", "Phase E claim 验证协议"),
      pipelineRef("claim_audit_calibration_protocol.md", "claim audit 校准协议"),
      pipelineRef("ai_research_failure_modes.md", "7-mode AI 研究失败清单"),
      pipelineRef("team_collaboration_protocol.md", "多角色协作与 handoff"),
      pipelineRef("integrity_review_protocol.md", "Stage 2.5/4.5 五阶段完整性验证"),
      pipelineRef("two_stage_review_protocol.md", "Stage 3 + Stage 3' 两阶段评审"),
      pipelineRef("external_review_protocol.md", "外部评审反馈 4 步流程"),
      pipelineRef("process_summary_protocol.md", "Stage 6 过程总结协议"),
      pipelineRef("reproducibility_audit.md", "可复现性与审计轨迹"),
      pipelineRef("progress_dashboard_template.md", "进度面板模板"),
      pipelineRef("reinforcement_content.md", "阶段切换强化说明"),
      pipelineRef("literature_corpus_consumers.md", "文献语料消费者边界"),
      sharedRef("handoff_schemas.md", "跨 skill 9 类 handoff 数据契约"),
      template(PIPELINE, "pipeline_status_template.md", "Pipeline 状态输出模板"),
    ],
    converted: { profile: "academic-pipeline" },
  },
  {
    route: "academic-pipeline:resume_from_passport", skill: PIPELINE, mode: "resume_from_passport", title: "Resume from passport reset boundary",
    upstream: [
      skillDoc(PIPELINE), modeRegistryDoc,
      ...pipelineAgents("pipeline_orchestrator_agent", "state_tracker_agent", "integrity_verification_agent"),
      pipelineRef("passport_as_reset_boundary.md", "Material Passport reset boundary 恢复协议"),
      pipelineRef("pipeline_state_machine.md", "恢复时合法状态与迁移"),
      pipelineRef("mode_advisor.md", "恢复后 skill+mode 选择"),
      sharedRef("handoff_schemas.md", "passport reset 恢复涉及的 handoff 契约"),
      template(PIPELINE, "pipeline_status_template.md", "Pipeline 状态输出模板"),
    ],
    converted: { profile: "academic-pipeline", extraCapabilities: ["check-passport-verifier", "check-terminal-policy-gate"], note: "复用 end-to-end pipeline profile；入口按 passport reset boundary 判定，passport-verifier 与 terminal-policy-gate 作为 resume 守卫能力并列展示。" },
  },
];

// ---------- graph profiles (converter-owned generated registry) ----------
const profileRegistry = JSON.parse(readFileSync(path.join(PROFILE_ROOT, "registry.json"), "utf8"));
const GRAPH_PROFILES = Object.fromEntries(profileRegistry.profiles.map((entry) => {
  const profile = parseYaml(readFileSync(path.join(PROFILE_ROOT, entry.source_path), "utf8"));
  const gateByOwner = new Map(profile.gates.map((gate) => [gate.owner_node_id, gate.gate_id]));
  return [profile.profile_id, {
    title: profile.profile_id,
    profile_version: profile.profile_version,
    nodes: profile.nodes.map((node) => ({ ...node, gate_id: gateByOwner.get(node.node_id) })),
  }];
}));

// ---------- find actual profile node IDs for a capability ----------
const capabilityNodeIds = new Map();
for (const [profileId, profile] of Object.entries(GRAPH_PROFILES)) {
  for (const node of profile.nodes) {
    if (node.kind === "capability") {
      const list = capabilityNodeIds.get(node.capability_id) ?? [];
      list.push(`${profileId}:${node.node_id}`);
      capabilityNodeIds.set(node.capability_id, list);
    }
    if (node.kind === "subgraph" && GRAPH_PROFILES[node.subgraph_id]) {
      for (const child of GRAPH_PROFILES[node.subgraph_id].nodes) {
        if (child.kind === "capability") {
          const list = capabilityNodeIds.get(child.capability_id) ?? [];
          list.push(`${profileId}:${node.node_id}/${child.node_id}`);
          capabilityNodeIds.set(child.capability_id, list);
        }
      }
    }
  }
}

// ---------- load capability metadata ----------
const capabilityIndex = new Map();
for (const entry of JSON.parse(readCap("registry.json")).capabilities) {
  const pkg = path.join(CAPABILITIES, entry.source_path);
  const manifest = parseYaml(readFileSync(path.join(pkg, "manifest.yaml"), "utf8"));
  capabilityIndex.set(entry.capability_id, { pkg, manifest });
}

const routingCatalog = JSON.parse(readFileSync(path.join(ROOT, "skills", "arsu", "routing-catalog.json"), "utf8"));
const routeIndex = new Map();
for (const skill of routingCatalog.skills) {
  for (const route of skill.routes) routeIndex.set(route.route_ref, route);
}

// ---------- rendering helpers ----------
function docDetails(item, index) {
  const text = read(item.rel);
  const lineCount = text.split("\n").length;
  return `<details class="doc" id="doc-${index}">
  <summary><span class="badge kind-${item.kind.toLowerCase()}">${item.kind}</span><span class="doc-path">${esc(item.rel)}</span><span class="doc-purpose">${esc(item.purpose)}</span><span class="meta">${lineCount} 行</span></summary>
  <div class="doc-meta">路径 <code>${esc(item.rel)}</code> · ${lineCount} 行 · ${esc(item.purpose)}</div>
  <pre class="doc-body">${esc(text)}</pre>
</details>`;
}

function capabilityCard(capId, nodeIds, relationLabel) {
  const info = capabilityIndex.get(capId);
  if (!info) return `<p class="missing">missing capability ${esc(capId)}</p>`;
  const { pkg, manifest } = info;
  const skillText = readFileSync(path.join(pkg, "SKILL.md"), "utf8");
  const knowledge = (manifest.knowledge_refs ?? []).map((k) => ({
    ...k,
    text: readFileSync(path.join(pkg, ...k.path.split("/")), "utf8"),
  }));
  const inOut = [...(manifest.inputs ?? [])].map((x) => `<code>${esc(x.role)}</code> ← ${esc(x.schema_ref)}`).join(" · ");
  const out = [...(manifest.outputs ?? [])].map((x) => `<code>${esc(x.role)}</code> → ${esc(x.schema_ref)}`).join(" · ");
  return `<details class="node" open>
  <summary>
    <span class="node-id">${esc(nodeIds.join(", "))}</span>
    <span class="cap-id">${esc(capId)}</span>
    <span class="cap-title">${esc(manifest.title)}</span>
    <span class="meta">${relationLabel}</span>
  </summary>
  <div class="node-meta">
    <div><strong>Description</strong> ${esc(manifest.description)}</div>
    <div><strong>class / node_kind / execution_type</strong> <code>${esc(manifest.class)}</code> · <code>${esc(manifest.node_kind)}</code> · <code>${esc(manifest.execution_type)}</code></div>
    <div><strong>maturity</strong> <code>${esc(manifest.maturity ?? "skeleton")}</code> · <strong>gate_policy</strong> <code>${esc(manifest.gate_policy)}</code></div>
    <div><strong>inputs</strong> ${inOut || "—"}</div>
    <div><strong>outputs</strong> ${out || "—"}</div>
  </div>
  <details class="sub"><summary>指令 SKILL.md · ${skillText.split("\n").length} 行</summary><pre class="doc-body">${esc(skillText)}</pre></details>
  ${knowledge.map((k) => `<details class="sub"><summary>knowledge <code>${esc(k.knowledge_id)}</code> · <code>${esc(k.path)}</code> · ${k.text.split("\n").length} 行</summary><div class="doc-meta">sha256 <code>${esc(k.content_hash)}</code> · license ${esc(k.license)}</div><pre class="doc-body">${esc(k.text)}</pre></details>`).join("\n")}
</details>`;
}

function convertedSection(def, modeId) {
  if (def.profile) {
    const profile = GRAPH_PROFILES[def.profile];
    if (!profile) return `<p class="missing">missing profile ${def.profile}</p>`;
    const cards = [];
    const seen = new Set();
    for (const node of profile.nodes) {
      if (node.kind === "capability") {
        if (!seen.has(node.capability_id)) {
          seen.add(node.capability_id);
          cards.push(capabilityCard(node.capability_id, [node.node_id], `profile:${def.profile}`));
        }
      } else if (node.kind === "gate") {
        cards.push(`<details class="node gate"><summary><span class="node-id">${esc(node.node_id)}</span><span class="cap-id">gate</span><span class="cap-title">${esc(node.gate_id ?? "gate")}</span><span class="meta">profile:${esc(def.profile)}</span></summary><div class="node-meta">正式 Gate 节点；由 graph profile 的 gates 声明 policy 与 verdicts，人类通过 <code>researchspec decide</code> 确认。</div></details>`);
      } else if (node.kind === "subgraph" && GRAPH_PROFILES[node.subgraph_id]) {
        cards.push(`<details class="node subgraph" open><summary><span class="node-id">${esc(node.node_id)}</span><span class="cap-id">subgraph</span><span class="cap-title">${esc(GRAPH_PROFILES[node.subgraph_id].title)}</span><span class="meta">profile:${esc(def.profile)}</span></summary><div class="node-meta">子图节点，展开为子 profile 的 capability 节点：</div>${GRAPH_PROFILES[node.subgraph_id].nodes.map((child) => child.kind === "capability" ? capabilityCard(child.capability_id, [`${node.node_id}/${child.node_id}`], `subgraph ${node.subgraph_id}`) : `<details class="node gate"><summary><span class="node-id">${esc(node.node_id)}/${esc(child.node_id)}</span><span class="cap-id">gate</span><span class="cap-title">${esc(child.gate_id ?? "gate")}</span></summary><div class="node-meta">子图内正式 Gate。</div></details>`).join("\n")}</details>`);
      }
    }
    const note = def.note ? `<div class="note">${esc(def.note)}</div>` : "";
    const flow = `<div class="profile-flow"><strong>节点顺序</strong> ${profile.nodes.map((n) => `<span class="flow-node ${n.kind}">${esc(n.node_id)}</span>`).join("<span class=\"flow-arrow\">→</span>")}</div>`;
    const extra = (def.extraCapabilities ?? []).map((id, i) => capabilityCard(id, [`resume-extra-${i + 1}`], "mode-relevant resume guard")).join("\n");
    return `<div class="profile-banner">Graph profile <code>${esc(def.profile)}</code> v${esc(profile.profile_version)} · ${profile.nodes.length} 个顶层节点</div>${flow}${note}${cards.join("\n")}${extra ? `<div class="profile-banner">Resume 守卫能力（附加于 profile 之外）</div>${extra}` : ""}`;
  }
  const ids = def.capabilities ?? [];
  const note = def.note ? `<div class="note">${esc(def.note)}</div>` : "";
  return `<div class="profile-banner">无独立 graph profile — 以下为 mode 相关的已转换 capability 节点</div>${note}${ids.map((id, i) => {
    const actual = capabilityNodeIds.get(id);
    return actual?.length
      ? capabilityCard(id, actual, `graph node ${actual.join(" / ")}`)
      : capabilityCard(id, [`mode-${modeId}-${i + 1}`], "mode-relevant capability（未出现在预设 graph profile 中）");
  }).join("\n")}`;
}

function modePanel(def, routeInfo, index) {
  const left = def.upstream.map((item, i) => docDetails(item, `${index}-${i}`)).join("\n");
  const right = convertedSection(def.converted, def.mode);
  const ri = routeInfo ?? {};
  const req = (ri.prerequisite_groups ?? []).map((g) => `${g.operator}: ${g.requirements.map((r) => esc(`${r.kind}:${r.id}`)).join(" + ")}`).join("<br>");
  return `<section class="mode-panel" id="panel-${index}" ${index === 0 ? "active" : ""}>
  <div class="mode-hero">
    <div>
      <div class="mode-route">${esc(def.route)}</div>
      <h2>${esc(def.title)}</h2>
      <p class="mode-intent">${esc((ri.intents ?? []).join("；"))}</p>
    </div>
    <div class="mode-facts">
      <div><span>skill</span><code>${esc(def.skill)}</code></div>
      <div><span>risk</span><code>${esc(ri.risk_level ?? "—")}</code></div>
      <div><span>gate</span><code>${esc(ri.gate_policy?.level ?? "—")}${(ri.gate_policy?.gate_kinds ?? []).length ? ` · ${esc(ri.gate_policy.gate_kinds.join(", "))}` : ""}</code></div>
      <div><span>cost</span><code>${esc(ri.cost?.effort ?? "—")} / ${esc(ri.cost?.interaction ?? "—")}</code></div>
    </div>
  </div>
  <div class="prereq">prerequisites: ${req || "—"}</div>
  <div class="mode-grid">
    <div class="column upstream">
      <h3>上游 ARS 指令与参考文档 <span class="count">${def.upstream.length}</span></h3>
      <p class="col-note">执行该 mode 必须完整读取的 SKILL / agent 指令 / reference。点击任意条目展开原文。</p>
      <div class="doc-list">${left}</div>
    </div>
    <div class="column converted">
      <h3>转换后 Graph 节点与 knowledge</h3>
      <p class="col-note">左侧上游语义在 capability graph 中的对应节点。每个节点可展开其 SKILL 指令与 knowledge 原文。</p>
      ${right}
    </div>
  </div>
</section>`;
}

// ---------- assemble ----------
const skillOrder = [DEEP, PAPER, REVIEWER, PIPELINE];
const skillTitles = { [DEEP]: "deep-research", [PAPER]: "academic-paper", [REVIEWER]: "academic-paper-reviewer", [PIPELINE]: "academic-pipeline" };
const tabButtons = MODE_DEFINITIONS.map((def, i) => {
  const ri = routeIndex.get(def.route) ?? {};
  return `<button class="tab skill-${def.skill}" data-panel="panel-${i}" data-skill="${esc(def.skill)}"><span class="skill-dot"></span><span class="tab-mode">${esc(def.mode)}</span><span class="tab-title">${esc(def.title)}</span></button>`;
});
const panels = MODE_DEFINITIONS.map((def, i) => modePanel(def, routeIndex.get(def.route), i)).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARSU Mode → Capability Graph 语义转换审阅工件</title>
<style>
:root{
  --bg:#f6f7f9; --card:#ffffff; --line:#e3e7ee; --line-strong:#cfd6e2;
  --ink:#1c2433; --ink-soft:#49566b; --muted:#7a8699;
  --accent:#2b4c8c; --accent-soft:#eef3fb; --accent-border:#b9cbec;
  --deep:#0f6b5c; --paper:#2b4c8c; --reviewer:#7a3fb8; --pipeline:#b36b00;
  --deep-soft:#eaf6f2; --paper-soft:#eef3fb; --reviewer-soft:#f6effc; --pipeline-soft:#fdf5e7;
  --up:#f3f8ff; --down:#f4fbf8; --warn:#8c6d1f; --warn-soft:#fbf6e5;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:var(--ink);background:var(--bg);line-height:1.65;font-size:14px}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;font-size:.88em;background:#f0f2f5;padding:1px 5px;border-radius:4px;color:#35415a}
pre{background:#101826;color:#d8e3f4;padding:14px 18px;border-radius:10px;overflow:auto;font-size:12.5px;line-height:1.55;max-height:62vh}
pre.doc-body{white-space:pre-wrap;word-break:break-word}
a{color:var(--accent);text-decoration:none}
h1{font-size:24px;margin:0 0 6px}
h2{font-size:20px;margin:0 0 8px}
h3{font-size:16px;margin:0 0 8px;color:var(--ink)}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.subtitle{max-width:980px;color:var(--ink-soft);font-size:14px;margin-top:6px}
header.app{z-index:1;background:#fff;border-bottom:1px solid var(--line);padding:16px 22px 12px}
.legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.legend span{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:3px 10px;font-size:12px;color:var(--ink-soft)}
.dot{width:9px;height:9px;border-radius:50%;display:inline-block}
.dot.deep{background:var(--deep)} .dot.paper{background:var(--paper)} .dot.reviewer{background:var(--reviewer)} .dot.pipeline{background:var(--pipeline)}
.controls{display:flex;gap:8px;margin-top:10px}
.controls button{background:#fff;border:1px solid var(--line-strong);border-radius:8px;padding:5px 10px;cursor:pointer;font-size:12px;color:var(--ink-soft)}
.tabbar{position:sticky;top:calc(0px + 0px);z-index:25;background:var(--bg);padding:10px 22px 8px;border-bottom:1px solid var(--line);overflow-x:auto;white-space:nowrap;scrollbar-width:thin}
.tab{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line-strong);background:#fff;color:var(--ink-soft);border-radius:9px;padding:6px 10px;margin-right:8px;cursor:pointer;font-size:12.5px;vertical-align:top}
.tab:hover{border-color:var(--accent-border);color:var(--accent)}
.tab.active{background:var(--ink);border-color:var(--ink);color:#fff}
.tab .tab-mode{font-weight:700;font-family:ui-monospace,Menlo,Consolas,monospace}
.tab .tab-title{color:inherit;font-weight:400}
.skill-dot{width:8px;height:8px;border-radius:50%;background:var(--deep)}
.tab.skill-academic-paper .skill-dot{background:var(--paper)}
.tab.skill-academic-paper-reviewer .skill-dot{background:var(--reviewer)}
.tab.skill-academic-pipeline .skill-dot{background:var(--pipeline)}
.tab-group{display:inline-block;margin-right:12px;border-right:1px solid var(--line);padding-right:12px;vertical-align:top}
.tab-group-label{display:block;font-size:11px;letter-spacing:.08em;color:var(--muted);margin-bottom:4px;text-transform:uppercase}
main{max-width:1600px;margin:18px auto 80px;padding:0 22px}
.mode-panel{display:none}
.mode-panel[active]{display:block;animation:fade .18s ease}
@keyframes fade{from{opacity:.4}to{opacity:1}}
.mode-hero{display:flex;justify-content:space-between;gap:24px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 22px;margin-bottom:10px;flex-wrap:wrap}
.mode-route{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:var(--accent);font-weight:700}
.mode-intent{margin:4px 0 0;color:var(--ink-soft)}
.mode-facts{display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:8px 18px;font-size:12px;color:var(--ink-soft);background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:10px;padding:10px 14px}
.mode-facts div{display:flex;flex-direction:column}
.mode-facts span{color:var(--muted);font-size:11px}
.prereq{margin:0 0 10px;background:#fff;border:1px dashed var(--line-strong);border-radius:10px;padding:8px 14px;font-size:12.5px;color:var(--ink-soft)}
.mode-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}
.column{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
.column.upstream{background:linear-gradient(180deg,var(--up) 0,#fff 160px)}
.column.converted{background:linear-gradient(180deg,var(--down) 0,#fff 160px)}
.column h3{display:flex;align-items:center;justify-content:space-between;margin:0 0 4px}
.count{font-size:12px;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:999px;padding:1px 9px}
.col-note{font-size:12.5px;color:var(--muted);margin:0 0 10px}
details{border:1px solid var(--line);border-radius:10px;background:#fff;margin:0 0 8px;overflow:hidden}
details>summary{cursor:pointer;padding:9px 12px;background:#fbfcfe;list-style:none;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px}
details>summary::-webkit-details-marker{display:none}
details>summary::before{content:"▸";color:var(--muted);font-size:12px;transition:transform .15s}
details[open]>summary::before{transform:rotate(90deg)}
details.doc>summary{background:var(--up)}
details.node>summary{background:var(--down)}
details.node.gate>summary{background:var(--warn-soft)}
details.node.subgraph>summary{background:var(--pipeline-soft)}
details.sub{margin:8px}
details.sub>summary{background:#f7f8fa;font-size:12.5px}
.badge{font-size:10px;font-weight:700;letter-spacing:.06em;padding:1px 7px;border-radius:999px;border:1px solid;white-space:nowrap}
.kind-skill{color:#0f6b5c;border-color:#a8d8cc;background:#eaf6f2}
.kind-registry{color:#2b4c8c;border-color:#b9cbec;background:#eef3fb}
.kind-agent{color:#7a3fb8;border-color:#d9c2ee;background:#f6effc}
.kind-reference{color:#b36b00;border-color:#ecd09a;background:#fdf5e7}
.kind-shared{color:#54606f;border-color:#ccd2da;background:#f2f4f7}
 .kind-template{color:#8c5b1f;border-color:#e3cba4;background:#fbf3e4}
.doc-path{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:var(--ink-soft)}
.doc-purpose{color:var(--muted);font-size:12px;flex:1;min-width:160px}
.meta{color:var(--muted);font-size:11px;white-space:nowrap}
.doc-meta,.node-meta{margin:8px 12px;color:var(--ink-soft);font-size:12.5px}
.node-meta div{margin:2px 0}
.node-id{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;color:var(--ink);font-weight:700}
.cap-id{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:6px;padding:1px 6px}
.cap-title{color:var(--ink-soft)}
.profile-banner{margin-bottom:8px;font-size:12.5px;color:var(--ink-soft);background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px 10px}
.profile-flow{margin:0 0 8px;font-size:12px;color:var(--ink-soft);background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px 10px;line-height:2}
.flow-node{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;background:#f0f2f5;border:1px solid var(--line-strong);border-radius:6px;padding:1px 6px;white-space:nowrap}
.flow-node.gate{background:var(--warn-soft);border-color:#ecd09a}
.flow-node.subgraph{background:var(--pipeline-soft);border-color:#ecd09a}
.flow-arrow{color:var(--muted);margin:0 2px}
.note{margin:0 0 8px;font-size:12.5px;color:var(--warn);background:var(--warn-soft);border:1px solid #ecd09a;border-radius:8px;padding:6px 10px}
.missing{color:#b23b3b}
footer{padding:20px 22px 40px;color:var(--muted);font-size:12px;max-width:1600px;margin:0 auto}
@media (max-width:1180px){.mode-grid{grid-template-columns:1fr}.tab-group{border-right:0}}
@media print{header.app,.tabbar,footer{display:none}.mode-panel{display:block!important;page-break-after:always}.doc-body{max-height:none;white-space:pre-wrap}}
</style>
</head>
<body>
<header class="app">
  <div class="eyebrow">Human Review Artifact · generated from vendor/ars + skills/capabilities</div>
  <h1>ARSU Mode → Capability Graph 语义转换审阅</h1>
  <p class="subtitle">左侧列出执行每个上游 ARS mode 必须读取的全部指令与参考文档；右侧并排列出该 mode 转换到 capability graph 后的节点，以及每个节点的 SKILL 指令与 knowledge。所有文档均可折叠展开。</p>
  <div class="legend">
    <span><i class="dot deep"></i>deep-research</span>
    <span><i class="dot paper"></i>academic-paper</span>
    <span><i class="dot reviewer"></i>academic-paper-reviewer</span>
    <span><i class="dot pipeline"></i>academic-pipeline</span>
    <span>共 ${MODE_DEFINITIONS.length} 个 mode</span>
  </div>
  <div class="controls"><button onclick="document.querySelectorAll('.mode-panel details').forEach(d=>d.setAttribute('open',''))">展开当前 mode 全部</button><button onclick="document.querySelectorAll('.mode-panel[active] details').forEach(d=>d.removeAttribute('open'))">折叠当前 mode 全部</button></div>
</header>
<nav class="tabbar" id="tabbar">
${skillOrder.map((skill) => `<div class="tab-group"><span class="tab-group-label">${esc(skillTitles[skill])}</span>${tabButtons.map((btn, i) => MODE_DEFINITIONS[i]?.skill === skill ? btn : "").join("")}</div>`).join("\n")}
</nav>
<main>
${panels}
</main>
<footer>本工件由 <code>scripts/generate-arsu-capability-review-html.mjs</code> 生成。上游内容读取自 <code>vendor/ars</code>；转换节点读取自 <code>skills/capabilities</code>；graph profile 结构读取自 <code>skills/arsu/profiles/registry.json</code>。Mode 定义以 <code>vendor/ars/MODE_REGISTRY.md</code> 为准。</footer>
<script>
const tabs=[...document.querySelectorAll('.tab')];
const panels=[...document.querySelectorAll('.mode-panel')];
function activate(i){tabs.forEach(t=>t.classList.toggle('active',t===tabs[i]));panels.forEach((p,n)=>n===i?p.setAttribute('active',''):p.removeAttribute('active'));window.scrollTo({top:0,behavior:'smooth'});}
tabs.forEach((t,i)=>t.addEventListener('click',()=>activate(i)));
const q=new URLSearchParams(location.search);
const initial=parseInt(q.get('tab'),10);
if(Number.isInteger(initial)&&initial>=0&&initial<${MODE_DEFINITIONS.length})activate(initial);else activate(0);
</script>
</body>
</html>
`;
writeFileSync(OUT, html, "utf8");
const kb = Math.round(Buffer.byteLength(html, "utf8") / 1024);
process.stdout.write(`wrote ${OUT} (${kb} KiB)\n`);
