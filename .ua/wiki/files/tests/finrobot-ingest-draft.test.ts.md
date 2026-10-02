
# tests/finrobot-ingest-draft.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/finrobot-ingest-draft.test.ts -->

FinRobot 策略与完整树的离线一致性测试：校验 6 条准入、1049 条源条目、129 个知识面中 39 项映射到 Agent procedure 或标准库脚本，并确认树内文件构成与渐进式披露要求。
源码：[tests/finrobot-ingest-draft.test.ts](../../../../tests/finrobot-ingest-draft.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](../src/vendor-converters/finrobot/complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [policy.ts](../src/vendor-converters/finrobot/policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [skill-definitions.ts](../src/vendor-converters/finrobot/skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
