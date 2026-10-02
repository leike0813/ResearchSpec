
# validateManagedTarget
<!-- node: function:src/adapters/managed-target.ts:validateManagedTarget -->

在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。
类型：函数  
复杂度：简单  
入边数：8  
标签：security、validation、path-boundary、async  
所属文件：[src/adapters/managed-target.ts](../../../../files/src/adapters/managed-target.ts.md)
源码：[src/adapters/managed-target.ts:58](../../../../../../src/adapters/managed-target.ts#L58)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planToolDelivery](../delivery.ts/planToolDelivery.md) | src/adapters/delivery.ts:24–140 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |
| [reconcileAgentToolInstallations](../installations.ts/reconcileAgentToolInstallations.md) | src/adapters/installations.ts:229–318 | 对账既有与期望安装：删除清单拥有且字节未变的过期文件，保留用户改动、共享全局文件与插件 profile 记录。 |
| [planLegacyToolReconciliation](../legacy-reconciliation.ts/planLegacyToolReconciliation.md) | src/adapters/legacy-reconciliation.ts:18–131 | 规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。 |
| [resolveManagedTarget](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:36–55 | 不触碰文件系统地解析安装记录，按 owner 分派到 agent-tool、framework 或 literature-adapter 目标推导。 |
| [inspectProjectEntries](../../../../files/src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts:131–171 | 只读检查入口协议：报告缺失、畸形、无所有权、漂移，以及 AGENTS.md 被 override 遮蔽等宿主特定风险。 |
| [planProjectEntryDelivery](../project-entry.ts/planProjectEntryDelivery.md) | src/adapters/project-entry.ts:24–102 | 按入口协议规划写入：处理 OpenCode 的 CLAUDE.md 回退、缺少 Navigate 资产、区域缺失/畸形/被改动等多种保留分支。 |
| [loadGraphWorkspaceIndex](../../core/runtime/graph-workspace-index.ts/loadGraphWorkspaceIndex.md) | src/core/runtime/graph-workspace-index.ts:118–197 | 构建工作区只读索引：必需目录与文件、清单与 config、稳定 spec 交叉引用、profile、run、节点与变更，并汇总诊断。 |
| [reconcileLiteratureAdapterInstallations](../../literature-adapters/delivery.ts/reconcileLiteratureAdapterInstallations.md) | src/literature-adapters/delivery.ts:25–95 | 对照期望安装集合协调既有文献适配器安装：校验受管目标、保留仍在使用的记录，并为不安全记录产出诊断。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [assertPathWithinRoot](../../core/workspace/path-boundary.ts/assertPathWithinRoot.md) | src/core/workspace/path-boundary.ts:4–31 | 校验目标路径位于可信根目录之内，逐级拒绝符号链接与非目录祖先，违规时抛出 EWRITE_CONFLICT。 |
