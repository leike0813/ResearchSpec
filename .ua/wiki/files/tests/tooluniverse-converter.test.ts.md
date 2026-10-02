
# tests/tooluniverse-converter.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/tooluniverse-converter.test.ts -->

ToolUniverse 转换产物测试：断言 130 准入 / 55 排除、226 条依赖边分类、被排除资源的理由，以及生成 bundle 的输出校验、幂等性与静态权威与署名契约。
源码：[tests/tooluniverse-converter.test.ts](../../../../tests/tooluniverse-converter.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](../src/vendor-converters/tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
