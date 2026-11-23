# Education Agent Skills 正式 ingest 预览审阅

## 绑定

- Snapshot：`v3.1.0`
- Revision：`c0c82fb682001177b855576e45f27cc5e786e4c4`
- Audit SHA-256：`cb1f0416bf8da46a5218ec23f932f166366861c5b399bdbcf238e72a2da3d059`
- Evidence map SHA-256：`232168ab30d86329a60d0a3cf1024c6f947535aaea47c03e76592d2f4f12983f`
- Production policy SHA-256：`b8515dd494133c8cb0f2d2139b2e92dfa4afa2d6175b9aa501042dc8c81c81a2`
- License SHA-256：`f8366f5391f49974ea29b26f167b40f9c673714680666651c6fa047dc2314e4f`
- 完整树聚合 SHA-256：`3b473a920a815e10ada837e9f46f4990094a890e3e60bc4a4b9cae8e51d8671f`
- 当前审阅状态：`pending-human-review`

## 准入结果

- 审查 Skill：165
- 预览准入：136
- 固定排除：29
- 原创框架来源无法证明：19
- Sean Hu 独立授权缺失：10

## Evidence 适配

- declaration 总数：872
- 准入树中 unresolved frontmatter citation：358
- 正文标记单元：619
- 正文未实际使用、仅标 frontmatter 的 unresolved declaration：44

所有未标记 citation 仅完成书目身份核验，不代表 claim-support review。正文标记只使用 immutable audit 的作者/年份身份定位完整句、列表项、表格行或无法安全细分的段落；标记成对且不嵌套。

## 能力与安全

- 教师向：117
- 混合：6
- 学生向：13

转换只改变 frontmatter envelope，并插入 evidence、ResearchSpec authority、未成年人、隐私、学习分析、福祉及教育性 diagnosis 边界。完整上游 body、输入、输出、Prompt、示例和学生向交互保持不删减。所有 813 条 `chains_well_with` 仅为 advisory relationship，硬依赖为 0。

## 域预览

- `curriculum-and-pedagogy`：54
- `education-systems`：9
- `specialist-studies-in-education`：73

本次预览沿用既有三个教育域的成员关系；生产包保持上一次批准的版本。

## 人工门

生产转换必须由人工明确批准聚合 SHA-256
`3b473a920a815e10ada837e9f46f4990094a890e3e60bc4a4b9cae8e51d8671f`。批准前本次完整树及其绑定变更保持预览状态，不得切换生产包或生产 registry。
