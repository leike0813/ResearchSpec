# ARSU 用户使用模型 v0.1

## 0. 文档状态与权威边界

本文是 ResearchSpec 面向 ARSU 的 canonical 用户使用模型，锁定用户入口、路线选择、运行循环、交互边界和目标 surface。后续产品、架构、CLI、Schema、Companion 与 ARSU workflow 设计若与本文冲突，以本文的用户模型为准；字段和事务细节仍以对应 OpenSpec capability 与实现为准。

本文同时使用三种状态标签：

- **Target v0.1**：已经锁定的目标用户体验和职责边界。
- **Current implementation（2026-07-11）**：仓库中已经可运行的能力。
- **Acceptance status**：Target v0.1 的十一条公共 CLI 用户旅程已经通过验收。

本模型由 main capability specs 持续约束；原 umbrella change `define-arsu-user-usage-model-v0-1` 在全部技术层和端到端验收通过后归档。

## 1. 一句话使用模型

> 用户先初始化 workspace，再用自然语言说明学术目标；Agent 解析并展示一条包含 Skill、mode、依赖、产物、Gate 与成本的路线，用户确认后，ARSU Skill 负责语义生产，ResearchSpec CLI 负责状态、instructions、提交、Gate 与推进。

最重要的边界有四条：

1. `init` 准备环境，不启动学术工作。
2. 用户说目标，Agent 选择入口；用户不需要先学习 CLI 命令树。
3. ARSU 产生研究语义和文稿，CLI 维护确定性状态和审计记录。
4. Candidate 登记可以自动化，正式 Gate 必须逐次由用户确认。

## 2. Bootstrap 与工作启动分离

### 2.1 首次准备

用户在一个项目目录中只需要显式完成一次 Bootstrap：

```text
researchspec init
```

`init` 的 Target v0.1 职责仅包括：

- 创建或补齐 ResearchSpec workspace；
- 安装或投影四个 ARSU Skills 与四个 Companion Skills；
- 记录可用工具和配置；
- 不选择 ARSU mode；
- 不创建学术 subflow；
- 不把某个 profile 的存在解释为工作已启动。

### 2.2 从对话启动工作

```mermaid
flowchart TD
    I["researchspec init<br/>准备 workspace 与 Skills"] --> U["用户向 Agent 描述学术目标"]
    U --> R{"目标是否明确到 Skill / mode？"}
    R -->|"否：模糊、跨 Skill、继续、解释、导出"| N["researchspec-navigate"]
    R -->|"是：专家显式指定或唯一匹配"| D["直达对应 ARSU Skill"]
    N --> S["路线摘要<br/>Skill、mode、依赖扩展、产物、Gate、成本"]
    D --> P["CLI 校验前置条件"]
    P --> S
    S --> C{"用户确认这条路线？"}
    C -->|"否"| U
    C -->|"是"| ST["start subflow:<id>"]
    ST --> L["进入统一运行循环"]
```

确认绑定的是已展示的精确路线。如果 Skill、mode、前置 subflow、正式 Gate 或成本发生实质变化，Agent 必须重新展示摘要并确认。

## 3. 路由模型

### 3.1 两个入口

| 用户表达 | 入口 | 仍须执行 |
| --- | --- | --- |
| “帮我看看接下来做什么”、跨多个阶段的目标、恢复中断、解释状态、导出上下文 | `researchspec-navigate` | 解析状态、消歧、展示路线、等待确认 |
| “用 `academic-paper` 的 `revision` mode 修改这篇稿件”等明确请求 | 对应 ARSU Skill | 校验依赖、展示路线、等待确认 |

专家直达不是绕过控制平面。它只跳过“猜哪个 Skill/mode”的步骤，不跳过依赖检查、路线摘要或启动确认。

### 3.2 四类 ARSU 路由

