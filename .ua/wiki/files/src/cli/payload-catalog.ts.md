
# src/cli/payload-catalog.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/payload-catalog.ts -->

CLI payload 目录 SSOT：为每个命令声明输入形态、字段、约束与运行时 schema 引用，供帮助文本与 Agent 手册复用。
源码：[src/cli/payload-catalog.ts](../../../../../src/cli/payload-catalog.ts)

## 符号（1）
<!-- node: function:src/cli/payload-catalog.ts:getCliPayloadDefinition -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [getCliPayloadDefinition](../../../symbols/src/cli/payload-catalog.ts/getCliPayloadDefinition.md) | 函数 | 132–136 | 简单 | accessor、payload-catalog、validation、utility | 2 | 按命令 ID 取出 payload 定义，缺失即抛错。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-catalog.ts](command-catalog.ts.md) | src/cli/command-catalog.ts | CLI 命令目录 SSOT：声明 16 个顶层命令与 5 个 plugin 子命令的语法、分组、工作区要求、读写影响与选项，并据此注册 Commander 命令与帮助文本。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [getCliPayloadDefinition](../../../symbols/src/cli/payload-catalog.ts/getCliPayloadDefinition.md) | 函数 | 132–136 | 按命令 ID 取出 payload 定义，缺失即抛错。 |
