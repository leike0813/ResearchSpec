# ResearchSpec 控制面与合同架构重构：讨论决策记录

状态：实施完成，决策记录已归档
最近更新：2026-08-02

## 记录目的

本文保存本轮关于 ResearchSpec 控制面、ARSU 工作流和 change 合同的讨论结果。前半部分记录
已锁定的架构边界，文末给出具体实施计划；计划中的 DTO、命令参数和文件拆分可在实现中按
同一约束小幅调整，但不得改变已确认的所有权和唯一事实源。

文中的内容分为三类：

- **已确认决策**：后续方案必须遵守；
- **现状发现**：从 ResearchSpec 与 ARSU 当前实现中确认的事实；
- **待讨论问题**：尚未形成共识，不得据此直接实施。

## 已确认决策

### 1. `researchspec/` 是控制面与受管运行区

ResearchSpec 在用户项目中只管理 `researchspec/` 目录。该目录保存供 Agent
读取、维护和校验的研究规格、change 合同、subflow 控制记录、审计记录及
subflow 私有运行材料。

文件按是否跨越 subflow 边界分为三类：

- **控制与审计记录**：subflow 身份、route、时间、当前状态、正式 Gate、Decision、
  override 及必要的恢复信息；
- **私有运行材料**：仅服务于一个 subflow、不会被其它 subflow、稳定 specs 或
  用户直接消费的过程文件；
- **边界交付物**：会被其它 subflow、稳定 specs 或用户消费的研究资料、分析结果、
  报告、草稿、图表和最终成果。

控制与审计记录以及私有运行材料可以位于对应的 subflow 目录中。边界交付物必须
位于 `researchspec/` 之外。一个文件只要需要跨越 subflow 边界，即使它在整个研究
流程中仍属于中间产物，也应按边界交付物处理。

ResearchSpec 可以在 subflow 的直接 handoff 中记录边界交付物的路径、用途、来源和
去向，但不因此取得对文件内容的所有权，也不得擅自移动、覆盖或删除这些文件。

### 2. ResearchSpec 不规定交付物目录结构

用户项目除 `researchspec/` 外的整个仓库都可以承载边界交付物。具体目录、文件名
和工件组织方式由 Agent 根据任务、既有仓库结构、所调用 Skill 的原生要求及用户
意图判断。

ResearchSpec 可以在规格或 change 中引用这些文件的相对路径，但不得：

- 为所有 Skill 统一指定输出根目录；
- 要求边界交付物进入 `runs/current/subflows/<id>/artifacts/` 一类框架目录；
- 要求下游 subflow 通过上游 subflow 的私有工作目录读取输入；
- 仅因文件不在预设目录中就判定工作无效。

subflow 可以为私有运行材料提供受管工作区，但输出合同只能规定交付物的类型、
结构、用途和校验要求，不能规定唯一合法的交付物路径。路径引用用于帮助 Agent
找到上下文，不形成对被引用文件的管理权。

### 3. ResearchSpec 首先是一套面向 Agent 的规范化文档系统

ResearchSpec 的主要价值是让 Agent 能够稳定地读取当前研究意图、约束、来源、主张、文稿要求和拟议修改。文件本身是接口。

Agent 可以直接修改稳定 specs，只要修改后的文档满足公开结构和语义约束。change 用于在复杂、高影响或需要审阅的修改中解释意图、组织增量、暴露影响并辅助审阅；它不是修改 specs 的唯一事务入口。

CLI 和 Companion Skills 应侧重于：

- 创建和解释文档骨架；
- 根据依赖关系提示下一份工件；
- 检查结构、引用和明确的语义约束；
- 展示当前状态与尚未解决的问题。

它们不应把普通文档维护普遍转化为基于 hash、receipt、ledger 和 plan binding 的事务协议。

### 4. change、ARSU 语义与 ResearchSpec 运行时分层负责

两类合同可以同时存在，但必须按职责分开：

- ResearchSpec change 描述对控制面文档和稳定研究规格的拟议修改；
- ARSU Skill/mode 提供阶段、review sprint、revision patch 及其它学术执行语义；
- ResearchSpec-owned workflow profile 将这些语义转换为 ResearchSpec 可执行、可恢复和
  可审计的 pipeline 规则，profile 由 converter 维护而不是硬编码到 core；
- ResearchSpec 的通用 subflow 引擎保存具体执行实例的身份、状态、frontier、Gate、
  Decision、transition、恢复与审计记录；
- `academic-pipeline` 的学术方法来源于 ARSU，但其运行 profile 与具体实例属于
  ResearchSpec 合同和通用 subflow 引擎，不属于 ResearchSpec change。

解决“双重合同”问题的方向是区分“ARSU 定义应该怎样做”和“ResearchSpec 记录本次
实际怎样运行”，并删除两层之间重复的状态事实源。不得把 ResearchSpec change 当作
运行时，也不得让 ARSU 的存储载体与 ResearchSpec subflow 同时成为执行权威。

### 5. change 是项目级合同

ResearchSpec change 针对项目的稳定规格，不从属于某次 run 或 subflow，也不应因为一次执行实例结束而失去意义。

稳定 specs 只表达当前有效的研究事实与约束。候选方案、被拒绝方案、修改理由和评审过程留在 change 中，不混入当前事实。

### 6. 重新设计 change 的目标是提高内容质量和可校验性

当前自动生成的 change 内容过薄，容易退化为形式。新的设计应参考 OpenSpec，但需要吸收的是它的引导机制：

- 用工件依赖关系逐步展开问题；
- 为不同工件提供针对性的写作指令；
- 用明确的 delta 语法表达新增、修改、删除和重命名；
- 要求可验证的规范性陈述及场景；
- 让 Agent 可以随时修订已有工件，而不是把每一步封装成不可回退的事务。

结构化校验应优先检查稳定、可观察的合同语义，不锁定大段文案、标题措辞或字段顺序。

### 7. ARSU revision patch 是唯一稿件 patch 合同

ARSU `academic-paper:revision` 的 revision patch 是目标架构中唯一的稿件 patch 合同。
其规范源是 converter-owned 的 ResearchSpec 适配合同
`src/arsu-converter/revision/contract.ts`，并投影为四个 ARSU Skill 中同一路径的
`assets/shared/contracts/patch/revision_patch.schema.json`。适配合同保留 block ID、
`old_hash`、operation ID、replace/insert/delete、annotation mapping、disposition、修订
理由和 traceability 等学术修订语义；vendor 中的原始 schema 只是转换输入，不构成并行
运行时合同。ResearchSpec core 不再维护与之
竞争的通用 Draft Patch schema 或 `submit patch`、`decide patch`、`advance patch`
生命周期，也不为稿件 patch 建立 artifact registry、receipt、独立 hash chain 或
verification state。

patch 是 ARSU revision 的工作产物，不是稿件内容或版本的运行时权威。Agent 和用户
可以手工修改稿件；Git 管理实际文件的版本与 diff。patch 中的 `old_hash` 只用于确认
某个确定性操作仍指向预期旧内容，不能扩张为通用 artifact 身份、版本登记或持续 drift
模型。若 patch 涉及 scope、claim、structure、branch 或 override 等高影响选择，应记录
该研究选择本身，而不是把“接受某个 patch ID”另造为通用 Decision。

ResearchSpec 可以随 ARSU converter 保留一套 ARSU revision 专属、可选调用且无状态的
确定性辅助工具，用于：

- 校验 revision patch 的结构和必要映射；
- 根据 block ID 与 `old_hash` 安全定位并应用操作；
- 在写入前报告 stale target、unknown block、schema error 或不完整的 annotation mapping；
- 按需把 patch 中的 annotation disposition 渲染为人类可读的修订摘要。

该工具属于 ARSU revision capability，不属于 ResearchSpec 通用 runtime。它只处理调用者
显式选择的输入、patch 和输出路径，不读取或修改 subflow `control.yaml`，不登记文件，
不生成 receipt，也不垄断稿件写入。自动应用只是安全选项，不能成为完成 revision 的
唯一合法路径。

annotation set 可以保留稳定 annotation ID 和规范化反馈，作为 revision 的明确输入，
但不再经过全局 freeze、registry、receipt 和 hash lifecycle。它若只服务当前 revision
subflow，属于私有运行材料；若需要交给其它 subflow、用户或外部 reviewer，则作为位于
`researchspec/` 外的边界交付物，并由 handoff 指向。

apply report 和 annotation resolution report 不再作为独立事实源或必备 artifact。工具
可以返回或按需落盘一份派生结果，供诊断、handoff 或用户阅读，但它不得反向决定 patch、
稿件或 Gate 的有效性。面向 reviewer 的 response to reviewers 仍是 ARSU 产生的学术
交付物，不能由机械 resolution summary 替代。

原 `revision_completeness` 中的 schema、annotation coverage 和 apply precondition 检查
降为 revision subflow 内的 mechanical precheck。正式 revision Gate 由人确认，判断当前
稿件是否充分、准确地回应了意见；它可以参考 patch、当前稿件、response to reviewers
和外部审查报告，但不得由 registry/hash/report 的机械闭合自动满足。正式结论写入该
subflow 的 `control.yaml`。

manuscript annotation 与 revision patch 共用上述适配合同中的 annotation mapping，不再
通过 Draft Patch、apply report、resolution report、registry 或 receipt 形成第二套
lifecycle。相关 converter anchors、profile、文档和稳定行为测试必须引用同一合同源。

### 8. 稳定 specs 收敛为四份研究语义合同

ResearchSpec 的 stable specs 固定为四份按研究语义分工的 current-state 文档：

```text
researchspec/specs/
  project.md
  sources.yaml
  claims.yaml
  manuscript.yaml
```

它们由 Git 管理版本，允许 Agent 和用户直接修订。四份文档是持续维护的事实容器，
不是启动研究前必须全部填满的 intake 表单；不同 Skill/mode 只检查本次确实需要的
前置内容。初始化可以创建极简骨架，尚未形成的来源、claims 或 manuscript blueprint
不应为了通过形式检查而填入占位事实。

四份文档的唯一职责如下：