| ARSU Skill | 主要意图 | 主要输入 | 主要输出 | 典型 near-miss |
| --- | --- | --- | --- | --- |
| `deep-research` | 研究问题、证据搜集、文献综合、事实核查、研究报告 | 研究目标、种子材料、来源或待核查 claims | RQ Brief、Bibliography、Synthesis、Research Report、核查报告 | “文献综述”若目标是论文中的成稿章节，应考虑 `academic-paper:lit-review` |
| `academic-paper` | 论文规划、论证、写作、修改、引用与格式 | 研究材料、sources/claims、稿件或审稿意见 | Outline、Draft、Revision、Response、格式化稿件 | 从零持续完成研究到投稿应考虑 `academic-pipeline`；仅审稿不应进入写作 Skill |
| `academic-paper-reviewer` | 对现有稿件进行同行评议或 re-review | 稿件、研究合同、既有修改材料 | Review Report、Editorial Decision、Revision Roadmap | 对研究报告或事实真伪的核查应进入 `deep-research`，不等于 manuscript peer review |
| `academic-pipeline` | 跨研究、写作、完整性、审稿、修改、定稿的长流程 | 研究目标或已有中间材料 | 由多个 subflow 组成的完整论文包与过程记录 | 只有一个明确局部目标时应直接调用对应 standalone Skill，pipeline 是 opt-in |

### 3.3 路由事实源

Current implementation 已由 `src/arsu-converter/routing/` 提供 typed、converter-owned
routing catalog，并生成可审计的 `skills/arsu/routing-catalog.json`。它保存：

- Skill 与 mode ID；
- 用户意图和 near-miss；
- 必需 contracts/artifacts 与可自动展开的 prerequisite subflows；
- 主要产物；
- 风险等级和 Gate policy；
- 粗粒度成本/交互预算；
- workflow template reference。

ARSU Skill 与 command wrapper descriptions 已从该 catalog 投影。后续
`researchspec-navigate` 和 subflow route summary 也必须消费同一 catalog，不另建映射。

## 4. 全部 ARSU Mode 的主要产物路由矩阵

下表锁定路由语义，不冻结最终 artifact type 名称或 DTO 字段。某个 mode 的完整依赖和 Gate 由 profile/instructions 在运行时给出。

### 4.1 `deep-research`

| Mode | 何时选择 | 主要产物 | 正式 Gate 倾向 |
| --- | --- | --- | --- |
| `full` | 需要从问题到完整研究报告 | RQ Brief、Methodology Blueprint、Bibliography、Synthesis、Research Report | 结论/证据充分性 Gate |
| `quick` | 需要低成本研究简报 | Research Brief、关键来源、暂定发现 | 视风险；默认可仅 deterministic check |
| `review` | 审阅已有研究文本或报告 | Research Review、风险与修改建议 | 若结论将进入正式稿件则需要 |
| `lit-review` | 搜索并综合一个主题的证据 | Bibliography、Literature Matrix、Synthesis | 来源与综合质量 Gate |
| `three-way-scan` | 对 WHY/HOW/WHAT 文献快速比较 | Comparison Matrix、Reading Shortlist | 通常 advisory |
| `fact-check` | 核查一个或多个明确 claims | Fact-check Report、source findings | 高影响 claim 需要 Gate |
| `socratic` | 通过问答形成研究问题和设计 | RQ candidates、Research Plan Summary | scope/branch 选择进入 Decision |
| `systematic-review` | 系统综述或 meta-analysis | Protocol、PRISMA artifacts、RoB/meta-analysis outputs | 方法、合规、证据 Gate |

### 4.2 `academic-paper`

| Mode | 何时选择 | 主要产物 | 正式 Gate 倾向 |
| --- | --- | --- | --- |
| `full` | 从材料形成完整稿件 | Configuration、Outline、Evidence Map、Argument Blueprint、Draft、submission package | 稿件与引用 Gate |
| `outline-only` | 只规划论文结构和证据布局 | Outline、Evidence Map | 结构是高影响选择时进入 Decision |
| `revision` | 根据审稿意见实施修改 | Revision Patch、Revised Draft、Apply Report、Response to Reviewers | 修改完整性与 re-review Gate |
| `abstract-only` | 为既有稿件生成摘要与关键词 | Abstract、Keywords | 通常 deterministic/advisory |
| `lit-review` | 形成论文中的文献综述材料或章节 | Annotated Bibliography、Literature Matrix、Synthesis/section draft | 稿件语义 Gate |
| `format-convert` | 不改变语义地转换交付格式 | DOCX/LaTeX/PDF/Markdown 等 | deterministic format check |
| `citation-check` | 核查文内引文与参考文献 | Citation Audit、可选 corrected candidate | 发现严重引用问题时阻断 |
| `plan` | 交互式规划章节和论证 | Chapter Plan、INSIGHT collection | scope/structure Decision |
| `revision-coach` | 制定修改策略而不直接改稿 | Revision Roadmap、response skeleton | 策略选择可进入 Decision |
| `disclosure` | 生成 AI 使用披露 | Disclosure artifact、placement guidance | 合规策略视 venue policy |
| `rebuttal-audit` | 检查回复信覆盖和论证 | Rebuttal QA Report | 默认 advisory；关键遗漏可阻断 |

