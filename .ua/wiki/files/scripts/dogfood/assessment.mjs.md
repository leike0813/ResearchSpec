
# scripts/dogfood/assessment.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/dogfood](../../../modules/scripts/dogfood.md)
<!-- node: file:scripts/dogfood/assessment.mjs -->

独立验收报告的校验与落盘：确认尝试证据已封存且未变更，逐项校验行动、交付物、前置条件、硬断言、四项评分与建议结论的证据引用，并渲染中文 Markdown 报告。
源码：[scripts/dogfood/assessment.mjs](../../../../../scripts/dogfood/assessment.mjs)

## 符号（5）
<!-- node: function:scripts/dogfood/assessment.mjs:assessmentState -->
<!-- node: function:scripts/dogfood/assessment.mjs:markdown -->
<!-- node: function:scripts/dogfood/assessment.mjs:refs -->
<!-- node: function:scripts/dogfood/assessment.mjs:saveAssessment -->
<!-- node: function:scripts/dogfood/assessment.mjs:validateAssessment -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [assessmentState](../../../symbols/scripts/dogfood/assessment.mjs/assessmentState.md) | 函数 | 10–13 | 简单 | state-management、utility、dogfooding | 3 | 读取某次尝试的验收状态文件，缺失时返回 pending。 |
| markdown | 函数 | 38–60 | 中等 | report、serialization、markdown | 0 | 把结构化验收报告渲染为面向人工审阅的中文 Markdown，含结论摘要、宿主行动、交付物、断言、评分与限制说明。 |
| refs | 函数 | 15–33 | 中等 | validation、evidence-binding、security | 0 | 过滤并就地收敛证据引用：校验事件序号、区间或白名单文件行号有效，且每条结论至少引用一处实测记录而非仅场景合同。 |
| saveAssessment | 函数 | 98–105 | 简单 | persistence、report、validation | 1 | 校验通过后写入 report.json、report.md 与 ready 状态，返回结构化报告。 |
| validateAssessment | 函数 | 62–96 | 复杂 | validation、evidence-binding、rubric | 0 | 校验验收草稿的完整性与证据绑定，确认尝试证据封存未变，并按 pass 门槛复核前置条件、断言与评分。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [lib.mjs](lib.mjs.md) | scripts/dogfood/lib.mjs | dogfooding harness 的共享基础库：campaign/attempt/assessment/matrix 目录解析与 ID 校验、原子 JSON 写入、场景目录加载与哈希校验、构建哈希、证据哈希、宿主选择解析与 fixture 前置条件校验。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assessment-worker.mjs](assessment-worker.mjs.md) | scripts/dogfood/assessment-worker.mjs | 验收 worker 入口：组装场景、尝试与评分量表 packet，在 bubblewrap 沙箱内以只读证据目录驱动验收 Agent，读取其 assessment.json 并交回校验落盘，失败时写入状态与原因。 |
| [dogfood-harness.test.mjs](../../tests/dogfood-harness.test.mjs.md) | tests/dogfood-harness.test.mjs | dogfooding harness 的 node:test 用例：覆盖冻结场景目录校验、fixture 前置条件、宿主与模型选择、审阅服务接口与路径防护、人工 pass 门槛、验收报告证据绑定以及历史 campaign 只读约束。 |
| [dogfood.mjs](../dogfood.mjs.md) | scripts/dogfood.mjs | 维护者 dogfooding campaign 的协调器 CLI：按 plan/run/resume/retry/assess/serve/import-review/report/legacy-import 分发子命令，负责冻结场景目录与构建哈希、预检 bwrap 与宿主二进制、经 Orca 终端派发行为与验收 worker、并维护 campaign 锁与并发队列。 |
| [server.mjs](server.mjs.md) | scripts/dogfood/server.mjs | 本地只读审阅服务：暴露 campaign、场景、矩阵用例与会话证据的 JSON 接口及增量事件流，审阅写入需携带本地 token 并通过同源校验，静态资源取自 harness/dogfood/public。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [assessmentState](../../../symbols/scripts/dogfood/assessment.mjs/assessmentState.md) | 函数 | 10–13 | 读取某次尝试的验收状态文件，缺失时返回 pending。 |
| markdown | 函数 | 38–60 | 把结构化验收报告渲染为面向人工审阅的中文 Markdown，含结论摘要、宿主行动、交付物、断言、评分与限制说明。 |
| refs | 函数 | 15–33 | 过滤并就地收敛证据引用：校验事件序号、区间或白名单文件行号有效，且每条结论至少引用一处实测记录而非仅场景合同。 |
| saveAssessment | 函数 | 98–105 | 校验通过后写入 report.json、report.md 与 ready 状态，返回结构化报告。 |
| validateAssessment | 函数 | 62–96 | 校验验收草稿的完整性与证据绑定，确认尝试证据封存未变，并按 pass 门槛复核前置条件、断言与评分。 |
