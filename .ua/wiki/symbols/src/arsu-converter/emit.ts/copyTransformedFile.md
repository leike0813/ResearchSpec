
# copyTransformedFile
<!-- node: function:src/arsu-converter/emit.ts:copyTransformedFile -->

复制单个文件并按类型选择处理路径：schema 源直接投影，文本资源依次执行联合替换、锚点块保护、Markdown 链接重写与文本改写后还原并注入契约前言，SKILL.md 额外投影 frontmatter 描述，二进制资源则原样复制。
类型：函数  
复杂度：复杂  
入边数：1  
标签：code-generation、rewriting、contract-anchor、converter、core-logic  
所属文件：[src/arsu-converter/emit.ts](../../../../files/src/arsu-converter/emit.ts.md)
源码：[src/arsu-converter/emit.ts:251](../../../../../../src/arsu-converter/emit.ts#L251)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [emitSkillGroup](../../../../files/src/arsu-converter/emit.ts.md) | src/arsu-converter/emit.ts:37–153 | 生成一个 Skill 分组的完整产物：建目录、汇总待复制文件并通过工作队列递归发现依赖、记录缺失依赖，逐文件改写复制后追加许可文件、revision patch schema 与分组专属脚本，最后组装 SkillConversion 结果。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [applyCombinedReplacements](../anchors/replace.ts/applyCombinedReplacements.md) | src/arsu-converter/anchors/replace.ts:15–53 | 把锚点替换与运行时策略改写合并为单一有序重写流，适配被替换文本的行尾风格，为锚点块补上开闭标记，并在替换完成后同步更新两套计划的状态。 |
| [injectContractPreflight](../../../../files/src/arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts:60–83 | 把契约前言块插入 SKILL.md：优先放在 frontmatter 之后以保持 YAML 有效，已含标记时跳过注入，并返回是否实际注入的结构化结果。 |
| [protectAnchorBlocks](../../../../files/src/arsu-converter/emit.ts.md) | src/arsu-converter/emit.ts:321–331 | 用配对反引号语法把已注入的 rs 锚点块整体替换为编号占位符并暂存原文，使后续的链接与文本改写不会破坏契约内容。 |
| [restoreAnchorBlocks](../../../../files/src/arsu-converter/emit.ts.md) | src/arsu-converter/emit.ts:333–341 | 按占位符编号逐个还原先前暂存的锚点块原文，正则替换中使用回调避免替换串里的特殊字符被当作引用。 |
