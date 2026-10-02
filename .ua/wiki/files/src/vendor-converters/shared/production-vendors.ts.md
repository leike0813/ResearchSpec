
# src/vendor-converters/shared/production-vendors.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/shared](../../../../modules/src/vendor-converters/shared.md)
<!-- node: file:src/vendor-converters/shared/production-vendors.ts -->

生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。
源码：[src/vendor-converters/shared/production-vendors.ts](../../../../../../src/vendor-converters/shared/production-vendors.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/shared/production-vendors.ts:loadProductionDomainCounts -->
<!-- node: function:src/vendor-converters/shared/production-vendors.ts:productionVendorInventoryErrors -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadProductionDomainCounts | 函数 | 13–16 | 简单 | domain-taxonomy、loader、utility | 0 | 读取域目录 JSON，返回内部域总数与非空可用域数量。 |
| productionVendorInventoryErrors | 函数 | 18–23 | 简单 | validation、vendor-inventory、invariant | 1 | 把实际注册的 vendor 集合与生产清单比对，不一致时返回可读错误说明。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](../education-agent-skills/converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [converter.ts](../finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../scientific-agent-skills/converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [converter.ts](../tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
| [finrobot-audit.test.ts](../../../tests/finrobot-audit.test.ts.md) | tests/finrobot-audit.test.ts | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [finrobot-converter.test.ts](../../../tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [histagent-audit.test.ts](../../../tests/histagent-audit.test.ts.md) | tests/histagent-audit.test.ts | HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。 |
| [histagent-converter.test.ts](../../../tests/histagent-converter.test.ts.md) | tests/histagent-converter.test.ts | HistAgent 生产转换测试：断言已发布 bundle 是经批准的三 Skill 完整树投影，树集合哈希、零硬依赖、域归属与输出校验、幂等性结论全部匹配。 |
| [materials-science-skills-converter.test.ts](../../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |
| [materials-science-skills-for-llm-audit.test.ts](../../../tests/materials-science-skills-for-llm-audit.test.ts.md) | tests/materials-science-skills-for-llm-audit.test.ts | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [scientific-agent-skills-audit.test.ts](../../../tests/scientific-agent-skills-audit.test.ts.md) | tests/scientific-agent-skills-audit.test.ts | Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。 |
| [scientific-agent-skills-converter.test.ts](../../../tests/scientific-agent-skills-converter.test.ts.md) | tests/scientific-agent-skills-converter.test.ts | Scientific Agent Skills 转换测试：验证准入策略覆盖全部审计记录、人工安全评审与准入结论互相印证，且已生成 bundle 保留 632 个资源与规范化入口并通过输出与幂等校验。 |
| [tooluniverse-audit.test.ts](../../../tests/tooluniverse-audit.test.ts.md) | tests/tooluniverse-audit.test.ts | ToolUniverse 不可变审计测试：校验 v1.5.4 固定源码身份、185 个 Skill 逐一覆盖、资源统计与证据路径复算，并确认安全发现、域归类与准入结论一致。 |
| [vendor-staging.test.ts](../../../tests/vendor-staging.test.ts.md) | tests/vendor-staging.test.ts | 共享暂存协议测试：遍历全部六个生产 vendor，断言提交目标 vendor 投影不会改动其他 vendor 的任何文件哈希。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| loadProductionDomainCounts | 函数 | 13–16 | 读取域目录 JSON，返回内部域总数与非空可用域数量。 |
| productionVendorInventoryErrors | 函数 | 18–23 | 把实际注册的 vendor 集合与生产清单比对，不一致时返回可读错误说明。 |
