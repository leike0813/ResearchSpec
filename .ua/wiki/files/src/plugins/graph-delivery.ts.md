
# src/plugins/graph-delivery.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/graph-delivery.ts -->

把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。
源码：[src/plugins/graph-delivery.ts](../../../../../src/plugins/graph-delivery.ts)

## 符号（9）
<!-- node: function:src/plugins/graph-delivery.ts:planPluginProjection -->
<!-- node: function:src/plugins/graph-delivery.ts:planWorkspacePluginProjection -->
<!-- node: function:src/plugins/graph-delivery.ts:planWorkspacePluginTransaction -->
<!-- node: class:src/plugins/graph-delivery.ts:PluginProjectionError -->
<!-- node: function:src/plugins/graph-delivery.ts:PluginProjectionError -->
<!-- node: function:src/plugins/graph-delivery.ts:projectWorkspacePlugins -->
<!-- node: function:src/plugins/graph-delivery.ts:pushProjectionDiagnostic -->
<!-- node: function:src/plugins/graph-delivery.ts:removeEmptyProjectionDirectories -->
<!-- node: function:src/plugins/graph-delivery.ts:selectedDomainResolutionSnapshots -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [planPluginProjection](../../../symbols/src/plugins/graph-delivery.ts/planPluginProjection.md) | 函数 | 129–263 | 复杂 | plugin、delivery、projection、write-plan | 1 | 把插件域与扩展包展开为各工具 Skills 与 Profile 目录的写入计划，覆盖创建、刷新、退役移除与冲突诊断。 |
| planWorkspacePluginProjection | 函数 | 265–289 | 中等 | plugin、delivery、graph-workspace、projection | 0 | 面向工作区配置与安装清单组织完整投影计划，负责解析域选择、加载注册表并汇总诊断。 |
| planWorkspacePluginTransaction | 函数 | 291–346 | 复杂 | plugin、write-plan、transaction、rollback | 0 | 构造可整体回滚的插件投影事务，包含读前置条件、边界根、失败关闭的严格移除选项与安装清单更新。 |
| PluginProjectionError | 类 | 90–95 | 简单 | error-type、plugin、projection | 0 | 插件投影失败时抛出的错误类型，携带诊断码与目标路径。 |
| PluginProjectionError | 函数 | 90–95 | 简单 | error-type、plugin、projection | 0 | 插件投影失败时抛出的错误类型，携带诊断码与目标路径。 |
| [projectWorkspacePlugins](../../../symbols/src/plugins/graph-delivery.ts/projectWorkspacePlugins.md) | 函数 | 348–369 | 中等 | plugin、delivery、transaction、cleanup | 3 | 执行插件投影事务并清理因移除而变空的 Skill、capability 与投影目录。 |
| pushProjectionDiagnostic | 函数 | 371–399 | 中等 | plugin、diagnostics、utility | 0 | 按冲突或漂移类别收集投影诊断，避免同一目标重复报错。 |
| removeEmptyProjectionDirectories | 函数 | 409–426 | 中等 | plugin、cleanup、filesystem、boundary | 0 | 在移除受管文件后自底向上清理变空的投影目录，并受项目根边界限制。 |
| selectedDomainResolutionSnapshots | 函数 | 97–127 | 中等 | plugin、resolution、snapshot、projection | 0 | 为已选域生成稳定的域解析快照，并与既有快照、扩展包提供的技能集合合并去重。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [extensions.ts](extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-workspace-index.ts](../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](../core/contracts/graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [installations.ts](../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [path-boundary.ts](../core/workspace/path-boundary.ts.md) | src/core/workspace/path-boundary.ts | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [registry.ts](registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [tools.ts](../adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-context-cli.test.ts](../../tests/graph-context-cli.test.ts.md) | tests/graph-context-cli.test.ts | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [graph-plugins.ts](../cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [workspace-delivery.ts](../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [planPluginProjection](../../../symbols/src/plugins/graph-delivery.ts/planPluginProjection.md) | 函数 | 129–263 | 把插件域与扩展包展开为各工具 Skills 与 Profile 目录的写入计划，覆盖创建、刷新、退役移除与冲突诊断。 |
| planWorkspacePluginProjection | 函数 | 265–289 | 面向工作区配置与安装清单组织完整投影计划，负责解析域选择、加载注册表并汇总诊断。 |
| planWorkspacePluginTransaction | 函数 | 291–346 | 构造可整体回滚的插件投影事务，包含读前置条件、边界根、失败关闭的严格移除选项与安装清单更新。 |
| PluginProjectionError | 类 | 90–95 | 插件投影失败时抛出的错误类型，携带诊断码与目标路径。 |
| PluginProjectionError | 函数 | 90–95 | 插件投影失败时抛出的错误类型，携带诊断码与目标路径。 |
| [projectWorkspacePlugins](../../../symbols/src/plugins/graph-delivery.ts/projectWorkspacePlugins.md) | 函数 | 348–369 | 执行插件投影事务并清理因移除而变空的 Skill、capability 与投影目录。 |
| selectedDomainResolutionSnapshots | 函数 | 97–127 | 为已选域生成稳定的域解析快照，并与既有快照、扩展包提供的技能集合合并去重。 |
