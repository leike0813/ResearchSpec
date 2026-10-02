
# src/adapters/legacy-reconciliation.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/legacy-reconciliation.ts -->

规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。
源码：[src/adapters/legacy-reconciliation.ts](../../../../../src/adapters/legacy-reconciliation.ts)

## 符号（2）
<!-- node: function:src/adapters/legacy-reconciliation.ts:compareKnownTree -->
<!-- node: function:src/adapters/legacy-reconciliation.ts:planLegacyToolReconciliation -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| compareKnownTree | 函数 | 137–149 | 中等 | hashing、comparison、safety、read-only | 0 | 把遗留目录内每个文件与当前期望哈希比对，判定为 clean / drift / unknown 三态以决定是否可删。 |
| [planLegacyToolReconciliation](../../../symbols/src/adapters/legacy-reconciliation.ts/planLegacyToolReconciliation.md) | 函数 | 18–131 | 复杂 | reconciliation、legacy-cleanup、safety、write-plan | 1 | 规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [command-renderer.ts](command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [installations.ts](installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [path-boundary.ts](../core/workspace/path-boundary.ts.md) | src/core/workspace/path-boundary.ts | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [workspace-delivery.ts](workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [planLegacyToolReconciliation](../../../symbols/src/adapters/legacy-reconciliation.ts/planLegacyToolReconciliation.md) | 函数 | 18–131 | 规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。 |
