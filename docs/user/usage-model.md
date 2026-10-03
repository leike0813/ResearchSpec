# ResearchSpec 用户使用模型

## 先记住这张图

ResearchSpec 从研究者想完成的任务出发。默认路径是“表达目标 -> 调用能力 -> 交付成果 -> 保存必要进展”；只有需要正式流程控制时才启动能力图：

```text
研究目标
  -> Navigate 发现并调用适用能力
  -> 普通工作：交付项目文件，持续任务用普通笔记保存进展
  -> 需要 Gate/Decision、parallel/join、轮次或审计：确认入口并冻结 graph
       -> 按 node 执行能力；CLI 记录 run、node、Gate 和 Decision
```

这里有三个容易混淆的角色：

| 角色 | 负责什么 |
| --- | --- |
| 用户与宿主 Agent | 对话、选择入口、确认成本和关键决定、执行语义工作 |
| Procedures | 按激活包读取必要输入，产出论文、报告、评审等项目文件 |
| ResearchSpec CLI | 唯一负责 run、node、Gate、Decision 和 graph transition 的持久化 |

ResearchSpec 不调用 Agent API，不替代用户选择的 Agent，也不接管 Zotero 或论文文件。文件就是接口。

本文是用户进入、确认、运行、恢复、验证和结束学术研究及专利工作的产品级权威。架构、CLI、schema、
Skills、converter 与验收必须与本文一致。

## 1. 初始化只准备工作区

`researchspec init` 创建 schema `"2"` workspace、投影所选 Agent 表面和 preset profiles。它不会
开始学术工作，也不会创建 run。

首次交互初始化会询问是否启用本地多语言语义发现。确认后下载约 140 MB 的模型与 tokenizer，
另加独立 CPU runtime，保存到用户缓存；项目仅保存 `procedure_search.mode`。非交互初始化默认
离线，`--yes` 本身不授权下载。显式 `init/update --procedure-search hybrid` 才准备或刷新缓存；
`offline` 使用内置检索。已有工作区省略该选项会保留选择。`--dry-run` 只预览，不下载或推理。

已核实原生项目规则的宿主还会收到简短的研究任务入口约定，用来提醒 Agent 按普通研究请求发现
Navigate。约定独立于 `skills`、`commands` 或 `both` 交付模式，并只引用实际安装的入口文件；
未核实规则路径的宿主保持现有显式发现方式。安装只证明静态投影，不能证明宿主会在真实会话中主动
触发能力。各宿主机制、路径和文档依据见[项目入口矩阵](agent-entry-matrix.md)。

```text
researchspec/
  config.yaml
  tool-installation-manifest.json
  profiles/
  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
  changes/
  runs/
```

四份 stable specs 只保存已确认的研究承诺，包括范围、主张、限制和交付要求：

| 文件 | 内容 |
| --- | --- |
| `project.md` | 研究问题、范围、边界、方法立场和贡献 |
| `sources.yaml` | 已接受来源、identifier、用途和限制 |
| `claims.yaml` | 稳定 claim、强度、证据和适用范围 |
| `manuscript.yaml` | 体裁、语言、读者、venue、结构与交付格式 |

早期 workspace 可以有空的 sources、claims 或 manuscript。不要为了通过检查编造占位事实。

候选研究问题、暂定观点和草稿提纲留在 `researchspec/` 外的普通工作文件中，可自由迭代。候选内容
成为已确认承诺，或已确认承诺发生改变时，经 `propose -> decide -> 实际修改 specs -> archive` 完成。
`accepted` 只代表用户接受方案；stable specs 修改并通过检查后，change 才能成为 `applied`。

## 2. 从一个入口按需选择 Procedure

用户通常直接描述研究目标，不必先记 CLI 或内部 selector。模糊、跨能力、恢复、解释和导出请求
先交给 `researchspec-navigate`。Navigate 先做三阶段披露，不把完整程序提前塞入 Agent catalog：

```text
list procedures --query <意图> --json
  -> show procedure:<id> --json
  -> instructions procedure:<id> --json
```

`list` 只返回紧凑卡片，`show` 返回单项元数据，`instructions` 才加载完整 Procedure、资源引用和
激活包。发现可以在 workspace 外只读执行；激活要求当前 schema 2 workspace。

