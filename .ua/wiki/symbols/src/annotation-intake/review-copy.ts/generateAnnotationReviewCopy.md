
# generateAnnotationReviewCopy
<!-- node: function:src/annotation-intake/review-copy.ts:generateAnnotationReviewCopy -->

在原稿的文档级、章节级或块级位置插入 HTML 注释包裹的批注槽位，逐条记录字节区间与模板哈希。
类型：函数  
复杂度：复杂  
入边数：1  
标签：markdown、slot-template、annotation-intake  
所属文件：[src/annotation-intake/review-copy.ts](../../../../files/src/annotation-intake/review-copy.ts.md)
源码：[src/annotation-intake/review-copy.ts:16](../../../../../../src/annotation-intake/review-copy.ts#L16)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [createAnnotationIntakeSession](../../../../files/src/annotation-intake/session.ts.md) | src/annotation-intake/session.ts:15–70 | 创建 collecting 状态的接收会话：生成审阅副本、把副本登记为首个原始来源，并返回会话、来源与三条待写入计划。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [parseAnchoredBlocks](../../arsu-converter/revision/markdown-blocks.ts/parseAnchoredBlocks.md) | src/arsu-converter/revision/markdown-blocks.ts:11–25 | 扫描独立成行的块标记，构造带 id、字节区间、正文与归一化哈希的锚定块列表；标记缺失或重复即抛错。 |
