
# entryOwnedBytes
<!-- node: function:src/adapters/project-entry.ts:entryOwnedBytes -->

返回该安装记录实际拥有的字节：文件模式为全量，区域模式仅取合法标记区间。
类型：函数  
复杂度：简单  
入边数：2  
标签：ownership、region-protocol、utility、hashing  
所属文件：[src/adapters/project-entry.ts](../../../../files/src/adapters/project-entry.ts.md)
源码：[src/adapters/project-entry.ts:17](../../../../../../src/adapters/project-entry.ts#L17)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planProjectEntryDelivery](planProjectEntryDelivery.md) | src/adapters/project-entry.ts:24–102 | 按入口协议规划写入：处理 OpenCode 的 CLAUDE.md 回退、缺少 Navigate 资产、区域缺失/畸形/被改动等多种保留分支。 |
| [planProjectEntryRemoval](../../../../files/src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts:104–129 | 规划移除入口协议：文件模式直接删除，区域模式只切掉自有标记区间，内容被改动则保留。 |

## 调用

该符号没有记录对外调用。
