
# parseProjectSpecV2
<!-- node: function:src/core/contracts/graph-workspace.ts:parseProjectSpecV2 -->

切分 project.md 的 YAML frontmatter 与正文并按 schema 2 校验。
类型：函数  
复杂度：简单  
入边数：2  
标签：parsing、contract、frontmatter、stable-specs  
所属文件：[src/core/contracts/graph-workspace.ts](../../../../../files/src/core/contracts/graph-workspace.ts.md)
源码：[src/core/contracts/graph-workspace.ts:84](../../../../../../../src/core/contracts/graph-workspace.ts#L84)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadGraphWorkspaceIndex](../../runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [scanNodes](../../../../../files/src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts:388–423 | 扫描 run 的节点实例文件，检测 run_id 不匹配、同 run 内节点实例重复与冻结图未声明节点。 |

## 调用

该符号没有记录对外调用。
