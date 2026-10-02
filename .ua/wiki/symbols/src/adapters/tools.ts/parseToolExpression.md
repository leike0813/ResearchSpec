
# parseToolExpression
<!-- node: function:src/adapters/tools.ts:parseToolExpression -->

解析逗号分隔的宿主选择表达式，支持 all/none 且不允许与其他 ID 混用，并拒绝未知 ID。
类型：函数  
复杂度：简单  
入边数：2  
标签：parsing、host-selection、validation、utility  
所属文件：[src/adapters/tools.ts](../../../../files/src/adapters/tools.ts.md)
源码：[src/adapters/tools.ts:187](../../../../../../src/adapters/tools.ts#L187)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [selectSkillWriters](../../../../files/src/adapters/delivery.ts.md) | src/adapters/delivery.ts:142–150 | 决定哪些宿主写入 Skill：commands-only 宿主排除，同时命中 codex 与 agents 时只保留 codex。 |
| [selectTools](../../../../files/src/cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts:162–193 | 解析 --tools 表达式、交互多选或按已配置/已探测回退确定宿主选择，失败统一转为 CliError。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [orderTools](orderTools.md) | src/adapters/tools.ts:221–226 | 按已配置、已探测、其余三档排序宿主，供交互选择列表稳定展示。 |
