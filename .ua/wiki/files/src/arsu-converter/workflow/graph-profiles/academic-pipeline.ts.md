
# src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow/graph-profiles](../../../../../modules/src/arsu-converter/workflow/graph-profiles.md)
<!-- node: file:src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts -->

端到端学术流水线图谱预设：以 subgraph 节点绑定 research-main 子图，另提供 mid-entry 入口、评审与修订重评审回路，以及 format、final-integrity 交付尾段。
源码：[src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts](../../../../../../../src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../../../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-run-advanced.test.ts](../../../../tests/graph-run-advanced.test.ts.md) | tests/graph-run-advanced.test.ts | 图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。 |
| [index.ts](index.ts.md) | src/arsu-converter/workflow/graph-profiles/index.ts | 图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。 |
