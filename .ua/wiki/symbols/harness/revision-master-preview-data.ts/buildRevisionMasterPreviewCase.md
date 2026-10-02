
# buildRevisionMasterPreviewCase
<!-- node: function:harness/revision-master-preview-data.ts:buildRevisionMasterPreviewCase -->

由同一组审稿意见常量推导出 in_progress 与 complete 两种预览用例：写出稿件、补充材料、CSV 与回复信文件，并生成 workbench 需要的数据库行。
类型：函数  
复杂度：复杂  
入边数：1  
标签：factory、fixture-data、revision-master、sqlite  
所属文件：[harness/revision-master-preview-data.ts](../../../files/harness/revision-master-preview-data.ts.md)
源码：[harness/revision-master-preview-data.ts:264](../../../../../harness/revision-master-preview-data.ts#L264)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [prepareRevisionMasterPreviews](../../../files/harness/revision-master-preview.ts.md) | harness/revision-master-preview.ts:48–114 | 按四个阶段交接生成 revision-master 预览页：用生产 schema 播种真实 SQLite，再经只读 workbench 投影和 prepareRevisionMasterReview 落成 HTML。 |

## 调用

该符号没有记录对外调用。
