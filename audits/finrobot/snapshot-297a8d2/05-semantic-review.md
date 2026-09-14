# FinRobot Extension Anchor Semantic Review — snapshot-297a8d2

## 审阅范围

本锚点将六个 reviewed FinRobot vendor-bundle Skills 一对一转换为
`skills/plugins/extensions/` 下的 capability package + 一节点 graph profile：

- `financial-research-company-fundamentals` -> `plugin-financial-company-fundamentals`（mixed）
- `financial-research-competitive-position` -> `plugin-financial-competitive-position`（llm）
- `financial-research-corporate-risk` -> `plugin-financial-corporate-risk`（llm）
- `financial-research-event-evidence` -> `plugin-financial-event-evidence`（mixed）
- `financial-research-relative-valuation` -> `plugin-financial-relative-valuation`（mixed）
- `financial-research-statement-analysis` -> `plugin-financial-statement-analysis`（mixed，validator 契约重构）

工具文件从 vendor bundle `scripts/` 与 `lib/` 逐字节复制；raw Skills 继续保留在
`skills/plugins/vendors/finrobot/` 作为 advisory surface。

## 逐项语义判定

### 1. plugin-financial-company-fundamentals

- 上游语义义务 1：先定义 entity/currency/as-of/period/decision 再取数。
  上游原文：“Define the company, reporting currency, as-of date, and decision question
  before collecting evidence.” 转换后承载：extension `SKILL.md` Procedure 1。判定：`preserved`。
- 上游语义义务 2：metrics 与 forecast 必须通过正式 entrypoint。
  上游原文：“Use this entrypoint for every deterministic metrics or forecast command.”
  转换后承载：Procedure 4/5 的 `python3 tools/fundamentals.py metrics|forecast`，
  `knowledge_refs` 绑定 `tools/fundamentals.py` 与 `tools/financial_support.py`。判定：`preserved`。
- 上游语义义务 3：脚本不得选择 source quality/assumptions/business meaning/rating。
  上游原文见 Hard constraints：“Do not let a script choose source quality, forecast
  assumptions, business meaning, materiality, investment thesis, or rating.”
  转换后承载：extension Hard constraints 同条。判定：`preserved`。
- 上游语义义务 4：报告必须区分事实/计算/假设/预测/判断并链接证据。
  上游原文见 Outputs and completion。转换后承载：Procedure 7 的 `research_brief`
  必填字段 `scope, source_ledger, business_model, historical_metrics, scenarios,
  forecast_tables, conclusions`，validator 逐一非空检查。判定：`adapted`（报告结构化为 JSON
  必填字段，语义未丢失）。
- 上游语义义务 5：缺失 scope 时只问一个聚焦问题、脚本拒绝时修复字段。
  上游原文见 Failure handling。转换后承载：extension Failure handling。判定：`preserved`。
- 判定小结：`preserved`（四 preserved + 一 adapted，无 removed/gap）。

### 2. plugin-financial-competitive-position

- 上游语义义务 1：peer 选择必须依据经济驱动而非行业代码。
  上游原文：“Establish inclusion and exclusion criteria based on economic drivers rather
  than sector labels.” 转换后承载：Procedure 2 与 Hard constraints 第一条。判定：`preserved`。
- 上游语义义务 2：对齐期间/货币/单位/会计定义/企业价值日。
  上游原文见 Workflow 3 与 Hard constraints。转换后承载：Procedure 3 与 Hard constraints。判定：`preserved`。
- 上游语义义务 3：优势主张必须有可证伪指标。
  上游原文：“Connect market share, pricing power, retention, switching costs, ... to an
  observable mechanism and a falsifying metric.” 转换后承载：Procedure 5。判定：`preserved`。
- 上游语义义务 4：估值解释必须建立在可比性限制之后。
  上游原文：“Explain relative valuation only after identifying comparability limits...”
  转换后承载：Procedure 6。判定：`preserved`。
