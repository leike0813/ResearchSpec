
# src/cli
> 目录聚合页：7 个文件、18 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/cli/bin.ts](../../files/src/cli/bin.ts.md) | 文件 | 0 | CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。 |
| [src/cli/command-catalog.ts](../../files/src/cli/command-catalog.ts.md) | 文件 | 5 | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |
| [src/cli/handbook.ts](../../files/src/cli/handbook.ts.md) | 文件 | 6 | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
| [src/cli/main.ts](../../files/src/cli/main.ts.md) | 文件 | 2 | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |
| [src/cli/payload-catalog.ts](../../files/src/cli/payload-catalog.ts.md) | 文件 | 1 | CLI payload 目录 SSOT：为每个命令声明输入形态、字段、约束与运行时 schema 引用，供帮助文本与 Agent 手册复用。 |
| [src/cli/presenter.ts](../../files/src/cli/presenter.ts.md) | 文件 | 1 | 统一呈现 CLI 结果：--json 时输出 schema 1 信封，否则输出人类可读 stdout/stderr。 |
| [src/cli/types.ts](../../files/src/cli/types.ts.md) | 文件 | 3 | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |

## 子目录
- [handlers](cli/handlers.md)、[prompts](cli/prompts.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/cli/handlers](cli/handlers.md) | 4 |
| [src/core/validation](core/validation.md) | 2 |
| [src/core/contracts](core/contracts.md) | 1 |
