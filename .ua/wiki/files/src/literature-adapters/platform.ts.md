
# src/literature-adapters/platform.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/platform.ts -->

把 Node 的 platform/arch 组合归一化为 Adapter 运行时平台标识，并在目录中解析出对应的二进制运行时记录。
源码：[src/literature-adapters/platform.ts](../../../../../src/literature-adapters/platform.ts)

## 符号（2）
<!-- node: function:src/literature-adapters/platform.ts:normalizeLiteratureAdapterPlatform -->
<!-- node: function:src/literature-adapters/platform.ts:resolveLiteratureAdapterPlatform -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| normalizeLiteratureAdapterPlatform | 函数 | 19–21 | 简单 | platform、normalization、utility | 1 | 将 `platform:arch` 组合通过查表映射为 Adapter 平台标识，未收录组合返回 undefined。 |
| resolveLiteratureAdapterPlatform | 函数 | 23–34 | 简单 | platform、resolution、literature-adapter、discriminated-union | 0 | 在 Adapter 运行时列表中查找当前平台的二进制条目，区分「平台未知」与「平台已知但未提供运行时」两种不支持情形。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](contracts.ts.md) | src/literature-adapters/contracts.ts | 文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [delivery.ts](delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| normalizeLiteratureAdapterPlatform | 函数 | 19–21 | 将 `platform:arch` 组合通过查表映射为 Adapter 平台标识，未收录组合返回 undefined。 |
| resolveLiteratureAdapterPlatform | 函数 | 23–34 | 在 Adapter 运行时列表中查找当前平台的二进制条目，区分「平台未知」与「平台已知但未提供运行时」两种不支持情形。 |
