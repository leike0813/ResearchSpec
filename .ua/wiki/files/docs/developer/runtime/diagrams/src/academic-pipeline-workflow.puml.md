
# docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml
所属分层：[文档与文档站层](../../../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime/diagrams/src](../../../../../../modules/docs/developer/runtime/diagrams/src.md)
<!-- node: file:docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml -->

PlantUML 活动图，呈现冻结 graph slice 下的研究→撰写→审阅→修订循环→格式化→最终完整性链，每个 Gate 都需人工确认。
源码：[docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml](../../../../../../../../docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic-pipeline-mid-entry.puml](academic-pipeline-mid-entry.puml.md) | docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml | PlantUML 活动图，枚举 pipeline 的中段入口：research、write、review、revision/re-review、format、final-integrity 各自要求的前置输入角色。 |
| [revision-round.puml](revision-round.puml.md) | docs/developer/runtime/diagrams/src/revision-round.puml | PlantUML 时序图，描述动态修订轮：启动 revision child 产出修订稿与回应、再启 re-review child 复核，由人工选择轮次结果并写入 Decision。 |
