
# src/review-workspace/contracts.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/contracts.ts -->

review-workspace v1 契约的 Zod 定义：适配器枚举、稿件、目标锚点、条目、描述与导出结果，并要求结果覆盖每个条目且源哈希一致。
源码：[src/review-workspace/contracts.ts](../../../../../src/review-workspace/contracts.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.ts](adapters.ts.md) | src/review-workspace/adapters.ts | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [instructions.ts](instructions.ts.md) | src/review-workspace/instructions.ts | 按 profile 或 capability 决定是否提供本地静态评审面：返回描述符/结果契约名、包内页面与 workbench 路径、评审阶段映射和给 Agent 的操作指引。 |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |
