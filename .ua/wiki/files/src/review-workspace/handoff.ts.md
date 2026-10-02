
# src/review-workspace/handoff.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/handoff.ts -->

校验浏览器导出的评审结果并把归属 Agent 必须澄清的问题分类为源已变更、需定位或可直接采纳三种状态。
源码：[src/review-workspace/handoff.ts](../../../../../src/review-workspace/handoff.ts)

## 符号（1）
<!-- node: function:src/review-workspace/handoff.ts:inspectReviewHandoff -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| inspectReviewHandoff | 函数 | 20–64 | 中等 | validation、handoff、frozen-source、review-workspace | 0 | 先验证结果与保留工作区一致，再确认冻结源未被改动；源变更时返回差异文件与受影响的评语 ID，否则用引文上下文定位判断是否存在歧义锚点。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [prepare.ts](prepare.ts.md) | src/review-workspace/prepare.ts | 评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。 |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| inspectReviewHandoff | 函数 | 20–64 | 先验证结果与保留工作区一致，再确认冻结源未被改动；源变更时返回差异文件与受影响的评语 ID，否则用引文上下文定位判断是否存在歧义锚点。 |
