
# src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow/graph-profiles](../../../../../modules/src/arsu-converter/workflow/graph-profiles.md)
<!-- node: file:src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts -->

同行评审图谱预设：panel 产出评审组配置后，specialist 与 da 并行评审，再汇入 editorial 判断与 review synthesis 汇总裁决。
源码：[src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts](../../../../../../../src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../../../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](index.ts.md) | src/arsu-converter/workflow/graph-profiles/index.ts | 图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。 |
