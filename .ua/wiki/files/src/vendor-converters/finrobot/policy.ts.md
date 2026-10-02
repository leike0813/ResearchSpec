
# src/vendor-converters/finrobot/policy.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: file:src/vendor-converters/finrobot/policy.ts -->

FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。
源码：[src/vendor-converters/finrobot/policy.ts](../../../../../../src/vendor-converters/finrobot/policy.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/finrobot/policy.ts:assertFinRobotProductionReady -->
<!-- node: function:src/vendor-converters/finrobot/policy.ts:assertNoSensitiveValues -->
<!-- node: function:src/vendor-converters/finrobot/policy.ts:loadFinRobotDraftPolicies -->
<!-- node: function:src/vendor-converters/finrobot/policy.ts:validateFinRobotDraftPolicies -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertFinRobotProductionReady | 函数 | 351–353 | 简单 | 策略、门禁、生产决策 | 1 | 要求审核状态为 approved 才允许进入生产转换，pending-human-review 与 rejected 均直接失败。 |
| assertNoSensitiveValues | 函数 | 340–349 | 简单 | 安全校验、策略、敏感信息 | 0 | 扫描策略内容，拒绝出现密钥、令牌、绝对用户路径等不可分发的敏感值。 |
| [loadFinRobotDraftPolicies](../../../../symbols/src/vendor-converters/finrobot/policy.ts/loadFinRobotDraftPolicies.md) | 函数 | 225–246 | 中等 | 策略、加载器、哈希绑定 | 2 | 读取生产策略目录下的全部策略 JSON 与固定审计文件，并计算各策略文件的 SHA-256 供清单绑定。 |
| validateFinRobotDraftPolicies | 函数 | 248–338 | 复杂 | 校验、策略、生产决策 | 0 | 逐类校验策略决定与审计条目完全对应、来源证据存在、生成 Skill 命名与领域合法，并检查所有 Skill 定义的字节一致性。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [finrobot.ts](../../vendor-audits/finrobot.ts.md) | src/vendor-audits/finrobot.ts | FinRobot 审计的 zod schema 集合：受版本控制的源条目与 git 模式、内容来源、许可声明、129 个知识面与候选能力，以及 13 类运营风险枚举。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [finrobot-converter.test.ts](../../../tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [finrobot-ingest-draft.test.ts](../../../tests/finrobot-ingest-draft.test.ts.md) | tests/finrobot-ingest-draft.test.ts | FinRobot 策略与完整树的离线一致性测试：校验 6 条准入、1049 条源条目、129 个知识面中 39 项映射到 Agent procedure 或标准库脚本，并确认树内文件构成与渐进式披露要求。 |
| [finrobot-preview.test.ts](../../../tests/finrobot-preview.test.ts.md) | tests/finrobot-preview.test.ts | FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertFinRobotProductionReady | 函数 | 351–353 | 要求审核状态为 approved 才允许进入生产转换，pending-human-review 与 rejected 均直接失败。 |
| assertNoSensitiveValues | 函数 | 340–349 | 扫描策略内容，拒绝出现密钥、令牌、绝对用户路径等不可分发的敏感值。 |
| [loadFinRobotDraftPolicies](../../../../symbols/src/vendor-converters/finrobot/policy.ts/loadFinRobotDraftPolicies.md) | 函数 | 225–246 | 读取生产策略目录下的全部策略 JSON 与固定审计文件，并计算各策略文件的 SHA-256 供清单绑定。 |
| validateFinRobotDraftPolicies | 函数 | 248–338 | 逐类校验策略决定与审计条目完全对应、来源证据存在、生成 Skill 命名与领域合法，并检查所有 Skill 定义的字节一致性。 |
