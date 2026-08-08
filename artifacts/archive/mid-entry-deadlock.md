# Bug 报告：mid-entry 父实例在 checkpoint `entry` 永久卡死

- 日期：2026-08-09
- 环境：researchspec CLI 0.1.0；测试工作区 `~/Workspace/Paper/ShiRuiXue/JiaoYu-AI/researchspec`(profile academic-pipeline v1)
- 严重度：高——mid-entry 入口完全不可用
- 状态：已复现，根因已定位，未修

## 摘要

通过 `academic-pipeline:mid-entry` 路由启动的 pipeline 父实例落在 checkpoint `"entry"` 上。该检查点没有任何可启动的子节点，也没有任何离开它的 profile transition，导致实例无法推进——第一个 child 永远无法启动。`researchspec check` 对此全绿，因为校验器对 `"entry"` 检查点有显式豁免。

## 复现步骤

1. 满足 mid-entry 前置(`specs/project.md` 存在;`research_materials` 以 handoff input 提供，指向一个常规可读文件——目录会被 `boundary_input_unreadable` 拒绝)。
2. 构造 start 输入： `profile_entry: mid-entry`、`formal_gates: []`(pipeline 父确认不得声明子 Gate)、`manuscript_delivery` 与 `specs/manuscript.yaml` 的 `delivery` 逐字节一致(含 `final_output_format: null` 且键序相同，否则 `manuscript_delivery_snapshot_stale`)。
3. `researchspec start academic-pipeline:mid-entry --input start.yaml --confirmed-by <name>` → 成功，实例 control `checkpoint: "entry"`,`status: active`。
4. `researchspec instructions subflow:<instance> --json` → `frontier: []`。
5. 尝试启动第一个 child(`parent.node_id: write`,route `academic-paper:full`)→ `child_start_blocked: The selected child is not in the current profile frontier.`
6. 尝试 `advance` → 无任何可用 profile transition(仅剩生命周期 transition)。

## 根因链

1. **Profile 定义**:mid-entry 入口 checkpoint 为 `"entry"`
   - `src/arsu-converter/workflow/academic-pipeline.ts:11`
   - 工作区投影 `researchspec/profiles/academic-pipeline.yaml`(entries 段)
2. **运行时子节点发现**:`nodesAtCheckpoint` 只匹配 `node_id === checkpoint` 的子节点(`src/core/runtime/workflow-control.ts:204-210`)。profile 中不存在 `node_id: entry` 的 child，因此 `childStartCandidates`(`workflow-control.ts:133-150`)在 `"entry"` 检查点恒为空集。
3. **运行时推进**:`eligibleProfileTransitions`(`workflow-control.ts:152-170`)要求 `transition.from === checkpoint`;profile `transitions` 段没有任何 `from: entry` 的条目(0 条)。父实例无法离开 `"entry"`。
4. **校验器豁免掩盖问题**:`src/arsu-converter/workflow/academic-pipeline.ts:73-74` 对 `entry.checkpoint === "entry"` 跳过子节点存在性检查，使该死锁通过全部静态检查，只有真实启动 mid-entry 才暴露。
5. **文档语义无实现载体**:`docs/researchspec_user_usage_rehearsal/academic_pipeline_journeys.md` §2.3 描述 mid-entry 启动后"先确认 writing child"等按入口点启动第一个 child 的行为，但:
   - `SubflowStartCommandSchema` 没有 "chosen entry point" 字段;
   - 运行时没有从 `"entry"` 到任何节点检查点的迁移;
   - 即使把入口 checkpoint 直接改成目标节点(如 `write`),`dependenciesSatisfied`(`workflow-control.ts:212-223`)仍要求 `write.prerequisites` 中的 `research` 存在 completed 子实例——`multiplicity: optional` 在依赖检查中没有"跳过"语义,mid-entry 依然无法启动 write。

## 影响面

- `academic-pipeline:mid-entry` 入口完全不可用;`end-to-end` 不受影响(入口 checkpoint `research` 对应真实 child 节点)。
- 已启动的 mid-entry 实例(如本次测试的 `sf-2265a35c0a6fa8e23737ebd9`)成为无法推进也无法按正常路径完成的孤儿实例，只能走生命周期 transition 收场。
- 所有以 optional 前置节点为入口下游的 profile 都可能踩到第 5 条(optional 依赖无跳过语义),不止 academic-pipeline。

## 修复方向(供决策，未实施)

1. 为 mid-entry 引入"入口点选择"语义:start 输入增加 chosen entry node(或 parent 级 Decision)，运行时将其映射到对应 child 检查点，并让 `dependenciesSatisfied` 对 `multiplicity: optional` 的前置节点在未选择时视为满足。
2. 或在 profile 层为 `entry` 检查点补 transitions(如 `entry-to-write`、`entry-to-revision` 等),并为 optional 前置补跳过语义;同时把入口 checkpoint 的合法性检查从豁免改为正向校验(transitions 或 child 必须可达)。
3. 无论哪条路径，建议加回归测试:mid-entry 启动后第一个 child 可 start;`check` 能静态发现不可达的入口 checkpoint。

## 附:复现用的 start 输入要点

- 路由 `academic-pipeline:mid-entry`,`profile_entry: mid-entry`
- `handoff_inputs[0]`: role `research_materials`,path `fieldwork/index.md`
- `planned_outputs`: `submission_package`(`paper/submission-package.docx`)、`process_summary`(`paper/process-summary.md`)
- `manuscript_delivery`: `{working_format: "markdown", final_output_format: null}`
- 第一次 child 尝试: route `academic-paper:full`,`parent: {instance_id: sf-2265a35c0a6fa8e23737ebd9, node_id: write}`,`formal_gates: ["manuscript-integrity"]` → `child_start_blocked`
