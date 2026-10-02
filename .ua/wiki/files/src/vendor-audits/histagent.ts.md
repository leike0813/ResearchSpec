
# src/vendor-audits/histagent.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/histagent.ts -->

HistAgent 审计 schema：处置枚举、运行时权限、外部资源与安全发现记录，以及三个候选 Skill 的自包含执行契约和五层输出区分。
源码：[src/vendor-audits/histagent.ts](../../../../../src/vendor-audits/histagent.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [histagent-audit.test.ts](../../tests/histagent-audit.test.ts.md) | tests/histagent-audit.test.ts | HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。 |
| [policy.ts](../vendor-converters/histagent/policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |
