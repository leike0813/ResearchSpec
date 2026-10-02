
# planToolDelivery
<!-- node: function:src/adapters/delivery.ts:planToolDelivery -->

为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。
类型：函数  
复杂度：复杂  
入边数：1  
标签：planning、delivery、write-plan、orchestration  
所属文件：[src/adapters/delivery.ts](../../../../files/src/adapters/delivery.ts.md)
源码：[src/adapters/delivery.ts:24](../../../../../../src/adapters/delivery.ts#L24)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planWorkspaceDelivery](../workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderAgentProfileFiles](../agent-profiles.ts/renderAgentProfileFiles.md) | src/adapters/agent-profiles.ts:90–101 | 为单个宿主渲染两个角色的全部托管 profile 文件；宿主不支持原生 Agent 时返回空列表。 |
| [renderCommand](../command-renderer.ts/renderCommand.md) | src/adapters/command-renderer.ts:32–56 | 按宿主 command format 渲染命令包装文件，处理参数占位符、冒号替换与各格式 frontmatter 差异。 |
| [resolveManagedTarget](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:36–55 | 不触碰文件系统地解析安装记录，按 owner 分派到 agent-tool、framework 或 literature-adapter 目标推导。 |
| [validateManagedTarget](../managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
| [planProjectEntryDelivery](../project-entry.ts/planProjectEntryDelivery.md) | src/adapters/project-entry.ts:24–102 | 按入口协议规划写入：处理 OpenCode 的 CLAUDE.md 回退、缺少 Navigate 资产、区域缺失/畸形/被改动等多种保留分支。 |
