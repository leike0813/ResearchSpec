
# src/vendor-audits/contracts.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/contracts.ts -->

vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。
源码：[src/vendor-audits/contracts.ts](../../../../../src/vendor-audits/contracts.ts)

## 符号（1）
<!-- node: function:src/vendor-audits/contracts.ts:isSafeAuditPath -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isSafeAuditPath | 函数 | 83–87 | 简单 | 校验、路径安全、utility | 1 | 判定审计证据路径是否为安全相对 POSIX 路径，拒绝绝对路径、反斜杠以及任何 `..` 回退或非规范写法。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [finrobot-audit.test.ts](../../tests/finrobot-audit.test.ts.md) | tests/finrobot-audit.test.ts | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [finrobot.ts](finrobot.ts.md) | src/vendor-audits/finrobot.ts | FinRobot 审计的 zod schema 集合：受版本控制的源条目与 git 模式、内容来源、许可声明、129 个知识面与候选能力，以及 13 类运营风险枚举。 |
| [histagent.ts](histagent.ts.md) | src/vendor-audits/histagent.ts | HistAgent 审计 schema：处置枚举、运行时权限、外部资源与安全发现记录，以及三个候选 Skill 的自包含执行契约和五层输出区分。 |
| [materials-science-skills-for-llm-audit.test.ts](../../tests/materials-science-skills-for-llm-audit.test.ts.md) | tests/materials-science-skills-for-llm-audit.test.ts | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [materials-science-skills-for-llm.ts](materials-science-skills-for-llm.ts.md) | src/vendor-audits/materials-science-skills-for-llm.ts | Materials-Science-Skills-For-LLM 审计 schema：12 个上游 Skill 的 frontmatter 校验、范围处置与摄入就绪度、运营风险与重叠判断，以及整体汇总计数。 |
| [policy.ts](../vendor-converters/materials-science-skills-for-llm/policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [policy.ts](../vendor-converters/scientific-agent-skills/policy.ts.md) | src/vendor-converters/scientific-agent-skills/policy.ts | 加载并校验 Scientific Agent Skills 的准入、依赖、资源与人工安全复核策略，同时合并上游审计记录构成完整策略视图。 |
| [scientific-agent-skills.ts](scientific-agent-skills.ts.md) | src/vendor-audits/scientific-agent-skills.ts | Scientific Agent Skills 审计 schema：逐 Skill 的范围处置、摄入就绪度、上游安全复核结论与资源统计，外加上游分类和汇总计数。 |
| [security-review.ts](../vendor-converters/scientific-agent-skills/security-review.ts.md) | src/vendor-converters/scientific-agent-skills/security-review.ts | Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。 |
| [vendor-audit.ts](../../tests/helpers/vendor-audit.ts.md) | tests/helpers/vendor-audit.ts | vendor 审计测试的共享断言工具：检查固定源码是否初始化、执行只读 git 查询、枚举顶层 Skill、汇总仓库资源统计并校验证据路径安全可读。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isSafeAuditPath | 函数 | 83–87 | 判定审计证据路径是否为安全相对 POSIX 路径，拒绝绝对路径、反斜杠以及任何 `..` 回退或非规范写法。 |
