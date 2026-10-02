
# submitGraphNode
<!-- node: function:src/core/runtime/graph-run.ts:submitGraphNode -->

提交节点产出：校验节点可执行、解析输入绑定、消费输入、运行能力校验器，并在同一写入计划内持久化节点实例。
类型：函数  
复杂度：复杂  
入边数：1  
标签：graph-run、mutation、validation、transaction  
所属文件：[src/core/runtime/graph-run.ts](../../../../../files/src/core/runtime/graph-run.ts.md)
源码：[src/core/runtime/graph-run.ts:464](../../../../../../../src/core/runtime/graph-run.ts#L464)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphAdvance](../../../../../files/src/cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts:483–504 | 处理节点提交：要求 actor 名称后调用 submitGraphNode 落盘节点产出。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [runCapabilityValidators](../../../../../files/src/capabilities/validators.ts.md) | src/capabilities/validators.ts:39–57 | 按 manifest 声明顺序分派校验器：policy 走内置策略，schema 直接判为未解析失败，script 交由脚本执行器。 |
