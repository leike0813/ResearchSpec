
# scanGraphProfiles
<!-- node: function:src/core/runtime/graph-workspace-index.ts:scanGraphProfiles -->

扫描 profiles 目录中的 YAML profile，检测重复 profile_id 并在无有效 profile 时报错。
类型：函数  
复杂度：中等  
入边数：2  
标签：scanner、profiles、validation、workspace  
所属文件：[src/core/runtime/graph-workspace-index.ts](../../../../../files/src/core/runtime/graph-workspace-index.ts.md)
源码：[src/core/runtime/graph-workspace-index.ts:199](../../../../../../../src/core/runtime/graph-workspace-index.ts#L199)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadGraphWorkspaceIndex](loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [validateProfileSubgraphs](../../../../../files/src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts:233–275 | 校验子图 profile 绑定（存在性、版本、entry 暴露）并用 DFS 检测子图引用环。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [inspectGraphWorkspaceFormat](inspectGraphWorkspaceFormat.md) | src/core/runtime/graph-workspace-index.ts:105–116 | 只读检查 config.yaml 是否存在、为常规文件且符合 schema 2，返回 current 与原因。 |
