
# createMaintenanceCommands
<!-- node: function:scripts/lib/vendor-maintenance.mjs:createMaintenanceCommands -->

为单个厂商组装 artifacts/records/baseline/check/diff 命令：baseline 强制语义审阅完成，check 逐字段比对锚点 manifest 与实时状态，diff 输出关键指纹变化。
类型：函数  
复杂度：复杂  
入边数：6  
标签：cli-factory、validation、orchestration  
所属文件：[scripts/lib/vendor-maintenance.mjs](../../../../files/scripts/lib/vendor-maintenance.mjs.md)
源码：[scripts/lib/vendor-maintenance.mjs:150](../../../../../../scripts/lib/vendor-maintenance.mjs#L150)

## 被调用

没有节点记录了对它的调用。

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [syncTools](../../../../files/scripts/lib/vendor-maintenance.mjs.md) | scripts/lib/vendor-maintenance.mjs:113–127 | 把 catalog 声明的工具文件从生成根同步到扩展根，内容不一致时才写入。 |
| [writeReviewArtifact](../../../../files/scripts/lib/vendor-maintenance.mjs.md) | scripts/lib/vendor-maintenance.mjs:129–144 | 按当前状态写出 extension-review.json 机器审阅工件。 |
