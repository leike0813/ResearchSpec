
# tests/scientific-agent-skills-security-review.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/scientific-agent-skills-security-review.test.ts -->

人工安全评审测试：确认必评 Skill 全部有结论、finding 数量与上游审计一致、评审完整，并验证 pending 决策、清单漂移、证据越界与不当适配会被拒绝。
源码：[tests/scientific-agent-skills-security-review.test.ts](../../../../tests/scientific-agent-skills-security-review.test.ts)

## 符号（1）
<!-- node: function:tests/scientific-agent-skills-security-review.test.ts:requiredReviewSkillIds -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| requiredReviewSkillIds | 函数 | 109–117 | 简单 | test-helper、security-review、invariant | 0 | 按准入决策与固定审计身份推导出必须有人工安全评审的 Skill ID 集合。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [security-review.ts](../src/vendor-converters/scientific-agent-skills/security-review.ts.md) | src/vendor-converters/scientific-agent-skills/security-review.ts | Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。 |
