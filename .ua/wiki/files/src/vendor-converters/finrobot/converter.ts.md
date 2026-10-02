
# src/vendor-converters/finrobot/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: file:src/vendor-converters/finrobot/converter.ts -->

FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。
源码：[src/vendor-converters/finrobot/converter.ts](../../../../../../src/vendor-converters/finrobot/converter.ts)

## 符号（6）
<!-- node: function:src/vendor-converters/finrobot/converter.ts:checkFinRobotIdempotence -->
<!-- node: function:src/vendor-converters/finrobot/converter.ts:checkFinRobotOutput -->
<!-- node: function:src/vendor-converters/finrobot/converter.ts:convertFinRobot -->
<!-- node: function:src/vendor-converters/finrobot/converter.ts:generateBundle -->
<!-- node: function:src/vendor-converters/finrobot/converter.ts:manifestCapability -->
<!-- node: function:src/vendor-converters/finrobot/converter.ts:validatePrerequisites -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [checkFinRobotIdempotence](../../../../symbols/src/vendor-converters/finrobot/converter.ts/checkFinRobotIdempotence.md) | 函数 | 148–157 | 简单 | 幂等性、校验、vendor-converter | 2 | 重新生成一遍并与已提交输出比对，返回漂移路径列表以确认转换可重复。 |
| [checkFinRobotOutput](../../../../symbols/src/vendor-converters/finrobot/converter.ts/checkFinRobotOutput.md) | 函数 | 104–146 | 复杂 | 校验、生成物检查、vendor-converter | 1 | 校验已提交的 FinRobot 生成物是否符合当前策略、哈希与领域归属，汇总为 ok/errors/warnings 结果。 |
| convertFinRobot | 函数 | 80–102 | 中等 | 转换流水线、orchestration、entry-point | 1 | 执行一次 FinRobot 转换：断言策略已批准、校验前置条件、渲染完整树，在暂存目录生成后装配注册表，检测漂移后提交或仅返回 dry-run 清单。 |
| generateBundle | 函数 | 159–251 | 复杂 | 代码生成、转换流水线、哈希绑定 | 0 | 在暂存目录写出六个 Skill 树、vendor bundle、转换清单与生产领域统计，是生成物字节的唯一来源。 |
| manifestCapability | 函数 | 272–283 | 简单 | 数据映射、清单、vendor-converter | 1 | 把审计知识面映射为清单中的能力实现记录，包含实现种类与落盘路径。 |
| validatePrerequisites | 函数 | 253–266 | 简单 | 校验、前置条件、vendor-converter | 0 | 确认上游固定快照、审计文件及其 SHA-256 与策略声明一致，缺失或漂移时立即失败。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../../plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [production-vendors.ts](../shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/finrobot/cli.ts | FinRobot vendor converter 的命令行入口，把 convert/check/idempotence/preview 四个子命令分派到 converter 与 preview 模块。 |
| [finrobot-converter.test.ts](../../../tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [checkFinRobotIdempotence](../../../../symbols/src/vendor-converters/finrobot/converter.ts/checkFinRobotIdempotence.md) | 函数 | 148–157 | 重新生成一遍并与已提交输出比对，返回漂移路径列表以确认转换可重复。 |
| [checkFinRobotOutput](../../../../symbols/src/vendor-converters/finrobot/converter.ts/checkFinRobotOutput.md) | 函数 | 104–146 | 校验已提交的 FinRobot 生成物是否符合当前策略、哈希与领域归属，汇总为 ok/errors/warnings 结果。 |
| convertFinRobot | 函数 | 80–102 | 执行一次 FinRobot 转换：断言策略已批准、校验前置条件、渲染完整树，在暂存目录生成后装配注册表，检测漂移后提交或仅返回 dry-run 清单。 |
