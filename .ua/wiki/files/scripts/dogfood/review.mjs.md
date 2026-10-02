
# scripts/dogfood/review.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/review.mjs -->

人工评审导入、聚合与发布：校验证据哈希、断言完整性、评分门槛与判决自洽性，汇总成 campaign 报告，并在 init 投影全通过时把脱敏证据发布到 playbook 并更新 host-verification.md。
源码：[scripts/dogfood/review.mjs](../../../../../scripts/dogfood/review.mjs)

## 符号（6）
<!-- node: function:scripts/dogfood/review.mjs:acceptReviews -->
<!-- node: function:scripts/dogfood/review.mjs:aggregate -->
<!-- node: function:scripts/dogfood/review.mjs:importLegacy -->
<!-- node: function:scripts/dogfood/review.mjs:importReview -->
<!-- node: function:scripts/dogfood/review.mjs:report -->
<!-- node: function:scripts/dogfood/review.mjs:sessionFilesForExport -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [acceptReviews](../../../symbols/scripts/dogfood/review.mjs/acceptReviews.md) | 函数 | 17–64 | 复杂 | validation、review-gate、evidence-binding | 1 | 逐条校验人工评审：会话存在且未重复、证据未变更、断言与评分齐全、pass 结论满足门槛，冲突判定与封存状态自洽，最后落盘并归档旧评审。 |
| aggregate | 函数 | 66–76 | 简单 | aggregation、reporting、dogfooding | 0 | 按宿主与场景聚合尝试结果，统计 pass/fail/blocked/invalid 并推导行级状态。 |
| importLegacy | 函数 | 192–233 | 中等 | migration、import、legacy | 0 | 把历史 v1 evidence 树导入为只读 legacy campaign，复制清单与原始 trace 并记录缺失的证据缺口。 |
| importReview | 函数 | 11–15 | 简单 | review、validation、dogfooding | 0 | 读取评审 JSON，校验 schema 与 campaign 匹配后交给 acceptReviews 处理。 |
| [report](../../../symbols/scripts/dogfood/review.mjs/report.md) | 函数 | 80–177 | 复杂 | reporting、evidence-publishing、redaction | 1 | 生成 campaign Markdown 报告，并在 init 矩阵全通过时把脱敏后的证据、评估与清单发布到 playbook 并更新 host-verification.md。 |
| sessionFilesForExport | 函数 | 179–190 | 简单 | filesystem、utility、dogfooding | 0 | 递归列出会话目录下的全部文件相对路径，供证据导出使用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [lib.mjs](lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [dogfood-harness.test.mjs](../../tests/dogfood-harness.test.mjs.md) | tests/dogfood-harness.test.mjs | dogfooding harness 的 node:test 用例：覆盖冻结场景目录校验、fixture 前置条件、宿主与模型选择、审阅服务接口与路径防护、人工 pass 门槛、验收报告证据绑定以及历史 campaign 只读约束。 |
| [dogfood.mjs](../dogfood.mjs.md) | scripts/dogfood.mjs | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |
| [server.mjs](server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [acceptReviews](../../../symbols/scripts/dogfood/review.mjs/acceptReviews.md) | 函数 | 17–64 | 逐条校验人工评审：会话存在且未重复、证据未变更、断言与评分齐全、pass 结论满足门槛，冲突判定与封存状态自洽，最后落盘并归档旧评审。 |
| aggregate | 函数 | 66–76 | 按宿主与场景聚合尝试结果，统计 pass/fail/blocked/invalid 并推导行级状态。 |
| importLegacy | 函数 | 192–233 | 把历史 v1 evidence 树导入为只读 legacy campaign，复制清单与原始 trace 并记录缺失的证据缺口。 |
| importReview | 函数 | 11–15 | 读取评审 JSON，校验 schema 与 campaign 匹配后交给 acceptReviews 处理。 |
| [report](../../../symbols/scripts/dogfood/review.mjs/report.md) | 函数 | 80–177 | 生成 campaign Markdown 报告，并在 init 矩阵全通过时把脱敏后的证据、评估与清单发布到 playbook 并更新 host-verification.md。 |
| sessionFilesForExport | 函数 | 179–190 | 递归列出会话目录下的全部文件相对路径，供证据导出使用。 |
