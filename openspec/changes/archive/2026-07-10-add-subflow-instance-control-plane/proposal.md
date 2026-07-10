## Why

ResearchSpec 当前只能对静态、全局唯一的 work item 计算 frontier，无法表达同一 active run 下可恢复的 standalone/pipeline subflow、重复 revision round 或受 profile 约束的并行工作。继续让 Agent 从静态 stage 和文件名推断运行位置，会重新制造第二套状态机，也无法把一次路线确认安全地传递给后续自动 candidate 登记。

## What Changes

- 在 `specs/workflow.yaml` 中增加严格的 subflow template、round、parallel group、instance-scoped output 与 automatic/manual submission policy。
- 将 `runs/current/state.yaml` 升级为单 active run 下的 subflow instance SSOT，并用 start receipt 记录 route、parent、round、actor、confirmation 和 basis。
- 将运行协议扩展为 `subflow:` 与 instance-scoped `work:` selector，新增只读 subflow instructions 和原子 `start` 命令。
- 让 workflow evaluator 计算 template availability、active instances、parallel all/quorum join、dispatchable frontier 和 scoped work completion。
- 让已确认 subflow 中声明为 automatic 的 work 复用现有 hash-bound Submit，无需逐 artifact 再次确认，同时继续隔离 Gate、Decision 与 transition 权限。
- 将 `arsu-research-slice` 改为必须显式 start 的动态纵向 Slice，并保留旧静态 work-item workspace 的兼容读取。
- 更新 converter-owned ARSU preflight、当前 Next/Submit Companion 过渡行为和 canonical 设计文档；不实现 Gate submit、transition advance、Navigate 或完整 ARSU profiles。

## Capabilities

### New Capabilities

- `subflow-instance-control-plane`: typed subflow/round instances、route-bound start、parallel frontier、generalized selectors 和 start-authorized automatic work submit。

### Modified Capabilities

- `framework-core`: workflow 与 run-state contract 从静态 work graph 扩展到兼容的 instance runtime，并由同一 evaluator 复算 frontier。
- `cli-interface`: `instructions` 支持 subflow/scoped work selector，并新增 versioned `start` transaction。
- `artifact-submit`: artifact/receipt provenance 增加 subflow instance scope 和可信 start authorization。
- `arsu-converter`: generated preflight 直接执行 automatic work submit，并保留 manual/legacy handoff。
- `companion-skills`: Next 理解 startable subflow 与 scoped work，Submit 退回 manual/legacy 边界。

## Impact

- 影响 core workflow/run-state contracts、snapshot、evaluator、artifact submit、write-plan transactions 和 checks。
- 公共 CLI 新增 `start`，`instructions`/`status`/`submit` JSON data 增加 additive instance fields；envelope Schema 仍为 `1`。
- Converter version 升至 `0.6.0`，四个 ARSU root Skills、conversion manifest/report 与 compatibility manifest 由 converter 再生成。
- `arsu-paper` 默认 profile、旧 `0.1` workspace、九个当前 Companion 和 agent-tool delivery 数量保持兼容。
