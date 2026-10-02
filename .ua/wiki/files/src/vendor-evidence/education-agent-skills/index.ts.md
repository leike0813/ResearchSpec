
# src/vendor-evidence/education-agent-skills/index.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-evidence/education-agent-skills](../../../../modules/src/vendor-evidence/education-agent-skills.md)
<!-- node: file:src/vendor-evidence/education-agent-skills/index.ts -->

证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。
源码：[src/vendor-evidence/education-agent-skills/index.ts](../../../../../../src/vendor-evidence/education-agent-skills/index.ts)

## 符号（5）
<!-- node: function:src/vendor-evidence/education-agent-skills/index.ts:checkEducationAgentSkillsEvidenceArtifacts -->
<!-- node: function:src/vendor-evidence/education-agent-skills/index.ts:parseEducationAgentSkillsEvidenceMap -->
<!-- node: function:src/vendor-evidence/education-agent-skills/index.ts:renderEducationAgentSkillsEvidenceJson -->
<!-- node: function:src/vendor-evidence/education-agent-skills/index.ts:renderEducationAgentSkillsEvidenceReport -->
<!-- node: function:src/vendor-evidence/education-agent-skills/index.ts:validateEvidenceMapAgainstAudit -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkEducationAgentSkillsEvidenceArtifacts | 函数 | 178–207 | 复杂 | validation、idempotence、quality-gate | 0 | 比对已提交的证据映射 JSON 与报告同当前渲染结果，并返回差异说明。 |
| parseEducationAgentSkillsEvidenceMap | 函数 | 40–42 | 简单 | parsing、validation、zod-schema | 0 | 解析证据映射 JSON 文本为经 zod 校验的强类型对象。 |
| renderEducationAgentSkillsEvidenceJson | 函数 | 86–90 | 简单 | serialization、utility、json-render | 0 | 把证据映射序列化为稳定缩进的 JSON 文本。 |
| renderEducationAgentSkillsEvidenceReport | 函数 | 92–176 | 复杂 | reporting、deterministic-render、markdown | 0 | 由证据映射确定性渲染 evidence-report.md，给出声明数、著作数、存在性分布与 scholar 发现结果。 |
| [validateEvidenceMapAgainstAudit](../../../../symbols/src/vendor-evidence/education-agent-skills/index.ts/validateEvidenceMapAgainstAudit.md) | 函数 | 44–84 | 复杂 | validation、evidence、integrity | 2 | 校验证据映射与审计在快照标识、哈希、声明总数、evidence ID 顺序和逐条声明字段上完全一致。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](../../vendor-audits/education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [schema.ts](schema.ts.md) | src/vendor-evidence/education-agent-skills/schema.ts | 证据映射的 zod 契约层：定义著作类型、存在性状态、映射类型、验证来源、逐条声明映射与 scholar 发现结果等结构，并校验唯一性与排序不变量。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-evidence/education-agent-skills/cli.ts | 证据核验的命令行入口，只提供只读的 check 子命令：读取已提交的审计 JSON、证据映射与报告并校验三者一致。 |
| [education-agent-skills-evidence.test.ts](../../../tests/education-agent-skills-evidence.test.ts.md) | tests/education-agent-skills-evidence.test.ts | 证据映射契约测试：断言 872 条声明与 165 个 Skill 的覆盖、审计哈希绑定、存在性分布、scholar 发现结果，以及 JSON/报告的确定性渲染与 CLI check 退出码。 |
| [policy.ts](../../vendor-converters/education-agent-skills/policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkEducationAgentSkillsEvidenceArtifacts | 函数 | 178–207 | 比对已提交的证据映射 JSON 与报告同当前渲染结果，并返回差异说明。 |
| parseEducationAgentSkillsEvidenceMap | 函数 | 40–42 | 解析证据映射 JSON 文本为经 zod 校验的强类型对象。 |
| renderEducationAgentSkillsEvidenceJson | 函数 | 86–90 | 把证据映射序列化为稳定缩进的 JSON 文本。 |
| renderEducationAgentSkillsEvidenceReport | 函数 | 92–176 | 由证据映射确定性渲染 evidence-report.md，给出声明数、著作数、存在性分布与 scholar 发现结果。 |
| [validateEvidenceMapAgainstAudit](../../../../symbols/src/vendor-evidence/education-agent-skills/index.ts/validateEvidenceMapAgainstAudit.md) | 函数 | 44–84 | 校验证据映射与审计在快照标识、哈希、声明总数、evidence ID 顺序和逐条声明字段上完全一致。 |
