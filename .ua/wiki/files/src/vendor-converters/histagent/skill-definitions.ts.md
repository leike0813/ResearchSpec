
# src/vendor-converters/histagent/skill-definitions.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: file:src/vendor-converters/histagent/skill-definitions.ts -->

三个 histagent-* Skill 的非原生 Skill 契约定义表：能力与命令映射、入口点调用方式、支持库引用和条件读取的 references。
源码：[src/vendor-converters/histagent/skill-definitions.ts](../../../../../../src/vendor-converters/histagent/skill-definitions.ts)

## 符号（1）
<!-- node: function:src/vendor-converters/histagent/skill-definitions.ts:histAgentSkillDefinition -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| histAgentSkillDefinition | 函数 | 109–113 | 简单 | utility、skill-definition、查找 | 1 | 按 Skill ID 取出定义，未登记的 ID 直接抛错，供渲染与检查共用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [histagent-ingest-draft.test.ts](../../../tests/histagent-ingest-draft.test.ts.md) | tests/histagent-ingest-draft.test.ts | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| histAgentSkillDefinition | 函数 | 109–113 | 按 Skill ID 取出定义，未登记的 ID 直接抛错，供渲染与检查共用。 |
