
# src/adapters
> 目录聚合页：10 个文件、34 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [src/adapters/agent-profiles.ts](../../files/src/adapters/agent-profiles.ts.md) | 文件 | 4 | 为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。 |
| [src/adapters/command-renderer.ts](../../files/src/adapters/command-renderer.ts.md) | 文件 | 1 | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [src/adapters/delivery.ts](../../files/src/adapters/delivery.ts.md) | 文件 | 2 | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [src/adapters/installations.ts](../../files/src/adapters/installations.ts.md) | 文件 | 5 | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [src/adapters/legacy-reconciliation.ts](../../files/src/adapters/legacy-reconciliation.ts.md) | 文件 | 2 | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [src/adapters/managed-target.ts](../../files/src/adapters/managed-target.ts.md) | 文件 | 8 | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [src/adapters/project-entry-matrix.ts](../../files/src/adapters/project-entry-matrix.ts.md) | 文件 | 1 | 从工具目录渲染《Agent 项目入口矩阵》Markdown 表格，逐宿主列出入口机制、路径、官方文档依据与限制。 |
| [src/adapters/project-entry.ts](../../files/src/adapters/project-entry.ts.md) | 文件 | 6 | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [src/adapters/tools.ts](../../files/src/adapters/tools.ts.md) | 文件 | 4 | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [src/adapters/workspace-delivery.ts](../../files/src/adapters/workspace-delivery.ts.md) | 文件 | 1 | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 子目录
- [companion/workflows](adapters/companion/workflows.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [src/core/workspace](core/workspace.md) | 8 |
| [src/core/validation](core/validation.md) | 6 |
| [src/plugins](plugins.md) | 3 |
| [src/adapters/companion](adapters/companion.md) | 2 |
| [src/core/contracts](core/contracts.md) | 2 |
| [src/literature-adapters](literature-adapters.md) | 2 |
| [src/adapters/companion/workflows](adapters/companion/workflows.md) | 1 |
| [src/cli](cli.md) | 1 |
| [src/graph-profiles](graph-profiles.md) | 1 |
| [src/utils](utils.md) | 1 |
