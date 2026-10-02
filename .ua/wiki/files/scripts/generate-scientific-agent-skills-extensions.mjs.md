
# scripts/generate-scientific-agent-skills-extensions.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-scientific-agent-skills-extensions.mjs -->

把已审阅的 Scientific Agent Skills 投影为 plugin-scientific-agent-skills-* 扩展能力：保持 SKILL.md 正文不变，复制审阅资源为字节级 knowledge ref，绑定校验器并写 registry 与 catalog。
源码：[scripts/generate-scientific-agent-skills-extensions.mjs](../../../../scripts/generate-scientific-agent-skills-extensions.mjs)

## 符号（6）
<!-- node: function:scripts/generate-scientific-agent-skills-extensions.mjs:domainAssignments -->
<!-- node: function:scripts/generate-scientific-agent-skills-extensions.mjs:existingNonScientificAgentSkills -->
<!-- node: function:scripts/generate-scientific-agent-skills-extensions.mjs:extensionSkill -->
<!-- node: function:scripts/generate-scientific-agent-skills-extensions.mjs:generate -->
<!-- node: function:scripts/generate-scientific-agent-skills-extensions.mjs:manifest -->
<!-- node: function:scripts/generate-scientific-agent-skills-extensions.mjs:profile -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| domainAssignments | 函数 | 111–122 | 简单 | 域归属、domain-catalog、生成器 | 0 | 按源中立域目录解析该扩展的 ANZSRC 学科域与工具域归属。 |
| existingNonScientificAgentSkills | 函数 | 132–142 | 简单 | registry、幂等、生成器 | 0 | 筛出 registry 中非本 vendor 的既有扩展，保证合并写回时不覆盖其他来源。 |
| extensionSkill | 函数 | 58–109 | 中等 | 生成器、技能投影、scientific-agent-skills | 0 | 组装单个 plugin-scientific-agent-skills-* 扩展的 SKILL.md 与资源树，保留已审阅正文不变。 |
| generate | 函数 | 236–379 | 复杂 | 生成器、入口流程、确定性生成 | 0 | 按审计 catalog 生成全部已审阅扩展，并更新扩展 registry 与 vendor bundle 绑定。 |
| manifest | 函数 | 178–234 | 中等 | manifest、哈希绑定、二进制资源 | 0 | 构造扩展 manifest：按字节复制资源、登记 SHA-256 knowledge refs 并绑定 validate 脚本。 |
| profile | 函数 | 144–176 | 中等 | profile、生成器、激活包 | 0 | 生成扩展 profile，声明激活包 schema、advisory 推荐与不固定厂商模型的约束。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [domain-catalog.json](../src/plugins/domain-catalog.json.md) | src/plugins/domain-catalog.json | 内部领域目录：预建全部 213 个学科领域与 5 个工具领域，字段含 domain_id、ANZSRC Group 编码、标题与 skills 归属。 |
| [scientific-agent-skills-validator-template.py](scientific-agent-skills-validator-template.py.md) | scripts/scientific-agent-skills-validator-template.py | Scientific Agent Skills 扩展能力的研究简报校验器模板：读取提交的 JSON 输出，确认 research_brief 存在并包含六个通用证据字段。 |
