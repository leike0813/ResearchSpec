
# src/vendor-converters/education-agent-skills/complete-tree.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/education-agent-skills](../../../../modules/src/vendor-converters/education-agent-skills.md)
<!-- node: file:src/vendor-converters/education-agent-skills/complete-tree.ts -->

渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。
源码：[src/vendor-converters/education-agent-skills/complete-tree.ts](../../../../../../src/vendor-converters/education-agent-skills/complete-tree.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/education-agent-skills/complete-tree.ts:renderEducationCompleteTrees -->
<!-- node: function:src/vendor-converters/education-agent-skills/complete-tree.ts:renderNotice -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [renderEducationCompleteTrees](../../../../symbols/src/vendor-converters/education-agent-skills/complete-tree.ts/renderEducationCompleteTrees.md) | 函数 | 41–91 | 复杂 | tree-generation、orchestration、hashing | 2 | 加载生产策略与审计，渲染全部准入 Skill 的完整树并计算聚合哈希，是预览、转换与检查共用的唯一渲染源。 |
| renderNotice | 函数 | 93–127 | 复杂 | legal-notice、rendering、licensing | 0 | 生成 LICENSE 与 NOTICE.md 文本，写明上游出处、CC BY-SA 4.0 义务、生成声明与边界约束。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adaptation.ts](adaptation.ts.md) | src/vendor-converters/education-agent-skills/adaptation.ts | 把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [education-agent-skills-ingest.test.ts](../../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |
| [preview.ts](preview.ts.md) | src/vendor-converters/education-agent-skills/preview.ts | 生成 Education Agent Skills 转换预览：渲染完整树并输出一份中文审阅报告与计数摘要，供人工在正式转换前核对准入范围。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [renderEducationCompleteTrees](../../../../symbols/src/vendor-converters/education-agent-skills/complete-tree.ts/renderEducationCompleteTrees.md) | 函数 | 41–91 | 加载生产策略与审计，渲染全部准入 Skill 的完整树并计算聚合哈希，是预览、转换与检查共用的唯一渲染源。 |
