# M1 研究段提取审阅

ARS 吸收 · Phase B/M1 · 研究段能力与知识包提取。

## 覆盖检查

| 上游源文件 | 去向（提取工件） | 说明 |
|---|---|---|
| `deep-research/agents/bibliography_agent.md`（全文） | CAP-M1-01 dr-variant（全文）；内嵌段另存 KP-M1-03（PRISMA 文档化）、KP-M1-08（指令边界） | 全文保留 + 知识包抽取 |
| `academic-paper/agents/literature_strategist_agent.md`（全文） | CAP-M1-01 ap-variant（全文） | 全文保留；两变体合并留待 authoring |
| `deep-research/agents/source_verification_agent.md`（全文） | CAP-M1-02（全文） | 全文保留 |
| `deep-research/agents/synthesis_agent.md`（全文） | CAP-M1-03（全文）；内嵌段另存 KP-M1-05（声明意图发射）、KP-M1-06（三层引用） | 全文保留 + 知识包抽取 |
| `deep-research/agents/research_question_agent.md`（全文） | CAP-M1-04（全文）；内嵌段另存 KP-M1-02/02b（FINER） | 全文保留 + 知识包抽取 |
| `deep-research/agents/research_architect_agent.md`（全文） | CAP-M1-05（全文） | 全文保留 |
| `deep-research/references/source_quality_hierarchy.md`（全文） | KP-M1-01 | 全文保留 |
| `deep-research/references/apa7_style_guide.md`（全文） | KP-M1-07 | 全文保留 |
| `academic-pipeline/references/literature_corpus_consumers.md`（全文） | KP-M1-04 | 全文保留 |
| `shared/references/firm_rules.md` §Claim Intent Manifest（L53-77） | KP-M1-05b | canonical 块抽取；其余 firm rules 留待相关里程碑 |

## 未提取依赖

以下上游资产被 M1 工件引用但未在本次提取——它们不参与 M1 保真承诺，将在对应里程碑单独提取：

- **API 协议知识包**：`semantic_scholar_api_protocol.md`、`openalex_api_protocol.md`、`crossref_api_protocol.md`、`arxiv_api_protocol.md`（被 CAP-M1-01/02 的 Tier 0 验证、污染信号计算引用）
- **领域知识包**：`academic-paper/references/domain_evidence_profiles.md`、`apa7_chinese_citation_guide.md`（CAP-M1-01 ap-variant 引用）
- **方法论知识包**：`irb_decision_tree.md`、`equator_reporting_guidelines.md`、`preregistration_guide.md`（CAP-M1-05 引用）
- **术语表**：`irb_terminology_glossary.md`、`psychometric_terminology_glossary.md`、`word_count_conventions.md`（后者已入 M2）
- **Schema 资产**：`shared/contracts/passport/*.schema.json`（claim_intent_manifest、literature_corpus_entry 等）
- **验证器资产**：`scripts/check_*.py`（check_v3_7_3_three_layer_citation.py 等，Q6 已定归引擎侧）
- **权威模式文档**：`shared/ground_truth_isolation_pattern.md`、`shared/cross_model_verification.md`
- **模板**：`templates/literature_matrix_template.md`

## 审阅要点

- **审阅顺序建议**：先看知识包（小、独立），再看能力文件（全文保留，主要审变更台账与归属标注）；
- **重点检查台账**：每处"标注"与"保留-待定"都是提取阶段对原文的唯一干预点，如有异议请指出条目编号；
- **两变体合并**：CAP-M1-01 的 dr/ap 两变体（检索策略框架 vs 4-Layer 渐进策略）的合并方案将在 authoring 阶段按 Q1 决策设计，届时单独出方案供审阅。
