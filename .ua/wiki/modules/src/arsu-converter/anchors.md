
# src/arsu-converter/anchors
> 目录聚合页：11 个文件、42 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/anchors/check.ts](../../../files/src/arsu-converter/anchors/check.ts.md) | 文件 | 10 | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [src/arsu-converter/anchors/contract-anchors.json](../../../files/src/arsu-converter/anchors/contract-anchors.json.md) | 配置 | 0 | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [src/arsu-converter/anchors/coverage.ts](../../../files/src/arsu-converter/anchors/coverage.ts.md) | 文件 | 1 | 覆盖缺口检测：对每个可替换锚点检查是否声明 ResearchSpec 归属目标、正文是否真的提到这些目标，并用一组遗留权威模式（Material Passport、旧 ledger 路径等）拦截过时契约文本。 |
| [src/arsu-converter/anchors/generate.ts](../../../files/src/arsu-converter/anchors/generate.ts.md) | 文件 | 1 | 上游清单生成的可执行封装：重新扫描 vendor/ars 并把 upstream-manifest.json 写回仓库，同时支持作为脚本直接运行以刷新已提交的审计基线。 |
| [src/arsu-converter/anchors/io.ts](../../../files/src/arsu-converter/anchors/io.ts.md) | 文件 | 5 | 锚点资产的读取与形状校验层：加载 contract-anchors.json 与逐个替换正文，并提供区分 diagnostic 与可替换锚点的完整类型守卫链。 |
| [src/arsu-converter/anchors/manifest.ts](../../../files/src/arsu-converter/anchors/manifest.ts.md) | 文件 | 8 | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [src/arsu-converter/anchors/markers.ts](../../../files/src/arsu-converter/anchors/markers.ts.md) | 文件 | 3 | 运行时标记的单一事实源：校验锚点 ID 是否符合注册域格式，并生成包裹替换块的开闭 HTML 注释标记。 |
| [src/arsu-converter/anchors/match.ts](../../../files/src/arsu-converter/anchors/match.ts.md) | 文件 | 9 | 契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。 |
| [src/arsu-converter/anchors/replace.ts](../../../files/src/arsu-converter/anchors/replace.ts.md) | 文件 | 4 | 锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。 |
| [src/arsu-converter/anchors/types.ts](../../../files/src/arsu-converter/anchors/types.ts.md) | 文件 | 1 | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |
| [src/arsu-converter/anchors/upstream-manifest.json](../../../files/src/arsu-converter/anchors/upstream-manifest.json.md) | 配置 | 0 | 上游 ARSU 清单：记录审计 commit、已审计的五个根目录、风险关键词集合，以及各 Skill 的文件、类型与风险分类，是转换器判定风险面的固定输入。 |

## 子目录
- [replacements](anchors/replacements.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/arsu-converter](../arsu-converter.md) | 6 |
| [src/arsu-converter/runtime-policy](runtime-policy.md) | 2 |
