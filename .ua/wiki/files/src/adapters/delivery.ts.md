
# src/adapters/delivery.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/delivery.ts -->

为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。
源码：[src/adapters/delivery.ts](../../../../../src/adapters/delivery.ts)

## 符号（2）
<!-- node: function:src/adapters/delivery.ts:planToolDelivery -->
<!-- node: function:src/adapters/delivery.ts:selectSkillWriters -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [planToolDelivery](../../../symbols/src/adapters/delivery.ts/planToolDelivery.md) | 函数 | 24–140 | 复杂 | planning、delivery、write-plan、orchestration | 1 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |
| selectSkillWriters | 函数 | 142–150 | 简单 | policy、host-selection、utility、delivery | 0 | 决定哪些宿主写入 Skill：commands-only 宿主排除，同时命中 codex 与 agents 时只保留 codex。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [agent-profiles.ts](agent-profiles.ts.md) | src/adapters/agent-profiles.ts | 为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。 |
| [command-renderer.ts](command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [index.ts](companion/index.ts.md) | src/adapters/companion/index.ts | Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。 |
| [installations.ts](installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [project-entry.ts](project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [registry.ts](../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [workspace-delivery.ts](workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [planToolDelivery](../../../symbols/src/adapters/delivery.ts/planToolDelivery.md) | 函数 | 24–140 | 为每个选中宿主规划 Navigate Skill 文件、命令包装、共享标记与 custom-agent profile 的写入，并汇总安装记录与诊断。 |
| selectSkillWriters | 函数 | 142–150 | 决定哪些宿主写入 Skill：commands-only 宿主排除，同时命中 codex 与 agents 时只保留 codex。 |
