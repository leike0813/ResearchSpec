
# src/plugins/taxonomy.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/taxonomy.ts -->

ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。
源码：[src/plugins/taxonomy.ts](../../../../../src/plugins/taxonomy.ts)

## 符号（2）
<!-- node: function:src/plugins/taxonomy.ts:anzsrcGroupDomainId -->
<!-- node: function:src/plugins/taxonomy.ts:loadAnzsrcSnapshot -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| anzsrcGroupDomainId | 函数 | 56–64 | 简单 | utility、slug、分类体系 | 1 | 把 ANZSRC Group 标题规范化为领域 ID：NFKD 去重音、小写、& 转 and、非字母数字折叠为连字符。 |
| loadAnzsrcSnapshot | 函数 | 38–54 | 中等 | 分类体系、校验、加载器 | 1 | 解析并校验 ANZSRC 快照：23 个 division、213 个 group、1967 个 field 数量固定、代码唯一，且 group 与 field 的父级代码前缀必须自洽。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [domain-taxonomy.test.ts](../../tests/domain-taxonomy.test.ts.md) | tests/domain-taxonomy.test.ts | 领域分类体系测试：校验 ANZSRC 2020 快照层级与署名、内部目录覆盖 213 个 Group 与 5 个工具域，以及各 vendor 审计记录的 Field 元数据合法性。 |
| [finrobot-audit.test.ts](../../tests/finrobot-audit.test.ts.md) | tests/finrobot-audit.test.ts | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [histagent-audit.test.ts](../../tests/histagent-audit.test.ts.md) | tests/histagent-audit.test.ts | HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。 |
| [materials-science-skills-for-llm-audit.test.ts](../../tests/materials-science-skills-for-llm-audit.test.ts.md) | tests/materials-science-skills-for-llm-audit.test.ts | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [scientific-agent-skills-audit.test.ts](../../tests/scientific-agent-skills-audit.test.ts.md) | tests/scientific-agent-skills-audit.test.ts | Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。 |
| [tooluniverse-audit.test.ts](../../tests/tooluniverse-audit.test.ts.md) | tests/tooluniverse-audit.test.ts | ToolUniverse 不可变审计测试：校验 v1.5.4 固定源码身份、185 个 Skill 逐一覆盖、资源统计与证据路径复算，并确认安全发现、域归类与准入结论一致。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| anzsrcGroupDomainId | 函数 | 56–64 | 把 ANZSRC Group 标题规范化为领域 ID：NFKD 去重音、小写、& 转 and、非字母数字折叠为连字符。 |
| loadAnzsrcSnapshot | 函数 | 38–54 | 解析并校验 ANZSRC 快照：23 个 division、213 个 group、1967 个 field 数量固定、代码唯一，且 group 与 field 的父级代码前缀必须自洽。 |
