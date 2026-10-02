
# src/arsu-converter/anchors/coverage.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/coverage.ts -->

覆盖缺口检测：对每个可替换锚点检查是否声明 ResearchSpec 归属目标、正文是否真的提到这些目标，并用一组遗留权威模式（Material Passport、旧 ledger 路径等）拦截过时契约文本。
源码：[src/arsu-converter/anchors/coverage.ts](../../../../../../src/arsu-converter/anchors/coverage.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/anchors/coverage.ts:findUncoveredRuntimeSurfaces -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findUncoveredRuntimeSurfaces | 函数 | 20–44 | 中等 | coverage、validation、contract-anchor、audit | 1 | 遍历可替换锚点及其替换正文，产出三类发现：缺少当前归属、正文命中遗留权威模式、正文未提及声明的 ResearchSpec 目标，结果排序返回以便稳定比对。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-anchors.test.ts](../../../tests/arsu-anchors.test.ts.md) | tests/arsu-anchors.test.ts | anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。 |
| [check.ts](check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| findUncoveredRuntimeSurfaces | 函数 | 20–44 | 遍历可替换锚点及其替换正文，产出三类发现：缺少当前归属、正文命中遗留权威模式、正文未提及声明的 ResearchSpec 目标，结果排序返回以便稳定比对。 |
