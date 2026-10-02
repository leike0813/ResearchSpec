
# docs/developer/runtime/diagrams/src/system-architecture.puml
所属分层：[文档与文档站层](../../../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime/diagrams/src](../../../../../../modules/docs/developer/runtime/diagrams/src.md)
<!-- node: file:docs/developer/runtime/diagrams/src/system-architecture.puml -->

PlantUML 组件图，把语义面（4 ARSU、4 Companion、7 Zotero Adapter、可选领域技能）、确定性控制面（16 命令 CLI 与 workspace scanner）、文件层与构建期转换器分层。
源码：[docs/developer/runtime/diagrams/src/system-architecture.puml](../../../../../../../../docs/developer/runtime/diagrams/src/system-architecture.puml)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [runtime-control-loop.puml](runtime-control-loop.puml.md) | docs/developer/runtime/diagrams/src/runtime-control-loop.puml | PlantUML 时序图，完整呈现 Procedure 发现（list/show/instructions）与受治理 graph 工作两条分支的 status→confirm→start→Gate→advance 控制环。 |
