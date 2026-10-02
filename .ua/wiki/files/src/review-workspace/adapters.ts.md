
# src/review-workspace/adapters.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/adapters.ts -->

把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。
源码：[src/review-workspace/adapters.ts](../../../../../src/review-workspace/adapters.ts)

## 符号（10）
<!-- node: function:src/review-workspace/adapters.ts:annotationCandidateReviewWorkspace -->
<!-- node: function:src/review-workspace/adapters.ts:annotationCandidateReviewWorkspaceV2 -->
<!-- node: function:src/review-workspace/adapters.ts:createReviewWorkspaceResult -->
<!-- node: function:src/review-workspace/adapters.ts:descriptor -->
<!-- node: function:src/review-workspace/adapters.ts:manuscriptProjection -->
<!-- node: function:src/review-workspace/adapters.ts:paperHumanizerComparisonReviewWorkspaceV2 -->
<!-- node: function:src/review-workspace/adapters.ts:paperHumanizerReviewWorkspace -->
<!-- node: function:src/review-workspace/adapters.ts:paperHumanizerReviewWorkspaceV2 -->
<!-- node: function:src/review-workspace/adapters.ts:reviewResponseReviewWorkspace -->
<!-- node: function:src/review-workspace/adapters.ts:reviewResponseReviewWorkspaceV2 -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| annotationCandidateReviewWorkspace | 函数 | 132–158 | 中等 | adapter、projection、validation | 0 | 把标注集候选转成 v1 评审描述，每条标注映射为一个待裁决条目，并按语义影响级别给出风险标签。 |
| annotationCandidateReviewWorkspaceV2 | 函数 | 87–89 | 简单 | adapter、projection、review-workspace | 0 | 将标注候选投影为 v2 评审工作区，复用 v1 描述作为项目来源。 |
| createReviewWorkspaceResult | 函数 | 215–239 | 中等 | serialization、validation、review-workspace | 0 | 组装 v1 评审导出结果：按工作区条目补齐缺失决策、绑定源哈希，并交给 Schema 校验覆盖关系。 |
| descriptor | 函数 | 241–261 | 简单 | factory、review-workspace、workflow-policy | 0 | 统一构造评审工作区描述，固定写入 CLI 独占的变更权威与交回 Agent 的 handoff 指引。 |
| manuscriptProjection | 函数 | 263–275 | 简单 | validation、projection、hashing | 0 | 投影稿件元数据：核对内容哈希与期望值一致，并由扩展名推断评审格式。 |
| paperHumanizerComparisonReviewWorkspaceV2 | 函数 | 95–126 | 中等 | adapter、comparison、validation、review-workspace | 0 | 构造原稿与候选稿的对照评审工作区：校验两份冻结稿件哈希、要求块数与类型逐一对应，再以 before-/after- 前缀生成完整对照行。 |
| paperHumanizerReviewWorkspace | 函数 | 160–186 | 中等 | adapter、projection、review-workspace | 0 | 把人性化修订计划的每条操作转成评审条目，携带定位符、保护约束与初始处置。 |
| paperHumanizerReviewWorkspaceV2 | 函数 | 91–93 | 简单 | adapter、projection、review-workspace | 0 | 将论文人性化修订计划投影为 v2 评审工作区，保留冻结源集与块级定位。 |
| reviewResponseReviewWorkspace | 函数 | 188–213 | 中等 | adapter、projection、review-workspace | 0 | 把审稿回复工作板条目转成评审条目，并把工作板状态归一化为统一的处置枚举。 |
| reviewResponseReviewWorkspaceV2 | 函数 | 128–130 | 简单 | adapter、projection、review-workspace | 0 | 将审稿回复工作板投影为 v2 评审工作区。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation.ts](../core/contracts/annotation.ts.md) | src/core/contracts/annotation.ts | 核心层批注契约：语义影响级别、批注目标、原始来源、来源引用、完整批注与 AnnotationSetCandidate 的 zod 定义。 |
| [contracts.ts](contracts.ts.md) | src/review-workspace/contracts.ts | review-workspace v1 契约的 Zod 定义：适配器枚举、稿件、目标锚点、条目、描述与导出结果，并要求结果覆盖每个条目且源哈希一致。 |
| [prepare.ts](prepare.ts.md) | src/review-workspace/prepare.ts | 评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。 |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| annotationCandidateReviewWorkspace | 函数 | 132–158 | 把标注集候选转成 v1 评审描述，每条标注映射为一个待裁决条目，并按语义影响级别给出风险标签。 |
| annotationCandidateReviewWorkspaceV2 | 函数 | 87–89 | 将标注候选投影为 v2 评审工作区，复用 v1 描述作为项目来源。 |
| createReviewWorkspaceResult | 函数 | 215–239 | 组装 v1 评审导出结果：按工作区条目补齐缺失决策、绑定源哈希，并交给 Schema 校验覆盖关系。 |
| paperHumanizerComparisonReviewWorkspaceV2 | 函数 | 95–126 | 构造原稿与候选稿的对照评审工作区：校验两份冻结稿件哈希、要求块数与类型逐一对应，再以 before-/after- 前缀生成完整对照行。 |
| paperHumanizerReviewWorkspace | 函数 | 160–186 | 把人性化修订计划的每条操作转成评审条目，携带定位符、保护约束与初始处置。 |
| paperHumanizerReviewWorkspaceV2 | 函数 | 91–93 | 将论文人性化修订计划投影为 v2 评审工作区，保留冻结源集与块级定位。 |
| reviewResponseReviewWorkspace | 函数 | 188–213 | 把审稿回复工作板条目转成评审条目，并把工作板状态归一化为统一的处置枚举。 |
| reviewResponseReviewWorkspaceV2 | 函数 | 128–130 | 将审稿回复工作板投影为 v2 评审工作区。 |
