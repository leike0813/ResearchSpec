
# validateEvidenceMapAgainstAudit
<!-- node: function:src/vendor-evidence/education-agent-skills/index.ts:validateEvidenceMapAgainstAudit -->

校验证据映射与审计在快照标识、哈希、声明总数、evidence ID 顺序和逐条声明字段上完全一致。
类型：函数  
复杂度：复杂  
入边数：2  
标签：validation、evidence、integrity  
所属文件：[src/vendor-evidence/education-agent-skills/index.ts](../../../../../files/src/vendor-evidence/education-agent-skills/index.ts.md)
源码：[src/vendor-evidence/education-agent-skills/index.ts:44](../../../../../../../src/vendor-evidence/education-agent-skills/index.ts#L44)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadEducationAgentSkillsPolicies](../../../vendor-converters/education-agent-skills/policy.ts/loadEducationAgentSkillsPolicies.md) | src/vendor-converters/education-agent-skills/policy.ts:219–260 | 读取并校验生产策略、审计与证据映射三层输入，验证固定哈希、快照身份与声明总数，展开为运行时策略对象。 |
| [checkEducationAgentSkillsEvidenceArtifacts](../../../../../files/src/vendor-evidence/education-agent-skills/index.ts.md) | src/vendor-evidence/education-agent-skills/index.ts:178–207 | 比对已提交的证据映射 JSON 与报告同当前渲染结果，并返回差异说明。 |

## 调用

该符号没有记录对外调用。
