
# src/core/validation/types.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/validation](../../../../modules/src/core/validation.md)
<!-- node: file:src/core/validation/types.ts -->

校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。
源码：[src/core/validation/types.ts](../../../../../../src/core/validation/types.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [delivery.ts](../../adapters/delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [delivery.ts](../../literature-adapters/delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [extensions.ts](../../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-check.ts](../../plugins/graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-delivery.ts](../../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph.ts](../../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [installations.ts](../../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [legacy-reconciliation.ts](../../adapters/legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [main.ts](../../cli/main.ts.md) | src/cli/main.ts | CLI 主装配：创建 Commander 程序、按目录注册全部命令、统一异常到 CliError 映射与结果呈现，并返回稳定退出码。 |
| [managed-target.ts](../../adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [parse.ts](parse.ts.md) | src/core/validation/parse.ts | JSON / JSONL / YAML 解析封装：失败时统一转为带文件路径与行号的阻塞诊断，而非抛出异常。 |
| [project-entry.ts](../../adapters/project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [registry.ts](../../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [registry.ts](../../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [types.ts](../../cli/types.ts.md) | src/cli/types.ts | CLI 层共享契约：CommandContext 输入上下文、CommandResult / CliEnvelope 结果形状、CliError 及 success/failure 构造器。 |
| [workspace-delivery.ts](../../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |
