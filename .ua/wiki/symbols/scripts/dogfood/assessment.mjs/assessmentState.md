
# assessmentState
<!-- node: function:scripts/dogfood/assessment.mjs:assessmentState -->

读取某次尝试的验收状态文件，缺失时返回 pending。
类型：函数  
复杂度：简单  
入边数：3  
标签：state-management、utility、dogfooding  
所属文件：[scripts/dogfood/assessment.mjs](../../../../files/scripts/dogfood/assessment.mjs.md)
源码：[scripts/dogfood/assessment.mjs:10](../../../../../../scripts/dogfood/assessment.mjs#L10)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [drive](../../../../files/scripts/dogfood.mjs.md) | scripts/dogfood.mjs:181–238 | campaign 主循环：加锁、可选启动审阅服务、跑 init 矩阵、按宿主串行派发行为尝试并并行排队验收，最终写入 campaign 终态。 |
| [executeAssessment](../../../../files/scripts/dogfood.mjs.md) | scripts/dogfood.mjs:141–166 | 为已封存的尝试派发独立验收 worker，轮询验收状态直至 ready/failed，并在失败时记录原因。 |
| [startServer](../server.mjs/startServer.md) | scripts/dogfood/server.mjs:57–174 | 在 127.0.0.1 启动审阅 HTTP 服务，路由 campaign/场景/矩阵/会话证据与事件增量接口，并处理带 token 的评审写入。 |

## 调用

该符号没有记录对外调用。
