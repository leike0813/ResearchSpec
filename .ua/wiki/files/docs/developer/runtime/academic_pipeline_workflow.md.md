
# docs/developer/runtime/academic_pipeline_workflow.md
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime](../../../../modules/docs/developer/runtime.md)
<!-- node: document:docs/developer/runtime/academic_pipeline_workflow.md -->

academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。
源码：[docs/developer/runtime/academic_pipeline_workflow.md](../../../../../../docs/developer/runtime/academic_pipeline_workflow.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [usage-model.md](../../user/usage-model.md.md) | docs/user/usage-model.md | 用户使用模型的产品级权威：完整规定从 init 只准备工作区、一个入口按需选择 Procedure、一次确认授权一张冻结图、frontier 决定可执行动作、handoff 连接真实文件、Gate/Decision 与重复轮次、Markdown/QMD/Quarto、revision patch、异模型复核与 Plugin/Zotero、恢复检查与结束，以及十六命令的验收边界。 |
