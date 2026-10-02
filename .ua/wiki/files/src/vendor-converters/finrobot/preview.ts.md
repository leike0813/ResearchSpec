
# src/vendor-converters/finrobot/preview.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: file:src/vendor-converters/finrobot/preview.ts -->

FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。
源码：[src/vendor-converters/finrobot/preview.ts](../../../../../../src/vendor-converters/finrobot/preview.ts)

## 符号（3）
<!-- node: function:src/vendor-converters/finrobot/preview.ts:finRobotCandidateDefinitions -->
<!-- node: function:src/vendor-converters/finrobot/preview.ts:finRobotCandidateInputs -->
<!-- node: function:src/vendor-converters/finrobot/preview.ts:previewFinRobot -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| finRobotCandidateDefinitions | 函数 | 19–21 | 简单 | utility、预览、契约复用 | 0 | 返回生产 Skill 定义的一份深拷贝，使候选预览复用同一套已审核能力契约而互不污染。 |
| finRobotCandidateInputs | 函数 | 23–32 | 简单 | 预览、数据映射、vendor-converter | 0 | 组装候选渲染所需的审计、策略、已编写树、支持库与上游源码路径。 |
| [previewFinRobot](../../../../symbols/src/vendor-converters/finrobot/preview.ts/previewFinRobot.md) | 函数 | 34–139 | 复杂 | 预览、校验、哈希绑定、vendor-converter | 1 | 校验预览根归属后渲染候选树，逐一核对上游源码存在性与字节一致，并输出候选树哈希、审核状态与扩展注册表校验结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [extensions.ts](../../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/finrobot/cli.ts | FinRobot vendor converter 的命令行入口，把 convert/check/idempotence/preview 四个子命令分派到 converter 与 preview 模块。 |
| [finrobot-preview.test.ts](../../../tests/finrobot-preview.test.ts.md) | tests/finrobot-preview.test.ts | FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| finRobotCandidateDefinitions | 函数 | 19–21 | 返回生产 Skill 定义的一份深拷贝，使候选预览复用同一套已审核能力契约而互不污染。 |
| finRobotCandidateInputs | 函数 | 23–32 | 组装候选渲染所需的审计、策略、已编写树、支持库与上游源码路径。 |
| [previewFinRobot](../../../../symbols/src/vendor-converters/finrobot/preview.ts/previewFinRobot.md) | 函数 | 34–139 | 校验预览根归属后渲染候选树，逐一核对上游源码存在性与字节一致，并输出候选树哈希、审核状态与扩展注册表校验结果。 |
