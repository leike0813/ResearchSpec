
# tests/finrobot-statements.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/finrobot-statements.test.ts -->

把候选财务报表 Skill 树连同共享支撑库搭到临时目录后运行真实 Python：验证期间窗口覆盖判定、跨源对齐、市值勾稽的证据要求、币种口径与增长口径。
源码：[tests/finrobot-statements.test.ts](../../../../tests/finrobot-statements.test.ts)

## 符号（12）
<!-- node: function:tests/finrobot-statements.test.ts:audit -->
<!-- node: function:tests/finrobot-statements.test.ts:metricsOf -->
<!-- node: function:tests/finrobot-statements.test.ts:prepareSkill -->
<!-- node: function:tests/finrobot-statements.test.ts:quarter -->
<!-- node: function:tests/finrobot-statements.test.ts:runJson -->
<!-- node: function:tests/finrobot-statements.test.ts:runStatus -->
<!-- node: function:tests/finrobot-statements.test.ts:statement-audit-aligns-cross-source-records-on-bounds-un -->
<!-- node: function:tests/finrobot-statements.test.ts:statement-audit-certifies-a-period-window-only-from-boun -->
<!-- node: function:tests/finrobot-statements.test.ts:statement-audit-needs-independent-price-and-share-lineag -->
<!-- node: function:tests/finrobot-statements.test.ts:statement-audit-reports-currency-caliber-and-only-uses-s -->
<!-- node: function:tests/finrobot-statements.test.ts:statement-metrics-report-revenue-growth-only-on-a-shared -->
<!-- node: function:tests/finrobot-statements.test.ts:statement-normalize-keeps-the-period-and-number-kind-fie -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| audit | 函数 | 316–318 | 简单 | test、helper、subprocess | 0 | 以 audit 子命令运行技能并返回类型化的审计结果。 |
| metricsOf | 函数 | 320–323 | 简单 | test、helper、subprocess | 0 | 以 metrics 子命令运行技能并返回按期间组织的指标列表。 |
| prepareSkill | 函数 | 306–314 | 简单 | test、helper、fixture | 0 | 把候选 Skill 树与共享支撑库复制到临时运行目录，构造可独立执行的技能副本。 |
| quarter | 函数 | 27–30 | 简单 | test、fixture、helper | 0 | 构造一个 2025 季度收入记录夹具，统一 statement、币种、单位、来源与区间字段。 |
| runJson | 函数 | 325–330 | 简单 | test、helper、subprocess | 0 | 写入输入载荷、运行子命令并读取解析后的 JSON 输出。 |
| runStatus | 函数 | 332–339 | 简单 | test、helper、subprocess | 0 | 以文件方式传入 --input/--output 运行子命令并返回退出码。 |
| statement-audit-aligns-cross-source-records-on-bounds-un | 函数 | 102–138 | 中等 | test、用例、断言 | 0 | 测试用例：statement audit aligns cross-source records on bounds, units, and declared lineage |
| statement-audit-certifies-a-period-window-only-from-boun | 函数 | 40–101 | 中等 | test、用例、断言 | 0 | 测试用例：statement audit certifies a period window only from bounded actual periods |
| statement-audit-needs-independent-price-and-share-lineag | 函数 | 139–184 | 中等 | test、用例、断言 | 0 | 测试用例：statement audit needs independent price and share lineage without converting share counts |
| statement-audit-reports-currency-caliber-and-only-uses-s | 函数 | 185–209 | 中等 | test、用例、断言 | 0 | 测试用例：statement audit reports currency caliber and only uses supplied exchange-rate evidence |
| statement-metrics-report-revenue-growth-only-on-a-shared | 函数 | 240–304 | 中等 | test、用例、断言 | 0 | 测试用例：statement metrics report revenue growth only on a shared chronological basis |
| statement-normalize-keeps-the-period-and-number-kind-fie | 函数 | 210–239 | 中等 | test、用例、断言 | 0 | 测试用例：statement normalize keeps the period and number-kind fields and still rejects mixed currencies |