- `project.md` 保存研究问题、研究对象、范围、边界、方法立场、预期贡献和长期研究
  约束。它可以有项目工作名称，但不拥有目标稿件标题、venue、引用格式或当前阶段；
- `sources.yaml` 保存已经进入项目来源集合的稳定 source ID、书目信息、标识符、来源
  类型及必要的使用范围或局限说明。它不是搜索日志、候选结果池、完整 corpus、PRISMA
  过程、adapter 输出或引用管理器的副本，也不承担综合结论；
- `claims.yaml` 保存当前认可、可以被其它文档稳定引用的 claim ID、允许的措辞与强度、
  支持来源、证据边界、限制及必要的适用范围。候选推断、完整 synthesis 论证、审稿意见
  和某次运行的临时 evidence 不进入这里；
- `manuscript.yaml` 保存已确认的目标稿件蓝图，包括目标输出类型、稿件工作标题、语言、
  受众或 venue、引用与格式要求、当前认可的 outline 及 section intent。它不保存正文、
  draft status、当前阶段、revision round、block hash、patch 状态或一次运行的报告。

同一约束只能有一个 owner：研究范围和方法限制归 `project.md`，来源自身的书目信息与
使用限制归 `sources.yaml`，主张强度、证据关系和措辞边界归 `claims.yaml`，面向稿件的
呈现、venue 和结构要求归 `manuscript.yaml`。其它 spec 通过 ID 或简短引用使用该事实，
不得复制后再各自演化。项目工作名称与稿件标题是两个概念；目标输出和输出语言默认归
`manuscript.yaml`。

stable specs 可以引用 `researchspec/` 外的路径，但该路径必须表达稳定的项目约定或
语义上下文，不能借此恢复 artifact registry。当前 draft、某轮 corpus、synthesis、
review、revision patch、response to reviewers 和其它边界交付物由 owning subflow 的
handoff 记录实际输入输出路径；私有运行材料仍留在对应 subflow。若一个稿件路径本身
确实是长期项目约定，`manuscript.yaml` 可以引用它，但不得随之维护版本、状态或 hash。

`workflow.yaml` 不再是 stable spec。route、mode graph、Gate policy、parallel/join 规则
和 revision-round template 属于 ResearchSpec-owned workflow profile；当前 stage、Gate、
Decision、parent/child 和恢复位置属于 authoritative subflow 的 `control.yaml`。profile
按第 17 项决策投影到 `researchspec/profiles/`，不得重新进入 `specs/` 或成为项目研究
事实。

stable specs 不保存 artifact ID、registry reference、普通内容 hash、receipt、runtime
status、Gate 结果、Decision 历史、draft block 或一次执行的证据链。高影响但尚未接受的
研究语义变更留在 `changes/<change-id>/`；接受后的当前事实进入相应 spec，被拒绝方案和
修改理由继续留在 change 中。

结构化校验只检查稳定合同边界，例如必要顶层结构、ID 唯一性、source/claim 引用有效性
及明确声明的跨 spec 关系。它不要求四份文档在研究早期达到相同完成度，也不锁定大段
Markdown 文案、标题措辞、字段顺序或临时内容。

### 9. 保留 authoritative subflow 与直接历史审计

ResearchSpec 保留现有 subflow 模型的核心职责，包括启动、实例身份、父子关系、
revision round、frontier、Gate、Decision、transition、恢复和历史审计。subflow 不是
可选调用日志，而是一次具体执行的运行时权威。

每个 subflow 应拥有一个稳定的机器 `instance_id`，同时使用便于人类浏览的目录名。
两者必须分离：selector、引用和幂等性依赖不可变的机器 ID，目录名只负责可读性和
文件系统排序。目录名应以启动时间开头，随后包含 Skill、mode、必要的 round 信息和
短 ID，例如：

```text
2026-08-01_14-32-18__academic-paper__revision__round-02__b18d40/
```

完整时间、时区、canonical instance ID、route、parent 和 round 信息应记录在
subflow 元数据中。目录在 subflow 启动后不得因标题、显示名称或状态变化而重命名；
精确重试必须复用原目录。

subflow 目录应成为可直接检查的历史审计单元，并容纳唯一的 `control.yaml`、轻量
`handoff.md` 和私有运行材料。Gate、Decision、override、transition 和当前状态不得再
分散到全局 state、ledger 或 receipts 中。

### 10. ARSU 保留学术语义并选择性改造执行载体

ResearchSpec 不全面重写 ARSU。Converter 必须保留 ARSU 的学术工作流语义、质量
约束、阶段纪律、review sprint、revision traceability 和 patch discipline。只有当上游
协议与 authoritative subflow、私有运行材料/边界交付物划分、agent-neutral 行为或
ResearchSpec 唯一事实源直接冲突时，才改造其路径、状态载体、脚本假设和集成方式。

适用原则包括：

- ARSU 的阶段顺序、角色隔离、blind review、review sprint 和修订追踪语义默认保留；
- `phase*_*/` 可以作为 subflow 私有工作区中的内部组织方式，但不得成为跨 subflow
  输入输出合同；
- 跨 subflow 的结果必须产出到外部边界交付物路径，并通过控制面引用衔接；
- revision patch 的 block ID、old hash、operation 和 traceability 纪律应保留，其合同
  所有权、文件分类、应用工具及与 annotation 的关系由第 7 项决策规定；
- 上游固定脚本、hook、平台和目录假设应转换为 agent-neutral 的能力与校验要求；
- 不对 ARSU-derived 内容进行与本次边界无关的广泛语义清理。

Material Passport 的目标归属由第 12 项决策规定。

### 11. Git 管理交付物版本，subflow 只保存轻量 handoff

ResearchSpec 不维护边界交付物的全局 artifact registry、artifact ID、版本 catalog、
持久化项目级索引、普通文件 SHA binding、持续 drift 状态或全局 verification state。
这些机制会重复 Git 的版本管理职责，并把流动的研究材料误塑造成由 ResearchSpec
管理的固定运行时对象。

每个 subflow 应在自己的控制目录中保存一份面向人类和 Agent 的直接 handoff，说明：

- 本次实际接收了哪些输入路径、用途，以及在适用时来自哪个上游 subflow；
- 本次向外交付了哪些路径、用途，以及预期由谁继续使用；
- 交接所需的少量说明、限制和未决问题。

handoff 是路径导航和历史说明，不是文件 catalog。它不为文件分配全局身份，不追踪
版本链，不声明隐式 `latest`，不拥有文件生命周期，也不要求所有交付物服从统一类型
枚举或目录结构。私有运行材料不进入 handoff，也不能被其它 subflow 当作接口使用。

Git 负责已纳入版本控制的交付物及控制文件的版本、diff、历史、分支和回滚。
ResearchSpec 不要求所有外部文件已经提交到 Git，也不在文件未被跟踪时另造 SHA
registry 补齐版本历史。是否将交付物纳入 Git，由用户和所在项目决定。

外部路径后来缺失或内容发生变化，不会使既有 subflow 历史失效，也不会阻断整个
workspace。只有当前动作确实需要读取该路径时，才进行局部可用性检查，并在不可用时
要求 Agent 或用户重新定位输入。`status`、handoff 汇总或其它项目级视图只能按需从
subflow 记录临时生成，不保存为第二套权威索引。

仅当某一具体协议本身依赖 hash 才保留 hash，例如 revision patch 的 base/old hash 和
发布与供应链完整性校验。此类 hash 留在所属协议中，不推广为通用 artifact 管理机制。普通
start、Gate、Decision 和 transition 不使用 plan hash、receipt hash 或其它通用控制面
hash；未来若某一不可逆命令确实需要 preview binding，应按该命令单独论证。

### 12. `academic-pipeline` 采用 ResearchSpec-owned profile，并取消原生 Material Passport

ResearchSpec 将 `academic-pipeline` 作为第一方 pipeline profile 管理。ARSU converter
继续保留并提供学术阶段、质量约束、review、integrity、revision、checkpoint 和默认
playbook 语义；ResearchSpec-owned profile 将这些语义接入 authoritative subflow，
ResearchSpec 独占实例生命周期、当前恢复位置、正式 Gate、Decision、transition、
completion 和用户可见审计。

ResearchSpec-native pipeline 不保留 Material Passport 文件、Schema 9、专用 runtime
state 或 `resume_from_passport=<hash>` 协议，也不新建 `pipeline-case.yaml` 一类替代性
单体状态文件。吸收 Passport 的含义是让它承担的全部语义在 ResearchSpec 合同中找到
唯一归属，不是把上游 monolithic schema 原样搬入 `researchspec/`。

原 Passport 概念按以下所有权拆分：

| 原 Passport 概念 | ResearchSpec 中的唯一归属 |
| --- | --- |
| `origin_skill`、`origin_mode`、`origin_date` | subflow 启动元数据 |
| stage tracker、当前阶段和 checkpoint | subflow `control.yaml` |
| `reset_boundary[]` | 不迁移；恢复由 subflow checkpoint/resume 负责 |
| `pending_decision`、branch、override | Decision 事实源 |
| `verification_status`、`integrity_pass_date` | 对应 Gate 的有效结果 |
| `compliance_history`、audit 结果 | Gate/audit 记录和其指向的外部报告 |
| `version_label`、普通 `content_hash` | 不迁移；交付物版本由 Git 管理 |
| 上下游交付物及路径 | subflow `handoff.md` |
| 已接受的文献来源 | `sources.yaml` |
| 临时候选 corpus、筛选材料 | 当前 subflow 的私有运行材料或外部输入 |
| 已接受的 claims、限制和证据关系 | 对应稳定研究合同 |
| claim intent、未完成的审计聚合 | 当前 subflow 的私有运行材料 |
| experiment intake、branch 或其它人类选择 | Decision；改变稳定研究含义时再进入 change/specs |
| experiment alignment 和其它完整性结论 | Gate evidence 与外部报告 |
| style、citation、terminal policy 等长期约束 | 对应稳定 research/manuscript 合同 |
| 只服务当前 pipeline 的临时上下文 | subflow 私有运行材料 |

具体稳定字段归属遵循第 8 项决策；不得把候选内容、临时检查结果或运行状态为了消灭
Passport 而提前提升为稳定项目事实。

