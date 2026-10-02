
# src/arsu-converter/revision/markdown-blocks.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/revision](../../../../modules/src/arsu-converter/revision.md)
<!-- node: file:src/arsu-converter/revision/markdown-blocks.ts -->

带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。
源码：[src/arsu-converter/revision/markdown-blocks.ts](../../../../../../src/arsu-converter/revision/markdown-blocks.ts)

## 符号（4）
<!-- node: function:src/arsu-converter/revision/markdown-blocks.ts:markdownBodyStart -->
<!-- node: function:src/arsu-converter/revision/markdown-blocks.ts:markdownSectionHeadings -->
<!-- node: function:src/arsu-converter/revision/markdown-blocks.ts:parseAnchoredBlocks -->
<!-- node: function:src/arsu-converter/revision/markdown-blocks.ts:splitMarkdownBlocks -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| markdownBodyStart | 函数 | 85–89 | 简单 | utility、markdown、frontmatter | 0 | 定位 YAML frontmatter 之后的正文起始偏移，无 frontmatter 时返回 0。 |
| markdownSectionHeadings | 函数 | 91–102 | 简单 | utility、markdown、heading | 1 | 跳过代码围栏后提取全部 ATX 标题文本，作为章节级批注目标的判定依据。 |
| [parseAnchoredBlocks](../../../../symbols/src/arsu-converter/revision/markdown-blocks.ts/parseAnchoredBlocks.md) | 函数 | 11–25 | 中等 | markdown、parsing、block-anchor | 4 | 扫描独立成行的块标记，构造带 id、字节区间、正文与归一化哈希的锚定块列表；标记缺失或重复即抛错。 |
| splitMarkdownBlocks | 函数 | 59–83 | 中等 | markdown、validation、parsing | 0 | 把待插入文本切成独立块，遇到围栏未闭合、含混的块边界形状或空内容时拒绝，保证插入不会破坏块结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation-target.ts](../../core/runtime/annotation-target.ts.md) | src/core/runtime/annotation-target.ts | 把批注目标落到实际 Markdown 上核对：章节标题必须唯一，块必须存在且哈希一致，引用必须在块内唯一出现并保持前后文。 |
| [apply.ts](apply.ts.md) | src/arsu-converter/revision/apply.ts | 在全部前置校验通过后，把 ARSU 修订补丁应用到带块标记的手稿，并汇总改动块、插入块与批注处置计数。 |
| [manuscript-annotation-intake-adapters.test.ts](../../../tests/manuscript-annotation-intake-adapters.test.ts.md) | tests/manuscript-annotation-intake-adapters.test.ts | 批注接收主链路的测试：槽位可逆性、从自由文本到候选批注集的完整物化、未决解释必须失败，以及对话捕获的确定性。 |
| [manuscript-annotation.test.ts](../../../tests/manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |
| [review-copy.ts](../../annotation-intake/review-copy.ts.md) | src/annotation-intake/review-copy.ts | 按 section/block/none 密度在原稿上生成带批注槽位的审阅副本，并可反向移除所有未被改动的槽位，使副本无损还原原文。 |
| [review-delta.ts](../../annotation-intake/review-delta.ts.md) | src/annotation-intake/review-delta.ts | 在原稿、槽位模板与用户改后的审阅副本之间推导块级 Review Delta，标出新增、修改、缺失与无法定位的整段差异。 |
| [review-workspace.test.ts](../../../tests/review-workspace.test.ts.md) | tests/review-workspace.test.ts | v1 工作台与预览夹具的测试：适配器证据保真、结果覆盖全部条目、静态 HTML 的自包含性，以及预览样例确实走真实 v2 适配器。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| markdownBodyStart | 函数 | 85–89 | 定位 YAML frontmatter 之后的正文起始偏移，无 frontmatter 时返回 0。 |
| markdownSectionHeadings | 函数 | 91–102 | 跳过代码围栏后提取全部 ATX 标题文本，作为章节级批注目标的判定依据。 |
| [parseAnchoredBlocks](../../../../symbols/src/arsu-converter/revision/markdown-blocks.ts/parseAnchoredBlocks.md) | 函数 | 11–25 | 扫描独立成行的块标记，构造带 id、字节区间、正文与归一化哈希的锚定块列表；标记缺失或重复即抛错。 |
| splitMarkdownBlocks | 函数 | 59–83 | 把待插入文本切成独立块，遇到围栏未闭合、含混的块边界形状或空内容时拒绝，保证插入不会破坏块结构。 |
