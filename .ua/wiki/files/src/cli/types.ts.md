
# src/cli/types.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/types.ts -->

CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。
源码：[src/cli/types.ts](../../../../../src/cli/types.ts)

## 符号（3）
<!-- node: class:src/cli/types.ts:CliError -->
<!-- node: function:src/cli/types.ts:failure -->
<!-- node: function:src/cli/types.ts:success -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| CliError | 类 | 44–56 | 简单 | error-contract、cli、result、class | 0 | CLI 错误类型，同时携带机器可读 code、退出码、提示、细节与校验违规列表。 |
| failure | 函数 | 67–76 | 简单 | factory、result、error-contract、cli | 0 | 由 CliError 构造失败结果，并把消息与提示写入人类可读 stderr。 |
| success | 函数 | 58–65 | 简单 | factory、result、cli、utility | 0 | 构造成功 CommandResult，退出码固定为 0。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-bootstrap.ts](handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-cli-main.test.ts](../../tests/graph-cli-main.test.ts.md) | tests/graph-cli-main.test.ts | 端到端验证编译后 CLI 的 init 与 update 行为、schema 2 拒绝 schema 1、handoff 消费、工具选择要求，以及 doctor 的只读入口诊断。 |
| [graph-cli.test.ts](../../tests/graph-cli.test.ts.md) | tests/graph-cli.test.ts | 图谱 CLI 集成测试：在 schema 2 工作区上验证 status/check/doctor 只读路径，以及 start → instructions → advance 的节点闭环。 |
| [graph-context.ts](handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-plugins.ts](handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [graph.ts](handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [main.ts](main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |
| [presenter.ts](presenter.ts.md) | src/cli/presenter.ts | 统一呈现 CLI 结果：--json 时输出 schema 1 信封，否则输出人类可读 stdout/stderr。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| CliError | 类 | 44–56 | CLI 错误类型，同时携带机器可读 code、退出码、提示、细节与校验违规列表。 |
| failure | 函数 | 67–76 | 由 CliError 构造失败结果，并把消息与提示写入人类可读 stderr。 |
| success | 函数 | 58–65 | 构造成功 CommandResult，退出码固定为 0。 |
