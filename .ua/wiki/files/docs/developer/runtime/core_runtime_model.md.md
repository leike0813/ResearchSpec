
# docs/developer/runtime/core_runtime_model.md
所属分层：[文档与文档站层](../../../../layers/documentation.md)  
所属目录：[docs/developer/runtime](../../../../modules/docs/developer/runtime.md)
<!-- node: document:docs/developer/runtime/core_runtime_model.md -->

核心运行模型：逐层说明文件 owner（stable specs、profiles、frozen runs、node instances、handoff、project change）、由扫描派生的只读视图、Agent 与 CLI 的能力分工，以及仓库 openspec 与用户 researchspec/changes 两层治理。
源码：[docs/developer/runtime/core_runtime_model.md](../../../../../../docs/developer/runtime/core_runtime_model.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic_pipeline_workflow.md](academic_pipeline_workflow.md.md) | docs/developer/runtime/academic_pipeline_workflow.md | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
| [runtime_protocols.md](runtime_protocols.md.md) | docs/developer/runtime/runtime_protocols.md | CLI 与运行时协议：展开 list→show→instructions 的只读发现链、standalone 与 graph 两种 packet 语义、Quarto 探测时机、boundary file 的 role/type/path 记录方式、Gate 与 change 生命周期，以及恢复与失败时的只读 doctor 边界。 |
| [usage-model.md](../../user/usage-model.md.md) | docs/user/usage-model.md | 用户使用模型的产品级权威：完整规定从 init 只准备工作区、一个入口按需选择 Procedure、一次确认授权一张冻结图、frontier 决定可执行动作、handoff 连接真实文件、Gate/Decision 与重复轮次、Markdown/QMD/Quarto、revision patch、异模型复核与 Plugin/Zotero、恢复检查与结束，以及十六命令的验收边界。 |
