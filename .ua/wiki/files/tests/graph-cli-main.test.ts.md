
# tests/graph-cli-main.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/graph-cli-main.test.ts -->

端到端验证编译后 CLI 的 init 与 update 行为、schema 2 拒绝 schema 1、handoff 消费、工具选择要求，以及 doctor 的只读入口诊断。
源码：[tests/graph-cli-main.test.ts](../../../../tests/graph-cli-main.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](helpers/cli.ts.md) | tests/helpers/cli.ts | CLI 测试夹具：用 spawnSync 运行编译产物、解析 envelope 响应，并创建与清理临时项目目录。 |
| [graph-bootstrap.ts](../src/cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [types.ts](../src/cli/types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |
