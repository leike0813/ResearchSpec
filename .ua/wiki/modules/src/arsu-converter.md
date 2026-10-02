
# src/arsu-converter
> 目录聚合页：17 个文件、76 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/arsu-converter/classify.ts](../../files/src/arsu-converter/classify.ts.md) | 文件 | 1 | 上游文件路径分类器：把 vendor/ars 中的每个文件判定为运行时核心、共享资源、应排除或需人工复核，并给出可读理由与所属 Skill 分组，作为转换清单的分类单一事实源。 |
| [src/arsu-converter/cli.ts](../../files/src/arsu-converter/cli.ts.md) | 文件 | 2 | ARSU 转换器的开发者命令行入口，提供 convert、check、idempotence 三个子命令与 --force/--dry-run/--json 选项，并显式拒绝 --source 以固定上游来源为 vendor/ars。 |
| [src/arsu-converter/config.ts](../../files/src/arsu-converter/config.ts.md) | 文件 | 0 | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [src/arsu-converter/contracts.ts](../../files/src/arsu-converter/contracts.ts.md) | 文件 | 7 | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [src/arsu-converter/converter.ts](../../files/src/arsu-converter/converter.ts.md) | 文件 | 5 | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [src/arsu-converter/emit.ts](../../files/src/arsu-converter/emit.ts.md) | 文件 | 12 | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [src/arsu-converter/fs-utils.ts](../../files/src/arsu-converter/fs-utils.ts.md) | 文件 | 8 | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [src/arsu-converter/git.ts](../../files/src/arsu-converter/git.ts.md) | 文件 | 3 | 只读 git 访问封装：执行 git 子命令并把成功、退出码、stdout/stderr 统一为 GitResult，同时提供按 `ls-files --stage` 解析受版本控制的普通文件列表。 |
| [src/arsu-converter/idempotence.ts](../../files/src/arsu-converter/idempotence.ts.md) | 文件 | 3 | 转换幂等性校验：既检查既有输出是否偏离其自身 manifest，也通过在临时目录重新生成并比较归一化 manifest 来证明重复转换字节一致。 |
| [src/arsu-converter/ingest.ts](../../files/src/arsu-converter/ingest.ts.md) | 文件 | 1 | 上游文件清单化入口：只把存在 SKILL.md 的分组登记为 Skill 分组，随后用 classifyPath 把全部源路径分流进运行时目录、共享、排除与待复核四个集合并统一排序。 |
| [src/arsu-converter/licensing.ts](../../files/src/arsu-converter/licensing.ts.md) | 文件 | 2 | ARSU 分组的许可与署名投影：校验上游 LICENSE 确为 Cheng-I Wu 的 CC BY-NC 4.0 授权后原样复制，并为每个分组生成独立署名 NOTICE.md。 |
| [src/arsu-converter/manifest.ts](../../files/src/arsu-converter/manifest.ts.md) | 文件 | 7 | 转换产物的清单与报告层：汇总各 Skill 分组文件、根级投影文件与风险发现，生成 conversion-manifest.json、人类可读的转换报告和逐锚点的替换前后对照报告，并提供用于幂等比较的归一化。 |
| [src/arsu-converter/source-rewrite.ts](../../files/src/arsu-converter/source-rewrite.ts.md) | 文件 | 1 | 跨改写目录的重叠校验器：合并 anchor 替换计划与运行时策略计划的 span，检测非法区间与跨目录区间重叠，保证两套改写可以在同一源文件上安全组合。 |
| [src/arsu-converter/transform.ts](../../files/src/arsu-converter/transform.ts.md) | 文件 | 10 | 转换期文本变换层：扫描平台词、历史词、schema 版本与 issue 引用等风险信号，发现 Skill 间的文件依赖并判定 shared/cross_skill/local 类别，重写 Markdown 链接到生成目录结构，并把无法解析的链接就地中和为纯文本。 |
| [src/arsu-converter/types.ts](../../files/src/arsu-converter/types.ts.md) | 文件 | 1 | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [src/arsu-converter/upstream.ts](../../files/src/arsu-converter/upstream.ts.md) | 文件 | 1 | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |
| [src/arsu-converter/validate.ts](../../files/src/arsu-converter/validate.ts.md) | 文件 | 12 | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 子目录
- [anchors/replacements](arsu-converter/anchors/replacements.md)、[authoring/checkers](arsu-converter/authoring/checkers.md)、[authoring/procedures/m1](arsu-converter/authoring/procedures/m1.md)、[authoring/procedures/m2](arsu-converter/authoring/procedures/m2.md)、[authoring/procedures/m3](arsu-converter/authoring/procedures/m3.md)、[authoring/procedures/m4](arsu-converter/authoring/procedures/m4.md)、[authoring/procedures/m5](arsu-converter/authoring/procedures/m5.md)、[authoring/procedures/paper-humanizer](arsu-converter/authoring/procedures/paper-humanizer.md)、[authoring/procedures/review-response](arsu-converter/authoring/procedures/review-response.md)、[quarto](arsu-converter/quarto.md)、[revision](arsu-converter/revision.md)、[routing](arsu-converter/routing.md)、[runtime-policy/assets](arsu-converter/runtime-policy/assets.md)、[workflow/graph-profiles](arsu-converter/workflow/graph-profiles.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/arsu-converter/routing](arsu-converter/routing.md) | 9 |
| [src/arsu-converter/runtime-policy](arsu-converter/runtime-policy.md) | 8 |
| [src/arsu-converter/anchors](arsu-converter/anchors.md) | 7 |
| [src/arsu-converter/revision](arsu-converter/revision.md) | 2 |
| [src/arsu-converter/workflow](arsu-converter/workflow.md) | 2 |
| [src/graph-profiles](graph-profiles.md) | 2 |
| [src/core-skills/paper-humanizer](core-skills/paper-humanizer.md) | 1 |
| [src/literature-adapters](literature-adapters.md) | 1 |
