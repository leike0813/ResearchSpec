
# tests/education-agent-skills-extensions.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/education-agent-skills-extensions.test.ts -->

校验 Education Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。
源码：[tests/education-agent-skills-extensions.test.ts](../../../../tests/education-agent-skills-extensions.test.ts)

## 符号（1）
<!-- node: function:tests/education-agent-skills-extensions.test.ts:brief -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| brief | 函数 | 11–20 | 简单 | test、fixture、plugin-extension | 0 | 构造符合六个通用证据字段的扩展能力简报夹具，供图引擎运行校验使用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [extensions.ts](../src/plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
