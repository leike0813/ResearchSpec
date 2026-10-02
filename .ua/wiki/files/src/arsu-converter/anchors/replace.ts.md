
# src/arsu-converter/anchors/replace.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/replace.ts -->

锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。
源码：[src/arsu-converter/anchors/replace.ts](../../../../../../src/arsu-converter/anchors/replace.ts)

## 符号（4）
<!-- node: function:src/arsu-converter/anchors/replace.ts:applyCombinedReplacements -->
<!-- node: function:src/arsu-converter/anchors/replace.ts:markReplaced -->
<!-- node: function:src/arsu-converter/anchors/replace.ts:serializableAnchorReplacementPlan -->
<!-- node: function:src/arsu-converter/anchors/replace.ts:serializableRecord -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [applyCombinedReplacements](../../../../symbols/src/arsu-converter/anchors/replace.ts/applyCombinedReplacements.md) | 函数 | 15–53 | 复杂 | replacement、rewriting、orchestration、runtime-policy | 1 | 把锚点替换与运行时策略改写合并为单一有序重写流，适配被替换文本的行尾风格，为锚点块补上开闭标记，并在替换完成后同步更新两套计划的状态。 |
| markReplaced | 函数 | 55–63 | 简单 | state-tracking、hashing、contract-anchor、record-update | 0 | 在替换发生后回写对应锚点记录：置 replaced 标记、去重追加输出路径、记录替换后文本及其 SHA-256，并重算计划级 replaced_anchors 计数。 |
| serializableAnchorReplacementPlan | 函数 | 65–82 | 中等 | serialization、determinism、contract-anchor、projection | 1 | 把含 Map 与原文正文的替换计划投影为可 JSON 序列化的形式，去掉大体积文本并对记录按 anchor_id 排序，保证清单文件字节稳定。 |
| serializableRecord | 函数 | 84–104 | 中等 | serialization、determinism、data-model、contract-anchor | 0 | 把单条锚点匹配记录裁剪为清单可写入的字段集合，并对 ResearchSpec 目标、输出路径与诊断信息排序剔除 before/after 原文。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [markers.ts](markers.ts.md) | src/arsu-converter/anchors/markers.ts | 运行时标记的单一事实源：校验锚点 ID 是否符合注册域格式，并生成包裹替换块的开闭 HTML 注释标记。 |
| [planner.ts](../runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [types.ts](../runtime-policy/types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [emit.ts](../emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [manifest.ts](../manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [applyCombinedReplacements](../../../../symbols/src/arsu-converter/anchors/replace.ts/applyCombinedReplacements.md) | 函数 | 15–53 | 把锚点替换与运行时策略改写合并为单一有序重写流，适配被替换文本的行尾风格，为锚点块补上开闭标记，并在替换完成后同步更新两套计划的状态。 |
| serializableAnchorReplacementPlan | 函数 | 65–82 | 把含 Map 与原文正文的替换计划投影为可 JSON 序列化的形式，去掉大体积文本并对记录按 anchor_id 排序，保证清单文件字节稳定。 |
