
# tests/capability-graph.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/capability-graph.test.ts -->

图谱契约测试：验证最小无环图谱通过、未知能力引用被诊断、重复节点 ID、repeatable 轮次角色约束、node_output 绑定来源要求、不可达节点诊断与修订轮模板选项解析。
源码：[tests/capability-graph.test.ts](../../../../tests/capability-graph.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../src/core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