- 上游语义义务 5：无脚本，Agent 拥有 peer/结论。上游原文见 Responsibilities。
  转换后承载：manifest `execution_type: llm`、`knowledge_refs: []`，仅 output-role policy validator。判定：`preserved`。
- 判定小结：`preserved`（五 preserved，无 adapted/removed/gap）。

### 3. plugin-financial-corporate-risk

- 上游语义义务 1：区分 observed/disclosed/inferred/scenario/unsupported。
  上游原文：“Separate observed conditions, disclosed risks, inferred exposures, scenarios,
  and unsupported allegations.” 转换后承载：Procedure 2。判定：`preserved`。
- 上游语义义务 2：风险要有 trigger/transmission path/受影响变量/timing/reversibility。
  上游原文见 Workflow 3。转换后承载：Procedure 3 与必填字段 `transmission_paths`。判定：`preserved`。
- 上游语义义务 3：必须区分 mitigants 与 residual exposure。
  上游原文：“state residual exposure rather than treating mitigation as elimination.”
  转换后承载：Procedure 5 与必填字段 `mitigants, residual_exposure`。判定：`preserved`。
- 上游语义义务 4：不得发明概率、不得让 boilerplate 变成 entity-specific evidence。
  上游原文见 Hard constraints。转换后承载：Hard constraints 同条。判定：`preserved`。
- 上游语义义务 5：每个 priority risk 要有 evidence-backed causal path、uncertainty、
  monitoring signal 和 rank reason。上游原文见 Outputs and completion。
  转换后承载：必填字段 `risk_register, monitoring_indicators, conclusions` + validator。判定：`adapted`。
- 判定小结：`preserved`（四 preserved + 一 adapted，无 removed/gap）。

### 4. plugin-financial-event-evidence

- 上游语义义务 1：prepare 与 rank 是唯一确定性 entrypoint。
  上游原文：“Use this entrypoint for every deterministic prepare or rank command.”
  转换后承载：Procedure 3/6 的 `python3 tools/event_evidence.py prepare|rank`，
  工具与 support 为 knowledge_refs。判定：`preserved`。
- 上游语义义务 2：脚本只做时间规范化、去重、稳定 ID、排序，不推断语义。
  上游原文见 Hard constraints 第一条与 Responsibilities。转换后承载：Hard constraints 同条。判定：`preserved`。
- 上游语义义务 3：semantic scores 由 Agent 提供并给出 rationale/invalidation condition。
  上游原文：“give every numeric score a rationale and invalidation condition.”
  转换后承载：Procedure 5 与必填字段 `assessments, ranking`。判定：`preserved`。
- 上游语义义务 4：event date 与 publication date 必须区分。
  上游原文：“distinguish event date from publication date and later commentary.”
  转换后承载：Procedure 2 与必填字段 `event_timeline, duplicate_decisions`。判定：`preserved`。
- 上游语义义务 5：重复记录判定规则（exact 可删，paraphrase/conflict 需 Agent 决策）。
  上游原文见 Hard constraints。转换后承载：Hard constraints 同条。判定：`preserved`。
- 判定小结：`preserved`（五 preserved，无 adapted/removed/gap）。

### 5. plugin-financial-relative-valuation

- 上游语义义务 1：value/sensitivity 必须通过正式 entrypoint。
  上游原文：“Use this entrypoint for every deterministic value or sensitivity command.”
  转换后承载：Procedure 4/5 的 `python3 tools/valuation.py value|sensitivity`。判定：`preserved`。
- 上游语义义务 2：discount rate > terminal growth 必须拒绝无效组合。
  上游原文见 Hard constraints 第一条。转换后承载：Hard constraints 同条。判定：`preserved`。
- 上游语义义务 3：脚本不得推断 assumptions/peer sets/weights/targets/ratings。
  上游原文见 Hard constraints 第二条。转换后承载：Hard constraints 同条。判定：`preserved`。
- 上游语义义务 4：解释范围而不是挑选最有利点，不得平均不兼容方法制造精度。
  上游原文见 Workflow 6。转换后承载：Procedure 6。判定：`preserved`。
