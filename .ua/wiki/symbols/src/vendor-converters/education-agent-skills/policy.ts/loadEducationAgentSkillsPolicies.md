
# loadEducationAgentSkillsPolicies
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:loadEducationAgentSkillsPolicies -->

读取并校验生产策略、审计与证据映射三层输入，验证固定哈希、快照身份与声明总数，展开为运行时策略对象。
类型：函数  
复杂度：复杂  
入边数：1  
标签：policy、validation、orchestration  
所属文件：[src/vendor-converters/education-agent-skills/policy.ts](../../../../../files/src/vendor-converters/education-agent-skills/policy.ts.md)
源码：[src/vendor-converters/education-agent-skills/policy.ts:219](../../../../../../../src/vendor-converters/education-agent-skills/policy.ts#L219)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [renderEducationCompleteTrees](../complete-tree.ts/renderEducationCompleteTrees.md) | src/vendor-converters/education-agent-skills/complete-tree.ts:41–91 | 加载生产策略与审计，渲染全部准入 Skill 的完整树并计算聚合哈希，是预览、转换与检查共用的唯一渲染源。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateEvidenceMapAgainstAudit](../../../vendor-evidence/education-agent-skills/index.ts/validateEvidenceMapAgainstAudit.md) | src/vendor-evidence/education-agent-skills/index.ts:44–84 | 校验证据映射与审计在快照标识、哈希、声明总数、evidence ID 顺序和逐条声明字段上完全一致。 |
