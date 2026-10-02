
# src/cli/bin.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/bin.ts -->

CLI 可执行入口，调用 main 并把结果退出码写入 process.exitCode。
源码：[src/cli/bin.ts](../../../../../src/cli/bin.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [main.ts](main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [main.ts](main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |
