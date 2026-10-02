
# src/vendor-converters/scientific-agent-skills/security-review.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/scientific-agent-skills](../../../../modules/src/vendor-converters/scientific-agent-skills.md)
<!-- node: file:src/vendor-converters/scientific-agent-skills/security-review.ts -->

Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。
源码：[src/vendor-converters/scientific-agent-skills/security-review.ts](../../../../../../src/vendor-converters/scientific-agent-skills/security-review.ts)

## 符号（6）
<!-- node: function:src/vendor-converters/scientific-agent-skills/security-review.ts:assertScientificAgentSkillsSecurityReviewComplete -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/security-review.ts:loadScientificAgentSkillsIdentity -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/security-review.ts:loadScientificAgentSkillsSecurityReview -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/security-review.ts:resourceInventory -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/security-review.ts:securityReviewBatches -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/security-review.ts:validateScientificAgentSkillsSecurityReview -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertScientificAgentSkillsSecurityReviewComplete | 函数 | 207–215 | 中等 | validation、security-review、assertion | 0 | 断言评审已全部定案：无 pending 决策、攻击面已覆盖、每个 finding 都有分析与残余风险、适配项与裁定互相匹配。 |
| loadScientificAgentSkillsIdentity | 函数 | 98–105 | 简单 | vendor-converter、identity、audit、loader | 0 | 从维护目录解析固定的上游身份（release、revision、审计文件路径），并断言审计 JSON 中的 release/revision 与之一致。 |
| loadScientificAgentSkillsSecurityReview | 函数 | 118–126 | 简单 | vendor-converter、security-review、loader、validation | 0 | 读取 security-review-decisions.json 并通过完整校验后返回人工安全评审目录。 |
| resourceInventory | 函数 | 217–241 | 中等 | inventory、security-review、filesystem | 0 | 扫描上游某个 Skill 目录，生成文件级清单（路径与字节数）并统计 references、scripts、assets、测试与 env 模板等分类计数。 |
| securityReviewBatches | 函数 | 108–116 | 简单 | vendor-converter、security-review、batching | 0 | 把评审目录中的 Skill ID 按 batch 字段分组排序，供人工评审分批推进使用。 |
| validateScientificAgentSkillsSecurityReview | 函数 | 128–205 | 复杂 | validation、security-review、drift-detection、audit、invariant | 0 | 核心校验：逐条比对人工评审、审计记录、准入决策与实际资源清单，检测缺失评审、严重度漂移、证据越界、finding 身份错配以及不应出现或缺失的生产阻塞原因。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../../vendor-audits/contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |
| [scientific-agent-skills.ts](../../vendor-audits/scientific-agent-skills.ts.md) | src/vendor-audits/scientific-agent-skills.ts | Scientific Agent Skills 审计 schema：逐 Skill 的范围处置、摄入就绪度、上游安全复核结论与资源统计，外加上游分类和汇总计数。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/scientific-agent-skills/policy.ts | 加载并校验 Scientific Agent Skills 的准入、依赖、资源与人工安全复核策略，同时合并上游审计记录构成完整策略视图。 |
| [scientific-agent-skills-security-review.test.ts](../../../tests/scientific-agent-skills-security-review.test.ts.md) | tests/scientific-agent-skills-security-review.test.ts | 人工安全评审测试：确认必评 Skill 全部有结论、finding 数量与上游审计一致、评审完整，并验证 pending 决策、清单漂移、证据越界与不当适配会被拒绝。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertScientificAgentSkillsSecurityReviewComplete | 函数 | 207–215 | 断言评审已全部定案：无 pending 决策、攻击面已覆盖、每个 finding 都有分析与残余风险、适配项与裁定互相匹配。 |
| loadScientificAgentSkillsIdentity | 函数 | 98–105 | 从维护目录解析固定的上游身份（release、revision、审计文件路径），并断言审计 JSON 中的 release/revision 与之一致。 |
| loadScientificAgentSkillsSecurityReview | 函数 | 118–126 | 读取 security-review-decisions.json 并通过完整校验后返回人工安全评审目录。 |
| securityReviewBatches | 函数 | 108–116 | 把评审目录中的 Skill ID 按 batch 字段分组排序，供人工评审分批推进使用。 |
| validateScientificAgentSkillsSecurityReview | 函数 | 128–205 | 核心校验：逐条比对人工评审、审计记录、准入决策与实际资源清单，检测缺失评审、严重度漂移、证据越界、finding 身份错配以及不应出现或缺失的生产阻塞原因。 |
