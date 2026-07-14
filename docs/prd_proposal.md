# ResearchSpec PRD：面向 ARSU 的 Agent-Neutral Spec-Driven 论文写作框架

## 0. 文档状态与事实源

本文是 ResearchSpec 面向 ARSU 的需求级 PRD。它定义产品目标、核心用户、
合同族职责、ARSU workflow 对齐要求、非目标和验收口径。

用户入口、路线确认、运行循环和最小 surface 以
[ARSU 用户使用模型 v0.1](./arsu_user_usage_model.md)为 canonical 事实源。本文中的
能力描述分为三层：

- **Target v0.1**：固定 4 个 ARSU Skills、4 个 Companion Skills、可选 domain plugin
  Skills、16 个 CLI 命令和 selector-based 运行协议。
- **Current implementation（2026-07-11）**：完整 routing/workflow catalogs、subflow/round、
  Gate/transition、`arsu-v0-1`、四个 Companion、domain plugin registry、十六个 CLI 和
  31×8/28×8 base delivery。
- **Acceptance status**：Target v0.1 的十二条公共 CLI 用户旅程已通过，产品技术层完整。

本文不定义字段级 schema、validator 细节、CLI 参数形状或 adapter 具体写盘
协议。这些内容应在后续 specs 或实现任务中单独落地。

事实源：

- ResearchSpec 项目：`/home/joshua/Workspace/Code/JavaScript/ResearchSpec`
- ARSU 项目：`/home/joshua/Workspace/Code/Skill/academic-research-skills-universal`
- ARS 上游 checkout：`/home/joshua/Workspace/Code/Skill/academic-research-skills-universal/vendor/ars`
- Workflow-contract 设计输入：`docs/arsu_workflow_contract_design.md`
- Canonical 用户模型：`docs/arsu_user_usage_model.md`
- 架构方向输入：`docs/arch_design_proposal.md`
- 项目级 agent 指令：`AGENTS.md`

### 0.1 Current-State Policy

ARSU-derived 内容不默认要求 current-state-only。

上游 ARS 包含大量 version、history、changelog、migration、issue/PR 和
schema-version 文本。ARSU 已经选择尊重上游设计。ResearchSpec 吸收 ARSU 时
也应继承这个策略：

- 不因为 ARSU-derived 文件包含历史或版本文本而使转换、验证或发布失败。
- 可以把这些文本记录为 diagnostics 或 risk findings。
- 不把广泛 current-only cleanup 作为默认转换目标。
- ResearchSpec 自己编写的 contracts、wrappers、schemas、validators 和 adapter
  指令仍应描述当前有效行为。

### 0.2 旧模型替代说明

早期轻量 Markdown-only 模型中的 `plan.md`、`draft-map.md`、`decisions.md`、
`flows/`、`patches/` 不再作为 PRD 的目标合同结构。对应职责迁移到
`workflow.yaml`、`state.yaml`、append-only ledgers、`changes/` 和
`draft-patches/`。

## 1. 产品定位

ResearchSpec 是服务 ARSU 的 agent-neutral、spec-driven 论文写作合同框架。

它的核心职责是把 ARSU 的科研、写作、审稿和 pipeline skills 放到同一套稳定
文件合同之上，让不同 agent 可以通过文件协作，而不是依赖特定聊天上下文、
Claude Code 运行假设或某个模型 API。

一句话定义：

> ResearchSpec is an agent-neutral, spec-driven framework layer for ARSU-powered
> academic paper writing workflows.

ResearchSpec 应成为：

- ARSU-derived skill artifacts 的宿主与维护层。
- 面向 `deep-research`、`academic-paper`、`academic-paper-reviewer`、
  `academic-pipeline` 的统一合同框架。
- 研究意图、来源、主张、文稿结构、workflow state、artifacts、gates、
  decisions 和 patches 的文件化协议。
- ARSU converter / update / validation 的产品边界。
- 跨 agent、跨会话、跨工具目录的 handoff 基础设施。

ResearchSpec 不再以“泛用超轻量科研合同初始化器”为主要目标。

## 2. 用户与核心场景

### 2.1 研究者

研究者需要把论文写作过程中的研究问题、文献来源、主张边界、文稿结构、审稿
反馈、修改决策和最终产物放到可审查的合同包中。

ResearchSpec 对研究者的价值：

