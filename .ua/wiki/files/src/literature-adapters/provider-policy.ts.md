
# src/literature-adapters/provider-policy.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/provider-policy.ts -->

文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。
源码：[src/literature-adapters/provider-policy.ts](../../../../../src/literature-adapters/provider-policy.ts)

## 符号（8）
<!-- node: function:src/literature-adapters/provider-policy.ts:evaluateManagedLibraryAuthorization -->
<!-- node: function:src/literature-adapters/provider-policy.ts:evaluateParsedAuthorization -->
<!-- node: function:src/literature-adapters/provider-policy.ts:getLiteratureSourcePolicy -->
<!-- node: function:src/literature-adapters/provider-policy.ts:planLiteratureProviderUse -->
<!-- node: function:src/literature-adapters/provider-policy.ts:providerSteps -->
<!-- node: function:src/literature-adapters/provider-policy.ts:renderLiteratureSourcePolicyProjection -->
<!-- node: function:src/literature-adapters/provider-policy.ts:requireSkill -->
<!-- node: function:src/literature-adapters/provider-policy.ts:resolveProviderSkills -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| evaluateManagedLibraryAuthorization | 函数 | 90–101 | 简单 | authorization、validation、literature-adapter、policy | 0 | 校验受管库授权请求对象是否满足契约，再交由内层判定逻辑产出授权或仅候选的处置结论。 |
| evaluateParsedAuthorization | 函数 | 133–150 | 中等 | authorization、validation、policy、literature-adapter | 1 | 逐项比对已解析授权与请求的运行、路由、Adapter、库与集合范围，并校验生效期与被接受的候选，返回带 reason_code 的处置结论。 |
| getLiteratureSourcePolicy | 函数 | 126–131 | 简单 | policy、lookup、literature-adapter | 1 | 按模式名取出对应的来源策略定义，模式不存在时抛出错误以拒绝未知策略。 |
| planLiteratureProviderUse | 函数 | 75–88 | 简单 | policy、planning、literature-adapter、decision | 0 | 根据来源策略、就绪状态、覆盖缺口与证据目标，规划是继续还是暂停，并给出步骤与是否必须披露覆盖限制。 |
| providerSteps | 函数 | 158–179 | 中等 | planning、policy、literature-adapter | 1 | 按就绪状态与证据目标拼装具体执行步骤序列，把策略定义转成可交给执行方的有序动作清单。 |
| [renderLiteratureSourcePolicyProjection](../../../symbols/src/literature-adapters/provider-policy.ts/renderLiteratureSourcePolicyProjection.md) | 函数 | 103–124 | 中等 | rendering、policy、literature-adapter、documentation | 2 | 把文献来源策略投影为可读文本，供 Navigate 等入口指引内嵌展示各模式下的提供方优先级与不可用时的行为。 |
| requireSkill | 函数 | 193–203 | 简单 | validation、literature-adapter、guard、policy | 1 | 断言某个必需 Skill 存在于已解析的提供方 Skill 集合中，缺失时立即失败以避免执行到一半才发现能力缺口。 |
| resolveProviderSkills | 函数 | 181–191 | 简单 | literature-adapter、resolution、capability、policy | 1 | 从 Adapter 目录中筛出满足当前步骤角色与可见性要求的文献 Skill 集合，作为可委派的提供方能力面。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](catalog.ts.md) | src/literature-adapters/catalog.ts | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [contracts.ts](contracts.ts.md) | src/literature-adapters/contracts.ts | 文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。 |
| [provider-contracts.ts](provider-contracts.ts.md) | src/literature-adapters/provider-contracts.ts | 文献来源提供方的 Zod 契约：定义四种来源策略模式、Provider 就绪检查、检索交接与受管库授权请求/结果的结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [navigate.ts](../adapters/companion/workflows/navigate.ts.md) | src/adapters/companion/workflows/navigate.ts | 唯一用户可见入口 Navigate 的执行指引：定义何时需要正式图工作流、standalone 与 graph 两种模式的差异，以及文献来源策略的投影方式。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| evaluateManagedLibraryAuthorization | 函数 | 90–101 | 校验受管库授权请求对象是否满足契约，再交由内层判定逻辑产出授权或仅候选的处置结论。 |
| getLiteratureSourcePolicy | 函数 | 126–131 | 按模式名取出对应的来源策略定义，模式不存在时抛出错误以拒绝未知策略。 |
| planLiteratureProviderUse | 函数 | 75–88 | 根据来源策略、就绪状态、覆盖缺口与证据目标，规划是继续还是暂停，并给出步骤与是否必须披露覆盖限制。 |
| [renderLiteratureSourcePolicyProjection](../../../symbols/src/literature-adapters/provider-policy.ts/renderLiteratureSourcePolicyProjection.md) | 函数 | 103–124 | 把文献来源策略投影为可读文本，供 Navigate 等入口指引内嵌展示各模式下的提供方优先级与不可用时的行为。 |
