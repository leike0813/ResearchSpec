
# src/annotation-intake/review-copy.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/review-copy.ts -->

按 section/block/none 密度在原稿上生成带批注槽位的审阅副本，并可反向移除所有未被改动的槽位，使副本无损还原原文。
源码：[src/annotation-intake/review-copy.ts](../../../../../src/annotation-intake/review-copy.ts)

## 符号（2）
<!-- node: function:src/annotation-intake/review-copy.ts:generateAnnotationReviewCopy -->
<!-- node: function:src/annotation-intake/review-copy.ts:removeUntouchedAnnotationSlots -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [generateAnnotationReviewCopy](../../../symbols/src/annotation-intake/review-copy.ts/generateAnnotationReviewCopy.md) | 函数 | 16–73 | 复杂 | markdown、slot-template、annotation-intake | 1 | 在原稿的文档级、章节级或块级位置插入 HTML 注释包裹的批注槽位，逐条记录字节区间与模板哈希。 |
| removeUntouchedAnnotationSlots | 函数 | 75–87 | 中等 | markdown、reversible、annotation-intake | 0 | 倒序删除所有仍与模板哈希一致的槽位，把审阅副本无损还原为原始稿件字节。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [markdown-blocks.ts](../arsu-converter/revision/markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [session.ts](session.ts.md) | src/annotation-intake/session.ts | 批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [generateAnnotationReviewCopy](../../../symbols/src/annotation-intake/review-copy.ts/generateAnnotationReviewCopy.md) | 函数 | 16–73 | 在原稿的文档级、章节级或块级位置插入 HTML 注释包裹的批注槽位，逐条记录字节区间与模板哈希。 |
| removeUntouchedAnnotationSlots | 函数 | 75–87 | 倒序删除所有仍与模板哈希一致的槽位，把审阅副本无损还原为原始稿件字节。 |
