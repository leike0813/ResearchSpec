
# harness/fixtures
> 目录聚合页：3 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [harness/fixtures/article.pandoc.json](../../files/harness/fixtures/article.pandoc.json.md) | 配置 | 0 | 文章修订场景的正文 AST 夹具：带完整标题与摘要段落，meta 为空对象，模拟 annotation-intake 流程中被逐句批注的稿件快照，用于生成冻结审阅工作台预览。 |
| [harness/fixtures/base.pandoc.json](../../files/harness/fixtures/base.pandoc.json.md) | 配置 | 0 | 候选稿比较场景的原始稿 pandoc AST 夹具（pandoc-api-version 1.22，meta 声明 html 输出与标题“城市绿地与睡眠质量”），摘要段落含“显著改善”“证明……可以降低失眠风险”等因果化表述，用于验证改写对比预览。 |
| [harness/fixtures/candidate.pandoc.json](../../files/harness/fixtures/candidate.pandoc.json.md) | 配置 | 0 | 与 base.pandoc.json 配对的改写后候选稿 AST 夹具：同样的 318 份问卷与关联估计，但措辞收敛为“较高绿地覆盖率与较好的自报睡眠评分相关”，并显式声明横断面资料不足以判断因果。 |
