
# docs/maintainer/README.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/maintainer](../../../modules/docs/maintainer.md)
<!-- node: document:docs/maintainer/README.md -->

维护者文档索引，指向 ARSU 合同锚点、ARS 能力分类、非原生 vendor Skill 标准、发布流程与六个 vendor 适配页，并交代 authoring/、audits/、artifacts/ 三个材料目录的分工。
源码：[docs/maintainer/README.md](../../../../../docs/maintainer/README.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-capability-taxonomy.md](arsu-capability-taxonomy.md.md) | docs/maintainer/arsu-capability-taxonomy.md | ARS 能力分类学盘点草案：把上游 39 个 agent 按工作性质、执行类型与建议节点类型三个正交轴去重为 34 项能力，逐项记录定义、来源 agent、输入输出 role、知识包与脚本化机会，作为未来图引擎的节点词汇。 |
| [arsu-contract-anchor.md](arsu-contract-anchor.md.md) | docs/maintainer/arsu-contract-anchor.md | ARSU 合同锚点审计说明：anchor manifest 区分 upstream observation 与 replacement policy，56 个 anchor 的替换目标覆盖四份 stable specs、academic-pipeline profile、node instance、change、annotation 工作材料与 revision_patch，并列出四条 pnpm 校验命令。 |
| [non-native-vendor-skill-standard.md](non-native-vendor-skill-standard.md.md) | docs/maintainer/non-native-vendor-skill-standard.md | 非原生 vendor Skill 标准：规定从没有现成 Open Agent Skill 的上游派生 Skill 时，先定架构厚度（baseline/script-assisted/stateful/resource-backed），再按 12 条 SKILL.md 合同、渐进披露规则与能力实现映射表撰写，并要求哈希绑定的人工评审才能准入。 |
| [README.md](vendors/README.md.md) | docs/maintainer/vendors/README.md | 六个 vendor 适配页的索引，并声明文档不能替代机器事实源：任何更新必须走对应 maintenance Skill 与审计 catalog。 |
| [release-process.md](release-process.md.md) | docs/maintainer/release-process.md | MVP 发布流程：列出从干净 checkout 依次执行的二十余条技术门禁命令，说明 release:verify 的真实 tarball 安装验证、Ubuntu/macOS/Windows × Node 22/24 托管矩阵、手工 dogfooding 证据要求、发布前行政门禁，以及 commit/tag/publish 需单独授权的边界。 |
