
# scanRuns
<!-- node: function:src/core/runtime/graph-workspace-index.ts:scanRuns -->

扫描每个 run 目录的 run/graph/handoff 与节点，并交叉校验目录名、冻结图哈希、profile 身份与 entry 声明。
类型：函数  
复杂度：复杂  
入边数：2  
标签：scanner、runs、validation、hashing  
所属文件：[src/core/runtime/graph-workspace-index.ts](../../../../../files/src/core/runtime/graph-workspace-index.ts.md)
源码：[src/core/runtime/graph-workspace-index.ts:277](../../../../../../../src/core/runtime/graph-workspace-index.ts#L277)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadGraphWorkspaceIndex](loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [validateParentBindings](../../../../../files/src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts:360–386 | 校验子 run 的父绑定唯一性、父 run 存在性、subgraph 节点匹配与 profile 声明一致性。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [parseRunHandoff](../../contracts/graph-workspace.ts/parseRunHandoff.md) | src/core/contracts/graph-workspace.ts:298–306 | 解析 handoff.md 的 frontmatter 与正文并按 schema 校验。 |
| [scanNodes](../../../../../files/src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts:388–423 | 扫描 run 的节点实例文件，检测 run_id 不匹配、同 run 内节点实例重复与冻结图未声明节点。 |
