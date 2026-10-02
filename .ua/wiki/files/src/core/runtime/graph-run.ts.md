
# src/core/runtime/graph-run.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/runtime](../../../../modules/src/core/runtime.md)
<!-- node: file:src/core/runtime/graph-run.ts -->

图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。
源码：[src/core/runtime/graph-run.ts](../../../../../../src/core/runtime/graph-run.ts)

## 符号（23）
<!-- node: function:src/core/runtime/graph-run.ts:branchUnlocksForRound -->
<!-- node: function:src/core/runtime/graph-run.ts:candidateRounds -->
<!-- node: function:src/core/runtime/graph-run.ts:commitGraphMutation -->
<!-- node: function:src/core/runtime/graph-run.ts:consumeGraphNodeInputs -->
<!-- node: function:src/core/runtime/graph-run.ts:evaluateGraphFrontier -->
<!-- node: function:src/core/runtime/graph-run.ts:graphChildRunSnapshots -->
<!-- node: function:src/core/runtime/graph-run.ts:graphRunCompletionReady -->
<!-- node: class:src/core/runtime/graph-run.ts:GraphRunError -->
<!-- node: function:src/core/runtime/graph-run.ts:isGraphNodeEligible -->
<!-- node: function:src/core/runtime/graph-run.ts:overrideGraphGate -->
<!-- node: function:src/core/runtime/graph-run.ts:prerequisiteComplete -->
<!-- node: function:src/core/runtime/graph-run.ts:projectCompletedSubgraphs -->
<!-- node: function:src/core/runtime/graph-run.ts:recordGraphDecision -->
<!-- node: function:src/core/runtime/graph-run.ts:recordGraphGate -->
<!-- node: function:src/core/runtime/graph-run.ts:resolveChildHandoffInputs -->
<!-- node: function:src/core/runtime/graph-run.ts:resolveGraphNodeInputs -->
<!-- node: function:src/core/runtime/graph-run.ts:startGraphChildRun -->
<!-- node: function:src/core/runtime/graph-run.ts:startGraphRun -->
<!-- node: function:src/core/runtime/graph-run.ts:submitGraphNode -->
<!-- node: function:src/core/runtime/graph-run.ts:validateSubgraphNodeBindings -->
<!-- node: function:src/core/runtime/graph-run.ts:writeGraphHandoff -->
<!-- node: function:src/core/runtime/graph-run.ts:writeNodeFile -->
<!-- node: function:src/core/runtime/graph-run.ts:writeRunDirectory -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| branchUnlocksForRound | 函数 | 1141–1162 | 中等 | decision、graph-run、scheduling | 0 | 汇总某轮次下已解锁的分支节点集合。 |
| candidateRounds | 函数 | 1027–1053 | 中等 | revision-round、graph-run、scheduling | 0 | 按可重复节点与修订轮模板推导某节点当前可能的轮次，区分首次入口轮与后续轮。 |
| commitGraphMutation | 函数 | 1302–1361 | 中等 | transaction、graph-run、single-writer、completion | 0 | 图谱变更的统一提交点：把所属节点或 handoff 与新满足的运行完成状态合并进同一 write plan，并对受影响运行及其子孙建立读前置条件。 |
| consumeGraphNodeInputs | 函数 | 899–927 | 中等 | input-binding、handoff、graph-run | 0 | 消费已解析的节点输入，记录到 handoff 输入并推进物化交接清单。 |
| [evaluateGraphFrontier](../../../../symbols/src/core/runtime/graph-run.ts/evaluateGraphFrontier.md) | 函数 | 319–450 | 复杂 | frontier、graph-run、scheduling、diagnostics | 3 | 综合节点实例、Gate/Decision 记录、并行组与子运行投影，得出当前可执行节点、待处理控制项与阻塞原因。 |
| graphChildRunSnapshots | 函数 | 836–845 | 中等 | graph-run、index、snapshot | 0 | 从工作区索引装配全部运行的内存快照（run、图谱、节点实例、handoff），供 frontier 与提交逻辑使用。 |
| graphRunCompletionReady | 函数 | 774–818 | 中等 | completion、graph-run、revision-round、validation | 0 | 判定运行是否可标记完成：所有一次性节点完成、Gate/Decision 已闭合且修订轮模板不再开放新一轮。 |
| GraphRunError | 类 | 26–31 | 中等 | error-type、graph-run、runtime | 0 | 带 code、kind（usage/domain/conflict）与 details 的图谱运行时错误类型。 |
| isGraphNodeEligible | 函数 | 452–462 | 中等 | frontier、graph-run、eligibility | 1 | 判定单个节点在指定轮次下是否可提交：前置完成、必填 Gate 通过、必填 Decision 已记录。 |
| overrideGraphGate | 函数 | 624–669 | 中等 | gate、override、graph-run、audit-trail | 1 | 记录失败 Gate 的人工 override，附审批人、审批时间与理由，仅写入所属节点实例。 |
| prerequisiteComplete | 函数 | 1107–1139 | 中等 | prerequisites、graph-run、scheduling | 0 | 在指定消费轮次下判断前置节点是否已完成，包含 repeatable 节点的轮次匹配逻辑。 |
| projectCompletedSubgraphs | 函数 | 732–772 | 中等 | subgraph、completion、graph-run、projection | 0 | 把已完成的子运行结果投影为父图谱中的已完成 subgraph 节点状态。 |
| recordGraphDecision | 函数 | 584–622 | 中等 | decision、graph-run、mutation、human-confirmation | 1 | 记录一次 Decision 选项选择到所属节点实例，并按选项解锁下游节点。 |
| recordGraphGate | 函数 | 544–582 | 中等 | gate、graph-run、human-confirmation、mutation | 1 | 记录一次正式 Gate 判定（pass/pass_with_conditions/fail）到所属节点实例。 |
| resolveChildHandoffInputs | 函数 | 929–955 | 中等 | subgraph、handoff、input-binding | 0 | 把父运行的 handoff 输出解析为子运行可消费的输入角色。 |
| resolveGraphNodeInputs | 函数 | 847–891 | 中等 | input-binding、graph-run、resolution、roles | 0 | 按节点 input_bindings 解析实际输入：stable_spec 走稳定 spec 路径、handoff 走父交接、node_output 走指定轮次的生产节点输出、parameter 取内联值。 |
| startGraphChildRun | 函数 | 234–317 | 复杂 | graph-run、subgraph、runtime、workflow-state | 0 | 为 subgraph 节点创建父绑定子运行，校验子图入口与角色绑定后派生子运行记录。 |
| [startGraphRun](../../../../symbols/src/core/runtime/graph-run.ts/startGraphRun.md) | 函数 | 153–232 | 复杂 | graph-run、runtime、workflow-state、transaction | 1 | 启动顶层图谱运行：校验启动命令与确认人，按入口选择节点，写入 run.yaml、冻结 graph.yaml、handoff.md 与 run 目录。 |
| [submitGraphNode](../../../../symbols/src/core/runtime/graph-run.ts/submitGraphNode.md) | 函数 | 464–542 | 复杂 | graph-run、mutation、validation、transaction | 1 | 提交节点产出：校验节点可执行、解析输入绑定、消费输入、运行能力校验器，并在同一写入计划内持久化节点实例。 |
| validateSubgraphNodeBindings | 函数 | 671–705 | 中等 | subgraph、validation、graph-run、contracts | 1 | 校验父节点期望输出角色与子图入口能力声明的角色是否一致，阻止子图绑定在运行期失败。 |
| writeGraphHandoff | 函数 | 1289–1300 | 中等 | handoff、transaction、optimistic-concurrency | 1 | 写入运行 handoff 正文，扫描后内容变化时判定为写冲突。 |
| writeNodeFile | 函数 | 1262–1287 | 中等 | transaction、graph-run、optimistic-concurrency、filesystem | 1 | 写入节点实例文件：以扫描期文本为前置条件检测扫描后新增、消失或被改动的冲突。 |
| writeRunDirectory | 函数 | 968–990 | 中等 | filesystem、graph-run、transaction | 0 | 创建运行目录并写入 run.yaml、冻结 graph.yaml 与 handoff.md，是启动路径的落盘收口。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [boundary-path.ts](boundary-path.ts.md) | src/core/runtime/boundary-path.ts | 边界交付物路径解析：拒绝绝对路径、越界、符号链接分量与 researchspec/ 内部路径，并在消费输入时校验存在性与可读性。 |
| [capability-graph.ts](../contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [capability-manifest.ts](../contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [graph-workspace-index.ts](graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](../contracts/graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [registry.ts](../../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [validators.ts](../../capabilities/validators.ts.md) | src/capabilities/validators.ts | 能力校验器执行层：按 manifest 声明依次运行 policy 与 script 校验器；script 校验器在临时目录写入 submission.json 后按 argv 模板执行，网络型校验器失败降级为 degraded 而非 pass。 |
| [write-plan.ts](../workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-validators.test.ts](../../../tests/capability-validators.test.ts.md) | tests/capability-validators.test.ts | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [graph-context.ts](../../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-run-advanced.test.ts](../../../tests/graph-run-advanced.test.ts.md) | tests/graph-run-advanced.test.ts | 图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。 |
| [graph-run-conflict.test.ts](../../../tests/graph-run-conflict.test.ts.md) | tests/graph-run-conflict.test.ts | 图谱运行冲突测试：验证扫描后出现的节点文件、扫描后被改动的节点文件、歧义重复节点实例均被拒绝，以及失败 Gate 的 override 记录在所属 Gate 内并解锁下游。 |
| [graph-run.test.ts](../../../tests/graph-run.test.ts.md) | tests/graph-run.test.ts | 图谱运行主路径测试：验证运行创建的确定性与冻结图谱、dry-run 不落盘、frontier 随提交推进、乱序提交被拒、Gate/Decision 阻塞下游、图谱文本漂移后哈希稳定与缺失绑定输入的 fail-closed。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [review-response.test.ts](../../../tests/review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| branchUnlocksForRound | 函数 | 1141–1162 | 汇总某轮次下已解锁的分支节点集合。 |
| candidateRounds | 函数 | 1027–1053 | 按可重复节点与修订轮模板推导某节点当前可能的轮次，区分首次入口轮与后续轮。 |
| commitGraphMutation | 函数 | 1302–1361 | 图谱变更的统一提交点：把所属节点或 handoff 与新满足的运行完成状态合并进同一 write plan，并对受影响运行及其子孙建立读前置条件。 |
| consumeGraphNodeInputs | 函数 | 899–927 | 消费已解析的节点输入，记录到 handoff 输入并推进物化交接清单。 |
| [evaluateGraphFrontier](../../../../symbols/src/core/runtime/graph-run.ts/evaluateGraphFrontier.md) | 函数 | 319–450 | 综合节点实例、Gate/Decision 记录、并行组与子运行投影，得出当前可执行节点、待处理控制项与阻塞原因。 |
| graphChildRunSnapshots | 函数 | 836–845 | 从工作区索引装配全部运行的内存快照（run、图谱、节点实例、handoff），供 frontier 与提交逻辑使用。 |
| graphRunCompletionReady | 函数 | 774–818 | 判定运行是否可标记完成：所有一次性节点完成、Gate/Decision 已闭合且修订轮模板不再开放新一轮。 |
| GraphRunError | 类 | 26–31 | 带 code、kind（usage/domain/conflict）与 details 的图谱运行时错误类型。 |
| isGraphNodeEligible | 函数 | 452–462 | 判定单个节点在指定轮次下是否可提交：前置完成、必填 Gate 通过、必填 Decision 已记录。 |
| overrideGraphGate | 函数 | 624–669 | 记录失败 Gate 的人工 override，附审批人、审批时间与理由，仅写入所属节点实例。 |
| prerequisiteComplete | 函数 | 1107–1139 | 在指定消费轮次下判断前置节点是否已完成，包含 repeatable 节点的轮次匹配逻辑。 |
| projectCompletedSubgraphs | 函数 | 732–772 | 把已完成的子运行结果投影为父图谱中的已完成 subgraph 节点状态。 |
| recordGraphDecision | 函数 | 584–622 | 记录一次 Decision 选项选择到所属节点实例，并按选项解锁下游节点。 |
| recordGraphGate | 函数 | 544–582 | 记录一次正式 Gate 判定（pass/pass_with_conditions/fail）到所属节点实例。 |
| resolveChildHandoffInputs | 函数 | 929–955 | 把父运行的 handoff 输出解析为子运行可消费的输入角色。 |
| resolveGraphNodeInputs | 函数 | 847–891 | 按节点 input_bindings 解析实际输入：stable_spec 走稳定 spec 路径、handoff 走父交接、node_output 走指定轮次的生产节点输出、parameter 取内联值。 |
| startGraphChildRun | 函数 | 234–317 | 为 subgraph 节点创建父绑定子运行，校验子图入口与角色绑定后派生子运行记录。 |
| [startGraphRun](../../../../symbols/src/core/runtime/graph-run.ts/startGraphRun.md) | 函数 | 153–232 | 启动顶层图谱运行：校验启动命令与确认人，按入口选择节点，写入 run.yaml、冻结 graph.yaml、handoff.md 与 run 目录。 |
| [submitGraphNode](../../../../symbols/src/core/runtime/graph-run.ts/submitGraphNode.md) | 函数 | 464–542 | 提交节点产出：校验节点可执行、解析输入绑定、消费输入、运行能力校验器，并在同一写入计划内持久化节点实例。 |
| validateSubgraphNodeBindings | 函数 | 671–705 | 校验父节点期望输出角色与子图入口能力声明的角色是否一致，阻止子图绑定在运行期失败。 |
| writeGraphHandoff | 函数 | 1289–1300 | 写入运行 handoff 正文，扫描后内容变化时判定为写冲突。 |
| writeNodeFile | 函数 | 1262–1287 | 写入节点实例文件：以扫描期文本为前置条件检测扫描后新增、消失或被改动的冲突。 |
| writeRunDirectory | 函数 | 968–990 | 创建运行目录并写入 run.yaml、冻结 graph.yaml 与 handoff.md，是启动路径的落盘收口。 |
