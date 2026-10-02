
# scripts/verify-package.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/verify-package.mjs -->

发行包端到端验证脚本：核对 tarball 文件面、已安装 ARSU 规约与文档摘要、运行时图表源与渲染产物、平台对应二进制，并跑通 minimal 与 academic-pipeline 两条完整旅程。
源码：[scripts/verify-package.mjs](../../../../scripts/verify-package.mjs)

## 符号（13）
<!-- node: function:scripts/verify-package.mjs:applyExpectedSurface -->
<!-- node: function:scripts/verify-package.mjs:currentRuntimeDiagrams -->
<!-- node: function:scripts/verify-package.mjs:expectedRuntime -->
<!-- node: function:scripts/verify-package.mjs:loadPackagedSurface -->
<!-- node: function:scripts/verify-package.mjs:run -->
<!-- node: function:scripts/verify-package.mjs:runExpectFailure -->
<!-- node: function:scripts/verify-package.mjs:verifyAllProjectToolDelivery -->
<!-- node: function:scripts/verify-package.mjs:verifyCurrentPublishedGuidance -->
<!-- node: function:scripts/verify-package.mjs:verifyInstalledAcademicPipelineJourney -->
<!-- node: function:scripts/verify-package.mjs:verifyInstalledGuidance -->
<!-- node: function:scripts/verify-package.mjs:verifyInstalledMinimalJourney -->
<!-- node: function:scripts/verify-package.mjs:verifyPackagedDocumentation -->
<!-- node: function:scripts/verify-package.mjs:verifyTarballFiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| applyExpectedSurface | 函数 | 493–504 | 简单 | 发行验证、期望值、状态准备 | 0 | 把期望的 ARSU、Companion 与能力技能集合写入验证状态，供后续逐项断言使用。 |
| currentRuntimeDiagrams | 函数 | 536–550 | 简单 | 运行时图表、清单、发行验证 | 0 | 返回当前十一个运行时图表的名称与源扩展名，作为文件面与指引校验的固定清单。 |
| expectedRuntime | 函数 | 523–534 | 简单 | 平台矩阵、工具函数、分发面 | 0 | 按平台与架构返回该目标应包含的 Zotero bridge 二进制文件名。 |
| loadPackagedSurface | 函数 | 464–491 | 中等 | 发行验证、注册表、技能面 | 0 | 从已安装包加载 skills 与 profile 注册表，构造发行验证期望的技能面清单。 |
| run | 函数 | 572–586 | 简单 | 子进程、发行验证、错误处理 | 0 | 在指定工作目录与环境执行命令，继承 stdio 并在非零退出时抛出带命令行的错误。 |
| runExpectFailure | 函数 | 588–600 | 简单 | 负向测试、子进程、发行验证 | 0 | 执行注定失败的命令并断言其确实非零退出，用于验证错误路径不会被吞掉。 |
| verifyAllProjectToolDelivery | 函数 | 405–462 | 中等 | 发行验证、入口投影、多宿主 | 0 | 在一次性项目目录中运行 init --tools all，核对全部宿主目标的项目入口投影与运行时图表产物。 |
| verifyCurrentPublishedGuidance | 函数 | 379–403 | 中等 | 发行验证、漂移检查、文档一致性 | 0 | 比对当前发布的运行时指引与源码渲染器输出，防止已发布文档落后于 CLI 目录。 |
| verifyInstalledAcademicPipelineJourney | 函数 | 662–832 | 复杂 | 端到端、capability-graph、gate、发行验证 | 0 | 在已安装 CLI 上验证 academic-pipeline 端到端路线：八个边界输出角色、四个 formal Gate、修订轮 Decision 与最终完整性节点。 |
| verifyInstalledGuidance | 函数 | 338–356 | 中等 | 发行验证、契约校验、文档一致性 | 0 | 在已安装包中断言 ARSU 契约使用 preflight v11、各技能 profile 一致，且打包的 CLI 手册与源码渲染结果相同。 |
| verifyInstalledMinimalJourney | 函数 | 602–660 | 中等 | 端到端、旅程冒烟、发行验证 | 0 | 在已安装 CLI 上跑通 minimal profile 的完整旅程：instructions 取 route-bound entry、start 建 run、写出边界交付物、advance 收尾。 |
| verifyPackagedDocumentation | 函数 | 358–377 | 中等 | 发行验证、文档检查、链接校验 | 0 | 检查打包文档树中的用户、开发者与维护者文档齐备，并核对仓库内 Markdown 链接指向存在的文件。 |
| verifyTarballFiles | 函数 | 196–329 | 复杂 | 发行验证、打包检查、文件面 | 0 | 对照固定必需文件面校验 tarball 内容，包含文档、许可、各 runtime 图表与 Zotero 平台二进制，并拒绝已退役的 dist 运行时模块。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [academic-paper-reviewer-workflow.puml](../docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml.md) | docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml | PlantUML 时序图，描述只读审阅路线：instructions profile → 人工确认 → start → reviewer 产出审阅报告并更新 handoff → Gate 裁定 → advance。 |
| [academic-paper-workflow.puml](../docs/developer/runtime/diagrams/src/academic-paper-workflow.puml.md) | docs/developer/runtime/diagrams/src/academic-paper-workflow.puml | PlantUML 时序图，描述论文撰写路线在普通输出与 revision_patch 两种分支下把交付物写到 researchspec/ 之外并更新 owning handoff。 |
| [academic-pipeline-mid-entry.puml](../docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml.md) | docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml | PlantUML 活动图，枚举 pipeline 的中段入口：research、write、review、revision/re-review、format、final-integrity 各自要求的前置输入角色。 |
| [academic-pipeline-workflow.puml](../docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml.md) | docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml | PlantUML 活动图，呈现冻结 graph slice 下的研究→撰写→审阅→修订循环→格式化→最终完整性链，每个 Gate 都需人工确认。 |
| [contract-change-lifecycle.puml](../docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml.md) | docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml | PlantUML 活动图，分流稳定研究语义变更（change.md 接受后显式编辑 stable spec）与稿件操作（产出 researchspec/ 之外的 revision_patch）两条路径。 |
| [deep-research-workflow.puml](../docs/developer/runtime/diagrams/src/deep-research-workflow.puml.md) | docs/developer/runtime/diagrams/src/deep-research-workflow.puml | PlantUML 时序图，描述 deep-research 路线的 profile 确认、run.yaml/graph.yaml/handoff.md 落盘、外部研究输出与可选 formal Gate 的裁定。 |
| [frontier-evaluation.dot](../docs/developer/runtime/diagrams/src/frontier-evaluation.dot.md) | docs/developer/runtime/diagrams/src/frontier-evaluation.dot | Graphviz 有向图，说明 profile、frozen run 控件、handoff 与 stable spec 汇入 workspace evaluator 推导出 current frontier，再供 status/instructions/history 视图读取。 |
| [handbook.ts](../src/cli/handbook.ts.md) | src/cli/handbook.ts | 从 CLI 命令目录与控制选择器家族派生出 CLI 手册的 Markdown、MDX 命令页与侧边栏，是 CLI 参考文档的 canonical renderer。 |
| [revision-round.puml](../docs/developer/runtime/diagrams/src/revision-round.puml.md) | docs/developer/runtime/diagrams/src/revision-round.puml | PlantUML 时序图，描述动态修订轮：启动 revision child 产出修订稿与回应、再启 re-review child 复核，由人工选择轮次结果并写入 Decision。 |
| [runtime-control-loop.puml](../docs/developer/runtime/diagrams/src/runtime-control-loop.puml.md) | docs/developer/runtime/diagrams/src/runtime-control-loop.puml | PlantUML 时序图，完整呈现 Procedure 发现（list/show/instructions）与受治理 graph 工作两条分支的 status→confirm→start→Gate→advance 控制环。 |
| [system-architecture.puml](../docs/developer/runtime/diagrams/src/system-architecture.puml.md) | docs/developer/runtime/diagrams/src/system-architecture.puml | PlantUML 组件图，把语义面（4 ARSU、4 Companion、7 Zotero Adapter、可选领域技能）、确定性控制面（16 命令 CLI 与 workspace scanner）、文件层与构建期转换器分层。 |
| [two-level-openspec-model.puml](../docs/developer/runtime/diagrams/src/two-level-openspec-model.puml.md) | docs/developer/runtime/diagrams/src/two-level-openspec-model.puml | PlantUML 组件图，区分仓库开发层的 openspec specs/changes 与研究工作区的 researchspec specs/changes + 运行时，强调两层共享 current/proposed 分离但不共享生命周期权限。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [generate-docs.mjs](generate-docs.mjs.md) | scripts/generate-docs.mjs | 文档生成入口：先断言 CLI 恰好暴露 16 个顶层命令，再从类型化目录渲染 CLI 手册、Agent 入口矩阵、website 命令页与侧边栏，支持 --check 只校验。 |
