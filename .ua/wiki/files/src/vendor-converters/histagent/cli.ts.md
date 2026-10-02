
# src/vendor-converters/histagent/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: file:src/vendor-converters/histagent/cli.ts -->

HistAgent vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。
源码：[src/vendor-converters/histagent/cli.ts](../../../../../../src/vendor-converters/histagent/cli.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/histagent/cli.ts:findRepoRoot -->
<!-- node: function:src/vendor-converters/histagent/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findRepoRoot | 函数 | 25–36 | 简单 | utility、cli、路径解析 | 0 | 逐级向上查找 name 为 researchspec 的 package.json 以确定仓库根目录。 |
| main | 函数 | 10–23 | 简单 | entry-point、cli、参数解析 | 0 | 解析子命令与标志，定位仓库根后分派到 converter，并以退出码表示转换、检查或幂等性结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 10–23 | 解析子命令与标志，定位仓库根后分派到 converter，并以退出码表示转换、检查或幂等性结果。 |
