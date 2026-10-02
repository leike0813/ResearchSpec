
# src/annotation-intake/sources.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/sources.ts -->

把审阅副本、反馈文件和对话消息捕获为内容寻址的原始来源记录，并给出 create_only 形式的写入计划。
源码：[src/annotation-intake/sources.ts](../../../../../src/annotation-intake/sources.ts)

## 符号（2）
<!-- node: function:src/annotation-intake/sources.ts:captureAnnotationSource -->
<!-- node: function:src/annotation-intake/sources.ts:captureConversationFeedback -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [captureAnnotationSource](../../../symbols/src/annotation-intake/sources.ts/captureAnnotationSource.md) | 函数 | 13–41 | 中等 | content-addressed、provenance、annotation-intake | 2 | 按内容哈希为原始来源生成 source_id 与内容寻址路径，并给出 create_only 写入计划与默认扩展名、媒体类型。 |
| captureConversationFeedback | 函数 | 43–58 | 中等 | content-addressed、serialization、annotation-intake | 0 | 把一组对话消息序列化为固定 JSON 后按普通原始来源捕获，保证同输入同输出。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation.ts](../core/contracts/annotation.ts.md) | src/core/contracts/annotation.ts | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [session.ts](session.ts.md) | src/annotation-intake/session.ts | 批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [captureAnnotationSource](../../../symbols/src/annotation-intake/sources.ts/captureAnnotationSource.md) | 函数 | 13–41 | 按内容哈希为原始来源生成 source_id 与内容寻址路径，并给出 create_only 写入计划与默认扩展名、媒体类型。 |
| captureConversationFeedback | 函数 | 43–58 | 把一组对话消息序列化为固定 JSON 后按普通原始来源捕获，保证同输入同输出。 |
