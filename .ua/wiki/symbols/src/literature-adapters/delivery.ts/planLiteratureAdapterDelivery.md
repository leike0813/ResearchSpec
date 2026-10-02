
# planLiteratureAdapterDelivery
<!-- node: function:src/literature-adapters/delivery.ts:planLiteratureAdapterDelivery -->

把已选文献适配器域与运行时平台展开为 Profile 和 Skill 文件写入计划、解析快照与诊断。
类型：函数  
复杂度：复杂  
入边数：1  
标签：literature-adapter、delivery、write-plan、planning  
所属文件：[src/literature-adapters/delivery.ts](../../../../files/src/literature-adapters/delivery.ts.md)
源码：[src/literature-adapters/delivery.ts:97](../../../../../../src/literature-adapters/delivery.ts#L97)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planWorkspaceDelivery](../../adapters/workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planFile](../../core/workspace/write-plan.ts/planFile.md) | src/core/workspace/write-plan.ts:46–103 | 比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。 |
