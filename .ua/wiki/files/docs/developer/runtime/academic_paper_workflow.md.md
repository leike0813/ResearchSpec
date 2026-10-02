
# docs/developer/runtime/academic_paper_workflow.md
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime](../../../../modules/docs/developer/runtime.md)
<!-- node: document:docs/developer/runtime/academic_paper_workflow.md -->

academic-paper 路由说明：定义 writer/evaluator 分离只是语义纪律、Markdown 与 QMD 双源稿的 revision 保真要求、format-convert 的 no-execute Quarto 渲染链，以及 annotation intake 的分层存放。
源码：[docs/developer/runtime/academic_paper_workflow.md](../../../../../../docs/developer/runtime/academic_paper_workflow.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic_paper_reviewer_workflow.md](academic_paper_reviewer_workflow.md.md) | docs/developer/runtime/academic_paper_reviewer_workflow.md | academic-paper-reviewer 路由说明：只读评审 handoff 引用的稿件，可产出 review report、editorial decision 与 revision roadmap，但内部 PASS 不等于 formal Gate pass，改稿必须另启 revision。 |
| [academic_pipeline_workflow.md](academic_pipeline_workflow.md.md) | docs/developer/runtime/academic_pipeline_workflow.md | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
| [manuscript-annotations.md](../manuscript-annotations.md.md) | docs/developer/manuscript-annotations.md | 稿件批注 intake 的开发者规范：定义 work/annotation-intake/ 下的 raw/review copy/mechanical delta/normalized interpretation/patch mapping 五层数据分离、headless API 与 revision helper 契约，以及两套互不混用的交互式审阅投影与显示坐标、源码坐标的区分。 |
