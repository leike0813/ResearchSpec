
# src/plugins/assembler.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/assembler.ts -->

中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。
源码：[src/plugins/assembler.ts](../../../../../src/plugins/assembler.ts)

## 符号（2）
<!-- node: function:src/plugins/assembler.ts:assemblePluginRegistry -->
<!-- node: function:src/plugins/assembler.ts:validateCatalog -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [assemblePluginRegistry](../../../symbols/src/plugins/assembler.ts/assemblePluginRegistry.md) | 函数 | 40–66 | 中等 | 装配、注册表、入口函数 | 5 | 加载领域目录与分类快照、逐个解析 vendor bundle 并合并为 PluginRegistry，校验通过后原子写入 registry.json。 |
| validateCatalog | 函数 | 68–92 | 中等 | 校验、数据完整性、领域分类 | 0 | 校验领域目录中 domain_id 唯一、每个学科领域与对应 ANZSRC Group 的标题和 slug 一致，并要求 213 个学科领域与 5 个工具领域恰好齐备。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [registry.ts](registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [taxonomy.ts](taxonomy.ts.md) | src/plugins/taxonomy.ts | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [converter.ts](../vendor-converters/education-agent-skills/converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [converter.ts](../vendor-converters/finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../vendor-converters/histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../vendor-converters/materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../vendor-converters/scientific-agent-skills/converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [converter.ts](../vendor-converters/tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [assemblePluginRegistry](../../../symbols/src/plugins/assembler.ts/assemblePluginRegistry.md) | 函数 | 40–66 | 加载领域目录与分类快照、逐个解析 vendor bundle 并合并为 PluginRegistry，校验通过后原子写入 registry.json。 |
