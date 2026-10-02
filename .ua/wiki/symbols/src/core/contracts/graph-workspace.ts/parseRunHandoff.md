
# parseRunHandoff
<!-- node: function:src/core/contracts/graph-workspace.ts:parseRunHandoff -->

解析 handoff.md 的 frontmatter 与正文并按 schema 校验。
类型：函数  
复杂度：简单  
入边数：2  
标签：parsing、handoff、frontmatter、contract  
所属文件：[src/core/contracts/graph-workspace.ts](../../../../../files/src/core/contracts/graph-workspace.ts.md)
源码：[src/core/contracts/graph-workspace.ts:298](../../../../../../../src/core/contracts/graph-workspace.ts#L298)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadGraphWorkspaceIndex](../../runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [scanRuns](../../runtime/graph-workspace-index.ts/scanRuns.md) | src/core/runtime/graph-workspace-index.ts:277–358 | 扫描每个 run 目录的 run/graph/handoff 与节点，并交叉校验目录名、冻结图哈希、profile 身份与 entry 声明。 |

## 调用

该符号没有记录对外调用。