`handoff.md` 是面向用户、Agent 和下一会话的轻量上下文说明，可以列出当前 checkpoint、
下一步建议、关键外部路径、未决问题及最近 Gate/Decision 的导航信息。它是直接审计与
阅读入口，但不得复制完整 state、Gate、Decision、claims、corpus 或报告，也不得成为
可独立修改的第二运行时。

同一 workspace 的暂停和跨会话恢复通过 authoritative subflow `control.yaml`、私有
运行材料和 handoff 完成。文件在会话之间发生变化时，按当前 Git 工作树和
下一阶段的正常检查处理，不建立通用 hash drift 阻断。跨 workspace 时，接收方基于
共享的 Git 项目、稳定 specs、必要交付物和发送方 handoff 启动自己的新 pipeline
subflow；发送方历史不能自动满足接收方的 Gate、Decision 或 completion。

旧 ARS Schema 9 Passport 不进入 ResearchSpec-native runtime，也不提供导入、只读迁移
adapter、projection 或兼容恢复入口。ResearchSpec 不复制 Passport，不从中导入
Gate/Decision，不恢复旧 run，也不据此自动启动或推进新的 subflow。

### 13. 每个 subflow 的 `control.yaml` 是唯一运行权威

每个 authoritative subflow 在自己的目录中保存一份 `control.yaml`。它是该实例身份、
route、parent、round、当前 status/checkpoint、正式 Gate、局部 Decision、override 和
transition 的唯一控制事实源。ResearchSpec 的运行操作负责维护该文件；ARSU Skills
只生产学术语义、报告和建议，不直接改写运行权威。

`control.yaml` 保存当前控制状态以及少量不可从普通文件位置推断的正式记录：

- subflow 的启动确认、暂停、恢复、取消和完成；
- 当前 checkpoint 或 stage；
- 已经由人确认的 formal Gate 结论；
- failed Gate 的显式 override；
- scope、claim、structure、branch 和 override 等高影响 Decision；
- parent、round 及必要的 child 关系。

它不记录普通 Agent 操作、exploration、临时诊断、artifact 版本、文件 verification
state、普通 action 的 attempt、完整 Gate 报告副本或为事务重放而设计的逐步写入历史。
ResearchSpec 不建立项目级 Gate ledger、Decision ledger、通用 event journal、可重放
event-sourcing runtime 或持久化项目状态索引。项目级 `status`、history 和 discovery
按需扫描各 subflow 的 `control.yaml`、handoff 及 change 文件临时生成。

正式 Gate 只有在人类确认后才写入 `control.yaml`。记录至少包含 Gate 名称、`pass`、
`pass_with_conditions` 或 `fail`、确认人、时间、简短结论，以及必要时指向 handoff 中
审查报告的 role/path。同一 Gate 重新验证时可以增加新的正式 attempt；失败结论不得
被静默改写为通过。若用户决定在 failed Gate 后继续，必须在同一 Gate 记录下增加包含
批准人、时间和理由的显式 override，并保留原失败结论。

Decision 与其治理对象放在一起：subflow branch、局部 review strategy 和 Gate override
写入 owning subflow 的 `control.yaml`；change 的接受、拒绝或延期写入对应
`changes/<change-id>/`；accepted 后的当前研究事实进入 stable specs。普通探索、工具
选择和临时执行顺序不建立 Decision，也不建立全局 Decision 汇总。

transition 只更新 owning subflow 的 `control.yaml`，不生成独立 transition receipt。
普通 start、Gate、Decision 和 transition 均不产生 receipt 文件、receipt hash、plan
hash 或多文件 authority transaction。CLI 应通过单文件原子写和当前状态检查保证局部
一致性；未来若不可逆、多文件、非交互命令确实需要 preview binding，必须按该命令
单独论证，不能恢复为通用 runtime 协议。

跨 subflow 的硬前置条件直接读取来源 subflow 的 `control.yaml` 和 `handoff.md`：前者
确认来源实例的当前完成状态或必要 Gate，后者定位所需交付物 role/path。下游不得复制
上游 Gate、Decision 或状态作为自己的权威，也不得通过全局 ledger 或 artifact ID
间接解析。

Git 负责 `control.yaml`、handoff 和其它已跟踪文件的版本、diff 与历史。`control.yaml`
内部保留 Gate attempts、Decision 和 override 是为了直接表达领域审计事实，不是为了
替代 Git 建立通用版本或事件系统。

### 14. change 采用自适应文档包，不再充当可执行补丁事务

ResearchSpec change 用于需要解释、审阅或明确决定的项目级研究语义变化。普通、低风险
修改可以直接编辑 stable specs；change 不是修改四份 specs 的唯一入口，也不应为每次
编辑自动创建。需要 change 时，目录采用以下自适应结构：

```text
researchspec/changes/<change-id>/
  change.md       # 唯一必备
  design.md       # 条件性
  tasks.md        # 条件性
  delta.yaml      # 条件性
```

`change.md` 是该 change 的主要事实源。它至少通过简短 frontmatter 表达 `id`、`status`
和 `targets`，并在正文中说明修改背景、拟采用方向、边界或非目标、面向目标 spec 的语义
delta、影响，以及接受、拒绝、延期或替代的结论。具体标题措辞不构成合同；校验只要求
这些语义角色可以被 Agent 和用户清楚识别。

`targets` 只能引用 `project.md`、`sources.yaml`、`claims.yaml` 和 `manuscript.yaml` 中
实际受影响的 stable specs。框架 profile、CLI 或 converter 的产品开发变更使用本仓库的
开发流程，不伪装成用户项目的 research change；subflow 运行事实也不进入 change。

change 可以使用以下状态：

- `draft`：仍在形成内容；
- `proposed`：已经具备审阅所需信息；
- `accepted`：方向已获确认，但不表示 stable specs 已经更新；
- `applied`：相关 stable specs 已直接更新并通过当前稳定合同校验；
- `rejected`：提议未被接受；
- `deferred`：决定明确延期；
- `superseded`：由另一 change 或后来决定替代。

状态可以直接编辑，也可以由未来保留的 CLI/Companion 便利操作维护，不建立不可回退的
状态机。需要人类确认的高影响 change，应在 `change.md` 的 acceptance 内容中记录确认人、
时间和简短理由。该记录与被治理的 change 放在一起，不再写入全局 Decision ledger。

`accepted` 与 `applied` 必须分开：前者只表示同意方向，不触发 CLI 自动改写 specs；
后者表示实际 current-state 文档已经由 Agent 或用户修改。Git diff 是精确的文件变化记录，
change 负责解释为什么修改、准备修改什么以及如何确认。ResearchSpec 不再生成或消费
`contract-patch.yaml`，也不要求 `current_value`、target hash、artifact ID、Decision ID、
apply receipt、plan hash 或 preview/execution binding。

条件性工件按实际复杂度出现：

- `design.md` 只在引入或改变领域概念、影响多份 stable specs、存在实质替代方案，或涉及
  迁移与兼容取舍时需要；它说明背景、目标与非目标、关键决定、理由、拒绝方案和风险；
- `tasks.md` 只在变更需要多个步骤、跨人或跨 Agent 交接、代码与文档联动，或存在可独立
  验证的里程碑时需要；单纯研究语义编辑不机械生成任务清单；
- `delta.yaml` 只在批量新增、更新或删除 sources/claims 等结构化记录，使纯 Markdown
  难以清楚审阅时使用。它表达记录级 add/update/remove，作为审查和校验辅助，不是可执行
  transaction patch，也不拥有写入顺序；
- 小型影响分析直接放在 `change.md`。ResearchSpec 不把独立 `impact.md` 设为通用必备
  工件；复杂影响可以在 `design.md` 中展开。

change 校验只覆盖稳定、可观察的文档边界：change ID 与目录安全、合法状态、targets、
必要语义内容，以及可选 `delta.yaml` 的结构、ID 和基础引用。`applied` change 还要求其
目标 stable specs 本身通过校验。校验器不判断研究论证是否充分，不要求 Markdown delta
能被无歧义自动应用，也不检查精确文案、字段顺序、Git commit、target hash、registry、
receipt 或 ledger。

`propose`、`decide` 和 `archive` 的最终命令边界由第 15 项决策规定。它们只能作为创建
模板、维护 owning 文件中的状态/确认内容或整理已解决目录的便利入口。直接编辑 change
同样合法；命令不能重新成为 change 的唯一权威，不能在接受时自动应用 specs，也不能
通过外部 ledger、receipt 或 hash 证明 change 生命周期。

### 15. CLI 收敛为十六个命令，四个 Companion Skills 保持分工

ResearchSpec 的目标公开 CLI 删除 `submit`，保留以下十六个顶层命令：

```text
init      update      plugin
status    instructions list       show
start     decide      advance
check     handoff     pack        doctor
propose   archive
```

删除 `submit` 是语义清理，不提供同义 alias。旧 `submit` 同时承担 artifact、annotation、
patch、evidence、Gate 和 attempt 事务；这些职责已经分别退出或归入明确 owner。外部输入
输出路径进入 `handoff.md`，人类 Gate/Decision 由 `decide` 写入 owning 文件，状态转换由
`advance` 完成。不得在其它命令中重新建立 submission candidate、attempt record、artifact
registration 或 receipt lifecycle。

CLI 按四类文件权限工作：stable specs、change package 和 `handoff.md` 允许 Agent/用户
直接编辑，CLI 提供便利操作与校验；subflow `control.yaml` 只能由 ResearchSpec CLI 修改；
外部交付物由 ARSU Skill、Agent 或用户在所选项目路径中创建。命令不得把可直接编辑的
文档变成只能经 CLI 变更的事务对象。

十六个命令的目标职责如下：

- `init` 创建四份 stable specs 的极简骨架、必要配置、subflow/change 目录和已选择的
  静态 Skill 投影；它不创建全局 state、registry、ledger 或 receipt；
- `update` 只在当前 workspace 格式内更新 ResearchSpec 维护的静态模板、Skills、profiles
  和插件投影。它不覆盖用户 research contracts，也不迁移旧 runtime 或旧 schema；
- `plugin` 管理 ResearchSpec 维护的静态 domain plugin 安装与说明，不改变 workflow
  authority，不使用通用 plan hash；
- `status` 按需扫描四份 specs、各 subflow `control.yaml`、handoff 和 changes，给出当前
  可见摘要，不保存项目级索引或 history projection；
- `instructions` 根据用户 selector、profile、本地 control、相关 specs 与 handoff 返回
  下一步所需的角色、输入、输出、前置条件和人类确认点，不返回 action-basis、plan hash
  或 receipt identity；
- `list` 与 `show` 浏览 subflows、changes、local Gates/Decisions、handoffs 和 diagnostics，
  不恢复 artifacts、receipts 或全局 ledger 集合；
- `start` 在用户确认 Skill、mode、前置条件、交付物、正式 Gates 和成本后，创建按时间排序
  的 subflow 目录及其 `control.yaml`，记录不可变 instance ID、profile、route、parent、
  round 和必要的上游 handoff 引用；
- `decide` 将人类确认写入被治理对象：change 的接受、拒绝、延期或替代写入 `change.md`，
  subflow 的 Gate、branch 和 override 写入该实例的 `control.yaml`。它不自动改 specs、应用
  patch、推进状态或写全局 Decision 记录；
- `advance` 只依据 owning subflow 的 profile、`control.yaml`、必要 Decision/Gate 和 handoff
  角色，将本地 status/checkpoint 转换到下一个合法位置。它不扫描、登记或校验外部文件
  内容，也不生成 transition receipt；
- `check` 校验四份 specs、profile、subflow control、change 和 handoff 的结构、稳定 ID、
  交叉引用与明确合同约束，不检查外部交付物的版本、hash 或全局 runtime 闭合；
- `handoff` 为指定 subflow 创建、更新、渲染或检查轻量 `handoff.md`。它处理用户/Agent
  显式给出的 role、type、path 和必要说明，不复制或拥有外部文件，也不修改 control 状态；
- `pack` 只打包所选范围内的 ResearchSpec 配置、stable specs、profile 信息、control、
  change 和 handoff 文档。外部交付物只保留路径引用，subflow 私有 `work/` 和外部文件
  字节均不进入默认包；
- `propose` 创建 adaptive change 目录与 `change.md` 骨架，并在用户明确需要时创建条件性
  工件。它不要求严格 JSON payload，不绑定 hash，也不写全局状态；
- `archive` 只整理处于 resolved 状态的 project change。它不归档 ARSU revision patch，
  也不检查 registry、receipt 或 ledger；
- `doctor` 只读诊断 workspace 配置、静态安装、profile 可用性和文件结构。若未来允许修复，
  也只能重建可确定派生的静态文件，不得猜测或重写研究语义、Gate、Decision 或 control。

subflow 的最小公开协议因此为：

```text
status / instructions
        ↓
start
        ↓
ARSU Skill / Agent 产生外部交付物，并维护 handoff
        ↓
verify + 人类确认
        ↓
decide
        ↓
advance
```

ResearchSpec 保留四个 Companion Skills，不合并其责任：

- `researchspec-navigate` 解释 route、resume、context 和 export，将用户意图映射到 profile、
  subflow、handoff 与 ARSU producer；
- `researchspec-propose` 帮助形成高影响 research change 及必要的条件性工件，不生成可执行
  contract patch；
- `researchspec-decide` 保持“提出方案”和“人类同意”分离，在确认后调用或指导 `decide`
  把结论写入 owning `change.md` 或 `control.yaml`；
- `researchspec-verify` 执行确定性检查并组织语义审阅所需上下文，可以提出 Gate 建议，但
  不能自行形成正式人类确认；正式结论通过 `decide` 写入本地 control。

四个 Companion 和十六个命令都不得依赖全局 frontier、artifact registry、receipt、plan
binding、全局 Gate/Decision ledger 或 Material Passport。该目标表面取代现行十七命令及
`status -> instructions -> start/submit/advance -> status` 协议；实现时必须同步更新 canonical
user model、command catalog、wrappers、Skill projection、帮助文档和用户旅程测试。

### 16. 开发期采用不兼容硬切，不提供旧 workspace 迁移

ResearchSpec 当前仍处于开发阶段，目标实现只支持本轮重构后的 current workspace 合同。
旧 `0.1`/`0.2` workspace、strict runtime、adaptive CaseState、`runs/current` 全局状态、
artifact registry、ledgers、receipts、旧 Draft Patch lifecycle 和 Material Passport import
均不属于受支持输入。实现不提供自动迁移、原地升级、side-by-side cutover、legacy mode、
只读兼容 parser、migration report、rollback 或旧运行恢复。

硬切是兼容政策，不是删除授权。CLI 遇到已存在且不符合 current schema 的
`researchspec/` 时，只报告 unsupported workspace format 并停止；它不得覆盖、移动、清理、
归档或尝试修复旧目录，也不得读取旧 artifact payload 来推断新合同。开发者若需要保留
旧内容，应先自行使用 Git、复制或重命名目录，再在空位置执行新的 `init`。

新的 `init` 只创建 current workspace；目标目录非空或含未知内容时遵守 create-only 与
不覆盖原则。`update` 只处理同一 current workspace 格式中的 ResearchSpec-owned 静态内容，
不提供 `--migrate-runtime`、`--migrate-workspace` 或等价入口。`doctor` 和 `check` 可以识别
“不是当前格式”并给出错误，但不得继续解析旧 state、registry、ledger、Passport 或 patch
来提供兼容性诊断。

旧 workspace 中的四份 specs、交付物或历史若仍有价值，由开发者或用户在框架外人工审阅
和取用。ResearchSpec 不自动复制 specs，不把旧 subflow 恢复为新 `control.yaml`，不把旧
Gate/Decision/change 转换为新记录，也不搬运 `runs/current/subflows/*/artifacts`。重新使用
旧材料时，应在 fresh current workspace 中按普通输入和 handoff 规则重新建立上下文。

实现时应直接删除旧迁移与兼容分支，并把 fixtures、文档和用户旅程测试改写为 current-state
only。验证边界是 fresh `init`、current-format `update`、新 subflow/change 旅程，以及旧或
未知 workspace 被安全拒绝；不保留用于证明旧 runtime 仍可运行的兼容测试。

### 17. `academic-pipeline` profile 投影到项目内

ResearchSpec 发布侧维护 `academic-pipeline` profile 的生成源和转换规则；`init` 将其当前
投影写入项目内的 `researchspec/profiles/academic-pipeline.yaml`。该文件是用户和 Agent
可以直接查看的项目运行合同，明确列出 entry、默认 child、顺序与并行规则、join、正式
Gate、branch、override policy 和动态 revision-round template。Pipeline 不得依赖只存在于
安装包、生成器内部或某个 Agent host 投影中的隐藏流程配方。

项目内 profile 是发布侧 SSOT 的受管投影，不是第二份手工维护的产品定义，也不是 stable
research spec。`tool-installation-manifest.json` 记录其安装归属；`update` 只能按当前 workspace
合同更新 ResearchSpec 维护的静态投影，并遵守生成文件的 drift 与不覆盖规则。用户研究
意图、来源、claims 和稿件要求仍分别归四份 stable specs，具体实例状态仍只归各自的
`control.yaml`。

`status`、`instructions`、`start`、`advance`、`check` 和 `pack` 在需要 pipeline 语义时读取
该项目投影。subflow control 记录所选 profile 身份与 route，使历史实例可以说明自己按哪份
项目合同启动，但不得复制整个 graph 或把 profile 内容改写为实例权威。Profile 缺失、结构
无效或与受管安装状态矛盾时应阻断依赖它的新动作，并由只读检查报告问题；CLI 不猜测或
静默重建学术流程语义。

### 18. Pipeline parent 的启动确认不授权任何 child

`academic-pipeline` parent 的启动确认只授权创建和运行 parent 实例。它允许 CLI 建立
pipeline 的控制上下文、读取项目内 profile 并暴露下一 checkpoint，但不构成对当前或未来
任何 child subflow 的批量授权。每个 child 在创建前都必须单独向用户展示 Skill/mode、实际
前置输入、预期外部交付物、formal Gates、成本和必要的角色边界，并取得新的明确确认。

该规则同时适用于 profile 的默认 children、条件性 children、editorial branch 产生的
revision/re-review、后续动态 round 和最终 format-convert。Parent control 与 child control
分别保存各自的启动确认；不得把 parent confirmation、既有 sibling confirmation、profile
默认顺序或 `advance` 推进解释为 child consent。Domain plugin 安装同样使用独立同意，不能
与 parent 或 child 路线确认合并。

恢复同一个已确认 child 的原实例时，只要 Skill/mode、范围、成本、Gate 和 branch 没有改变，
不重复请求启动确认。改换 mode、增加 child、选择新的 branch、创建下一 revision round，或
实质改变前述摘要时，必须重新确认。用户拒绝 child 只会使 parent 停留在相应 checkpoint；
不得预创建 child、伪造完成状态或越过 profile 要求的 Gate。

## 已确认的现状发现

### 1. 强制 subflow 输出路径来自 ResearchSpec

ARSU 上游没有通用 `subflow` 概念。当前生成的 ARSU Skills 被 ResearchSpec 注入了 `ResearchSpec Contract Preflight`，要求 Agent 服从 CLI 返回的 selector、obligation 和 output descriptor。

ResearchSpec 工作流目录进一步为输出生成
`runs/current/subflows/{subflow_instance_id}/artifacts/...` 模板。因此，Agent
只在 subflow 目录内写文件，是 ResearchSpec 转换层造成的行为，不是 ARSU
原生约束。

ARSU 部分模式确实使用 `phase*` 目录或特定 patch 文件，但这些是 Skill
内部协议，与外层 ResearchSpec subflow 目录不是同一个概念。

### 2. ResearchSpec 当前替换了 ARSU 的一部分原生状态语义

现有转换不只是在 ARSU 外增加导航。它把 ARSU Material Passport 和 state
tracker 降为非权威导入材料，再以 ResearchSpec 的 subflow、frontier、
obligation、Gate 和 ledger 作为运行权威。

