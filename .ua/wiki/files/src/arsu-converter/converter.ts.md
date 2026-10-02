
# src/arsu-converter/converter.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/converter.ts -->

ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。
源码：[src/arsu-converter/converter.ts](../../../../../src/arsu-converter/converter.ts)

## 符号（5）
<!-- node: function:src/arsu-converter/converter.ts:checkArsuIdempotence -->
<!-- node: function:src/arsu-converter/converter.ts:checkArsuOutput -->
<!-- node: function:src/arsu-converter/converter.ts:convertArsu -->
<!-- node: function:src/arsu-converter/converter.ts:dryRunResult -->
<!-- node: function:src/arsu-converter/converter.ts:writeConversionOutputs -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkArsuIdempotence | 函数 | 124–134 | 中等 | validation、idempotency、converter、cli-command | 1 | 在临时目录中以强制模式重新执行一次转换，再与当前产物比较归一化 manifest，验证转换的可重复性。 |
| checkArsuOutput | 函数 | 115–122 | 简单 | validation、converter、cli-command、determinism | 1 | 校验已生成的 skills/arsu：合并产物校验结果与工作流目录校验错误，并检查预设图 profile 注册表投影的确定性，去重排序后返回。 |
| [convertArsu](../../../symbols/src/arsu-converter/converter.ts/convertArsu.md) | 函数 | 34–113 | 复杂 | orchestration、converter、pipeline、core-logic | 2 | 完整转换流程：所有规划与冲突检查都在触碰生成目录之前完成，输出目录已存在且有漂移时要求显式 --force，随后按清单逐组 emit、写出根级投影文件并执行两阶段落盘与校验。 |
| dryRunResult | 函数 | 153–180 | 中等 | dry-run、converter、data-model、cli-option | 1 | 为 --dry-run 构造不写盘的结果对象：保留已完成的锚点与运行时策略规划，空置分组清单，并给出恒为通过的校验占位结果。 |
| writeConversionOutputs | 函数 | 136–151 | 中等 | reporting、manifest、hashing、converter | 1 | 写出锚点替换报告、运行时策略报告、conversion-manifest.json 与人类可读转换报告，并回传各文件的 SHA-256 供 manifest 记录。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [catalog.ts](runtime-policy/catalog.ts.md) | src/arsu-converter/runtime-policy/catalog.ts | ARSU 上游运行时策略目录：把 41 个命中跨模型/模型分级关键词的源文件逐条判定为 adapt 或 retain，并记录 11 处未随包分发的上游运行时引用及其替换文本，同时给出禁止出现的 provider 凭证、endpoint 与 shell 请求模式。 |
| [catalog.ts](workflow/catalog.ts.md) | src/arsu-converter/workflow/catalog.ts | ARSU 工作流目录的导入门禁：导出 validateArsuWorkflowCatalog 包装路由目录校验，并在模块加载时立即执行，目录一旦非法就抛出带 issue 明细的错误。 |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [emit.ts](emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [generate.ts](workflow/generate.ts.md) | src/arsu-converter/workflow/generate.ts | 预设图谱生成器：把 converter 内置的 authored 图谱投影为工作区 profiles/ 目录下的 YAML 文件与 registry.json，并按投影内容计算 SHA-256。 |
| [git.ts](git.ts.md) | src/arsu-converter/git.ts | 只读 git 访问封装：执行 git 子命令并把成功、退出码、stdout/stderr 统一为 GitResult，同时提供按 `ls-files --stage` 解析受版本控制的普通文件列表。 |
| [idempotence.ts](idempotence.ts.md) | src/arsu-converter/idempotence.ts | 转换幂等性校验：既检查既有输出是否偏离其自身 manifest，也通过在临时目录重新生成并比较归一化 manifest 来证明重复转换字节一致。 |
| [ingest.ts](ingest.ts.md) | src/arsu-converter/ingest.ts | 上游文件清单化入口：只把存在 SKILL.md 的分组登记为 Skill 分组，随后用 classifyPath 把全部源路径分流进运行时目录、共享、排除与待复核四个集合并统一排序。 |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/manifest.ts | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [match.ts](anchors/match.ts.md) | src/arsu-converter/anchors/match.ts | 契约锚点匹配与替换计划的核心：先校验全部替换正文再逐锚点定位真实区间，检测同源文件内的区间重叠，产出带 before/after 指纹的 AnchorReplacementPlan，任何阻塞失败都在写入生成产物之前抛错。 |
| [planner.ts](runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [source-rewrite.ts](source-rewrite.ts.md) | src/arsu-converter/source-rewrite.ts | 跨改写目录的重叠校验器：合并 anchor 替换计划与运行时策略计划的 span，检测非法区间与跨目录区间重叠，保证两套改写可以在同一源文件上安全组合。 |
| [types.ts](runtime-policy/types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [upstream.ts](upstream.ts.md) | src/arsu-converter/upstream.ts | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [catalog.ts](../../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [cli.ts](cli.ts.md) | src/arsu-converter/cli.ts | ARSU 转换器的开发者命令行入口，提供 convert、check、idempotence 三个子命令与 --force/--dry-run/--json 选项，并显式拒绝 --source 以固定上游来源为 vendor/ars。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkArsuIdempotence | 函数 | 124–134 | 在临时目录中以强制模式重新执行一次转换，再与当前产物比较归一化 manifest，验证转换的可重复性。 |
| checkArsuOutput | 函数 | 115–122 | 校验已生成的 skills/arsu：合并产物校验结果与工作流目录校验错误，并检查预设图 profile 注册表投影的确定性，去重排序后返回。 |
| [convertArsu](../../../symbols/src/arsu-converter/converter.ts/convertArsu.md) | 函数 | 34–113 | 完整转换流程：所有规划与冲突检查都在触碰生成目录之前完成，输出目录已存在且有漂移时要求显式 --force，随后按清单逐组 emit、写出根级投影文件并执行两阶段落盘与校验。 |
