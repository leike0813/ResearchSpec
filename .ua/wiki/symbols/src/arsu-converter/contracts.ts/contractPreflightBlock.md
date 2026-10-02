
# contractPreflightBlock
<!-- node: function:src/arsu-converter/contracts.ts:contractPreflightBlock -->

生成契约前言正文：陈述 standalone 与 graph 两种模式的行为边界、只使用 status/instructions 返回的选择器、Gate 与 Decision 需逐次人工确认、可选领域流程的同意边界，并组合交付、humanizer 与文献适配子块。
类型：函数  
复杂度：复杂  
入边数：1  
标签：contract-injection、policy、generation、core-logic  
所属文件：[src/arsu-converter/contracts.ts](../../../../files/src/arsu-converter/contracts.ts.md)
源码：[src/arsu-converter/contracts.ts:119](../../../../../../src/arsu-converter/contracts.ts#L119)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [injectContractPreflight](../../../../files/src/arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts:60–83 | 把契约前言块插入 SKILL.md：优先放在 frontmatter 之后以保持 YAML 有效，已含标记时跳过注入，并返回是否实际注入的结构化结果。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [manuscriptDeliveryBlock](manuscriptDeliveryBlock.md) | src/arsu-converter/contracts.ts:198–223 | 生成手稿交付约束：deep-research 不注入；其余分组要求以 specs/manuscript.yaml 的 delivery 为格式契约、QMD 视为不透明内容保留，论文与流水线还需遵守受限的 quarto 探测与渲染脚本规则。 |
| [paperHumanizerReferenceBlock](../../../../files/src/arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts:181–196 | 按分组生成 paper-humanizer Reference mode 约束：学术论文在改写手稿时静默加载该入口，流水线只负责把约束传递给活跃的论文生产者，其余分组不注入。 |
| [renderLiteratureSourcePolicyProjection](../../literature-adapters/provider-policy.ts/renderLiteratureSourcePolicyProjection.md) | src/literature-adapters/provider-policy.ts:103–124 | 把文献来源策略投影为可读文本，供 Navigate 等入口指引内嵌展示各模式下的提供方优先级与不可用时的行为。 |
