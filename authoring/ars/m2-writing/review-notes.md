# M2 写作段提取审阅

ARS 吸收 · Phase B/M2 · 写作段能力与知识包提取。

## 覆盖检查

| 上游源文件 | 去向（提取工件） | 说明 |
|---|---|---|
| `academic-paper/agents/intake_agent.md`（全文） | CAP-M2-01（全文） | 全文保留；跳步逻辑标注归引擎（Q5） |
| `academic-paper/agents/structure_architect_agent.md`（全文） | CAP-M2-02（全文） | 全文保留 |
| `academic-paper/agents/argument_builder_agent.md`（全文） | CAP-M2-03（全文） | 全文保留 |
| `academic-paper/agents/draft_writer_agent.md`（全文） | CAP-M2-04 ms-variant（全文） | 全文保留；与 rr-variant 合并留待 authoring（Q1） |
| `deep-research/agents/report_compiler_agent.md`（全文） | CAP-M2-04 rr-variant（全文） | 全文保留；内嵌引用段已另存 M1 知识包（KP-M1-05/06） |
| `academic-paper/agents/abstract_bilingual_agent.md`（全文） | CAP-M2-05（全文） | 全文保留 |
| `academic-paper/agents/citation_compliance_agent.md`（全文） | CAP-M2-06（全文） | 全文保留 |
| `academic-paper/references/academic_writing_style.md`（全文） | KP-M2-01 | 全文保留 |
| `academic-paper/references/abstract_writing_guide.md`（全文） | KP-M2-02 | 全文保留 |
| `academic-paper/references/anti_leakage_protocol.md`（全文） | KP-M2-03 | 全文保留 |
| `shared/references/word_count_conventions.md`（全文） | KP-M2-04 | 全文保留（M1 未提取依赖清单中已预告入 M2） |
| `academic-paper/references/citation_format_switcher.md`（全文） | KP-M2-05 | 全文保留 |
| `shared/style_calibration_protocol.md`（全文） | KP-M2-06 | 全文保留 |
| `academic-paper/references/writing_quality_check.md`（全文） | KP-M2-07 | 全文保留（决策清单外新增，见台账标注） |
| `academic-paper/references/paper_structure_patterns.md`（全文） | KP-M2-08 | 全文保留（决策清单外新增，见台账标注） |

## 未提取依赖

以下上游资产被 M2 工件引用但未在本次提取——将在对应里程碑单独提取：

- **M4 里程碑资产**：`revision_patch_protocol.md`、`latex_template_reference.md`、`journal_submission_guide.md`、`venue_disclosure_policies.md`、`policy_anchor_disclosure_protocol.md`、`disclosure_mode_protocol.md`（CAP-M2-04/06 引用）
- **M5 苏格拉底资产**：`plan_mode_protocol.md`（CAP-M2-01/03 的 Plan Mode 段引用）
- **中文引文规范**：`apa7_chinese_citation_guide.md`、`apa7_extended_guide.md`（CAP-M2-06 引用；前者 M1 已登记）
- **受保护措辞表**：`shared/references/protected_hedging_phrases.md`（CAP-M2-05 Protected Hedges 段引用）
- **领域知识包**：`domain_evidence_profiles.md`、`hei_domain_glossary.md`（CAP-M2-01 引用）
- **写作/投稿辅助**：`intro_title_rhetoric_guide.md`、`funding_statement_guide.md`、`credit_authorship_guide.md`、`writing_judgment_framework.md`、`workflow_phase_details.md`（M2 能力文件或 SKILL 引用）
- **Schema/验证器资产**：`shared/contracts/passport/*.schema.json`、`scripts/check_*.py`（Q6 已定归引擎侧）
- **统计可视化标准**：`statistical_visualization_standards.md`（M5 可视化里程碑）

## 审阅要点

- **两处决策清单外新增**（KP-M2-07 写作质量检查、KP-M2-08 论文结构模式）：新增理由已写入各自台账"标注-新增"条目——两包均被 M2 能力文件内嵌引用，属 M2 完整性所需；如不同意纳入 M2，可移回未提取依赖清单；
- **drafting 两变体**（CAP-M2-04 ms/rr）：这是 Q1 决策的核心合并对象，提取阶段保留两个全文；建议重点看两个变体的"共享段"（写作风格、质检、引用发射、CIM、时间铁律）与"差异段"（IMRaD 逐节程序 vs 研究报告九段式）的边界；
- **横切协议内嵌确认**：CAP-M2-04 两变体内嵌的反泄漏（C-05）、时间铁律（C-06）文本应逐字一致于 KP-M2-03 与 M4 时间验证包——如有措辞差异，属上游漂移证据，请在审阅中指出；
- **引文格式知识去重**：KP-M2-05（五种格式 SSOT）与 CAP-M2-06 内嵌简表、KP-M1-07（APA 7.0）三处关系已在台账标注，authoring 阶段将三源归一。
