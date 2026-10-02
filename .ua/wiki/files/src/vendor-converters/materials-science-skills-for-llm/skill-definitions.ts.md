
# src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: file:src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts -->

七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。
源码：[src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts](../../../../../../src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts)

## 符号（1）
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts:materialsSkillDefinition -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| materialsSkillDefinition | 函数 | 206–210 | 简单 | utility、skill-definition、查找 | 0 | 按 Skill ID 取出定义，未登记的 ID 直接抛错。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [converter.ts](converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [materials-science-skills-converter.test.ts](../../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| materialsSkillDefinition | 函数 | 206–210 | 按 Skill ID 取出定义，未登记的 ID 直接抛错。 |
