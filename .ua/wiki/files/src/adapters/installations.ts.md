
# src/adapters/installations.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/installations.ts -->

托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。
源码：[src/adapters/installations.ts](../../../../../src/adapters/installations.ts)

## 符号（5）
<!-- node: function:src/adapters/installations.ts:deduplicateInstallations -->
<!-- node: function:src/adapters/installations.ts:managedSkillId -->
<!-- node: function:src/adapters/installations.ts:parseToolInstallationManifest -->
<!-- node: function:src/adapters/installations.ts:reconcileAgentToolInstallations -->
<!-- node: function:src/adapters/installations.ts:renderToolInstallationManifest -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| deduplicateInstallations | 函数 | 196–199 | 简单 | deduplication、manifest、determinism、utility | 1 | 按 scope+path 去重安装记录，并按 tool_id 与路径稳定排序以保证清单可复现。 |
| [managedSkillId](../../../symbols/src/adapters/installations.ts/managedSkillId.md) | 函数 | 201–209 | 简单 | utility、manifest、accessor、skill-id | 2 | 从不同来源类型的安装记录中提取其托管的 Skill 或 capability ID。 |
| parseToolInstallationManifest | 函数 | 158–161 | 简单 | parsing、manifest、validation、utility | 0 | 以 schema 1 严格解析安装清单，失败时返回 undefined 而不抛出。 |
| [reconcileAgentToolInstallations](../../../symbols/src/adapters/installations.ts/reconcileAgentToolInstallations.md) | 函数 | 229–318 | 复杂 | reconciliation、cleanup、ownership、safety、diagnostics | 1 | 对账既有与期望安装：删除清单拥有且字节未变的过期文件，保留用户改动、共享全局文件与插件 profile 记录。 |
| renderToolInstallationManifest | 函数 | 187–190 | 简单 | serialization、manifest、rendering、validation | 1 | 补齐 schema_version 后校验并序列化为稳定的缩进 JSON 清单文本。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [project-entry.ts](project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [project-path.ts](../core/contracts/project-path.ts.md) | src/core/contracts/project-path.ts | 路径安全词法规则 SSOT：安全相对路径、安全路径分量、规范绝对路径与禁止进入 researchspec/ 的项目相对路径。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |
| [write-plan.ts](../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [delivery.ts](../literature-adapters/delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [delivery.ts](delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [graph-bootstrap.ts](../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-delivery.ts](../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-security.test.ts](../../tests/graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [graph-workspace-index.ts](../core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [legacy-reconciliation.ts](legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [project-entry.ts](project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [status.ts](../plugins/status.ts.md) | src/plugins/status.ts | 把插件配置与安装清单投影为 status 与 catalog 展示模型：域选择、解析快照、可用与已投影域，以及 Skill 级别的汇总条目。 |
| [workspace-delivery.ts](workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| deduplicateInstallations | 函数 | 196–199 | 按 scope+path 去重安装记录，并按 tool_id 与路径稳定排序以保证清单可复现。 |
| [managedSkillId](../../../symbols/src/adapters/installations.ts/managedSkillId.md) | 函数 | 201–209 | 从不同来源类型的安装记录中提取其托管的 Skill 或 capability ID。 |
| parseToolInstallationManifest | 函数 | 158–161 | 以 schema 1 严格解析安装清单，失败时返回 undefined 而不抛出。 |
| [reconcileAgentToolInstallations](../../../symbols/src/adapters/installations.ts/reconcileAgentToolInstallations.md) | 函数 | 229–318 | 对账既有与期望安装：删除清单拥有且字节未变的过期文件，保留用户改动、共享全局文件与插件 profile 记录。 |
| renderToolInstallationManifest | 函数 | 187–190 | 补齐 schema_version 后校验并序列化为稳定的缩进 JSON 清单文本。 |
