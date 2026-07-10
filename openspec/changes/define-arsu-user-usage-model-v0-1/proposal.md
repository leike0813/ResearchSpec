## Why

ResearchSpec 已经形成多组 CLI 与 Companion 能力，但尚未锁定用户如何从一次对话进入 ARSU 工作、如何确认路线、如何跨越 Gate，以及哪些 surface 对用户真正必要。继续按局部 runtime 能力扩展会放大入口重复和职责漂移，因此需要先建立一个可审计的用户使用模型，作为后续控制平面与 surface 收敛的共同约束。

## What Changes

- 定义 Bootstrap 与学术工作启动的边界：`researchspec init` 只准备 workspace 与注入 Skills，工作由用户与 Agent 的对话触发。
- 定义模糊路由、专家直达、路线摘要和确认授权，并以 `researchspec-navigate` 作为模糊目标、恢复、解释和导出的统一入口。
- 定义单 active run、动态 subflow/revision round、并行 work、风险分级 Gate、Decision 和 transition 的用户可见运行模型。
- 锁定目标 surface：4 个 ARSU Skills、4 个 Companion Skills、15 个顶层 CLI 命令，以及 31×8 Skills / 28×8 command wrappers 的交付边界。
- 新增 canonical 用户模型文档，并让现有 PRD、架构、CLI、Schema、Skill/command 与 ARSU workflow 文档显式区分目标、当前实现和待实现技术层。
- 保持本 umbrella change 为 active；后续通过五个独立技术 changes 实现 routing catalog、subflow control plane、Gate/transition、完整 workflow profiles 和 surface 收敛。
- **BREAKING（目标态）**：当前九个 Companion 将在后续 change 中收敛为四个；本 change 本身不删除现有 Companion、不改变 runtime 或生成物。

## Capabilities

### New Capabilities

- `arsu-user-routing`: 基于用户目标的 ARSU 路由、Navigate fallback、专家直达、路线摘要与启动授权。
- `arsu-run-usage`: active run、动态 subflow/round、并行 work、Gate、Decision 与 transition 的用户运行协议。
- `agent-surface-model`: 4 个 ARSU Skills、4 个 Companion Skills、15 个 CLI 命令及 adapter 交付边界。

### Modified Capabilities

无。本 umbrella change 只锁定目标用户模型；对现有技术 capability 的修改由后续独立 changes 承担。

## Impact

- 直接影响 canonical 用户模型、产品、架构、CLI、Schema、Skill/command、ARSU workflow 文档和项目级 Agent 约束。
- 新增三个目标 capability specs 和一组保持未完成的后续技术任务。
- 本 change 不修改 TypeScript 源码、公共 CLI、当前 Companion manifest、ARSU converter 或生成 Skill 树。
- 后续实现将影响 routing catalog、workflow runtime、Gate/transition transaction、profiles 和 agent-tool delivery；这些影响不在本 change 中提前实现。
