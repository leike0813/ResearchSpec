
# 宿主与投递适配层

把文件契约投影到 24 个 class-A Agent 宿主与 commands/skills/both 三种投递模式，管理安装清单、区域哈希、Companion 包装，以及可选 zotero-library 文献适配器目录。
> 本页由知识图谱分层 `layer:adapters` 生成，共 27 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [src/adapters](../modules/src/adapters.md) | 10 |
| [src/literature-adapters](../modules/src/literature-adapters.md) | 8 |
| [src/adapters/companion](../modules/src/adapters/companion.md) | 5 |
| [src/adapters/companion/workflows](../modules/src/adapters/companion/workflows.md) | 4 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [src/adapters/agent-profiles.ts](../files/src/adapters/agent-profiles.ts.md) | 文件 | — | 为支持项目本地原生自定义 Agent 的宿主渲染 researchspec-executor 与 researchspec-reviewer 两个托管 profile 文件，按 frontmatter 或 TOML 两种宿主格式输出同一份 worker 契约。 |
| [src/adapters/command-renderer.ts](../files/src/adapters/command-renderer.ts.md) | 文件 | — | 把唯一的 Navigate 命令包装内容按各宿主要求的 command 格式渲染为可落地文件，同时给出旧版 CLI 命令 ID 供遗留清理识别。 |
| [src/adapters/companion/index.ts](../files/src/adapters/companion/index.ts.md) | 文件 | — | Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。 |
| [src/adapters/companion/manifest.ts](../files/src/adapters/companion/manifest.ts.md) | 文件 | — | 将 propose、decide、verify、navigate 四个工作流源合并为带 Skill ID 的意图清单，是 Companion Skill 注册的清单层。 |
| [src/adapters/companion/render.ts](../files/src/adapters/companion/render.ts.md) | 文件 | — | 把 Companion 意图渲染成可安装的 Skill 包：生成带 frontmatter 的 SKILL.md、LICENSE，并在 Navigate 情形附加 ARSU 路由与 CLI 手册两份渐进式参考。 |
| [src/adapters/companion/shared-guidance.ts](../files/src/adapters/companion/shared-guidance.ts.md) | 文件 | — | 所有 Companion Skill 共享的 CLI 纪律正文，覆盖文件归属、行动前阅读、人权确认边界、命令行为与失败处理表格。 |
| [src/adapters/companion/types.ts](../files/src/adapters/companion/types.ts.md) | 文件 | — | Companion 适配层的类型定义：四个工作流 ID 联合类型、由工作流 ID 派生的 Skill ID 模板类型，以及工作流源与渲染意图的接口。 |
| [src/adapters/companion/workflows/decide.ts](../files/src/adapters/companion/workflows/decide.ts.md) | 文件 | — | Decide Companion 工作流指令源：引导人工审阅一个明确选择，并通过 `researchspec decide` 把确认结果记录进其唯一归属文件。 |
| [src/adapters/companion/workflows/navigate.ts](../files/src/adapters/companion/workflows/navigate.ts.md) | 文件 | — | 唯一用户可见入口 Navigate 的执行指引：定义何时需要正式图工作流、standalone 与 graph 两种模式的差异，以及文献来源策略的投影方式。 |
| [src/adapters/companion/workflows/propose.ts](../files/src/adapters/companion/workflows/propose.ts.md) | 文件 | — | Propose Companion 工作流指令源：把一次高影响的研究变更转成可评审、可直接编辑的项目 change 包，而不修改稳定 spec 字节。 |
| [src/adapters/companion/workflows/verify.ts](../files/src/adapters/companion/workflows/verify.ts.md) | 文件 | — | Verify Companion 工作流指令源：独立检查当前工作状态并给出建议的 Gate 裁决，但正式裁决仍由人工经 Decide 记录。 |
| [src/adapters/delivery.ts](../files/src/adapters/delivery.ts.md) | 文件 | — | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [src/adapters/installations.ts](../files/src/adapters/installations.ts.md) | 文件 | — | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [src/adapters/legacy-reconciliation.ts](../files/src/adapters/legacy-reconciliation.ts.md) | 文件 | — | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [src/adapters/managed-target.ts](../files/src/adapters/managed-target.ts.md) | 文件 | — | 把安装清单记录解析为可信目标路径与边界根，并按 owner/source/tool 逐类校验，确保清单中的地址永远无法越出其定义的目的地。 |
| [src/adapters/project-entry-matrix.ts](../files/src/adapters/project-entry-matrix.ts.md) | 文件 | — | 从工具目录渲染《Agent 项目入口矩阵》Markdown 表格，逐宿主列出入口机制、路径、官方文档依据与限制。 |
| [src/adapters/project-entry.ts](../files/src/adapters/project-entry.ts.md) | 文件 | — | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [src/adapters/tools.ts](../files/src/adapters/tools.ts.md) | 文件 | — | Agent 宿主工具目录的安装 SSOT：35 个宿主的 Skill 根、命令格式与路径、检测路径、遗留目录、项目入口机制与原生 Agent profile 能力。 |
| [src/adapters/workspace-delivery.ts](../files/src/adapters/workspace-delivery.ts.md) | 文件 | — | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |
| [src/literature-adapters/assets.ts](../files/src/literature-adapters/assets.ts.md) | 文件 | — | 读取文献 Adapter 的安装 profile 模板与单个 Skill 包的全部资源文件，记录相对路径、字节内容与可执行位。 |
| [src/literature-adapters/catalog.ts](../files/src/literature-adapters/catalog.ts.md) | 文件 | — | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [src/literature-adapters/contracts.ts](../files/src/literature-adapters/contracts.ts.md) | 文件 | — | 文献 Adapter 的 Zod 契约层：约束 Skill 角色、可见性、权限边界与已审能力枚举，并校验目录中硬依赖不构成环。 |
| [src/literature-adapters/delivery.ts](../files/src/literature-adapters/delivery.ts.md) | 文件 | — | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [src/literature-adapters/index.ts](../files/src/literature-adapters/index.ts.md) | 文件 | — | 文献适配器子系统的 barrel 入口，re-export catalog、assets、contracts、delivery、platform、provider-contracts 与 provider-policy 七个模块。 |
| [src/literature-adapters/platform.ts](../files/src/literature-adapters/platform.ts.md) | 文件 | — | 把 Node 的 platform/arch 组合归一化为 Adapter 运行时平台标识，并在目录中解析出对应的二进制运行时记录。 |
| [src/literature-adapters/provider-contracts.ts](../files/src/literature-adapters/provider-contracts.ts.md) | 文件 | — | 文献来源提供方的 Zod 契约：定义四种来源策略模式、Provider 就绪检查、检索交接与受管库授权请求/结果的结构。 |
| [src/literature-adapters/provider-policy.ts](../files/src/literature-adapters/provider-policy.ts.md) | 文件 | — | 文献来源策略与受管库授权的判定层：把来源策略、就绪状态与覆盖缺口组合为执行计划，并对私有库访问逐条校验授权范围。 |

## 对其它分层的依赖

| 目标分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [核心契约与工作流运行时](core.md) | 20 | imports×20 |
| [能力与插件目录层](capability-registry.md) | 4 | imports×4 |
| [CLI 命令入口层](cli.md) | 2 | imports×2 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 1 | imports×1 |

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [测试与验收夹具层](tests.md) | 20 | imports×20 |
| [能力与插件目录层](capability-registry.md) | 7 | imports×7 |
| [CLI 命令入口层](cli.md) | 6 | imports×6 |
| [维护工具链与工程基础设施](tooling.md) | 3 | imports×2、depends_on×1 |
| [核心契约与工作流运行时](core.md) | 2 | imports×2 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 1 | imports×1 |
| [厂商 Skill 转换与审计层](vendor-converters.md) | 1 | imports×1 |
