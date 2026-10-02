
# tests/arsu-maintenance.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/arsu-maintenance.test.ts -->

校验 ARSU 审计锚点的摄取、转换、审阅与语义审阅表完整，HTML 产物落在统一审计目录，且 check 子命令与语义审阅渲染按所选锚点工作。
源码：[tests/arsu-maintenance.test.ts](../../../../tests/arsu-maintenance.test.ts)

## 符号（4）
<!-- node: function:tests/arsu-maintenance.test.ts:current-arsu-anchor-audit-check-passes -->
<!-- node: function:tests/arsu-maintenance.test.ts:first-arsu-anchor-html-artifacts-live-in-the-unified-aud -->
<!-- node: function:tests/arsu-maintenance.test.ts:first-arsu-anchor-records-contain-full-ingestion-convers -->
<!-- node: function:tests/arsu-maintenance.test.ts:semantic-review-rendering-uses-the-selected-anchor-and-r -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| current-arsu-anchor-audit-check-passes | 函数 | 32–38 | 中等 | test、用例、断言 | 0 | 测试用例：current ARSU anchor audit check passes |
| first-arsu-anchor-html-artifacts-live-in-the-unified-aud | 函数 | 25–30 | 中等 | test、用例、断言 | 0 | 测试用例：first ARSU anchor HTML artifacts live in the unified audit directory |
| first-arsu-anchor-records-contain-full-ingestion-convers | 函数 | 8–23 | 中等 | test、用例、断言 | 0 | 测试用例：first ARSU anchor records contain full ingestion, conversion and review tables |
| semantic-review-rendering-uses-the-selected-anchor-and-r | 函数 | 40–57 | 中等 | test、用例、断言 | 0 | 测试用例：semantic review rendering uses the selected anchor and reports missing review |