### 4.3 `academic-paper-reviewer`

| Mode | 何时选择 | 主要产物 | 正式 Gate 倾向 |
| --- | --- | --- | --- |
| `full` | 完整多视角同行评议 | Panel Reports、Editorial Decision、Revision Roadmap | Review Gate + branch Decision |
| `re-review` | 验证修改是否回应上一轮意见 | Verification Review、R&R Traceability Matrix、residual roadmap | Re-review Gate + branch Decision |
| `quick` | 快速识别最关键问题 | EIC Quick Assessment | 通常 advisory |
| `methodology-focus` | 聚焦研究方法与有效性 | Methodology Review | 高影响方法问题需要 Gate |
| `guided` | 与用户共同推演审稿策略 | Guided Review Notes、strategy options | 选定策略进入 Decision |
| `calibration` | 校准 reviewer 判断和置信度 | Calibration Report、confidence disclosure | 通常 advisory |

### 4.4 `academic-pipeline`

`academic-pipeline` 不是另一套语义生产 mode 集。它提供两种使用方式并调度上述 modes：

| 使用方式 | 入口 | 行为 |
| --- | --- | --- |
| End-to-end | 从研究目标或种子材料启动 | 创建 pipeline parent subflow，按 profile frontier 调度 Research、Write、Integrity、Review、Revision、Finalization |
| Mid-entry / resume | 从已有稿件、审稿意见或 active run 恢复 | Navigate 识别现有 artifacts/state，展示省略与补齐的 prerequisite subflows，确认后从合法 frontier 继续 |

## 5. 统一运行协议

Target v0.1 的 Agent 循环只有四步：

```text
status
→ instructions <subflow:|work:|gate:|transition:>
→ start / submit / advance
→ status
```

各 selector 和动作的关系如下：

| Selector | instructions 回答 | 执行动作 |
| --- | --- | --- |
| `subflow:<id>` | 路线、前置依赖、实例参数、成本和启动能力 | `start subflow:<id>` |
| `work:<id>` | producer Skill、输入引用、规则、模板、候选路径、校验和完成策略 | Agent 调用 ARSU Skill 产出候选，再 `submit work:<id>` |
| `gate:<id>` | validator、evidence、risk、proposed verdict、确认要求 | `researchspec-verify` 组织语义审查，再 `submit gate:<id>` |
| `transition:<id>` | 当前 basis、目标状态、分支条件和副作用 | 唯一合法时 `advance transition:<id>`；歧义时先 Decision |

```mermaid
flowchart LR
    S["status<br/>计算 frontier"] --> I["instructions selector<br/>生成动态 packet"]
    I --> K{"selector 类型"}
    K -->|"subflow"| A["start"]
    K -->|"work"| W["ARSU Skill 产生 candidate"]
    W --> SW["submit work"]
    K -->|"gate"| V["Verify + 用户确认"]
    V --> SG["submit gate"]
    K -->|"transition"| T["advance"]
    A --> S
    SW --> S
    SG --> S
    T --> S
```

CLI 是这套循环的状态权威。Companion 和 ARSU Skill 可以选择、解释、循环，但不能复制 DAG、猜路径或直接写 state/registry/ledger。

## 6. Standalone 与 Pipeline

### 6.1 Standalone 时序

