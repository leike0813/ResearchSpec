
# tests/finrobot-preview.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/finrobot-preview.test.ts -->

FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。
源码：[tests/finrobot-preview.test.ts](../../../../tests/finrobot-preview.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](../src/vendor-converters/finrobot/complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [extensions.ts](../src/plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [finrobot.ts](../src/vendor-audits/finrobot.ts.md) | src/vendor-audits/finrobot.ts | FinRobot 审计的 zod schema 集合：受版本控制的源条目与 git 模式、内容来源、许可声明、129 个知识面与候选能力，以及 13 类运营风险枚举。 |
| [policy.ts](../src/vendor-converters/finrobot/policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [preview.ts](../src/vendor-converters/finrobot/preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |
