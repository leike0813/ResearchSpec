
# src/arsu-converter/workflow/graph-profiles/index.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow/graph-profiles](../../../../../modules/src/arsu-converter/workflow/graph-profiles.md)
<!-- node: file:src/arsu-converter/workflow/graph-profiles/index.ts -->

图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。
源码：[src/arsu-converter/workflow/graph-profiles/index.ts](../../../../../../../src/arsu-converter/workflow/graph-profiles/index.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic-paper-reviewer.ts](academic-paper-reviewer.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts | 同行评审图谱预设：panel 产出评审组配置后，specialist 与 da 并行评审，再汇入 editorial 判断与 review synthesis 汇总裁决。 |
| [academic-paper.ts](academic-paper.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-paper.ts | 论文写作图谱预设：intake → structure → argument → draft → cite-check → paper-gate → abstract 的主链，并提供独立可入口的 format 渲染节点。 |
| [academic-pipeline.ts](academic-pipeline.ts.md) | src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts | 端到端学术流水线图谱预设：以 subgraph 节点绑定 research-main 子图，另提供 mid-entry 入口、评审与修订重评审回路，以及 format、final-integrity 交付尾段。 |
| [capability-graph.ts](../../../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [minimal.ts](minimal.ts.md) | src/arsu-converter/workflow/graph-profiles/minimal.ts | 最小图谱预设：复用 research-main 的节点集合但移除 rq-gate，节点 ID 收敛为 rq，入口路由指向 deep-research:quick。 |
| [paper-humanizer.ts](paper-humanizer.ts.md) | src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts | 论文人性化润色图谱预设：review 节点产出评审报告与修订计划，经 plan-gate 与 plan-decision 确认后进入按轮次执行的修订阶段。 |
| [research-main.ts](research-main.ts.md) | src/arsu-converter/workflow/graph-profiles/research-main.ts | 研究主链图谱预设：research-question → rq-gate → methodology → literature → grading → synthesis → report 的线性研究流程，Gate 绑定在方法学与文献节点上。 |
| [review-response.ts](review-response.ts.md) | src/arsu-converter/workflow/graph-profiles/review-response.ts | 审稿回复图谱预设：解析稿件与评审意见、原子化评论并生成整体工作板，再按修订轮模板循环执行修订与响应，直至 Decision 选定退出。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [generate.ts](../generate.ts.md) | src/arsu-converter/workflow/generate.ts | 预设图谱生成器：把 converter 内置的 authored 图谱投影为工作区 profiles/ 目录下的 YAML 文件与 registry.json，并按投影内容计算 SHA-256。 |
| [preset-graphs.test.ts](../../../../tests/preset-graphs.test.ts.md) | tests/preset-graphs.test.ts | 预设图谱测试：验证 research-main 预设可解析且节点全部可达、Gate 与前置绑定正确，converter 自有注册表与打包投影一致，minimal/writing/reviewer/pipeline 预设保留声明的 handoff 物化交接。 |
