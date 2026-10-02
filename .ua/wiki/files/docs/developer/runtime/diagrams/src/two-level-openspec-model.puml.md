
# docs/developer/runtime/diagrams/src/two-level-openspec-model.puml
所属分层：[文档与文档站层](../../../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime/diagrams/src](../../../../../../modules/docs/developer/runtime/diagrams/src.md)
<!-- node: file:docs/developer/runtime/diagrams/src/two-level-openspec-model.puml -->

PlantUML 组件图，区分仓库开发层的 openspec specs/changes 与研究工作区的 researchspec specs/changes + 运行时，强调两层共享 current/proposed 分离但不共享生命周期权限。
源码：[docs/developer/runtime/diagrams/src/two-level-openspec-model.puml](../../../../../../../../docs/developer/runtime/diagrams/src/two-level-openspec-model.puml)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-change-lifecycle.puml](contract-change-lifecycle.puml.md) | docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml | PlantUML 活动图，分流稳定研究语义变更（change.md 接受后显式编辑 stable spec）与稿件操作（产出 researchspec/ 之外的 revision_patch）两条路径。 |
