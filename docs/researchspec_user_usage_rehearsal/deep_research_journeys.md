# Deep Research 用户旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)。八个
mode 都使用城市绿地与城市热岛项目，但从各自声明的快照独立开始。

## 共同边界

`deep-research` 生产研究语义和外部交付物。它可以提出候选 sources/claims，不能直接确认
formal Gate，也不能把搜索日志、临时 corpus 或 synthesis 全文塞进 stable specs。每次
standalone 启动都要在路线摘要后获得用户确认，并创建自己的 control、handoff 与私有
`work/`。

## 1. `deep-research:full`：完整研究

### 进入与确认

从 S1 开始。用户说：“完整研究绿地降温效果，给我一份可以支撑论文写作的报告。”Navigate
选择 `full`，而不是只产出简报的 `quick` 或只做文献综合的 `lit-review`。它确认城市范围、
温度指标、来源政策、外部检索与 Zotero 使用权限，并展示：

```text
Skill/mode: deep-research:full
Inputs: project.md、研究目标、来源范围
Outputs: RQ brief、methodology、bibliography、synthesis、research report
Formal Gate: evidence quality
Cost: high / long-horizon
```

用户确认后，`start` 创建 `deep-research__full` 实例。Control 的 checkpoint 从研究问题与方法
设计开始；此时外部报告仍不存在。

### 执行与文件变化

Producer 在用户认可的路径创建：

```text
research/urban-heat/
├── rq-brief.md
├── methodology.md
├── bibliography.md
├── literature-matrix.csv
├── synthesis.md
└── research-report.md
```

检索候选、去重记录和未采用来源留在私有 `work/` 或 Agent 的有界工具上下文。Handoff 逐项
记录实际输入输出路径、用途、限制和写作下游；ResearchSpec 不复制外部文件。

Verify 先运行 `check`，再读取 project、handoff 和报告，审查覆盖、方法一致性、claim 强度
与限制，提出 `pass`、`pass_with_conditions` 或 `fail`。用户确认后，`decide` 把 evidence
Gate 写入本实例 control。Agent 只把用户接受的来源和 claims 提炼进 `sources.yaml` 与
`claims.yaml`，随后 `advance` 完成本实例。

### 失败与验收

证据不足时保留候选报告和 Gate fail；若继续，必须有 profile 允许的显式 override。用户在
启动摘要处拒绝时不创建实例。完成时必须能从 handoff 找到报告，但不得出现 registry、
receipt 或 Material Passport。

## 2. `deep-research:quick`：快速研究简报

从 S1 开始。用户说：“今天先给我一页简报，列出最值得读的来源。”Navigate 选择 `quick`，
因为用户没有要求可直接进入正式论文的完整证据综合。

启动摘要声明低成本、single pass、输出 research brief 与 bibliography，通常没有 formal
Gate。用户确认后创建独立 control；Producer 生成：

```text
research/urban-heat/quick-brief.md
research/urban-heat/quick-bibliography.md
```

Handoff 明确标注“初步扫描、尚未完成系统覆盖、不能自动提升为 accepted claims”。Agent
可以在用户明确接受后把少量稳定来源写入 `sources.yaml`，但 quick 完成本身不代表接受。
无 formal Gate 时，`advance` 依据 profile 和已完成 handoff 结束实例，不伪造 Gate 记录。

来源无法访问时，brief 标注缺口并完成为有限结论，或由用户扩大范围；它不自动切换为
`full`。验收重点是低成本边界、无虚假 Gate、没有把临时简报当作稳定研究结论。

## 3. `deep-research:review`：审阅现有研究文本

从 S1 开始，用户提供 `research/urban-heat/consultant-report.md`：

> 帮我审查这份报告的证据和推理，不要重做整项研究。

Navigate 区分 research text review 与 manuscript peer review：前者看研究报告的证据质量，
后者应交给 `academic-paper-reviewer:full`。确认评估目的、允许核查的来源范围和输出路径后，
用户批准启动。

Producer 只读原报告，输出 `research/urban-heat/consultant-report-review.md`。Handoff 保存输入
报告与 review report 的角色和限制，不把原报告纳入 ResearchSpec 所有权。若审查结果将被
用作正式写作依据，Verify 可以提出条件性 evidence-quality Gate；仅供咨询时则保持 advisory。

用户确认 formal Gate 后，`decide` 写入 control；Agent 只有在用户接受具体来源或 claim
修订时才更新 stable specs。报告缺页会阻塞依赖缺页的判断，但不会触发全项目 drift 或让
Agent补写缺失内容。验收要求评审与改写分离，原报告始终不被覆盖。

## 4. `deep-research:lit-review`：证据型文献综述

从 S1 开始。用户要求：“检索并综合城市绿地降温研究，重点比较气候区与测量方法。”这是
研究证据综合，不是论文中的 literature-review prose，因此选择 `deep-research:lit-review`，
而不是 `academic-paper:lit-review`。

路线摘要列出 topic、数据库/语言/时间范围、种子材料、bibliography、source corpus、matrix、
synthesis、required evidence Gate 和 medium/iterative 成本。用户确认后启动。

```text
research/urban-heat/literature-review/
├── bibliography.md
├── source-corpus/
├── literature-matrix.csv
└── synthesis.md
```

