
# tests/helpers/vendor-audit.ts
所属分层：[测试与验收夹具层](../../../layers/tests.md)  
所属目录：[tests/helpers](../../../modules/tests/helpers.md)
<!-- node: file:tests/helpers/vendor-audit.ts -->

vendor 审计测试的共享断言工具：检查固定源码是否初始化、执行只读 git 查询、枚举顶层 Skill、汇总仓库资源统计并校验证据路径安全可读。
源码：[tests/helpers/vendor-audit.ts](../../../../../tests/helpers/vendor-audit.ts)

## 符号（5）
<!-- node: function:tests/helpers/vendor-audit.ts:assertAuditSourceInitialized -->
<!-- node: function:tests/helpers/vendor-audit.ts:assertEvidencePaths -->
<!-- node: function:tests/helpers/vendor-audit.ts:gitOutput -->
<!-- node: function:tests/helpers/vendor-audit.ts:repositoryResourceSummary -->
<!-- node: function:tests/helpers/vendor-audit.ts:topLevelSkillIds -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertAuditSourceInitialized | 函数 | 18–23 | 简单 | test-helper、assertion、pinned-source | 0 | 断言 vendor 源码目录已初始化，未初始化时提示对应的 submodule 初始化命令。 |
| assertEvidencePaths | 函数 | 63–69 | 简单 | test-helper、assertion、path-safety | 0 | 断言审计证据非空、路径通过安全校验且在固定源码中真实可读。 |
| gitOutput | 函数 | 25–27 | 简单 | test-helper、git、utility | 0 | 在 vendor 源码目录执行只读 git 命令并返回去空白输出。 |
| repositoryResourceSummary | 函数 | 45–61 | 中等 | test-helper、inventory、metrics | 0 | 统计 Skill 根目录的文件数、字节数以及 references、scripts、assets、测试与环境模板的分类计数。 |
| topLevelSkillIds | 函数 | 29–43 | 中等 | test-helper、inventory、skill-standard | 0 | 扫描指定目录下含 SKILL.md 的顶层子目录，返回排序后的 Skill ID 清单。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../../src/vendor-audits/contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills-audit.test.ts](../education-agent-skills-audit.test.ts.md) | tests/education-agent-skills-audit.test.ts | 锁定 Education Agent Skills 的干净快照身份，校验 241 个跟踪文件清点、frontmatter 解析、证据与许可及关系 schema 的未决状态，以及由 JSON 确定性派生的审计报告。 |
| [finrobot-audit.test.ts](../finrobot-audit.test.ts.md) | tests/finrobot-audit.test.ts | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [histagent-audit.test.ts](../histagent-audit.test.ts.md) | tests/histagent-audit.test.ts | HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。 |
| [materials-science-skills-for-llm-audit.test.ts](../materials-science-skills-for-llm-audit.test.ts.md) | tests/materials-science-skills-for-llm-audit.test.ts | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [scientific-agent-skills-audit.test.ts](../scientific-agent-skills-audit.test.ts.md) | tests/scientific-agent-skills-audit.test.ts | Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。 |
| [tooluniverse-audit.test.ts](../tooluniverse-audit.test.ts.md) | tests/tooluniverse-audit.test.ts | ToolUniverse 不可变审计测试：校验 v1.5.4 固定源码身份、185 个 Skill 逐一覆盖、资源统计与证据路径复算，并确认安全发现、域归类与准入结论一致。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertAuditSourceInitialized | 函数 | 18–23 | 断言 vendor 源码目录已初始化，未初始化时提示对应的 submodule 初始化命令。 |
| assertEvidencePaths | 函数 | 63–69 | 断言审计证据非空、路径通过安全校验且在固定源码中真实可读。 |
| gitOutput | 函数 | 25–27 | 在 vendor 源码目录执行只读 git 命令并返回去空白输出。 |
| repositoryResourceSummary | 函数 | 45–61 | 统计 Skill 根目录的文件数、字节数以及 references、scripts、assets、测试与环境模板的分类计数。 |
| topLevelSkillIds | 函数 | 29–43 | 扫描指定目录下含 SKILL.md 的顶层子目录，返回排序后的 Skill ID 清单。 |
