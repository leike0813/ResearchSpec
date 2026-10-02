
# assertPathWithinRoot
<!-- node: function:src/core/workspace/path-boundary.ts:assertPathWithinRoot -->

校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。
类型：函数  
复杂度：中等  
入边数：6  
标签：path-boundary、security、validation  
所属文件：[src/core/workspace/path-boundary.ts](../../../../../files/src/core/workspace/path-boundary.ts.md)
源码：[src/core/workspace/path-boundary.ts:4](../../../../../../../src/core/workspace/path-boundary.ts#L4)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateManagedTarget](../../../adapters/managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
| [inspectProjectEntries](../../../../../files/src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts:131–171 | 只读检查入口协议：报告缺失、畸形、无所有权、漂移，以及 AGENTS.md 被 override 遮蔽等宿主特定风险。 |
| [loadGraphWorkspaceIndex](../../runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [executeWritePlan](../write-plan.ts/executeWritePlan.md) | src/core/workspace/write-plan.ts:143–227 | 执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。 |
| [planFile](../write-plan.ts/planFile.md) | src/core/workspace/write-plan.ts:46–103 | 比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。 |
| [planWorkspacePluginTransaction](../../../../../files/src/plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts:291–346 | 构造可整体回滚的插件投影事务，包含读前置条件、边界根、失败关闭的严格移除选项与安装清单更新。 |

## 调用

该符号没有记录对外调用。