- 上游语义义务 5：target price 必须声明 horizon、expected information path、share basis
  与 fair-value range 的关系。上游原文见 Hard constraints 与 Outputs。
  转换后承载：Procedure 7 与必填字段 `assumptions, method_results, sensitivity,
  fair_value_range, conclusions`。判定：`adapted`。
- 判定小结：`preserved`（四 preserved + 一 adapted，无 removed/gap）。

### 6. plugin-financial-statement-analysis

- 上游语义义务 1：normalize/metrics/forecast 唯一 entrypoint。
  上游原文：“Use this entrypoint for every deterministic normalize, metrics, or forecast command.”
  转换后承载：原始 pilot Procedure 的 `tools/statements.py` 保持 byte-identical；本锚点将
  validator 重构为 `validate_financial_brief.py --required
  scope,source_ledger,normalized_statements,metrics,conclusions`。判定：`preserved`。
- 上游语义义务 2：报告必须含 scope、source ledger、normalized statements、metrics 与
  conclusions。上游原文见 Outputs and completion。转换后承载：validator required fields
  与 `research_brief` JSON。判定：`adapted`（字段契约显式化）。
- 上游语义义务 3：脚本不得网络/凭证/安装/仓库访问，覆盖需显式授权。
  上游原文见 Hard constraints。转换后承载：pilot SKILL Hard constraints 未变。判定：`preserved`。
- 判定小结：`preserved`（二 preserved + 一 adapted，无 removed/gap）。

## 流程权威检查

- `grep -R -n -E 'next-node|next-phase|agent-team|proceed to next'`：0 hits。
- 每个 extension SKILL 的 Completion 只说明 submit 后查询 `researchspec status`，不命名 successor。
- 流程权威由六份一节点 graph profile 承接；上游 FinRobot 无 workflow graph，因此无 stage/state-machine
  锚点需要迁移。

## 风险与遗留

- `research_brief` 目前是 package-local minimal JSON contract；后续 plugin schema 正式化时，
  六个 FinRobot package 应迁移到 schema-backed output，而 validator 字段必须保持证据绑定。
- raw vendor-bundle Skills 与 extension packages 同时投影，可能重复；这是既有 pilot 决策，
  本锚点不改变，增量更新时由 catalog diff 显式记录。
- Agent-only packages 没有 script validator，只靠 output-role policy；语义完整性由本审阅与
  `SKILL.md` 闭环保证，后续可在 plugin schema 稳定后增加 schema validator。

## 按需激活复核（2026-09-14）

- 范围：6 个 FinRobot extension。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 结论

### 2026-09-05 维护文件身份复核

共享维护脚本现在直接 hash 原始文件字节，文本解析才使用 UTF-8。对相同 pinned Git 文件
集合重算，145 个普通文件中 7 个文件的文本 hash 与字节 hash 不同，例如
`finrobot_equity/web_app/static/logo.png`。原文本树 hash
`1e26384c7038c93d3e5e5fce71f02519de8fd4966f0ba5673c1e54ee6e7831ff` 可精确复现；
字节树 hash 为 `73f57674dfde778776aa89abda65c5254531a716228fe970bd1bd12f6de84b56`。
这里的普通文件数量不改变 immutable audit 的 146 个 tracked Git entries 范围。

审阅判定：维护身份为 `adapted`，六个能力语义均为 `preserved`。上游、immutable audit/report、
准入 catalog、raw Skills、能力包、profile 和 registry 未变；
`git diff -- skills vendor authoring` 为空。共享流程保留原来的审阅门和 vendor 边界，
既有逐能力判定继续适用。本轮只刷新当前 anchor 的派生记录和 manifest。

`declared-fit-with-notes`：六个 extension capability 一对一保留了上游 reviewed 语义义务与安全边界，
required brief fields 全部绑定；遗留项均为未来 schema 正式化工作，不构成本锚点语义缺口。
