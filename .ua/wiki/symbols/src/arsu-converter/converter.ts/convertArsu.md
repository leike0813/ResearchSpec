
# convertArsu
<!-- node: function:src/arsu-converter/converter.ts:convertArsu -->

完整转换流程：所有规划与冲突检查都在触碰生成目录之前完成，输出目录已存在且有漂移时要求显式 --force，随后按清单逐组 emit、写出根级投影文件并执行两阶段落盘与校验。
类型：函数  
复杂度：复杂  
入边数：2  
标签：orchestration、converter、pipeline、core-logic  
所属文件：[src/arsu-converter/converter.ts](../../../../files/src/arsu-converter/converter.ts.md)
源码：[src/arsu-converter/converter.ts:34](../../../../../../src/arsu-converter/converter.ts#L34)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [main](../../../../files/src/arsu-converter/cli.ts.md) | src/arsu-converter/cli.ts:31–91 | 解析命令行后分派到 convert/check/idempotence，统一处理 JSON 与纯文本输出、退出码，并把 ArsuConverterError 的 code、message 与 details 完整暴露给调用方。 |
| [checkArsuIdempotence](../../../../files/src/arsu-converter/converter.ts.md) | src/arsu-converter/converter.ts:124–134 | 在临时目录中以强制模式重新执行一次转换，再与当前产物比较归一化 manifest，验证转换的可重复性。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [buildAnchorReplacementPlan](../anchors/match.ts/buildAnchorReplacementPlan.md) | src/arsu-converter/anchors/match.ts:28–138 | 构建完整替换计划的主流程：预加载并校验所有替换正文，逐锚点读取上游文件、匹配区间、登记按源文件分组的替换跨度，检查重叠与缺失阻塞锚点，最后汇总统计并返回可序列化的替换计划。 |
| [buildContractIntegrationManifest](../../../../files/src/arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts:44–58 | 构建写入生成产物的 researchspec-contracts.json：记录集成 profile、来源与输出路径、锚点替换 profile 与标记格式，并为每个 Skill 分组生成契约画像。 |
| [dryRunResult](../../../../files/src/arsu-converter/converter.ts.md) | src/arsu-converter/converter.ts:153–180 | 为 --dry-run 构造不写盘的结果对象：保留已完成的锚点与运行时策略规划，空置分组清单，并给出恒为通过的校验占位结果。 |
| [writeConversionOutputs](../../../../files/src/arsu-converter/converter.ts.md) | src/arsu-converter/converter.ts:136–151 | 写出锚点替换报告、运行时策略报告、conversion-manifest.json 与人类可读转换报告，并回传各文件的 SHA-256 供 manifest 记录。 |
