
# src/annotation-intake/session.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/session.ts -->

批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。
源码：[src/annotation-intake/session.ts](../../../../../src/annotation-intake/session.ts)

## 符号（6）
<!-- node: function:src/annotation-intake/session.ts:createAnnotationIntakeSession -->
<!-- node: function:src/annotation-intake/session.ts:planAnnotationWorkingMaterial -->
<!-- node: function:src/annotation-intake/session.ts:planMaterializedAnnotationCandidate -->
<!-- node: function:src/annotation-intake/session.ts:withAnnotationInterpretation -->
<!-- node: function:src/annotation-intake/session.ts:withCapturedAnnotationSources -->
<!-- node: function:src/annotation-intake/session.ts:withDerivedReviewDelta -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| createAnnotationIntakeSession | 函数 | 15–70 | 复杂 | service、session、annotation-intake | 0 | 创建 collecting 状态的接收会话：生成审阅副本、把副本登记为首个原始来源，并返回会话、来源与三条待写入计划。 |
| planAnnotationWorkingMaterial | 函数 | 204–217 | 中等 | utility、write-plan、conflict-detection | 0 | 按路径去重并排序全部工作材料写入，路径相同但内容或动作冲突时直接报错。 |
| planMaterializedAnnotationCandidate | 函数 | 191–202 | 简单 | utility、session、write-plan | 0 | 把已物化的候选批注集序列化为一次 create_only/refresh 写入计划。 |
| withAnnotationInterpretation | 函数 | 157–189 | 中等 | service、session、annotation-intake | 0 | 登记 Agent 提交的解释草稿：序列化后计算哈希、更新会话状态并产出解释文件与会话文件的刷新计划。 |
| withCapturedAnnotationSources | 函数 | 118–155 | 中等 | service、session、provenance | 0 | 并入若干新捕获的原始来源，可选地同步当前审阅副本哈希，生成对应的刷新写入计划。 |
| withDerivedReviewDelta | 函数 | 72–116 | 中等 | service、session、annotation-intake、diff | 0 | 把推导出的 Review Delta 登记进会话：校验基准哈希一致，新增原始来源、切换到 interpreting 状态并累积诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [paths.ts](paths.ts.md) | src/annotation-intake/paths.ts | 为一次批注接收会话推导全部私有工作文件路径，并在注解集 ID 不安全时直接拒绝。 |
| [review-copy.ts](review-copy.ts.md) | src/annotation-intake/review-copy.ts | 按 section/block/none 密度在原稿上生成带批注槽位的审阅副本，并可反向移除所有未被改动的槽位，使副本无损还原原文。 |
| [sources.ts](sources.ts.md) | src/annotation-intake/sources.ts | 把审阅副本、反馈文件和对话消息捕获为内容寻址的原始来源记录，并给出 create_only 形式的写入计划。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| createAnnotationIntakeSession | 函数 | 15–70 | 创建 collecting 状态的接收会话：生成审阅副本、把副本登记为首个原始来源，并返回会话、来源与三条待写入计划。 |
| planAnnotationWorkingMaterial | 函数 | 204–217 | 按路径去重并排序全部工作材料写入，路径相同但内容或动作冲突时直接报错。 |
| planMaterializedAnnotationCandidate | 函数 | 191–202 | 把已物化的候选批注集序列化为一次 create_only/refresh 写入计划。 |
| withAnnotationInterpretation | 函数 | 157–189 | 登记 Agent 提交的解释草稿：序列化后计算哈希、更新会话状态并产出解释文件与会话文件的刷新计划。 |
| withCapturedAnnotationSources | 函数 | 118–155 | 并入若干新捕获的原始来源，可选地同步当前审阅副本哈希，生成对应的刷新写入计划。 |
| withDerivedReviewDelta | 函数 | 72–116 | 把推导出的 Review Delta 登记进会话：校验基准哈希一致，新增原始来源、切换到 interpreting 状态并累积诊断。 |
