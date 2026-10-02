
# src/annotation-intake
> 目录聚合页：8 个文件、16 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/annotation-intake/contracts.ts](../../files/src/annotation-intake/contracts.ts.md) | 文件 | 0 | 批注接收链路的全部 zod 契约：会话、生成审阅副本、Review Delta、解释草稿、诊断与计划写入，同时导出对应 TS 类型。 |
| [src/annotation-intake/index.ts](../../files/src/annotation-intake/index.ts.md) | 文件 | 0 | annotation-intake 模块的 barrel 文件，重新导出 contracts、interpretation、paths、review-copy、review-delta、session 与 sources 七个契约模块。 |
| [src/annotation-intake/interpretation.ts](../../files/src/annotation-intake/interpretation.ts.md) | 文件 | 4 | 校验 Agent 提交的批注解释草稿：比对稿件、审阅副本与 Review Delta 的哈希、原始来源字节和批注目标，任何阻塞诊断都会让候选集物化失败。 |
| [src/annotation-intake/paths.ts](../../files/src/annotation-intake/paths.ts.md) | 文件 | 1 | 为一次批注接收会话推导全部私有工作文件路径，并在注解集 ID 不安全时直接拒绝。 |
| [src/annotation-intake/review-copy.ts](../../files/src/annotation-intake/review-copy.ts.md) | 文件 | 2 | 按 section/block/none 密度在原稿上生成带批注槽位的审阅副本，并可反向移除所有未被改动的槽位，使副本无损还原原文。 |
| [src/annotation-intake/review-delta.ts](../../files/src/annotation-intake/review-delta.ts.md) | 文件 | 1 | 在原稿、槽位模板与用户改后的审阅副本之间推导块级 Review Delta，标出新增、修改、缺失与无法定位的整段差异。 |
| [src/annotation-intake/session.ts](../../files/src/annotation-intake/session.ts.md) | 文件 | 6 | 批注接收会话的状态机：创建会话、附加 Review Delta 与外部来源、登记解释草稿，并把每一步整理成待写入私有工作目录的计划写入。 |
| [src/annotation-intake/sources.ts](../../files/src/annotation-intake/sources.ts.md) | 文件 | 2 | 把审阅副本、反馈文件和对话消息捕获为内容寻址的原始来源记录，并给出 create_only 形式的写入计划。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](core/contracts.md) | 3 |
| [src/arsu-converter/revision](arsu-converter/revision.md) | 2 |
| [src/core/runtime](core/runtime.md) | 1 |
