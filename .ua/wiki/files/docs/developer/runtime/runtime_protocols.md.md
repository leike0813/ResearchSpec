
# docs/developer/runtime/runtime_protocols.md
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime](../../../../modules/docs/developer/runtime.md)
<!-- node: document:docs/developer/runtime/runtime_protocols.md -->

CLI 与运行时协议：展开 list→show→instructions 的只读发现链、standalone 与 graph 两种 packet 语义、Quarto 探测时机、boundary file 的 role/type/path 记录方式、Gate 与 change 生命周期，以及恢复与失败时的只读 doctor 边界。
源码：[docs/developer/runtime/runtime_protocols.md](../../../../../../docs/developer/runtime/runtime_protocols.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic_paper_reviewer_workflow.md](academic_paper_reviewer_workflow.md.md) | docs/developer/runtime/academic_paper_reviewer_workflow.md | academic-paper-reviewer 路由说明：只读评审 handoff 引用的稿件，可产出 review report、editorial decision 与 revision roadmap，但内部 PASS 不等于 formal Gate pass，改稿必须另启 revision。 |
| [academic_paper_workflow.md](academic_paper_workflow.md.md) | docs/developer/runtime/academic_paper_workflow.md | academic-paper 路由说明：定义 writer/evaluator 分离只是语义纪律、Markdown 与 QMD 双源稿的 revision 保真要求、format-convert 的 no-execute Quarto 渲染链，以及 annotation intake 的分层存放。 |
| [academic_pipeline_workflow.md](academic_pipeline_workflow.md.md) | docs/developer/runtime/academic_pipeline_workflow.md | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
| [cli-interface.md](../cli-interface.md.md) | docs/developer/cli-interface.md | CLI 控制面契约：给出 status→instructions→start/decide/advance 的调用协议、十六个顶层命令的职责表、start 的根 run 与 child subgraph 两种形态、安全项目相对路径合同，以及 Gate/Decision/Plugin 的独立确认边界。 |
| [deep_research_workflow.md](deep_research_workflow.md.md) | docs/developer/runtime/deep_research_workflow.md | deep-research 路由说明：13 个 agent 与六个 phase 属语义方法而非 CLI 状态机，route instructions 从 specs 与 handoff roles 解析前置，用户确认后创建 standalone run，改稿需经 project change。 |
| [usage-model.md](../../user/usage-model.md.md) | docs/user/usage-model.md | 用户使用模型的产品级权威：完整规定从 init 只准备工作区、一个入口按需选择 Procedure、一次确认授权一张冻结图、frontier 决定可执行动作、handoff 连接真实文件、Gate/Decision 与重复轮次、Markdown/QMD/Quarto、revision patch、异模型复核与 Plugin/Zotero、恢复检查与结束，以及十六命令的验收边界。 |
