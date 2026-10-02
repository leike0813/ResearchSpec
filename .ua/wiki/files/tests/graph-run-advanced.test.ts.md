
# tests/graph-run-advanced.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/graph-run-advanced.test.ts -->

图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。
源码：[tests/graph-run-advanced.test.ts](../../../../tests/graph-run-advanced.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic-pipeline.ts](../src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts | 端到端学术流水线图谱预设：以 subgraph 节点绑定 research-main 子图，另提供 mid-entry 入口、评审与修订重评审回路，以及 format、final-integrity 交付尾段。 |
| [capability-graph.ts](../src/core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [graph-run.ts](../src/core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-workspace-index.ts](../src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [research-main.ts](../src/arsu-converter/workflow/graph-profiles/research-main.ts.md) | src/arsu-converter/workflow/graph-profiles/research-main.ts | 研究主链图谱预设：research-question → rq-gate → methodology → literature → grading → synthesis → report 的线性研究流程，Gate 绑定在方法学与文献节点上。 |
