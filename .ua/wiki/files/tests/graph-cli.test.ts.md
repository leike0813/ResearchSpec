
# tests/graph-cli.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/graph-cli.test.ts -->

图谱 CLI 集成测试：在 schema 2 工作区上验证 status/check/doctor 只读路径，以及 start → instructions → advance 的节点闭环。
源码：[tests/graph-cli.test.ts](../../../../tests/graph-cli.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-workspace.ts](helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [graph.ts](../src/cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [minimal.ts](../src/arsu-converter/workflow/graph-profiles/minimal.ts.md) | src/arsu-converter/workflow/graph-profiles/minimal.ts | 最小图谱预设：复用 research-main 的节点集合但移除 rq-gate，节点 ID 收敛为 rq，入口路由指向 deep-research:quick。 |
| [types.ts](../src/cli/types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |
