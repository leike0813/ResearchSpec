
# src/literature-adapters/contracts.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/contracts.ts -->

文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。
源码：[src/literature-adapters/contracts.ts](../../../../../src/literature-adapters/contracts.ts)

## 符号（2）
<!-- node: function:src/literature-adapters/contracts.ts:assertAcyclicSkills -->
<!-- node: function:src/literature-adapters/contracts.ts:validateLiteratureAdapterCatalog -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertAcyclicSkills | 函数 | 125–138 | 简单 | validation、dependency-graph、literature-adapter、cycle-detection | 1 | 对 Adapter 内 Skill 的硬依赖关系做环检测，阻止会形成循环加载的依赖图进入目录。 |
| validateLiteratureAdapterCatalog | 函数 | 102–123 | 中等 | validation、literature-adapter、contracts、integrity | 0 | 校验完整文献 Adapter 目录的结构、ID 唯一性、运行时平台条目与硬依赖无环，任一违规即拒绝整个目录。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assets.ts](assets.ts.md) | src/literature-adapters/assets.ts | 读取文献 Adapter 的安装 profile 模板与单个 Skill 包的全部资源文件，记录相对路径、字节内容与可执行位。 |
| [catalog.ts](catalog.ts.md) | src/literature-adapters/catalog.ts | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [platform.ts](platform.ts.md) | src/literature-adapters/platform.ts | 把 Node 的 platform/arch 组合归一化为 Adapter 运行时平台标识，并在目录中解析出对应的二进制运行时记录。 |
| [provider-policy.ts](provider-policy.ts.md) | src/literature-adapters/provider-policy.ts | 文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。 |
| [zotero-library-agent-bundle.ts](../vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts | Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateLiteratureAdapterCatalog | 函数 | 102–123 | 校验完整文献 Adapter 目录的结构、ID 唯一性、运行时平台条目与硬依赖无环，任一违规即拒绝整个目录。 |
