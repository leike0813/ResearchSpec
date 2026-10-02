
# website/docs/cli/decide.mdx
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[website/docs/cli](../../../../modules/website/docs/cli.md)
<!-- node: document:website/docs/cli/decide.mdx -->

`researchspec decide <selector>` 的命令参考页（治理组，需要工作区，写）：记录一次人工决定：项目变更结论（accept/reject/defer/supersede）、Gate 裁决（pass/pass_with_conditions/fail）、失败 Gate 的 --override，或本地 Decision 分支选择；选项组不可混用。 页面给出选项表、输入字段形状与相关命令链接。
源码：[website/docs/cli/decide.mdx](../../../../../../website/docs/cli/decide.mdx)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [archive.mdx](archive.mdx.md) | website/docs/cli/archive.mdx | `researchspec archive <change-id>` 的命令参考页（治理组，需要工作区，写）：归档一个已 apply、rejected、deferred 或 superseded 的项目变更。 页面给出选项表、输入字段形状与相关命令链接。 |
| [instructions.mdx](instructions.mdx.md) | website/docs/cli/instructions.mdx | `researchspec instructions <selector>` 的命令参考页（控制面组，需要工作区，只读）：按精确选择器返回操作契约：合法选择器、所需语义输入、执行策略与门禁条件，是 status → instructions → start/decide/advance 协议的第二步。 页面给出选项表、输入字段形状与相关命令链接。 |
| [show.mdx](show.mdx.md) | website/docs/cli/show.mdx | `researchspec show <selector>` 的命令参考页（检查组，工作区可选，只读）：显示一个精确的 procedure、profile、run、node、Gate、Decision、change、handoff 或 tool 条目详情。 页面给出选项表、输入字段形状与相关命令链接。 |
