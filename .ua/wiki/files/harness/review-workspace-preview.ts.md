
# harness/review-workspace-preview.ts
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[harness](../../modules/harness.md)
<!-- node: file:harness/review-workspace-preview.ts -->

维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。
源码：[harness/review-workspace-preview.ts](../../../../harness/review-workspace-preview.ts)

## 符号（2）
<!-- node: function:harness/review-workspace-preview.ts:renderReviewWorkspacePreview -->
<!-- node: function:harness/review-workspace-preview.ts:reviewWorkspacePreviewSamples -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| renderReviewWorkspacePreview | 函数 | 212–247 | 中等 | html-injection、preview-harness、serialization | 0 | 在静态工作台 HTML 的 </body> 前注入预览引导脚本：把样本 base64 编码后构造 File 并投喂给文件选择器，同时提供样例下拉切换。 |
| reviewWorkspacePreviewSamples | 函数 | 167–210 | 复杂 | factory、preview-harness、review-workspace | 0 | 为 7 个预览用例各构造一份完整工作台样本：排版正文走 pandoc AST，回退路径按空行切出原始来源片段，并按短语把批注项锚到具体块。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.ts](../src/review-workspace.ts.md) | src/review-workspace.ts | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |
| [revision-master-preview.ts](revision-master-preview.ts.md) | harness/revision-master-preview.ts | 用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.test.ts](../tests/review-workspace.test.ts.md) | tests/review-workspace.test.ts | v1 工作台与预览夹具的测试：适配器证据保真、结果覆盖全部条目、静态 HTML 的自包含性，以及预览样例确实走真实 v2 适配器。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| renderReviewWorkspacePreview | 函数 | 212–247 | 在静态工作台 HTML 的 </body> 前注入预览引导脚本：把样本 base64 编码后构造 File 并投喂给文件选择器，同时提供样例下拉切换。 |
| reviewWorkspacePreviewSamples | 函数 | 167–210 | 为 7 个预览用例各构造一份完整工作台样本：排版正文走 pandoc AST，回退路径按空行切出原始来源片段，并按短语把批注项锚到具体块。 |
