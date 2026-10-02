
# tests/graph-run-conflict.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/graph-run-conflict.test.ts -->

图谱运行冲突测试：验证扫描后出现的节点文件、扫描后被改动的节点文件、歧义重复节点实例均被拒绝，以及失败 Gate 的 override 记录在所属 Gate 内并解锁下游。
源码：[tests/graph-run-conflict.test.ts](../../../../tests/graph-run-conflict.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-run.ts](../src/core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-workspace-index.ts](../src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
