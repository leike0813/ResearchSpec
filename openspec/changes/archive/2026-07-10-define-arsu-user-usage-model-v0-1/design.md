## Context

ResearchSpec 当前拥有 workspace 初始化、状态查询、动态 work instructions、receipt-backed artifact submit、contract change、Decision、检查与归档能力，也投影了九个 Companion Skills。它能够闭合实验性 `RQ Brief → Bibliography → Synthesis` Slice 的一部分，但用户仍需理解多个彼此重叠的入口，ARSU Skill、Companion 和 CLI 之间缺少统一的使用顺序。

本设计先锁定目标用户模型，再分层实现。canonical 描述位于 `docs/arsu_user_usage_model.md`；本 change 只建立目标能力约束和文档一致性，不把尚未实现的 routing、subflow、Gate 或 transition 写成当前能力。

## Goals / Non-Goals

**Goals:**

- 让用户从目标而非内部命令分类出发，形成一条可理解、可恢复、可审计的 ARSU 使用路径。
- 固定 CLI、ARSU Skill、Companion 和 workflow profile 的权威边界。
- 定义 standalone、pipeline、并行工作、Gate、Decision、transition 和动态 revision round 的统一运行模型。
- 给出最小 surface 及其逐层落地顺序，防止继续增加临时入口。
- 让目标设计、当前实现和待实现技术层在全部相关文档中可辨认。

**Non-Goals:**

- 在本 change 中实现 routing catalog、`start`、`submit gate:`、`advance`、动态 subflow 或完整 ARSU profiles。
- 删除当前九个 Companion 或修改 31 个工具目录中的生成物。
- 改变现有 `submit work:`、contract-change、Decision 或 archive 的 runtime 语义。
- 把 ARSU 的语义生产逻辑移入 ResearchSpec CLI。

## Decisions

### Bootstrap 与工作启动分离

`researchspec init` 只创建 workspace 并注入可用 Skills，不创建 active run，也不选择学术路线。用户通过对话表达工作目标；Agent 在路线确认后调用 `start subflow:<id>`。这避免初始化参数同时承担项目模板和具体研究任务两类职责。

备选方案是由 `init --profile` 直接启动工作，但它会把一次性环境准备与可重复 subflow 生命周期绑定，因此拒绝。

### 目标优先路由与专家直达共用一次确认

模糊、跨 Skill、继续、解释或导出请求进入 `researchspec-navigate`；明确目标或显式 Skill/mode 可以直达对应 ARSU Skill。两条路径最终都必须展示 Skill、mode、依赖扩展、主要产物、Gate 与成本摘要，并由用户确认启动。

路由数据由 converter-owned typed catalog 统一提供，Navigate 与 Skill descriptions 只做投影，避免多个自然语言入口各自维护映射。

### CLI 是状态权威，ARSU Skills 是语义执行者

ARSU profile 声明 work、parallel group、join、Gate、transition 和 round template。ResearchSpec CLI 计算 frontier、返回 instructions 并执行确定性 transaction；`academic-pipeline` 只能消费 CLI frontier，不维护第二套阶段状态。ARSU Skills 阅读 packet、完成研究判断和产生候选 artifact，但不得手写 registry、ledger 或 state。

### 单 active run 与动态 subflow 实例

每个 workspace 同时只有一个 active run。standalone 工作是 run 下的 subflow；pipeline stage 也实例化为 subflow；revision round 通过带 parent/round identity 的模板动态生成。这样 standalone 与 pipeline 复用同一状态模型，也不会把无限 revision round 硬编码成静态 DAG。

### Work 自动提交，Gate 逐次确认

候选 artifact 产生后，Agent 可以按 instructions 自动执行 hash-bound `submit work:<id>`，不要求用户逐文件确认。正式 Gate 按 profile 风险策略出现，但每个实际 Gate verdict 必须展示 validator/evidence 并获得用户确认后才能 `submit gate:<id>`。

