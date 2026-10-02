
# tests/graph-workspace.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/graph-workspace.test.ts -->

图谱工作区索引测试：验证 schema 2 接受、schema 1 拒绝，空工作区加载，运行/冻结图谱/节点/handoff 扫描，以及冻结图谱哈希不符与未知、重复节点实例的诊断。
源码：[tests/graph-workspace.test.ts](../../../../tests/graph-workspace.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-workspace-index.ts](../src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
