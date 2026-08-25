# ARSU 用户使用模型

## 1. 权威与适用范围

本文是用户进入、确认、运行、恢复、验证和结束 ARSU 工作的唯一产品级使用模型。架构、CLI、
schema、Skill、converter、文档与验收都必须与本文一致。

ResearchSpec 是基于文件合同的控制面。它不调用 Agent API，不替代用户选择的 Agent，也不接管
Zotero、论文文件或其它外部研究材料。

## 2. 用户可见表面

固定 Agent Skill 基础表面包括：

- 四个 ARSU Skills：`deep-research`、`academic-paper`、
  `academic-paper-reviewer`、`academic-pipeline`；
- 五个 Companion Skills：`researchspec-navigate`、`researchspec-propose`、
  `researchspec-decide`、`researchspec-verify`、`researchspec-cli-handbook`；
- `skills/capabilities/registry.json` 中登记的全部 capability packages。

可选的 `zotero-library` Adapter 在用户选择后增加七个 literature Skills。可选 domain Skills 只辅助
语义工作，不能增加 Companion、CLI capability 或工作流权威。

公开 CLI 固定为十六个顶层命令：

```text
init        update      status      instructions
start       advance     check       list
show        handoff     pack        propose
decide      archive     doctor      plugin
```

命令 wrapper 是同一能力在不同 Agent host 中的适配，不是独立产品能力。

## 3. Workspace 与文件所有权

`researchspec init` 创建 schema `"2"` workspace、投影已选 Agent 表面和 preset profiles，但不启动
学术工作。Fresh workspace 的权威布局是：

```text
researchspec/
  config.yaml
  tool-installation-manifest.json
  profiles/
    <profile-id>.yaml
  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
  changes/
  runs/
```

根 run 启动后创建：

```text
researchspec/runs/<run-id>/
  run.yaml
  graph.yaml
  handoff.md
  nodes/
    <node-instance>.yaml
```

所有权固定如下：

| 文件 | 唯一职责 |
| --- | --- |
| `specs/project.md` | 研究问题、范围、边界、方法立场、贡献和长期约束 |
| `specs/sources.yaml` | 用户接受的来源、identifier、用途范围和限制 |
| `specs/claims.yaml` | 稳定 claim、强度、支持来源、范围和限制 |
| `specs/manuscript.yaml` | 稿件体裁、语言、读者、venue、格式和结构意图 |
| `profiles/<profile-id>.yaml` | 可启动的 capability graph 模板 |
| `runs/<run-id>/run.yaml` | run 身份、入口、授权来源、父级绑定和生命周期 |
| `runs/<run-id>/graph.yaml` | 启动时冻结的 graph；该 run 的调度权威 |
| `runs/<run-id>/nodes/*.yaml` | 节点状态、输出、Gate attempts、overrides 和 Decisions |
| `runs/<run-id>/handoff.md` | 整个 run 的边界输入输出 role/path |
| `changes/<id>/` | 高影响 stable-spec change 的提议、决定和应用状态 |

论文、报告、review、图表、数据和其它边界交付物都在 `researchspec/` 外。ResearchSpec 不登记或
复制这些文件，也不管理它们的生命周期；run handoff 只用安全的项目相对路径引用它们。

## 4. Stable specs 的日常维护

用户与 Agent 可以直接维护四份 stable specs。早期 workspace 允许 sources、claims 和 manuscript
为空；检查只验证已存在的字段和引用，不要求编造占位事实。

普通确认事实可直接写入所属 spec。研究问题、范围、贡献、claim 强度或适用范围、稿件结构或
关键限制、review-response 策略等高影响变化，先建立 project change。`accepted` 只记录决定；
stable specs 确实完成修改并通过检查后，change 才能标为 `applied`。

首次进入稿件写作时，用户在 `manuscript.yaml.delivery.working_format` 选择 `markdown` 或 `qmd`。
QMD 还要确认安全的 `final_output_format` Quarto format ID。已确认选择的后续变更通过 project
change 完成，不能静默转换旧稿。

## 5. 从对话进入工作

模糊、跨 capability、恢复、解释和导出请求先进入 `researchspec-navigate`。明确指定 capability
时可以直接路由，但仍要读取 `status --json` 和相应 graph selector 的 instructions。

开始根 run 前，Agent 必须展示 profile entry summary，其中包括：

- 入口、capability 与 prerequisites；
- 已确认的 handoff inputs 和预期边界 outputs；
- graph 声明的 formal Gates 与 Decisions；
- 风险、成本和交互强度。

用户确认这份摘要后，Agent 才能执行 `start profile:<profile-id>`。一次确认只授权一个根 run 及其
冻结 graph 中声明的节点和绑定 child runs，不能扩展到 graph 外的工作。

## 6. 图授权与 child runs

根 run 的 `graph.yaml` 冻结 profile 版本、节点、依赖、并行/join 规则、Gates、Decisions、重复轮次
和 child profile 绑定。Core 只实现通用图引擎，不硬编码任何研究流程。

节点进入 eligible 状态后可直接执行。普通执行节点通过 `advance node:<run>/<node>[@round]` 提交
声明的输出；成功验证后才完成。Gate verdict 和 Decision choice 只满足 graph 条件，不替执行节点
完成生命周期。

eligible 的 child-profile 节点通过 `start node:<parent-run>/<node>[@round]` 创建或返回唯一绑定的
child run。child 继承父 graph 的授权，所以不再索取第二次 run-level 确认。它必须记录 typed parent
binding，只能执行自己冻结 graph 的内容；自己的每个 Gate 和 Decision 仍要单独确认。

