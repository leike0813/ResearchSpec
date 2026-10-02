
# reconcileAgentToolInstallations
<!-- node: function:src/adapters/installations.ts:reconcileAgentToolInstallations -->

对账既有与期望安装：删除清单拥有且字节未变的过期文件，保留用户改动、共享全局文件与插件 profile 记录。
类型：函数  
复杂度：复杂  
入边数：1  
标签：reconciliation、cleanup、ownership、safety、diagnostics  
所属文件：[src/adapters/installations.ts](../../../../files/src/adapters/installations.ts.md)
源码：[src/adapters/installations.ts:229](../../../../../../src/adapters/installations.ts#L229)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planWorkspaceDelivery](../workspace-delivery.ts/planWorkspaceDelivery.md) | src/adapters/workspace-delivery.ts:33–163 | 编排 profile、工具交付与对账、遗留清理、文献 Adapter 与插件投影，合并为统一的写入计划与安装清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [managedSkillId](managedSkillId.md) | src/adapters/installations.ts:201–209 | 从不同来源类型的安装记录中提取其托管的 Skill 或 capability ID。 |
| [managedTargetDiagnostic](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:64–75 | 把目标解析异常包装为阻塞级诊断，尽量带上目标路径与来源细节。 |
| [validateManagedTarget](../managed-target.ts/validateManagedTarget.md) | src/adapters/managed-target.ts:58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
| [planProjectEntryRemoval](../../../../files/src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts:104–129 | 规划移除入口协议：文件模式直接删除，区域模式只切掉自有标记区间，内容被改动则保留。 |
