
# src/review-workspace/prepare.ts
所属分层：[评审批注与静态工作台层](../../../layers/review-workspace.md)  
所属目录：[src/review-workspace](../../../modules/src/review-workspace.md)
<!-- node: file:src/review-workspace/prepare.ts -->

评审工作区的准备层：把源文件冻结到 researchspec/ 之外的受控目录、比对源变化、准备内嵌图片资源，并组装通过 Schema 校验的 v2 工作区。
源码：[src/review-workspace/prepare.ts](../../../../../src/review-workspace/prepare.ts)

## 符号（6）
<!-- node: function:src/review-workspace/prepare.ts:assembleReviewWorkspace -->
<!-- node: function:src/review-workspace/prepare.ts:captureReviewSources -->
<!-- node: function:src/review-workspace/prepare.ts:compareReviewSources -->
<!-- node: function:src/review-workspace/prepare.ts:prepareRenderedImages -->
<!-- node: function:src/review-workspace/prepare.ts:prepareReviewImages -->
<!-- node: function:src/review-workspace/prepare.ts:readFrozenSource -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assembleReviewWorkspace | 函数 | 127–157 | 中等 | factory、validation、review-workspace、workflow-policy | 0 | 把冻结源、块、资源与条目装配成 v2 工作区，按内容哈希派生 snapshot_id，并强制写入 researchspec-cli-only 的变更权威与默认 handoff 指引。 |
| captureReviewSources | 函数 | 23–56 | 中等 | frozen-source、hashing、security、review-workspace | 0 | 把入口文件与相关源复制到 researchspec/ 之外的工作目录，逐个计算 SHA-256 并写出不可覆盖的 source-manifest.json，冻结本次评审的真实输入。 |
| compareReviewSources | 函数 | 58–74 | 简单 | frozen-source、hashing、validation | 0 | 重新读取当前源文件并与冻结清单比对，输出已变更或已缺失的路径列表。 |
| prepareRenderedImages | 函数 | 105–125 | 简单 | assets、rendering、validation | 0 | 内嵌已获批准渲染产生的输出图片；这些资源标记为无源路径，与冻结源图片区分开。 |
| prepareReviewImages | 函数 | 84–102 | 简单 | assets、validation、review-workspace | 0 | 把冻结集中的图片转成 base64 内嵌资源，要求图片已被捕获、类型受支持且不超过 10 MiB，并同时建立原路径与相对路径到资源 ID 的映射。 |
| readFrozenSource | 函数 | 76–78 | 简单 | frozen-source、utility、security | 0 | 按工作区 ID 与相对路径读取冻结源字节，路径越界直接拒绝。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [v2.ts](v2.ts.md) | src/review-workspace/v2.ts | review-workspace v2 契约：块与资源 Schema、条目显示定位、对照行约束，以及导出结果与锚点校验，要求每条用户批注的引文与前后文逐字对应。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.ts](adapters.ts.md) | src/review-workspace/adapters.ts | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [handoff.ts](handoff.ts.md) | src/review-workspace/handoff.ts | 校验浏览器导出的评审结果并把归属 Agent 必须澄清的问题分类为源已变更、需定位或可直接采纳三种状态。 |
| [revision-master-prepare.ts](revision-master-prepare.ts.md) | src/review-workspace/revision-master-prepare.ts | 准备 revision-master 独立评审工作台：只读执行包内投影命令、冻结源与图片、装配业务快照与定位关系、复核期间无变更后写出 workspace.json 与内嵌数据的 review.html。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assembleReviewWorkspace | 函数 | 127–157 | 把冻结源、块、资源与条目装配成 v2 工作区，按内容哈希派生 snapshot_id，并强制写入 researchspec-cli-only 的变更权威与默认 handoff 指引。 |
| captureReviewSources | 函数 | 23–56 | 把入口文件与相关源复制到 researchspec/ 之外的工作目录，逐个计算 SHA-256 并写出不可覆盖的 source-manifest.json，冻结本次评审的真实输入。 |
| compareReviewSources | 函数 | 58–74 | 重新读取当前源文件并与冻结清单比对，输出已变更或已缺失的路径列表。 |
| prepareRenderedImages | 函数 | 105–125 | 内嵌已获批准渲染产生的输出图片；这些资源标记为无源路径，与冻结源图片区分开。 |
| prepareReviewImages | 函数 | 84–102 | 把冻结集中的图片转成 base64 内嵌资源，要求图片已被捕获、类型受支持且不超过 10 MiB，并同时建立原路径与相对路径到资源 ID 的映射。 |
| readFrozenSource | 函数 | 76–78 | 按工作区 ID 与相对路径读取冻结源字节，路径越界直接拒绝。 |