`academic-pipeline` 的 end-to-end 与 mid-entry 都由 profile entry 定义。用户在根 entry summary 中
确认入口，图只暴露相应的首个 eligible 节点；revision 与 re-review 的动态 round 从当前 run 的
round 1 开始，不继承旧 run 的 Gate、Decision、round 或完成状态。

`paper-humanizer` 与 `review-response` 是独立 profiles，不由 core 或其它 producer 动态拼装。

## 7. 统一运行协议与 selectors

Agent 使用以下协议：

```text
status --json
  -> instructions <selector> --json
  -> start / decide / advance
  -> status --json
```

运行控制只接受稳定 graph selectors：

- `profile:<profile-id>`；
- `run:<run-id>`；
- `node:<run-id>/<node-id>[@round]`；
- `gate:<run-id>/<gate-id>[@round]`；
- `decision:<run-id>/<decision-id>[@round]`；
- `change:<change-id>`。

Inspection 另外接受 `spec:<name>` 和 `tool:<tool-id>`。目录名、文件名相似度和“最近一个”不能充当
machine selector。`status`、`list` 和 `show` 都是从权威文件即时派生的只读视图。

## 8. Handoff 与外部文件

每个 run 的 `handoff.md` 包含 machine-readable frontmatter 和自由说明。input/output 至少记录
role、type、path 和 purpose；output 可记录 intended consumer，input 可记录 source run。稿件条目
还声明 format。Quarto 渲染输出声明目标 format ID 与 `renderer: quarto`。

所有文件路径必须是项目内的安全相对路径，位于 `researchspec/` 外，并在当前动作真正消费该 role
时才检查可读性。普通 status/check 只验证 handoff 结构；外部文件消失只阻塞当前消费者，不改写
生产者的历史记录。

## 9. Gate、Decision 与推进

Agent 或脚本可以准备验证结果，但每个 formal Gate verdict 都由人确认。`decide gate:...` 把 attempt
写入 Gate 所属 node instance；`pass`、`pass_with_conditions` 和 `fail` 都不会自动完成节点。

Failed-Gate override 需要独立的人类批准、理由和 Decision identity，也只保存在所属 node instance。
Graph Decision 同样逐项确认，记录选项后只有对应 branch 会进入 frontier。工具调用、探索过程和
普通文件写入不进入 Decisions。

## 10. Revision patch、annotation 与格式

ARSU `revision_patch` schema 是唯一稿件 patch 合同。可选 helper 只接受显式 base、patch、output 和
可选 report 路径；它先完成全部预检，再原子写出结果。Schema error、未知 block、stale
`old_hash` 或 annotation mapping 缺失都不能产生部分稿件。

Annotation intake 是 `researchspec/` 外的普通工作材料，例如 `work/annotation-intake/`。需要给其它
run 使用时，在 handoff 中声明相应外部路径。

Markdown 与 QMD 都是 Markdown-compatible 稿源。QMD 的 YAML frontmatter、代码围栏、cell
options、引用、交叉引用和其它 Quarto 元数据在 review、annotation 和 revision 中保持原样。
QMD 渲染默认 `no-execute`；代码执行需要针对当前 run/node 的独立 `render_consent`。

## 11. 异模型复核

异模型复核只使用宿主原生 subagent。派发前，Agent 必须说明实际可用模型、发送的内容类别和成本，
并取得只对当前 run/node 有效的确认。根 run 授权、Plugin、Adapter、Gate 或 Decision 确认都不包含
这项授权；child run 和动态 round 需要再次确认。

主 Agent 先冻结自己的结构化判断，只发送完成复核所需的最少材料。分歧通过证据复核解决，不能投票、
平均或自动覆盖主判断。ResearchSpec 不读取模型凭证、不配置 endpoint、不调用模型服务，也不保存
模型授权。

## 12. Plugin 与 Zotero 边界

Plugin consent 与根 run 确认分开。一次最多建议三个 domain，preview 显示精确 IDs；非交互安装要求
显式 IDs 和 `--yes`。Plugin 失败或拒绝不改变 graph selector、frontier 或 producer 权威。

Zotero status/check 是静态检查，不执行 runner、不联系 Zotero、不读取 credentials。只有用户明确
授权的 Adapter Skill 可以访问相应 library 或 Host Bridge；Adapter 输出返回 ARSU producer，不会
取得 ResearchSpec 工作流权威。

## 13. 恢复、检查与导出

恢复时，Navigate 先用 status 找到 run ID，再读取 `run:`、`node:`、`gate:` 或 `decision:`
instructions。存在多个候选时由用户选择，不能根据目录名猜测。

`doctor` 只读诊断 schema 2 workspace、owner 文件和受管静态投影；它不重建研究事实、run、node、
Gate、Decision 或外部文件。

`pack` 可按 specs、profiles、runs、changes 或单个 owner 生成有界上下文包。它不复制 handoff 指向的
外部文件。旧或未知 workspace 会被报告为 unsupported 并保持不变。

## 14. 验收边界

验收从真实打包产物启动 fresh CLI 进程完成权威 mutation。测试 helper 只能创建 instructions 声明的
外部 producer 文件，不能直接写 run、node、Gate、Decision、frozen graph 或生成 profile。

验收至少覆盖 fresh init、根 entry 确认、graph-authorized child run、全部 mid-entry、Gate/Decision、
failed-Gate override、动态 round、安全路径、外部 handoff 漂移、read-only 命令、context pack、
Plugin/Zotero 边界，以及 registry-derived Agent 表面的投影。
