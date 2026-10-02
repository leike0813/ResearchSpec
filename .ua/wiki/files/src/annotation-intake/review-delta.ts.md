
# src/annotation-intake/review-delta.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/review-delta.ts -->

在原稿、槽位模板与用户改后的审阅副本之间推导块级 Review Delta，标出新增、修改、缺失与无法定位的整段差异。
源码：[src/annotation-intake/review-delta.ts](../../../../../src/annotation-intake/review-delta.ts)

## 符号（1）
<!-- node: function:src/annotation-intake/review-delta.ts:deriveReviewDelta -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| deriveReviewDelta | 函数 | 6–98 | 复杂 | diff、markdown、annotation-intake | 0 | 比较模板与用户改后的审阅副本，按块 id 归并出 changed/missing/added 与整段 unmatched 差异；结构无法解析时降级为整篇对照并给出阻塞诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [markdown-blocks.ts](../arsu-converter/revision/markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| deriveReviewDelta | 函数 | 6–98 | 比较模板与用户改后的审阅副本，按块 id 归并出 changed/missing/added 与整段 unmatched 差异；结构无法解析时降级为整篇对照并给出阻塞诊断。 |
