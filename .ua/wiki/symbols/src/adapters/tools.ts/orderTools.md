
# orderTools
<!-- node: function:src/adapters/tools.ts:orderTools -->

按已配置、已探测、其余三档排序宿主，供交互选择列表稳定展示。
类型：函数  
复杂度：简单  
入边数：2  
标签：sorting、host-selection、ui、utility  
所属文件：[src/adapters/tools.ts](../../../../files/src/adapters/tools.ts.md)
源码：[src/adapters/tools.ts:221](../../../../../../src/adapters/tools.ts#L221)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [parseToolExpression](parseToolExpression.md) | src/adapters/tools.ts:187–196 | 解析逗号分隔的宿主选择表达式，支持 all/none 且不允许与其他 ID 混用，并拒绝未知 ID。 |
| [selectTools](../../../../files/src/cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts:162–193 | 解析 --tools 表达式、交互多选或按已配置/已探测回退确定宿主选择，失败统一转为 CliError。 |

## 调用

该符号没有记录对外调用。
