
# tests/tooluniverse-extensions.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/tooluniverse-extensions.test.ts -->

校验 ToolUniverse 扩展注册表与三十个域分配的完整性，并让代表性扩展 profile 跑通图引擎。
源码：[tests/tooluniverse-extensions.test.ts](../../../../tests/tooluniverse-extensions.test.ts)

## 符号（1）
<!-- node: function:tests/tooluniverse-extensions.test.ts:brief -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| brief | 函数 | 11–20 | 简单 | test、fixture、plugin-extension | 0 | 构造 ToolUniverse 扩展能力的简报夹具，用于代表 profile 的图引擎执行校验。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [extensions.ts](../src/plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
