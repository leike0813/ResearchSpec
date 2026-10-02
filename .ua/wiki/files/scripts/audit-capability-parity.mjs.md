
# scripts/audit-capability-parity.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/audit-capability-parity.mjs -->

能力包与上游抽取产物的对齐审计：按 provenance 选择 extraction-index，解析上游标题与规则，判定哪些规则在能力包文档中有覆盖并写出对齐报告。
源码：[scripts/audit-capability-parity.mjs](../../../../scripts/audit-capability-parity.mjs)

## 符号（3）
<!-- node: function:scripts/audit-capability-parity.mjs:auditPackage -->
<!-- node: function:scripts/audit-capability-parity.mjs:extractRules -->
<!-- node: function:scripts/audit-capability-parity.mjs:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| auditPackage | 函数 | 64–114 | 中等 | 审计、覆盖度、能力包 | 0 | 审计单个能力包：读取其 SKILL.md 标题与规则，逐条判定上游规则是否被覆盖并汇总缺失项。 |
| extractRules | 函数 | 37–46 | 简单 | 审计、规则抽取、解析 | 0 | 从上游文档中抽取可判定的规则条目，作为覆盖度比对的最小单位。 |
| main | 函数 | 116–139 | 中等 | 审计、入口点、报告生成 | 0 | 遍历 skills/capabilities 下的全部能力包执行审计并写出对齐报告。 |
