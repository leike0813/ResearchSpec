
# acceptReviews
<!-- node: function:scripts/dogfood/review.mjs:acceptReviews -->

逐条校验人工评审：会话存在且未重复、证据未变更、断言与评分齐全、pass 结论满足门槛，冲突判定与封存状态自洽，最后落盘并归档旧评审。
类型：函数  
复杂度：复杂  
入边数：1  
标签：validation、review-gate、evidence-binding  
所属文件：[scripts/dogfood/review.mjs](../../../../files/scripts/dogfood/review.mjs.md)
源码：[scripts/dogfood/review.mjs:17](../../../../../../scripts/dogfood/review.mjs#L17)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [startServer](../server.mjs/startServer.md) | scripts/dogfood/server.mjs:57–174 | 在 127.0.0.1 启动审阅 HTTP 服务，路由 campaign/场景/矩阵/会话证据与事件增量接口，并处理带 token 的评审写入。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [evidenceHash](../lib.mjs/evidenceHash.md) | scripts/dogfood/lib.mjs:156–168 | 对尝试目录中除 session/review 外的全部证据文件做排序哈希，形成可复核的封存指纹。 |
