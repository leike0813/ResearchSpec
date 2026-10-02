
# src/core/runtime/annotation-target.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/runtime](../../../../modules/src/core/runtime.md)
<!-- node: file:src/core/runtime/annotation-target.ts -->

把批注目标落到实际 Markdown 上核对：章节标题必须唯一，块必须存在且哈希一致，引用必须在块内唯一出现并保持前后文。
源码：[src/core/runtime/annotation-target.ts](../../../../../../src/core/runtime/annotation-target.ts)

## 符号（2）
<!-- node: class:src/core/runtime/annotation-target.ts:AnnotationTargetError -->
<!-- node: function:src/core/runtime/annotation-target.ts:validateAnnotationTargetAgainstMarkdown -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| AnnotationTargetError | 类 | 8–13 | 简单 | error-type、annotation、diagnostics | 0 | 批注目标无法在原稿上定位时抛出的错误，区分缺失误配与哈希漂移造成的冲突。 |
| validateAnnotationTargetAgainstMarkdown | 函数 | 15–62 | 中等 | validation、markdown、annotation、anchor | 1 | 按目标类型逐层收紧：章节标题须唯一，块须存在且哈希一致，引用须在块内唯一出现并与前后文吻合。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation.ts](../contracts/annotation.ts.md) | src/core/contracts/annotation.ts | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [markdown-blocks.ts](../../arsu-converter/revision/markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [interpretation.ts](../../annotation-intake/interpretation.ts.md) | src/annotation-intake/interpretation.ts | 校验 Agent 提交的批注解释草稿：比对稿件、审阅副本与 Review Delta 的哈希、原始来源字节和批注目标，任何阻塞诊断都会让候选集物化失败。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| AnnotationTargetError | 类 | 8–13 | 批注目标无法在原稿上定位时抛出的错误，区分缺失误配与哈希漂移造成的冲突。 |
| validateAnnotationTargetAgainstMarkdown | 函数 | 15–62 | 按目标类型逐层收紧：章节标题须唯一，块须存在且哈希一致，引用须在块内唯一出现并与前后文吻合。 |
