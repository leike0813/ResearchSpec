
# planFile
<!-- node: function:src/core/workspace/write-plan.ts:planFile -->

比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。
类型：函数  
复杂度：复杂  
入边数：2  
标签：write-plan、ownership、hash-verification、validation  
所属文件：[src/core/workspace/write-plan.ts](../../../../../files/src/core/workspace/write-plan.ts.md)
源码：[src/core/workspace/write-plan.ts:46](../../../../../../../src/core/workspace/write-plan.ts#L46)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planLiteratureAdapterDelivery](../../../literature-adapters/delivery.ts/planLiteratureAdapterDelivery.md) | src/literature-adapters/delivery.ts:97–284 | 把已选文献适配器域与运行时平台展开为 Profile 和 Skill 文件写入计划、解析快照与诊断。 |
| [planPluginProjection](../../../plugins/graph-delivery.ts/planPluginProjection.md) | src/plugins/graph-delivery.ts:129–263 | 把插件域与扩展包展开为各工具 Skills 与 Profile 目录的写入计划，覆盖创建、刷新、退役移除与冲突诊断。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [assertPathWithinRoot](../path-boundary.ts/assertPathWithinRoot.md) | src/core/workspace/path-boundary.ts:4–31 | 校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。 |
