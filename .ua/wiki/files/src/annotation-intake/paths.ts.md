
# src/annotation-intake/paths.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/paths.ts -->

为一次批注接收会话推导全部私有工作文件路径，并在注解集 ID 不安全时直接拒绝。
源码：[src/annotation-intake/paths.ts](../../../../../src/annotation-intake/paths.ts)

## 符号（1）
<!-- node: function:src/annotation-intake/paths.ts:annotationIntakePaths -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| annotationIntakePaths | 函数 | 5–17 | 简单 | utility、path-resolution、validation | 1 | 由工作根和注解集 ID 推导会话、审阅副本、解释、Review Delta、原始来源与候选集的固定路径布局。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [session.ts](session.ts.md) | src/annotation-intake/session.ts | 批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| annotationIntakePaths | 函数 | 5–17 | 由工作根和注解集 ID 推导会话、审阅副本、解释、Review Delta、原始来源与候选集的固定路径布局。 |
