
# src/arsu-converter/workflow/graph-profiles
> 目录聚合页：8 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/academic-paper-reviewer.ts.md) | 文件 | 0 | 同行评审图谱预设：panel 产出评审组配置后，specialist 与 da 并行评审，再汇入 editorial 判断与 review synthesis 汇总裁决。 |
| [src/arsu-converter/workflow/graph-profiles/academic-paper.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/academic-paper.ts.md) | 文件 | 0 | 论文写作图谱预设：intake → structure → argument → draft → cite-check → paper-gate → abstract 的主链，并提供独立可入口的 format 渲染节点。 |
| [src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/academic-pipeline.ts.md) | 文件 | 0 | 端到端学术流水线图谱预设：以 subgraph 节点绑定 research-main 子图，另提供 mid-entry 入口、评审与修订重评审回路，以及 format、final-integrity 交付尾段。 |
| [src/arsu-converter/workflow/graph-profiles/index.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/index.ts.md) | 文件 | 0 | 图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。 |
| [src/arsu-converter/workflow/graph-profiles/minimal.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/minimal.ts.md) | 文件 | 0 | 最小图谱预设：复用 research-main 的节点集合但移除 rq-gate，节点 ID 收敛为 rq，入口路由指向 deep-research:quick。 |
| [src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts.md) | 文件 | 0 | 论文人性化润色图谱预设：review 节点产出评审报告与修订计划，经 plan-gate 与 plan-decision 确认后进入按轮次执行的修订阶段。 |
| [src/arsu-converter/workflow/graph-profiles/research-main.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/research-main.ts.md) | 文件 | 0 | 研究主链图谱预设：research-question → rq-gate → methodology → literature → grading → synthesis → report 的线性研究流程，Gate 绑定在方法学与文献节点上。 |
| [src/arsu-converter/workflow/graph-profiles/review-response.ts](../../../../files/src/arsu-converter/workflow/graph-profiles/review-response.ts.md) | 文件 | 0 | 审稿回复图谱预设：解析稿件与评审意见、原子化评论并生成整体工作板，再按修订轮模板循环执行修订与响应，直至 Decision 选定退出。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/contracts](../../core/contracts.md) | 8 |
