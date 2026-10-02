
# src/vendor-evidence/education-agent-skills/schema.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-evidence/education-agent-skills](../../../../modules/src/vendor-evidence/education-agent-skills.md)
<!-- node: file:src/vendor-evidence/education-agent-skills/schema.ts -->

证据映射的 zod 契约层：定义著作类型、存在性状态、映射类型、验证来源、逐条声明映射与 scholar 发现结果等结构，并校验唯一性与排序不变量。
源码：[src/vendor-evidence/education-agent-skills/schema.ts](../../../../../../src/vendor-evidence/education-agent-skills/schema.ts)

## 符号（2）
<!-- node: function:src/vendor-evidence/education-agent-skills/schema.ts:checkUniqueAndSorted -->
<!-- node: function:src/vendor-evidence/education-agent-skills/schema.ts:summarizeEvidenceMap -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkUniqueAndSorted | 函数 | 392–404 | 中等 | validation、invariants、determinism | 0 | 断言 ID 序列唯一且按字典序排列，为证据映射提供确定性不变量。 |
| summarizeEvidenceMap | 函数 | 354–390 | 复杂 | summarization、metrics、evidence | 0 | 统计声明、著作、多版本映射与 scholar 发现结果的数量分布，写入证据映射的 summary 字段。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [education-agent-skills.ts](../../vendor-audits/education-agent-skills.ts.md) | src/vendor-audits/education-agent-skills.ts | Education Agent Skills 上游快照的完整不可变审计实现：校验 snapshot-6bbbce4 身份、读取 Git 受跟踪清单、解析 165 个 Skill 的 frontmatter，并逐项判定受众、许可证、风险、证据强度与重叠关系，最终渲染审计 JSON 与 Markdown 报告。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](index.ts.md) | src/vendor-evidence/education-agent-skills/index.ts | 证据映射的运行时装配层：解析 evidence-map.json、校验其与不可变审计的绑定、渲染 evidence JSON 与 evidence-report.md，并提供与已提交产物的比对入口。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| summarizeEvidenceMap | 函数 | 354–390 | 统计声明、著作、多版本映射与 scholar 发现结果的数量分布，写入证据映射的 summary 字段。 |
