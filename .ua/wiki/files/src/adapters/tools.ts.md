
# src/adapters/tools.ts
所属分层：[宿主与投递适配层](../../../layers/adapters.md)  
所属目录：[src/adapters](../../../modules/src/adapters.md)
<!-- node: file:src/adapters/tools.ts -->

Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。
源码：[src/adapters/tools.ts](../../../../../src/adapters/tools.ts)

## 符号（4）
<!-- node: function:src/adapters/tools.ts:detectTools -->
<!-- node: function:src/adapters/tools.ts:orderTools -->
<!-- node: function:src/adapters/tools.ts:parseToolExpression -->
<!-- node: function:src/adapters/tools.ts:toolSkillsRoot -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [detectTools](../../../symbols/src/adapters/tools.ts/detectTools.md) | 函数 | 212–219 | 简单 | detection、host-adapter、filesystem、async | 2 | 按检测路径探测项目中已配置的宿主，返回命中的宿主 ID 列表。 |
| [orderTools](../../../symbols/src/adapters/tools.ts/orderTools.md) | 函数 | 221–226 | 简单 | sorting、host-selection、ui、utility | 2 | 按已配置、已探测、其余三档排序宿主，供交互选择列表稳定展示。 |
| [parseToolExpression](../../../symbols/src/adapters/tools.ts/parseToolExpression.md) | 函数 | 187–196 | 简单 | parsing、host-selection、validation、utility | 2 | 解析逗号分隔的宿主选择表达式，支持 all/none 且不允许与其他 ID 混用，并拒绝未知 ID。 |
| [toolSkillsRoot](../../../symbols/src/adapters/tools.ts/toolSkillsRoot.md) | 函数 | 202–205 | 简单 | path-resolution、host-adapter、utility、skills-root | 2 | 返回宿主项目级 Skill 根的绝对路径与清单用 POSIX 相对根。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs.ts](../utils/fs.ts.md) | src/utils/fs.ts | 三个薄文件系统辅助：存在性判断、目录判断与可选文本读取，只把 ENOENT 视为正常缺失，其余错误照常抛出。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../../tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [agent-profiles.test.ts](../../tests/agent-profiles.test.ts.md) | tests/agent-profiles.test.ts | 校验 24 个 class-A 宿主上的两种受管 profile：50 个渲染文件的精确路径、角色契约、frontmatter/TOML/Vibe prompt 格式，以及不固定厂商模型的中立性。 |
| [agent-profiles.ts](agent-profiles.ts.md) | src/adapters/agent-profiles.ts | 为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。 |
| [command-renderer.ts](command-renderer.ts.md) | src/adapters/command-renderer.ts | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [delivery.ts](../literature-adapters/delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [delivery.ts](delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [dogfooding-playbook.test.ts](../../tests/dogfooding-playbook.test.ts.md) | tests/dogfooding-playbook.test.ts | 维护者 dogfooding playbook 的结构校验测试：断言场景、fixture 变体与 release 映射引用的文件确实存在，并核对工具与路由覆盖。 |
| [graph-bootstrap.ts](../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-context.ts](../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-delivery.ts](../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [legacy-reconciliation.ts](legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [managed-target.ts](managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [project-entry-matrix.ts](project-entry-matrix.ts.md) | src/adapters/project-entry-matrix.ts | 从工具目录渲染《Agent 项目入口矩阵》Markdown 表格，逐宿主列出入口机制、路径、官方文档依据与限制。 |
| [project-entry.ts](project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [workspace-delivery.ts](workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [detectTools](../../../symbols/src/adapters/tools.ts/detectTools.md) | 函数 | 212–219 | 按检测路径探测项目中已配置的宿主，返回命中的宿主 ID 列表。 |
| [orderTools](../../../symbols/src/adapters/tools.ts/orderTools.md) | 函数 | 221–226 | 按已配置、已探测、其余三档排序宿主，供交互选择列表稳定展示。 |
| [parseToolExpression](../../../symbols/src/adapters/tools.ts/parseToolExpression.md) | 函数 | 187–196 | 解析逗号分隔的宿主选择表达式，支持 all/none 且不允许与其他 ID 混用，并拒绝未知 ID。 |
| [toolSkillsRoot](../../../symbols/src/adapters/tools.ts/toolSkillsRoot.md) | 函数 | 202–205 | 返回宿主项目级 Skill 根的绝对路径与清单用 POSIX 相对根。 |
