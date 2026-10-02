
# tests/managed-installation-paths.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/managed-installation-paths.test.ts -->

覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。
源码：[tests/managed-installation-paths.test.ts](../../../../tests/managed-installation-paths.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [delivery.ts](../src/adapters/delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [delivery.ts](../src/literature-adapters/delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [extensions.ts](../src/plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [graph-delivery.ts](../src/plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [installations.ts](../src/adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [managed-target.ts](../src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [project-entry.ts](../src/adapters/project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [registry.ts](../src/plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [tools.ts](../src/adapters/tools.ts.md) | src/adapters/tools.ts | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [write-plan.ts](../src/core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |
