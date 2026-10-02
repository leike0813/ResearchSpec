
# src/cli/handlers/graph-bootstrap.ts
所属分层：[CLI 命令入口层](../../../../layers/cli.md)  
所属目录：[src/cli/handlers](../../../../modules/src/cli/handlers.md)
<!-- node: file:src/cli/handlers/graph-bootstrap.ts -->

init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。
源码：[src/cli/handlers/graph-bootstrap.ts](../../../../../../src/cli/handlers/graph-bootstrap.ts)

## 符号（5）
<!-- node: function:src/cli/handlers/graph-bootstrap.ts:applyGraphWorkspaceProjection -->
<!-- node: function:src/cli/handlers/graph-bootstrap.ts:handleGraphInit -->
<!-- node: function:src/cli/handlers/graph-bootstrap.ts:handleGraphUpdate -->
<!-- node: function:src/cli/handlers/graph-bootstrap.ts:selectLiteratureAdapters -->
<!-- node: function:src/cli/handlers/graph-bootstrap.ts:selectTools -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [applyGraphWorkspaceProjection](../../../../symbols/src/cli/handlers/graph-bootstrap.ts/applyGraphWorkspaceProjection.md) | 函数 | 37–98 | 复杂 | transaction、delivery、planning、bootstrap | 2 | 生成并提交整套工作区投影：校验既有清单、运行交付计划、写 config 与安装清单，冲突或阻塞诊断时整体放弃。 |
| handleGraphInit | 函数 | 100–119 | 中等 | cli-handler、init、bootstrap、user-flow | 0 | init 命令处理器：新建 schema 2 工作区并写入初始稳定 spec，或对既有当前工作区转入重配置。 |
| handleGraphUpdate | 函数 | 138–151 | 中等 | cli-handler、update、bootstrap、refresh | 0 | update 命令处理器：在既有工作区上按显式选项或当前配置重新投影生成文件。 |
| selectLiteratureAdapters | 函数 | 195–220 | 中等 | selection、interactive、literature-adapter、cli | 0 | 以同样优先级确定可选文献 Adapter 选择，并在非交互时保持既有配置。 |
| selectTools | 函数 | 162–193 | 中等 | selection、interactive、host-selection、cli | 0 | 解析 --tools 表达式、交互多选或按已配置/已探测回退确定宿主选择，失败统一转为 CliError。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs.ts](../../utils/fs.ts.md) | src/utils/fs.ts | 三个薄文件系统辅助：存在性判断、目录判断与可选文本读取，只把 ENOENT 视为正常缺失，其余错误照常抛出。 |
| [graph-workspace-index.ts](../../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](../../core/contracts/graph-workspace.ts.md) | src/core/contracts/graph-workspace.ts | schema 2 工作区的核心契约集合：config、稳定 spec、run、节点实例、handoff 与启动命令的 Zod schema，并提供 frontmatter 解析与渲染。 |
| [index.ts](../../literature-adapters/index.ts.md) | src/literature-adapters/index.ts | 文献适配器子系统的 barrel 入口，re-export catalog、assets、contracts、delivery、platform、provider-contracts 与 provider-policy 七个模块。 |
| [installations.ts](../../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [layout.ts](../../core/workspace/layout.ts.md) | src/core/workspace/layout.ts | 定义 schema "2" 工作区的目录骨架与模板文件（config.yaml、工具安装清单、specs 下的 project/sources/claims/manuscript），并把模板转换为可创建的目录与文件条目。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [searchable-multi-select.ts](../prompts/searchable-multi-select.ts.md) | src/cli/prompts/searchable-multi-select.ts | 基于 @inquirer/core 的可搜索多选交互提示，支持方向键、空格切换、回车确认与 Ctrl+C 取消，并标注 configured / detected 状态。 |
| [tools.ts](../../adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |
| [workspace-delivery.ts](../../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-cli-main.test.ts](../../../tests/graph-cli-main.test.ts.md) | tests/graph-cli-main.test.ts | 端到端验证编译后 CLI 的 init 与 update 行为、schema 2 拒绝 schema 1、handoff 消费、工具选择要求，以及 doctor 的只读入口诊断。 |
| [main.ts](../main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| handleGraphInit | 函数 | 100–119 | init 命令处理器：新建 schema 2 工作区并写入初始稳定 spec，或对既有当前工作区转入重配置。 |
| handleGraphUpdate | 函数 | 138–151 | update 命令处理器：在既有工作区上按显式选项或当前配置重新投影生成文件。 |
