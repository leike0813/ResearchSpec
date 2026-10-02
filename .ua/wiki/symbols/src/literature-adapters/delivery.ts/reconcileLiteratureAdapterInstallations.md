
# reconcileLiteratureAdapterInstallations
<!-- node: function:src/literature-adapters/delivery.ts:reconcileLiteratureAdapterInstallations -->

对照期望安装集合协调既有文献适配器安装：校验受管目标、保留仍在使用的记录，并为不安全记录产出诊断。
类型：函数  
复杂度：复杂  
入边数：1  
标签：literature-adapter、managed-installation、reconciliation  
所属文件：[src/literature-adapters/delivery.ts](../../../../files/src/literature-adapters/delivery.ts.md)
源码：[src/literature-adapters/delivery.ts:25](../../../../../../src/literature-adapters/delivery.ts#L25)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planWorkspaceDelivery](../../adapters/workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateManagedTarget](../../adapters/managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
