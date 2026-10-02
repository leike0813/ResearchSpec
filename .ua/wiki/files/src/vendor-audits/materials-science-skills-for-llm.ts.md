
# src/vendor-audits/materials-science-skills-for-llm.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/materials-science-skills-for-llm.ts -->

Materials-Science-Skills-For-LLM 审计 schema：12 个上游 Skill 的 frontmatter 校验、范围处置与摄入就绪度、运营风险与重叠判断，以及整体汇总计数。
源码：[src/vendor-audits/materials-science-skills-for-llm.ts](../../../../../src/vendor-audits/materials-science-skills-for-llm.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [materials-science-skills-for-llm-audit.test.ts](../../tests/materials-science-skills-for-llm-audit.test.ts.md) | tests/materials-science-skills-for-llm-audit.test.ts | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [policy.ts](../vendor-converters/materials-science-skills-for-llm/policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