这造成了两套执行合同同时存在。新的方向并不删除 ResearchSpec subflow 权威，而是
要求 ARSU 保留学术语义、ResearchSpec 保存具体实例状态，并逐项消除两层之间重复的
状态事实源。

### 3. Material Passport 不是所有独立调用的固定输出

Material Passport 主要服务于跨阶段交接、恢复和 `academic-pipeline`。
ARSU 上游的 `academic-pipeline` 当前会维护 Passport；承担明确 handoff 或跨会话恢复
职责的独立运行也可能生成它。普通 standalone mode 不应仅因被调用就自动生成
Passport，ARSU 中还存在明确禁止写 Passport 的咨询性模式。目标架构将这些 pipeline
语义吸收到 ResearchSpec-owned profile 和合同中，不再让生成后的 ResearchSpec Skills
维护 Passport。

### 4. OpenSpec 的内容质量并非来自严格事务

OpenSpec 默认通过 `proposal → specs/design → tasks` 的工件依赖图、专门的
artifact instructions 和规范化 delta grammar 引导 Agent。其 delta specs
要求使用 ADDED、MODIFIED、REMOVED、RENAMED 等操作，规范性要求使用
MUST/SHALL，并配套 WHEN/THEN 场景。

OpenSpec 允许随时修改已有工件。它的结构约束和引导强于事务封装；这与
ResearchSpec 作为规范化文档系统的方向一致。

## 决策状态

本轮识别出的架构级待决项已经全部锁定。具体 DTO、schema 字段、命令参数和实施拆分仍需
在实施方案中细化，但不得重新引入已排除的全局 registry/ledger、
receipt/hash 事务、Material Passport、通用 Draft Patch、`submit` 或旧 workspace 兼容层。

## 后续讨论约束

authoritative subflow、subflow 私有运行材料、外部边界交付物、Git 版本管理和轻量
subflow handoff 已经确定，不再把删除或降级 subflow、恢复 artifact registry 或建立
通用 SHA binding 作为默认方向。但后续方案也不得只替换一个输出路径模板：必须重新
设计交付物选择、引用和跨 subflow 消费方式，并分别判断 contract change 和 ARSU
anchor replacement 的职责与唯一事实源。ResearchSpec 不再恢复通用 Draft Patch
生命周期；全局 Gate/Decision ledger、通用 event journal 和独立 runtime receipt 也不
进入目标架构。ResearchSpec-native pipeline 不再恢复 Material Passport 或建立替代性
monolithic case 文件。

实施时不得启动与已确认边界无关的大范围 ARSU 重写。ARSU 改造应限于保留学术语义
所需的载体适配，并由完整的 anchor 与影响盘点约束范围。旧 runtime、迁移和兼容语义
不得写入新的公开 schema 或 current-state Skill 指令。

## 具体实施计划

### 计划定位与交付策略

本次重构使用一个仓库级 OpenSpec change 管理，建议 change ID 为
`redesign-control-plane-and-contracts`。这里的 OpenSpec change 服务于 ResearchSpec
产品开发，与目标 workspace 中的 `researchspec/changes/<change-id>/` 研究 change
不是同一种对象。

整个改造按一个不可拆分的目标版本交付。下面的阶段表示开发依赖顺序，不构成 strict、
adaptive、新旧 schema 并存的发布方案，也不允许用 feature flag 暂时保留旧运行时。
中间提交可以只供开发分支编译和测试，最终可发布状态必须一次满足全部 current
workspace 合同。

实施依据按以下优先级使用：

1. 本文 18 项已确认决策；
2. `docs/researchspec_user_usage_rehearsal.md` 及其七份分册中的目标态旅程；
3. 本计划冻结的 DTO、文件所有权和命令边界；
4. 当前代码只用于确认影响面和复用可靠实现，不用于反向覆盖目标决策。

当前没有阻塞性产品决策。实现中采用以下非架构性约定：

- current workspace 的顶层 `schema_version` 统一从 `"1"` 起步；
- 时间使用带 UTC offset 的 RFC 3339 字符串，目录名前缀使用启动地本地时间；
- machine selector 只使用不可变 `instance_id`、change ID、Gate ID 和 Decision ID，
  不使用目录名、文件名相似度或“最近一个”推断；
- 保留 `write-plan.ts` 作为原子文件写入和受管静态投影 drift 保护的内部设施，但删除其
  面向普通 runtime 的 plan-hash/receipt 协议；
- 现有 JSON envelope、退出码和 `--json` 保持为公开 CLI 基础合同，删除其中只服务旧
  transaction identity 的字段。

实施依赖如下：

```text
OpenSpec 产品规格与目标 DTO
            ↓
current workspace loader / validator
            ↓
subflow control + profile + handoff + change
            ↓
status / instructions / start / decide / advance
            ↓
ARSU converter、Companion、revision helper
            ↓
文档、打包、全量用户旅程验收
            ↓
删除旧 runtime 与残留事实源
```

### 目标文件布局

fresh `researchspec init` 只创建以下 ResearchSpec-owned 基础结构：

```text
researchspec/
  config.yaml
  tool-installation-manifest.json
  profiles/
    academic-pipeline.yaml
  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
  changes/
  subflows/
```

启动实例后才创建：

```text
researchspec/subflows/
  <started-at>__<skill>__<mode>[__round-NN]__<short-id>/
    control.yaml
    handoff.md
    work/
```

`changes/archive/`、subflow 私有 `work/` 的子目录及其它派生目录按需创建。初始化不得创建
`runs/`、`playbooks/`、`draft-patches/`、registry、ledger、receipt、attempt 或全局
handoff。

### 目标合同与 DTO

#### 1. Workspace 与 stable specs

`config.yaml` 只保存 workspace 格式身份、Agent tool 选择和 plugin 选择。删除 runtime
profile mode；`academic-pipeline` profile 始终作为受管静态投影存在。

四份 stable specs 使用独立 schema，并按下面的 owner 校验：

| 文件 | 最小稳定字段 | 明确禁止的字段 |
| --- | --- | --- |
| `project.md` | frontmatter 中的 `schema_version`、`project_id`、可选项目工作名称；正文中的研究问题、范围、边界、方法立场、预期贡献和长期约束 | 稿件标题、venue、引用格式、stage、run、Gate、artifact/hash |
| `sources.yaml` | `schema_version`、唯一 `source_id`、书目信息、identifier、source type、可选 use scope/limits | 搜索日志、候选池、完整 corpus、综合结论、runtime 状态 |
| `claims.yaml` | `schema_version`、唯一 `claim_id`、wording、strength、supporting source IDs、scope、limits | 临时推断、完整 synthesis、review finding、artifact identity |
| `manuscript.yaml` | `schema_version`、`manuscript_id`、output type、working title、language、audience/venue、citation/format requirements、outline 和 section intent | 正文、draft status、round、block hash、patch/Gate/runtime 状态 |

结构化 YAML 使用 strict schema，允许明确声明的扩展容器，不允许任意顶层字段悄悄形成第二
owner。`project.md` 只校验 frontmatter、非空语义内容和稳定引用；不锁定标题文案或章节顺序。
跨 spec 校验只覆盖 source/claim/section 等稳定 ID。

#### 2. `academic-pipeline` profile

`researchspec/profiles/academic-pipeline.yaml` 使用 `PipelineProfileSchema`，至少包含：

- `schema_version`、`profile_id`、`profile_version`；
- `entries`：end-to-end 与 mid-entry 的入口 checkpoint；
- `children`：node ID、route ref、前置 node/Gate/branch、multiplicity 和 round role；
- `parallel_groups` 与 join policy；
- `gates`：Gate ID、owner node/checkpoint、required/conditional policy、允许的 verdict；
- `branches`：Decision ID、选项和每个选项解锁的 checkpoint/child；
- `transitions`：from/to、所需 child completion、Gate 和 branch；
- `override_policy`；
- `revision_round_template`：revision、re-review、继续下一轮和退出条件。

Profile 不含具体实例、交付物路径、artifact 类型登记、receipt、hash 或 stable research
facts。发布侧源文件和 converter 是 SSOT；项目文件是 manifest-owned projection。manifest
为它增加 `framework-profile` source kind 和项目级 generated ownership。普通 `update`
遇到 profile drift 时报告并保留，只有显式 `--force` 才覆盖。

#### 3. Subflow `control.yaml`

`SubflowControlSchema` 采用以下字段：

```yaml
schema_version: "1"
instance_id: sf-<uuid-or-sortable-id>
route_ref: academic-paper:revision
skill_id: academic-paper
mode_id: revision
profile:
  id: academic-pipeline
  version: "1"
  path: profiles/academic-pipeline.yaml
parent:
  instance_id: sf-...
  node_id: revision-round
round: 1
started_at: 2026-08-01T14:32:18+08:00
start_confirmation:
  confirmed_by: <human>
  confirmed_at: <rfc3339>
  prerequisites: [...]
  expected_outputs: [...]
  formal_gates: [...]
  cost:
    effort: high
    interaction: iterative
status: active
checkpoint: revise
gates: []
decisions: []
transitions: []
```

字段规则：

- `profile` 和 `parent` 对 standalone root 可为 `null`；pipeline parent 和 child 必须与项目
  profile 匹配；
- `round` 只在动态 round child 上出现；
- status 固定为 `active`、`paused`、`blocked`、`complete`、`cancelled`；
- Gate 保存按时间追加的 attempts。每个 attempt 包含 verdict
  (`pass`/`pass_with_conditions`/`fail`)、human confirmer、时间、简短 summary 及可选的
  handoff role/path evidence；
- failed-Gate override 嵌在对应 Gate 下，保存独立 Decision ID、批准人、时间和理由，
  不复制到另一份 ledger；
- `decisions` 只接受 scope、claim、structure、branch 这四类局部选择；Gate override 由
  Gate 内部结构唯一拥有；
- `transitions` 只记录 formal checkpoint/status 变化，不记录普通工具调用、attempt、
  artifact 写入或可重放事件；
- child 的 `parent` 是 parent/child 关系事实源。父实例不维护一份同步 children 列表；
  `status` 按需扫描 child controls 生成反向视图；
