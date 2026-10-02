
# src/arsu-converter/anchors/check.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/check.ts -->

契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。
源码：[src/arsu-converter/anchors/check.ts](../../../../../../src/arsu-converter/anchors/check.ts)

## 符号（10）
<!-- node: function:src/arsu-converter/anchors/check.ts:compareManifestFile -->
<!-- node: function:src/arsu-converter/anchors/check.ts:isManifest -->
<!-- node: function:src/arsu-converter/anchors/check.ts:readAnchorFile -->
<!-- node: function:src/arsu-converter/anchors/check.ts:readManifestFile -->
<!-- node: function:src/arsu-converter/anchors/check.ts:validateAnchorAssets -->
<!-- node: function:src/arsu-converter/anchors/check.ts:validateAnchors -->
<!-- node: function:src/arsu-converter/anchors/check.ts:validateCoverageDecisions -->
<!-- node: function:src/arsu-converter/anchors/check.ts:validateHintPresence -->
<!-- node: function:src/arsu-converter/anchors/check.ts:validateManifest -->
<!-- node: function:src/arsu-converter/anchors/check.ts:validateReplacementScope -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| compareManifestFile | 函数 | 179–189 | 简单 | validation、drift-detection、manifest、comparison | 0 | 比较单个上游文件的归一化哈希、frontmatter 和标题树，任何一项不一致都记为对应的漂移错误。 |
| isManifest | 函数 | 268–282 | 中等 | type-guard、validation、manifest、schema | 0 | 上游清单的类型守卫：确认 schema 版本、vendor/ars 来源、审计根、风险关键词和文件数组的结构合法，是手工类型谓词而非 schema 库。 |
| readAnchorFile | 函数 | 58–70 | 简单 | validation、json-parsing、type-guard、error-handling | 0 | 读取并解析 contract-anchors.json，用形状守卫确认结构合法；解析失败时把错误写入传入的 errors 数组而不是抛出，校验流程因此可以继续检查其他资产。 |
| readManifestFile | 函数 | 72–84 | 简单 | validation、json-parsing、type-guard、manifest | 0 | 读取并解析 upstream-manifest.json 并校验其 schema 形状，同样以累积错误的方式报告失败，保证校验报告能一次覆盖所有损坏的资产。 |
| validateAnchorAssets | 函数 | 28–56 | 中等 | orchestration、validation、contract-anchor、entry-point | 0 | 锚点校验的总编排函数：加载锚点文件与上游清单、比对审计 commit、检查未覆盖的运行时契约面，然后分别执行锚点与清单校验，汇总为 AnchorValidationResult。 |
| validateAnchors | 函数 | 86–155 | 复杂 | validation、contract-anchor、integrity-check、file-consistency | 0 | 逐个校验锚点定义：ID 唯一性与命名规范、替换正文的存在性、LF 换行、结尾换行、禁止嵌套运行时标记、目标命中、正文互不重复，并双向比对 replacements 目录中的孤儿文件，最后检查覆盖决策。 |
| validateCoverageDecisions | 函数 | 231–240 | 简单 | validation、audit、coverage-decision、contract-anchor | 0 | 校验覆盖决策条目的 ID 唯一性，并要求每条决策同时提供匹配片段与书面理由，使“有意保留上游内容”成为可审计的显式记录。 |
| validateHintPresence | 函数 | 191–213 | 中等 | validation、match-hints、contract-anchor、severity-policy | 0 | 在真实上游文件中验证锚点匹配提示：标题缺失只记为告警（匹配器仍可回退全文），片段与关键词缺失则视为阻塞错误。 |
| validateManifest | 函数 | 157–177 | 中等 | validation、manifest、drift-detection、upstream-audit | 0 | 重新生成当前上游清单并与已提交的清单比对：校验 commit、文件树顺序以及逐文件的归一化哈希、frontmatter 与标题树，防止 vendor/ars 升级后锚点数据悄悄过期。 |
| validateReplacementScope | 函数 | 215–229 | 中等 | validation、replacement-scope、contract-anchor、safety-check | 0 | 对非 diagnostic 锚点要求声明替换边界，并确认起止片段在源文件中真实存在且非空，避免生成阶段出现模糊或错位的替换区间。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [coverage.ts](coverage.ts.md) | src/arsu-converter/anchors/coverage.ts | 覆盖缺口检测：对每个可替换锚点检查是否声明 ResearchSpec 归属目标、正文是否真的提到这些目标，并用一组遗留权威模式（Material Passport、旧 ledger 路径等）拦截过时契约文本。 |
| [fs-utils.ts](../fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [io.ts](io.ts.md) | src/arsu-converter/anchors/io.ts | 锚点资产的读取与形状校验层：加载 contract-anchors.json 与逐个替换正文，并提供区分 diagnostic 与可替换锚点的完整类型守卫链。 |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [markers.ts](markers.ts.md) | src/arsu-converter/anchors/markers.ts | 运行时标记的单一事实源：校验锚点 ID 是否符合注册域格式，并生成包裹替换块的开闭 HTML 注释标记。 |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-anchors.test.ts](../../../tests/arsu-anchors.test.ts.md) | tests/arsu-anchors.test.ts | anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateAnchorAssets | 函数 | 28–56 | 锚点校验的总编排函数：加载锚点文件与上游清单、比对审计 commit、检查未覆盖的运行时契约面，然后分别执行锚点与清单校验，汇总为 AnchorValidationResult。 |
