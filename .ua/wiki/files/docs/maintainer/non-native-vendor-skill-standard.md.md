
# docs/maintainer/non-native-vendor-skill-standard.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[docs/maintainer](../../../modules/docs/maintainer.md)
<!-- node: document:docs/maintainer/non-native-vendor-skill-standard.md -->

非原生 vendor Skill 标准：规定从没有现成 Open Agent Skill 的上游派生 Skill 时，先定架构厚度（baseline/script-assisted/stateful/resource-backed），再按 12 条 SKILL.md 合同、渐进披露规则与能力实现映射表撰写，并要求哈希绑定的人工评审才能准入。
源码：[docs/maintainer/non-native-vendor-skill-standard.md](../../../../../docs/maintainer/non-native-vendor-skill-standard.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [domain-plugins.md](../developer/domain-plugins.md.md) | docs/developer/domain-plugins.md | Domain Skill Plugin 的开发者规范：说明 vendor 与 domain 两层多对多结构、Registry Schema 1 与包布局、213+5 内部目录的公开可见性规则、六个 vendor converter 的准入结论、工作区选择与依赖闭包、plugin 命令生命周期事务语义，以及 Navigate 侧的辅助边界。 |
| [finrobot.md](vendors/finrobot.md.md) | docs/maintainer/vendors/finrobot.md | FinRobot 适配器规范：针对无第一方 SKILL.md 的上游，说明 1,049 项审计与 39 个准入 surface 到六个 financial-research-* Skill 的一次映射、四个 Tier 3 script-assisted 与两个 Tier 1 Agent procedure 的分层、Apache-2.0 归属及 preview 候选流程。 |
| [histagent.md](vendors/histagent.md.md) | docs/maintainer/vendors/histagent.md | HistAgent 适配器规范：说明应用型上游而非 Skill 包，只发布三棵独立授权的八文件树，21 个准入 surface 映射到具体命令并保留 raw/OCR/transcription/emendation/translation/interpretation 五层区分，以及三个 mixed 扩展包的投影。 |
| [materials-science-skills.md](vendors/materials-science-skills.md.md) | docs/maintainer/vendors/materials-science-skills.md | Materials-Science-Skills-For-LLM 适配器规范：12 项上游 Skill 中准入 7 项并按 Tier 1/Tier 2 划分完整授权树，说明 24 项源文件决定、聚合树哈希授权、无脚本无状态的发布形态与七个 llm 扩展包的投影。 |
