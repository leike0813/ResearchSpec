
# docs/developer/runtime/diagrams/src/academic-paper-workflow.puml
所属分层：[文档与文档站层](../../../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime/diagrams/src](../../../../../../modules/docs/developer/runtime/diagrams/src.md)
<!-- node: file:docs/developer/runtime/diagrams/src/academic-paper-workflow.puml -->

PlantUML 时序图，描述论文撰写路线在普通输出与 revision_patch 两种分支下把交付物写到 researchspec/ 之外并更新 owning handoff。
源码：[docs/developer/runtime/diagrams/src/academic-paper-workflow.puml](../../../../../../../../docs/developer/runtime/diagrams/src/academic-paper-workflow.puml)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic-paper-reviewer-workflow.puml](academic-paper-reviewer-workflow.puml.md) | docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml | PlantUML 时序图，描述只读审阅路线：instructions profile → 人工确认 → start → reviewer 产出审阅报告并更新 handoff → Gate 裁定 → advance。 |
