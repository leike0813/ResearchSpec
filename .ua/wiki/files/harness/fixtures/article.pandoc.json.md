
# harness/fixtures/article.pandoc.json
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[harness/fixtures](../../../modules/harness/fixtures.md)
<!-- node: config:harness/fixtures/article.pandoc.json -->

文章修订场景的正文 AST 夹具：带完整标题与摘要段落，meta 为空对象，模拟 annotation-intake 流程中被逐句批注的稿件快照，用于生成冻结审阅工作台预览。
源码：[harness/fixtures/article.pandoc.json](../../../../../harness/fixtures/article.pandoc.json)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [base.pandoc.json](base.pandoc.json.md) | harness/fixtures/base.pandoc.json | 候选稿比较场景的原始稿 pandoc AST 夹具（pandoc-api-version 1.22，meta 声明 html 输出与标题“城市绿地与睡眠质量”），摘要段落含“显著改善”“证明……可以降低失眠风险”等因果化表述，用于验证改写对比预览。 |
| [review-workspace-preview.ts](../review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
