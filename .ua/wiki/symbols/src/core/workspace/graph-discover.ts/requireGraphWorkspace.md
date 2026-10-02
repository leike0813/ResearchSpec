
# requireGraphWorkspace
<!-- node: function:src/core/workspace/graph-discover.ts:requireGraphWorkspace -->

在解析结果上强制要求找到当前格式工作区，否则按原因抛出不同异常。
类型：函数  
复杂度：简单  
入边数：7  
标签：discovery、error-handling、workspace、async  
所属文件：[src/core/workspace/graph-discover.ts](../../../../../files/src/core/workspace/graph-discover.ts.md)
源码：[src/core/workspace/graph-discover.ts:37](../../../../../../../src/core/workspace/graph-discover.ts#L37)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphArchive](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:176–188 | 校验变更状态可归档后把目录移动到 changes/archive 之下。 |
| [handleGraphChangeDecision](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:190–203 | 记录项目变更的人类决定（接受/拒绝/推迟/取代），只改 frontmatter，不触碰稳定 spec。 |
| [handleGraphHandoff](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:110–135 | 无 --input 时渲染当前 run handoff，否则按语义输入改写并交由 run 写入层提交。 |
| [handleGraphList](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:28–69 | 列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持词法查询与基于集合指纹的分页游标。 |
| [handleGraphPack](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:137–156 | 按 scope 选取文件并生成确定性 ZIP 上下文包，已存在输出需 --force 才覆盖。 |
| [handleGraphPropose](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:158–174 | 创建项目变更目录与 change.md，按 --with 生成 design/tasks/delta 支撑文档。 |
| [handleGraphShow](../../../../../files/src/cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts:71–108 | 按 procedure/profile/run/node/change 选择器输出单个精确对象的完整内容。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [resolveGraphWorkspace](../../../../../files/src/core/workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts:12–35 | 图工作区解析：显式路径或逐级向上查找，区分 missing/invalid/unsupported 三种非成功态。 |
