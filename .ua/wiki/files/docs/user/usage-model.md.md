
# docs/user/usage-model.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/user](../../../modules/docs/user.md)
<!-- node: document:docs/user/usage-model.md -->

用户使用模型的产品级权威：完整规定从 init 只准备工作区、一个入口按需选择 Procedure、一次确认授权一张冻结图、frontier 决定可执行动作、handoff 连接真实文件、Gate/Decision 与重复轮次、Markdown/QMD/Quarto、revision patch、异模型复核与 Plugin/Zotero、恢复检查与结束，以及十六命令的验收边界。
源码：[docs/user/usage-model.md](../../../../../docs/user/usage-model.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [architecture.md](../developer/architecture.md.md) | docs/developer/architecture.md | 开发者架构总纲：用系统边界图界定 ResearchSpec 不碰模型 API 与数据库，用 owner 表保证每个概念只有一个事实源，并说明 graph 自由组合、合同层次、模块方向、Agent 与扩展边界以及 schema "2" fail-closed 演进策略。 |
| [arsu-contract-anchor.md](../maintainer/arsu-contract-anchor.md.md) | docs/maintainer/arsu-contract-anchor.md | ARSU 合同锚点审计说明：anchor manifest 区分 upstream observation 与 replacement policy，56 个 anchor 的替换目标覆盖四份 stable specs、academic-pipeline profile、node instance、change、annotation 工作材料与 revision_patch，并列出四条 pnpm 校验命令。 |
| [cli-interface.md](../developer/cli-interface.md.md) | docs/developer/cli-interface.md | CLI 控制面契约：给出 status→instructions→start/decide/advance 的调用协议、十六个顶层命令的职责表、start 的根 run 与 child subgraph 两种形态、安全项目相对路径合同，以及 Gate/Decision/Plugin 的独立确认边界。 |
| [manuscript-annotations.md](../developer/manuscript-annotations.md.md) | docs/developer/manuscript-annotations.md | 稿件批注 intake 的开发者规范：定义 work/annotation-intake/ 下的 raw/review copy/mechanical delta/normalized interpretation/patch mapping 五层数据分离、headless API 与 revision helper 契约，以及两套互不混用的交互式审阅投影与显示坐标、源码坐标的区分。 |
| [runtime_protocols.md](../developer/runtime/runtime_protocols.md.md) | docs/developer/runtime/runtime_protocols.md | CLI 与运行时协议：展开 list→show→instructions 的只读发现链、standalone 与 graph 两种 packet 语义、Quarto 探测时机、boundary file 的 role/type/path 记录方式、Gate 与 change 生命周期，以及恢复与失败时的只读 doctor 边界。 |