- CLI 对 control 使用“读当前字节 → 校验当前状态 → 临时文件 → 原子 rename”的单文件写入。
  不生成 plan hash、receipt 或外部 ledger。

#### 4. `handoff.md`

每份 subflow handoff 使用可机器读取的 YAML frontmatter 和自由 Markdown 说明：

```yaml
---
schema_version: "1"
subflow_instance_id: sf-...
updated_at: 2026-08-01T16:00:00+08:00
inputs:
  - role: research-report
    type: report
    path: research/urban-heat/research-report.md
    purpose: manuscript drafting
    source_instance_id: sf-...
outputs:
  - role: current-manuscript
    type: manuscript
    path: paper/manuscript.md
    purpose: independent review
    intended_consumer: academic-paper-reviewer
---
```

每条记录还可包含 `limits` 和简短 notes。role 在同一 inputs/outputs 集合中唯一。边界交付物
路径必须是项目内、`researchspec/` 外的安全相对路径；CLI 不分配 ID、不保存 hash、不检查
Git tracked 状态。全局 `status` 和普通 `check` 只校验 handoff 结构；只有当前
`instructions` 动作声明消费某个 role 时，才检查该路径此刻是否可读。

#### 5. Project change

`change.md` frontmatter 使用：

```yaml
---
schema_version: "1"
id: narrow-causal-claim
status: proposed
targets:
  - claims.yaml
  - manuscript.yaml
decision:
  outcome: accepted
  decided_by: <human>
  decided_at: <rfc3339>
  reason: <brief reason>
---
```

`decision` 只在 resolved 状态出现，并按 outcome 约束必需字段。`accepted` 不改 specs；
Agent/用户完成实际编辑且目标 specs 通过校验后，才将状态更新为 `applied`。

`delta.yaml` 只允许 `add`、`update`、`remove` 三类记录级操作，目标限于 sources/claims，
并校验 ID、重复项、add collision、update/remove existence 和基础跨引用。它没有执行器。
`design.md`、`tasks.md` 和 `delta.yaml` 的出现条件由 `propose` 模板选项和 Companion 指引
控制；validator 不机械要求每个 change 都有这些文件。

#### 6. ARSU revision patch 与 annotation

ResearchSpec-owned 的适配 ARSU `revision_patch.schema.json` 是唯一 patch schema，其规范源
为 `src/arsu-converter/revision/contract.ts`，由 converter 投影到四个 ARSU Skill。仅
`academic-paper` 投影 Skill-local 无状态 helper；helper 接受显式 `base`、`patch`、
`output` 和可选 report path，执行完整预检后一次性原子写 output。
helper 只返回 schema error、unknown block、stale `old_hash`、annotation mapping 缺失和应用
摘要；任何失败都不得产生部分稿件。

annotation intake 保留 stable annotation ID、raw feedback、normalized interpretation 和 patch
mapping，但路径迁入 owning revision subflow 的 `work/annotation-intake/`。删除 frozen set、
registry record、submit receipt、apply report/resolution report 必备关系。若 annotation set
需要跨边界使用，Agent 将其写到 `researchspec/` 外并在 handoff 中引用。

revision mechanical precheck 直接读取显式 manuscript、patch 和 annotation set 路径；它不读取
workspace snapshot 或 control，也不形成 formal Gate。`revision_completeness` 的人类结论仍
通过 `decide gate:<instance>/<gate>` 写入 owning control。

### 目标 CLI 参数与 selector

目标命令仍是第 15 项决策中的十六个顶层命令。参数按下表收敛：

| 命令 | 目标参数/行为 |
| --- | --- |
| `init [path]` | 保留 `--tools`；删除 `--profile`。create-only 建立 current workspace、project profile 和静态 Skill/wrapper 投影 |
| `update [path]` | 保留 `--tools`/`--force`；删除 migrate、rollback 和 expected-plan 选项，只更新 manifest-owned static content |
| `status` | 扫描 specs、profile、controls、handoffs、changes；返回 active/recent instances、pending Gates/Decisions/changes 和 diagnostics |
| `instructions <selector>` | 支持 `route:`、`subflow:`、`gate:`、`decision:`、`change:`、`handoff:`；返回当前前置、实际 handoff roles/paths、输出约束、确认点和允许动作，不返回 action basis/plan/receipt identity |
| `start <route-ref>` | 使用仅含语义输入的 `--input <start.yaml|json>`、`--confirmed-by`；input 可含 parent instance、entry point、round、实际 prerequisite refs 和 planned output refs |
| `decide <selector>` | Gate 使用 `--verdict`，change 使用 `--decision`，branch 使用 `--choice`，override 使用 `--override --reason`；统一要求 human actor/confirmation |
| `advance <subflow-selector>` | 可选 `--transition <id>`；无歧义时由 profile/control 计算下一 checkpoint。pause/resume/cancel 使用明确 lifecycle transition |
| `check [target]` | target 收敛为 `all/specs/profiles/subflows/changes/handoffs/tools/plugins/literature-adapters`；删除 artifacts/runtime transaction 检查 |
| `list [type]` | 支持 `subflows/changes/gates/decisions/handoffs/profiles/tools/diagnostics`；history 是扫描 control 后的派生视图 |
| `show <selector>` | 精确显示上述对象或四份 stable specs；不支持 artifact/receipt/attempt/case-action |
| `handoff <subflow-selector>` | 创建/更新/渲染/检查该实例 handoff；接受显式 semantic input，直接编辑仍合法 |
| `pack` | 默认只含 config、manifest、profile、stable specs、controls、changes、handoffs；增加 bounded scope 选择，删除 `--include-artifacts` |
| `propose <change-id>` | 以 `--targets` 和可选 `--with design,tasks,delta` 创建骨架；删除 strict proposal payload、action basis 和 plan hash |
| `archive <change-id>` | 只处理 `applied/rejected/deferred/superseded` project change |
| `doctor` | 只读诊断 current workspace 与受管静态投影；删除 runtime repair 和 expected-plan 参数 |
| `plugin ...` | 保留精确 preview、独立 consent 和 drift 保护；删除通用 `plan_sha256` binding。非交互写入使用显式 domain IDs 与 `--yes` |

保留全局 `--dry-run` 用于展示实际文件操作，但其输出不再产生可回放 transaction identity。
`--force` 只允许覆盖 manifest-owned generated projection 或明确的派生 pack 输出，不能覆盖
stable specs、control、handoff、change 或外部交付物。

### 阶段 0：建立开发 change 并冻结公开合同

目标：在写实现前，让仓库级 OpenSpec specs 与本文一致。

任务：

1. 创建 `openspec/changes/redesign-control-plane-and-contracts/`，包含 `proposal.md`、
   `design.md`、`tasks.md` 及相关 delta specs。
2. 更新 `framework-core`、`cli-interface`、`arsu-run-usage`、
   `arsu-user-model-acceptance`、`arsu-user-routing`、`arsu-workflow-profiles`、
   `subflow-instance-control-plane`、`gate-transition-control-plane`、
   `contract-change-proposal`、`manuscript-annotation-system`、
   `manuscript-annotation-intake-adapters`、`companion-skills`、
   `agent-surface-model`、`agent-tool-delivery`、`domain-skill-plugin-registry`、
   `help-documentation-system` 和 `mvp-release-readiness`。
3. 从 `artifact-submit`、`case-obligation-control-plane`、
   `material-passport-import`、`runtime-recovery` 中删除已退出产品的 requirements；
   若 capability 已无剩余职责，archive change 时删除对应主 spec。
4. 在 design 中直接收录本计划的 schema ownership、selector、hard-cut 和生成物边界，
   不再另写兼容路线。
5. 同步更新仓库级 `AGENTS.md` 中与公开命令数、workspace 布局、运行时权威、
   strict/adaptive、`submit`、registry/ledger、receipt/hash 和 migration 相关的当前产品
   口径，避免后续实施 Agent 继续遵循已被本 change 取代的旧约束。

阶段验收：

- `openspec validate --change redesign-control-plane-and-contracts` 通过；
- delta specs 中没有 `submit`、registry/ledger、receipt/hash transaction、
  Material Passport、strict/adaptive 或 migration 的目标要求；
- 用户旅程中的 16 个命令、四个 Companion 和 parent/child 独立确认均有规范性场景。

### 阶段 1：重建 current workspace 与合同层

新增文件：

- `src/core/contracts/workspace-format.ts`：workspace/config 版本与 unsupported-format
  判定；
- `src/core/contracts/stable-specs.ts`：四份 stable specs DTO 和跨引用；
- `src/core/contracts/pipeline-profile.ts`：项目 pipeline profile；
- `src/core/contracts/subflow-control.ts`：control、Gate attempt、Decision、override、
  transition；
- `src/core/contracts/subflow-handoff.ts`：handoff frontmatter；
- `src/core/contracts/project-change.ts`：adaptive document package 和 delta；
- `src/core/contracts/control-selector.ts`：目标 selector 集合；
- `src/core/runtime/workspace-index.ts`：只读扫描 specs/profile/subflows/handoffs/changes，
  不保存 projection。

修改文件：

- `src/core/workspace/layout.ts`：只生成目标目录、四份空骨架和 profile；
- `src/core/workspace/snapshot.ts`：改为 current workspace index，删除 runtime mode 分支；
- `src/core/workspace/discover.ts`：区分 missing/current/unsupported；
- `src/adapters/installations.ts`、`src/adapters/workspace-delivery.ts`：登记并更新 profile
  projection；
- `src/core/validation/check.ts`、`src/core/validation/types.ts`：按新 target 和跨引用规则
  校验；
- `src/core/contracts/runtime-protocol.ts`：仅保留仍有价值的分页/diagnostic DTO，并迁到
  query contract 后删除原 transaction 命名。

实现要求：

- `init` 对不存在的目标 create-only；对非空未知目录和旧 workspace 一律安全停止；
- `status/check/doctor/update` 在识别 unsupported format 后不继续解析旧文件；
- 早期空 sources/claims/manuscript content 是合法状态；
- profile 缺失、invalid 或 manifest ownership 不一致时阻断依赖 profile 的新动作；
- workspace 扫描以 control 中的 machine ID 建索引，检测重复 ID、目录逃逸和 symlink。

最小测试：

