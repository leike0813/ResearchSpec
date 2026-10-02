
# planWorkspaceDelivery
<!-- node: function:src/adapters/workspace-delivery.ts:planWorkspaceDelivery -->

编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。
类型：函数  
复杂度：复杂  
入边数：1  
标签：orchestration、delivery、planning、workspace、write-plan  
所属文件：[src/adapters/workspace-delivery.ts](../../../../files/src/adapters/workspace-delivery.ts.md)
源码：[src/adapters/workspace-delivery.ts:33](../../../../../../src/adapters/workspace-delivery.ts#L33)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [applyGraphWorkspaceProjection](../../cli/handlers/graph-bootstrap.ts/applyGraphWorkspaceProjection.md) | src/cli/handlers/graph-bootstrap.ts:37–98 | 生成并提交整套工作区投影：校验既有清单、运行交付计划、写 config 与安装清单，冲突或阻塞诊断时整体放弃。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planToolDelivery](../delivery.ts/planToolDelivery.md) | src/adapters/delivery.ts:24–140 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |
| [deduplicateInstallations](../../../../files/src/adapters/installations.ts.md) | src/adapters/installations.ts:196–199 | 按 scope+path 去重安装记录，并按 tool_id 与路径稳定排序以保证清单可复现。 |
| [reconcileAgentToolInstallations](../installations.ts/reconcileAgentToolInstallations.md) | src/adapters/installations.ts:229–318 | 对账既有与期望安装：删除清单拥有且字节未变的过期文件，保留用户改动、共享全局文件与插件 profile 记录。 |
| [planLegacyToolReconciliation](../legacy-reconciliation.ts/planLegacyToolReconciliation.md) | src/adapters/legacy-reconciliation.ts:18–131 | 规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。 |
| [loadGraphProfileRegistry](../../../../files/src/graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts:70–84 | 读取图谱 profile 注册表并默认加载能力注册表用于交叉校验。 |
| [planLiteratureAdapterDelivery](../../literature-adapters/delivery.ts/planLiteratureAdapterDelivery.md) | src/literature-adapters/delivery.ts:97–284 | 把已选文献适配器域与运行时平台展开为 Profile 和 Skill 文件写入计划、解析快照与诊断。 |
| [reconcileLiteratureAdapterInstallations](../../literature-adapters/delivery.ts/reconcileLiteratureAdapterInstallations.md) | src/literature-adapters/delivery.ts:25–95 | 对照期望安装集合协调既有文献适配器安装：校验受管目标、保留仍在使用的记录，并为不安全记录产出诊断。 |
| [planPluginProjection](../../plugins/graph-delivery.ts/planPluginProjection.md) | src/plugins/graph-delivery.ts:129–263 | 把插件域与扩展包展开为各工具 Skills 与 Profile 目录的写入计划，覆盖创建、刷新、退役移除与冲突诊断。 |
