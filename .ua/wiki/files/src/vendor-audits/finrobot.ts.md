
# src/vendor-audits/finrobot.ts
所属分层：[厂商 Skill 转换与审计层](../../../layers/vendor-converters.md)  
所属目录：[src/vendor-audits](../../../modules/src/vendor-audits.md)
<!-- node: file:src/vendor-audits/finrobot.ts -->

FinRobot 审计的 zod schema 集合：受版本控制的源条目与 git 模式、内容来源、许可声明、129 个知识面与候选能力，以及 13 类运营风险枚举。
源码：[src/vendor-audits/finrobot.ts](../../../../../src/vendor-audits/finrobot.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [finrobot-audit.test.ts](../../tests/finrobot-audit.test.ts.md) | tests/finrobot-audit.test.ts | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [finrobot-preview.test.ts](../../tests/finrobot-preview.test.ts.md) | tests/finrobot-preview.test.ts | FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。 |
| [policy.ts](../vendor-converters/finrobot/policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
