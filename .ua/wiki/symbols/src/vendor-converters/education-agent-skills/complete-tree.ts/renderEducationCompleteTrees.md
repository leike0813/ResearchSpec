
# renderEducationCompleteTrees
<!-- node: function:src/vendor-converters/education-agent-skills/complete-tree.ts:renderEducationCompleteTrees -->

加载生产策略与审计，渲染全部准入 Skill 的完整树并计算聚合哈希，是预览、转换与检查共用的唯一渲染源。
类型：函数  
复杂度：复杂  
入边数：2  
标签：tree-generation、orchestration、hashing  
所属文件：[src/vendor-converters/education-agent-skills/complete-tree.ts](../../../../../files/src/vendor-converters/education-agent-skills/complete-tree.ts.md)
源码：[src/vendor-converters/education-agent-skills/complete-tree.ts:41](../../../../../../../src/vendor-converters/education-agent-skills/complete-tree.ts#L41)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [generateBundle](../../../../../files/src/vendor-converters/education-agent-skills/converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts:120–184 | 在 staging 目录写出每个准入 Skill 的 SKILL.md、LICENSE、NOTICE.md 与转换清单，并记录逐文件 disposition 与 SHA-256。 |
| [writeEducationAgentSkillsPreview](../../../../../files/src/vendor-converters/education-agent-skills/preview.ts.md) | src/vendor-converters/education-agent-skills/preview.ts:9–60 | 清空并重建预览目录，写入中文审阅报告与结构化预览数据，返回审阅状态、整树哈希与准入数量。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [adaptEducationSkill](../adaptation.ts/adaptEducationSkill.md) | src/vendor-converters/education-agent-skills/adaptation.ts:32–73 | 改编入口：按准入、安全与证据策略生成授权 SKILL.md 正文，返回正文、标记正文、证据匹配区间与未匹配证据 ID。 |
| [loadEducationAgentSkillsPolicies](../policy.ts/loadEducationAgentSkillsPolicies.md) | src/vendor-converters/education-agent-skills/policy.ts:219–260 | 读取并校验生产策略、审计与证据映射三层输入，验证固定哈希、快照身份与声明总数，展开为运行时策略对象。 |
