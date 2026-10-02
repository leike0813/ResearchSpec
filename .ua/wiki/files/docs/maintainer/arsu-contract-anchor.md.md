
# docs/maintainer/arsu-contract-anchor.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/maintainer](../../../modules/docs/maintainer.md)
<!-- node: document:docs/maintainer/arsu-contract-anchor.md -->

ARSU 合同锚点审计说明：anchor manifest 区分 upstream observation 与 replacement policy，56 个 anchor 的替换目标覆盖四份 stable specs、academic-pipeline profile、node instance、change、annotation 工作材料与 revision_patch，并列出四条 pnpm 校验命令。
源码：[docs/maintainer/arsu-contract-anchor.md](../../../../../docs/maintainer/arsu-contract-anchor.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic_paper_workflow.md](../developer/runtime/academic_paper_workflow.md.md) | docs/developer/runtime/academic_paper_workflow.md | academic-paper 路由说明：定义 writer/evaluator 分离只是语义纪律、Markdown 与 QMD 双源稿的 revision 保真要求、format-convert 的 no-execute Quarto 渲染链，以及 annotation intake 的分层存放。 |
| [architecture.md](../developer/architecture.md.md) | docs/developer/architecture.md | 开发者架构总纲：用系统边界图界定 ResearchSpec 不碰模型 API 与数据库，用 owner 表保证每个概念只有一个事实源，并说明 graph 自由组合、合同层次、模块方向、Agent 与扩展边界以及 schema "2" fail-closed 演进策略。 |
| [arsu-capability-taxonomy.md](arsu-capability-taxonomy.md.md) | docs/maintainer/arsu-capability-taxonomy.md | ARS 能力分类学盘点草案：把上游 39 个 agent 按工作性质、执行类型与建议节点类型三个正交轴去重为 34 项能力，逐项记录定义、来源 agent、输入输出 role、知识包与脚本化机会，作为未来图引擎的节点词汇。 |
| [usage-model.md](../user/usage-model.md.md) | docs/user/usage-model.md | 用户使用模型的产品级权威：完整规定从 init 只准备工作区、一个入口按需选择 Procedure、一次确认授权一张冻结图、frontier 决定可执行动作、handoff 连接真实文件、Gate/Decision 与重复轮次、Markdown/QMD/Quarto、revision patch、异模型复核与 Plugin/Zotero、恢复检查与结束，以及十六命令的验收边界。 |
