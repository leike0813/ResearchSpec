
# src/cli/handlers/graph-plugins.ts
所属分层：[CLI 命令入口层](../../../../layers/cli.md)  
所属目录：[src/cli/handlers](../../../../modules/src/cli/handlers.md)
<!-- node: file:src/cli/handlers/graph-plugins.ts -->

plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。
源码：[src/cli/handlers/graph-plugins.ts](../../../../../../src/cli/handlers/graph-plugins.ts)

## 符号（5）
<!-- node: function:src/cli/handlers/graph-plugins.ts:handleGraphPluginInstall -->
<!-- node: function:src/cli/handlers/graph-plugins.ts:handleGraphPluginList -->
<!-- node: function:src/cli/handlers/graph-plugins.ts:handleGraphPluginShow -->
<!-- node: function:src/cli/handlers/graph-plugins.ts:handleGraphPluginUninstall -->
<!-- node: function:src/cli/handlers/graph-plugins.ts:handleGraphPluginUpdate -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| handleGraphPluginInstall | 函数 | 82–114 | 复杂 | cli-handler、plugins、projection、consent | 0 | 要求显式领域 ID 与非交互下的 --yes，把选定领域投影进当前工作区。 |
| handleGraphPluginList | 函数 | 42–66 | 中等 | cli-handler、plugins、listing、read-only | 0 | 列出可用领域插件及解析出的 Skill 与扩展数量，可按工作区已选过滤。 |
| handleGraphPluginShow | 函数 | 68–80 | 简单 | cli-handler、plugins、inspection、read-only | 0 | 输出单个领域插件的元数据、来源与解析结果，支持紧凑摘要模式。 |
| handleGraphPluginUninstall | 函数 | 116–144 | 中等 | cli-handler、plugins、projection、removal | 0 | 从工作区选择中移除领域并重新投影，未安装的 ID 直接报错。 |
| handleGraphPluginUpdate | 函数 | 146–174 | 中等 | cli-handler、plugins、projection、refresh | 0 | 刷新已安装领域，缺省时刷新全部，并先校验所选领域当前可用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [extensions.ts](../../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-delivery.ts](../../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-discover.ts](../../core/workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts | 图工作区发现：在向上查找基础上提供 require 变体，把缺失、旧格式与非法路径直接转为异常。 |
| [graph-workspace-index.ts](../../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [types.ts](../types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [main.ts](../main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| handleGraphPluginInstall | 函数 | 82–114 | 要求显式领域 ID 与非交互下的 --yes，把选定领域投影进当前工作区。 |
| handleGraphPluginList | 函数 | 42–66 | 列出可用领域插件及解析出的 Skill 与扩展数量，可按工作区已选过滤。 |
| handleGraphPluginShow | 函数 | 68–80 | 输出单个领域插件的元数据、来源与解析结果，支持紧凑摘要模式。 |
| handleGraphPluginUninstall | 函数 | 116–144 | 从工作区选择中移除领域并重新投影，未安装的 ID 直接报错。 |
| handleGraphPluginUpdate | 函数 | 146–174 | 刷新已安装领域，缺省时刷新全部，并先校验所选领域当前可用。 |
