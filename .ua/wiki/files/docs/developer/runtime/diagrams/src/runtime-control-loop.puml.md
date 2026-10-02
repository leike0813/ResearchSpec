
# docs/developer/runtime/diagrams/src/runtime-control-loop.puml
所属分层：[文档与文档站层](../../../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime/diagrams/src](../../../../../../modules/docs/developer/runtime/diagrams/src.md)
<!-- node: file:docs/developer/runtime/diagrams/src/runtime-control-loop.puml -->

PlantUML 时序图，完整呈现 Procedure 发现（list/show/instructions）与受治理 graph 工作两条分支的 status→confirm→start→Gate→advance 控制环。
源码：[docs/developer/runtime/diagrams/src/runtime-control-loop.puml](../../../../../../../../docs/developer/runtime/diagrams/src/runtime-control-loop.puml)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [frontier-evaluation.dot](frontier-evaluation.dot.md) | docs/developer/runtime/diagrams/src/frontier-evaluation.dot | Graphviz 有向图，说明 profile、frozen run 控件、handoff 与 stable spec 汇入 workspace evaluator 推导出 current frontier，再供 status/instructions/history 视图读取。 |
