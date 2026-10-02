
# src/arsu-converter/anchors/io.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/io.ts -->

锚点资产的读取与形状校验层：加载 contract-anchors.json 与逐个替换正文，并提供区分 diagnostic 与可替换锚点的完整类型守卫链。
源码：[src/arsu-converter/anchors/io.ts](../../../../../../src/arsu-converter/anchors/io.ts)

## 符号（5）
<!-- node: function:src/arsu-converter/anchors/io.ts:isAnchor -->
<!-- node: function:src/arsu-converter/anchors/io.ts:isAnchorFile -->
<!-- node: function:src/arsu-converter/anchors/io.ts:normalizeReplacementBody -->
<!-- node: function:src/arsu-converter/anchors/io.ts:readContractAnchors -->
<!-- node: function:src/arsu-converter/anchors/io.ts:readReplacementBody -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isAnchor | 函数 | 46–67 | 中等 | type-guard、discriminated-union、validation、contract-anchor | 0 | 单个锚点的判别式类型守卫：diagnostic 锚点必须不含替换范围与语义角色，可替换锚点则必须齐备语义角色、ResearchSpec 目标、替换形状和替换边界。 |
| isAnchorFile | 函数 | 33–44 | 中等 | type-guard、validation、schema、contract-anchor | 0 | 锚点文件顶层类型守卫，校验 v4 schema 版本、vendor/ars 来源、审计 commit、锚点数组与覆盖决策数组。 |
| normalizeReplacementBody | 函数 | 29–31 | 简单 | normalization、utility、line-endings、determinism | 0 | 把替换正文的 CRLF/CR 统一为 LF 并去除首尾空白，使正文哈希在不同平台上一致。 |
| readContractAnchors | 函数 | 16–22 | 简单 | io、json-parsing、validation、contract-anchor | 1 | 从仓库根读取锚点定义文件，形状不合法时直接抛错，阻止转换流程在锚点数据损坏时继续。 |
| readReplacementBody | 函数 | 24–27 | 简单 | io、contract-anchor、normalization、markdown | 1 | 按锚点 ID 读取 replacements 目录下的 Markdown 正文并做换行归一化，是匹配与替换阶段唯一的正文来源。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.ts](check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [match.ts](match.ts.md) | src/arsu-converter/anchors/match.ts | 契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isAnchor | 函数 | 46–67 | 单个锚点的判别式类型守卫：diagnostic 锚点必须不含替换范围与语义角色，可替换锚点则必须齐备语义角色、ResearchSpec 目标、替换形状和替换边界。 |
| isAnchorFile | 函数 | 33–44 | 锚点文件顶层类型守卫，校验 v4 schema 版本、vendor/ars 来源、审计 commit、锚点数组与覆盖决策数组。 |
| normalizeReplacementBody | 函数 | 29–31 | 把替换正文的 CRLF/CR 统一为 LF 并去除首尾空白，使正文哈希在不同平台上一致。 |
| readContractAnchors | 函数 | 16–22 | 从仓库根读取锚点定义文件，形状不合法时直接抛错，阻止转换流程在锚点数据损坏时继续。 |
| readReplacementBody | 函数 | 24–27 | 按锚点 ID 读取 replacements 目录下的 Markdown 正文并做换行归一化，是匹配与替换阶段唯一的正文来源。 |
