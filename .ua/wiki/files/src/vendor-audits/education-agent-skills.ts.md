
# src/vendor-audits/education-agent-skills.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/education-agent-skills.ts -->

Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。
源码：[src/vendor-audits/education-agent-skills.ts](../../../../../src/vendor-audits/education-agent-skills.ts)

## 符号（17）
<!-- node: function:src/vendor-audits/education-agent-skills.ts:audienceReview -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:buildEducationAgentSkillsAudit -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:buildFindings -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:checkEducationAgentSkillsAuditArtifacts -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:classifyEducationAgentSkillsFile -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:classifyFile -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:licenseReview -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:overlapReview -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:parseEducationSkillFrontmatter -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:parseSkill -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:readInventory -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:renderEducationAgentSkillsAuditJson -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:renderEducationAgentSkillsReport -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:reviewEvidence -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:riskReview -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:summarizeAudit -->
<!-- node: function:src/vendor-audits/education-agent-skills.ts:validateEducationAgentSkillsSnapshotIdentity -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| audienceReview | 函数 | 565–575 | 中等 | risk-review、audience、compliance | 0 | 判定 Skill 的面向对象是教师、学生还是混合，并说明是否可能介入未成年学习者互动。 |
| buildEducationAgentSkillsAudit | 函数 | 298–374 | 复杂 | vendor-audit、orchestration、deterministic-build | 0 | 审计主入口：验证快照身份后遍历受跟踪文件与 Skill，顺序分配 evidence/relationship ID，构建 findings 与 summary，产出完整审计对象。 |
| buildFindings | 函数 | 678–690 | 中等 | findings、risk-review、summarization | 0 | 把许可证范围、证据未独立验证、上游审计漂移、关系目标漂移等结论汇总为带严重级别的审计发现。 |
| checkEducationAgentSkillsAuditArtifacts | 函数 | 408–413 | 简单 | validation、idempotence、utility | 0 | 比对实际 JSON/Markdown 产物与预期渲染结果，返回差异说明列表。 |
| classifyEducationAgentSkillsFile | 函数 | 549–551 | 简单 | classification、utility、vendor-audit | 0 | 对外暴露的文件分类入口，把受跟踪路径映射为 skill-content、license-provenance、mcp-runtime 等类别。 |
| classifyFile | 函数 | 553–563 | 中等 | classification、pattern-matching、regex-rules | 0 | 以有序正则规则判定上游文件类别，未命中时归为 project-doc。 |
| licenseReview | 函数 | 587–604 | 中等 | license、risk-review、compliance | 0 | 依据原创框架声明与独立贡献者判断根 LICENSE 的 CC BY-SA 4.0 通知是否覆盖该 Skill，输出 clear/conditional/unresolved 状态与理由。 |
| overlapReview | 函数 | 634–645 | 中等 | overlap-analysis、risk-review、vendor-comparison | 0 | 逐个比较该 Skill 与 ARSU、ToolUniverse、Scientific Agent Skills、FinRobot、HistAgent 等既有 vendor 的能力重叠程度。 |
| parseEducationSkillFrontmatter | 函数 | 415–431 | 中等 | parsing、yaml、validation | 0 | 解析 SKILL.md 头部的单段 YAML frontmatter，拆分为标准字段与上游专有字段两部分并强制保留 skill_id。 |
| parseSkill | 函数 | 433–487 | 复杂 | parsing、vendor-audit、data-model | 0 | 把单个 SKILL.md 装配为完整审计 Skill 记录：校验身份与路径、汇总证据与关系 ID，并写入许可证、风险、重叠与准入建议。 |
| readInventory | 函数 | 536–547 | 中等 | git、inventory、hashing | 0 | 通过 git ls-files -s 读取受跟踪文件清单，计算字节数与 SHA-256，并按路径排序附加文件分类。 |
| renderEducationAgentSkillsAuditJson | 函数 | 376–378 | 简单 | serialization、utility、json-render | 0 | 把审计对象序列化为稳定缩进的 JSON 文本。 |
| renderEducationAgentSkillsReport | 函数 | 380–406 | 中等 | reporting、deterministic-render、markdown | 0 | 由审计对象确定性渲染可读 Markdown 报告，区分阻塞性发现、证据统计与逐 Skill 结论。 |
| reviewEvidence | 函数 | 489–517 | 中等 | evidence-review、heuristic、compliance | 0 | 解析证据引用中的作者、年份与标题，与上游 EVIDENCE.md 线索比对，只给出 partial 或 unverified 的存在性结论。 |
| riskReview | 函数 | 647–664 | 中等 | risk-review、heuristic、compliance | 0 | 对 minors、privacy、learning-analytics、wellbeing、diagnosis、original-framework 六类风险做关键词与领域双路判定。 |
| summarizeAudit | 函数 | 692–708 | 中等 | summarization、metrics、reporting | 0 | 统计受跟踪文件、Skill、领域、证据与关系数量，并汇总证据强度、许可证与风险分布。 |
| validateEducationAgentSkillsSnapshotIdentity | 函数 | 528–534 | 简单 | validation、snapshot-pinning、immutable-audit | 0 | 校验候选快照标识必须等于固定的 snapshot-6bbbce4，防止审计到错误的上游版本。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adaptation.ts](../vendor-converters/education-agent-skills/adaptation.ts.md) | src/vendor-converters/education-agent-skills/adaptation.ts | 把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。 |
| [cli.ts](../vendor-evidence/education-agent-skills/cli.ts.md) | src/vendor-evidence/education-agent-skills/cli.ts | 证据核验的命令行入口，只提供只读的 check 子命令：读取已提交的审计 JSON、证据映射与报告并校验三者一致。 |
| [education-agent-skills-audit.test.ts](../../tests/education-agent-skills-audit.test.ts.md) | tests/education-agent-skills-audit.test.ts | 锁定 Education Agent Skills 的干净快照身份，校验 241 个跟踪文件清点、frontmatter 解析、证据与许可及关系 schema 的未决状态，以及由 JSON 确定性派生的审计报告。 |
| [education-agent-skills-cli.ts](education-agent-skills-cli.ts.md) | src/vendor-audits/education-agent-skills-cli.ts | Education Agent Skills 审计的命令行入口，提供 audit 与 check 两个子命令，负责写出 skill-audit.json 与 report.md，或与已提交产物做逐字节比对。 |
| [education-agent-skills-evidence.test.ts](../../tests/education-agent-skills-evidence.test.ts.md) | tests/education-agent-skills-evidence.test.ts | 证据映射契约测试：断言 872 条声明与 165 个 Skill 的覆盖、审计哈希绑定、存在性分布、scholar 发现结果，以及 JSON/报告的确定性渲染与 CLI check 退出码。 |
| [index.ts](../vendor-evidence/education-agent-skills/index.ts.md) | src/vendor-evidence/education-agent-skills/index.ts | 证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。 |
| [policy.ts](../vendor-converters/education-agent-skills/policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [schema.ts](../vendor-evidence/education-agent-skills/schema.ts.md) | src/vendor-evidence/education-agent-skills/schema.ts | 证据映射的 zod 契约层：定义著作类型、存在性状态、映射类型、验证来源、逐条声明映射与 scholar 发现结果等结构，并校验唯一性与排序不变量。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildEducationAgentSkillsAudit | 函数 | 298–374 | 审计主入口：验证快照身份后遍历受跟踪文件与 Skill，顺序分配 evidence/relationship ID，构建 findings 与 summary，产出完整审计对象。 |
| checkEducationAgentSkillsAuditArtifacts | 函数 | 408–413 | 比对实际 JSON/Markdown 产物与预期渲染结果，返回差异说明列表。 |
| classifyEducationAgentSkillsFile | 函数 | 549–551 | 对外暴露的文件分类入口，把受跟踪路径映射为 skill-content、license-provenance、mcp-runtime 等类别。 |
| parseEducationSkillFrontmatter | 函数 | 415–431 | 解析 SKILL.md 头部的单段 YAML frontmatter，拆分为标准字段与上游专有字段两部分并强制保留 skill_id。 |
| parseSkill | 函数 | 433–487 | 把单个 SKILL.md 装配为完整审计 Skill 记录：校验身份与路径、汇总证据与关系 ID，并写入许可证、风险、重叠与准入建议。 |
| readInventory | 函数 | 536–547 | 通过 git ls-files -s 读取受跟踪文件清单，计算字节数与 SHA-256，并按路径排序附加文件分类。 |
| renderEducationAgentSkillsAuditJson | 函数 | 376–378 | 把审计对象序列化为稳定缩进的 JSON 文本。 |
| renderEducationAgentSkillsReport | 函数 | 380–406 | 由审计对象确定性渲染可读 Markdown 报告，区分阻塞性发现、证据统计与逐 Skill 结论。 |
| reviewEvidence | 函数 | 489–517 | 解析证据引用中的作者、年份与标题，与上游 EVIDENCE.md 线索比对，只给出 partial 或 unverified 的存在性结论。 |
| validateEducationAgentSkillsSnapshotIdentity | 函数 | 528–534 | 校验候选快照标识必须等于固定的 snapshot-6bbbce4，防止审计到错误的上游版本。 |
