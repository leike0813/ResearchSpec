
# manuscriptDeliveryBlock
<!-- node: function:src/arsu-converter/contracts.ts:manuscriptDeliveryBlock -->

生成手稿交付约束：deep-research 不注入；其余分组要求以 specs/manuscript.yaml 的 delivery 为格式契约、QMD 视为不透明内容保留，论文与流水线还需遵守受限的 quarto 探测与渲染脚本规则。
类型：函数  
复杂度：复杂  
入边数：1  
标签：contract-injection、manuscript、policy、generation  
所属文件：[src/arsu-converter/contracts.ts](../../../../files/src/arsu-converter/contracts.ts.md)
源码：[src/arsu-converter/contracts.ts:198](../../../../../../src/arsu-converter/contracts.ts#L198)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [contractPreflightBlock](contractPreflightBlock.md) | src/arsu-converter/contracts.ts:119–179 | 生成契约前言正文：陈述 standalone 与 graph 两种模式的行为边界、只使用 status/instructions 返回的选择器、Gate 与 Decision 需逐次人工确认、可选领域流程的同意边界，并组合交付、humanizer 与文献适配子块。 |

## 调用

该符号没有记录对外调用。
