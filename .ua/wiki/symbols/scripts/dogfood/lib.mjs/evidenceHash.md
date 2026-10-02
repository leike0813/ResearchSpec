
# evidenceHash
<!-- node: function:scripts/dogfood/lib.mjs:evidenceHash -->

对尝试目录中除 session/review 外的全部证据文件做排序哈希，形成可复核的封存指纹。
类型：函数  
复杂度：中等  
入边数：2  
标签：hashing、integrity、evidence  
所属文件：[scripts/dogfood/lib.mjs](../../../../files/scripts/dogfood/lib.mjs.md)
源码：[scripts/dogfood/lib.mjs:156](../../../../../../scripts/dogfood/lib.mjs#L156)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateAssessment](../../../../files/scripts/dogfood/assessment.mjs.md) | scripts/dogfood/assessment.mjs:62–96 | 校验验收草稿的完整性与证据绑定，确认尝试证据封存未变，并按 pass 门槛复核前置条件、断言与评分。 |
| [acceptReviews](../review.mjs/acceptReviews.md) | scripts/dogfood/review.mjs:17–64 | 逐条校验人工评审：会话存在且未重复、证据未变更、断言与评分齐全、pass 结论满足门槛，冲突判定与封存状态自洽，最后落盘并归档旧评审。 |

## 调用

该符号没有记录对外调用。
