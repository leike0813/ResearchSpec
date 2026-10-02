
# docs/developer/runtime/academic_paper_reviewer_workflow.md
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime](../../../../modules/docs/developer/runtime.md)
<!-- node: document:docs/developer/runtime/academic_paper_reviewer_workflow.md -->

academic-paper-reviewer 路由说明：只读评审 handoff 引用的稿件，可产出 review report、editorial decision 与 revision roadmap，但内部 PASS 不等于 formal Gate pass，改稿必须另启 revision。
源码：[docs/developer/runtime/academic_paper_reviewer_workflow.md](../../../../../../docs/developer/runtime/academic_paper_reviewer_workflow.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic_pipeline_workflow.md](academic_pipeline_workflow.md.md) | docs/developer/runtime/academic_pipeline_workflow.md | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
