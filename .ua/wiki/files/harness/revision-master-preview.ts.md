
# harness/revision-master-preview.ts
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[harness](../../modules/harness.md)
<!-- node: file:harness/revision-master-preview.ts -->

用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。
源码：[harness/revision-master-preview.ts](../../../../harness/revision-master-preview.ts)

## 符号（1）
<!-- node: function:harness/revision-master-preview.ts:prepareRevisionMasterPreviews -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| prepareRevisionMasterPreviews | 函数 | 48–114 | 复杂 | orchestration、preview-harness、revision-master、sqlite | 0 | 按四个阶段交接生成 revision-master 预览页：用生产 schema 播种真实 SQLite，再经只读 workbench 投影和 prepareRevisionMasterReview 落成 HTML。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.ts](../src/review-workspace.ts.md) | src/review-workspace.ts | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |
| [revision-master-preview-data.ts](revision-master-preview-data.ts.md) | harness/revision-master-preview-data.ts | revision-master 预览的批准样例数据：把编辑信与两位审稿人的意见拆成 thread/原子批注/章节/计划/日志/回复，并同时产出可直接落盘的稿件文件与 revision-master.db 行数据。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace-preview.ts](review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| prepareRevisionMasterPreviews | 函数 | 48–114 | 按四个阶段交接生成 revision-master 预览页：用生产 schema 播种真实 SQLite，再经只读 workbench 投影和 prepareRevisionMasterReview 落成 HTML。 |