- Agent 可以理解当前论文项目状态。
- 高影响变更需要以 proposed change 或 human decision 形式出现。
- 研究主张、来源和文稿产物之间可追踪。
- 换 agent、换会话或恢复中断时，不丢失阶段状态。

### 2.2 ARSU 维护者

维护者需要把 ARSU 吸收到 ResearchSpec，并持续从 ARS upstream 生成、刷新和验证
ARSU-derived 产物。

ResearchSpec 对维护者的价值：

- ARSU 产物由 converter 和验证规则维护，而不是长期手工复制。
- 上游历史/version 文本可作为 diagnostics 处理，不阻断常规转换。
- 每个 ARSU skill wrapper 都能声明需要哪些 contracts、读取哪些 artifacts、
  可以写哪些 ledgers 或 patches。

### 2.3 Agent Wrapper / Adapter 作者

Wrapper 作者需要把 ARSU skills 安装到不同 agent 工具中，但不希望核心合同绑定
Claude Code、Codex 或任何特定 runtime。

ResearchSpec 对 wrapper 作者的价值：

- 核心合同是文件协议。
- Adapter 只负责渲染和写文件。
- Skill wrapper 通过 contract preflight 获取最小必要上下文。
- 产物通过 artifact registry、decision ledger 和 gate ledger 连接。

### 2.4 跨会话 Handoff 使用者

用户或 agent 可能从另一个会话、另一个工具或一个中断的 pipeline 继续工作。

ResearchSpec 对 handoff 的价值：

- `runs/current/state.yaml` 提供当前 run position。
- `runs/current/artifact-registry.json` 提供已生成 artifact 的索引。
- `runs/current/decision-ledger.jsonl` 和 `runs/current/gate-ledger.jsonl`
  提供可恢复的决策和门禁记录。
- `runs/current/handoff.md` 可作为渲染视图，但不是事实源。

### 2.5 用户启动与恢复模型（Target v0.1）

- `researchspec init` 只准备 workspace 和注入 Skills，不启动学术工作。
- 模糊、跨 Skill、继续、解释或导出请求进入 `researchspec-navigate`；明确 Skill/mode
  可以专家直达。
- 两条路径都必须展示 Skill、mode、前置 subflow、主要产物、Gate 和成本摘要，用户确认
  后才创建 subflow。
- 同一 workspace 只有一个 active run；standalone 工作和 revision round 都是具有 identity
  的动态 subflow。
- ARSU Skill 产生语义 artifact，ResearchSpec CLI 计算 frontier 并执行确定性提交和推进。

## 3. 产品需求

### 3.1 Typed Contract Workspace

ResearchSpec 必须创建并维护 typed file-contract workspace。

需求：

- Markdown 用于人类可读的研究意图、proposal、说明和 handoff。
- YAML/JSON/JSONL 用于 machine-facing contracts、state、registry、ledger
  和 patch payload。
- Draft、review report、integrity report、figure、table、PDF 和 process summary
  是 artifacts，不是研究意图事实源。
- `handoff.md` 是渲染视图，不是可写事实源。

### 3.2 ARSU Workflow Support

ResearchSpec 必须支持 ARSU 的核心 workflow，而不是把 ARSU 当作旧合同模型上的
附加插件。Target v0.1 通过 profile 声明 work、parallel group、Gate、transition 和
revision-round template；core 只实现通用控制平面。

需求：

- 保留 `academic-pipeline` 十个语义阶段的职责，并由 profile 将其投影为动态 subflow、Gate
  和 transition，而不是在 core 中写死十个状态。
- 支持 `deep-research` 的 6 个 phases 和 8 个 modes。
- 支持 `academic-paper` 的 8 个 phases 和 11 个 modes。
- 支持 `academic-paper-reviewer` 的 3 个 phases 和 6 个 modes。
- 完整 matrix 以 `docs/arsu_workflow_contract_design.md` 为准。
- ResearchSpec core 提供通用 contract/runtime primitives，不把某一条论文
  pipeline 硬编码为所有项目唯一流程。

### 3.3 Contract Preflight

每个 converted ARSU skill wrapper 必须在执行前进行 ResearchSpec contract
preflight。

需求：

- 定位当前项目的 `researchspec/`。
- 读取 `researchspec/specs/workflow.yaml` 和
  `researchspec/runs/current/state.yaml`。
