
# assemblePluginRegistry
<!-- node: function:src/plugins/assembler.ts:assemblePluginRegistry -->

加载领域目录与分类快照、逐个解析 vendor bundle 并合并为 PluginRegistry，校验通过后原子写入 registry.json。
类型：函数  
复杂度：中等  
入边数：5  
标签：装配、注册表、入口函数  
所属文件：[src/plugins/assembler.ts](../../../../files/src/plugins/assembler.ts.md)
源码：[src/plugins/assembler.ts:40](../../../../../../src/plugins/assembler.ts#L40)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [convertFinRobot](../../../../files/src/vendor-converters/finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts:80–102 | 执行一次 FinRobot 转换：断言策略已批准、校验前置条件、渲染完整树，在暂存目录生成后装配注册表，检测漂移后提交或仅返回 dry-run 清单。 |
| [convertHistAgent](../../../../files/src/vendor-converters/histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts:78–100 | 执行一次 HistAgent 转换：断言策略已批准、校验前置快照、渲染完整树并在暂存目录生成后提交或返回 dry-run 清单。 |
| [convertMaterials](../../../../files/src/vendor-converters/materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts:56–74 | 执行一次 Materials 转换：渲染完整树、校验上游来源、在暂存目录生成后装配注册表并提交或返回 dry-run 清单。 |
| [convertScientificAgentSkills](../../../../files/src/vendor-converters/scientific-agent-skills/converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts:67–86 | 执行一次 Scientific Agent Skills 转换：加载策略、校验上游来源、在暂存目录生成后装配注册表并提交或返回 dry-run 清单。 |
| [convertToolUniverse](../../../../files/src/vendor-converters/tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts:65–94 | 转换主流程：校验审计与决策、在临时 stage 生成 bundle、装配插件注册表，按需检测漂移后提交生成物。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validatePluginRegistry](../registry.ts/validatePluginRegistry.md) | src/plugins/registry.ts:142–210 | 校验域分类、vendor 定义、Skill 清单与保留 ID 冲突，组装领域映射并收集诊断。 |
| [loadAnzsrcSnapshot](../../../../files/src/plugins/taxonomy.ts.md) | src/plugins/taxonomy.ts:38–54 | 解析并校验 ANZSRC 快照：23 个 division、213 个 group、1967 个 field 数量固定、代码唯一，且 group 与 field 的父级代码前缀必须自洽。 |
