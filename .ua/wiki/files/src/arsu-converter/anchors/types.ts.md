
# src/arsu-converter/anchors/types.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/types.ts -->

契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。
源码：[src/arsu-converter/anchors/types.ts](../../../../../../src/arsu-converter/anchors/types.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/anchors/types.ts:isReplaceableAnchor -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isReplaceableAnchor | 函数 | 59–61 | 简单 | type-guard、discriminated-union、contract-anchor、utility | 0 | 以 severity 是否为 diagnostic 区分两类锚点，是判别联合在运行时收窄为 ReplaceableContractAnchor 的唯一守卫。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-anchors.test.ts](../../../tests/arsu-anchors.test.ts.md) | tests/arsu-anchors.test.ts | anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。 |
| [check.ts](check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [coverage.ts](coverage.ts.md) | src/arsu-converter/anchors/coverage.ts | 覆盖缺口检测：对每个可替换锚点检查是否声明 ResearchSpec 归属目标、正文是否真的提到这些目标，并用一组遗留权威模式（Material Passport、旧 ledger 路径等）拦截过时契约文本。 |
| [emit.ts](../emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [io.ts](io.ts.md) | src/arsu-converter/anchors/io.ts | 锚点资产的读取与形状校验层：加载 contract-anchors.json 与逐个替换正文，并提供区分 diagnostic 与可替换锚点的完整类型守卫链。 |
| [manifest.ts](../manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [markers.ts](markers.ts.md) | src/arsu-converter/anchors/markers.ts | 运行时标记的单一事实源：校验锚点 ID 是否符合注册域格式，并生成包裹替换块的开闭 HTML 注释标记。 |
| [match.ts](match.ts.md) | src/arsu-converter/anchors/match.ts | 契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。 |
| [replace.ts](replace.ts.md) | src/arsu-converter/anchors/replace.ts | 锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。 |
| [source-rewrite.ts](../source-rewrite.ts.md) | src/arsu-converter/source-rewrite.ts | 跨改写目录的重叠校验器：合并 anchor 替换计划与运行时策略计划的 span，检测非法区间与跨目录区间重叠，保证两套改写可以在同一源文件上安全组合。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isReplaceableAnchor | 函数 | 59–61 | 以 severity 是否为 diagnostic 区分两类锚点，是判别联合在运行时收窄为 ReplaceableContractAnchor 的唯一守卫。 |
