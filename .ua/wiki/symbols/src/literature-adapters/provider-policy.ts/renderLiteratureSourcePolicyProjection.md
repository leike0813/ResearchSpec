
# renderLiteratureSourcePolicyProjection
<!-- node: function:src/literature-adapters/provider-policy.ts:renderLiteratureSourcePolicyProjection -->

把文献来源策略投影为可读文本，供 Navigate 等入口指引内嵌展示各模式下的提供方优先级与不可用时的行为。
类型：函数  
复杂度：中等  
入边数：2  
标签：rendering、policy、literature-adapter、documentation  
所属文件：[src/literature-adapters/provider-policy.ts](../../../../files/src/literature-adapters/provider-policy.ts.md)
源码：[src/literature-adapters/provider-policy.ts:103](../../../../../../src/literature-adapters/provider-policy.ts#L103)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderNavigateExecutionGuidance](../../adapters/companion/workflows/navigate.ts/renderNavigateExecutionGuidance.md) | src/adapters/companion/workflows/navigate.ts:19–246 | 按 Skill 或 command 宿主形态渲染 Navigate 的完整执行指引正文，内嵌图工作流触发条件、模式选择规则与文献来源策略投影。 |
| [contractPreflightBlock](../../arsu-converter/contracts.ts/contractPreflightBlock.md) | src/arsu-converter/contracts.ts:119–179 | 生成契约前言正文：陈述 standalone 与 graph 两种模式的行为边界、只使用 status/instructions 返回的选择器、Gate 与 Decision 需逐次人工确认、可选领域流程的同意边界，并组合交付、humanizer 与文献适配子块。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [getLiteratureSourcePolicy](../../../../files/src/literature-adapters/provider-policy.ts.md) | src/literature-adapters/provider-policy.ts:126–131 | 按模式名取出对应的来源策略定义，模式不存在时抛出错误以拒绝未知策略。 |