- 重写 `tests/cli.test.ts` 的 fresh init 与安全拒绝用例；
- 将 `tests/case-contracts.test.ts` 重写为 current contract schema/SSOT 测试；
- 保留并扩展 `tests/write-plan.test.ts`，只验证 static projection drift 与原子写；
- 删除 `tests/strict-compatibility.test.ts` 和 `tests/runtime-migration.test.ts`。

### 阶段 2：实现通用 authoritative subflow 引擎

修改或替换：

- 重写 `src/core/runtime/subflow-control.ts`，集中实现 start、pause/resume/cancel、Gate
  confirm/reverify、branch/override Decision 和 advance；
- 重写 `src/core/runtime/workflow-control.ts`，只负责 profile + controls + handoffs 的
  frontier 计算；
- 重写 `src/core/runtime/query.ts`，按需生成 status/list/show/history；
- 将 `src/core/runtime/gate-transition-control.ts` 的仍有价值校验并入
  `subflow-control.ts` 后删除该文件；
- 将 `src/core/runtime/lifecycle.ts` 的 change 职责移入阶段 3 的 change module，删除
  patch/ledger/receipt 分支；
- 将 `src/core/runtime/artifact-path.ts` 替换为 `boundary-path.ts`，只做显式项目路径安全
  与 `researchspec/` 边界检查。

关键顺序：

1. start 校验 route/profile 和父实例当前 checkpoint；
2. 生成 canonical instance ID 与一次性目录名；
3. 写 `control.yaml`、空 `handoff.md`，最后建立可选 `work/`；
4. child start 必须有自己的 confirmation payload，不能复用 parent confirmation；
5. Gate/Decision 每次只更新 owning control；reverification 追加 attempt；
6. advance 只读取直接依赖 child controls 与 handoff roles，随后原子更新 owning control；
7. 动态 revision round 从 profile template 计算下一 round，创建前仍返回新的 start
   confirmation requirement。

不得预创建 child，亦不得把 handoff 建立、外部文件存在或 producer 完成声明当作 Gate。

最小测试：

- 重写 `tests/subflow-control.test.ts`：目录名/machine ID 分离、retry 复用、parent-child
  引用和独立确认；
- 重写 `tests/gate-transition-control.test.ts`：Gate attempts、challenge、override、
  branch 与 advance 分离；
- 重写 `tests/workflow-control.test.ts`：pipeline frontier、parallel/join 和动态 round；
- 删除 `tests/adaptive-case-runtime.test.ts`、`tests/runtime-protocol.test.ts` 和
  `tests/runtime-recovery.test.ts`；
- 测试只通过 fresh packaged CLI 修改 control，不直接写 authority 文件。

### 阶段 3：实现 handoff、change、查询与 pack

修改或新增：

- 重写 `src/core/runtime/handoff.ts`：按 subflow 创建、更新、渲染和结构校验；
- 重写 `src/core/runtime/pack.ts`：按 scope 打包，不遍历 `work/` 或外部路径；
- 新增 `src/core/runtime/change-documents.ts`：scaffold、parse、status update、archive；
- 重写 `src/core/runtime/query.ts` 的 list/show projection，移除 artifacts、attempts、
  case-actions 和全局 ledger；
- 重写 `src/core/validation/check.ts` 的 change/handoff/profile cross-reference；
- 重写 `src/core/contracts/contract-change.ts` 为
  `src/core/contracts/project-change.ts` 后删除原文件。

change 接受流程固定为：

```text
propose 建文档骨架
  → Agent/用户编辑 change
  → decide 记录 accepted/rejected/deferred/superseded
  → Agent/用户直接编辑 stable specs
  → check specs
  → change 标记 applied
  → archive（可选）
```

CLI 不自动应用 `delta.yaml`，也不比较 spec hash。Archive 只移动 resolved change 目录，
发现目标冲突或用户修改时停止。

最小测试：

- 重写 `tests/contract-change.test.ts`，覆盖条件性工件、accepted/applied 分离、
  direct spec edit 和 resolved-only archive；
- 在 `tests/cli.test.ts` 覆盖 handoff role/path、按需路径检查、pack 排除规则和
  list/show/status 的无写副作用；
- 不对完整 Markdown 文案、标题、字段顺序或 ZIP entry 顺序之外的实现细节做脆弱断言。

### 阶段 4：收敛 CLI、Companion 与静态投影

修改：

- `src/cli/command-catalog.ts`：删除 `submit` 和旧选项，落实十六命令；
- `src/cli/main.ts`：删除 submit 注册，接入新 start/decide/advance/handoff/propose 参数；
- `src/cli/handlers.ts`：拆出 bootstrap、query、subflow、change、handoff、plugin handler，
  避免继续扩张单一大文件；
- `src/cli/execution-guard.ts`：删除；
- `src/cli/handbook.ts`、`src/cli/presenter.ts`、`src/cli/validation.ts`：删除 transaction
  identity 文案与 schema；
- `src/core/runtime/action-availability.ts`、`action-descriptor.ts`、
  `availability-facts.ts`、`transaction-result.ts`：用轻量
  `instructions`/frontier projection 替代后删除；
- `src/adapters/command-renderer.ts`、`src/adapters/delivery.ts`、
  `src/adapters/tools.ts`：将 wrapper 数量与命令说明更新为十六；
- `src/plugins/instructions.ts` 和 plugin handlers：移除 plan-hash binding，同时保留
  manifest hash、exact preview、用户 consent 和 drift 保护。

`src/cli/handlers.ts` 应按 owner 拆分为 `handlers/bootstrap.ts`、`query.ts`、
`subflow.ts`、`change.ts`、`handoff.ts`、`plugins.ts`，顶层只装配依赖和统一错误。
这一拆分同时删除 strict/adaptive/submit 分派，避免在新结构上保留旧条件分支。

更新四个 Companion 源：

- `src/adapters/companion/shared-guidance.ts`；
- `src/adapters/companion/workflows/navigate.ts`；
- `src/adapters/companion/workflows/propose.ts`；
- `src/adapters/companion/workflows/decide.ts`；
- `src/adapters/companion/workflows/verify.ts`。

Companion 明确允许普通 stable spec 和 change/handoff 直接编辑；禁止手改 control。
Verify 只提出 verdict，Decide 写 Gate；Propose 只建/完善文档包；Navigate 按 profile、
control 和 handoff 路由。

最小测试：

- 更新 `tests/adapters.test.ts`、`tests/skill-harness.test.ts` 和
  `tests/domain-skill-plugins.test.ts`；
- CLI catalog 精确断言十六个顶层命令且不存在 `submit`；
- plugin 测试断言 preview/consent/drift，而不再断言 `plan_sha256`；
- `doctor` 测试改为只读、unsupported workspace 和 damaged control 诊断。

### 阶段 5：收敛 revision patch 与 annotation intake

新增：

- `src/arsu-converter/revision/contract.ts`：ARSU revision patch 的唯一 typed view；
- `src/arsu-converter/revision/markdown-blocks.ts`：从 core 移入的 block parser/hash 逻辑；
- `src/arsu-converter/revision/apply.ts`：纯函数式 validate/apply；
- `src/arsu-converter/revision/apply-revision-patch.mjs`：投影到 Skill 的自包含、无第三方
  运行依赖入口。

修改：

- `src/core/contracts/annotation.ts`：删除 artifact ID、freeze、receipt 和 resolution report
  lifecycle 字段；
- `src/annotation-intake/contracts.ts`、`paths.ts`、`session.ts`、`sources.ts`、
  `review-copy.ts`、`review-delta.ts`、`interpretation.ts`：改用 revision subflow work root
  和显式 manuscript path；
- `src/core/runtime/annotation-target.ts`、`annotation-provenance.ts`：只保留局部 target 和
  raw-input 完整性检查；
- 将 `src/core/runtime/markdown-blocks.ts` 的实现迁入 ARSU revision 模块后删除；
- 删除 `src/core/runtime/annotation-lifecycle.ts`、`annotation-coverage.ts` 和
  `patch-lifecycle.ts`；
- 删除 `src/core/contracts/draft-patch.ts` 及 artifact registry 中的 apply/report/
  annotation record variants。

生成结果：

- `skills/arsu/academic-paper/assets/shared/contracts/patch/revision_patch.schema.json` 保持
  patch 合同 SSOT；
- 新增 `skills/arsu/academic-paper/scripts/apply-revision-patch.mjs`；
- revision Skill 与 reviewer cross-skill references 只说明显式输入/输出和可选 helper，
  不要求 ResearchSpec patch lifecycle。

最小测试：

- 将 `tests/manuscript-annotation.test.ts` 重写为 annotation ID、raw preservation、
  interpretation 和 patch mapping 行为；
- 保留并调整 `tests/manuscript-annotation-intake-adapters.test.ts`；
- 新增或重命名为 `tests/arsu-revision-patch.test.ts`，覆盖 valid apply、stale hash、
  unknown block、mapping incomplete 和 failure-no-output；
- 删除 `tests/artifact-submit.test.ts` 与 `tests/material-passport-import.test.ts`；
- 测试只断言结构化错误码、输出是否产生和最终稿件语义片段，不锁定完整 report 文案。

### 阶段 6：重做 ARSU profile、anchors 与生成物

修改 converter 源：

- `src/arsu-converter/workflow/catalog.ts`：删除 strict/adaptive、obligation、work item
  output template 和 artifact completion；输出 standalone route control metadata 与
  `academic-pipeline` profile；
- `src/arsu-converter/workflow/artifact-contracts.ts`：改名或改义为 boundary deliverable
  contracts，只保存 type、结构、用途和校验要求；
- `src/arsu-converter/workflow/generate.ts`：生成发布侧 profile source 和项目投影内容；
- `src/core/workflow/profiles/arsu-v0-1.generated.ts`：替换为 current
  `academic-pipeline` generated projection；
- `src/arsu-converter/contracts.ts`：升级 preflight marker/profile，重写 mutation ownership、
  required contracts 和 runtime guidance；
- `src/arsu-converter/routing/contracts.ts`、`catalog.ts`、
  `navigation-projection.ts`：将 prerequisites 从 artifact ID 改成 spec/handoff role，
  保留 25 modes、2 entries、Gate policy、risk 和 cost；
