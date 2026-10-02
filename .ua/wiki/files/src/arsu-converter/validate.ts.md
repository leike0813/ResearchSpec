
# src/arsu-converter/validate.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/validate.ts -->

生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。
源码：[src/arsu-converter/validate.ts](../../../../../src/arsu-converter/validate.ts)

## 符号（12）
<!-- node: function:src/arsu-converter/validate.ts:collectFiles -->
<!-- node: function:src/arsu-converter/validate.ts:collectGeneratedFiles -->
<!-- node: function:src/arsu-converter/validate.ts:extractMarkerBlock -->
<!-- node: function:src/arsu-converter/validate.ts:forbiddenRuntimeArtifact -->
<!-- node: function:src/arsu-converter/validate.ts:readJsonFile -->
<!-- node: function:src/arsu-converter/validate.ts:validateAnchorReplacementMarkers -->
<!-- node: function:src/arsu-converter/validate.ts:validateArsuOutput -->
<!-- node: function:src/arsu-converter/validate.ts:validateEntrypointOperationalPaths -->
<!-- node: function:src/arsu-converter/validate.ts:validateManifestShape -->
<!-- node: function:src/arsu-converter/validate.ts:validateMarkdownLinks -->
<!-- node: function:src/arsu-converter/validate.ts:validateRiskFindingCoverage -->
<!-- node: function:src/arsu-converter/validate.ts:validateRuntimePolicyOutput -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| collectFiles | 函数 | 536–551 | 简单 | 文件遍历、工具函数、文本校验 | 0 | 按扩展名与根目录过滤递归收集生成树中的可读文本文件。 |
| collectGeneratedFiles | 函数 | 426–438 | 简单 | 文件遍历、校验、工具函数 | 0 | 遍历生成输出树收集全部实际文件，用于与清单记录做双向比对。 |
| extractMarkerBlock | 函数 | 365–394 | 中等 | anchor、文本解析、工具函数 | 0 | 从生成文本中按起止标记提取标记块内容，用于比对 anchor 替换是否真正落地。 |
| forbiddenRuntimeArtifact | 函数 | 597–608 | 简单 | 校验、安全边界、合规 | 0 | 扫描生成文本中是否残留 provider 凭证、endpoint、直连模型 API、shell 请求或环境变量启用等禁止的运行时指导。 |
| readJsonFile | 函数 | 218–230 | 简单 | 工具函数、容错、json-解析 | 0 | 读取并解析 JSON 文件，解析失败时把错误追加到错误列表并返回 null，避免单点失败中断整体验收。 |
| validateAnchorReplacementMarkers | 函数 | 286–355 | 中等 | 校验、anchor、标记检查 | 0 | 按锚点类型校验生成产物中的 ResearchSpec 标记块：需要替换的锚点必须带标记且内容被改写，诊断型锚点只报告不强制。 |
| [validateArsuOutput](../../../symbols/src/arsu-converter/validate.ts/validateArsuOutput.md) | 函数 | 22–198 | 复杂 | 校验、验收、编排、离线检查 | 1 | 转换产物的总验收入口：确认输出根存在，聚合清单结构、契约集成、路由目录落盘、anchor 标记、运行时策略报告、链接可解析性与风险覆盖等子检查，返回 errors/warnings 汇总。 |
| validateEntrypointOperationalPaths | 函数 | 200–216 | 简单 | 校验、路径检查、上游适配 | 0 | 检查生成 SKILL.md 中以行内代码书写的 docs/ 与 scripts/ 路径是否仍指向未随包分发的上游操作路径。 |
| validateManifestShape | 函数 | 232–284 | 中等 | 校验、清单、契约 | 0 | 校验 conversion-manifest.json 的必备字段、skill group 完整性、输出文件记录与 source version 一致性。 |
| validateMarkdownLinks | 函数 | 553–573 | 中等 | 校验、链接检查、markdown-解析 | 0 | 校验生成 Markdown 中的相对链接确实指向已存在的输出文件，对上游引用与死链分别报错或告警。 |
| validateRiskFindingCoverage | 函数 | 575–595 | 中等 | 校验、风险扫描、覆盖度 | 0 | 按 group + path + line + category 比对转换期风险发现与清单中的 RiskFinding 记录，确保无遗漏与无凭空新增。 |
| validateRuntimePolicyOutput | 函数 | 440–524 | 复杂 | 校验、运行时策略、安全边界、审计 | 0 | 校验运行时策略在产物中的一致性：catalog_id、源 commit、分类计数、报告 SHA-256 与输出记录对齐、checker 闭包文件齐备、sprint schema 路径已改写，并拒绝未获批的上游根脚本进入生成包。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [catalog.ts](runtime-policy/catalog.ts.md) | src/arsu-converter/runtime-policy/catalog.ts | ARSU 上游运行时策略目录：把 41 个命中跨模型/模型分级关键词的源文件逐条判定为 adapt 或 retain，并记录 11 处未随包分发的上游运行时引用及其替换文本，同时给出禁止出现的 provider 凭证、endpoint 与 shell 请求模式。 |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [contract.ts](revision/contract.ts.md) | src/arsu-converter/revision/contract.ts | ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。 |
| [contracts.ts](contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [contracts.ts](routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [licensing.ts](licensing.ts.md) | src/arsu-converter/licensing.ts | ARSU 分组的许可与署名投影：校验上游 LICENSE 确为 Cheng-I Wu 的 CC BY-NC 4.0 授权后原样复制，并为每个分组生成独立署名 NOTICE.md。 |
| [markers.ts](anchors/markers.ts.md) | src/arsu-converter/anchors/markers.ts | 运行时标记的单一事实源：校验锚点 ID 是否符合注册域格式，并生成包裹替换块的开闭 HTML 注释标记。 |
| [projection.ts](routing/projection.ts.md) | src/arsu-converter/routing/projection.ts | 路由语义的文本投影层：把 Skill、路由、前置条件组渲染为 SKILL.md frontmatter description 与命令描述，并校验 frontmatter 中的 name 与 Skill ID 一致后改写 description。 |
| [registry.ts](../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |
| [transform.ts](transform.ts.md) | src/arsu-converter/transform.ts | 转换期文本变换层：扫描平台词、历史词、schema 版本与 issue 引用等风险信号，发现 Skill 间的文件依赖并判定 shared/cross_skill/local 类别，重写 Markdown 链接到生成目录结构，并把无法解析的链接就地中和为纯文本。 |
| [types.ts](runtime-policy/types.ts.md) | src/arsu-converter/runtime-policy/types.ts | 运行时策略层的纯类型定义：目录条目、不可用引用、checker 闭包、改写 span、适配记录与可序列化计划形态，无运行时代码。 |
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
| [validateArsuOutput](../../../symbols/src/arsu-converter/validate.ts/validateArsuOutput.md) | 函数 | 22–198 | 转换产物的总验收入口：确认输出根存在，聚合清单结构、契约集成、路由目录落盘、anchor 标记、运行时策略报告、链接可解析性与风险覆盖等子检查，返回 errors/warnings 汇总。 |
