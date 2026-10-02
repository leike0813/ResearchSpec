
# src/arsu-converter/manifest.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/manifest.ts -->

转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。
源码：[src/arsu-converter/manifest.ts](../../../../../src/arsu-converter/manifest.ts)

## 符号（7）
<!-- node: function:src/arsu-converter/manifest.ts:buildAnchorReplacementReport -->
<!-- node: function:src/arsu-converter/manifest.ts:buildManifest -->
<!-- node: function:src/arsu-converter/manifest.ts:buildReport -->
<!-- node: function:src/arsu-converter/manifest.ts:canonicalizeObject -->
<!-- node: function:src/arsu-converter/manifest.ts:normalizeManifest -->
<!-- node: function:src/arsu-converter/manifest.ts:riskFindingsForGroup -->
<!-- node: function:src/arsu-converter/manifest.ts:semanticCoverageLines -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildAnchorReplacementReport | 函数 | 252–319 | 复杂 | reporting、audit、contract-anchor、markdown | 0 | 生成逐锚点的替换审计报告：列出语义角色、替换形状、正文与前后文本指纹、ResearchSpec 目标与落盘路径，并用围栏代码块并置展示替换前后原文，另附仅诊断锚点的匹配情况。 |
| buildManifest | 函数 | 15–160 | 复杂 | manifest、data-model、reporting、hashing、core-logic | 0 | 组装 ConversionManifest：按分组归集输出文件与风险发现，追加契约清单、路由目录、图 profile 注册表及两份报告的哈希记录，并投影锚点替换与运行时策略的序列化摘要和校验结论。 |
| buildReport | 函数 | 162–250 | 复杂 | reporting、markdown、generation、audit | 0 | 把 manifest 渲染为人类可读的转换报告，覆盖上游 checkout 状态、分组清单、契约与路由集成、锚点与运行时策略覆盖度、文件统计、风险发现（最多 50 条）和校验结论。 |
| canonicalizeObject | 函数 | 367–376 | 中等 | determinism、normalization、serialization、utility | 1 | 递归排序对象键、剔除 undefined 值并逐层处理数组，把任意结构投影为可稳定比较的规范形式。 |
| [normalizeManifest](../../../symbols/src/arsu-converter/manifest.ts/normalizeManifest.md) | 函数 | 321–358 | 复杂 | determinism、normalization、idempotency、manifest | 1 | 抹平 manifest 中的非确定性成分（生成时间、dirty 标记）并对文件、风险、校验、锚点与运行时策略的各层数组排序，供幂等性比较使用。 |
| riskFindingsForGroup | 函数 | 395–420 | 中等 | risk-scanning、reporting、aggregation、validation | 1 | 把分组内的残留标记发现与缺失依赖统一提升为全局 RiskFinding，区分非阻塞的语义清理项与阻塞的缺失依赖，并排序返回。 |
| semanticCoverageLines | 函数 | 378–389 | 简单 | reporting、aggregation、contract-anchor、coverage | 1 | 按语义角色统计已替换锚点数量并生成分节报告行，让审阅者一眼看出哪些契约类别已被 ResearchSpec 覆盖。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [planner.ts](runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [replace.ts](anchors/replace.ts.md) | src/arsu-converter/anchors/replace.ts | 锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。 |
| [types.ts](anchors/types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [idempotence.ts](idempotence.ts.md) | src/arsu-converter/idempotence.ts | 转换幂等性校验：既检查既有输出是否偏离其自身 manifest，也通过在临时目录重新生成并比较归一化 manifest 来证明重复转换字节一致。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildAnchorReplacementReport | 函数 | 252–319 | 生成逐锚点的替换审计报告：列出语义角色、替换形状、正文与前后文本指纹、ResearchSpec 目标与落盘路径，并用围栏代码块并置展示替换前后原文，另附仅诊断锚点的匹配情况。 |
| buildManifest | 函数 | 15–160 | 组装 ConversionManifest：按分组归集输出文件与风险发现，追加契约清单、路由目录、图 profile 注册表及两份报告的哈希记录，并投影锚点替换与运行时策略的序列化摘要和校验结论。 |
| buildReport | 函数 | 162–250 | 把 manifest 渲染为人类可读的转换报告，覆盖上游 checkout 状态、分组清单、契约与路由集成、锚点与运行时策略覆盖度、文件统计、风险发现（最多 50 条）和校验结论。 |
| [normalizeManifest](../../../symbols/src/arsu-converter/manifest.ts/normalizeManifest.md) | 函数 | 321–358 | 抹平 manifest 中的非确定性成分（生成时间、dirty 标记）并对文件、风险、校验、锚点与运行时策略的各层数组排序，供幂等性比较使用。 |