用户质疑 Gate 时先 re-verify；若仍要越过失败 verdict，必须由 `researchspec-decide` 记录 override。普通 artifact submit 的授权不具有学术认可含义。

### 唯一 transition 自动执行，语义分支进入 Decision

Gate pass 或 accepted branch decision 后，如果只有一个满足条件的 transition，Agent 可以自动执行 `advance transition:<id>`。多个可行分支或任何新的 scope/claim/structure 选择必须先进入 Decision。并行组和 join 条件完全由 profile 声明，Agent 不猜测调度策略。

### 四加四 Skill 与十五个 CLI 命令是目标最小面

用户可见 Skills 固定为四个 ARSU Skills 和四个 Companion Skills。Companion 只保留 Navigate、Propose、Decide、Verify；当前 Explore/Next/Context 合入 Navigate，Check/Submit/Archive 回归 CLI 原语或 Agent 通用调用。

CLI 保留十五个稳定顶层命令：`init`、`update`、`status`、`instructions`、`start`、`submit`、`advance`、`check`、`list`、`show`、`handoff`、`pack`、`propose`、`decide`、`archive`。选择短的顶层生命周期动词，是为了让通用 selector 协议保持显式；不引入含义模糊的 `execute` 或多层 `run` 命令树。

### Umbrella change 保持 active

本 change 的设计与 specs 可先完成，但 tasks 中的五个技术层 changes 在端到端验证前保持未完成。只有 routing、subflow、Gate/transition、profiles 和 surface consolidation 全部完成，才归档 umbrella change。这允许用户模型作为跨 change 的验收基线，而不是提前并入主 specs 后失去整体进度视图。

## Risks / Trade-offs

- **目标文档可能领先实现并被误读** → 每份相关文档显式标记 Target v0.1、Current implementation 和未实现技术层；canonical 文档维护差距表。
- **四个 Companion 可能过薄或过厚** → 以用户意图而非底层 transaction 划分；路由/恢复集中 Navigate，高影响语义分别进入 Propose、Decide、Verify。
- **自动 work submit 可能被误认成学术通过** → 将机械登记与 Gate confirmation 分开，receipt 和 UI 明示非语义认可。
- **单 active run 限制并行项目** → workspace 作为隔离边界；run 内通过 subflow 与 parallel group 提供受控并行。
- **Umbrella 长期 active 可能积累漂移** → 每个后续 change 必须引用本模型，并在 tasks 中更新完成状态；最终以端到端旅程而非文件存在作为归档条件。
- **文档立即收敛而 runtime 尚未收敛** → 当前命令/Companion 清单保留在 Current implementation 段落，不删除兼容说明所需的事实。

## Migration Plan

1. 完成 canonical 用户模型、关联设计文档和本 umbrella capability specs。
2. 通过 `add-arsu-routing-catalog` 建立 typed routing SSOT 与描述投影。
3. 通过 `add-subflow-instance-control-plane` 建立 subflow/round、通用 selector、`start` 与自动 work submit policy。
4. 通过 `add-gate-transition-control-plane` 建立 Gate confirmation、challenge/override、transition receipt 与 `advance`。
5. 通过 `add-arsu-workflow-profiles` 提供完整四类 ARSU mode/profile graphs。
6. 通过 `consolidate-researchspec-agent-surface` 新增 Navigate，移除六个旧 Companion 投影并收敛交付数量。
7. 验证 bootstrap、standalone、pipeline、revision、resume 和 Gate challenge 旅程后，完成并归档 umbrella change。

回滚任一技术 change 时保留本用户模型作为目标约束，并把对应 umbrella task 恢复为未完成；不得通过恢复重复 surface 来掩盖缺失能力。

## Open Questions

无。本 change 锁定 v0.1 用户模型；具体 DTO、持久化格式和兼容迁移由对应技术 change 在不违反这些 requirements 的前提下决定。
