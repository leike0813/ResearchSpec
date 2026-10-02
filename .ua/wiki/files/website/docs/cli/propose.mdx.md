
# website/docs/cli/propose.mdx
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[website/docs/cli](../../../../modules/website/docs/cli.md)
<!-- node: document:website/docs/cli/propose.mdx -->

`researchspec propose <change-id>` 的命令参考页（治理组，需要工作区，写）：创建一个可演化的项目变更文档包，--targets 指定可能变更含义的稳定 spec（project.md/sources.yaml/claims.yaml/manuscript.yaml），--with 可选 design、tasks、delta 文档。 页面给出选项表、输入字段形状与相关命令链接。
源码：[website/docs/cli/propose.mdx](../../../../../../website/docs/cli/propose.mdx)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.mdx](check.mdx.md) | website/docs/cli/check.mdx | `researchspec check [target]` 的命令参考页（检查组，需要工作区，只读）：检查 schema 2 工作区契约：可选校验范围（specs/profiles/runs/changes/handoffs/tools/plugins/literature-adapters），--strict 把警告升级为失败。 页面给出选项表、输入字段形状与相关命令链接。 |
| [decide.mdx](decide.mdx.md) | website/docs/cli/decide.mdx | `researchspec decide <selector>` 的命令参考页（治理组，需要工作区，写）：记录一次人工决定：项目变更结论（accept/reject/defer/supersede）、Gate 裁决（pass/pass_with_conditions/fail）、失败 Gate 的 --override，或本地 Decision 分支选择；选项组不可混用。 页面给出选项表、输入字段形状与相关命令链接。 |
| [show.mdx](show.mdx.md) | website/docs/cli/show.mdx | `researchspec show <selector>` 的命令参考页（检查组，工作区可选，只读）：显示一个精确的 procedure、profile、run、node、Gate、Decision、change、handoff 或 tool 条目详情。 页面给出选项表、输入字段形状与相关命令链接。 |
