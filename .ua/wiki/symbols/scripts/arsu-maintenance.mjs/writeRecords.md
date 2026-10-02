
# writeRecords
<!-- node: function:scripts/arsu-maintenance.mjs:writeRecords -->

渲染 ARS 锚点的五份记录文件，并保留已有人工填写的语义审阅。
类型：函数  
复杂度：复杂  
入边数：1  
标签：audit-anchor、arsu、reporting  
所属文件：[scripts/arsu-maintenance.mjs](../../../files/scripts/arsu-maintenance.mjs.md)
源码：[scripts/arsu-maintenance.mjs:179](../../../../../scripts/arsu-maintenance.mjs#L179)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [baseline](../../../files/scripts/arsu-maintenance.mjs.md) | scripts/arsu-maintenance.mjs:414–430 | 写记录后要求语义审阅含结论且无 NOT-COMPLETED，再写出锚点 manifest.json。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [sha256](../../../files/scripts/lib/vendor-maintenance.mjs.md) | scripts/lib/vendor-maintenance.mjs:19–21 | 对字节或字符串做 SHA-256，不做文本解码。 |
