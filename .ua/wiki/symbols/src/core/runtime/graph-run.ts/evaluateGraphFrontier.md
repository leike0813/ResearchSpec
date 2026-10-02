
# evaluateGraphFrontier
<!-- node: function:src/core/runtime/graph-run.ts:evaluateGraphFrontier -->

综合节点实例、Gate/Decision 记录、并行组与子运行投影，得出当前可执行节点、待处理控制项与阻塞原因。
类型：函数  
复杂度：复杂  
入边数：3  
标签：frontier、graph-run、scheduling、diagnostics  
所属文件：[src/core/runtime/graph-run.ts](../../../../../files/src/core/runtime/graph-run.ts.md)
源码：[src/core/runtime/graph-run.ts:319](../../../../../../../src/core/runtime/graph-run.ts#L319)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphInstructions](../../../../../files/src/cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts:143–409 | 生成节点级 instructions：解析选择器、渲染 ARSU 路由与 Procedure 目录、检查项目入口安装与 review-workspace 交接指引。 |
| [handleGraphStatus](../../../../../files/src/cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts:67–141 | 只读输出图谱运行状态：工作区校验、运行索引、插件状态视图与当前 frontier 摘要。 |
| [commitGraphMutation](../../../../../files/src/core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts:1302–1361 | 图谱变更的统一提交点：把所属节点或 handoff 与新满足的运行完成状态合并进同一 write plan，并对受影响运行及其子孙建立读前置条件。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [isGraphNodeEligible](../../../../../files/src/core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts:452–462 | 判定单个节点在指定轮次下是否可提交：前置完成、必填 Gate 通过、必填 Decision 已记录。 |
