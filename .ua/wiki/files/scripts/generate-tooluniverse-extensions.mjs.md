
# scripts/generate-tooluniverse-extensions.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/generate-tooluniverse-extensions.mjs -->

ToolUniverse 扩展生成器：按审计 catalog 逐个生成 plugin-tooluniverse-* 能力与 profile，复制非标准资源为 knowledge ref、按 execution_type 绑定校验器，并更新扩展 registry。
源码：[scripts/generate-tooluniverse-extensions.mjs](../../../../scripts/generate-tooluniverse-extensions.mjs)

## 符号（6）
<!-- node: function:scripts/generate-tooluniverse-extensions.mjs:domainAssignments -->
<!-- node: function:scripts/generate-tooluniverse-extensions.mjs:existingNonToolUniverse -->
<!-- node: function:scripts/generate-tooluniverse-extensions.mjs:extensionSkill -->
<!-- node: function:scripts/generate-tooluniverse-extensions.mjs:generate -->
<!-- node: function:scripts/generate-tooluniverse-extensions.mjs:manifest -->
<!-- node: function:scripts/generate-tooluniverse-extensions.mjs:profile -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| domainAssignments | 函数 | 109–120 | 简单 | 域归属、domain-catalog、生成器 | 0 | 依据源中立域目录为扩展分配 28 个学科域与两个非空工具域。 |
| existingNonToolUniverse | 函数 | 126–136 | 简单 | registry、幂等、生成器 | 0 | 从 registry 中筛出非 ToolUniverse 的既有扩展，避免跨 vendor 覆盖。 |
| extensionSkill | 函数 | 56–107 | 中等 | 生成器、技能投影、tooluniverse | 0 | 组装单个 plugin-tooluniverse-* 扩展的 SKILL.md，保持已审阅 Skill 正文与资源不变。 |
| generate | 函数 | 230–356 | 复杂 | 生成器、入口流程、确定性生成 | 0 | 遍历审计 catalog 生成全部已审阅扩展包，并写回扩展 registry 与 catalog 派生信息。 |
| manifest | 函数 | 172–228 | 中等 | manifest、哈希绑定、生成器 | 0 | 构造扩展 manifest：逐资源计算 SHA-256、登记 knowledge ref 并绑定 brief 校验器与 execution_type。 |
| profile | 函数 | 138–170 | 中等 | profile、生成器、激活包 | 0 | 生成扩展 profile，声明激活包 schema 与 advisory 推荐而不固定具体模型。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [domain-catalog.json](../src/plugins/domain-catalog.json.md) | src/plugins/domain-catalog.json | 内部领域目录：预建全部 213 个学科领域与 5 个工具领域，字段含 domain_id、ANZSRC Group 编码、标题与 skills 归属。 |
| [tooluniverse-validator-template.py](tooluniverse-validator-template.py.md) | scripts/tooluniverse-validator-template.py | ToolUniverse 扩展能力的研究简报校验器模板，校验绝对输出路径中的 research_brief JSON 是否具备 scope、source_ledger 等六项证据字段。 |
