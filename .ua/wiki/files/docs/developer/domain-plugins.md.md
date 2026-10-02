
# docs/developer/domain-plugins.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/developer](../../../modules/docs/developer.md)
<!-- node: document:docs/developer/domain-plugins.md -->

Domain Skill Plugin 的开发者规范：说明 vendor 与 domain 两层多对多结构、Registry Schema 1 与包布局、213+5 内部目录的公开可见性规则、六个 vendor converter 的准入结论、工作区选择与依赖闭包、plugin 命令生命周期事务语义，以及 Navigate 侧的辅助边界。
源码：[docs/developer/domain-plugins.md](../../../../../docs/developer/domain-plugins.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [domain-taxonomy.md](domain-taxonomy.md.md) | docs/developer/domain-taxonomy.md | 领域分类的唯一规范性说明：以 ANZSRC 2020 Fields of Research Group 作为学科型 domain 唯一标准，列出五个粗粒度工具域、源工作簿 SHA-256 与 23 Division / 213 Group / 1,967 Field 仓库快照，并给出全部 Group code 与 kebab-case domain ID 的完整名录。 |
| [README.md](../maintainer/vendors/README.md.md) | docs/maintainer/vendors/README.md | 六个 vendor 适配页的索引，并声明文档不能替代机器事实源：任何更新必须走对应 maintenance Skill 与审计 catalog。 |
