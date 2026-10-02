
# src/arsu-converter/workflow/graph-profiles/minimal.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow/graph-profiles](../../../../../modules/src/arsu-converter/workflow/graph-profiles.md)
<!-- node: file:src/arsu-converter/workflow/graph-profiles/minimal.ts -->

最小图谱预设：复用 research-main 的节点集合但移除 rq-gate，节点 ID 收敛为 rq，入口路由指向 deep-research:quick。
源码：[src/arsu-converter/workflow/graph-profiles/minimal.ts](../../../../../../../src/arsu-converter/workflow/graph-profiles/minimal.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../../../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [research-main.ts](research-main.ts.md) | src/arsu-converter/workflow/graph-profiles/research-main.ts | 研究主链图谱预设：research-question → rq-gate → methodology → literature → grading → synthesis → report 的线性研究流程，Gate 绑定在方法学与文献节点上。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-cli.test.ts](../../../../tests/graph-cli.test.ts.md) | tests/graph-cli.test.ts | 图谱 CLI 集成测试：在 schema 2 工作区上验证 status/check/doctor 只读路径，以及 start → instructions → advance 的节点闭环。 |
| [index.ts](index.ts.md) | src/arsu-converter/workflow/graph-profiles/index.ts | 图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。 |
