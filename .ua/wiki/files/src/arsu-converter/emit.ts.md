
# src/arsu-converter/emit.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/emit.ts -->

单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。
源码：[src/arsu-converter/emit.ts](../../../../../src/arsu-converter/emit.ts)

## 符号（12）
<!-- node: function:src/arsu-converter/emit.ts:addAnchoredRuntimeFiles -->
<!-- node: function:src/arsu-converter/emit.ts:addRuntimePolicyFiles -->
<!-- node: function:src/arsu-converter/emit.ts:buildNeedsReview -->
<!-- node: function:src/arsu-converter/emit.ts:copyTransformedFile -->
<!-- node: function:src/arsu-converter/emit.ts:emitOfflineZoteroPackageMarkers -->
<!-- node: function:src/arsu-converter/emit.ts:emitQuartoRenderHelper -->
<!-- node: function:src/arsu-converter/emit.ts:emitRevisionPatchHelper -->
<!-- node: function:src/arsu-converter/emit.ts:emitRevisionPatchSchema -->
<!-- node: function:src/arsu-converter/emit.ts:emitSkillGroup -->
<!-- node: function:src/arsu-converter/emit.ts:groupFiles -->
<!-- node: function:src/arsu-converter/emit.ts:protectAnchorBlocks -->
<!-- node: function:src/arsu-converter/emit.ts:restoreAnchorBlocks -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| addAnchoredRuntimeFiles | 函数 | 226–234 | 简单 | path-mapping、contract-anchor、converter、dependency-resolution | 1 | 把带锚点替换跨度的源文件补进复制清单：分组内文件保留相对路径，shared 下的共享契约则投影到分组的 references/shared 目录。 |
| addRuntimePolicyFiles | 函数 | 236–249 | 中等 | path-mapping、runtime-policy、converter、dependency-resolution | 1 | 把运行时策略改写涉及的源文件补进复制清单，并对 academic-paper-reviewer 额外纳入检查闭包文件，确保其依赖的校验脚本不会在生成产物中缺失。 |
| buildNeedsReview | 函数 | 343–366 | 中等 | review、reporting、validation、converter | 1 | 把残留运行时标记与缺失依赖统一投影为待人工复核条目，附带分类、命中词与原因并按路径排序，作为生成产物中显式的“未自动处理”信号。 |
| [copyTransformedFile](../../../symbols/src/arsu-converter/emit.ts/copyTransformedFile.md) | 函数 | 251–319 | 复杂 | code-generation、rewriting、contract-anchor、converter、core-logic | 1 | 复制单个文件并按类型选择处理路径：schema 源直接投影，文本资源依次执行联合替换、锚点块保护、Markdown 链接重写与文本改写后还原并注入契约前言，SKILL.md 额外投影 frontmatter 描述，二进制资源则原样复制。 |
| emitOfflineZoteroPackageMarkers | 函数 | 169–185 | 中等 | code-generation、packaging、converter、zotero | 0 | 为 academic-pipeline 生成离线 Zotero 适配所需的 Python 包标记文件，使复制过来的 scripts 子目录在无第三方安装的情况下仍可被导入。 |
| emitQuartoRenderHelper | 函数 | 213–224 | 简单 | code-generation、helper-script、projection、converter | 0 | 同样以原样复制的方式投影 render-quarto.mjs 到 academic-paper 分组，配合契约前言中默认不执行的约束提供受控渲染入口。 |
| emitRevisionPatchHelper | 函数 | 200–211 | 简单 | code-generation、helper-script、projection、converter | 0 | 把仓库内的 apply-revision-patch.mjs 原样复制到 academic-paper 分组的 scripts 目录，使生成产物不依赖 ResearchSpec 源码树即可应用修订补丁。 |
| emitRevisionPatchSchema | 函数 | 187–198 | 简单 | code-generation、schema、projection、converter | 0 | 把 ResearchSpec 侧的 revision patch JSON schema 投影为每个分组的共享资产，返回带来源标注与 SHA-256 的 CopiedFile 记录。 |
| emitSkillGroup | 函数 | 37–153 | 复杂 | code-generation、orchestration、dependency-resolution、converter | 0 | 生成一个 Skill 分组的完整产物：建目录、汇总待复制文件并通过工作队列递归发现依赖、记录缺失依赖，逐文件改写复制后追加许可文件、revision patch schema 与分组专属脚本，最后组装 SkillConversion 结果。 |
| groupFiles | 函数 | 155–167 | 中等 | code-generation、path-mapping、converter、utility | 1 | 把分组的入口与各运行时目录清单折叠为 源路径到输出路径 的映射，入口统一输出为 SKILL.md，academic-pipeline 额外纳入离线 Zotero 适配脚本。 |
| protectAnchorBlocks | 函数 | 321–331 | 中等 | protecting、contract-anchor、rewriting、utility | 1 | 用配对反引号语法把已注入的 rs 锚点块整体替换为编号占位符并暂存原文，使后续的链接与文本改写不会破坏契约内容。 |
| restoreAnchorBlocks | 函数 | 333–341 | 简单 | rewriting、contract-anchor、utility、restoration | 1 | 按占位符编号逐个还原先前暂存的锚点块原文，正则替换中使用回调避免替换串里的特殊字符被当作引用。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [contract.ts](revision/contract.ts.md) | src/arsu-converter/revision/contract.ts | ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [contracts.ts](routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [licensing.ts](licensing.ts.md) | src/arsu-converter/licensing.ts | ARSU 分组的许可与署名投影：校验上游 LICENSE 确为 Cheng-I Wu 的 CC BY-NC 4.0 授权后原样复制，并为每个分组生成独立署名 NOTICE.md。 |
| [projection.ts](routing/projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |
| [replace.ts](anchors/replace.ts.md) | src/arsu-converter/anchors/replace.ts | 锚点与运行时策略的联合替换执行器：把两类重写区间按逆序合并应用以保持偏移有效，为锚点替换包裹 rs 标记、保留原有行尾风格，并回写替换后指纹与输出路径。 |
| [transform.ts](transform.ts.md) | src/arsu-converter/transform.ts | 转换期文本变换层：扫描平台词、历史词、schema 版本与 issue 引用等风险信号，发现 Skill 间的文件依赖并判定 shared/cross_skill/local 类别，重写 Markdown 链接到生成目录结构，并把无法解析的链接就地中和为纯文本。 |
| [types.ts](anchors/types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |
| [types.ts](runtime-policy/types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| emitSkillGroup | 函数 | 37–153 | 生成一个 Skill 分组的完整产物：建目录、汇总待复制文件并通过工作队列递归发现依赖、记录缺失依赖，逐文件改写复制后追加许可文件、revision patch schema 与分组专属脚本，最后组装 SkillConversion 结果。 |
