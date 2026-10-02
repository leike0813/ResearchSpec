
# src/vendor-converters/education-agent-skills/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/education-agent-skills](../../../../modules/src/vendor-converters/education-agent-skills.md)
<!-- node: file:src/vendor-converters/education-agent-skills/converter.ts -->

Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。
源码：[src/vendor-converters/education-agent-skills/converter.ts](../../../../../../src/vendor-converters/education-agent-skills/converter.ts)

## 符号（5）
<!-- node: function:src/vendor-converters/education-agent-skills/converter.ts:checkEducationAgentSkillsIdempotence -->
<!-- node: function:src/vendor-converters/education-agent-skills/converter.ts:checkEducationAgentSkillsOutput -->
<!-- node: function:src/vendor-converters/education-agent-skills/converter.ts:convertEducationAgentSkills -->
<!-- node: function:src/vendor-converters/education-agent-skills/converter.ts:generateBundle -->
<!-- node: function:src/vendor-converters/education-agent-skills/converter.ts:renderReport -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkEducationAgentSkillsIdempotence | 函数 | 109–118 | 中等 | idempotence、validation、quality-gate | 0 | 将当前渲染结果投影到临时目录并与已生成内容比较，验证重复运行不会产生漂移。 |
| checkEducationAgentSkillsOutput | 函数 | 74–107 | 复杂 | validation、idempotence、quality-gate | 0 | 重新渲染并与磁盘上的插件产物逐文件比对，同时校验域注册表与生产域计数，返回全部差异。 |
| convertEducationAgentSkills | 函数 | 53–72 | 中等 | vendor-converter、entry-point、orchestration | 0 | 转换入口：加载策略与审计、断言生产审批、渲染完整树并在 staging 中提交，产出转换清单。 |
| generateBundle | 函数 | 120–184 | 复杂 | build-system、file-emission、hashing | 0 | 在 staging 目录写出每个准入 Skill 的 SKILL.md、LICENSE、NOTICE.md 与转换清单，并记录逐文件 disposition 与 SHA-256。 |
| renderReport | 函数 | 186–206 | 中等 | reporting、rendering、conversion-summary | 0 | 由转换清单渲染人类可读的转换报告，说明准入、排除与哈希绑定结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../../plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/education-agent-skills/complete-tree.ts | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [production-vendors.ts](../shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/education-agent-skills/cli.ts | Education Agent Skills vendor converter 的命令行入口，串联 preview、convert、check、idempotence 四个子命令并支持 --force/--dry-run/--json。 |
| [education-agent-skills-ingest.test.ts](../../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkEducationAgentSkillsIdempotence | 函数 | 109–118 | 将当前渲染结果投影到临时目录并与已生成内容比较，验证重复运行不会产生漂移。 |
| checkEducationAgentSkillsOutput | 函数 | 74–107 | 重新渲染并与磁盘上的插件产物逐文件比对，同时校验域注册表与生产域计数，返回全部差异。 |
| convertEducationAgentSkills | 函数 | 53–72 | 转换入口：加载策略与审计、断言生产审批、渲染完整树并在 staging 中提交，产出转换清单。 |
