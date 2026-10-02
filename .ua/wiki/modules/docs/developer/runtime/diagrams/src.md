
# docs/developer/runtime/diagrams/src
> 目录聚合页：11 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml](../../../../../files/docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml.md) | 文件 | 0 | PlantUML 时序图，描述只读审阅路线：instructions profile → 人工确认 → start → reviewer 产出审阅报告并更新 handoff → Gate 裁定 → advance。 |
| [docs/developer/runtime/diagrams/src/academic-paper-workflow.puml](../../../../../files/docs/developer/runtime/diagrams/src/academic-paper-workflow.puml.md) | 文件 | 0 | PlantUML 时序图，描述论文撰写路线在普通输出与 revision_patch 两种分支下把交付物写到 researchspec/ 之外并更新 owning handoff。 |
| [docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml](../../../../../files/docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml.md) | 文件 | 0 | PlantUML 活动图，枚举 pipeline 的中段入口：research、write、review、revision/re-review、format、final-integrity 各自要求的前置输入角色。 |
| [docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml](../../../../../files/docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml.md) | 文件 | 0 | PlantUML 活动图，呈现冻结 graph slice 下的研究→撰写→审阅→修订循环→格式化→最终完整性链，每个 Gate 都需人工确认。 |
| [docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml](../../../../../files/docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml.md) | 文件 | 0 | PlantUML 活动图，分流稳定研究语义变更（change.md 接受后显式编辑 stable spec）与稿件操作（产出 researchspec/ 之外的 revision_patch）两条路径。 |
| [docs/developer/runtime/diagrams/src/deep-research-workflow.puml](../../../../../files/docs/developer/runtime/diagrams/src/deep-research-workflow.puml.md) | 文件 | 0 | PlantUML 时序图，描述 deep-research 路线的 profile 确认、run.yaml/graph.yaml/handoff.md 落盘、外部研究输出与可选 formal Gate 的裁定。 |
| [docs/developer/runtime/diagrams/src/frontier-evaluation.dot](../../../../../files/docs/developer/runtime/diagrams/src/frontier-evaluation.dot.md) | 文件 | 0 | Graphviz 有向图，说明 profile、frozen run 控件、handoff 与 stable spec 汇入 workspace evaluator 推导出 current frontier，再供 status/instructions/history 视图读取。 |
| [docs/developer/runtime/diagrams/src/revision-round.puml](../../../../../files/docs/developer/runtime/diagrams/src/revision-round.puml.md) | 文件 | 0 | PlantUML 时序图，描述动态修订轮：启动 revision child 产出修订稿与回应、再启 re-review child 复核，由人工选择轮次结果并写入 Decision。 |
| [docs/developer/runtime/diagrams/src/runtime-control-loop.puml](../../../../../files/docs/developer/runtime/diagrams/src/runtime-control-loop.puml.md) | 文件 | 0 | PlantUML 时序图，完整呈现 Procedure 发现（list/show/instructions）与受治理 graph 工作两条分支的 status→confirm→start→Gate→advance 控制环。 |
| [docs/developer/runtime/diagrams/src/system-architecture.puml](../../../../../files/docs/developer/runtime/diagrams/src/system-architecture.puml.md) | 文件 | 0 | PlantUML 组件图，把语义面（4 ARSU、4 Companion、7 Zotero Adapter、可选领域技能）、确定性控制面（16 命令 CLI 与 workspace scanner）、文件层与构建期转换器分层。 |
| [docs/developer/runtime/diagrams/src/two-level-openspec-model.puml](../../../../../files/docs/developer/runtime/diagrams/src/two-level-openspec-model.puml.md) | 文件 | 0 | PlantUML 组件图，区分仓库开发层的 openspec specs/changes 与研究工作区的 researchspec specs/changes + 运行时，强调两层共享 current/proposed 分离但不共享生命周期权限。 |
