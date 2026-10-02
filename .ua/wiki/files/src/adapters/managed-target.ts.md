
# src/adapters/managed-target.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/managed-target.ts -->

把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。
源码：[src/adapters/managed-target.ts](../../../../../src/adapters/managed-target.ts)

## 符号（8）
<!-- node: function:src/adapters/managed-target.ts:agentNamespaceId -->
<!-- node: function:src/adapters/managed-target.ts:managedTargetDiagnostic -->
<!-- node: class:src/adapters/managed-target.ts:ManagedTargetError -->
<!-- node: function:src/adapters/managed-target.ts:resolveAgentTarget -->
<!-- node: function:src/adapters/managed-target.ts:resolveFrameworkTarget -->
<!-- node: function:src/adapters/managed-target.ts:resolveLiteratureTarget -->
<!-- node: function:src/adapters/managed-target.ts:resolveManagedTarget -->
<!-- node: function:src/adapters/managed-target.ts:validateManagedTarget -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| agentNamespaceId | 函数 | 186–214 | 中等 | validation、skill-id、namespace、security | 1 | 从各来源类型中取出并校验 Skill 命名空间 ID，Adapter Skill 还需在目录中已登记。 |
| managedTargetDiagnostic | 函数 | 64–75 | 简单 | diagnostics、error-mapping、adapter、utility | 1 | 把目标解析异常包装为阻塞级诊断，尽量带上目标路径与来源细节。 |
| ManagedTargetError | 类 | 19–26 | 简单 | error-contract、security、class、adapter | 0 | 托管目标非法时抛出的错误，固定 code 为 managed_target_invalid。 |
| resolveAgentTarget | 函数 | 77–135 | 复杂 | security、resolver、host-adapter、validation | 0 | 校验宿主工具与来源类型的组合，按 project-entry、command、shared-skill-target、custom-agent 与 Skill 命名空间分别推导目标。 |
| resolveFrameworkTarget | 函数 | 137–153 | 简单 | resolver、profiles、validation、framework | 0 | 推导 framework 所有者的 profile 目标，强制 null tool_id、项目作用域与 researchspec/profiles 下的固定文件名。 |
| resolveLiteratureTarget | 函数 | 155–184 | 中等 | resolver、literature-adapter、validation、platform | 0 | 推导文献 Adapter 的 runtime、profile 模板与 Windows shim 目标，运行时资产须匹配目录中登记的平台。 |
| resolveManagedTarget | 函数 | 36–55 | 中等 | resolver、security、dispatch、manifest | 1 | 不触碰文件系统地解析安装记录，按 owner 分派到 agent-tool、framework 或 literature-adapter 目标推导。 |
| [validateManagedTarget](../../../symbols/src/adapters/managed-target.ts/validateManagedTarget.md) | 函数 | 58–62 | 简单 | security、validation、path-boundary、async | 8 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [agent-profiles.ts](agent-profiles.ts.md) | src/adapters/agent-profiles.ts | 为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。 |
| [catalog.ts](../literature-adapters/catalog.ts.md) | src/literature-adapters/catalog.ts | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [command-renderer.ts](command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [installations.ts](installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [path-boundary.ts](../core/workspace/path-boundary.ts.md) | src/core/workspace/path-boundary.ts | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |
| [project-path.ts](../core/contracts/project-path.ts.md) | src/core/contracts/project-path.ts | 路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。 |
| [tools.ts](tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [delivery.ts](../literature-adapters/delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [delivery.ts](delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [graph-delivery.ts](../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-workspace-index.ts](../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [installations.ts](installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [legacy-reconciliation.ts](legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [project-entry.ts](project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [workspace-delivery.ts](workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| managedTargetDiagnostic | 函数 | 64–75 | 把目标解析异常包装为阻塞级诊断，尽量带上目标路径与来源细节。 |
| ManagedTargetError | 类 | 19–26 | 托管目标非法时抛出的错误，固定 code 为 managed_target_invalid。 |
| resolveManagedTarget | 函数 | 36–55 | 不触碰文件系统地解析安装记录，按 owner 分派到 agent-tool、framework 或 literature-adapter 目标推导。 |
| [validateManagedTarget](../../../symbols/src/adapters/managed-target.ts/validateManagedTarget.md) | 函数 | 58–62 | 在解析结果之上追加词法与符号链接边界检查，作为任何目标读取前的统一前置。 |
