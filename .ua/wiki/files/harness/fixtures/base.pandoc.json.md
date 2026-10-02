
# harness/fixtures/base.pandoc.json
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[harness/fixtures](../../../modules/harness/fixtures.md)
<!-- node: config:harness/fixtures/base.pandoc.json -->

候选稿比较场景的原始稿 pandoc AST 夹具（pandoc-api-version 1.22，meta 声明 html 输出与标题“城市绿地与睡眠质量”），摘要段落含“显著改善”“证明……可以降低失眠风险”等因果化表述，用于验证改写对比预览。
源码：[harness/fixtures/base.pandoc.json](../../../../../harness/fixtures/base.pandoc.json)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [candidate.pandoc.json](candidate.pandoc.json.md) | harness/fixtures/candidate.pandoc.json | 与 base.pandoc.json 配对的改写后候选稿 AST 夹具：同样的 318 份问卷与关联估计，但措辞收敛为“较高绿地覆盖率与较好的自报睡眠评分相关”，并显式声明横断面资料不足以判断因果。 |
| [review-workspace-preview.ts](../review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
