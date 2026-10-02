
# renderNavigateExecutionGuidance
<!-- node: function:src/adapters/companion/workflows/navigate.ts:renderNavigateExecutionGuidance -->

按 Skill 或 command 宿主形态渲染 Navigate 的完整执行指引正文，内嵌图工作流触发条件、模式选择规则与文献来源策略投影。
类型：函数  
复杂度：复杂  
入边数：1  
标签：companion、navigate、rendering、policy、guidance  
所属文件：[src/adapters/companion/workflows/navigate.ts](../../../../../../files/src/adapters/companion/workflows/navigate.ts.md)
源码：[src/adapters/companion/workflows/navigate.ts:19](../../../../../../../../src/adapters/companion/workflows/navigate.ts#L19)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderCommand](../../../command-renderer.ts/renderCommand.md) | src/adapters/command-renderer.ts:32–56 | 按宿主 command format 渲染命令包装文件，处理参数占位符、冒号替换与各格式 frontmatter 差异。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderLiteratureSourcePolicyProjection](../../../../literature-adapters/provider-policy.ts/renderLiteratureSourcePolicyProjection.md) | src/literature-adapters/provider-policy.ts:103–124 | 把文献来源策略投影为可读文本，供 Navigate 等入口指引内嵌展示各模式下的提供方优先级与不可用时的行为。 |
