
# src/annotation-intake/index.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/annotation-intake](../../../modules/src/annotation-intake.md)
<!-- node: file:src/annotation-intake/index.ts -->

annotation-intake 模块的 barrel 文件，重新导出 contracts、interpretation、paths、review-copy、review-delta、session 与 sources 七个契约模块。
源码：[src/annotation-intake/index.ts](../../../../../src/annotation-intake/index.ts)

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [interpretation.ts](interpretation.ts.md) | src/annotation-intake/interpretation.ts | 校验 Agent 提交的批注解释草稿：比对稿件、审阅副本与 Review Delta 的哈希、原始来源字节和批注目标，任何阻塞诊断都会让候选集物化失败。 |
| [paths.ts](paths.ts.md) | src/annotation-intake/paths.ts | 为一次批注接收会话推导全部私有工作文件路径，并在注解集 ID 不安全时直接拒绝。 |
| [review-copy.ts](review-copy.ts.md) | src/annotation-intake/review-copy.ts | 按 section/block/none 密度在原稿上生成带批注槽位的审阅副本，并可反向移除所有未被改动的槽位，使副本无损还原原文。 |
| [review-delta.ts](review-delta.ts.md) | src/annotation-intake/review-delta.ts | 在原稿、槽位模板与用户改后的审阅副本之间推导块级 Review Delta，标出新增、修改、缺失与无法定位的整段差异。 |
| [session.ts](session.ts.md) | src/annotation-intake/session.ts | 批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。 |
| [sources.ts](sources.ts.md) | src/annotation-intake/sources.ts | 把审阅副本、反馈文件和对话消息捕获为内容寻址的原始来源记录，并给出 create_only 形式的写入计划。 |