- 识别当前 skill、stage、phase、mode 和允许写入范围。
- 只加载当前阶段需要的 contracts 和 artifact refs。
- 在执行前检查 pending decisions 和 blocking gate entries。
- 生成小而明确的 stage input packet，供 agent 进行语义工作。
- 当 state 存在时，不允许 wrapper 从聊天上下文推断 stage truth。

### 3.4 Artifact Registry

ResearchSpec 必须提供 artifact registry 作为跨 skill 产物索引。

需求：

- 所有重要 ARSU 输出都应注册为 artifacts。
- Registry 记录 artifact 的路径、类型、producer、stage/mode、校验信息和验证状态。
- Draft、bibliography、synthesis、integrity report、review report、revision roadmap、
  response to reviewers、formatted paper 和 process summary 都是 artifact。
- 下游 skill 通过 registry 引用 artifacts，而不是猜测文件名或依赖聊天历史。

### 3.5 Decision Ledger

ResearchSpec 必须让 human decisions 成为一等运行记录。

需求：

- 高影响研究选择必须进入 `decision-ledger` 或 proposed change。
- 典型高影响选择包括研究问题、目标产出、贡献范围、claim strength、稿件结构、
  review-response strategy、limitations 和 gate override。
- Agent 不应静默改变这些内容。
- 已确认 decision 应可被后续 wrappers 读取，避免重复询问或违背人类决定。

### 3.6 Gate Ledger

ResearchSpec 必须区分 advisory feedback 和 blocking gates。

需求：

- Integrity、review、compliance 和 finalization 相关阻断性检查写入 `gate-ledger`。
- 普通建议性评论不应伪装成 blocking gate。
- Gate 记录应足以恢复当前 blocker、verdict 和后续动作。
- Stage 2.5 pre-review integrity 与 Stage 4.5 final integrity 必须可被 pipeline
  识别为不同 gate。

### 3.7 Contract Patch

ResearchSpec 必须使用 proposed contract patch 管理高影响合同变更。

需求：

- Agent 可以提出 contract patch，但不应直接改写核心 specs。
- Contract patch 用于修改研究问题、scope、claim、manuscript structure、
  target output、review-response strategy 或 accepted limitations。
- Human 接受后，patch 才能进入 specs。
- 拒绝或修改的 patch 应保留审查痕迹。

### 3.8 Draft Patch

ResearchSpec 必须为 manuscript revision 提供 draft patch 机制。

需求：

- Revision skill 输出应使用 `draft-patches/<patch-id>.json` 记录可审查的稿件修改。
- Draft patch 应继承 ARS/ARSU 中有价值的 block/hash discipline。
- 修改稿件正文和修改研究合同是两件事：正文 patch 不应绕过 contract patch。

### 3.9 Adapter-Neutral Delivery

ResearchSpec 必须保持 agent-neutral。

需求：

- Core contracts 不依赖 Claude Code、Codex、Cursor、Gemini CLI 或其他单一工具。
- Tool adapters 只负责渲染和写入 skill/command/prompt 文件。
- Adapter 不应调用 LLM API。
- Adapter 不应把平台特定权限、hook 或上下文假设写进核心合同。

### 3.10 Converter / Update / Validation

ResearchSpec 必须最终拥有 ARSU-derived 产物的转换、刷新和验证入口。

需求：

- ARSU-derived artifacts 应由 converter-owned rules 生成。
- Update 流程应能检测 generated output drift。
- Validation 应检查合同块、wrapper preflight、artifact registration、ledger writes
  和禁止写入范围。
- 上游 version/history 文本只作为 diagnostics，不作为默认阻断项。

### 3.11 ResearchSpec Companion Workflows（Target v0.1）

目标 Companion 固定为四个：

- `researchspec-navigate`：模糊目标路由、恢复、状态解释和上下文导出。
- `researchspec-propose`：高影响语义变更起草。
- `researchspec-decide`：人类决策、review branch 和 Gate override。
- `researchspec-verify`：阶段边界语义审查与 proposed Gate verdict。

需求：

- Companion 以用户意图分层，不为每个 CLI transaction 建立同名 Skill。
- CLI 负责 deterministic validation 与权威写入；Companion 负责路由、解释、语义审查、
  风险说明和 human confirmation。
- ARSU 继续拥有 literature research、writing、review 与 manuscript draft-patch authoring；
  Companion 不得复制这些能力。
- Target base delivery 是 31 个 tools 各 8 个固定 Skills，28 个 command-capable tools 各
  8 个薄 wrappers。Workspace-selected plugin Skills 可额外投影到 31 个 tools，但不增加
  wrappers。Wrapper 和 plugin projection 都不是新的 workflow authority。
- Current implementation 已由 typed manifest 投影四个 Companion；六个旧投影仅在检测到
  manifest ownership 且 hash 匹配时安全清理，用户漂移始终保留并诊断。

### 3.12 Domain Skill Plugins

ResearchSpec 必须能够把维护者审校的领域知识作为可选 Open Agent Skills 包随 npm 发布。

需求：

- bundled registry 是 vendor provenance、稳定 domains、Skill membership 与 hard dependencies 的 runtime catalog SSOT，不在用户运行期访问上游；vendor converter 只输出隔离 bundle，source-neutral catalog 与 central assembler 共同决定最终 registry；
- 学科 domain 以 ANZSRC 2020 FoR Group 为唯一标准，Field 仅作 audit metadata；另有五个粗粒度工具域。内部 218 个固定 domain 允许为空，但普通用户 surface 只显示非空项；
- workspace 级选择投影到所有 configured tools，新 tool 自动补齐；
- 插件保留 LICENSE、NOTICE 与 immutable upstream revision，资源原样复制；
- ResearchSpec 不执行 plugin scripts、不安装依赖、不提供 sandbox；
- plugin Skills 不生成 command wrappers，也不得拥有 workflow、Gate、Decision、artifact
  registry 或 receipt authority；
- install/update/uninstall 复用 manifest hash、drift protection 和 manifest-last write discipline。
- 已选 domain 后续变空或缺失时，status/list-installed 保留 unavailable 恢复项，update 阻断，uninstall 继续使用 snapshot 安全清理。

## 4. 合同层需求

ResearchSpec 默认合同空间：

```text
researchspec/
  config.yaml

  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
    workflow.yaml

  runs/
    current/
      state.yaml
      artifact-registry.json
      decision-ledger.jsonl
      gate-ledger.jsonl
      handoff.md

  changes/
    <change-id>/
      proposal.md
      contract-patch.yaml
      tasks.md

  draft-patches/
    <patch-id>.json
```

### 4.1 Project Spec

`researchspec/specs/project.md` 描述研究意图、scope、目标产出、领域语境、
全局约束和 human control points。

需求：

- 适合人类阅读和修改。
- 被所有 ARSU skills 读取。
- 高影响修改必须经 contract patch 或明确 human decision。

### 4.2 Sources Spec

`researchspec/specs/sources.yaml` 描述 source registry、citation keys、literature
corpus、source roles、verification status 和 source provenance。

需求：

- 被 research、writing、integrity 和 review 阶段读取。
- 可由 source importers、research phases 或 accepted patches 更新。
- 不替代 Zotero 或其他文献管理器，只提供 agent 可消费的来源合同。

### 4.3 Claims Spec

`researchspec/specs/claims.yaml` 描述 claim IDs、support、strength、limits、
wording constraints 和 do-not-claim 边界。

需求：

- 写作、审查、integrity 和 finalization 必须读取。
- Agent 不得提升 claim strength 或扩大 scope，除非通过 accepted patch。
- Review 和 synthesis 可以提出 claim patch。

### 4.4 Manuscript Spec

`researchspec/specs/manuscript.yaml` 描述 manuscript type、outline、section
contracts、draft artifact refs、venue/format profile refs。

需求：

- 写作、revision、review 和 finalization 必须读取。
- 稿件结构变化属于高影响变更。
- 正文 artifact 不应替代 manuscript spec。

### 4.5 Workflow Spec

`researchspec/specs/workflow.yaml` 描述当前选择的 ARSU workflow/profile、动态
subflow template、work graph、parallel/join、Gate、transition 和 mode choices。

需求：

- 支持从 idea、sources、draft、review comments 或 finalization 进入。
- 支持 `academic-pipeline` 作为 ARSU 默认 stage graph。
- 不把 pipeline stage graph 写死为 ResearchSpec core 的唯一流程。
- CLI 从 profile 计算 frontier；`academic-pipeline` 不维护第二套 stage truth。
- Revision round 由带 parent/round identity 的模板实例化，不硬编码固定轮数。

### 4.6 Run State

`researchspec/runs/current/state.yaml` 描述当前 run state、active stage、blockers、
pending confirmations、resume target 和下一步恢复信息。

需求：

- 是 wrapper 判断当前执行位置的事实源。
- 与 research specs 分离，避免 workflow 状态污染研究意图。
- 每次 gate 或 stage transition 后应可恢复。

### 4.7 Artifact Registry

`researchspec/runs/current/artifact-registry.json` 描述所有关键 artifacts 的注册
记录。

需求：

- 是跨 skill artifact 查找的事实源。
- 支持 ARS handoff schemas 到 ResearchSpec artifacts 的映射。
- 支持 hash/drift/check receipts 的后续 schema 化。

### 4.8 Decision Ledger

`researchspec/runs/current/decision-ledger.jsonl` 是 append-only human decision
记录。

需求：

- 记录 branch choices、overrides、accepted limitations、review outcome 和关键确认。
- 不作为散文式聊天记录。
- 可被 pipeline resume、review、revision 和 process summary 使用。

### 4.9 Gate Ledger

`researchspec/runs/current/gate-ledger.jsonl` 是 append-only gate record。

需求：

- 记录 integrity、compliance、citation、claim、review 或 finalization gate。
- 明确 blocking 与 advisory 的差异。
- 支持 pipeline 阶段阻断和恢复。

### 4.10 Handoff View

`researchspec/runs/current/handoff.md` 是给人类和 agent 读取的渲染视图。

需求：

- 从 specs、state、registry 和 ledgers 渲染。
- 不允许作为 runtime SSOT。
- 不应被 wrapper 当作唯一可写状态。

### 4.11 Changes

`researchspec/changes/<change-id>/contract-patch.yaml` 与同目录 proposal/tasks
描述 proposed contract changes。

需求：

- 用于人类审查高影响研究变更。
- Accepted changes 才能进入 specs。
- Rejected 或 modified changes 应保留足够审查痕迹。

### 4.12 Draft Patches

`researchspec/draft-patches/<patch-id>.json` 描述稿件正文修改。

需求：

- 支持 revision mode 和 response-to-reviewers workflow。
- 与 contract patch 分离。
- 保留 block/hash 级审查能力。

## 5. ARSU Workflow 对齐需求

完整 workflow-contract mapping 见 `docs/arsu_workflow_contract_design.md`。本 PRD
只声明产品需求层面的对齐目标。

### 5.1 Academic Pipeline

ResearchSpec 必须保留 `academic-pipeline` 的十个语义阶段职责：

1. Research
2. Write
3. Integrity
4. Review
5. Revise
6. Re-review
7. Re-revise
8. Final Integrity
9. Finalize
10. Process Summary

需求：

- Stage 2 不得跳过 pre-review integrity 直接进入 review。
- Revision 后不得直接 finalize，必须经过 final integrity。
- Review/revision branch choices 必须进入 decision ledger。
- Integrity 和 final integrity 必须进入 gate ledger。
- Process summary 应从 artifact registry、decision ledger 和 gate ledger 生成。
- 具体运行图由 profile 实例化为 subflows、work、Gates 和 transitions；这些阶段名不是
  ResearchSpec core 中的硬编码状态枚举。
- Review 后的 revision/re-review 是动态 round；唯一合法 transition 可自动推进，多分支必须
  进入 Decision。

### 5.2 Deep Research

ResearchSpec 必须支持 `deep-research` 的 Scoping、Investigation、Analysis、
Composition、Review、Revision 六个 phases，以及 full、quick、review、
lit-review、three-way-scan、fact-check、socratic、systematic-review 八个 modes。

需求：

- RQ Brief 和 Methodology Blueprint 进入 artifact registry，并可提出 project patch。
- Bibliography 和 literature corpus 对齐 `sources.yaml`。
- Synthesis Report 进入 artifact registry，并可提出 claims/project patch。
- Fact-check 和 systematic-review 相关阻断发现可进入 gate ledger。

### 5.3 Academic Paper

ResearchSpec 必须支持 `academic-paper` 的 Config、Research、Architecture、
Argumentation、Drafting、Citations、Abstract、Peer Review、Format 相关流程，以及
full、outline-only、revision、abstract-only、lit-review、format-convert、
citation-check、plan、revision-coach、disclosure、rebuttal-audit 十一个 modes。

需求：

- Paper Draft 作为 artifact 注册，并由 `manuscript.yaml` 引用。
- Citation check 可写 advisory 或 blocking gate。
- Revision mode 输出 draft patch、revised draft、apply report 和 response artifacts。
- Format-convert 不应改变研究语义 specs。

### 5.4 Academic Paper Reviewer

ResearchSpec 必须支持 `academic-paper-reviewer` 的 Field Analysis、Panel Review、
Editorial Synthesis 三个 phases，以及 full、re-review、quick、methodology-focus、
guided、calibration 六个 modes。

需求：

- Reviewer skill 对 manuscript 内容保持 read-only。
- Review report、Editorial Decision、Revision Roadmap 作为 artifacts 注册。
- Review outcome 和 branch choice 进入 decision ledger。
- Re-review 输出 verification review、R&R traceability 和 residual decision。

### 5.5 ARS Handoff Schemas

ResearchSpec 必须保留 ARS handoff schemas 的语义，但运行态事实源迁移到
ResearchSpec contracts、registries 和 ledgers。

需求：

- RQ Brief 映射到 project spec 和 artifact registry。
- Bibliography / literature corpus 映射到 sources spec。
- Paper Draft 映射到 manuscript spec 和 artifact registry。
- Integrity Report 映射到 gate ledger 和 artifact registry。
- Review Report / Revision Roadmap 映射到 artifact registry、changes 和 draft patches。
- Response to Reviewers 映射到 artifact registry 和 decision/gate ledgers。
- Material Passport 拆分到 state、artifact registry、decision ledger 和 gate ledger。

## 6. 非目标与约束

ResearchSpec 不做：

- 不调用 LLM API。
- 不绑定 Claude Code、Codex、Cursor 或任何单一 agent runtime。
- 不替代 Zotero、LaTeX、Quarto、Overleaf、Word 或论文编辑器。
- 不做 web app、database-first research platform 或 citation manager。
- 不默认清理 ARSU-derived 上游 history/version/changelog 文本。
- 不把 ARS Material Passport 继续作为 ResearchSpec runtime SSOT。
- 不让 `handoff.md`、draft、review report 或 integrity report 成为 research specs 的事实源。
- 不在 PRD 中冻结字段级 schema、validator 行为或 CLI wire shape。

关键约束：

- Files are the interface。
- Human decides, agent proposes。
- High-impact research changes go through contract patch or explicit decision。
- LLM 负责语义判断、写作、解释和策略；脚本负责 schema validation、hash、registry、
  ledger append、gate transition 和 rendering。
- Converter-owned output 优先于长期手工维护 generated artifacts。

## 7. 验收标准与后续 Specs

### 7.1 PRD 验收标准

本 PRD 可作为下一阶段设计输入，当且仅当：

- 产品定位明确为 ARSU-facing framework layer。
- 合同族职责覆盖 specs、state、artifact registry、decision ledger、gate ledger、
  changes 和 draft patches。
- `academic-pipeline`、`deep-research`、`academic-paper`、
  `academic-paper-reviewer` 的支持要求已在需求层声明。
- 四个目标 Companion 覆盖 Navigate/Propose/Decide/Verify，同时保持与 ARSU semantic
  workflows 和 CLI transactions 的边界。
- 目标用户流程符合 `status → instructions → start/submit/advance → status`。
- Material Passport 不再是 ResearchSpec runtime SSOT。
- ARSU-derived current-state cleanup 明确不是默认目标。
- 旧轻量 Markdown-only 合同结构不再作为目标事实源。
- 字段级 schema 留给后续 specs，没有在 PRD 中提前冻结。

### 7.2 已实现 Specs

用户模型的 umbrella specs 为 `arsu-user-routing`、`arsu-run-usage` 和
`agent-surface-model`。它们以及 contract/workspace/runtime specs 已同步到 main specs；
字段级 DTO、workflow profiles、Gate/transition 与 Agent surface 以当前 specs 和实现为准。

### 7.3 v0.1 实现记录

v0.1 已按以下技术层完成并归档：

1. `add-arsu-routing-catalog`。
2. `add-subflow-instance-control-plane`。
3. `add-gate-transition-control-plane`。
4. `add-arsu-workflow-profiles`。
5. `consolidate-researchspec-agent-surface`。

随后通过 standalone、pipeline、Gate challenge/override、revision round、resume 和
context export、Material Passport resume 等十二条公共 CLI 旅程完成 umbrella acceptance。未来能力必须通过新的
OpenSpec change 增量定义，不重开这些已完成技术层。
