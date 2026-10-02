
# src/vendor-converters/tooluniverse/semantic-adaptations.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/tooluniverse](../../../../modules/src/vendor-converters/tooluniverse.md)
<!-- node: file:src/vendor-converters/tooluniverse/semantic-adaptations.ts -->

ToolUniverse 已评审内容的语义适配规则集：修补 v1.3.1 到 v1.5.4 之间的工具契约漂移，按工具族、文件或 Skill 精确作用域生效。
源码：[src/vendor-converters/tooluniverse/semantic-adaptations.ts](../../../../../../src/vendor-converters/tooluniverse/semantic-adaptations.ts)

## 符号（10）
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptAdmetRuntimeBoundary -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptFaersEnvelopeIteration -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptFaersEnvelopeReads -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptFaersParameterTables -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptFaersRunDictionaries -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptFaersToolCalls -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptRetiredEqtlRoutes -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptReviewedContent -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:adaptServiceBoundaries -->
<!-- node: function:src/vendor-converters/tooluniverse/semantic-adaptations.ts:rewriteFaersArgs -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| adaptAdmetRuntimeBoundary | 函数 | 308–320 | 简单 | semantic-adaptation、boundary、admet | 0 | 收敛 ADMET 预测 Skill 的运行时边界表述，明确由目标 Agent 的用户授权配置决定。 |
| adaptFaersEnvelopeIteration | 函数 | 248–282 | 中等 | semantic-adaptation、faers、contract-migration | 0 | 修正对 FAERS 结果列表的 for 循环写法，使迭代目标与新信封结构匹配。 |
| adaptFaersEnvelopeReads | 函数 | 219–242 | 中等 | semantic-adaptation、faers、precision | 0 | 只针对真正持有结果的变量改写 FAERS 结果信封字段读取，避免误改其他表达式。 |
| adaptFaersParameterTables | 函数 | 163–179 | 中等 | semantic-adaptation、documentation、faers | 0 | 同步修正 Markdown 参数表中的 FAERS 工具名与参数列，保证文档与实际调用一致。 |
| adaptFaersRunDictionaries | 函数 | 182–197 | 中等 | semantic-adaptation、faers、cli | 0 | 修复 `tu run` 行内 JSON 字典中的 FAERS 旧键，覆盖单引号与双引号两种写法。 |
| adaptFaersToolCalls | 函数 | 93–114 | 中等 | semantic-adaptation、faers、tooluniverse | 0 | 识别 FAERS 工具调用形态（含 tu.tools 前缀与 CLI 简写）并对参数执行重写。 |
| adaptRetiredEqtlRoutes | 函数 | 285–295 | 简单 | semantic-adaptation、contract-migration、tooluniverse | 0 | 处理上游已下线的 eQTL 路由，改为当前可用的等价工具路径。 |
| [adaptReviewedContent](../../../../symbols/src/vendor-converters/tooluniverse/semantic-adaptations.ts/adaptReviewedContent.md) | 函数 | 26–90 | 复杂 | semantic-adaptation、entry-point、dispatch、tooluniverse | 1 | 唯一导出的分派入口：按 skillId 与相对路径判定适用规则，串联多条适配后返回最终内容。 |
| adaptServiceBoundaries | 函数 | 401–411 | 简单 | semantic-adaptation、boundary、dispatch | 0 | 按 Skill 分派服务边界适配，把统计与监管变体等表述收敛到 ResearchSpec 的权限边界内。 |
| rewriteFaersArgs | 函数 | 116–160 | 复杂 | semantic-adaptation、faers、contract-migration | 0 | 逐参数重命名 FAERS 旧键为新契约键，并按上限钳制 search 与 count 的 limit。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
| [tooluniverse-adaptations.test.ts](../../../tests/tooluniverse-adaptations.test.ts.md) | tests/tooluniverse-adaptations.test.ts | ToolUniverse 语义适配规则测试：验证 FAERS 旧参数重写与 limit 钳制、CLI 行内字典修复、结果信封读取与迭代修正，同时确保非 FAERS 与分析类调用不被误改。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [adaptReviewedContent](../../../../symbols/src/vendor-converters/tooluniverse/semantic-adaptations.ts/adaptReviewedContent.md) | 函数 | 26–90 | 唯一导出的分派入口：按 skillId 与相对路径判定适用规则，串联多条适配后返回最终内容。 |
