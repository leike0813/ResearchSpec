
# tests/tooluniverse-adaptations.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/tooluniverse-adaptations.test.ts -->

ToolUniverse 语义适配规则测试：验证 FAERS 旧参数重写与 limit 钳制、CLI 行内字典修复、结果信封读取与迭代修正，同时确保非 FAERS 与分析类调用不被误改。
源码：[tests/tooluniverse-adaptations.test.ts](../../../../tests/tooluniverse-adaptations.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [semantic-adaptations.ts](../src/vendor-converters/tooluniverse/semantic-adaptations.ts.md) | src/vendor-converters/tooluniverse/semantic-adaptations.ts | ToolUniverse 已评审内容的语义适配规则集：修补 v1.3.1 到 v1.5.4 之间的工具契约漂移，按工具族、文件或 Skill 精确作用域生效。 |
