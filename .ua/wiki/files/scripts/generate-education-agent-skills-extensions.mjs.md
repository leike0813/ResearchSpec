
# scripts/generate-education-agent-skills-extensions.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-education-agent-skills-extensions.mjs -->

把已审阅的 Education Agent Skills 逐一投影为 plugin-education-* 扩展包：复制 SKILL.md 与资源为 SHA-256 knowledge ref，按域目录派生归属并更新 registry 与审计 catalog。
源码：[scripts/generate-education-agent-skills-extensions.mjs](../../../../scripts/generate-education-agent-skills-extensions.mjs)

## 符号（6）
<!-- node: function:scripts/generate-education-agent-skills-extensions.mjs:domainAssignments -->
<!-- node: function:scripts/generate-education-agent-skills-extensions.mjs:existingNonEducationAgentSkills -->
<!-- node: function:scripts/generate-education-agent-skills-extensions.mjs:extensionSkill -->
<!-- node: function:scripts/generate-education-agent-skills-extensions.mjs:generate -->
<!-- node: function:scripts/generate-education-agent-skills-extensions.mjs:manifest -->
<!-- node: function:scripts/generate-education-agent-skills-extensions.mjs:profile -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| domainAssignments | 函数 | 110–121 | 简单 | 域归属、domain-catalog、生成器 | 0 | 从源中立 domain catalog 推导该扩展的学科域与工具域归属，空域不产生成员资格。 |
| existingNonEducationAgentSkills | 函数 | 127–137 | 简单 | registry、幂等、生成器 | 0 | 从当前 registry 中筛出非本 vendor 的既有扩展，避免重写其他生成器的产物。 |
| extensionSkill | 函数 | 57–108 | 中等 | 生成器、技能投影、education | 0 | 组装单个 plugin-education-* 扩展的 SKILL.md 与资源树，保留原始 frontmatter 标题与正文并改写路由说明。 |
| generate | 函数 | 231–362 | 复杂 | 生成器、入口流程、确定性生成 | 0 | 遍历审计 catalog 中已审阅条目生成全部扩展，并合并写回扩展 registry 与审计 catalog。 |
| manifest | 函数 | 173–229 | 中等 | manifest、哈希绑定、生成器 | 0 | 构造扩展 manifest：资源相对路径、SHA-256 knowledge refs、校验器绑定与 execution_type。 |
| profile | 函数 | 139–171 | 中等 | profile、生成器、激活包 | 0 | 生成该扩展对应的 profile 声明，绑定 activation packet schema 与 advisory 推荐。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [domain-catalog.json](../src/plugins/domain-catalog.json.md) | src/plugins/domain-catalog.json | 内部领域目录：预建全部 213 个学科领域与 5 个工具领域，字段含 domain_id、ANZSRC Group 编码、标题与 skills 归属。 |
| [education-agent-skills-validator-template.py](education-agent-skills-validator-template.py.md) | scripts/education-agent-skills-validator-template.py | Education Agent Skills 插件能力的研究简报校验器模板：解析命令行给出的 JSON 输出，校验存在 research_brief 并含六个通用证据字段。 |