外部检索与 Zotero 可作为嵌套 provider；它们不创建 child run。Producer 在 synthesis 中
区分测量方法、气候调节因素、证据冲突和空白。Handoff 指向完整 corpus 与 synthesis；
stable `sources.yaml` 只接收用户接受的来源，`claims.yaml` 只接收经 Gate 后认可的主张。

Verify 组织 evidence-quality 审查，用户确认后 `decide` 保存 Gate，`advance` 完成。检索范围
变更属于当前研究范围的高影响选择时记录 scope Decision；单篇候选的排除理由留在过程材料。

## 5. `deep-research:three-way-scan`：WHY/HOW/WHAT 快速比较

从 S1 开始，用户给出六篇候选论文并说：“按 WHY/HOW/WHAT 比较，告诉我先读哪三篇。”
Navigate 选择 `three-way-scan`；用户已提供 focused shortlist，不需要完整检索。

启动前确认 shortlist、比较目的和输出位置。摘要声明低风险、single pass、无 formal Gate。
Producer 输出：

```text
research/urban-heat/scans/why-how-what-matrix.md
research/urban-heat/scans/reading-shortlist.md
```

Matrix 说明每篇研究为什么提出问题、如何测量、得出什么结果，并明确未核验的摘要级信息。
Handoff 将结果标为 advisory；它不自动修改 sources/claims。某篇全文不可用时保留 unknown，
不从摘要补齐方法细节。实例可以正常完成，并在 handoff 中留下后续 `lit-review` 建议。

## 6. `deep-research:fact-check`：核查明确 claims

从 S2 开始。用户指定：

> 核查“城市公园通常能把周边地表温度降低 2–3°C”以及“这种效果在干旱区更强”。

Navigate 选择 `fact-check`，确认精确措辞、适用范围、允许来源和判定阈值。它不会把“核查
整篇论文”误路由到这个 mode，也不会在输入 claim 不明确时自行收窄。

用户确认低成本 single-pass 路线后，Producer 创建 `research/urban-heat/fact-check.md`，对
每个 claim 给出 supported、qualified、unsupported 或 unknown，列出证据、范围与反例。
Handoff 指向 report，原 `claims.yaml` 在用户决定前保持不变。

高影响 claim 的 verdict 触发条件性 `claim_verification` Gate。Verify 展示证据和限制，用户
确认后 `decide` 写 Gate；Agent 再把已接受的强度和措辞更新到 `claims.yaml`。若证据只支持
相关性，禁止在未确认 change/Decision 的情况下保留因果措辞。

## 7. `deep-research:socratic`：把模糊想法变成研究计划

从 S0 或只有标题的 S1 开始。用户说：“我想研究绿地和热岛，但还不知道问题怎么定。”
Navigate 选择 `socratic`，因为当前目标是澄清问题，而不是立即检索或写报告。

Agent 通过多轮对话追问动机、研究对象、可观察变量、比较单位、可行性、排除范围和预期
贡献。互动成本可变；每轮普通探索不写 Decision。形成两个实质不同的研究范围后，Agent
展示差异，用户选择“跨气候区比较公园与林荫道”。该 scope 选择由 `decide` 写入本实例
control，随后 Agent 更新 `project.md`。

外部输出可以是：

```text
research/urban-heat/rq-brief.md
research/urban-heat/research-plan.md
```

此 mode 通常无 formal Gate。Handoff 说明已选择范围、被拒绝方向和仍未知的可行性；
`advance` 完成后可建议 `full`、`lit-review` 或 `systematic-review`，但不自动启动它们。

## 8. `deep-research:systematic-review`：系统综述或 meta-analysis

从 S1 开始，`project.md` 已有可操作 review question。用户要求按照 PRISMA 完成系统综述，
并在效应量可比时做 meta-analysis。若 review question 仍模糊，Navigate 先建议 `socratic`。

启动摘要明确数据库、时间/语言范围、protocol、纳排标准、双人筛选安排、PRISMA、risk of
bias、统计计划、两个 required Gates（methodology compliance、evidence quality）以及
high/long-horizon 成本。用户确认后才创建实例。

```text
research/urban-heat/systematic-review/
├── protocol.md
├── search-strategies.md
├── screening-log.csv
├── prisma-flow.md
├── included-studies.csv
├── risk-of-bias.md
├── meta-analysis.md
└── research-report.md
```

Protocol 的实质变更在执行前向用户说明；改变 review question、纳排边界或统计策略时记录
scope/method Decision。检索结果、排除记录和计算材料属于外部边界交付物或私有过程材料，
不会被压缩进 stable specs。

Verify 分别评估方法合规与证据质量。每个 formal Gate 都要用户确认并由 `decide` 写入
control；一个 Gate 通过不能替代另一个。研究异质性不允许 meta-analysis 时，Producer 输出
有理由的 narrative synthesis，而不是伪造 pooled estimate。完成后只把用户接受的来源和
claims 写入 stable specs。

## 9. Deep Research 分册验收

- 八个 mode 都有明确起点、确认、实例、外部输出、handoff 和结束条件。
- `quick`、`three-way-scan`、`socratic` 不制造 formal Gate。
- `review` 与 `fact-check` 的 Gate 保持条件性；`full`、`lit-review`、`systematic-review` 的
  required Gate 不可跳过。
- Evidence review 与 manuscript peer review、证据综合与论文综述章节保持清晰边界。
- 候选 sources/claims 在用户确认前不进入 stable specs。
