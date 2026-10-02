
# src/literature-adapters/delivery.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/literature-adapters](../../../modules/src/literature-adapters.md)
<!-- node: file:src/literature-adapters/delivery.ts -->

为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。
源码：[src/literature-adapters/delivery.ts](../../../../../src/literature-adapters/delivery.ts)

## 符号（3）
<!-- node: function:src/literature-adapters/delivery.ts:literatureSource -->
<!-- node: function:src/literature-adapters/delivery.ts:planLiteratureAdapterDelivery -->
<!-- node: function:src/literature-adapters/delivery.ts:reconcileLiteratureAdapterInstallations -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| literatureSource | 函数 | 286–301 | 简单 | literature-adapter、provenance、utility | 0 | 构造文献适配器资产的可追溯来源描述，记录发布集、组件、Skill 与平台。 |
| [planLiteratureAdapterDelivery](../../../symbols/src/literature-adapters/delivery.ts/planLiteratureAdapterDelivery.md) | 函数 | 97–284 | 复杂 | literature-adapter、delivery、write-plan、planning | 1 | 把已选文献适配器域与运行时平台展开为 Profile 和 Skill 文件写入计划、解析快照与诊断。 |
| [reconcileLiteratureAdapterInstallations](../../../symbols/src/literature-adapters/delivery.ts/reconcileLiteratureAdapterInstallations.md) | 函数 | 25–95 | 复杂 | literature-adapter、managed-installation、reconciliation | 1 | 对照期望安装集合协调既有文献适配器安装：校验受管目标、保留仍在使用的记录，并为不安全记录产出诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assets.ts](assets.ts.md) | src/literature-adapters/assets.ts | 读取文献 Adapter 的安装 profile 模板与单个 Skill 包的全部资源文件，记录相对路径、字节内容与可执行位。 |
| [catalog.ts](catalog.ts.md) | src/literature-adapters/catalog.ts | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [installations.ts](../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [platform.ts](platform.ts.md) | src/literature-adapters/platform.ts | 把 Node 的 platform/arch 组合归一化为 Adapter 运行时平台标识，并在目录中解析出对应的二进制运行时记录。 |
| [tools.ts](../adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [planLiteratureAdapterDelivery](../../../symbols/src/literature-adapters/delivery.ts/planLiteratureAdapterDelivery.md) | 函数 | 97–284 | 把已选文献适配器域与运行时平台展开为 Profile 和 Skill 文件写入计划、解析快照与诊断。 |
| [reconcileLiteratureAdapterInstallations](../../../symbols/src/literature-adapters/delivery.ts/reconcileLiteratureAdapterInstallations.md) | 函数 | 25–95 | 对照期望安装集合协调既有文献适配器安装：校验受管目标、保留仍在使用的记录，并为不安全记录产出诊断。 |
