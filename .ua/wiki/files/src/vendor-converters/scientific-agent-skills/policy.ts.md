
# src/vendor-converters/scientific-agent-skills/policy.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/scientific-agent-skills](../../../../modules/src/vendor-converters/scientific-agent-skills.md)
<!-- node: file:src/vendor-converters/scientific-agent-skills/policy.ts -->

加载并校验 Scientific Agent Skills 的准入、依赖、资源与人工安全复核策略，同时合并上游审计记录构成完整策略视图。
源码：[src/vendor-converters/scientific-agent-skills/policy.ts](../../../../../../src/vendor-converters/scientific-agent-skills/policy.ts)

## 符号（3）
<!-- node: function:src/vendor-converters/scientific-agent-skills/policy.ts:loadScientificAgentSkillsPolicies -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/policy.ts:reviewEvidence -->
<!-- node: function:src/vendor-converters/scientific-agent-skills/policy.ts:validateScientificAgentSkillsPolicies -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadScientificAgentSkillsPolicies | 函数 | 91–104 | 简单 | 策略、加载器、安全评审 | 1 | 读取准入、依赖、资源策略 JSON 与人工安全复核目录，解析并返回聚合后的策略对象。 |
| reviewEvidence | 函数 | 170–179 | 简单 | 校验、证据、安全评审 | 0 | 校验某条人工复核结论的证据路径均存在且未逃逸出审计锚点目录。 |
| validateScientificAgentSkillsPolicies | 函数 | 106–168 | 复杂 | 校验、策略、生产决策 | 0 | 校验准入决定与审计条目一一对应、许可与人工复核证据文件真实存在、依赖与资源决定自洽。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../../vendor-audits/contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |
| [scientific-agent-skills.ts](../../vendor-audits/scientific-agent-skills.ts.md) | src/vendor-audits/scientific-agent-skills.ts | Scientific Agent Skills 审计 schema：逐 Skill 的范围处置、摄入就绪度、上游安全复核结论与资源统计，外加上游分类和汇总计数。 |
| [security-review.ts](security-review.ts.md) | src/vendor-converters/scientific-agent-skills/security-review.ts | Scientific Agent Skills 的人工安全评审层：定义评审目录的 Zod 契约，并交叉校验人工评审结论、固定审计身份、准入决策与上游实际文件清单之间的漂移。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [scientific-agent-skills-converter.test.ts](../../../tests/scientific-agent-skills-converter.test.ts.md) | tests/scientific-agent-skills-converter.test.ts | Scientific Agent Skills 转换测试：验证准入策略覆盖全部审计记录、人工安全评审与准入结论互相印证，且已生成 bundle 保留 632 个资源与规范化入口并通过输出与幂等校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| loadScientificAgentSkillsPolicies | 函数 | 91–104 | 读取准入、依赖、资源策略 JSON 与人工安全复核目录，解析并返回聚合后的策略对象。 |
| validateScientificAgentSkillsPolicies | 函数 | 106–168 | 校验准入决定与审计条目一一对应、许可与人工复核证据文件真实存在、依赖与资源决定自洽。 |
