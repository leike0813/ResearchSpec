
# website/docs/cli
> 目录聚合页：22 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [website/docs/cli/advance.mdx](../../../files/website/docs/cli/advance.mdx.md) | 文档 | 0 | `researchspec advance <node-selector>` 的命令参考页（控制面组，需要工作区，写）：校验并完成一个符合条件的图节点：按 --input 提交输出角色，独立于 Gate 确认推进进度，并联动写入祖先完成状态。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/archive.mdx](../../../files/website/docs/cli/archive.mdx.md) | 文档 | 0 | `researchspec archive <change-id>` 的命令参考页（治理组，需要工作区，写）：归档一个已 apply、rejected、deferred 或 superseded 的项目变更。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/check.mdx](../../../files/website/docs/cli/check.mdx.md) | 文档 | 0 | `researchspec check [target]` 的命令参考页（检查组，需要工作区，只读）：检查 schema 2 工作区契约：可选校验范围（specs/profiles/runs/changes/handoffs/tools/plugins/literature-adapters），--strict 把警告升级为失败。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/decide.mdx](../../../files/website/docs/cli/decide.mdx.md) | 文档 | 0 | `researchspec decide <selector>` 的命令参考页（治理组，需要工作区，写）：记录一次人工决定：项目变更结论（accept/reject/defer/supersede）、Gate 裁决（pass/pass_with_conditions/fail）、失败 Gate 的 --override，或本地 Decision 分支选择；选项组不可混用。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/doctor.mdx](../../../files/website/docs/cli/doctor.mdx.md) | 文档 | 0 | `researchspec doctor` 的命令参考页（恢复组，需要工作区，只读）：对当前工作区做完整只读诊断，报告归属损坏、不安全路径与生成漂移，不做任何修复。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/handoff.mdx](../../../files/website/docs/cli/handoff.mdx.md) | 文档 | 0 | `researchspec handoff <run-selector>` 的命令参考页（上下文组，需要工作区，条件写入）：渲染或替换一个可直接编辑的 run handoff：inputs/outputs 角色描述符加可选 Markdown 正文，满足路径与角色唯一性约束。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/index.mdx](../../../files/website/docs/cli/index.mdx.md) | 文档 | 0 | CLI 命令参考的目录首页，由类型化的公开 CLI catalog 自动生成（页面内注明禁止手改）。说明每页包含语法、选项、payload 形状、工作区要求、静态影响与相关命令，并指引运行时动态指令用 `researchspec instructions <selector> --json` 获取。 |
| [website/docs/cli/init.mdx](../../../files/website/docs/cli/init.mdx.md) | 文档 | 0 | `researchspec init [path]` 的命令参考页（引导组，无需工作区，写）：初始化或重新配置 ResearchSpec 工作区：写入 `researchspec/` 目录、安装唯一基础入口 researchspec-navigate，并按 --tools/--delivery/--literature-adapters 投影 Agent 表面。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/instructions.mdx](../../../files/website/docs/cli/instructions.mdx.md) | 文档 | 0 | `researchspec instructions <selector>` 的命令参考页（控制面组，需要工作区，只读）：按精确选择器返回操作契约：合法选择器、所需语义输入、执行策略与门禁条件，是 status → instructions → start/decide/advance 协议的第二步。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/list.mdx](../../../files/website/docs/cli/list.mdx.md) | 文档 | 0 | `researchspec list [type]` 的命令参考页（检查组，工作区可选，只读）：按集合类型列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持 --limit/--cursor 游标分页与仅用于 procedures 的 --query 词法检索。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/pack.mdx](../../../files/website/docs/cli/pack.mdx.md) | 文档 | 0 | `researchspec pack` 的命令参考页（上下文组，需要工作区，写）：生成确定性的有界 schema 2 上下文包，--output 必填 ZIP 路径，--scope 可限定为 specs/profiles/runs/changes/run:<id>/change:<id>。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-install.mdx](../../../files/website/docs/cli/plugin-install.mdx.md) | 文档 | 0 | `researchspec plugin install <plugin-ids...>` 的命令参考页（领域 Skill组，需要工作区，写）：把指定领域 ID 选择并投影进当前工作区，--summary 输出写计划影响；非交互执行还须全局 --yes。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-list.mdx](../../../files/website/docs/cli/plugin-list.mdx.md) | 文档 | 0 | `researchspec plugin list` 的命令参考页（领域 Skill组，工作区可选，只读）：列出捆绑的领域 Skill 插件，--installed 只显示工作区已选域，--summary 输出紧凑发现元数据。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-show.mdx](../../../files/website/docs/cli/plugin-show.mdx.md) | 文档 | 0 | `researchspec plugin show <plugin-id>` 的命令参考页（领域 Skill组，工作区可选，只读）：显示单个领域插件的元数据与来源信息，--summary 省略完整 provenance。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-uninstall.mdx](../../../files/website/docs/cli/plugin-uninstall.mdx.md) | 文档 | 0 | `researchspec plugin uninstall <plugin-ids...>` 的命令参考页（领域 Skill组，需要工作区，写）：从当前工作区移除一个或多个已安装领域 ID。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-update.mdx](../../../files/website/docs/cli/plugin-update.mdx.md) | 文档 | 0 | `researchspec plugin update [plugin-ids...]` 的命令参考页（领域 Skill组，需要工作区，写）：刷新指定领域插件，省略 ID 时刷新全部已选域。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin.mdx](../../../files/website/docs/cli/plugin.mdx.md) | 文档 | 0 | `researchspec plugin` 的命令参考页（领域 Skill组，工作区可选，条件写入）：领域 Skill 插件的父命令，本身不接收 payload，需选择一个 plugin 子命令。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/propose.mdx](../../../files/website/docs/cli/propose.mdx.md) | 文档 | 0 | `researchspec propose <change-id>` 的命令参考页（治理组，需要工作区，写）：创建一个可演化的项目变更文档包，--targets 指定可能变更含义的稳定 spec（project.md/sources.yaml/claims.yaml/manuscript.yaml），--with 可选 design、tasks、delta 文档。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/show.mdx](../../../files/website/docs/cli/show.mdx.md) | 文档 | 0 | `researchspec show <selector>` 的命令参考页（检查组，工作区可选，只读）：显示一个精确的 procedure、profile、run、node、Gate、Decision、change、handoff 或 tool 条目详情。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/start.mdx](../../../files/website/docs/cli/start.mdx.md) | 文档 | 0 | `researchspec start <profile-id\|node-selector>` 的命令参考页（控制面组，需要工作区，写）：启动一个已确认的 root run 或一个经图授权的子运行：root profile 选择器需 --input 与 --confirmed-by，节点选择器继承父运行授权且拒绝 --confirmed-by。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/status.mdx](../../../files/website/docs/cli/status.mdx.md) | 文档 | 0 | researchspec status 的站点文档：说明它读取最近的当前工作区并返回有界快照，属于控制面只读命令。 |
| [website/docs/cli/update.mdx](../../../files/website/docs/cli/update.mdx.md) | 文档 | 0 | researchspec update 的站点文档：列出 --tools、--delivery 与 --literature-adapters 三个可选项及其取值含义，属于引导类的写操作。 |
