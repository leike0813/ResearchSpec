
# renderCommand
<!-- node: function:src/adapters/command-renderer.ts:renderCommand -->

按宿主 command format 渲染命令包装文件，处理参数占位符、冒号替换与各格式 frontmatter 差异。
类型：函数  
复杂度：中等  
入边数：2  
标签：renderer、host-adapter、format-adapter、commands  
所属文件：[src/adapters/command-renderer.ts](../../../../files/src/adapters/command-renderer.ts.md)
源码：[src/adapters/command-renderer.ts:32](../../../../../../src/adapters/command-renderer.ts#L32)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planToolDelivery](../delivery.ts/planToolDelivery.md) | src/adapters/delivery.ts:24–140 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |
| [planLegacyToolReconciliation](../legacy-reconciliation.ts/planLegacyToolReconciliation.md) | src/adapters/legacy-reconciliation.ts:18–131 | 规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderNavigateExecutionGuidance](../companion/workflows/navigate.ts/renderNavigateExecutionGuidance.md) | src/adapters/companion/workflows/navigate.ts:19–246 | 按 Skill 或 command 宿主形态渲染 Navigate 的完整执行指引正文，内嵌图工作流触发条件、模式选择规则与文献来源策略投影。 |
