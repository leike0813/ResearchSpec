# ResearchSpec 用户使用模型

## 先记住这张图

ResearchSpec 把一次学术工作看成一张在启动时冻结的能力图：

```text
用户意图
  -> Navigate 检索 Procedure 卡片
  -> standalone：按需加载一个 Procedure，返回普通项目文件
  -> graph：选择 profile entry，确认后冻结 graph
            -> 按 node 加载同一 Procedure 包
            -> CLI 记录 node、Gate、Decision 和 frontier
```

这里有三个容易混淆的角色：

| 角色 | 负责什么 |
| --- | --- |
| 用户与宿主 Agent | 对话、选择入口、确认成本和关键决定、执行语义工作 |
| Procedures | 按激活包读取必要输入，产出论文、报告、评审等项目文件 |
| ResearchSpec CLI | 唯一负责 run、node、Gate、Decision 和 graph transition 的持久化 |

ResearchSpec 不调用 Agent API，不替代用户选择的 Agent，也不接管 Zotero 或论文文件。文件就是接口。

本文是用户进入、确认、运行、恢复、验证和结束 ARSU 工作的产品级权威。架构、CLI、schema、
Skills、converter 与验收必须与本文一致。

## 1. 初始化只准备工作区

`researchspec init` 创建 schema `"2"` workspace、投影所选 Agent 表面和 preset profiles。它不会
开始学术工作，也不会创建 run。

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

四份 stable specs 是长期研究事实：

| 文件 | 内容 |
| --- | --- |
| `project.md` | 研究问题、范围、边界、方法立场和贡献 |
| `sources.yaml` | 已接受来源、identifier、用途和限制 |
| `claims.yaml` | 稳定 claim、强度、证据和适用范围 |
| `manuscript.yaml` | 体裁、语言、读者、venue、结构与交付格式 |

早期 workspace 可以有空的 sources、claims 或 manuscript。不要为了通过检查编造占位事实。

普通事实可直接写入所属 spec。研究问题、范围、贡献、claim 强度或适用范围、稿件结构、关键限制
和 review-response 策略等高影响变更，经 `propose -> decide -> 实际修改 specs -> archive` 完成。
`accepted` 只代表用户接受方案；stable specs 修改并通过检查后，change 才能成为 `applied`。

## 2. 从一个入口按需选择 Procedure

用户通常描述目标，不必先记 CLI。模糊、跨能力、恢复、解释和导出请求先交给
`researchspec-navigate`。Navigate 先做三阶段披露，不把完整程序提前塞入 Agent catalog：

```text
list procedures --query <意图> --json
  -> show procedure:<id> --json
  -> instructions procedure:<id> --json
```

`list` 只返回紧凑卡片，`show` 返回单项元数据，`instructions` 才加载完整 Procedure、资源引用和
激活包。发现可以在 workspace 外只读执行；激活要求当前 schema 2 workspace。

简单、一次性、无需恢复或审计的任务使用 standalone 模式：Procedure 只能写 `researchspec/` 外的
普通项目文件，完成时把路径返回调用者，不创建或修改 run、node、handoff、Gate 或 Decision。
需要持久恢复、并行/join、正式确认、重复轮次或审计时进入 graph 模式：

```text
status --json
  -> instructions profile:<profile-id> --json
  -> 选择 entry 与 entry node
```

Profile entry 是用户意图与能力图之间的正式接点。四个 ARSU 用户入口用 `route_ref` 绑定 routing
catalog；独立的扩展 profile 可以直接使用自身声明的 entry。`instructions profile:...` 会返回
route 或 profile 摘要、可选入口节点、前置条件、边界输出、Gates、Decisions 和成本提示。Agent
不能只凭相似文件名或记忆拼装入口。

固定用户可见 Agent 表面只有 `researchspec-navigate`。四个 ARSU 工作流、其余四个 Companion、
47 个 core capability 和 plugin extensions 都属于隐藏 Procedure inventory；它们从已有 registry
即时派生，不投影进宿主 Skill catalog。可选 Zotero Adapter 仍增加七个显式 Skills。

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

异模型复核只使用宿主原生 subagent。派发前，Agent 说明实际模型、发送内容类别和成本，并取得只对
当前 run/node 有效的确认。主 Agent 先冻结自己的结构化判断，只发送最少材料；分歧按证据处理，
不能投票或自动覆盖。ResearchSpec 不保存模型 consent，也不配置或调用模型服务。

Plugin consent 与根 run 确认分开。一次最多建议三个 domain，preview 展示精确 IDs；非交互安装要求
显式 IDs 与 `--yes`。拒绝或失败不能改变 selector、frontier 或原 producer。

Zotero 的 status/check 只检查静态配置和投影，不执行 runner、不联系 Zotero、不读取 credentials。
只有用户明确授权的 Adapter Skill 才能访问 library 或 Host Bridge，结果返回原 ARSU producer。

## 10. 恢复、检查、打包与结束

新会话从 `status --json` 开始，再读取精确的 `run:`、`node:`、`gate:` 或 `decision:`
instructions。多个候选由用户选择，Agent 不能猜“最近一个”。

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
