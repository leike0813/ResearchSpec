
# startServer
<!-- node: function:scripts/dogfood/server.mjs:startServer -->

在 127.0.0.1 启动审阅 HTTP 服务，路由 campaign/场景/矩阵/会话证据与事件增量接口，并处理带 token 的评审写入。
类型：函数  
复杂度：复杂  
入边数：1  
标签：http-server、api-handler、security  
所属文件：[scripts/dogfood/server.mjs](../../../../files/scripts/dogfood/server.mjs.md)
源码：[scripts/dogfood/server.mjs:57](../../../../../../scripts/dogfood/server.mjs#L57)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [drive](../../../../files/scripts/dogfood.mjs.md) | scripts/dogfood.mjs:181–238 | campaign 主循环：加锁、可选启动审阅服务、跑 init 矩阵、按宿主串行派发行为尝试并并行排队验收，最终写入 campaign 终态。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [assessmentState](../assessment.mjs/assessmentState.md) | scripts/dogfood/assessment.mjs:10–13 | 读取某次尝试的验收状态文件，缺失时返回 pending。 |
| [acceptReviews](../review.mjs/acceptReviews.md) | scripts/dogfood/review.mjs:17–64 | 逐条校验人工评审：会话存在且未重复、证据未变更、断言与评分齐全、pass 结论满足门槛，冲突判定与封存状态自洽，最后落盘并归档旧评审。 |
