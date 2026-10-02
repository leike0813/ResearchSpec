
# src/review-workspace.ts
所属分层：[核心契约与工作流运行时](../../layers/core.md)  
所属目录：[src](../../modules/src.md)
<!-- node: file:src/review-workspace.ts -->

交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。
源码：[src/review-workspace.ts](../../../../src/review-workspace.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [review-workspace-preview.ts](../harness/review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
| [review-workspace-v2.test.ts](../tests/review-workspace-v2.test.ts.md) | tests/review-workspace-v2.test.ts | review-workspace.v2 的测试：冻结来源比对、结果快照的锚点校验、三种投影适配器、块解析、宿主 LaTeX/HTML 转换与 handoff 状态判定。 |
| [review-workspace.test.ts](../tests/review-workspace.test.ts.md) | tests/review-workspace.test.ts | v1 工作台与预览夹具的测试：适配器证据保真、结果覆盖全部条目、静态 HTML 的自包含性，以及预览样例确实走真实 v2 适配器。 |
| [revision-master-preview-data.ts](../harness/revision-master-preview-data.ts.md) | harness/revision-master-preview-data.ts | revision-master 预览的批准样例数据：把编辑信与两位审稿人的意见拆成 thread/原子批注/章节/计划/日志/回复，并同时产出可直接落盘的稿件文件与 revision-master.db 行数据。 |
| [revision-master-preview.ts](../harness/revision-master-preview.ts.md) | harness/revision-master-preview.ts | 用生产路径生成 revision-master 工作台的四个阶段预览页：从生产 schema 建库、写样例文件，再经只读 workbench 投影和 prepareRevisionMasterReview 输出 HTML。 |
| [revision-master-workspace.test.ts](../tests/revision-master-workspace.test.ts.md) | tests/revision-master-workspace.test.ts | revision-master 评审工作区与结果的契约测试：验证多对多关系保留、断裂引用被拒、确认必须精确覆盖候选，以及来源变更与页面渲染失败的处理。 |
