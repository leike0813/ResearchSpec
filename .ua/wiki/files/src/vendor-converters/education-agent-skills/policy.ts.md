
# src/vendor-converters/education-agent-skills/policy.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/education-agent-skills](../../../../modules/src/vendor-converters/education-agent-skills.md)
<!-- node: file:src/vendor-converters/education-agent-skills/policy.ts -->

Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。
源码：[src/vendor-converters/education-agent-skills/policy.ts](../../../../../../src/vendor-converters/education-agent-skills/policy.ts)

## 符号（8）
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:assertEducationProductionApproved -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:buildAdmission -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:buildEvidenceAdaptations -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:buildRelationships -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:buildSafetyDomains -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:excluded -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:loadEducationAgentSkillsPolicies -->
<!-- node: function:src/vendor-converters/education-agent-skills/policy.ts:validatePinnedSource -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertEducationProductionApproved | 函数 | 262–270 | 简单 | approval-gate、validation、hashing | 1 | 断言人工审批已把当前策略哈希与整树聚合哈希绑定为 approved，未审批则拒绝生产转换。 |
| buildAdmission | 函数 | 272–315 | 复杂 | policy、admission、compliance | 0 | 按原创框架与第三方作者两份固定排除集合逐 Skill 展开准入决策，并校验准入总数与贡献者来源。 |
| buildEvidenceAdaptations | 函数 | 317–349 | 复杂 | evidence-marking、policy、compliance | 0 | 把证据映射的每条声明绑定到规范化著作与存在性状态，决定该证据在 frontmatter 与正文中是否需要显式标记。 |
| buildRelationships | 函数 | 351–369 | 中等 | policy、relationships、compliance | 0 | 把审计中的 chains_well_with 声明展开为纯建议关系，明确不构成硬依赖。 |
| buildSafetyDomains | 函数 | 371–403 | 复杂 | policy、safety、domain-mapping | 0 | 为每个准入 Skill 展开安全边界与 ANZSRC 目标域决策，绑定边界键与风险项。 |
| excluded | 函数 | 424–436 | 中等 | policy、admission、factory | 0 | 为被排除的 Skill 构造带原因码的排除决定。 |
| [loadEducationAgentSkillsPolicies](../../../../symbols/src/vendor-converters/education-agent-skills/policy.ts/loadEducationAgentSkillsPolicies.md) | 函数 | 219–260 | 复杂 | policy、validation、orchestration | 1 | 读取并校验生产策略、审计与证据映射三层输入，验证固定哈希、快照身份与声明总数，展开为运行时策略对象。 |
| validatePinnedSource | 函数 | 405–422 | 中等 | validation、snapshot-pinning、git | 0 | 校验 vendor 目录的 Git revision 与 tree 与策略固定值一致，确保只针对已审快照转换。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](../../vendor-audits/education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |
| [index.ts](../../vendor-evidence/education-agent-skills/index.ts.md) | src/vendor-evidence/education-agent-skills/index.ts | 证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adaptation.ts](adaptation.ts.md) | src/vendor-converters/education-agent-skills/adaptation.ts | 把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。 |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/education-agent-skills/complete-tree.ts | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |
| [converter.ts](converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [education-agent-skills-ingest.test.ts](../../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertEducationProductionApproved | 函数 | 262–270 | 断言人工审批已把当前策略哈希与整树聚合哈希绑定为 approved，未审批则拒绝生产转换。 |
| [loadEducationAgentSkillsPolicies](../../../../symbols/src/vendor-converters/education-agent-skills/policy.ts/loadEducationAgentSkillsPolicies.md) | 函数 | 219–260 | 读取并校验生产策略、审计与证据映射三层输入，验证固定哈希、快照身份与声明总数，展开为运行时策略对象。 |
