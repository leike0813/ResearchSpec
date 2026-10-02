
# src/vendor-converters/tooluniverse/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/tooluniverse](../../../../modules/src/vendor-converters/tooluniverse.md)
<!-- node: file:src/vendor-converters/tooluniverse/cli.ts -->

ToolUniverse 转换器的命令行薄封装，向上游定位仓库根后分派 convert / check / idempotence 三个子命令。
源码：[src/vendor-converters/tooluniverse/cli.ts](../../../../../../src/vendor-converters/tooluniverse/cli.ts)

## 符号（1）
<!-- node: function:src/vendor-converters/tooluniverse/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 10–23 | 中等 | cli、entry-point、dispatch | 0 | 解析子命令与 --force/--dry-run/--json 参数，调用对应转换器函数并以 JSON 或人类可读形式返回退出码。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 10–23 | 解析子命令与 --force/--dry-run/--json 参数，调用对应转换器函数并以 JSON 或人类可读形式返回退出码。 |
