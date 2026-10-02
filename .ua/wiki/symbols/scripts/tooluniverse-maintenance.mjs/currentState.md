
# currentState
<!-- node: function:scripts/tooluniverse-maintenance.mjs:currentState -->

汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。
类型：函数  
复杂度：复杂  
入边数：1  
标签：integrity、hash、tooluniverse  
所属文件：[scripts/tooluniverse-maintenance.mjs](../../../files/scripts/tooluniverse-maintenance.mjs.md)
源码：[scripts/tooluniverse-maintenance.mjs:245](../../../../../scripts/tooluniverse-maintenance.mjs#L245)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [tooluniverse-maintenance.mjs](../../../files/scripts/tooluniverse-maintenance.mjs.md) | scripts/tooluniverse-maintenance.mjs:— | ToolUniverse 扩展维护 CLI：校验 vendor/tooluniverse 处于目录锁定 revision 且干净，盘点 130 个 reviewed vendor-bundle Skills，并逐能力核对 registry 清单、package 树哈希、验证器必需字段与工具文件字节一致。 |

## 调用

该符号没有记录对外调用。
