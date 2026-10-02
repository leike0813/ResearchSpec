
# tests/non-native-vendor-skill-standard.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/non-native-vendor-skill-standard.test.ts -->

非原生 Skill 共享标准的契约测试：验证纯指令式 Skill 无需 runner 或机器 schema 即可通过，脚本/状态/资源/引用/外部工具扩展可自由组合，并以表格驱动方式断言每类可观察失败的稳定诊断码。
源码：[tests/non-native-vendor-skill-standard.test.ts](../../../../tests/non-native-vendor-skill-standard.test.ts)

## 符号（2）
<!-- node: function:tests/non-native-vendor-skill-standard.test.ts:baselineFixture -->
<!-- node: function:tests/non-native-vendor-skill-standard.test.ts:extendedFixture -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| baselineFixture | 函数 | 133–211 | 中等 | test-helper、fixture、skill-standard | 0 | 构造最小可用的纯指令式 Skill fixture：定义、SKILL.md、LICENSE/NOTICE/DERIVATION 与首个动作锚点齐备。 |
| extendedFixture | 函数 | 213–288 | 中等 | test-helper、fixture、skill-standard | 0 | 在基线之上叠加脚本、状态、资源、引用路由与外部工具能力的完整 fixture，用于验证扩展可组合。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../src/vendor-converters/shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |
