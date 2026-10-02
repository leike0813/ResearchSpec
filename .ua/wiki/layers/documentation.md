
# 文档与文档站层

面向用户与维护者的规范文档（docs/user、developer、maintainer）、仓库根部说明与变更记录，以及 Docusaurus 3.7 文档站和 zh-Hans 国际化副本。
> 本页由知识图谱分层 `layer:documentation` 生成，共 96 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [website/docs/cli](../modules/website/docs/cli.md) | 22 |
| [docs/developer/runtime/diagrams/src](../modules/docs/developer/runtime/diagrams/src.md) | 11 |
| [docs/developer/runtime](../modules/docs/developer/runtime.md) | 7 |
| [docs/maintainer/vendors](../modules/docs/maintainer/vendors.md) | 7 |
| [docs/user](../modules/docs/user.md) | 7 |
| [docs/developer](../modules/docs/developer.md) | 6 |
| [.](../modules/index.md) | 5 |
| [docs/maintainer](../modules/docs/maintainer.md) | 5 |
| [website](../modules/website.md) | 5 |
| [website/docs/guides](../modules/website/docs/guides.md) | 5 |
| [website/docs](../modules/website/docs.md) | 4 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current](../modules/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current.md) | 4 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides](../modules/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides.md) | 3 |
| [website/docs/reference](../modules/website/docs/reference.md) | 2 |
| [docs](../modules/docs.md) | 1 |
| [website/src/css](../modules/website/src/css.md) | 1 |
| [website/static](../modules/website/static.md) | 1 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [AGENTS.md](../files/AGENTS.md.md) | 文档 | — | 维护者与 Agent 的顶层契约文档：定义项目使命、产品方向、canonical 用户使用模型、ARSU 关系、contract 架构方向与设计原则，以及每个 vendor 转换器的 pin、审计锚点与禁止事项。被截断前已覆盖 ARS/ARSU、ToolUniverse、Scientific Agent Skills、Materials、FinRobot、HistAgent、Education Agent Skills 等全部域资产。 |
| [CHANGELOG.md](../files/CHANGELOG.md.md) | 文档 | — | 简短的版本记录：Unreleased 段说明使用规格改为围绕自然研究任务与可用交付物，0.1.0 记录 schema 0.2 workspace、15 命令 CLI、控制面能力与发布矩阵，并标注发布尚未授权。 |
| [docs/developer/architecture.md](../files/docs/developer/architecture.md.md) | 文档 | — | 开发者架构总纲：用系统边界图界定 ResearchSpec 不碰模型 API 与数据库，用 owner 表保证每个概念只有一个事实源，并说明 graph 自由组合、合同层次、模块方向、Agent 与扩展边界以及 schema "2" fail-closed 演进策略。 |
| [docs/developer/cli-interface.md](../files/docs/developer/cli-interface.md.md) | 文档 | — | CLI 控制面契约：给出 status→instructions→start/decide/advance 的调用协议、十六个顶层命令的职责表、start 的根 run 与 child subgraph 两种形态、安全项目相对路径合同，以及 Gate/Decision/Plugin 的独立确认边界。 |
| [docs/developer/domain-plugins.md](../files/docs/developer/domain-plugins.md.md) | 文档 | — | Domain Skill Plugin 的开发者规范：说明 vendor 与 domain 两层多对多结构、Registry Schema 1 与包布局、213+5 内部目录的公开可见性规则、六个 vendor converter 的准入结论、工作区选择与依赖闭包、plugin 命令生命周期事务语义，以及 Navigate 侧的辅助边界。 |
| [docs/developer/domain-taxonomy.md](../files/docs/developer/domain-taxonomy.md.md) | 文档 | — | 领域分类的唯一规范性说明：以 ANZSRC 2020 Fields of Research Group 作为学科型 domain 唯一标准，列出五个粗粒度工具域、源工作簿 SHA-256 与 23 Division / 213 Group / 1,967 Field 仓库快照，并给出全部 Group code 与 kebab-case domain ID 的完整名录。 |
| [docs/developer/manuscript-annotations.md](../files/docs/developer/manuscript-annotations.md.md) | 文档 | — | 稿件批注 intake 的开发者规范：定义 work/annotation-intake/ 下的 raw/review copy/mechanical delta/normalized interpretation/patch mapping 五层数据分离、headless API 与 revision helper 契约，以及两套互不混用的交互式审阅投影与显示坐标、源码坐标的区分。 |
| [docs/developer/README.md](../files/docs/developer/README.md.md) | 文档 | — | 开发者文档索引，按主题列出架构、CLI 接口、运行时、领域 Plugin、领域分类与稿件批注六篇入口，并声明产品行为以用户使用模型为准、实现变更走 OpenSpec。 |
| [docs/developer/runtime/academic_paper_reviewer_workflow.md](../files/docs/developer/runtime/academic_paper_reviewer_workflow.md.md) | 文档 | — | academic-paper-reviewer 路由说明：只读评审 handoff 引用的稿件，可产出 review report、editorial decision 与 revision roadmap，但内部 PASS 不等于 formal Gate pass，改稿必须另启 revision。 |
| [docs/developer/runtime/academic_paper_workflow.md](../files/docs/developer/runtime/academic_paper_workflow.md.md) | 文档 | — | academic-paper 路由说明：定义 writer/evaluator 分离只是语义纪律、Markdown 与 QMD 双源稿的 revision 保真要求、format-convert 的 no-execute Quarto 渲染链，以及 annotation intake 的分层存放。 |
| [docs/developer/runtime/academic_pipeline_workflow.md](../files/docs/developer/runtime/academic_pipeline_workflow.md.md) | 文档 | — | academic-pipeline 组合图的运行时说明：给出 research→write→review→revision/re-review 轮次→format→final-integrity 的图主干、subgraph 节点的 role binding、七种 mid-entry 入口、动态 revision round 实例化规则，以及 Quarto 只阻塞 format 节点的收尾语义。 |
| [docs/developer/runtime/core_runtime_model.md](../files/docs/developer/runtime/core_runtime_model.md.md) | 文档 | — | 核心运行模型：逐层说明文件 owner（stable specs、profiles、frozen runs、node instances、handoff、project change）、由扫描派生的只读视图、Agent 与 CLI 的能力分工，以及仓库 openspec 与用户 researchspec/changes 两层治理。 |
| [docs/developer/runtime/deep_research_workflow.md](../files/docs/developer/runtime/deep_research_workflow.md.md) | 文档 | — | deep-research 路由说明：13 个 agent 与六个 phase 属语义方法而非 CLI 状态机，route instructions 从 specs 与 handoff roles 解析前置，用户确认后创建 standalone run，改稿需经 project change。 |
| [docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml](../files/docs/developer/runtime/diagrams/src/academic-paper-reviewer-workflow.puml.md) | 文件 | — | PlantUML 时序图，描述只读审阅路线：instructions profile → 人工确认 → start → reviewer 产出审阅报告并更新 handoff → Gate 裁定 → advance。 |
| [docs/developer/runtime/diagrams/src/academic-paper-workflow.puml](../files/docs/developer/runtime/diagrams/src/academic-paper-workflow.puml.md) | 文件 | — | PlantUML 时序图，描述论文撰写路线在普通输出与 revision_patch 两种分支下把交付物写到 researchspec/ 之外并更新 owning handoff。 |
| [docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml](../files/docs/developer/runtime/diagrams/src/academic-pipeline-mid-entry.puml.md) | 文件 | — | PlantUML 活动图，枚举 pipeline 的中段入口：research、write、review、revision/re-review、format、final-integrity 各自要求的前置输入角色。 |
| [docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml](../files/docs/developer/runtime/diagrams/src/academic-pipeline-workflow.puml.md) | 文件 | — | PlantUML 活动图，呈现冻结 graph slice 下的研究→撰写→审阅→修订循环→格式化→最终完整性链，每个 Gate 都需人工确认。 |
| [docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml](../files/docs/developer/runtime/diagrams/src/contract-change-lifecycle.puml.md) | 文件 | — | PlantUML 活动图，分流稳定研究语义变更（change.md 接受后显式编辑 stable spec）与稿件操作（产出 researchspec/ 之外的 revision_patch）两条路径。 |
| [docs/developer/runtime/diagrams/src/deep-research-workflow.puml](../files/docs/developer/runtime/diagrams/src/deep-research-workflow.puml.md) | 文件 | — | PlantUML 时序图，描述 deep-research 路线的 profile 确认、run.yaml/graph.yaml/handoff.md 落盘、外部研究输出与可选 formal Gate 的裁定。 |
| [docs/developer/runtime/diagrams/src/frontier-evaluation.dot](../files/docs/developer/runtime/diagrams/src/frontier-evaluation.dot.md) | 文件 | — | Graphviz 有向图，说明 profile、frozen run 控件、handoff 与 stable spec 汇入 workspace evaluator 推导出 current frontier，再供 status/instructions/history 视图读取。 |
| [docs/developer/runtime/diagrams/src/revision-round.puml](../files/docs/developer/runtime/diagrams/src/revision-round.puml.md) | 文件 | — | PlantUML 时序图，描述动态修订轮：启动 revision child 产出修订稿与回应、再启 re-review child 复核，由人工选择轮次结果并写入 Decision。 |
| [docs/developer/runtime/diagrams/src/runtime-control-loop.puml](../files/docs/developer/runtime/diagrams/src/runtime-control-loop.puml.md) | 文件 | — | PlantUML 时序图，完整呈现 Procedure 发现（list/show/instructions）与受治理 graph 工作两条分支的 status→confirm→start→Gate→advance 控制环。 |
| [docs/developer/runtime/diagrams/src/system-architecture.puml](../files/docs/developer/runtime/diagrams/src/system-architecture.puml.md) | 文件 | — | PlantUML 组件图，把语义面（4 ARSU、4 Companion、7 Zotero Adapter、可选领域技能）、确定性控制面（16 命令 CLI 与 workspace scanner）、文件层与构建期转换器分层。 |
| [docs/developer/runtime/diagrams/src/two-level-openspec-model.puml](../files/docs/developer/runtime/diagrams/src/two-level-openspec-model.puml.md) | 文件 | — | PlantUML 组件图，区分仓库开发层的 openspec specs/changes 与研究工作区的 researchspec specs/changes + 运行时，强调两层共享 current/proposed 分离但不共享生命周期权限。 |
| [docs/developer/runtime/README.md](../files/docs/developer/runtime/README.md.md) | 文档 | — | ResearchSpec 与 ARSU 核心运行模型文档组的入口，给出六篇必读顺序与一句话模型：CLI 是确定性 control writer、宿主只常驻 Navigate、文件 owner 决定持久事实。 |
| [docs/developer/runtime/runtime_protocols.md](../files/docs/developer/runtime/runtime_protocols.md.md) | 文档 | — | CLI 与运行时协议：展开 list→show→instructions 的只读发现链、standalone 与 graph 两种 packet 语义、Quarto 探测时机、boundary file 的 role/type/path 记录方式、Gate 与 change 生命周期，以及恢复与失败时的只读 doctor 边界。 |
| [docs/maintainer/arsu-capability-taxonomy.md](../files/docs/maintainer/arsu-capability-taxonomy.md.md) | 文档 | — | ARS 能力分类学盘点草案：把上游 39 个 agent 按工作性质、执行类型与建议节点类型三个正交轴去重为 34 项能力，逐项记录定义、来源 agent、输入输出 role、知识包与脚本化机会，作为未来图引擎的节点词汇。 |
| [docs/maintainer/arsu-contract-anchor.md](../files/docs/maintainer/arsu-contract-anchor.md.md) | 文档 | — | ARSU 合同锚点审计说明：anchor manifest 区分 upstream observation 与 replacement policy，56 个 anchor 的替换目标覆盖四份 stable specs、academic-pipeline profile、node instance、change、annotation 工作材料与 revision_patch，并列出四条 pnpm 校验命令。 |
| [docs/maintainer/non-native-vendor-skill-standard.md](../files/docs/maintainer/non-native-vendor-skill-standard.md.md) | 文档 | — | 非原生 vendor Skill 标准：规定从没有现成 Open Agent Skill 的上游派生 Skill 时，先定架构厚度（baseline/script-assisted/stateful/resource-backed），再按 12 条 SKILL.md 合同、渐进披露规则与能力实现映射表撰写，并要求哈希绑定的人工评审才能准入。 |
| [docs/maintainer/README.md](../files/docs/maintainer/README.md.md) | 文档 | — | 维护者文档索引，指向 ARSU 合同锚点、ARS 能力分类、非原生 vendor Skill 标准、发布流程与六个 vendor 适配页，并交代 authoring/、audits/、artifacts/ 三个材料目录的分工。 |
| [docs/maintainer/release-process.md](../files/docs/maintainer/release-process.md.md) | 文档 | — | MVP 发布流程：列出从干净 checkout 依次执行的二十余条技术门禁命令，说明 release:verify 的真实 tarball 安装验证、Ubuntu/macOS/Windows × Node 22/24 托管矩阵、手工 dogfooding 证据要求、发布前行政门禁，以及 commit/tag/publish 需单独授权的边界。 |
| [docs/maintainer/vendors/education-agent-skills.md](../files/docs/maintainer/vendors/education-agent-skills.md.md) | 文档 | — | Education Agent Skills 适配器规范：覆盖 snapshot-6bbbce4 的 165 项审计、136 准入 / 29 排除、CC BY-SA 4.0 授权、⟦UNRESOLVED⟧ 证据标记与学习者安全边界，并说明三个教育 domain 的分布、发布包边界与 136 个 llm 扩展包的增量再生成。 |
| [docs/maintainer/vendors/finrobot.md](../files/docs/maintainer/vendors/finrobot.md.md) | 文档 | — | FinRobot 适配器规范：针对无第一方 SKILL.md 的上游，说明 1,049 项审计与 39 个准入 surface 到六个 financial-research-* Skill 的一次映射、四个 Tier 3 script-assisted 与两个 Tier 1 Agent procedure 的分层、Apache-2.0 归属及 preview 候选流程。 |
| [docs/maintainer/vendors/histagent.md](../files/docs/maintainer/vendors/histagent.md.md) | 文档 | — | HistAgent 适配器规范：说明应用型上游而非 Skill 包，只发布三棵独立授权的八文件树，21 个准入 surface 映射到具体命令并保留 raw/OCR/transcription/emendation/translation/interpretation 五层区分，以及三个 mixed 扩展包的投影。 |
| [docs/maintainer/vendors/materials-science-skills.md](../files/docs/maintainer/vendors/materials-science-skills.md.md) | 文档 | — | Materials-Science-Skills-For-LLM 适配器规范：12 项上游 Skill 中准入 7 项并按 Tier 1/Tier 2 划分完整授权树，说明 24 项源文件决定、聚合树哈希授权、无脚本无状态的发布形态与七个 llm 扩展包的投影。 |
| [docs/maintainer/vendors/README.md](../files/docs/maintainer/vendors/README.md.md) | 文档 | — | 六个 vendor 适配页的索引，并声明文档不能替代机器事实源：任何更新必须走对应 maintenance Skill 与审计 catalog。 |
| [docs/maintainer/vendors/scientific-agent-skills.md](../files/docs/maintainer/vendors/scientific-agent-skills.md.md) | 文档 | — | Scientific Agent Skills v2.70.0 适配器规范：167 项审计记录、56 准入 / 111 排除、42 项人工安全评审 SSOT 与 upstream security-report 仅作观察的规则，说明 frontmatter 改造、19 项资源例外、MIT 授权与 632 个资源向 extension registry 的投影。 |
| [docs/maintainer/vendors/tooluniverse.md](../files/docs/maintainer/vendors/tooluniverse.md.md) | 文档 | — | ToolUniverse 适配器规范：说明 185 项审计中 130 准入 / 55 排除、各输入 SSOT 的归属、转换器生成的四类产物与中央 assembler 所有权，130 个 Skill 一对一投影为 plugin-tooluniverse-* 扩展包及 maintenance suite 四条命令。 |
| [docs/README.md](../files/docs/README.md.md) | 文档 | — | 文档目录导览，按用户、开发者、维护者三类读者划分文档树，并规定冲突时以用户使用模型、OpenSpec specs 与代码契约的优先顺序。 |
| [docs/user/agent-entry-matrix.md](../files/docs/user/agent-entry-matrix.md.md) | 文档 | — | Agent 项目入口矩阵：逐个列出已注册宿主的入口机制、项目规则文件路径、官方文档依据、已知限制与运行时验证状态，绝大多数未核实原生规则的宿主退化为显式发现回退。 |
| [docs/user/cli-handbook.md](../files/docs/user/cli-handbook.md.md) | 文档 | — | 由 typed 公共 CLI catalog 生成的完整静态命令手册：覆盖发现边界、七个全局选项、九类 selector 形态，以及 init/update/status/instructions/start/advance/check/list/show/doctor/handoff/pack/propose/decide/archive 与 plugin 子命令的输入形状。 |
| [docs/user/deterministic-checkers.md](../files/docs/user/deterministic-checkers.md.md) | 文档 | — | 确定性检查报告说明：介绍七个包内 Python 检查器的能力、请求 JSON 形状与调用方式，说明 CLI 会在 advance 时用冻结图输入重算比对报告，并强调报告一致不等于 Gate 通过、不可用状态不得伪装成查证成功。 |
| [docs/user/literature-adapters.md](../files/docs/user/literature-adapters.md.md) | 文档 | — | 可选 Zotero 文献 Adapter 规范：说明交付模型与七 Skill 投影、release-set 与组件版本不互相比较的接纳规则、status/check 的只读有界状态、四类 source policy 与 ManagedLibraryAuthorization 边界，以及 AGPL-3.0-only 分发来源。 |
| [docs/user/README.md](../files/docs/user/README.md.md) | 文档 | — | 用户文档入口：建议先读用户使用模型建立心智模型，再按需查 CLI handbook、宿主入口矩阵、审阅工作台与 Zotero Adapter，并强调具体 workspace 行为以 status/instructions 返回的动作合同为准。 |
| [docs/user/review-workspace.md](../files/docs/user/review-workspace.md.md) | 文档 | — | 交互式论文审阅工作台说明：区分通用 review-workspace.v2 三栏批注页面与 review-response 的 revision-master-review-workspace.v1 业务工作台，详述冻结快照、导入前渲染与 Quarto 单独同意、浏览器本地草稿与导出结果契约、按 scope 接收的交回流程，以及 v1 恢复与维护者本地预览。 |
| [docs/user/usage-model.md](../files/docs/user/usage-model.md.md) | 文档 | — | 用户使用模型的产品级权威：完整规定从 init 只准备工作区、一个入口按需选择 Procedure、一次确认授权一张冻结图、frontier 决定可执行动作、handoff 连接真实文件、Gate/Decision 与重复轮次、Markdown/QMD/Quarto、revision patch、异模型复核与 Plugin/Zotero、恢复检查与结束，以及十六命令的验收边界。 |
| [NOTICE](../files/NOTICE.md) | 文档 | — | 归属与许可声明文件，逐项列出 ARS（CC BY-NC 4.0）、Zotero Adapter（AGPL-3.0）、ANZSRC 分类名称与各 vendor Skill 的来源、release-set、revision 和许可。 |
| [README.md](../files/README.md.md) | 文档 | — | 项目对外说明：解释要解决的平台锁定、状态碎片化与人工决策不可追溯三个问题，介绍 OpenSpec 灵感、Zotero Adapter、已吸纳的各上游 Skills 数量、环境与安装方式、16 个顶层命令的运行时协议、隐私安全边界以及混合许可模型。 |
| [SECURITY.md](../files/SECURITY.md.md) | 文档 | — | 安全策略：只支持最新 0.1.x 与 Node 22/24，说明漏洞报告渠道尚未建立这一未签署的管理项，并列出本地文件控制面、外部模型提供方、Skills 安装范围与 context pack 内容四类信任边界。 |
| [website/docs/cli/advance.mdx](../files/website/docs/cli/advance.mdx.md) | 文档 | — | `researchspec advance <node-selector>` 的命令参考页（控制面组，需要工作区，写）：校验并完成一个符合条件的图节点：按 --input 提交输出角色，独立于 Gate 确认推进进度，并联动写入祖先完成状态。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/archive.mdx](../files/website/docs/cli/archive.mdx.md) | 文档 | — | `researchspec archive <change-id>` 的命令参考页（治理组，需要工作区，写）：归档一个已 apply、rejected、deferred 或 superseded 的项目变更。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/check.mdx](../files/website/docs/cli/check.mdx.md) | 文档 | — | `researchspec check [target]` 的命令参考页（检查组，需要工作区，只读）：检查 schema 2 工作区契约：可选校验范围（specs/profiles/runs/changes/handoffs/tools/plugins/literature-adapters），--strict 把警告升级为失败。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/decide.mdx](../files/website/docs/cli/decide.mdx.md) | 文档 | — | `researchspec decide <selector>` 的命令参考页（治理组，需要工作区，写）：记录一次人工决定：项目变更结论（accept/reject/defer/supersede）、Gate 裁决（pass/pass_with_conditions/fail）、失败 Gate 的 --override，或本地 Decision 分支选择；选项组不可混用。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/doctor.mdx](../files/website/docs/cli/doctor.mdx.md) | 文档 | — | `researchspec doctor` 的命令参考页（恢复组，需要工作区，只读）：对当前工作区做完整只读诊断，报告归属损坏、不安全路径与生成漂移，不做任何修复。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/handoff.mdx](../files/website/docs/cli/handoff.mdx.md) | 文档 | — | `researchspec handoff <run-selector>` 的命令参考页（上下文组，需要工作区，条件写入）：渲染或替换一个可直接编辑的 run handoff：inputs/outputs 角色描述符加可选 Markdown 正文，满足路径与角色唯一性约束。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/index.mdx](../files/website/docs/cli/index.mdx.md) | 文档 | — | CLI 命令参考的目录首页，由类型化的公开 CLI catalog 自动生成（页面内注明禁止手改）。说明每页包含语法、选项、payload 形状、工作区要求、静态影响与相关命令，并指引运行时动态指令用 `researchspec instructions <selector> --json` 获取。 |
| [website/docs/cli/init.mdx](../files/website/docs/cli/init.mdx.md) | 文档 | — | `researchspec init [path]` 的命令参考页（引导组，无需工作区，写）：初始化或重新配置 ResearchSpec 工作区：写入 `researchspec/` 目录、安装唯一基础入口 researchspec-navigate，并按 --tools/--delivery/--literature-adapters 投影 Agent 表面。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/instructions.mdx](../files/website/docs/cli/instructions.mdx.md) | 文档 | — | `researchspec instructions <selector>` 的命令参考页（控制面组，需要工作区，只读）：按精确选择器返回操作契约：合法选择器、所需语义输入、执行策略与门禁条件，是 status → instructions → start/decide/advance 协议的第二步。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/list.mdx](../files/website/docs/cli/list.mdx.md) | 文档 | — | `researchspec list [type]` 的命令参考页（检查组，工作区可选，只读）：按集合类型列出 procedures、tools、profiles、runs、nodes、changes 或 diagnostics，支持 --limit/--cursor 游标分页与仅用于 procedures 的 --query 词法检索。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/pack.mdx](../files/website/docs/cli/pack.mdx.md) | 文档 | — | `researchspec pack` 的命令参考页（上下文组，需要工作区，写）：生成确定性的有界 schema 2 上下文包，--output 必填 ZIP 路径，--scope 可限定为 specs/profiles/runs/changes/run:<id>/change:<id>。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-install.mdx](../files/website/docs/cli/plugin-install.mdx.md) | 文档 | — | `researchspec plugin install <plugin-ids...>` 的命令参考页（领域 Skill组，需要工作区，写）：把指定领域 ID 选择并投影进当前工作区，--summary 输出写计划影响；非交互执行还须全局 --yes。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-list.mdx](../files/website/docs/cli/plugin-list.mdx.md) | 文档 | — | `researchspec plugin list` 的命令参考页（领域 Skill组，工作区可选，只读）：列出捆绑的领域 Skill 插件，--installed 只显示工作区已选域，--summary 输出紧凑发现元数据。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-show.mdx](../files/website/docs/cli/plugin-show.mdx.md) | 文档 | — | `researchspec plugin show <plugin-id>` 的命令参考页（领域 Skill组，工作区可选，只读）：显示单个领域插件的元数据与来源信息，--summary 省略完整 provenance。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-uninstall.mdx](../files/website/docs/cli/plugin-uninstall.mdx.md) | 文档 | — | `researchspec plugin uninstall <plugin-ids...>` 的命令参考页（领域 Skill组，需要工作区，写）：从当前工作区移除一个或多个已安装领域 ID。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin-update.mdx](../files/website/docs/cli/plugin-update.mdx.md) | 文档 | — | `researchspec plugin update [plugin-ids...]` 的命令参考页（领域 Skill组，需要工作区，写）：刷新指定领域插件，省略 ID 时刷新全部已选域。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/plugin.mdx](../files/website/docs/cli/plugin.mdx.md) | 文档 | — | `researchspec plugin` 的命令参考页（领域 Skill组，工作区可选，条件写入）：领域 Skill 插件的父命令，本身不接收 payload，需选择一个 plugin 子命令。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/propose.mdx](../files/website/docs/cli/propose.mdx.md) | 文档 | — | `researchspec propose <change-id>` 的命令参考页（治理组，需要工作区，写）：创建一个可演化的项目变更文档包，--targets 指定可能变更含义的稳定 spec（project.md/sources.yaml/claims.yaml/manuscript.yaml），--with 可选 design、tasks、delta 文档。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/show.mdx](../files/website/docs/cli/show.mdx.md) | 文档 | — | `researchspec show <selector>` 的命令参考页（检查组，工作区可选，只读）：显示一个精确的 procedure、profile、run、node、Gate、Decision、change、handoff 或 tool 条目详情。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/start.mdx](../files/website/docs/cli/start.mdx.md) | 文档 | — | `researchspec start <profile-id\|node-selector>` 的命令参考页（控制面组，需要工作区，写）：启动一个已确认的 root run 或一个经图授权的子运行：root profile 选择器需 --input 与 --confirmed-by，节点选择器继承父运行授权且拒绝 --confirmed-by。 页面给出选项表、输入字段形状与相关命令链接。 |
| [website/docs/cli/status.mdx](../files/website/docs/cli/status.mdx.md) | 文档 | — | researchspec status 的站点文档：说明它读取最近的当前工作区并返回有界快照，属于控制面只读命令。 |
| [website/docs/cli/update.mdx](../files/website/docs/cli/update.mdx.md) | 文档 | — | researchspec update 的站点文档：列出 --tools、--delivery 与 --literature-adapters 三个可选项及其取值含义，属于引导类的写操作。 |
| [website/docs/faq.md](../files/website/docs/faq.md.md) | 文档 | — | 常见问题：七条问答澄清 `init` 不启动研究、论文与报告存放于 `researchspec/` 之外的项目路径、可直接编辑的稳定 spec/变更/handoff 与必须走 CLI 的 run/node 变更、Gate 确认不等于推进（需 `advance`）、用 `status --json` 恢复、旧工作区只报告不修改、doctor 只读不自愈。 |
| [website/docs/guides/literature.md](../files/website/docs/guides/literature.md.md) | 文档 | — | 说明可选的 Zotero 文献 Adapter：七个 Skill 的职责分工、init/update 选择与替换命令、静态不执行原则，以及组件本地版本身份与准入依据。 |
| [website/docs/guides/plugins.md](../files/website/docs/guides/plugins.md.md) | 文档 | — | 领域插件指南，覆盖 plugin list/show/install/update/uninstall 命令族、按需加载 procedure 的条件，以及基于 ANZSRC 2020 的 213 个学科域加 5 个工具域分类标准。 |
| [website/docs/guides/selector-protocol.md](../files/website/docs/guides/selector-protocol.md.md) | 文档 | — | 以表格列出 profile/run/node/gate/decision/change 六类稳定 selector 的用途，并强调先经 status --json 取机器 ID、禁止按目录名或时间戳推断 selector。 |
| [website/docs/guides/skills.md](../files/website/docs/guides/skills.md.md) | 文档 | — | 介绍四个 ARSU 核心技能、五个 Companion 工作流与可选 Zotero Adapter 技能的能力边界，并说明通过 status --json 与 instructions 发现技能的入口。 |
| [website/docs/guides/workflow.md](../files/website/docs/guides/workflow.md.md) | 文档 | — | 描述 status → instructions → start/decide/advance 的统一运行协议，明确交付物位于 researchspec/ 之外、Gate 确认不等于节点完成，以及旧或未知 workspace 不被改写。 |
| [website/docs/index.md](../files/website/docs/index.md.md) | 文档 | — | 文档站首页：说明 ResearchSpec 是面向学术论文写作的 Agent 中立、基于文件的研究契约框架，概述其四项能力（初始化工作区、以结构化契约引导 Agent、通过 Gate 与 Decision 保持人工控制、维护可复现运行时状态），并以表格定义 Contract、Boundary deliverable、Gate、Decision、Selector 五个核心概念，末尾给出快速开始、CLI 参考与工作流指南三个入口。 |
| [website/docs/installation.md](../files/website/docs/installation.md.md) | 文档 | — | 安装指南：要求 Node.js >= 22，给出 pnpm/npm 全局安装与版本校验，解释以 `researchspec/` 为根的工作区约定与 `init` 的行为（拒绝非空目标）、工具选择矩阵（`--tools all/none/具体 ID`、`--delivery`、`--literature-adapters`）、Zotero Adapter 的 Zotero-Agents 前置条件、更新与卸载流程，并指向 doctor/check 排障。 |
| [website/docs/quick-start.md](../files/website/docs/quick-start.md.md) | 文档 | — | 快速上手：给出 `init --tools codex` + `check all --strict` 的四步起步脚本，说明初始化只创建 schema 2 工作区、四个稳定 spec、预置 graph profile 与 Agent 投影而不启动学术工作；随后演示可选 Zotero Adapter、root entry 确认后的 `start profile:<id>` 调用、产出落在 `researchspec/` 之外、正式评审经 Verify 建议加人工 `decide`、进度需独立 `advance`，以及用 `status --json` 恢复、用 `pack` 导出有界上下文。 |
| [website/docs/reference/glossary.md](../files/website/docs/reference/glossary.md.md) | 文档 | — | 站点术语表：定义边界交付物、冻结图、Decision、正式 Gate、Handoff、项目变更、图 profile、稳定 specs 与 run 等核心概念。 |
| [website/docs/reference/user-model.md](../files/website/docs/reference/user-model.md.md) | 文档 | — | 站点版用户使用模型摘要，覆盖入口、授权边界、工作与状态归属、Agent 可见界面四部分，并指明 docs/user/usage-model.md 为权威来源。 |
| [website/docusaurus.config.ts](../files/website/docusaurus.config.ts.md) | 文件 | — | Docusaurus 3 站点主配置：定义站点标题、GitHub Pages 地址、en/zh-Hans 双语 i18n、classic preset 与侧边栏路径，并把 CLI 侧边栏导入进来。链接策略上对断链直接抛错，站点禁用博客、只保留文档路由。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/faq.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/faq.md.md) | 文档 | — | 简体中文常见问题页，分基础、设置、技能、工作流四组回答 12 个问题，其中 adaptive 与 strict 运行时对比仍带旧运行时表述。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides/selector-protocol.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides/selector-protocol.md.md) | 文档 | — | Selector 协议的中文译页，以表格对照六类稳定 selector 的用途，并重申多候选时不得按目录名、相似文件名或最近时间推断 selector。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides/skills.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides/skills.md.md) | 文档 | — | 技能指南的中文译页，简要列出四个 ARSU 技能、四个 Companion 配套技能和七个 Zotero 文献适配器技能的用途，正文比英文源更精简。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides/workflow.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/guides/workflow.md.md) | 文档 | — | 工作流指南的中文译页，说明统一 status → instructions → start/decide/advance 协议、CLI 独占生命周期写入，以及确认 Gate 不等于完成执行节点。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/index.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/index.md.md) | 文档 | — | 简体中文项目首页，说明 ResearchSpec 的定位、五个核心概念（规约、制品、门控、决策、选择器）、四个 ARSU 技能，并给出快速入门与 CLI 参考入口。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/installation.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/installation.md.md) | 文档 | — | 简体中文安装指南，用 Tabs 组件并列 pnpm 与 npm 全局安装路径，涵盖 Node.js 22 要求、版本验证、init/update/卸载与 doctor/check 故障排查。 |
| [website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/quick-start.md](../files/website/i18n/zh-Hans/docusaurus-plugin-content-docs/current/quick-start.md.md) | 文档 | — | 简体中文快速入门：init 只创建 schema "2" workspace 而不启动学术工作，确认根 profile entry 后再 start，并用 status --json 恢复会话。 |
| [website/package.json](../files/website/package.json.md) | 配置 | — | Docusaurus 3.7 文档站的包定义：固定 start/build/deploy/serve/typecheck 脚本、React 18 与 preset-classic 依赖，以及生产与开发两套 browserslist。 |
| [website/sidebars.cli.ts](../files/website/sidebars.cli.ts.md) | 文件 | — | 由 typed CLI catalog 生成的 CLI 参考侧边栏数据，按 Bootstrap、Control plane、Inspection、Recovery、Context、Governance、Domain Skills 七组列出全部子页面 id。文件头明确标注为生成产物，禁止手工编辑。 |
| [website/sidebars.ts](../files/website/sidebars.ts.md) | 文件 | — | 文档站根侧边栏配置：串起 index、quick-start、installation，并内嵌生成的 CLI Reference 分类，另含 Guides、Reference 两个分类与 FAQ。 |
| [website/src/css/custom.css](../files/website/src/css/custom.css.md) | 文件 | — | 站点主题覆盖样式：定义浅色与深色两套 Docusaurus 主色变量、代码字号和高亮行背景色。 |
| [website/static/.nojekyll](../files/website/static/.nojekyll.md) | 文件 | — | GitHub Pages 部署标记文件：让 Pages 按原样提供构建产物，跳过 Jekyll 处理，避免下划线开头目录被丢弃。 |
| [website/tsconfig.json](../files/website/tsconfig.json.md) | 配置 | — | 文档站的 TypeScript 配置：继承 @docusaurus/tsconfig 并把 baseUrl 设为站点根目录。 |

## 对其它分层的依赖

本层没有记录到对其它分层的依赖。

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [维护工具链与工程基础设施](tooling.md) | 11 | depends_on×11 |
