
# harness/revision-master-preview-data.ts
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[harness](../../modules/harness.md)
<!-- node: file:harness/revision-master-preview-data.ts -->

revision-master 预览的批准样例数据：把编辑信与两位审稿人的意见拆成 thread/原子批注/章节/计划/日志/回复，并同时产出可直接落盘的稿件文件与 revision-master.db 行数据。
源码：[harness/revision-master-preview-data.ts](../../../../harness/revision-master-preview-data.ts)

## 符号（1）
<!-- node: function:harness/revision-master-preview-data.ts:buildRevisionMasterPreviewCase -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [buildRevisionMasterPreviewCase](../../symbols/harness/revision-master-preview-data.ts/buildRevisionMasterPreviewCase.md) | 函数 | 264–438 | 复杂 | factory、fixture-data、revision-master、sqlite | 1 | 由同一组审稿意见常量推导出 in_progress 与 complete 两种预览用例：写出稿件、补充材料、CSV 与回复信文件，并生成 workbench 需要的数据库行。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace.ts](../src/review-workspace.ts.md) | src/review-workspace.ts | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [revision-master-preview.ts](revision-master-preview.ts.md) | harness/revision-master-preview.ts | 用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [buildRevisionMasterPreviewCase](../../symbols/harness/revision-master-preview-data.ts/buildRevisionMasterPreviewCase.md) | 函数 | 264–438 | 由同一组审稿意见常量推导出 in_progress 与 complete 两种预览用例：写出稿件、补充材料、CSV 与回复信文件，并生成 workbench 需要的数据库行。 |
