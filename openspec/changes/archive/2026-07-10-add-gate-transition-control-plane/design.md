## Context

Schema 0.2 已提供 subflow/round instances、parallel frontier、receipt-backed Start 和 instance-scoped artifact Submit，但 stage work 完成后只返回布尔 transition boundary。`gate:`/`transition:` selector 仍是保留字，Gate ledger 由 loose legacy records 读取，`decide gate:` 也未绑定可信 verification evidence。

本 change 必须保持 CLI 为状态权威、文件为接口、ARSU/Companion 为语义执行者；不能让 `submit work:`、Start confirmation 或 `--yes` 隐式获得 Gate/Decision 权限。

## Goals / Non-Goals

**Goals:**

- 为每个 subflow instance 计算 Gate、branch Decision 和 transition frontier。
- 原子、幂等地提交人工确认 Gate 和推进唯一授权 transition。
- 让 challenge/reverification 与 failed-Gate override 留下可验证的 append-only evidence。
- 保持 0.1/0.2 workspace 无迁移可读，并为后续完整 ARSU profiles 提供通用声明模型。

**Non-Goals:**

- 完整四类 ARSU workflow graphs、跨 subflow 自动启动或动态 profile expansion。
- 新增 challenge 顶层命令、第二套 ledger、runtime LLM 或 receipt artifact registration。
- 收敛九个 Companion surface 或迁移既有 workspace。

## Decisions

### Schema 0.2 使用 additive strict defaults

`subflow_templates.gates`、`transitions` 与 instance `transition_receipts` 均为 strict typed arrays，解析时默认空数组。缺少这些字段的旧 0.2 workspace 保持原始只读/Start/Submit 行为；只有新 transaction 写入时才序列化新增 state 字段。

### Runtime selectors 显式包含 instance identity

新 frontier 使用 `gate:<instance>/<local-id>` 与 `transition:<instance>/<local-id>`，避免 standalone、pipeline 和 round 重复 logical node 冲突。历史 ledger 的非 scoped `gate:<id>` 仍可 list/show/decide，但不能被推断为新 instance frontier。

### Gate input 只提供语义结果，不覆盖 workflow facts

Workflow 拥有 stage、gate type、validator contract、risk、blocking 和 evidence requirements。Strict payload 只包含 instruction basis、verdict、verification kind、结构化 evidence refs/hashes、findings、challenge/supersession refs；CLI 重新解析并验证所有 authoritative refs。

每个 formal Gate 必须有独立 `confirmed_by`。非交互执行还需 dry-run 返回的 plan SHA 和 `--yes`，但 `--yes` 只授权相同机械 write plan。

### Gate receipt-first，ledger-last

每个 attempt 创建 operational receipt，再 append Gate ledger。Exact receipt/event retry 返回 `already_submitted`；matching orphan receipt 可在 retry 时补 ledger；任何 divergent receipt、event、basis、evidence 或 precondition drift 均冲突。Receipt 不进入 artifact registry。

### Challenge 是 Verify 重验，不是 runtime command

Verify 先展示 proposed verdict。用户质疑后生成 `reverification` payload，绑定 challenged verification basis；若已有 confirmed attempt，则还绑定 `supersedes_event_id`。Override 只接受 latest trusted confirmed failed reverification；reverification pass 走普通 Gate submit。

### Transition authorization 与执行分离

Evaluator 从 trusted latest Gates、accepted overrides 和 workflow-branch Decisions 计算 candidates。没有 candidate 时阻断；唯一无语义 transition 可自动；多个 candidates 必须先 `decide transition:` 接受一个 option。Advance 即使被点名也不能绕过集合级唯一性检查。

### Advance receipt-first，state-last

Advance dry-run 固定 from/to/effect、Gate/Decision basis 和 read preconditions。执行先创建/reuse operational receipt，最后刷新 state 并追加 receipt reference。Effect 首期仅 `activate_stage` 或 `complete_subflow`；run status 从全部实例 lifecycle 派生。

### Converter 和 Companion 只投影协议

Verify/Decide/Next 与 generated ARSU preflight 消费 status/instructions/transaction envelope，不复制 DAG 或手写 ledgers/state。Preflight 升级为 converter-owned v3，并通过强制 regeneration 更新 generated tree。

## Risks / Trade-offs

- **0.2 wire shape 增长** → 所有新增字段都有空默认，旧文件不被主动重写，并用 legacy fixtures 回归。
- **Semantic verdict 不能由脚本判真** → CLI 只验证 validator/evidence contract、hash 和确认链；学术判断仍由 Verify 与人类负责。
- **Append-only attempts 增长** → latest trusted attempt 决定 readiness，历史保留用于审计，不复制进 state。
- **多分支 Decision 扩大 lifecycle scope** → 只新增 `workflow_branch`，不改变 contract change/draft patch 语义。

## Migration Plan

新 `arsu-research-slice` init 输出带 Gate/transition arrays 的 0.2 contracts。旧 0.1/0.2 workspace 继续读取，不自动迁移；没有声明 Gate/transition 的 instance 仍停在 legacy transition boundary。回滚代码时保留 receipts/ledgers/state evidence，不删除或重写用户 runtime files。

## Open Questions

无。完整 profile graph、跨 subflow effects 和 surface consolidation 由后续 umbrella tasks 管理。