卡片同时说明当前工作区是否满足静态选择条件、是否需要选择插件域，或选中域是否不可用。
这些信息辅助选择，不代表安装 consent 或完整执行许可；激活时仍核对当前契约。

Navigate 首次检索直接提交用户原始请求，保留中文、英文或混合语言，并按用途及声明的输入输出角色
判断候选。没有合适候选时，最多改写一次。离线检索使用 Unicode 分词、内置中英概念词表和字段
加权 BM25；hybrid 再融合本地多语言向量排序。精确 ID 优先。结果说明匹配依据、请求和实际检索
方式及回退原因；排序相似度不能证明能力适用。空白、标点或仅停用词的显式查询会报错，正常查询
无匹配返回空列表；省略查询才浏览目录。模型未就绪或推理超时自动回退离线。查询不联网、不写缓存，
`status/check/doctor` 仅静态检查；准备、缓存位置与恢复方式见[Procedure 发现](procedure-discovery.md)。

不需要正式流程控制的普通任务使用 standalone 模式，持续工作也可留在此模式：Procedure 只能写
`researchspec/` 外的普通项目文件，完成时把路径返回调用者，不创建或修改 run、node、handoff、
Gate 或 Decision。恢复普通工作不需要 graph。

普通任务遇到材料不明、文件交接或恢复时，可以按需调用只读材料检查：
`instructions procedure:<id> --input <材料.yaml>` 携带显式输入和计划输出，
`check procedure:<id> --input <材料.yaml>` 核对实际交付。材料包含可选 `inputs`、`outputs` 数组；
输入可以是 `role` 与普通项目文件 `path`，或 `role` 与内联 `value`，输出是 `role` 与 `path`。
省略数组表示未检查，空数组表示检查声明的缺项。检查只报告角色与文件事实，不判断学术充分性，
不运行包内脚本、不生成工作流状态，也不是执行前必须取得的凭证。

缺材料时只暂停依赖它的工作，说明影响并询问具体缺项；独立部分可以继续，部分成果应明确限制。
普通 Procedure 之间可以显式传递材料。没有现成角色衔接时，Agent 核对内容、解释用途与证据限制，
可用原生能力转换或继续；不能把未满足的 Procedure 契约描述为已经满足。

需要 formal Gate/Decision、parallel/join、重复轮次或可审计工作流状态时进入 graph 模式：

```text
status --json
  -> instructions profile:<profile-id> --json
  -> 选择 entry 与 entry node
```

Profile entry 是用户意图与能力图之间的正式接点。四个 ARSU 用户入口用 `route_ref` 绑定 routing
catalog；独立的扩展 profile 可以直接使用自身声明的 entry。`instructions profile:...` 会返回
route 或 profile 摘要、可选入口节点、前置条件、边界输出、Gates、Decisions 和成本提示。Agent
不能只凭相似文件名或记忆拼装入口。

固定用户可见 Agent 表面只有 `researchspec-navigate`。它的 `SKILL.md` 包含可独立执行的完整控制
流程，并按需读取同目录下由 canonical renderer 生成的 `references/cli-handbook.md` 与
`references/arsu-routes.md`。四个 ARSU 工作流、其余三个 Companion、65 个 core capability 和
plugin extensions 都属于隐藏 Procedure inventory；它们从已有 registry 即时派生，不投影进宿主
Skill catalog。可选 Zotero Adapter 仍增加七个显式 Skills。

专利工作使用相同入口和权限模型。固定能力覆盖交底、申请、docket、检索、阅读、对照表、地图、
审查意见答复和政策研究，不需要 plugin consent。五个专利 profile 可以独立运行；
`research-to-patent` 与 `patent-informed-paper` 将其与学术研究、论文写作组合。普通文件索引承载
材料与交付，Obsidian 和本地地图是可选投影。默认中国管辖区，docket 三轮预算在入口摘要中说明；
每轮继续/结束 Decision 以及所有正式 Gates 仍分别确认。具体入口和依赖见[专利任务](patent-workflows.md)。

支持项目级 custom agent 的 24 个宿主还会收到两个非入口角色：`researchspec-executor` 与
`researchspec-reviewer`。它们不增加 Skill、Command 或 Procedure，也不能自行接单；只有当前
activation packet 明确推荐相应角色时，Navigate 才考虑委派。纯 LLM 的 checker/observer 默认用
Reviewer 获得独立上下文；producer 只在隔离或并行确有帮助时用 Executor。`mixed`、`script`、
无输出参考程序和协调程序留在主 Agent。

