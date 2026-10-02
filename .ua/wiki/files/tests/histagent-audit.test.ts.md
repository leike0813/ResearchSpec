
# tests/histagent-audit.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/histagent-audit.test.ts -->

HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。
源码：[tests/histagent-audit.test.ts](../../../../tests/histagent-audit.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [histagent.ts](../src/vendor-audits/histagent.ts.md) | src/vendor-audits/histagent.ts | HistAgent 审计 schema：处置枚举、运行时权限、外部资源与安全发现记录，以及三个候选 Skill 的自包含执行契约和五层输出区分。 |
| [production-vendors.ts](../src/vendor-converters/shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [taxonomy.ts](../src/plugins/taxonomy.ts.md) | src/plugins/taxonomy.ts | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |
| [vendor-audit.ts](helpers/vendor-audit.ts.md) | tests/helpers/vendor-audit.ts | vendor 审计测试的共享断言工具：检查固定源码是否初始化、执行只读 git 查询、枚举顶层 Skill、汇总仓库资源统计并校验证据路径安全可读。 |
