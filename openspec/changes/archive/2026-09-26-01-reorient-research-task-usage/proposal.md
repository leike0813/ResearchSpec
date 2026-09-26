# Proposal

## Why

ResearchSpec 的能力、合同和转换器都已就位，但产品默认路径把框架概念摆在研究任务之前：宿主只在相关学术请求中才有可能想到调用 Navigate，恢复普通工作被写成必须进入 graph，探索草稿与已确认承诺的边界也缺少明确表述。结果是一次次改动之后，真实使用仍然像一个散沙：能力存在，但进入、连续和退出都要靠用户提醒和旧会话记忆。

本次 change 只做一件事：把研究任务重新放回主线，并把"普通工作不需要 graph、恢复普通工作也不需要 graph"写成规格，让后续入口、连续性、协作和验收 change 有稳定依据。

## What Changes

- 新增产品级能力规格 `research-task-usage`：自然研究任务优先于框架术语，单 Navigate 入口按任务触发；持续工作用 `work/researchspec-notes/<task-id>.md` 普通笔记作为非正式状态，由 Navigate 主 Agent 维护；恢复普通工作本身不要求 graph；stable specs 只承载已确认承诺，探索草稿在 `researchspec/` 外自由迭代，提升或改变承诺走既有 project change 流程。
- **BREAKING**（规格语义）：修正"persistence / resume 需要 graph"的矛盾表述。持久化和恢复不再单独构成 graph 理由；formal Gates/Decisions、parallel/join、重复轮次、审计状态仍是 graph 的唯一理由。持久化本身改由普通笔记与已确认承诺承载。
- 明确非目标：单 Navigate 入口、十六个顶层命令、schema `"2"`、现有 graph/CLI 引擎、stable spec 文件集合、project change 生命周期全部保持不变，本 change 只改规格与产品文档表述，不改源码；宿主常驻入口的实际交付与验证属于 02，能力协作与表达属于 04，真实验收属于 05。

## Capabilities

### New Capabilities
- `research-task-usage`: 产品级默认研究使用模型：任务优先的入口判定与不触发边界、普通任务笔记的非正式状态契约、恢复判定（普通工作 vs 正式 run）、承诺边界（stable specs 只承载已确认承诺，探索草稿在受管目录外自由迭代，提升或改变承诺走既有 project change），以及以研究者可见产出衡量成功。

### Modified Capabilities
- `arsu-user-routing`: 路由按生命周期保证选择 standalone / graph；持久化与恢复不再单独要求 graph；普通任务笔记不作为 graph 状态。
- `procedure-routing`: standalone 不持久作为工作流状态的约束保持，同时允许普通任务笔记；Graph Activation 的触发理由收窄为 Gate/Decision、parallel/join、动态轮次、审计状态。
- `companion-skills`: Navigate 增加普通任务笔记职责，并区分"继续普通工作"与"恢复正式 run"。
- `arsu-run-usage`: 明确 graph 运行时协议只覆盖已确认 run 的状态恢复，普通任务笔记不在运行时协议之内。

## Impact

- 受影响文档：`docs/user/usage-model.md`、`docs/user/README.md`、`docs/developer/architecture.md`、`docs/developer/runtime/README.md`、`docs/developer/runtime/core_runtime_model.md`、`docs/developer/runtime/runtime_protocols.md`、`README.md`、仓库根 `AGENTS.md`、`CHANGELOG.md`。
- 不受影响：`src/**`、`scripts/**`、`tests/**`、`openspec/specs/**`（本 change 不 sync 主 spec）、`playbooks/**`、生成的 `docs/user/cli-handbook.md`。
- 依赖：无前置 change。后续 `02-deliver-proactive-research-entry`、`03-support-research-task-continuity`、`04-align-research-capability-collaboration`、`05-verify-natural-research-journeys` 依赖本 change 先确认的产品模型。