```mermaid
sequenceDiagram
    actor U as 用户
    participant A as Agent
    participant N as Navigate/ARSU Skill
    participant C as ResearchSpec CLI
    participant S as ARSU producer Skill

    U->>A: “帮我做系统综述”
    A->>N: 解析目标
    N->>C: status + route lookup
    C-->>N: prerequisites / route / cost / Gates
    N-->>U: 展示路线摘要
    U->>N: 确认
    N->>C: start subflow:systematic-review
    loop 直到 frontier 不再有 ready work
        N->>C: status + instructions work:<id>
        N->>S: 调用 producer Skill
        S-->>N: 写 candidate artifact
        N->>C: submit work:<id>（hash-bound）
    end
    N->>C: instructions gate:<id>
    N-->>U: 展示 verdict 与 evidence
    U->>N: 确认 Gate
    N->>C: submit gate:<id>
    N->>C: advance transition:<id>
```

standalone 不是“无状态的一次 Skill 调用”，而是 active run 下一个有 identity 的 subflow。它可以被暂停、恢复，也可以作为另一个路线的 prerequisite。

### 6.2 Pipeline 调度

`academic-pipeline` 只做语义层调度：解释 frontier、调用正确的 ARSU Skill/mode、汇总进度。它不保存第二套 stage truth。

```mermaid
flowchart TD
    R["Research subflow"] --> GI["Research Gate"]
    GI --> W["Write subflow"]
    W --> PI["Pre-review Integrity Gate"]
    PI --> RV["Review subflow"]
    RV --> D{"Editorial Decision"}
    D -->|"accept"| FI["Final Integrity Gate"]
    D -->|"revision"| RR["动态 Revision Round"]
    RR --> RRV["Re-review"]
    RRV --> D
    FI --> F["Finalize"]
    F --> PS["Process Summary"]
```

具体 stage 名称可以由 profile 演进，但强制 integrity、review branch 和 revision round 的用户语义不能由 Agent 静默跳过。

## 7. 并行组与 Join

并行是 workflow profile 的声明，不是 Agent 的即时优化猜测。

```mermaid
flowchart LR
    O["Outline ready"] --> P1["parallel group: figures"]
    O --> P2["parallel group: literature section"]
    P1 --> J{"join: 全部 required work done"}
    P2 --> J
    J --> G["Manuscript Gate"]
```

profile 必须给出：

- 哪些 work items 属于同一 parallel group；
- 最大并行度或成本限制；
- join 是 all、quorum 还是明确的 optional policy；
- 某个分支失败时是重试、降级还是阻断。

没有这些声明时，Agent 按 CLI frontier 串行执行，不自行并行。

## 8. Gate、异议与 Decision

### 8.1 自动化边界

| 事件 | 默认是否需要用户确认 | 原因 |
| --- | --- | --- |
| ARSU Skill 写 candidate | 否 | 只是工作文件 |
| `submit work:<id>` 登记精确 hash | 否，可自动 | 机械登记，不代表学术认可 |
| deterministic format/schema check | 否 | 可复算的结构事实 |
| 正式 Gate verdict | 是，每个 Gate 一次 | 对学术质量或流程推进有影响 |
| 唯一已授权 transition | 否，可自动 | 没有新的语义选择 |
| 多分支、scope/claim/structure 变化 | 是，通过 Decision | 产生新的研究语义 |
| 越过 failed Gate | 是，通过 Decision override | 必须留下明确责任记录 |

### 8.2 Gate 时序

```mermaid
sequenceDiagram
    participant A as Agent
    participant V as researchspec-verify
    actor U as 用户
    participant C as CLI

    A->>C: instructions gate:<id>
    C-->>A: validator + evidence + proposed verdict
    A->>V: 发起语义审查
    V-->>U: 展示 verdict、证据、限制和后果
    alt 用户确认
        U->>A: confirm
        A->>C: submit gate:<id>
    else 用户质疑
        U->>A: challenge
        A->>V: re-verify
        alt 重验改变 verdict
            V-->>U: 新 verdict，再次确认
        else 仍失败但用户要求继续
            A->>C: researchspec-decide（override + rationale）
        end
    end
```

Gate 记录必须保存 validator、evidence、verdict 与 `confirmed_by`。确认 Gate 不自动制造 Decision；只有 branch choice、语义变更或 override 进入 Decision ledger。

## 9. Revision Round

revision 不是写死的 Stage 4/4' 两格。Target v0.1 使用可实例化 round template：

