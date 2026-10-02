
# src/literature-adapters/catalog.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/catalog.ts -->

文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。
源码：[src/literature-adapters/catalog.ts](../../../../../src/literature-adapters/catalog.ts)

## 符号（4）
<!-- node: function:src/literature-adapters/catalog.ts:assertLiteratureAdapterSelection -->
<!-- node: function:src/literature-adapters/catalog.ts:desiredLiteratureAdapters -->
<!-- node: function:src/literature-adapters/catalog.ts:getLiteratureAdapter -->
<!-- node: function:src/literature-adapters/catalog.ts:parseLiteratureAdapterExpression -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertLiteratureAdapterSelection | 函数 | 152–155 | 简单 | literature-adapter、validation、configuration、error-handling | 1 | 校验工作区中的 Adapter 选择是否全部存在于目录中，未知 ID 直接报出，避免静默忽略错误配置。 |
| desiredLiteratureAdapters | 函数 | 157–161 | 简单 | literature-adapter、configuration、resolution | 0 | 返回工作区期望的 Adapter 定义列表，先校验选择表达式再从目录解析出完整定义。 |
| [getLiteratureAdapter](../../../symbols/src/literature-adapters/catalog.ts/getLiteratureAdapter.md) | 函数 | 136–138 | 简单 | literature-adapter、lookup、error-handling | 3 | 按 Adapter ID 从目录中取出单个文献 Adapter 定义，ID 不存在时抛出明确错误。 |
| parseLiteratureAdapterExpression | 函数 | 140–150 | 简单 | literature-adapter、parsing、configuration、validation | 0 | 把工作区选择表达式解析为期望安装的 Adapter ID 集合，规范空白与分隔符后返回去重结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/literature-adapters/contracts.ts | 文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [delivery.ts](delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [managed-target.ts](../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [provider-policy.ts](provider-policy.ts.md) | src/literature-adapters/provider-policy.ts | 文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。 |
| [registry.ts](../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [skill-harness.test.ts](../../tests/skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertLiteratureAdapterSelection | 函数 | 152–155 | 校验工作区中的 Adapter 选择是否全部存在于目录中，未知 ID 直接报出，避免静默忽略错误配置。 |
| desiredLiteratureAdapters | 函数 | 157–161 | 返回工作区期望的 Adapter 定义列表，先校验选择表达式再从目录解析出完整定义。 |
| [getLiteratureAdapter](../../../symbols/src/literature-adapters/catalog.ts/getLiteratureAdapter.md) | 函数 | 136–138 | 按 Adapter ID 从目录中取出单个文献 Adapter 定义，ID 不存在时抛出明确错误。 |
| parseLiteratureAdapterExpression | 函数 | 140–150 | 把工作区选择表达式解析为期望安装的 Adapter ID 集合，规范空白与分隔符后返回去重结果。 |
