
# src/literature-adapters
> 目录聚合页：8 个文件、21 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/literature-adapters/assets.ts](../../files/src/literature-adapters/assets.ts.md) | 文件 | 2 | 读取文献 Adapter 的安装 profile 模板与单个 Skill 包的全部资源文件，记录相对路径、字节内容与可执行位。 |
| [src/literature-adapters/catalog.ts](../../files/src/literature-adapters/catalog.ts.md) | 文件 | 4 | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [src/literature-adapters/contracts.ts](../../files/src/literature-adapters/contracts.ts.md) | 文件 | 2 | 文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。 |
| [src/literature-adapters/delivery.ts](../../files/src/literature-adapters/delivery.ts.md) | 文件 | 3 | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [src/literature-adapters/index.ts](../../files/src/literature-adapters/index.ts.md) | 文件 | 0 | 文献适配器子系统的 barrel 入口，re-export catalog、assets、contracts、delivery、platform、provider-contracts 与 provider-policy 七个模块。 |
| [src/literature-adapters/platform.ts](../../files/src/literature-adapters/platform.ts.md) | 文件 | 2 | 把 Node 的 platform/arch 组合归一化为 Adapter 运行时平台标识，并在目录中解析出对应的二进制运行时记录。 |
| [src/literature-adapters/provider-contracts.ts](../../files/src/literature-adapters/provider-contracts.ts.md) | 文件 | 0 | 文献来源提供方的 Zod 契约：定义四种来源策略模式、Provider 就绪检查、检索交接与受管库授权请求/结果的结构。 |
| [src/literature-adapters/provider-policy.ts](../../files/src/literature-adapters/provider-policy.ts.md) | 文件 | 8 | 文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。 |

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/adapters](adapters.md) | 3 |
| [src/core/validation](core/validation.md) | 1 |
| [src/core/workspace](core/workspace.md) | 1 |
