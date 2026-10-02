
# CLI 命令入口层

Commander 驱动的十六个顶层命令入口，负责参数解析、交互式选择、presenter 渲染与 handbook 渲染，并向核心层派发唯一的写事务。
> 本页由知识图谱分层 `layer:cli` 生成，共 12 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [src/cli](../modules/src/cli.md) | 7 |
| [src/cli/handlers](../modules/src/cli/handlers.md) | 4 |
| [src/cli/prompts](../modules/src/cli/prompts.md) | 1 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [src/cli/bin.ts](../files/src/cli/bin.ts.md) | 文件 | — | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |
| [src/cli/command-catalog.ts](../files/src/cli/command-catalog.ts.md) | 文件 | — | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [src/cli/handbook.ts](../files/src/cli/handbook.ts.md) | 文件 | — | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
| [src/cli/handlers/graph-bootstrap.ts](../files/src/cli/handlers/graph-bootstrap.ts.md) | 文件 | — | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [src/cli/handlers/graph-context.ts](../files/src/cli/handlers/graph-context.ts.md) | 文件 | — | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [src/cli/handlers/graph-plugins.ts](../files/src/cli/handlers/graph-plugins.ts.md) | 文件 | — | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [src/cli/handlers/graph.ts](../files/src/cli/handlers/graph.ts.md) | 文件 | — | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [src/cli/main.ts](../files/src/cli/main.ts.md) | 文件 | — | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |
| [src/cli/payload-catalog.ts](../files/src/cli/payload-catalog.ts.md) | 文件 | — | CLI payload 目录 SSOT：为每个命令声明输入形态、字段、约束与运行时 schema 引用，供帮助文本与 Agent 手册复用。 |
| [src/cli/presenter.ts](../files/src/cli/presenter.ts.md) | 文件 | — | 统一呈现 CLI 结果：--json 时输出 schema 1 信封，否则输出人类可读 stdout/stderr。 |
| [src/cli/prompts/searchable-multi-select.ts](../files/src/cli/prompts/searchable-multi-select.ts.md) | 文件 | — | 基于 @inquirer/core 的可搜索多选交互提示，支持方向键、空格切换、回车确认与 Ctrl+C 取消，并标注 configured / detected 状态。 |
| [src/cli/types.ts](../files/src/cli/types.ts.md) | 文件 | — | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |

## 对其它分层的依赖

| 目标分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [核心契约与工作流运行时](core.md) | 20 | imports×20 |
| [能力与插件目录层](capability-registry.md) | 12 | imports×12 |
| [宿主与投递适配层](adapters.md) | 6 | imports×6 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 3 | imports×3 |
| [评审批注与静态工作台层](review-workspace.md) | 1 | imports×1 |

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [维护工具链与工程基础设施](tooling.md) | 9 | depends_on×5、configures×4 |
| [测试与验收夹具层](tests.md) | 8 | imports×8 |
| [宿主与投递适配层](adapters.md) | 2 | imports×2 |
