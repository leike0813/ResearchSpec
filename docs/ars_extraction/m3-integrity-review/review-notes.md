# M3 完整性与评审段提取审阅

ARS 吸收 · Phase B/M3 · 完整性验证与评审团能力、知识包提取。

## 覆盖检查

| 上游源文件 | 去向（提取工件） | 说明 |
|---|---|---|
| `academic-pipeline/agents/integrity_verification_agent.md`（全文） | CAP-M3-01（全文） | 全文保留；双模式切换标注归图引擎 |
| `academic-paper-reviewer/agents/field_analyst_agent.md`（全文） | CAP-M3-02（全文） | 全文保留 |
| `deep-research/agents/editor_in_chief_agent.md`（全文） | CAP-M3-03 dr-variant（全文） | 全文保留；与 reviewer-variant 合并留待 authoring |
| `academic-paper-reviewer/agents/eic_agent.md`（全文） | CAP-M3-03 reviewer-variant（全文） | 全文保留 |
| `academic-paper-reviewer/agents/methodology_reviewer_agent.md`（全文） | CAP-M3-04 r1-variant（全文） | 全文保留；Q2 合并留待 authoring |
| `academic-paper-reviewer/agents/domain_reviewer_agent.md`（全文） | CAP-M3-04 r2-variant（全文） | 全文保留 |
| `academic-paper-reviewer/agents/perspective_reviewer_agent.md`（全文） | CAP-M3-04 r3-variant（全文） | 全文保留 |
| `deep-research/agents/devils_advocate_agent.md`（全文） | CAP-M3-05 dr-variant（全文）；内嵌段另存 KP-M3-05a（L144-184） | 全文保留 + 知识包抽取 |
| `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`（全文） | CAP-M3-05 reviewer-variant（全文）；内嵌段另存 KP-M3-05b（L319-363） | 全文保留 + 知识包抽取 |
| `academic-paper-reviewer/agents/editorial_synthesizer_agent.md`（全文） | CAP-M3-06（全文） | 全文保留 |
| `academic-paper/agents/peer_reviewer_agent.md`（全文） | CAP-M3-07（全文，Q4 降格产物） | 全文保留 |
| `academic-pipeline/references/ai_research_failure_modes.md`（全文） | KP-M3-01 | 决策清单内 |
| `academic-paper-reviewer/references/quality_rubrics.md`（全文） | KP-M3-02a | 决策清单内（rubric 族） |
| `academic-paper-reviewer/references/review_criteria_framework.md`（全文） | KP-M3-02b | 决策清单内（rubric 族） |
| `academic-paper-reviewer/references/statistical_reporting_standards.md`（全文） | KP-M3-03 | 决策清单内 |
| `academic-paper-reviewer/references/editorial_decision_standards.md`（全文） | KP-M3-04 | 决策清单内 |
| `academic-paper-reviewer/references/sprint_contract_protocol.md`（全文） | KP-M3-06 | 新增（C-02 协议） |
| `academic-pipeline/references/claim_verification_protocol.md`（全文） | KP-M3-07 | 新增 |
| `deep-research/references/logical_fallacies.md`（全文） | KP-M3-08 | 新增 |
| `academic-pipeline/references/integrity_review_protocol.md`（全文） | KP-M3-09 | 新增 |
| `academic-paper-reviewer/references/top_journals_by_field.md`（全文） | KP-M3-10 | 新增 |
| `shared/references/claim_strength_ladder.md`（全文） | KP-M3-11 | 新增 |
| `academic-pipeline/references/plagiarism_detection_protocol.md`（全文） | KP-M3-12 | 新增 |

## 未提取依赖

以下上游资产被 M3 工件引用但未在本次提取——将在对应里程碑单独提取：

- **M5 支线**：`calibration_mode_protocol.md`（integrity 与 domain_reviewer 引用；calibration 属支线）、`vlm_figure_verification.md`（可视化里程碑）、`cross_model_verification.md`（交付层，Q6 C-14 类）
- **M1 已登记**：`semantic_scholar_api_protocol.md`（integrity Tier 验证引用）
- **评审模式协议**：`re_review_mode_protocol.md`、`guided_mode_protocol.md`（reviewer SKILL 引用，能力文件未直接引用；authoring 阶段随 re-review 子图设计时补提）
- **Schema 资产**：`shared/contracts/reviewer/*.json`、`sprint_contract.schema.json`（Schema 13/13.1，评审契约模板）
- **验证器资产**：`scripts/check_sprint_contract.py`、`check_agents_mirror_sync.py` 等（Q6 已定归引擎侧）

## 审阅要点

- **七处决策清单外新增**（KP-M3-06 ~ KP-M3-12）：新增准则与 M2 相同——被 M3 能力文件内嵌引用且属完整性所需。其中 KP-M3-06（Sprint 盲态协议）是 Q2/Q3 决策保留的核心协议（C-02），KP-M3-07（claim 抽样）是 integrity 多处声明的权威文件，其余为对应能力直接引用的知识源。如不同意任一纳入，可移回未提取依赖清单；
- **四个合并对象的变体保留**（CAP-M3-03 编辑评判 ×2、CAP-M3-04 专家评审 ×3、CAP-M3-05 DA ×2）：提取阶段全部保留全文，合并在 authoring 阶段执行（Q2 的视角参数化、分类学的靶标参数化）；建议审阅时重点对比变体间的共享骨架与差异段；
- **Q4 决策的落地证据**：CAP-M3-07（peer_reviewer_agent）上游 L551 自认"两层评审是已知技术债务"——这是 Q4 决策（唯一权威 + 自检降格）的直接上游证据，建议确认该段的保留与台账标注；
- **让步阈值家族**：KP-M3-05a/05b 是上游显式声明的平行协议（同一 1-5 量表、不同动作标签），两者均保留；authoring 阶段是否归一为一个知识包待定。
