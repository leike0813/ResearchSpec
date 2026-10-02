
# planPluginProjection
<!-- node: function:src/plugins/graph-delivery.ts:planPluginProjection -->

把插件域与扩展包展开为各工具 Skills 与 Profile 目录的写入计划，覆盖创建、刷新、退役移除与冲突诊断。
类型：函数  
复杂度：复杂  
入边数：1  
标签：plugin、delivery、projection、write-plan  
所属文件：[src/plugins/graph-delivery.ts](../../../../files/src/plugins/graph-delivery.ts.md)
源码：[src/plugins/graph-delivery.ts:129](../../../../../../src/plugins/graph-delivery.ts#L129)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planWorkspaceDelivery](../../adapters/workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planFile](../../core/workspace/write-plan.ts/planFile.md) | src/core/workspace/write-plan.ts:46–103 | 比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。 |
