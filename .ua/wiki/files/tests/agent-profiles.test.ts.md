
# tests/agent-profiles.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/agent-profiles.test.ts -->

校验 24 个 class-A 宿主上的两种受管 profile：50 个渲染文件的精确路径、角色契约、frontmatter/TOML/Vibe prompt 格式，以及不固定厂商模型的中立性。
源码：[tests/agent-profiles.test.ts](../../../../tests/agent-profiles.test.ts)

## 符号（1）
<!-- node: function:tests/agent-profiles.test.ts:parseTomlDocument -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseTomlDocument | 函数 | 184–206 | 中等 | test、parser、toml、helper | 0 | 为测试实现一个最小 TOML 文档解析器，用于校验渲染出的 profile 定义文件结构。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [agent-profiles.ts](../src/adapters/agent-profiles.ts.md) | src/adapters/agent-profiles.ts | 为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。 |
| [tools.ts](../src/adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
