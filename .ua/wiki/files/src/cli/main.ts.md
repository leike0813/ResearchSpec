
# src/cli/main.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/main.ts -->

CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。
源码：[src/cli/main.ts](../../../../../src/cli/main.ts)

## 符号（2）
<!-- node: function:src/cli/main.ts:main -->
<!-- node: function:src/cli/main.ts:registerCommands -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 48–87 | 中等 | entry-point、cli、error-mapping、wiring | 0 | CLI 主流程：构建程序、按目录注册命令、把异常映射为 CliError 并统一呈现，处理 help/version 与用法错误。 |
| registerCommands | 函数 | 91–145 | 中等 | wiring、cli、registration、routing | 0 | 把命令目录与各 handler 绑定成 Commander 动作，decide 命令按选择器前缀分流到项目变更或图决策。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-catalog.ts](command-catalog.ts.md) | src/cli/command-catalog.ts | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [graph-bootstrap.ts](handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-context.ts](handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-plugins.ts](handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [graph.ts](handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [presenter.ts](presenter.ts.md) | src/cli/presenter.ts | 统一呈现 CLI 结果：--json 时输出 schema 1 信封，否则输出人类可读 stdout/stderr。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [types.ts](types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [bin.ts](bin.ts.md) | src/cli/bin.ts | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 48–87 | CLI 主流程：构建程序、按目录注册命令、把异常映射为 CliError 并统一呈现，处理 help/version 与用法错误。 |