```mermaid
stateDiagram-v2
    [*] --> Review
    Review --> Accept: accepted branch
    Review --> RevisionRound: revision branch
    RevisionRound --> ReReview: revised draft + response submitted
    ReReview --> Accept: accepted branch
    ReReview --> RevisionRound: another revision branch / round n+1
    Accept --> FinalIntegrity
```

每个实例至少具有：

- `subflow_instance_id`；
- `parent_subflow_id`；
- `round_number`；
- 触发它的 review/decision IDs；
- 输入稿件与输出稿件 artifact IDs；
- 独立 work、Gate 和 transition records。

workflow 可以通过 policy 限制最大 round、预算或人工审批，但 runtime 不把固定轮数硬编码进 core。

## 10. Pause、Resume、Explain 与 Export

这些请求统一进入 `researchspec-navigate`：

```mermaid
flowchart TD
    Q{"用户请求"}
    Q -->|"继续 / resume"| S["读取 status 与 active frontier"]
    Q -->|"现在为什么卡住"| E["解释 blockers、Gate、Decision 与候选状态"]
    Q -->|"给另一个 Agent"| X["handoff / pack"]
    S --> R["展示下一条路线或多个可选 frontier"]
    E --> R
    X --> O["生成只读上下文视图或包"]
    R --> C{"需要新 subflow 或语义选择？"}
    C -->|"是"| U["展示摘要并确认"]
    C -->|"否"| N["继续已有 selector 循环"]
```

恢复已有 ready work 不等于启动新路线，不重复要求路线确认；但如果要补建 prerequisite、改变 mode 或选择新 branch，则必须再次确认或进入 Decision。

## 11. 目标最小 Surface

### 11.1 Skills：4 + 4

| 类别 | Skill | 用户作用 |
| --- | --- | --- |
| ARSU | `deep-research` | 研究、证据、综合、事实核查 |
| ARSU | `academic-paper` | 规划、写作、修改、引用和格式 |
| ARSU | `academic-paper-reviewer` | 同行评议与 re-review |
| ARSU | `academic-pipeline` | 跨阶段协调 |
| Companion | `researchspec-navigate` | 模糊路由、恢复、状态解释、上下文导出 |
| Companion | `researchspec-propose` | 起草高影响语义变更 |
| Companion | `researchspec-decide` | 人类决策、review branch、Gate override |
| Companion | `researchspec-verify` | 阶段边界语义审查与 proposed Gate verdict |

Check、Submit 和 Archive 是 CLI transaction，不需要同名 Companion。Explore、Next 与 Context 的用户意图并入 Navigate。

### 11.2 CLI：15 个顶层命令

| 分组 | 命令 | 用户模型中的作用 |
| --- | --- | --- |
| Bootstrap | `init`, `update` | 准备/刷新 workspace 与投影，不启动工作 |
| Control plane | `status`, `instructions`, `start`, `submit`, `advance` | 计算 frontier、返回 packet、执行生命周期 transaction |
| Inspection | `check`, `list`, `show` | 校验和查看权威对象 |
| Context | `handoff`, `pack` | 渲染或打包可移交上下文 |
| Governance | `propose`, `decide`, `archive` | 高影响 change、显式决策与生命周期收尾 |

command wrapper 只是不同 agent 工具的 adapter。目标交付量是：

- 31 个 registered tools × 8 Skills；
- 28 个 command-capable tools × 8 thin wrappers。

这个乘积不是产品能力数量，不能用 wrapper 数量反推新 surface。

## 12. 职责矩阵

| 层 | 拥有 | 不得拥有 |
| --- | --- | --- |
| ResearchSpec CLI | 路径、typed state、DAG/frontier、hash、registry/receipt、Gate/Decision transaction、transition | 研究结论、稿件内容、审稿判断 |
| ARSU workflow profile | work graph、parallel/join、Gate policy、transition、round template | workspace 实际状态、手写 ledger |
| ARSU Skill | 文献研究、综合、写作、审稿、修改、候选 artifact | 直接改 registry/state/ledger、猜 stage |
| Companion | 路由、解释、提案、决策、语义验证的人机流程 | 第二套状态机、低层写入、重复 ARSU 语义能力 |
| Artifact/contracts | 可审计输入输出和事实记录 | 用聊天记忆替代 hash/decision/Gate |

## 13. Current implementation 与 Target 差距

截至 2026-07-10，当前实现已经具备：

