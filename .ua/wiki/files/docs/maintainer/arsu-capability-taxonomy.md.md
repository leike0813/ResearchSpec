
# docs/maintainer/arsu-capability-taxonomy.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/maintainer](../../../modules/docs/maintainer.md)
<!-- node: document:docs/maintainer/arsu-capability-taxonomy.md -->

ARS 能力分类学盘点草案：把上游 39 个 agent 按工作性质、执行类型与建议节点类型三个正交轴去重为 34 项能力，逐项记录定义、来源 agent、输入输出 role、知识包与脚本化机会，作为未来图引擎的节点词汇。
源码：[docs/maintainer/arsu-capability-taxonomy.md](../../../../../docs/maintainer/arsu-capability-taxonomy.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic_paper_reviewer_workflow.md](../developer/runtime/academic_paper_reviewer_workflow.md.md) | docs/developer/runtime/academic_paper_reviewer_workflow.md | academic-paper-reviewer 路由说明：只读评审 handoff 引用的稿件，可产出 review report、editorial decision 与 revision roadmap，但内部 PASS 不等于 formal Gate pass，改稿必须另启 revision。 |
| [academic_paper_workflow.md](../developer/runtime/academic_paper_workflow.md.md) | docs/developer/runtime/academic_paper_workflow.md | academic-paper 路由说明：定义 writer/evaluator 分离只是语义纪律、Markdown 与 QMD 双源稿的 revision 保真要求、format-convert 的 no-execute Quarto 渲染链，以及 annotation intake 的分层存放。 |
| [academic_pipeline_workflow.md](../developer/runtime/academic_pipeline_workflow.md.md) | docs/developer/runtime/academic_pipeline_workflow.md | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
| [deep_research_workflow.md](../developer/runtime/deep_research_workflow.md.md) | docs/developer/runtime/deep_research_workflow.md | deep-research 路由说明：13 个 agent 与六个 phase 属语义方法而非 CLI 状态机，route instructions 从 specs 与 handoff roles 解析前置，用户确认后创建 standalone run，改稿需经 project change。 |
