
# parseAnchoredBlocks
<!-- node: function:src/arsu-converter/revision/markdown-blocks.ts:parseAnchoredBlocks -->

扫描独立成行的块标记，构造带 id、字节区间、正文与归一化哈希的锚定块列表；标记缺失或重复即抛错。
类型：函数  
复杂度：中等  
入边数：4  
标签：markdown、parsing、block-anchor  
所属文件：[src/arsu-converter/revision/markdown-blocks.ts](../../../../../files/src/arsu-converter/revision/markdown-blocks.ts.md)
源码：[src/arsu-converter/revision/markdown-blocks.ts:11](../../../../../../../src/arsu-converter/revision/markdown-blocks.ts#L11)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [generateAnnotationReviewCopy](../../../annotation-intake/review-copy.ts/generateAnnotationReviewCopy.md) | src/annotation-intake/review-copy.ts:16–73 | 在原稿的文档级、章节级或块级位置插入 HTML 注释包裹的批注槽位，逐条记录字节区间与模板哈希。 |
| [deriveReviewDelta](../../../../../files/src/annotation-intake/review-delta.ts.md) | src/annotation-intake/review-delta.ts:6–98 | 比较模板与用户改后的审阅副本，按块 id 归并出 changed/missing/added 与整段 unmatched 差异；结构无法解析时降级为整篇对照并给出阻塞诊断。 |
| [applyRevisionPatch](../../../../../files/src/arsu-converter/revision/apply.ts.md) | src/arsu-converter/revision/apply.ts:30–61 | 先验证补丁契约、基准草稿哈希、目标块存在性与旧块哈希，再拒绝注入块标记或含混块结构的替换文本，全部通过才交给 applyValidated 落盘。 |
| [validateAnnotationTargetAgainstMarkdown](../../../../../files/src/core/runtime/annotation-target.ts.md) | src/core/runtime/annotation-target.ts:15–62 | 按目标类型逐层收紧：章节标题须唯一，块须存在且哈希一致，引用须在块内唯一出现并与前后文吻合。 |

## 调用

该符号没有记录对外调用。