每个 worker 只执行一个 packet，只写声明的普通输出，不能调用 ResearchSpec mutation command、
询问用户、选择模型或继续委派。它返回 Procedure hash、输出路径、检查结果和 blocker；Navigate
校验后才串行执行 `advance` 等 CLI mutation。worker 回报本身不改变 run、node、Gate 或 Decision。

## 交互式审阅交接（可选）

对 review-response 的语义工作，Agent 可以在对话之外提供一份可选的本地静态工作台：一份嵌入冻结
业务数据、可用文件地址直接打开的 HTML。它使用独立的 `revision-master-review-workspace.v1`
与 `revision-master-review-result.v1`，不改动通用 `review-workspace.v2`。工作台承载四个交接点：

- comment atomization 完成后审阅意见覆盖与遗漏；
- workboard 计划完成后审阅整块工作板；
- 执行过程中审阅当前 active 策略；
- 每个图谱轮次接近结束时审阅本轮改稿与回复。

工作台只保存浏览器本地草稿并导出建议性结果。内部确认是显式的：`coverage` 绑定完整意见映射，
`board` 绑定整块工作板，`strategy` 绑定当前策略候选及其依赖；round 只有独立的 seen 标记与反馈。
访问页面、导出结果或标记 seen 都不产生确认，实质未决反馈会让对应范围保持 pending。

结果按范围接收：Agent 用独立留存的快照校验结果，并比较每个 scope 的语义依赖与已捕获材料。
依赖未变的独立 scope 可以接收；变化、有歧义或无法评估的 scope 显示差异并继续 pending，处理
较早反馈会触发对剩余受影响范围的重新评估。语义写入与其成功处理记录在同一个任务 SQLite 事务
内提交，准备与检查保持只读，未变的重复反馈不重复写入。正式 Gate verdict 与 Decision choice
仍在对话中单独取得人工确认，并只能通过 CLI 变更；工作台不改动 graph、handoff 或
`researchspec/`。浏览器不可用时，同一审阅可在对话中按相同边界完成。

这条路径不增加入口 Skill、公开命令或图谱授权，也不改变 standalone 与 graph 的选择规则。

## 普通任务笔记

持续的普通研究工作由 Navigate 主 Agent 维护 Markdown 笔记 `work/researchspec-notes/<task-id>.md`。
笔记记录用户目标与交付期望、输入和产出文件及其用途、已完成的实质工作与证据限制、待解决问题、
下一步，以及有关联时的 run selector。达到阶段产出、遇到阻塞或结束一轮工作时更新；一次即可
完成的请求无需创建笔记。委派 worker 不写笔记；主 Agent 校验其返回的路径和产出后更新。

笔记是 `researchspec/` 外的非正式工作材料：不进入安装 manifest，`status` 和 `check` 不扫描或
校验它，CLI 也不提供 task selector。它不能用来声称 run、node 或 Gate 已完成；涉及未完成的
相关正式 run 时，应按该 run 的 status 和精确 node instructions 继续。

## 3. 一次确认授权一张冻结图

启动根 run 前，Agent 必须向用户展示 profile entry summary，至少包含：

- 选择的 route、entry 和首节点；
- prerequisites 与已确认的 handoff inputs；
- 预期边界 outputs；
- graph 中的 formal Gates 和 Decisions；
- 预计成本、外部工具与交互强度。

用户确认后，Agent 才能执行 `start profile:<profile-id>`。这次确认授权该根 run 冻结图中声明的
节点、重复轮次和绑定 child runs。它不会授权图外工作，也不会替代以下独立确认：

- 每个 formal Gate；
- 每个 graph Decision 和 failed-Gate override；
- 当前 run/node 的异模型复核；
- Plugin 安装、Adapter 访问；
- QMD 渲染时的代码执行。

根 run 的权威文件是：

```text
researchspec/runs/<run-id>/
  run.yaml
  graph.yaml
  handoff.md
  nodes/<node-instance>.yaml
```

`graph.yaml` 是启动时冻结的调度权威。Core 只解释通用节点、依赖、分支、并行/join、Gate、
Decision、轮次和 subgraph binding；任何具体研究流程都由 profile 定义。

## 4. Frontier 决定“现在能做什么”

