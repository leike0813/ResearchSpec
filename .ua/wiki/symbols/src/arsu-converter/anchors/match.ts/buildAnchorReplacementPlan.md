
# buildAnchorReplacementPlan
<!-- node: function:src/arsu-converter/anchors/match.ts:buildAnchorReplacementPlan -->

构建完整替换计划的主流程：预加载并校验所有替换正文，逐锚点读取上游文件、匹配区间、登记按源文件分组的替换跨度，检查重叠与缺失阻塞锚点，最后汇总统计并返回可序列化的替换计划。
类型：函数  
复杂度：复杂  
入边数：1  
标签：orchestration、matching、replacement-plan、validation、core-logic  
所属文件：[src/arsu-converter/anchors/match.ts](../../../../../files/src/arsu-converter/anchors/match.ts.md)
源码：[src/arsu-converter/anchors/match.ts:28](../../../../../../../src/arsu-converter/anchors/match.ts#L28)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [convertArsu](../../converter.ts/convertArsu.md) | src/arsu-converter/converter.ts:34–113 | 完整转换流程：所有规划与冲突检查都在触碰生成目录之前完成，输出目录已存在且有漂移时要求显式 --force，随后按清单逐组 emit、写出根级投影文件并执行两阶段落盘与校验。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [readContractAnchors](../../../../../files/src/arsu-converter/anchors/io.ts.md) | src/arsu-converter/anchors/io.ts:16–22 | 从仓库根读取锚点定义文件，形状不合法时直接抛错，阻止转换流程在锚点数据损坏时继续。 |
| [readReplacementBody](../../../../../files/src/arsu-converter/anchors/io.ts.md) | src/arsu-converter/anchors/io.ts:24–27 | 按锚点 ID 读取 replacements 目录下的 Markdown 正文并做换行归一化，是匹配与替换阶段唯一的正文来源。 |
