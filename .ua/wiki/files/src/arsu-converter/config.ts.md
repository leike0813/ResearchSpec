
# src/arsu-converter/config.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/config.ts -->

转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。
源码：[src/arsu-converter/config.ts](../../../../../src/arsu-converter/config.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.ts](runtime-policy/check.ts.md) | src/arsu-converter/runtime-policy/check.ts | 可独立运行的 runtime-policy 自检入口，校验上游 checkout 后构建策略计划并以 JSON 输出分类/适配/保留计数与 checker 闭包数量，失败时打印聚合错误详情。 |
| [classify.ts](classify.ts.md) | src/arsu-converter/classify.ts | 上游文件路径分类器：把 vendor/ars 中的每个文件判定为运行时核心、共享资源、应排除或需人工复核，并给出可读理由与所属 Skill 分组，作为转换清单的分类单一事实源。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [emit.ts](emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [ingest.ts](ingest.ts.md) | src/arsu-converter/ingest.ts | 上游文件清单化入口：只把存在 SKILL.md 的分组登记为 Skill 分组，随后用 classifyPath 把全部源路径分流进运行时目录、共享、排除与待复核四个集合并统一排序。 |
| [manifest.ts](anchors/manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [transform.ts](transform.ts.md) | src/arsu-converter/transform.ts | 转换期文本变换层：扫描平台词、历史词、schema 版本与 issue 引用等风险信号，发现 Skill 间的文件依赖并判定 shared/cross_skill/local 类别，重写 Markdown 链接到生成目录结构，并把无法解析的链接就地中和为纯文本。 |
| [upstream.ts](upstream.ts.md) | src/arsu-converter/upstream.ts | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manifest.ts](anchors/manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
