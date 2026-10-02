
# src/cli/presenter.ts
所属分层：[CLI 命令入口层](../../../layers/cli.md)  
所属目录：[src/cli](../../../modules/src/cli.md)
<!-- node: file:src/cli/presenter.ts -->

统一呈现 CLI 结果：--json 时输出 schema 1 信封，否则输出人类可读 stdout/stderr。
源码：[src/cli/presenter.ts](../../../../../src/cli/presenter.ts)

## 符号（1）
<!-- node: function:src/cli/presenter.ts:presentResult -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| presentResult | 函数 | 3–22 | 简单 | output、formatting、json-envelope、cli | 1 | 按 json 开关输出 schema 1 信封，否则输出人类文本；quiet 仅抑制 stdout。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [main.ts](main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| presentResult | 函数 | 3–22 | 按 json 开关输出 schema 1 信封，否则输出人类文本；quiet 仅抑制 stdout。 |
