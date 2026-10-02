
# docs/maintainer
> 目录聚合页：5 个文件、0 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [docs/maintainer/arsu-capability-taxonomy.md](../../files/docs/maintainer/arsu-capability-taxonomy.md.md) | 文档 | 0 | ARS 能力分类学盘点草案：把上游 39 个 agent 按工作性质、执行类型与建议节点类型三个正交轴去重为 34 项能力，逐项记录定义、来源 agent、输入输出 role、知识包与脚本化机会，作为未来图引擎的节点词汇。 |
| [docs/maintainer/arsu-contract-anchor.md](../../files/docs/maintainer/arsu-contract-anchor.md.md) | 文档 | 0 | ARSU 合同锚点审计说明：anchor manifest 区分 upstream observation 与 replacement policy，56 个 anchor 的替换目标覆盖四份 stable specs、academic-pipeline profile、node instance、change、annotation 工作材料与 revision_patch，并列出四条 pnpm 校验命令。 |
| [docs/maintainer/non-native-vendor-skill-standard.md](../../files/docs/maintainer/non-native-vendor-skill-standard.md.md) | 文档 | 0 | 非原生 vendor Skill 标准：规定从没有现成 Open Agent Skill 的上游派生 Skill 时，先定架构厚度（baseline/script-assisted/stateful/resource-backed），再按 12 条 SKILL.md 合同、渐进披露规则与能力实现映射表撰写，并要求哈希绑定的人工评审才能准入。 |
| [docs/maintainer/README.md](../../files/docs/maintainer/README.md.md) | 文档 | 0 | 维护者文档索引，指向 ARSU 合同锚点、ARS 能力分类、非原生 vendor Skill 标准、发布流程与六个 vendor 适配页，并交代 authoring/、audits/、artifacts/ 三个材料目录的分工。 |
| [docs/maintainer/release-process.md](../../files/docs/maintainer/release-process.md.md) | 文档 | 0 | MVP 发布流程：列出从干净 checkout 依次执行的二十余条技术门禁命令，说明 release:verify 的真实 tarball 安装验证、Ubuntu/macOS/Windows × Node 22/24 托管矩阵、手工 dogfooding 证据要求、发布前行政门禁，以及 commit/tag/publish 需单独授权的边界。 |

## 子目录
- [vendors](maintainer/vendors.md)
