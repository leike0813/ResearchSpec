
# src/adapters/project-entry.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/project-entry.ts -->

维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。
源码：[src/adapters/project-entry.ts](../../../../../src/adapters/project-entry.ts)

## 符号（6）
<!-- node: function:src/adapters/project-entry.ts:entryOwnedBytes -->
<!-- node: function:src/adapters/project-entry.ts:findRegion -->
<!-- node: function:src/adapters/project-entry.ts:inspectProjectEntries -->
<!-- node: function:src/adapters/project-entry.ts:planProjectEntryDelivery -->
<!-- node: function:src/adapters/project-entry.ts:planProjectEntryRemoval -->
<!-- node: function:src/adapters/project-entry.ts:renderAgreement -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [entryOwnedBytes](../../../symbols/src/adapters/project-entry.ts/entryOwnedBytes.md) | 函数 | 17–22 | 简单 | ownership、region-protocol、utility、hashing | 2 | 返回该安装记录实际拥有的字节：文件模式为全量，区域模式仅取合法标记区间。 |
| findRegion | 函数 | 202–218 | 中等 | region-protocol、parsing、validation、safety | 1 | 在字节流中定位自有标记区间，对标记数量、配对、位置、换行与尾随内容做逐条校验后判为 none/valid/malformed。 |
| inspectProjectEntries | 函数 | 131–171 | 复杂 | inspection、diagnostics、read-only、project-entry | 0 | 只读检查入口协议：报告缺失、畸形、无所有权、漂移，以及 AGENTS.md 被 override 遮蔽等宿主特定风险。 |
| [planProjectEntryDelivery](../../../symbols/src/adapters/project-entry.ts/planProjectEntryDelivery.md) | 函数 | 24–102 | 复杂 | planning、project-entry、region-protocol、diagnostics | 1 | 按入口协议规划写入：处理 OpenCode 的 CLAUDE.md 回退、缺少 Navigate 资产、区域缺失/畸形/被改动等多种保留分支。 |
| planProjectEntryRemoval | 函数 | 104–129 | 中等 | removal、project-entry、safety、region-protocol | 1 | 规划移除入口协议：文件模式直接删除，区域模式只切掉自有标记区间，内容被改动则保留。 |
| renderAgreement | 函数 | 185–200 | 中等 | prompt-text、rendering、project-entry、consent | 1 | 渲染入口协议正文：说明何时使用 Navigate 入口、状态与 Procedure 发现流程，以及发现不构成任何授权。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [installations.ts](installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [path-boundary.ts](../core/workspace/path-boundary.ts.md) | src/core/workspace/path-boundary.ts | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [delivery.ts](delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [installations.ts](installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [entryOwnedBytes](../../../symbols/src/adapters/project-entry.ts/entryOwnedBytes.md) | 函数 | 17–22 | 返回该安装记录实际拥有的字节：文件模式为全量，区域模式仅取合法标记区间。 |
| inspectProjectEntries | 函数 | 131–171 | 只读检查入口协议：报告缺失、畸形、无所有权、漂移，以及 AGENTS.md 被 override 遮蔽等宿主特定风险。 |
| [planProjectEntryDelivery](../../../symbols/src/adapters/project-entry.ts/planProjectEntryDelivery.md) | 函数 | 24–102 | 按入口协议规划写入：处理 OpenCode 的 CLAUDE.md 回退、缺少 Navigate 资产、区域缺失/畸形/被改动等多种保留分支。 |
| planProjectEntryRemoval | 函数 | 104–129 | 规划移除入口协议：文件模式直接删除，区域模式只切掉自有标记区间，内容被改动则保留。 |
