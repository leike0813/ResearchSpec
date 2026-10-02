
# src/core/contracts/annotation.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/contracts](../../../../modules/src/core/contracts.md)
<!-- node: file:src/core/contracts/annotation.ts -->

核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。
源码：[src/core/contracts/annotation.ts](../../../../../../src/core/contracts/annotation.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.ts](../../review-workspace/adapters.ts.md) | src/review-workspace/adapters.ts | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [annotation-provenance.ts](../runtime/annotation-provenance.ts.md) | src/core/runtime/annotation-provenance.ts | 校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。 |
| [annotation-target.ts](../runtime/annotation-target.ts.md) | src/core/runtime/annotation-target.ts | 把批注目标落到实际 Markdown 上核对：章节标题必须唯一，块必须存在且哈希一致，引用必须在块内唯一出现并保持前后文。 |
| [contracts.ts](../../annotation-intake/contracts.ts.md) | src/annotation-intake/contracts.ts | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [interpretation.ts](../../annotation-intake/interpretation.ts.md) | src/annotation-intake/interpretation.ts | 校验 Agent 提交的批注解释草稿：比对稿件、审阅副本与 Review Delta 的哈希、原始来源字节和批注目标，任何阻塞诊断都会让候选集物化失败。 |
| [manuscript-annotation.test.ts](../../../tests/manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |
| [sources.ts](../../annotation-intake/sources.ts.md) | src/annotation-intake/sources.ts | 把审阅副本、反馈文件和对话消息捕获为内容寻址的原始来源记录，并给出 create_only 形式的写入计划。 |
