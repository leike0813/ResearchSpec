# ARSU 用户使用模型

## 1. 权威与适用范围

本文是用户进入、确认、运行、恢复、验证和结束 ARSU 工作的唯一产品级使用模型。
架构、CLI、schema、Skill、converter、文档与验收必须与本文一致。更细的目标态旅程见
`docs/researchspec_user_usage_rehearsal.md` 及其分册。

ResearchSpec 是文件合同与控制面。它不调用 Agent API，不替代用户选择的 Agent，也不接管
Zotero、论文文件或其它外部研究材料。

## 2. 用户可见表面

固定 Agent Skill 基础表面为：

- 四个 ARSU Skills：`deep-research`、`academic-paper`、
  `academic-paper-reviewer`、`academic-pipeline`；
- 两个 Core Skills：`review-response`、`paper-humanizer`；
- 五个 Companion Skills：`researchspec-navigate`、`researchspec-propose`、
  `researchspec-decide`、`researchspec-verify`、`researchspec-cli-handbook`；
- 可选的 `zotero-library` Adapter 在用户选择后增加七个 Skills：`zotero-library-agent`、
  `zotero-library-query`、`zotero-literature-acquisition`、
  `zotero-literature-analysis`、`zotero-research-synthesis`、
  `zotero-library-curation`、`zotero-bridge-cli`。它要求 Zotero 已安装
  [Zotero-Agents](https://github.com/leike0813/zotero-agents) 插件。

可选 domain Skills 只能辅助语义工作，不能增加 Companion、CLI capability 或工作流权威。

公开 CLI 固定为十六个顶层命令：

```text
init        update      status      instructions
start       advance     check       list
show        handoff     pack        propose
decide      archive     doctor      plugin
```

命令 wrapper 是同一能力在不同 Agent host 的适配，不是独立产品能力。

## 3. Workspace 与文件所有权

`researchspec init` 先选择 Agent tools，再单独选择可选 literature Adapters；Adapter 默认不选。
非交互调用通过 `--literature-adapters <none|all|ids>` 明确选择。它只准备 workspace 和静态
Agent 投影，不启动学术工作。Fresh workspace：

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
researchspec/subflows/<instance-directory>/
  control.yaml
  handoff.md
  work/
```

所有权固定如下：

| 文件 | 唯一职责 |
| --- | --- |
| `specs/project.md` | 研究问题、范围、边界、方法立场、贡献和长期约束 |
| `specs/sources.yaml` | 用户接受的来源记录、identifier、用途范围和限制 |
| `specs/claims.yaml` | 稳定 claim、强度、支持来源、范围和限制 |
| `specs/manuscript.yaml` | 稿件体裁、标题、语言、读者、venue、格式约束、delivery 选择与结构意图 |
| `profiles/academic-pipeline.yaml` | pipeline graph、并行/join、Gate、branch、transition 和 revision round template |
| `control.yaml` | 单个 subflow 的状态、checkpoint、Gate attempts、Decision 和 transition |
| `handoff.md` | 单个 subflow 的边界输入输出 role/path |
| `changes/<id>/` | 高影响 project change 的提议、决定和应用状态 |
| `work/` | owning subflow 的私有、非权威运行材料 |

论文、报告、review、图表、数据和其它边界交付物位于 `researchspec/` 外。ResearchSpec 不给它们
分配 artifact ID，不登记 hash，不复制内容，也不建立生命周期；跨 subflow 使用 handoff 中的
安全项目相对路径。

## 4. Stable specs 的日常维护

用户与 Agent 可以直接维护四份 stable specs。早期 workspace 允许 sources、claims 和
manuscript 内容为空；检查只验证已有字段和引用，不要求编造占位事实。

普通确认事实可直接写入所属 spec。以下高影响变化先通过 project change：

- 研究问题、范围或贡献改变；
- claim 强度、因果措辞或适用范围改变；
- 稿件结构、目标输出或关键限制改变；
- review-response 策略改变研究含义。

首次进入稿件写作 intake 时，用户在 `manuscript.yaml.delivery.working_format` 选择
`markdown` 或 `qmd`；未选择时两项 delivery 字段均可为 `null`。QMD 还要确认安全的
`final_output_format` Quarto format ID。已经确认的选择不能静默转换旧稿，后续变更必须通过
project change。

Project change 的 `accepted` 只记录决定，不自动编辑 specs。实际修改完成并通过校验后，change
才能标为 `applied`。

## 5. 从对话进入工作

模糊、跨 Skill、恢复、解释和导出请求先进入 `researchspec-navigate`。用户明确指定 ARSU Skill
或 mode 时，可以直接路由，但仍必须执行相同的 prerequisite 检查和 route summary。

`paper-humanizer:review` 是独立只读诊断子流；`paper-humanizer:full` 是交互式去 AI 化子流，
只在最终候选验收时使用 `paper-humanizer-acceptance` Gate。两者不属于
`academic-paper` 或 `academic-pipeline` 的动态 child。

启动前，Agent 必须向用户汇总：

- Skill 与 mode；
- stable-spec 和 handoff prerequisites；
- 预期边界输出；
- formal Gates；
- 风险、成本和交互强度。

若稿件格式尚未选择，route summary 必须把选择列为启动前事项。选择 QMD 时，Navigate 或
`academic-paper` 在首次 intake、写作/恢复和 `academic-paper:format-convert` 前按 instructions
时机只读执行 `quarto --version`，并区分 `available`、`unavailable`、`unknown`。探测不安装依赖、
不联网、不写 workspace；确认快照和探测摘要随本轮 start 写入 control，CLI 会拒绝过期快照。

只有用户确认后，Agent 才调用 `start`。一次确认只授权一个实例。Pipeline parent、每个 child、
新 branch 和每轮动态 revision 都分别确认；确认 parent 不会预创建或授权 child。

## 6. 统一运行协议

Agent 使用以下协议：

```text
status
  -> instructions <selector>
  -> start / decide / advance
  -> status
```

Selector 使用不可变 machine ID 或稳定业务 ID：

- `route:<route-ref>`；
- `subflow:<instance-id>`；
- `gate:<instance-id>/<gate-id>`；
- `decision:<instance-id>/<decision-id>`；
- `change:<change-id>`；
- `handoff:<instance-id>`。

目录名、文件名相似度和“最近一个”不能作为 machine selector。Status、list、show 和 history 都是
扫描现有文件得到的只读视图，不保存投影。

## 7. Standalone 与 academic-pipeline

Standalone route 创建一个没有 profile parent 的根 subflow。它可以独立完成，完成后用户仍可
启动其它工作。

`academic-pipeline` parent 使用项目 profile 调度已确认的 children。Profile 负责：

- end-to-end 与 mid-entry checkpoint；
- child dependency、parallel group 和 join policy；
- formal Gate、branch、transition 和 override policy；
- 动态 revision、re-review 和退出条件。

Core 不硬编码 ARSU graph。Parent 通过扫描带有自身 parent reference 的 child controls 得到子项
状态，不保存一份重复 children 列表。

Mid-entry 只使用用户明确提供的 stable facts 和 handoff inputs，不导入整体运行快照，也不继承
旧 Gate 或 Decision。

## 8. Handoff 与外部文件

每个 subflow 的 `handoff.md` 使用 machine-readable frontmatter 和自由说明。每条 input/output
至少记录 role、type、path 和 purpose；output 可记录 intended consumer，input 可记录 source
instance。稿件条目还声明 `format`；QMD 条目路径必须以 `.qmd` 结尾。Quarto 渲染输出声明目标
format ID 与 `renderer: quarto`，源稿和渲染稿都是 `researchspec/` 外的普通 boundary deliverable。

路径必须：

- 是项目内的安全相对路径；
- 位于 `researchspec/` 外；
- 不依赖相似文件名推断；
- 在当前动作真正消费该 role 时才检查可读性。

普通 status/check 只校验 handoff 结构。外部文件消失只阻塞当前消费者，不回写生产者历史。

## 9. Gate、Decision 与推进

Agent 或脚本可以准备验证结果，但 formal Gate verdict 必须由人确认。每次 verdict 在 owning
control 的 Gate 下追加 attempt，保留 confirmer、时间、summary 和可选 handoff evidence。

`pass`、`pass_with_conditions` 和 `fail` 都不自动推进 checkpoint。用户确认后，Agent 再调用
`advance`；CLI 按 profile、直接依赖 children、Gate 和 branch 校验 transition。

Failed-Gate override 必须有独立 Decision ID、批准人、时间和理由，并只保存在该 Gate 下。
普通 decisions 只记录 scope、claim、structure 和 branch 选择。工具调用、探索过程和普通文件写入
不进入 decisions 或 transitions。

## 10. Revision patch 与 annotation intake

ARSU `revision_patch` schema 是唯一稿件 patch 合同。可选的 Skill-local helper 只接受显式 base、
patch、output 和可选 report 路径；它先完成全部预检，再原子写出结果。任何 schema error、未知
block、stale `old_hash` 或 annotation mapping 缺失都不得产生部分稿件。

Annotation intake 默认位于 owning revision subflow 的 `work/annotation-intake/`，保留 stable
annotation ID、raw feedback、normalized interpretation 和 patch mapping。需要跨边界时，Agent
生成外部文件并在 handoff 中引用。

Markdown 与 QMD 都是 Markdown-compatible 稿源。QMD 的 YAML frontmatter、代码围栏、cell options、
引用、交叉引用和其它 Quarto 元数据在 review copy、annotation 和 revision 中保持原样；QMD 渲染
默认 `no-execute`，代码执行需要独立的当前 formatting subflow `render_consent`。

Mechanical precheck 不是 formal Gate。`revision_completeness` 仍由 Verify 组织判断、用户确认，
再由 Decide 写入 owning control。

## 11. 异模型复核

异模型复核只使用宿主原生 subagent。默认沿用当前会话模型；Agent 可以从宿主实际可用的模型中
提议一个异模型，但必须在派发前另行说明模型、将要发送的内容类别和成本，并取得仅对当前 subflow
有效的确认。Route、Plugin、Adapter、Gate 或 branch confirmation 都不包含这项授权。child、branch
和 dynamic revision round 如需异模型，必须重新确认。

主 Agent 先冻结自己的结构化判断，只发送完成复核所需的最小、去锚材料。分歧触发针对证据的复核，
不得投票、平均或自动覆盖主判断。宿主无法派发或返回结构不合格时，披露限制并回退当前会话模型。
ResearchSpec 不读取模型凭证、不配置 endpoint、不直调模型服务，也不把授权写入 stable spec、control、
handoff 或模型配置文件。

## 12. Plugin 与 Zotero 边界

Plugin consent 与 route confirmation 分开。一次最多建议三个 domain，preview 显示精确 domain
IDs；非交互安装要求显式 IDs 和 `--yes`。Plugin 失败或拒绝不改变原 ARSU producer、selector、
frontier 或 control。

Zotero status/check 是静态检查，不执行 runner、不联系 Zotero、不读取 credentials。运行时只有
用户明确授权的 Adapter Skill 可以访问相应 library 或 Host Bridge；Adapter 输出返回 ARSU
producer，不成为 ResearchSpec workflow authority。

## 13. 恢复、检查与导出

恢复工作时，Navigate 先用 status 找到 machine instance ID，再用 instructions 定向读取当前
checkpoint。若存在多个可能实例，必须请用户选择，不能靠目录名猜测。

`doctor` 只读诊断 current workspace、损坏 owner 和受管静态投影。它不重建 Gate、Decision、
control 或 external file，也不执行 repair transaction。

`pack` 默认只包含 config、manifest、profile、stable specs、controls、changes 和 handoffs；不
包含 subflow `work/`，也不复制 handoff 指向的外部文件。

Pipeline 的 accepted review/re-review 分支先进入 `format` child，再进入 `final-integrity`。
QMD formatting 缺少 Quarto 或探测为 unknown 时保持可写但不可最终转换；formatting child 不覆盖
既有目标，只有 staging 全部检查成功后才更新成功 handoff。`status`、`check`、`doctor` 和
`init` 不触发 Quarto 探测。

旧或未知 workspace 会被报告为 unsupported 并保持不变。要重用材料，用户先在框架外保留所需
文件，再在 fresh workspace 中通过 stable specs 或 handoff 明确引入。

## 14. 验收边界

验收使用 fresh packaged CLI 进程完成所有权威 mutation。测试 helper 只能在 instructions 返回的
外部路径创建 producer 文件，不能直接写 control、Gate、Decision、transition、generated profile
或隐藏索引。

验收必须覆盖：

- fresh init 与 unsupported workspace 零写入拒绝；
- 四份 stable specs 的直接编辑和高影响 change；
- standalone 与 pipeline parent/child 独立确认；
- handoff 跨 subflow 消费和外部路径漂移；
- Gate challenge、reverify、override、branch 与独立 advance；
- 动态 revision round；
- revision helper 的 fail-closed 行为；
- plugin/Zotero 不取得 control authority；
- status/list/show/check/doctor 的只读性；
- pack 排除私有 work 和外部文件字节；
- 四个 ARSU、两个 Core、五个 Companion、七个 Zotero Skills 与十六命令的一致投影。
