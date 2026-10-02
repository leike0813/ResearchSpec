
# src/vendor-audits/scientific-agent-skills.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/scientific-agent-skills.ts -->

Scientific Agent Skills 审计 schema：逐 Skill 的范围处置、摄入就绪度、上游安全复核结论与资源统计，外加上游分类和汇总计数。
源码：[src/vendor-audits/scientific-agent-skills.ts](../../../../../src/vendor-audits/scientific-agent-skills.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [policy.ts](../vendor-converters/scientific-agent-skills/policy.ts.md) | src/vendor-converters/scientific-agent-skills/policy.ts | 加载并校验 Scientific Agent Skills 的准入、依赖、资源与人工安全复核策略，同时合并上游审计记录构成完整策略视图。 |
| [scientific-agent-skills-audit.test.ts](../../tests/scientific-agent-skills-audit.test.ts.md) | tests/scientific-agent-skills-audit.test.ts | Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。 |
| [security-review.ts](../vendor-converters/scientific-agent-skills/security-review.ts.md) | src/vendor-converters/scientific-agent-skills/security-review.ts | Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。 |
