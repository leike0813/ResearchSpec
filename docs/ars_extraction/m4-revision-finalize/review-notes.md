# M4 修订与定稿段提取审阅

ARS 吸收 · Phase B/M4 · 修订与定稿能力、知识包提取。

## 覆盖检查

| 上游源文件 | 去向（提取工件） | 说明 |
|---|---|---|
| `academic-paper/agents/revision_coach_agent.md`（全文） | CAP-M4-01（全文） | 全文保留；独立模式→独立子图入口 |
| `scripts/ars_anchorize_draft.py`（全文） | CAP-M4-02 脚本资产 1/2 | 脚本逐字节保留 |
| `scripts/ars_apply_revision_patch.py`（全文） | CAP-M4-02 脚本资产 2/2 | 脚本逐字节保留 |
| `academic-paper/agents/formatter_agent.md`（全文） | CAP-M4-03（全文） | 全文保留；REFUSE 层拆分留待 authoring |
| `academic-pipeline/agents/pipeline_orchestrator_agent.md` §Cite-Time Provenance Finalizer（L684-903） | CAP-M4-04 finalizer 切片 | 从编排器拆出的策略评估器 |
| `academic-pipeline/agents/pipeline_orchestrator_agent.md` §Submission-Package Terminal Gate（L956-982） | CAP-M4-04 submission-gate 切片 | 投稿包终检门 |
| `scripts/temporal_integrity_audit.py`（全文） | CAP-M4-05 脚本资产 1/2 | 5-pass 验证器 |
| `scripts/check_v3_9_4_temporal_verification.py`（全文） | CAP-M4-05 脚本资产 2/2 | 防漂移 lint |
| `academic-paper/references/revision_patch_protocol.md`（全文） | KP-M4-01 | 决策清单内（patch 协议） |
| `shared/references/firm_rules.md` §Contamination advisory（L17-52） | KP-M4-02 | 决策清单内（终端策略语义 canonical） |
| `shared/contracts/degradation_registry.json`（全文） | KP-M4-03 | 决策清单内（降级语义） |
| `academic-paper/references/latex_template_reference.md`（全文） | KP-M4-04 | 新增（formatter 引用） |
| `academic-paper/references/journal_submission_guide.md`（全文） | KP-M4-05 | 新增（formatter 引用） |
| `academic-paper/references/credit_authorship_guide.md`（全文） | KP-M4-06 | 新增（formatter 引用） |
| `academic-paper/references/funding_statement_guide.md`（全文） | KP-M4-07 | 新增（formatter 引用） |

## 未提取依赖

以下上游资产被 M4 工件引用或属定稿家族但未在本次提取：

- **披露家族**：`venue_disclosure_policies.md`、`policy_anchor_disclosure_protocol.md`、`disclosure_mode_protocol.md`、`policy_anchor_table.md`（disclosure 模式引用；formatter 文件未直接引用——authoring 阶段定夺归属）
- **投稿包验证器**：`scripts/verify_submission_package.py`、`verify_passport.py`（CAP-M4-04 submission-gate 引用；authoring 阶段随 #394 门落地时补提）
- **交叉模型/交付层**：`shared/cross_model_verification.md`（Q6 C-14 类）
- **Schema 资产**：`shared/contracts/patch/revision_patch.schema.json`、`terminal_policies.schema.json`、`citation_verification_summary.schema.json`（CAP-M4-02/04/05 的契约 schema）
- **验证器资产**：其余 `scripts/check_*.py` 与 `test_*.py`（Q6 已定归引擎侧；本次仅提取了能力直接对应的脚本）

## 审阅要点

- **M4 的独特形态**：四个能力中三个（修订补丁、时间验证、终端策略门的一半）上游**已是脚本**——提取物是逐字节的 .py/.json 资产，这正是"确定性逻辑"层，吸收时直接成为 checker 节点资产，不经过 prose 策展；
- **两处切片提取**（CAP-M4-04）：finalizer（220 行）与投稿包终检门（27 行）从 pipeline_orchestrator_agent 中按行范围切片。orchestrator 其余部分（路由/调度/checkpoint 管理）按分类学决策吸收进图引擎，不提取——这是唯一"有意不提取"的上游 agent 内容，请确认此边界；
- **formatter 的拆分标注**：CAP-M4-03 全文保留，其 REFUSE 规则段（盖章侧）与 CAP-M4-04（评估侧）的配对关系已在台账标注，authoring 阶段才真正拆开；
- **降级注册表以 JSON 原文提取**：KP-M4-03 是上游"只索引不重述"的机器可读资产，逐字节保留符合其定位；其中 `authority` 锚点指向的具体机制文件（scripts/verification_gate 等）按锚点溯源即可；
- **决策清单外新增四处**（KP-M4-04~07）：均为 formatter_agent 内嵌引用的投稿/LaTeX/署名/资助指南，属格式渲染能力所需。
