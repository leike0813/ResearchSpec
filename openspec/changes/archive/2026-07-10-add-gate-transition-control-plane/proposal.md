## Why

ResearchSpec 的 instance control plane 目前只能把 work 推进到只读 transition boundary；正式 Gate 仍无可执行 instructions/submit 协议，stage 也不能通过 receipt-backed transaction 推进。现在需要补齐这层，才能让 canonical ARSU 用户模型中的逐次 Gate 确认、异议重验、override 和唯一 transition 自动推进成为 CLI 权威行为。

## What Changes

- 在 Schema 0.2 subflow templates 中增量定义 instance-scoped Gates、transitions 和 branch Decision 条件，同时保持既有 0.1/0.2 workspace 可读。
- 让 status/instructions 暴露 `gate:<instance>/<node>` 与 `transition:<instance>/<node>` frontier。
- 扩展 `submit` 以持久化 hash/basis-bound Gate verdict、evidence、人工确认和 operational receipt。
- 新增 `advance transition:`，以 receipt-first/state-last transaction 执行唯一授权的 stage 或 terminal effect。
- 收紧 failed-Gate override，并为多分支 transition 增加最小 `workflow_branch` Decision 闭环。
- 用 opt-in research Slice、Companion guidance 和 converter-owned ARSU preflight 演示并投影统一运行协议。

## Capabilities

### New Capabilities

- `gate-transition-control-plane`: instance-scoped Gate/transition contracts、instructions、confirmation/reverification、receipts、branch authorization 和原子推进。

### Modified Capabilities

- `framework-core`: Schema 0.2 与逐 instance evaluator 增加 Gate/transition frontier 和状态效果。
- `cli-interface`: `submit gate:`、`advance transition:`、scoped instructions 与稳定 transaction 结果成为公共 CLI。
- `companion-skills`: Verify、Decide、Next 遵循 challenge/reverify、override、branch choice 与 unique-transition discipline。
- `arsu-converter`: generated contract preflight 消费完整 subflow/work/gate/transition protocol。

## Impact

- 影响 workflow/run-state/runtime-selector DTO、snapshot/check、workflow evaluator、Decision lifecycle、CLI handlers 和 research Slice fixture。
- 新增 Gate-submit 与 transition-advance operational receipts；不新增依赖，不登记 receipt 为 academic artifact，也不引入 LLM runtime。
- 更新 converter-owned generated ARSU tree、相关设计文档和 umbrella task 4.1；本 change 完成后保持 active，不自动归档。
