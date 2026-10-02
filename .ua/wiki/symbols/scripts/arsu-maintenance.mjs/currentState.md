
# currentState
<!-- node: function:scripts/arsu-maintenance.mjs:currentState -->

汇总上游修订、抽取索引、registry 转换、parity 覆盖率与三份 HTML 审阅哈希，构成锚点状态。
类型：函数  
复杂度：复杂  
入边数：1  
标签：audit-anchor、arsu、validation  
所属文件：[scripts/arsu-maintenance.mjs](../../../files/scripts/arsu-maintenance.mjs.md)
源码：[scripts/arsu-maintenance.mjs:359](../../../../../scripts/arsu-maintenance.mjs#L359)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [check](../../../files/scripts/arsu-maintenance.mjs.md) | scripts/arsu-maintenance.mjs:451–494 | 逐字段比对锚点 manifest 与实时状态，任一不一致即打印 FAIL 并置非零退出码。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [upstreamInventory](../../../files/scripts/arsu-maintenance.mjs.md) | scripts/arsu-maintenance.mjs:47–72 | 统计 ARS submodule 的文件数并按顶层区域与扩展名聚合，另计 agents/references/templates 规模。 |
| [fileSha](../../../files/scripts/lib/vendor-maintenance.mjs.md) | scripts/lib/vendor-maintenance.mjs:23–25 | 计算文件内容的 SHA-256。 |
