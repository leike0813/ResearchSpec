
# tests/education-agent-skills-ingest.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/education-agent-skills-ingest.test.ts -->

转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。
源码：[tests/education-agent-skills-ingest.test.ts](../../../../tests/education-agent-skills-ingest.test.ts)

## 符号（1）
<!-- node: function:tests/education-agent-skills-ingest.test.ts:assertMarkerIntegrity -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertMarkerIntegrity | 函数 | 214–226 | 中等 | test、validation、markers | 0 | 检查生成 SKILL.md 中边界区块与证据标记成对出现且顺序正确，防止改编过程丢标记。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adaptation.ts](../src/vendor-converters/education-agent-skills/adaptation.ts.md) | src/vendor-converters/education-agent-skills/adaptation.ts | 把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。 |
| [complete-tree.ts](../src/vendor-converters/education-agent-skills/complete-tree.ts.md) | src/vendor-converters/education-agent-skills/complete-tree.ts | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |
| [converter.ts](../src/vendor-converters/education-agent-skills/converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [policy.ts](../src/vendor-converters/education-agent-skills/policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [preview.ts](../src/vendor-converters/education-agent-skills/preview.ts.md) | src/vendor-converters/education-agent-skills/preview.ts | 生成 Education Agent Skills 转换预览：渲染完整树并输出一份中文审阅报告与计数摘要，供人工在正式转换前核对准入范围。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
