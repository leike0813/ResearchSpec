# M5 支线段提取审阅（含清尾批次）

ARS 吸收 · Phase B/M5 · 支线能力、知识包提取 + 前四里程碑全部未提取依赖的清尾。这是提取阶段的最后一个里程碑。

## 覆盖检查

**支线能力（9 个 agent 文件 + 6 个脚本资产）**

| 上游源文件 | 去向 |
|---|---|
| `deep-research/agents/meta_analysis_agent.md` | CAP-M5-01（全文） |
| `deep-research/agents/risk_of_bias_agent.md` | CAP-M5-02（全文） |
| `deep-research/agents/socratic_mentor_agent.md` | CAP-M5-03 dr-variant（全文） |
| `academic-paper/agents/socratic_mentor_agent.md` | CAP-M5-03 ap-variant（全文） |
| `academic-paper/agents/visualization_agent.md` | CAP-M5-04（全文） |
| `deep-research/agents/monitoring_agent.md` | CAP-M5-05（全文） |
| `academic-pipeline/agents/claim_ref_alignment_audit_agent.md` | CAP-M5-06（全文） |
| `shared/agents/compliance_agent.md` | CAP-M5-07（全文） |
| `academic-pipeline/agents/collaboration_depth_agent.md` | CAP-M5-08（全文） |
| `scripts/verify_submission_package.py` / `verify_passport.py` | CAP-M5-09/10（清尾） |
| `scripts/verification_gate/__init__.py` / `pdf_read_preflight.py` / `citation_verification_summary.py` / `contamination_signals.py` | CAP-M5-11~14（清尾） |

**支线知识包（15 个）**：SR 协议/工具箱、苏格拉底模式协议/提问框架、plan 模式协议、统计可视化标准、VLM 图形验证、监测策略、claim 审计校准协议、RAISE、PRISMA-trAIce、协作深度 rubric、校准/引导/复审三个评审模式协议。

**清尾知识包（18 个）**：API 协议 ×4（S2/OpenAlex/Crossref/arXiv）、IRB 决策树/EQUATOR/预注册、三个术语表 + 高教领域词汇表、领域证据 profile、中文 APA 指南、APA 扩展指南、标题修辞指南、失败路径（deep-research 版）、跨模型验证协议、文献矩阵模板。

## 未提取依赖（提取阶段收尾后的剩余清单）

以下内容**不进入**本次保真承诺，归入"authoring 阶段按需处理的资产清单"：

- **Schema 资产**（机器可读契约，authoring 阶段按能力落地时复制）：`shared/contracts/` 全部 schema 与模板（passport 18 端口、sprint contract、reviewer/writer/evaluator 模板、patch、terminal_policies 等）；
- **其余脚本与测试**：`scripts/check_*.py`（64 个防漂移校验器，Q6 已定归引擎侧验证器资产）、`test_*.py`、`scripts/adapters/`（Zotero/Obsidian/文件夹扫描适配器）、其余工具脚本；
- **SKILL.md 层引用（能力文件未直接引用）**：`writing_judgment_framework.md`、`cross_agent_quality_definitions.md`、`workflow_phase_details.md`、`mode_selection_guide.md`（dr+ap）、`failure_paths.md`（academic-paper 版）、`changelog.md` ×3、`integration_guide.md`——这些是 SKILL.md 编排层的辅助文档，SKILL.md 被图引擎/路由层替代后不再有宿主，authoring 阶段定夺；
- **披露家族**：`venue_disclosure_policies.md`、`policy_anchor_disclosure_protocol.md`、`disclosure_mode_protocol.md`、`policy_anchor_table.md`——disclosure 模式的实现载体（能力归属）尚未在分类学中定案，authoring 阶段随 disclosure 能力决策补提；
- **examples/ 与 evals/**：示例与评估集，非知识资产；
- **docs/design/（83 篇）**：设计决策溯源文档，作为溯源参考保留在 vendor 中，不提取；
- **commands/、hooks/**：平台包装层，不进能力契约（Q6 C-14 类）。

## 审阅要点

- **这是提取阶段的最后一个里程碑**：M5A 是决策清单的支线段；M5B（清尾批次，38 个工件中标注"标注-清尾"的 22 个）把 M1–M4 审阅文档中"未提取依赖清单"里**被能力文件直接引用**的资产全部收口。未收口的是上面列出的非知识/非能力资产，请在审阅时确认这个边界划分；
- **苏格拉底引擎两变体**（CAP-M5-03 dr/ap，上游最大的一对 agent 文件：724 + 527 行）：合并参数化（persona/domain）留待 authoring；
- **协作观察者的吸收归属**：CAP-M5-08 按分类学决策"吸收进图引擎 observer 节点"，但 agent 全文仍按保真契约提取保留，rubric 单独成包（KP-M5-12）；
- **清尾脚本四件**（CAP-M5-11~14）：引文验证门、PDF 预检、验证摘要、污染信号计算——都是降级注册表（KP-M4-03）authority 锚点或能力契约直接指向的确定性资产，吸收后归 checker/引擎侧；
- **提取后全景**：五个里程碑合计 119 个工件。全部通过逐字节验证后，提取阶段即告完成，下一阶段是 authoring（能力合并、图引擎落地、策展闸门）。
