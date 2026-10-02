
# projectWorkspacePlugins
<!-- node: function:src/plugins/graph-delivery.ts:projectWorkspacePlugins -->

执行插件投影事务并清理因移除而变空的 Skill、capability 与投影目录。
类型：函数  
复杂度：中等  
入边数：3  
标签：plugin、delivery、transaction、cleanup  
所属文件：[src/plugins/graph-delivery.ts](../../../../files/src/plugins/graph-delivery.ts.md)
源码：[src/plugins/graph-delivery.ts:348](../../../../../../src/plugins/graph-delivery.ts#L348)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphPluginInstall](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:82–114 | 要求显式领域 ID 与非交互下的 --yes，把选定领域投影进当前工作区。 |
| [handleGraphPluginUninstall](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:116–144 | 从工作区选择中移除领域并重新投影，未安装的 ID 直接报错。 |
| [handleGraphPluginUpdate](../../../../files/src/cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts:146–174 | 刷新已安装领域，缺省时刷新全部，并先校验所选领域当前可用。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [executeWritePlan](../../core/workspace/write-plan.ts/executeWritePlan.md) | src/core/workspace/write-plan.ts:143–227 | 执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。 |
