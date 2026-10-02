
# website/docs/cli/start.mdx
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[website/docs/cli](../../../../modules/website/docs/cli.md)
<!-- node: document:website/docs/cli/start.mdx -->

`researchspec start <profile-id|node-selector>` 的命令参考页（控制面组，需要工作区，写）：启动一个已确认的 root run 或一个经图授权的子运行：root profile 选择器需 --input 与 --confirmed-by，节点选择器继承父运行授权且拒绝 --confirmed-by。 页面给出选项表、输入字段形状与相关命令链接。
源码：[website/docs/cli/start.mdx](../../../../../../website/docs/cli/start.mdx)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli/status.mdx](status.mdx.md) | website/docs/cli/status.mdx | researchspec status 的站点文档：说明它读取最近的当前工作区并返回有界快照，属于控制面只读命令。 |
| [instructions.mdx](instructions.mdx.md) | website/docs/cli/instructions.mdx | `researchspec instructions <selector>` 的命令参考页（控制面组，需要工作区，只读）：按精确选择器返回操作契约：合法选择器、所需语义输入、执行策略与门禁条件，是 status → instructions → start/decide/advance 协议的第二步。 页面给出选项表、输入字段形状与相关命令链接。 |
