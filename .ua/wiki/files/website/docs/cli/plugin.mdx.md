
# website/docs/cli/plugin.mdx
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[website/docs/cli](../../../../modules/website/docs/cli.md)
<!-- node: document:website/docs/cli/plugin.mdx -->

`researchspec plugin` 的命令参考页（领域 Skill组，工作区可选，条件写入）：领域 Skill 插件的父命令，本身不接收 payload，需选择一个 plugin 子命令。 页面给出选项表、输入字段形状与相关命令链接。
源码：[website/docs/cli/plugin.mdx](../../../../../../website/docs/cli/plugin.mdx)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [plugin-install.mdx](plugin-install.mdx.md) | website/docs/cli/plugin-install.mdx | `researchspec plugin install <plugin-ids...>` 的命令参考页（领域 Skill组，需要工作区，写）：把指定领域 ID 选择并投影进当前工作区，--summary 输出写计划影响；非交互执行还须全局 --yes。 页面给出选项表、输入字段形状与相关命令链接。 |
| [plugin-list.mdx](plugin-list.mdx.md) | website/docs/cli/plugin-list.mdx | `researchspec plugin list` 的命令参考页（领域 Skill组，工作区可选，只读）：列出捆绑的领域 Skill 插件，--installed 只显示工作区已选域，--summary 输出紧凑发现元数据。 页面给出选项表、输入字段形状与相关命令链接。 |
| [plugin-show.mdx](plugin-show.mdx.md) | website/docs/cli/plugin-show.mdx | `researchspec plugin show <plugin-id>` 的命令参考页（领域 Skill组，工作区可选，只读）：显示单个领域插件的元数据与来源信息，--summary 省略完整 provenance。 页面给出选项表、输入字段形状与相关命令链接。 |
| [plugin-uninstall.mdx](plugin-uninstall.mdx.md) | website/docs/cli/plugin-uninstall.mdx | `researchspec plugin uninstall <plugin-ids...>` 的命令参考页（领域 Skill组，需要工作区，写）：从当前工作区移除一个或多个已安装领域 ID。 页面给出选项表、输入字段形状与相关命令链接。 |
| [plugin-update.mdx](plugin-update.mdx.md) | website/docs/cli/plugin-update.mdx | `researchspec plugin update [plugin-ids...]` 的命令参考页（领域 Skill组，需要工作区，写）：刷新指定领域插件，省略 ID 时刷新全部已选域。 页面给出选项表、输入字段形状与相关命令链接。 |
