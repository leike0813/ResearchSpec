
# docs/developer/README.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/developer](../../../modules/docs/developer.md)
<!-- node: document:docs/developer/README.md -->

开发者文档索引，按主题列出架构、CLI 接口、运行时、领域 Plugin、领域分类与稿件批注六篇入口，并声明产品行为以用户使用模型为准、实现变更走 OpenSpec。
源码：[docs/developer/README.md](../../../../../docs/developer/README.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [architecture.md](architecture.md.md) | docs/developer/architecture.md | 开发者架构总纲：用系统边界图界定 ResearchSpec 不碰模型 API 与数据库，用 owner 表保证每个概念只有一个事实源，并说明 graph 自由组合、合同层次、模块方向、Agent 与扩展边界以及 schema "2" fail-closed 演进策略。 |
| [cli-interface.md](cli-interface.md.md) | docs/developer/cli-interface.md | CLI 控制面契约：给出 status→instructions→start/decide/advance 的调用协议、十六个顶层命令的职责表、start 的根 run 与 child subgraph 两种形态、安全项目相对路径合同，以及 Gate/Decision/Plugin 的独立确认边界。 |
| [domain-plugins.md](domain-plugins.md.md) | docs/developer/domain-plugins.md | Domain Skill Plugin 的开发者规范：说明 vendor 与 domain 两层多对多结构、Registry Schema 1 与包布局、213+5 内部目录的公开可见性规则、六个 vendor converter 的准入结论、工作区选择与依赖闭包、plugin 命令生命周期事务语义，以及 Navigate 侧的辅助边界。 |
| [domain-taxonomy.md](domain-taxonomy.md.md) | docs/developer/domain-taxonomy.md | 领域分类的唯一规范性说明：以 ANZSRC 2020 Fields of Research Group 作为学科型 domain 唯一标准，列出五个粗粒度工具域、源工作簿 SHA-256 与 23 Division / 213 Group / 1,967 Field 仓库快照，并给出全部 Group code 与 kebab-case domain ID 的完整名录。 |
| [manuscript-annotations.md](manuscript-annotations.md.md) | docs/developer/manuscript-annotations.md | 稿件批注 intake 的开发者规范：定义 work/annotation-intake/ 下的 raw/review copy/mechanical delta/normalized interpretation/patch mapping 五层数据分离、headless API 与 revision helper 契约，以及两套互不混用的交互式审阅投影与显示坐标、源码坐标的区分。 |
| [README.md](runtime/README.md.md) | docs/developer/runtime/README.md | ResearchSpec 与 ARSU 核心运行模型文档组的入口，给出六篇必读顺序与一句话模型：CLI 是确定性 control writer、宿主只常驻 Navigate、文件 owner 决定持久事实。 |
