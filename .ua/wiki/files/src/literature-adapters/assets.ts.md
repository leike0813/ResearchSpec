
# src/literature-adapters/assets.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/assets.ts -->

读取文献 Adapter 的安装 profile 模板与单个 Skill 包的全部资源文件，记录相对路径、字节内容与可执行位。
源码：[src/literature-adapters/assets.ts](../../../../../src/literature-adapters/assets.ts)

## 符号（2）
<!-- node: function:src/literature-adapters/assets.ts:readLiteratureAdapterProfile -->
<!-- node: function:src/literature-adapters/assets.ts:readLiteratureAdapterSkillAssets -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| readLiteratureAdapterProfile | 函数 | 17–19 | 简单 | literature-adapter、io、profile | 0 | 按 Adapter 声明的 profile 模板路径读取字节内容，供项目工作区写入 `.zotero-bridge/` 安装文件。 |
| readLiteratureAdapterSkillAssets | 函数 | 21–36 | 简单 | literature-adapter、assets、directory-walk、delivery | 0 | 递归遍历某个 Adapter Skill 的源目录，收集全部资源文件及其可执行标记，生成安装所需的资产清单。 |

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
| readLiteratureAdapterProfile | 函数 | 17–19 | 按 Adapter 声明的 profile 模板路径读取字节内容，供项目工作区写入 `.zotero-bridge/` 安装文件。 |
| readLiteratureAdapterSkillAssets | 函数 | 21–36 | 递归遍历某个 Adapter Skill 的源目录，收集全部资源文件及其可执行标记，生成安装所需的资产清单。 |
