
# src/arsu-converter/anchors/match.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/match.ts -->

契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。
源码：[src/arsu-converter/anchors/match.ts](../../../../../../src/arsu-converter/anchors/match.ts)

## 符号（9）
<!-- node: function:src/arsu-converter/anchors/match.ts:buildAnchorReplacementPlan -->
<!-- node: function:src/arsu-converter/anchors/match.ts:buildRecord -->
<!-- node: function:src/arsu-converter/anchors/match.ts:expandRangeToLineBounds -->
<!-- node: function:src/arsu-converter/anchors/match.ts:findAllSnippets -->
<!-- node: function:src/arsu-converter/anchors/match.ts:findSnippet -->
<!-- node: function:src/arsu-converter/anchors/match.ts:matchAnchor -->
<!-- node: function:src/arsu-converter/anchors/match.ts:matchWithinWindow -->
<!-- node: function:src/arsu-converter/anchors/match.ts:selectWindows -->
<!-- node: function:src/arsu-converter/anchors/match.ts:validateNoOverlaps -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [buildAnchorReplacementPlan](../../../../symbols/src/arsu-converter/anchors/match.ts/buildAnchorReplacementPlan.md) | 函数 | 28–138 | 复杂 | orchestration、matching、replacement-plan、validation、core-logic | 1 | 构建完整替换计划的主流程：预加载并校验所有替换正文，逐锚点读取上游文件、匹配区间、登记按源文件分组的替换跨度，检查重叠与缺失阻塞锚点，最后汇总统计并返回可序列化的替换计划。 |
| buildRecord | 函数 | 156–184 | 中等 | data-model、matching、hashing、record-building | 0 | 把匹配结果装配为 AnchorMatchRecord，统一带上语义角色、ResearchSpec 目标、替换形状与替换正文哈希，并计算替换前文本的 SHA-256 指纹。 |
| expandRangeToLineBounds | 函数 | 298–308 | 简单 | utility、offset-arithmetic、matching、safety | 0 | 把窗口内的局部区间换算回绝对偏移并扩展到完整行边界，保证替换不会留下半截行或破坏 Markdown 结构。 |
| findAllSnippets | 函数 | 282–296 | 简单 | matching、string-search、utility、regex | 0 | 与 findSnippet 相同但返回全部命中区间，替换边界的唯一性判定依赖于此。 |
| findSnippet | 函数 | 270–280 | 简单 | matching、string-search、utility、regex | 0 | 把片段按空白拆分并转成容忍空白差异的正则，返回首个大小写不敏感命中的区间。 |
| matchAnchor | 函数 | 140–154 | 中等 | matching、contract-anchor、diagnostics、fallback | 0 | 按标题提示构造候选窗口并逐个尝试窗口内匹配，任一窗口成功即返回其区间；全部失败时汇总各窗口的失败原因作为诊断。 |
| matchWithinWindow | 函数 | 186–237 | 复杂 | matching、contract-anchor、validation、boundary-detection | 0 | 在单个窗口内完成锚点定位：先要求全部关键词命中，再要求全部片段命中；对可替换锚点额外要求起止边界各唯一命中且顺序正确，避免模糊匹配切错区间。 |
| selectWindows | 函数 | 239–258 | 中等 | matching、parsing、fallback、markdown | 0 | 根据标题提示把文件切分为多个候选文本窗口（按同级或更高级标题截断），并始终追加全文窗口作为回退，使匹配既精确又不会因标题改名而彻底失效。 |
| validateNoOverlaps | 函数 | 310–323 | 中等 | validation、overlap-detection、contract-anchor、safety-check | 0 | 按起点排序同一源文件内的所有替换跨度，检出相互覆盖的锚点对并返回可读的重叠错误。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [io.ts](io.ts.md) | src/arsu-converter/anchors/io.ts | 锚点资产的读取与形状校验层：加载 contract-anchors.json 与逐个替换正文，并提供区分 diagnostic 与可替换锚点的完整类型守卫链。 |
| [types.ts](../types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-anchors.test.ts](../../../tests/arsu-anchors.test.ts.md) | tests/arsu-anchors.test.ts | anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。 |
| [arsu-runtime-policy.test.ts](../../../tests/arsu-runtime-policy.test.ts.md) | tests/arsu-runtime-policy.test.ts | 运行时策略测试：对 pinned vendor/ars 构建策略计划，断言 41 个分类条目、5 个 checker 闭包、固定的两处路径改写与 11 处不可用引用替换，并确认与 anchor 替换计划无区间重叠。 |
| [converter.ts](../converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [buildAnchorReplacementPlan](../../../../symbols/src/arsu-converter/anchors/match.ts/buildAnchorReplacementPlan.md) | 函数 | 28–138 | 构建完整替换计划的主流程：预加载并校验所有替换正文，逐锚点读取上游文件、匹配区间、登记按源文件分组的替换跨度，检查重叠与缺失阻塞锚点，最后汇总统计并返回可序列化的替换计划。 |
| matchAnchor | 函数 | 140–154 | 按标题提示构造候选窗口并逐个尝试窗口内匹配，任一窗口成功即返回其区间；全部失败时汇总各窗口的失败原因作为诊断。 |