- `src/arsu-converter/anchors/contract-anchors.json` 及
  `src/arsu-converter/anchors/replacements/{ARTIFACT,CLAIM,DECISION,GATE,HANDOFF,IO,PATCH,REVIEW,SOURCE,STATE}-*.md`：
  逐项替换旧控制面 anchor；
- 必要时调整 `anchors/types.ts`、`replace.ts`、`coverage.ts` 和 `validate.ts`，让 coverage
  检查针对新 owner，而非搜索并禁止上游所有历史文字。

生成而不手改：

- `skills/arsu/**`；
- `skills/arsu/researchspec-contracts.json`；
- `skills/arsu/routing-catalog.json`；
- `skills/arsu/conversion-manifest.json`；
- `skills/arsu/anchor-replacement-report.md`。

Anchor 盘点必须覆盖 manuscript annotation 与 Draft Patch v3 的整条旧链：
command、schema、converter anchor、profile、Companion、文档和测试同步改完。只改
`researchspec-contracts.json` 或一组 replacement 不算完成。

最小测试：

- 重写 `tests/arsu-workflow-profiles.test.ts` 和 `tests/arsu-routing-catalog.test.ts`；
- 更新 `tests/arsu-anchors.test.ts`、`tests/arsu-converter.test.ts`；
- 运行 `pnpm arsu:anchors:check`、`pnpm arsu:check`、`pnpm arsu:idempotence`；
- 对 25 modes 和 2 entries 做表格驱动检查，确认 route summary 均包含 prerequisites、
  boundary outputs、formal Gates、risk/cost 和独立启动确认；
- 不因未改造的 upstream history/version 文本失败，只对注入的 current runtime 指令和
  实际 anchor replacements 执行旧权威残留检查。

### 阶段 7：删除旧实现并同步 current-state 文档

确认新 CLI 与 converter 测试通过后，删除以下旧合同：

- `src/core/contracts/action-selector.ts`；
- `src/core/contracts/adaptive-runtime.ts`；
- `src/core/contracts/artifact.ts`；
- `src/core/contracts/case-control.ts`；
- `src/core/contracts/case-profile.ts`；
- `src/core/contracts/case-state.ts`；
- `src/core/contracts/decision.ts`；
- `src/core/contracts/draft-patch.ts`；
- `src/core/contracts/gate-transition.ts`；
- `src/core/contracts/material-passport.ts`；
- `src/core/contracts/run-state.ts`；
- `src/core/contracts/runtime-migration.ts`；
- `src/core/contracts/runtime-recovery.ts`；
- `src/core/contracts/runtime-selector.ts`；
- `src/core/contracts/workflow.ts`。

删除以下旧 runtime；若其中有可复用的纯函数，先迁入新 owner：

- `src/core/runtime/adaptive-case-control.ts`；
- `src/core/runtime/adaptive-case-transactions.ts`；
- `src/core/runtime/artifact-submit.ts`；
- `src/core/runtime/gate-authority.ts`；
- `src/core/runtime/material-passport-import.ts`；
- `src/core/runtime/runtime-context.ts`；
- `src/core/runtime/runtime-migration.ts`；
- `src/core/runtime/runtime-observation.ts`；
- `src/core/runtime/runtime-receipt-integrity.ts`；
- `src/core/runtime/runtime-recovery.ts`；
- `src/core/runtime/strict-compatibility.ts`；
- `src/core/runtime/transaction-result.ts`；
- 所有仅服务旧 registry/receipt/attempt/patch lifecycle 的辅助分支。

更新 current-state 文档：

- 复核阶段 0 已更新的 `AGENTS.md`，确保最终代码、规范和项目级约束一致；
- `README.md`；
- `docs/arsu_user_usage_model.md`；
- `docs/cli_interface_design.md`；
- 由 catalog 生成的 `docs/cli_handbook.md`；
- `docs/arch_design_proposal.md`、`docs/contract_schema_design.md`、
  `docs/arsu_workflow_contract_design.md`、`docs/prd_proposal.md`；
- `docs/arsu_contract_anchor_audit.md`、`docs/manuscript_annotation_adapters.md`、
  `docs/domain_skill_plugins.md`；
- `docs/researchspec_arsu_runtime/` 下的 core/runtime/四个 workflow 文档及 diagrams；
- `docs/researchspec_user_usage_rehearsal.md` 与七份分册，只在实现参数最终确定后修正命令
  拼写和 schema 示例，并把状态升级为验收基线。

删除 `docs/researchspec_arsu_runtime/strict_runtime_protocol.md`、
`adaptive_runtime_protocol.md`、旧 strict/adaptive diagrams 和
`docs/archive/agent_runtime_protocol_recovery_development_guide.md`。Git 历史已经保存这些
设计；公开/current 文档不继续携带兼容说明。

同步 `package.json` 的 packaged docs、`scripts/generate-docs.mjs` 和
`scripts/verify-package.mjs`。发布校验只创建 fresh current workspace；删除 strict init、
migration/rollback、artifact submit、Passport 和 receipt 恢复旅程。

### 阶段 8：用户模型验收与发布前清扫

重写 `tests/arsu-user-journeys.test.ts` 和 `tests/helpers/arsu-journey.ts`，以
`docs/researchspec_user_usage_rehearsal*` 为场景基线。至少覆盖：

1. fresh init、空 specs 合法、旧/未知 workspace 安全拒绝；
2. standalone route summary、用户拒绝不写文件、确认后只创建一个 subflow；
3. 外部交付物由 producer 写到 instructions/用户选择的路径，handoff 记录后下游按 role
   消费；
4. formal Gate 由 Verify 建议、用户确认、Decide 写 control、Advance 独立推进；
5. parent confirmation 后不存在 child；每个 child、新 branch 和新 round 分别确认；
6. mid-entry 不读取 Passport/registry/receipt，不继承旧 Gate；
7. change accepted 与 applied 分离，普通 stable spec edit 无需 change；
8. revision helper 无状态，手工修稿仍是合法路径；
9. status/list/show/check/doctor 和失败路径不产生文件；
10. pack 排除外部交付物和所有 `work/`；
11. plugin/Zotero 操作不改变 control/frontier；
12. resume 精确复用 machine instance ID，目录名不参与 selector。

测试遵守 packaged CLI acceptance boundary。测试 helper 可以创建 producer 外部文件和
semantic CLI input，但不得直接写 control、Gate/Decision、隐藏索引或其它权威记录。

完整验证顺序：

```text
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm docs:check
pnpm arsu:anchors:check
pnpm arsu:check
pnpm arsu:idempotence
pnpm release:verify
```

最后对 ResearchSpec-authored source、Companion、anchor replacements、公开文档和测试做
有界残留搜索，逐项清除控制面含义上的：

```text
submit
runs/current
artifact-registry
decision-ledger
gate-ledger
attempt-ledger
receipt / action basis / plan hash
Material Passport
draft-patches
adaptive / strict / migrate-runtime
```

搜索结果中的论文投稿 `submission`、manifest/release integrity hash、revision
`old_hash`、Git 历史说明和未改造的上游 ARSU 原文不属于误报即删；必须按语义逐项判定。

### 分阶段完成标准

| 里程碑 | 可验收结果 |
| --- | --- |
| M1：合同冻结 | OpenSpec change 校验通过，workspace/profile/control/handoff/change DTO 无双重 owner |
| M2：workspace hard cut | fresh init 只生成目标树，旧/未知 workspace 在所有入口安全停止 |
| M3：subflow runtime | standalone 与 pipeline 都只靠 profile、control、handoff 推进；parent/child 分别确认 |
| M4：文档工作流 | stable specs 可直接编辑，change/handoff 可直接编辑且 CLI 只提供便利与校验 |
| M5：revision 收敛 | ARSU patch 是唯一 patch 合同，annotation/patch helper 无 registry/receipt/runtime 副作用 |
| M6：Agent surface | 四个 ARSU、四个 Companion、七个 Zotero Skills 和十六 command wrappers 一致 |
| M7：清扫完成 | 旧 runtime 源、测试、公开文档和生成指令已删除，完整验证全部通过 |

### 风险控制

- **控制文件并发写入**：所有 control mutation 带当前字节 precondition 并原子 rename；
  冲突返回可重试错误，不创建 receipt。
- **project profile drift**：manifest 只记录静态投影所有权；drift 阻断依赖它的新动作，
  不影响既有 control 的历史可读性。
- **目录名与 ID 混用**：索引建立时强制 instance ID 唯一，所有 selector/ref 只接受
  machine ID。
- **跨 subflow 输入漂移**：只在当前消费者需要读取时检查路径；失败只阻塞该动作，不回写
  上游历史。
- **Converter 范围失控**：先完成 anchor coverage 清单，再改 replacements；禁止对无关
  ARSU history/version 文本做广泛清理。
- **旧代码被间接保留**：最终 TypeScript import graph、CLI help、generated Skills、
  package verification 和 residual search 必须共同证明旧 runtime 已不可达且不再发布。
- **测试膨胀**：优先改写现有稳定行为测试；相似 route/Gate 用表格驱动，只为 patch
  fail-closed、单文件 authority 和 hard-cut 安全拒绝保留专门回归用例。

### 最终 Definition of Done

只有同时满足以下条件，实施 change 才能 archive：

- fresh packaged CLI 只接受 current workspace，公开顶层命令精确为十六个；
- 四份 stable specs、项目 profile、每个 subflow control、每个 handoff 和每个 project
  change 都有唯一 owner；
- 所有 runtime mutation 都只落在 owning `control.yaml`，没有全局 state/ledger/receipt；
- 边界交付物始终位于 `researchspec/` 外，跨 subflow 只通过 handoff role/path；
- `academic-pipeline` graph 在项目 profile 中可见，parent 和每个 child 分别确认；
- ARSU revision patch helper 可选、无状态、fail-closed，手工改稿不被框架阻断；
- converter-generated Skills、Companion、CLI help、canonical docs 和目标态用户旅程使用同一
  current contract；
- 所有最小验证及完整发布验证通过，且没有未说明的旧控制面残留。
