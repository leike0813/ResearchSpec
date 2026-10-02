
# tests/histagent-ingest-draft.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/histagent-ingest-draft.test.ts -->

HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。
源码：[tests/histagent-ingest-draft.test.ts](../../../../tests/histagent-ingest-draft.test.ts)

## 符号（1）
<!-- node: function:tests/histagent-ingest-draft.test.ts:invoke -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| invoke | 函数 | 232–250 | 中等 | test-helper、subprocess、isolation | 0 | 在临时 Skill 树中以隔离环境运行其 Python 脚本，断言只输出单行 JSON 并解析为调用结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](../src/vendor-converters/histagent/complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [index.ts](../src/vendor-converters/shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |
| [policy.ts](../src/vendor-converters/histagent/policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |
| [skill-definitions.ts](../src/vendor-converters/histagent/skill-definitions.ts.md) | src/vendor-converters/histagent/skill-definitions.ts | 三个 histagent-* Skill 的非原生 Skill 契约定义表：能力与命令映射、入口点调用方式、支持库引用和条件读取的 references。 |
