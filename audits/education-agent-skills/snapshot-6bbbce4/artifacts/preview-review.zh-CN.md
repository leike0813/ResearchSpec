# Education Agent Skills 正式 ingest 预览审阅

## 绑定

- Snapshot：`snapshot-6bbbce4`
- Revision：`6bbbce418f82e11044009c9f3b7373a354de5bd0`
- Audit SHA-256：`57b93c4668e6ca29fcb191e35cdea56e85ab0a7888b78256c6e64096422c6406`
- Evidence map SHA-256：`5d970cbb765a08f33444f6c9fcabcf4095e469e3fe1dc05730843fd2e7506fd2`
- Production policy SHA-256：`ecf28c3d3bd001384f91f6934c11b095e89313450c6ef1d9fc0934620a213e3f`
- License SHA-256：`f8366f5391f49974ea29b26f167b40f9c673714680666651c6fa047dc2314e4f`
- 完整树聚合 SHA-256：`4d42fa3190d1e45f4bafce8c06a539d6e41bdc86d380b2cafb230eb6892ad633`
- 当前审阅状态：`pending-human-review`

## 准入结果

- 审查 Skill：165
- 预览准入：136
- 固定排除：29
- 原创框架来源无法证明：19
- Sean Hu 独立授权缺失：10

## Evidence 适配

- declaration 总数：872
- 准入树中 unresolved frontmatter citation：360
- 正文标记单元：628
- 正文未实际使用、仅标 frontmatter 的 unresolved declaration：43

所有未标记 citation 仅完成书目身份核验，不代表 claim-support review。正文标记只使用 immutable audit 的作者/年份身份定位完整句、列表项、表格行或无法安全细分的段落；标记成对且不嵌套。

## 能力与安全

- 教师向：116
- 混合：7
- 学生向：13

转换只改变 frontmatter envelope，并插入 evidence、ResearchSpec authority、未成年人、隐私、学习分析、福祉及教育性 diagnosis 边界。完整上游 body、输入、输出、Prompt、示例和学生向交互保持不删减。所有 813 条 `chains_well_with` 仅为 advisory relationship，硬依赖为 0。

## 域预览

- `curriculum-and-pedagogy`：54
- `education-systems`：9
- `specialist-studies-in-education`：73

本次预览沿用既有三个教育域的成员关系；生产包保持上一次批准的版本。

## 人工门

生产转换必须由人工明确批准聚合 SHA-256
`4d42fa3190d1e45f4bafce8c06a539d6e41bdc86d380b2cafb230eb6892ad633`。批准前本次完整树及其绑定变更保持预览状态，不得切换生产包或生产 registry。
