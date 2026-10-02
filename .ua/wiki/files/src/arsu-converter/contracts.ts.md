
# src/arsu-converter/contracts.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/contracts.ts -->

ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。
源码：[src/arsu-converter/contracts.ts](../../../../../src/arsu-converter/contracts.ts)

## 符号（7）
<!-- node: function:src/arsu-converter/contracts.ts:buildContractIntegrationManifest -->
<!-- node: function:src/arsu-converter/contracts.ts:buildProfile -->
<!-- node: function:src/arsu-converter/contracts.ts:contractPreflightBlock -->
<!-- node: function:src/arsu-converter/contracts.ts:injectContractPreflight -->
<!-- node: function:src/arsu-converter/contracts.ts:manuscriptDeliveryBlock -->
<!-- node: function:src/arsu-converter/contracts.ts:mutationBoundaryBullets -->
<!-- node: function:src/arsu-converter/contracts.ts:paperHumanizerReferenceBlock -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildContractIntegrationManifest | 函数 | 44–58 | 中等 | manifest、contract-injection、projection、converter | 1 | 构建写入生成产物的 researchspec-contracts.json：记录集成 profile、来源与输出路径、锚点替换 profile 与标记格式，并为每个 Skill 分组生成契约画像。 |
| [buildProfile](../../../symbols/src/arsu-converter/contracts.ts/buildProfile.md) | 函数 | 85–117 | 复杂 | contract-injection、data-model、policy、generation | 1 | 为单个 Skill 分组生成契约画像：列出必备契约文件、handoff 读取范围、允许写入的产物类型、变更权限归属与分组专属备注（学术论文额外允许 revision patch 产物）。 |
| [contractPreflightBlock](../../../symbols/src/arsu-converter/contracts.ts/contractPreflightBlock.md) | 函数 | 119–179 | 复杂 | contract-injection、policy、generation、core-logic | 1 | 生成契约前言正文：陈述 standalone 与 graph 两种模式的行为边界、只使用 status/instructions 返回的选择器、Gate 与 Decision 需逐次人工确认、可选领域流程的同意边界，并组合交付、humanizer 与文献适配子块。 |
| injectContractPreflight | 函数 | 60–83 | 中等 | contract-injection、idempotency、markdown、generation | 1 | 把契约前言块插入 SKILL.md：优先放在 frontmatter 之后以保持 YAML 有效，已含标记时跳过注入，并返回是否实际注入的结构化结果。 |
| [manuscriptDeliveryBlock](../../../symbols/src/arsu-converter/contracts.ts/manuscriptDeliveryBlock.md) | 函数 | 198–223 | 复杂 | contract-injection、manuscript、policy、generation | 1 | 生成手稿交付约束：deep-research 不注入；其余分组要求以 specs/manuscript.yaml 的 delivery 为格式契约、QMD 视为不透明内容保留，论文与流水线还需遵守受限的 quarto 探测与渲染脚本规则。 |
| mutationBoundaryBullets | 函数 | 26–42 | 中等 | policy、contract-injection、authority、generation | 0 | 按锚点声明的 ResearchSpec 目标推导应写入的变更边界条目：稳定规格可直接编辑、运行与节点状态只能经 CLI、handoff 走命令提交、边界交付物留在 researchspec/ 之外。 |
| paperHumanizerReferenceBlock | 函数 | 181–196 | 中等 | contract-injection、routing、generation、policy | 1 | 按分组生成 paper-humanizer Reference mode 约束：学术论文在改写手稿时静默加载该入口，流水线只负责把约束传递给活跃的论文生产者，其余分组不注入。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [provider-policy.ts](../literature-adapters/provider-policy.ts.md) | src/literature-adapters/provider-policy.ts | 文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。 |
| [reference-mode.ts](../core-skills/paper-humanizer/reference-mode.ts.md) | src/core-skills/paper-humanizer/reference-mode.ts | paper-humanizer 路径常量：指向当前的 reference-mode Skill 路径与已退役的 prose-guidance 路径，供转换器判定上游文件是否属于参考模式迁移。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [emit.ts](emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildContractIntegrationManifest | 函数 | 44–58 | 构建写入生成产物的 researchspec-contracts.json：记录集成 profile、来源与输出路径、锚点替换 profile 与标记格式，并为每个 Skill 分组生成契约画像。 |
| injectContractPreflight | 函数 | 60–83 | 把契约前言块插入 SKILL.md：优先放在 frontmatter 之后以保持 YAML 有效，已含标记时跳过注入，并返回是否实际注入的结构化结果。 |
| mutationBoundaryBullets | 函数 | 26–42 | 按锚点声明的 ResearchSpec 目标推导应写入的变更边界条目：稳定规格可直接编辑、运行与节点状态只能经 CLI、handoff 走命令提交、边界交付物留在 researchspec/ 之外。 |