`status` 和 `instructions` 根据 frozen graph 与 node instances 即时计算 frontier。一个节点只有在
依赖、分支、Gate、Decision、输入和交付条件满足后才会 eligible。

`instructions node:...` 会返回与 standalone 相同的 Procedure 内容和 package hash，但换成 graph
authority、已解析输入、预期输出、handoff 要求和唯一合法的 advance selector。执行节点完成后，Agent 用
`advance node:<run-id>/<node-id>[@round]` 提交声明的输出。CLI 校验 capability、输入、输出与
validator，通过后才更新 node 状态。

Eligible subgraph 节点用 `start node:<parent-run>/<node>[@round]` 创建或取得唯一 child run。
Child 继承根图授权，因此没有第二次 run-level 确认；它有自己的 frozen graph、node files 和
handoff，自己的 Gates、Decisions 与其它独立 consent 仍照常处理。

`academic-pipeline` 同时支持 end-to-end 和 mid-entry。Mid-entry 可从 `research`、`write`、
`review`、`revision`、`re-review`、`format` 或 `final-integrity` 进入；冻结图只投影所选
入口可达的切片。每个新 run 的 revision/re-review 从 round 1 开始，不继承旧 run 的状态或决定。

`deep-research:quick` 仍完成研究问题、方法、文献、质量分级、证据综合和报告六个节点，只是不设置 formal Gate；`deep-research:full` 在研究问题后保留该 Gate。写作图通过 handoff 接收注释书目和综合报告；pipeline 会把 research child 的同名输出显式交给 write child。

## 5. Handoff 连接图与真实文件

论文、报告、review、图表和数据都是 `researchspec/` 外的普通项目文件。ResearchSpec 不复制、
hash-bind 或管理它们的生命周期。每个 run 的 `handoff.md` 只记录边界交换：

- role、type、path 和 purpose；
- input 的 source run 或 output 的 intended consumer；
- 稿件 format；
- Quarto output 的 format ID 与 `renderer: quarto`。

路径必须是项目内的安全相对路径，并位于 `researchspec/` 外。只有真正消费某个 role 的动作才检查
文件是否存在和可读；只读状态检查不会遍历或复制外部内容。

节点 binding 按 role 连接生产者与消费者。Profile 可以用 `from_role` 把上游角色映射为下游角色，
因此路径不是工作流关系的事实源。

## 6. Gate、Decision 与重复轮次

Agent 或 validator 可以准备 Gate findings，verdict 必须由人确认。`decide gate:...` 将 attempt
追加到 Gate 所属 node instance。`pass`、`pass_with_conditions` 和 `fail` 都不会顺便完成节点。

Failed-Gate override 需要单独确认、理由和 Decision identity，并保存在同一个 owning node。
Graph Decision 同样逐项确认；记录 choice 后只有对应分支进入 frontier。探索笔记、普通工具调用和
日常文件修改不应伪装成 Decision。

动态 revision template 每轮实例化 revision、re-review 与 round Decision。选择继续会开启下一轮；
选择接受才解锁 format。轮次计数属于 graph runtime，Capability Skills 不能另建计数器。

## 7. Markdown、QMD 与 Quarto

首次进入稿件工作时，用户在 `manuscript.yaml.delivery` 选择 `markdown` 或 `qmd`；QMD 还需
安全的 `final_output_format`。后续改变已确认交付格式属于高影响 project change。

Markdown 与 QMD 都是 Markdown-compatible 源稿。Review、annotation 和 revision 必须保留 QMD
frontmatter、代码围栏、cell options、引用和交叉引用。

ResearchSpec 的读命令永远不探测 Quarto。宿主 Agent 在写作 intake、QMD 恢复或 format 节点前按
instructions 执行只读 `quarto --version`，再把 probe summary 随当前 start 输入记录。对于要求
Quarto 的 QMD format 节点，`available` 才能推进；未知或不可用只阻塞该节点，不阻塞前面的写作。
默认渲染为 `no-execute`，执行文档代码需另行取得当前 run/node 的 `render_consent`。

## 8. Revision patch 与 annotation

ARSU `revision_patch` schema 是唯一稿件 patch 合同。Helper 只接受显式 base、patch、output 和
可选 report 路径，先完成全部预检，再原子写出结果。Schema 错误、未知 block、stale `old_hash`
或 annotation mapping 缺失时不得产生部分稿件。

