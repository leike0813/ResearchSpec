
# website/docs/installation.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[website/docs](../../../modules/website/docs.md)
<!-- node: document:website/docs/installation.md -->

安装指南：要求 Node.js >= 22，给出 pnpm/npm 全局安装与版本校验，解释以 `researchspec/` 为根的工作区约定与 `init` 的行为（拒绝非空目标）、工具选择矩阵（`--tools all/none/具体 ID`、`--delivery`、`--literature-adapters`）、Zotero Adapter 的 Zotero-Agents 前置条件、更新与卸载流程，并指向 doctor/check 排障。
源码：[website/docs/installation.md](../../../../../website/docs/installation.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [handoff.mdx](cli/handoff.mdx.md) | website/docs/cli/handoff.mdx | `researchspec handoff <run-selector>` 的命令参考页（上下文组，需要工作区，条件写入）：渲染或替换一个可直接编辑的 run handoff：inputs/outputs 角色描述符加可选 Markdown 正文，满足路径与角色唯一性约束。 页面给出选项表、输入字段形状与相关命令链接。 |
| [list.mdx](cli/list.mdx.md) | website/docs/cli/list.mdx | `researchspec list [type]` 的命令参考页（检查组，工作区可选，只读）：按集合类型列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持 --limit/--cursor 游标分页与仅用于 procedures 的 --query 词法检索。 页面给出选项表、输入字段形状与相关命令链接。 |
| [pack.mdx](cli/pack.mdx.md) | website/docs/cli/pack.mdx | `researchspec pack` 的命令参考页（上下文组，需要工作区，写）：生成确定性的有界 schema 2 上下文包，--output 必填 ZIP 路径，--scope 可限定为 specs/profiles/runs/changes/run:<id>/change:<id>。 页面给出选项表、输入字段形状与相关命令链接。 |
| [propose.mdx](cli/propose.mdx.md) | website/docs/cli/propose.mdx | `researchspec propose <change-id>` 的命令参考页（治理组，需要工作区，写）：创建一个可演化的项目变更文档包，--targets 指定可能变更含义的稳定 spec（project.md/sources.yaml/claims.yaml/manuscript.yaml），--with 可选 design、tasks、delta 文档。 页面给出选项表、输入字段形状与相关命令链接。 |
| [show.mdx](cli/show.mdx.md) | website/docs/cli/show.mdx | `researchspec show <selector>` 的命令参考页（检查组，工作区可选，只读）：显示一个精确的 procedure、profile、run、node、Gate、Decision、change、handoff 或 tool 条目详情。 页面给出选项表、输入字段形状与相关命令链接。 |
| [start.mdx](cli/start.mdx.md) | website/docs/cli/start.mdx | `researchspec start <profile-id\|node-selector>` 的命令参考页（控制面组，需要工作区，写）：启动一个已确认的 root run 或一个经图授权的子运行：root profile 选择器需 --input 与 --confirmed-by，节点选择器继承父运行授权且拒绝 --confirmed-by。 页面给出选项表、输入字段形状与相关命令链接。 |