- 全部 15 个目标顶层命令，包括 `submit work:|gate:` 与 `advance transition:`；
- typed workflow work items、`done/ready/blocked` evaluator 和动态 `instructions work:`；
- `RQ Brief → Bibliography → Synthesis` 实验 Slice；
- receipt-backed、hash-bound candidate submit；
- contract change / Decision / archive 的确定性事务；
- 4 个 ARSU Skills 与 4 个 Companion Skills 的多工具投影；Navigate 从 routing catalog
  和 CLI frontier 组合 Route、Resume、Explain、Export。
- converter-owned routing catalog，覆盖 25 个 modes、2 个 pipeline entries、artifacts、
  prerequisites、near-misses、risk/Gate policy 和粗粒度成本，并投影 ARSU descriptions。
- active-run `state.yaml` 下的 strict subflow/round instances、parent/round identity、
  all/quorum parallel frontier、`instructions subflow:` 与原子 `start`；
- instance-scoped `work:<instance>/<node>` 和由 Start confirmation 授权的 automatic
  hash-bound `submit work:`；旧静态 workspaces 保持兼容。
- instance-scoped `gate:`/`transition:` frontier、用户确认 Gate submit、challenge 后重验、
  receipt-bound override/branch Decision，以及 receipt-first/state-last Advance。
- 新 workspace 默认 `arsu-v0-1`，完整覆盖 25 个 operational modes、2 个 pipeline entries，
  并以 parent-scoped child selector、委托确认和无上限 dynamic revision rounds 组合 pipeline。
- 受控 `arsu-artifact:` contracts，以及 receipt-backed 的 UTF-8 text 与原生 binary candidate Submit。

当前实现已经通过 bootstrap、vague/expert routing、standalone、pipeline、parallel join、
Gate challenge/override、revision round、cross-process resume、context export 与 terminal
completion 的公共 CLI 黑盒验收。本文中的四 Companion、十五个 CLI 和 31×8/28×8 数量
是当前 generated delivery 的事实。

## 14. 技术层落地顺序

| 顺序 | OpenSpec change | 交付 |
| ---: | --- | --- |
| 1 | `add-arsu-routing-catalog` | typed routing catalog、mode/artifact/near-miss/risk/Gate policy、Skill description 投影 |
| 2 | `add-subflow-instance-control-plane` | subflow/round instances、parallel groups、通用 selector、`start`、自动 work submit policy |
| 3 | `add-gate-transition-control-plane` | `submit gate:`、`advance transition:`、Gate confirmation/challenge/override、transition receipt |
| 4 | `add-arsu-workflow-profiles` | deep-research、academic-paper、reviewer、pipeline 的完整 mode/profile graphs |
| 5 | `consolidate-researchspec-agent-surface` | Navigate、四 Companion、旧投影清理、31×8/28×8 delivery |

其中 routing catalog、subflow instance control plane、Gate/transition control plane 与完整
workflow profiles、surface consolidation 与端到端 acceptance 已实现并通过；v0.1 不再有待实现技术层。

Umbrella change 只有在以下用户旅程全部通过时才能归档：Bootstrap、模糊路由、专家直达、standalone、pipeline、并行 join、Gate challenge/override、revision round、resume、context export 和 terminal completion。

## 15. v0.1 锁定项与非锁定项

已锁定：

- 对话优先入口与路线确认；
- 单 active run + 动态 subflow/round；
- CLI 状态权威与 ARSU 语义生产边界；
- work 自动提交、Gate 逐次确认、Decision 使用范围；
- workflow-declared parallelism 与 unique-transition 自动推进；
- 4 ARSU + 4 Companion + 15 CLI；
- selector-based 运行协议。

v0.1 已实现并仍可通过后续 change 演进：

- catalog、subflow、Gate、transition 与 receipt DTO 以 main specs 和 Schema 0.2 实现为准；
- 旧 0.1/0.2 workspace 继续兼容读取，未来迁移工具仍属于独立 change；
- 成本与并发策略由 routing/workflow profile 声明，不进入通用 core 硬编码；
- artifact type、validator 与 Gate IDs 由 converter-owned catalogs/profile 投影拥有；
- terminal 与当前生命周期状态以 run-state schema 和控制面实现为准。
