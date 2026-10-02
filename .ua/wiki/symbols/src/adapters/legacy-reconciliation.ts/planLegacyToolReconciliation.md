
# planLegacyToolReconciliation
<!-- node: function:src/adapters/legacy-reconciliation.ts:planLegacyToolReconciliation -->

规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。
类型：函数  
复杂度：复杂  
入边数：1  
标签：reconciliation、legacy-cleanup、safety、write-plan  
所属文件：[src/adapters/legacy-reconciliation.ts](../../../../files/src/adapters/legacy-reconciliation.ts.md)
源码：[src/adapters/legacy-reconciliation.ts:18](../../../../../../src/adapters/legacy-reconciliation.ts#L18)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planWorkspaceDelivery](../workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderCommand](../command-renderer.ts/renderCommand.md) | src/adapters/command-renderer.ts:32–56 | 按宿主 command format 渲染命令包装文件，处理参数占位符、冒号替换与各格式 frontmatter 差异。 |
| [validateManagedTarget](../managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
| [toolSkillsRoot](../tools.ts/toolSkillsRoot.md) | src/adapters/tools.ts:202–205 | 返回宿主项目级 Skill 根的绝对路径与清单用 POSIX 相对根。 |
