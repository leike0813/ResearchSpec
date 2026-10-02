
# tests/review-workspace.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/review-workspace.test.ts -->

v1 工作台与预览夹具的测试：适配器证据保真、结果覆盖全部条目、静态 HTML 的自包含性，以及预览样例确实走真实 v2 适配器。
源码：[tests/review-workspace.test.ts](../../../../tests/review-workspace.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [annotation-intake.ts](../src/annotation-intake.ts.md) | src/annotation-intake.ts | 批注接收（annotation intake）子系统的 barrel 入口，向上重导出 contracts、session、sources、review-copy、review-delta 与 interpretation 全部公开接口。 |
| [markdown-blocks.ts](../src/arsu-converter/revision/markdown-blocks.ts.md) | src/arsu-converter/revision/markdown-blocks.ts | 带 ResearchSpec 块标记的 Markdown 解析底座：切分与定位锚定块、计算块哈希、判定正文起点、提取章节标题，并提供共享 sha256。 |
| [review-workspace-preview.ts](../harness/review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
| [review-workspace.ts](../src/review-workspace.ts.md) | src/review-workspace.ts | 交互式审阅工作台子系统的 barrel 入口，向上重导出 v1/v2 工作台、适配器、结果契约与冻结来源投影接口。 |
