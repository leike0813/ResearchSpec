
# src/vendor-converters/finrobot/complete-tree.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: file:src/vendor-converters/finrobot/complete-tree.ts -->

把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。
源码：[src/vendor-converters/finrobot/complete-tree.ts](../../../../../../src/vendor-converters/finrobot/complete-tree.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/finrobot/complete-tree.ts:assertTreeSafety -->
<!-- node: function:src/vendor-converters/finrobot/complete-tree.ts:readTree -->
<!-- node: function:src/vendor-converters/finrobot/complete-tree.ts:renderFinRobotCompleteTrees -->
<!-- node: function:src/vendor-converters/finrobot/complete-tree.ts:validateCompleteTree -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertTreeSafety | 函数 | 129–152 | 中等 | 安全校验、路径安全、vendor-converter | 0 | 断言树内文件路径全部为安全相对路径，且任何文件内容都不含私有路径、密钥形态或绝对路径等敏感值。 |
| readTree | 函数 | 103–113 | 简单 | utility、文件遍历、哈希 | 0 | 递归读取已编写 Skill 目录的全部文件，跳过符号链接并为每个文件计算 SHA-256。 |
| [renderFinRobotCompleteTrees](../../../../symbols/src/vendor-converters/finrobot/complete-tree.ts/renderFinRobotCompleteTrees.md) | 函数 | 31–101 | 复杂 | 代码生成、orchestration、哈希绑定 | 3 | 加载策略后按 Skill 契约排序渲染全部完整树，注入 LICENSE/NOTICE/DERIVATION 与共享支持库，并汇总出整组树哈希与审核状态。 |
| validateCompleteTree | 函数 | 115–127 | 简单 | 校验、契约、vendor-converter | 0 | 用共享非原生 Skill 标准校验渲染出的树是否满足必需章节、声明能力与分发文件要求。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [finrobot-converter.test.ts](../../../tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [finrobot-ingest-draft.test.ts](../../../tests/finrobot-ingest-draft.test.ts.md) | tests/finrobot-ingest-draft.test.ts | FinRobot 策略与完整树的离线一致性测试：校验 6 条准入、1049 条源条目、129 个知识面中 39 项映射到 Agent procedure 或标准库脚本，并确认树内文件构成与渐进式披露要求。 |
| [finrobot-preview.test.ts](../../../tests/finrobot-preview.test.ts.md) | tests/finrobot-preview.test.ts | FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。 |
| [preview.ts](preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertTreeSafety | 函数 | 129–152 | 断言树内文件路径全部为安全相对路径，且任何文件内容都不含私有路径、密钥形态或绝对路径等敏感值。 |
| [renderFinRobotCompleteTrees](../../../../symbols/src/vendor-converters/finrobot/complete-tree.ts/renderFinRobotCompleteTrees.md) | 函数 | 31–101 | 加载策略后按 Skill 契约排序渲染全部完整树，注入 LICENSE/NOTICE/DERIVATION 与共享支持库，并汇总出整组树哈希与审核状态。 |
