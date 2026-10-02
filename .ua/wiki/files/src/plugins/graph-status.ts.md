
# src/plugins/graph-status.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/graph-status.ts -->

为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。
源码：[src/plugins/graph-status.ts](../../../../../src/plugins/graph-status.ts)

## 符号（1）
<!-- node: function:src/plugins/graph-status.ts:loadGraphPluginStatusView -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadGraphPluginStatusView | 函数 | 20–72 | 中等 | plugin、status、graph-workspace、read-only | 0 | 读取工作区配置与安装清单，加载插件与扩展注册表，产出 status 使用的插件视图。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [extensions.ts](extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-workspace-index.ts](../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [registry.ts](registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [status.ts](status.ts.md) | src/plugins/status.ts | 把插件配置与安装清单投影为 status 与 catalog 展示模型：域选择、解析快照、可用与已投影域，以及 Skill 级别的汇总条目。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| loadGraphPluginStatusView | 函数 | 20–72 | 读取工作区配置与安装清单，加载插件与扩展注册表，产出 status 使用的插件视图。 |
