
# src/annotation-intake/interpretation.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/interpretation.ts -->

校验 Agent 提交的批注解释草稿：比对稿件、审阅副本与 Review Delta 的哈希、原始来源字节和批注目标，任何阻塞诊断都会让候选集物化失败。
源码：[src/annotation-intake/interpretation.ts](../../../../../src/annotation-intake/interpretation.ts)

## 符号（4）
<!-- node: class:src/annotation-intake/interpretation.ts:AnnotationInterpretationError -->
<!-- node: function:src/annotation-intake/interpretation.ts:annotationSourceContents -->
<!-- node: function:src/annotation-intake/interpretation.ts:materializeAnnotationCandidate -->
<!-- node: function:src/annotation-intake/interpretation.ts:validateAnnotationInterpretation -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| AnnotationInterpretationError | 类 | 131–136 | 简单 | error-type、annotation-intake、diagnostics | 0 | 解释草稿尚不可物化时抛出的错误，携带完整的阻塞诊断列表。 |
| annotationSourceContents | 函数 | 138–142 | 简单 | utility、annotation-intake、collection | 0 | 把来源与内容配对整理成 source_id 到正文的映射，供解释校验按来源逐条取证。 |
| materializeAnnotationCandidate | 函数 | 94–129 | 中等 | factory、annotation-intake、fail-closed | 0 | 在校验全部通过后，把状态为 ready 的解释条目物化为 AnnotationSetCandidate；存在任何阻塞诊断即抛出解释错误。 |
| validateAnnotationInterpretation | 函数 | 17–92 | 复杂 | validation、fail-closed、annotation-intake、provenance | 0 | 逐条校验解释草稿：比对原稿/审阅副本/Review Delta 的哈希、原始来源字节与片段，以及每条批注目标在原稿上的可定位性，返回阻塞诊断列表。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation-target.ts](../core/runtime/annotation-target.ts.md) | src/core/runtime/annotation-target.ts | 把批注目标落到实际 Markdown 上核对：章节标题必须唯一，块必须存在且哈希一致，引用必须在块内唯一出现并保持前后文。 |
| [annotation.ts](../core/contracts/annotation.ts.md) | src/core/contracts/annotation.ts | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| AnnotationInterpretationError | 类 | 131–136 | 解释草稿尚不可物化时抛出的错误，携带完整的阻塞诊断列表。 |
| annotationSourceContents | 函数 | 138–142 | 把来源与内容配对整理成 source_id 到正文的映射，供解释校验按来源逐条取证。 |
| materializeAnnotationCandidate | 函数 | 94–129 | 在校验全部通过后，把状态为 ready 的解释条目物化为 AnnotationSetCandidate；存在任何阻塞诊断即抛出解释错误。 |
| validateAnnotationInterpretation | 函数 | 17–92 | 逐条校验解释草稿：比对原稿/审阅副本/Review Delta 的哈希、原始来源字节与片段，以及每条批注目标在原稿上的可定位性，返回阻塞诊断列表。 |
