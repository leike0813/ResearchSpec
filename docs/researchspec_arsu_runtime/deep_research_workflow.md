# Deep Research Workflow

## 1. 两层视图

![Deep Research 内层语义编排与外层控制循环](diagrams/rendered/deep-research-workflow.svg)

`deep-research` 是研究问题澄清、证据发现、来源核验、综合、事实核查和研究报告生产者。它在 ARSU 内部组织 13 个学术 agent；ResearchSpec 外层则把 8 个 mode route 投影为独立 subflow template，并按 artifact DAG 逐 work 暴露 frontier。

两个层次不能一一等同：ARSU 的 6 phase 是完成研究的语义方法，外层 standalone template 只有一个名为 `work` 的 stage，CLI 关心的是当前允许生产哪个 artifact、依赖是否满足以及 formal Gate 是否通过。

## 2. 内部 agent team

| 语义环节 | Agent | 核心责任 |
| --- | --- | --- |
| 研究界定 | `research_question_agent` | 将模糊主题收敛为 FINER 研究问题、边界和子问题 |
| 方法设计 | `research_architect_agent` | 范式、方法、数据策略、分析框架和有效性标准 |
| 文献发现 | `bibliography_agent` | 检索、筛选、注释书目和文献语料 |
| 来源核验 | `source_verification_agent` | 证据分级、期刊与利益冲突检查、时效性 |
| 综合分析 | `synthesis_agent` | 主题综合、矛盾、汇聚/分歧、知识缺口 |
| 报告编写 | `report_compiler_agent` | 组合 APA 报告并在反馈后修订 |
| 编辑评估 | `editor_in_chief_agent` | 原创性、方法严谨性、证据充分性和整体判定 |
| 反方压力测试 | `devils_advocate_agent` | 假设、逻辑、确认偏差和替代解释 |
| 伦理检查 | `ethics_review_agent` | 归属、披露、双重用途和公平呈现 |
| 苏格拉底引导 | `socratic_mentor_agent` | 多层研究思考与问题收敛 |
| 系统综述 | `risk_of_bias_agent`、`meta_analysis_agent` | 偏倚风险、效应量、异质性、GRADE 或叙述综合 |
| 后续监测 | `monitoring_agent` | 新文献、撤稿和矛盾证据提醒；不属于主流程完成条件 |

## 3. 内层 6-phase 语义流程

1. **Scoping**：研究问题与方法蓝图，Devil's Advocate 检查，用户确认研究边界。
2. **Investigation**：检索、筛选、注释书目和来源核验。
3. **Analysis**：跨来源综合、矛盾处理、缺口分析和第二次压力测试。
4. **Composition**：编写结构化研究报告。
5. **Review**：编辑、伦理和反方角色并行评价。
6. **Revision**：处理反馈、记录无法解决的限制并交付报告。

这些内部 checkpoint 继续约束 ARSU 的工作质量，但不会自动写 `gate-ledger.jsonl`。只有下表标为 required 的 profile Gate 才是 formal Gate。

## 4. 八条 route

| Route | 主要用途与前置条件 | 外层 artifact DAG | Gate | Risk / cost |
| --- | --- | --- | --- | --- |
| `deep-research:full` | 完整证据研究；需要 `project.md` 和 research goal | `rq_brief → {methodology_blueprint ∥ bibliography} → synthesis_report → research_report`；并行组 all-join | required `evidence_quality` | high；high/long_horizon |
| `deep-research:quick` | 快速研究简报；需要 project 和 goal | `research_brief → bibliography` | none | low；low/single_pass |
| `deep-research:review` | 审阅现有研究文本或报告；需要 project 与文本/registered report | `research_review_report` | advisory `evidence_quality` | medium；medium/single_pass |
| `deep-research:lit-review` | 针对研究问题检索并综合证据 | `{bibliography ∥ source_corpus} → literature_matrix → synthesis_report`；并行组 all-join | required `evidence_quality` | high；medium/iterative |
| `deep-research:three-way-scan` | WHY/HOW/WHAT 快速论文比较；需要 project 和 goal | `comparison_matrix → reading_shortlist` | none | low；low/single_pass |
| `deep-research:fact-check` | 核验明确 claims；需要 project 与 claims 或 synthesis | `fact_check_report` | advisory `claim_verification` | high；low/single_pass |
| `deep-research:socratic` | 通过对话澄清模糊研究想法；需要 project 和初步 goal | `rq_brief → research_plan_summary` | none | medium；variable/iterative |
| `deep-research:systematic-review` | PRISMA 系统综述或 meta-analysis；需要 review question 或 RQ Brief，缺失时 fallback 到 socratic | `protocol → {prisma_materials ∥ risk_of_bias_report} → meta_analysis_report → research_report`；并行组 all-join | required `methodology_compliance`、`evidence_quality` | high；high/long_horizon |

表中的 `effort/interaction` 是 routing catalog 的分类，不是 token、时间或金额承诺。

## 5. 一次 standalone full 的实际控制循环

1. Navigate 从用户目标推荐 `deep-research:full`，并与 status 的 startable subflows 相交。
2. 用户确认后 Start 创建 standalone instance。
3. `work:<instance>/rq-brief` instructions 将 ARSU 限定到 RQ Brief candidate。
4. Submit 登记 RQ Brief 后，CLI 同时暴露 methodology 和 bibliography；这是 profile-level parallel frontier。
5. 两项都登记后，all-join 解锁 synthesis；之后解锁 research report。
6. 所有 required artifacts 完成后，`gate-evidence-quality` 才 ready。
7. Verify 提出 verdict，用户确认，CLI 提交 Gate。
8. 唯一 `complete` transition 执行后，subflow 完成。

ARSU 可以在一个语义调用中形成多个草稿材料，但只有当前 instructions 声明的 candidate 可以被提交为该 work 的正式输出。未被当前 frontier 选中的跨 phase 写入不获得运行授权。

## 6. Handoff

Deep Research 的正式输出通过 registry 交给 downstream。`academic-paper:full` 通常消费 RQ Brief、bibliography/source corpus 和 synthesis report；pipeline 则在 research child 完成后由父级 transition 激活 write stage。聊天中的“研究已经完成”或 ARS Material Passport 不能替代这些 registry/receipt 证据。

## 7. 失败与恢复

- 研究问题无法收敛：保持当前 work ready，继续 socratic/scoping，不提前提交空 RQ Brief。
- 文献或来源不可验证：在 candidate 中显式记录缺口；formal Gate 依据证据判定。
- Zotero 不可用：普通研究可披露限制后走外部检索；依赖私有 selection/collection 时暂停。
- 内部 reviewer 要求 revision：这是 ARSU 语义反馈；是否形成 formal blocker 仍取决于 profile Gate。
- 会话中断：新 Agent 从 status 和已登记 artifact 恢复，不从内部 phase 编号猜测进度。