Annotation intake 是 `researchspec/` 外的普通工作材料，例如 `work/annotation-intake/`。需要跨
run 使用时，在 handoff 中声明对应路径。

## 9. 异模型复核、Plugin 与 Zotero

同模型或宿主明确继承当前模型的 worker 不新增模型 consent。若有效模型未知、不能确认继承或确属
异模型，派发前 Agent 必须说明实际模型、发送内容类别和成本，并取得只对当前 run/node 有效的确认；
没有确认就留在主 Agent 执行。异模型复核仍只使用宿主原生 subagent。主 Agent 先冻结自己的结构化
判断，只发送最少材料；分歧按证据处理，不能投票或自动覆盖。ResearchSpec 不保存模型 consent，
也不配置或调用模型服务。

Plugin consent 与根 run 确认分开。一次最多建议三个 domain，preview 展示精确 IDs；非交互安装要求
显式 IDs 与 `--yes`。拒绝或失败不能改变 selector、frontier 或原 producer。

Zotero 的 status/check 只检查静态配置和投影，不执行 runner、不联系 Zotero、不读取 credentials。
只有用户明确授权的 Adapter Skill 才能访问 library 或 Host Bridge，结果返回原 ARSU producer。

## 10. 恢复、检查、打包与结束

恢复普通工作时，Navigate 从相关任务笔记和当前材料找回目标、已完成内容与下一步；这本身不需要
graph。恢复前应核对笔记记录的材料与产出，不按笔记修改时间猜测任务。多个候选且材料不能确定
任务，或材料差异使任务身份、所需输入、下一步无法确定时，只问一个具体问题；不影响这些要素的
差异应告知用户并继续。若存在相关的未完成正式 run，应改从 `status --json` 和精确的 `run:`、`node:`、`gate:`
或 `decision:` instructions 恢复，不能用笔记替代 run 状态。已完成的历史 run 不阻止新任务
作为普通工作继续。多个候选由用户选择，Agent 不能猜“最近一个”。

`status` 的未完成 run 摘要与 `instructions run:<id>` 从当前图和记录推导入口、交付目标、可执行
selectors、待确认控制与阻塞材料。摘要辅助定位，不选择任务、不探测外部文件，也不保存额外状态。

运行 selectors 是：

- `profile:<profile-id>`；
- `run:<run-id>`；
- `node:<run-id>/<node-id>[@round]`；
- `gate:<run-id>/<gate-id>[@round]`；
- `decision:<run-id>/<decision-id>[@round]`；
- `change:<change-id>`。
- `procedure:<procedure-id>`（全局发现，workspace 内激活）。

`list` 与 `check` 还接受 stable spec、handoff 和 tool 等 inspection selector；`show` 也可展示
Procedure 卡片。机器调用必须使用命令实际声明的稳定 selector。

`list` 的 cursor 来自稳定排序后的扫描结果；同一 workspace 未变化时可重复分页。`pack` 可以按
specs、profiles、runs、changes 或单个 owner 生成有界上下文包，不复制 handoff 指向的外部文件。
`doctor` 只读诊断 schema 2 workspace、owner 文件和受管投影，不进行 migration 或语义修复。

没有 `finalize` 命令。所有选中图节点、Gates 和 Decisions 满足后，status 派生
`completion_ready`；完成状态由最后一次合法推进写入。旧或未知 workspace 会被报告为 unsupported
并保持不变。

## 11. CLI 与验收边界

公开 CLI 固定为十六个顶层命令：

```text
init        update      status      instructions
start       advance     check       list
show        handoff     pack        propose
decide      archive     doctor      plugin
```

完整参数见[生成的 CLI handbook](cli-handbook.md)。命令 wrapper 是宿主适配，不是另一套产品能力。

验收从真实打包产物启动 fresh CLI 进程，并只通过公开 CLI 执行权威 mutation。测试 helper 可以建立
instructions 要求的外部 producer 文件，不能直接写 run、node、Gate、Decision、frozen graph 或
生成 profile。最低覆盖包括 fresh init、根 entry、授权 child、全部 mid-entry、Gate/Decision、
failed-Gate override、动态轮次、安全路径、handoff 漂移、只读命令、owner pack、Plugin/Zotero
边界、按需 Procedure 激活和 Navigate-only Agent 投影。
