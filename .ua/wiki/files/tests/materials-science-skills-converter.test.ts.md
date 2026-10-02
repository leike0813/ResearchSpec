
# tests/materials-science-skills-converter.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/materials-science-skills-converter.test.ts -->

Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。
源码：[tests/materials-science-skills-converter.test.ts](../../../../tests/materials-science-skills-converter.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](../src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [converter.ts](../src/vendor-converters/materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](../src/vendor-converters/materials-science-skills-for-llm/policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [production-vendors.ts](../src/vendor-converters/shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [skill-definitions.ts](../src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts.md) | src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts | 七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。 |
| [staging.ts](../src/vendor-converters/shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
