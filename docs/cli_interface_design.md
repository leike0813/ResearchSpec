# ResearchSpec CLI Interface Design：用户向命令界面设计

## 0. 文档状态与事实源

本文定义 ResearchSpec CLI 的 Target v0.1 用户面，并保留 Current implementation 的
wire contract 供迁移使用。用户从对话进入 ARSU 工作的顺序以
[ARSU 用户使用模型 v0.1](./arsu_user_usage_model.md)为 canonical 事实源。

状态约定：

- **Target v0.1**：17 个顶层命令和
  `status → instructions → start/submit/advance → status`。
- **Current implementation（2026-07-27）**：已有 adaptive Case runtime、完整
  `arsu-v0-1` strict compatibility、显式 migration/rollback、external 与
  parent-scoped child subflow、`submit work:|gate:`、`advance transition:`、Decision 与
  dynamic revision-round frontier。
- **Acceptance status**：十七命令、Navigate、四 Companion 与 selector runtime 已通过公共 CLI 用户旅程验收。

事实源：

- Product requirements：`docs/prd_proposal.md`
- Architecture：`docs/arch_design_proposal.md`
- Contract schemas：`docs/contract_schema_design.md`
- Workflow-contract mapping：`docs/arsu_workflow_contract_design.md`
- Canonical 用户模型：`docs/arsu_user_usage_model.md`
- Project rules：`AGENTS.md`
- OpenSpec reference：`references/OpenSpec`

OpenSpec 是主要交互参考：`init` 是用户入口，初始化时通过交互式选择完成 agent
tool 安装；日常命令保持短而直接；`--json` 只作为自动化通道。ResearchSpec 不
照搬 OpenSpec store 机制、deprecated command 结构、完整 schema system 或
workflow CLI。

## 1. CLI 定位

ResearchSpec CLI 是用户向的本地文件编排器。它帮助研究者初始化
`researchspec/` workspace、选择并安装 agent-facing wrappers、查看状态、检查
合同、生成 handoff、打包上下文，并处理需要人类确认的 pending items。

CLI 不是 ARSU 维护工具。ARSU converter、upstream sync、generated artifact
build、drift diff 和 wrapper validation 属于开发者工具链，不进入公共用户向 CLI。
公共 CLI 可以消费已经随 ResearchSpec 包发布的 ARSU-derived user-facing assets，
但不负责维护这些 assets 的来源。

CLI 必须遵守以下边界：

- 不调用 LLM API。
- 不运行 ARSU semantic research/writing/review workflows。
- 不隐藏 human decisions。
- 不直接改 high-impact specs，除非用户通过明确决策接受 pending item。
- 不依赖 Claude Code、Codex、Cursor、Gemini CLI 或任何单一 agent runtime。
- 不把 ARS Material Passport 恢复为 ResearchSpec runtime SSOT。
- 允许 `start subflow:tpl-academic-pipeline-mid-entry` 在同一份严格 Start JSON 中
  携带可选 `material_passport_import`；它是 hash-bound 外部证据导入，不是新顶层命令。
- 导入的 Gate/Decision 历史必须标记为 `imported_evidence`，只能进入 instructions
  context，不能直接推进当前 workflow。
- 默认不覆盖用户内容；写操作需要显示 summary，并支持 `--dry-run` 和显式
  `--force`。

公共 CLI 的主要用户：

| 用户 | 使用目标 |
| --- | --- |
| Researcher | 初始化 workspace、选择 agent、查看项目状态、处理 pending decisions |
| Agent user | 生成 handoff、打包上下文、检查合同是否可被 agent 使用 |
| Automation user | 用 `--json` 获取状态、检查结果和列表视图 |

非公共调用面：

- wrapper input packet generation 属于内部 runtime/helper API，不作为用户命令。
- artifact registry 和 ledger 的低层 append 属于 helper/API 行为；用户只能通过
  `submit`、`decide` 等受约束的高层事务入口触发相应写入。
- Material Passport 的 registry/ledger 投影只能由已确认的 mid-entry Start 事务触发；
  dry-run 必须显示原件、projection、evidence、receipt 与 state-last 写计划。
- ARSU converter maintenance 属于开发者命令或脚本，不放进本文公共 CLI。

## 2. 命令风格

Target v0.1 采用尽量简洁的 OpenSpec-like 风格：少量顶层命令，避免无意义的
“谓词 + 宾语”嵌套，也避免相近命令表达不同写入语义。

全局形式：

```bash
researchspec <command> [arguments] [options]
```

Target v0.1 公共命令：

| Command | 用途 | 默认写入 | `--json` | `--dry-run` |
| --- | --- | --- | --- | --- |
| `researchspec init [path]` | 交互式初始化 workspace 并选择 agent tools | 是 | 否 | 是 |
| `researchspec update [path]` | 刷新用户已选择的 agent-facing files | 是 | 是 | 是 |
| `researchspec status` | 查看当前 run 和 pending items | 否 | 是 | 否 |
| `researchspec instructions <selector>` | 获取 subflow/work/gate/transition 的动态工作包 | 否 | 是 | 否 |
| `researchspec start subflow:<id>` | 实例化用户已确认的 subflow | 是 | 是 | 是 |
| `researchspec submit work:<id>` | 校验并登记 workflow candidate 与 receipt | 是 | 是 | 是 |
| `researchspec submit gate:<id>` | 登记 verification evidence、verdict 与用户确认 | 是 | 是 | 是 |
| `researchspec advance transition:<id>` | 执行唯一合法的状态转换并记录 receipt | 是 | 是 | 是 |
| `researchspec check [target]` | 检查 workspace/contracts/runtime/tools | 否 | 是 | 否 |
| `researchspec doctor` | 容错诊断 runtime 并执行 plan-bound 确定性修复 | 仅 repair | 是 | repair 支持 |
| `researchspec list [type]` | 列出 changes/artifacts/gates/decisions/tools | 否 | 是 | 否 |
| `researchspec show <item>` | 查看某个合同、artifact 或 pending item | 否 | 是 | 否 |
| `researchspec handoff` | 生成或打印当前 handoff view | 可选 | 是 | 是 |
| `researchspec pack` | 打包当前上下文 | 是 | 是 | 是 |
| `researchspec propose <change-id>` | 从 strict JSON 创建 validated pending contract change | 是 | 是 | 是 |
| `researchspec decide [item]` | 交互式处理 pending item | 是 | 是 | 是 |
| `researchspec archive [item]` | 归档已处理的 change 或 draft patch | 是 | 是 | 是 |
| `researchspec plugin <subcommand>` | 查看并管理随包分发的领域 Skill plugins | 视子命令 | 是 | 写子命令支持 |

`submit` 是一个顶层命令但有两个 selector 语义；`doctor` 是独立恢复入口，加入 `plugin`
命令组后上表共 17 个顶层命令。`start` 只接受可启动 subflow，`advance` 只接受可执行 transition，不提供含义模糊的
通用 `execute`。

Current implementation 已提供全部 17 个目标顶层命令。`submit` 按 scoped selector 分派
`work:` 与 `gate:`，`advance` 只接受唯一授权的 scoped `transition:`；下文参数和 envelope
描述当前 wire contract。

### 2.1 Selector-Based Runtime Protocol（Target v0.1）

```text
status
→ instructions <subflow:|work:|gate:|transition:>
→ start / submit / advance
→ status
```

| Selector | 只读 packet | 唯一执行入口 |
| --- | --- | --- |
| `subflow:<id>` | 路线、依赖、实例参数、成本、start capability | `start` |
| `work:<id>` | producer、inputs、candidate path、validation/completion | `submit work:` |
| `gate:<id>` | validator、evidence、proposed verdict、confirmation | `submit gate:` |
| `transition:<id>` | basis、目标、branch conditions、effects | `advance` |

CLI 不向 Agent 暴露低层 registry/ledger/state append。`academic-pipeline`、Navigate 和其他
Skills 都消费同一 protocol，不另建 stage mapping。

特意不采用的公共命令：

| 不采用 | 原因 |
| --- | --- |
| handoff 的嵌套渲染命令 | 无意义的谓词加宾语；改为顶层 `handoff` |
| artifact registry 的低层写命令 | wrapper/helper 内部机械写入，不是用户向命令 |
| ledger 的低层追加命令 | 容易让用户手写权威 ledger；改由 `decide` 或内部 helper 触发 |
| 多套相近 patch 应用命令 | 写入语义容易混淆；统一由 `decide` 处理 pending items |
| ARSU 维护命令 | 维护 ARSU 是开发者职责，不进入用户向 CLI |

## 3. 全局选项

| Option | 适用范围 | 说明 |
| --- | --- | --- |
| `--cwd <path>` | 全部命令 | 指定项目工作目录；默认当前目录 |
| `--workspace <path>` | 合同相关命令 | 指定 `researchspec/` 路径；默认从 cwd 向下定位 |
| `--json` | 查询、instructions、start、submit、advance、检查、列表、show、handoff、pack、propose、decide、archive、plugin | 输出单个 versioned JSON envelope |
| `--dry-run` | 写命令 | 只报告将写入、修改、跳过的文件，不落盘 |
| `--force` | 写命令 | 允许覆盖 generated agent-facing files；不得绕过 human decision |
| `--yes` | 低风险写命令 | 跳过低风险确认；不得自动接受 high-impact research decisions |
| `--quiet` | 全部命令 | 降低 human-facing 输出噪音 |

`--json` 原则：

- stdout 只输出主要 JSON object。
- stderr 输出 diagnostics、warnings、progress 和 debug。
- 成功和失败都应保持机器可解析。
- JSON success 和 expected failure 都只向 stdout 输出一个 envelope；progress 和
  human diagnostics 不得混入 stdout。

## 4. `researchspec init [path]`

用途：创建 ResearchSpec workspace，并用交互式 TUI 帮用户选择 agent tools。Target v0.1
中它只执行 Bootstrap：不选择具体 ARSU mode、不创建 subflow、不开始学术工作。

Synopsis：

```bash
researchspec init [path] [--tools <ids>] [--profile adaptive|strict] [--dry-run] [--force]
```

OpenSpec-like TUI 流程：

1. Welcome：说明将创建 `researchspec/` workspace 并安装 agent-facing files。
2. Detect：检测当前目录是否已有 workspace，检测可用 agent tools。
3. Select tools：从 agent registry 搜索并多选工具。`--tools all` 表示 registry
   中的全部 31 个工具；ForgeCode、Kimi CLI 和 Mistral Vibe 为 skills-only。
4. Load runtime：新 workspace 默认 adaptive；显式 `--profile strict` 使用 Schema `0.2`
   `arsu-v0-1` graph。两种模式都展示可用外部 routes。
5. Preview writes：展示将创建的 workspace files 和将安装的 tool files。
6. Confirm：用户确认后写入。
7. Next steps：提示用户打开对应 agent，使用已安装的 ResearchSpec/ARSU wrapper。

非交互用法：

```bash
researchspec init --tools codex,claude --yes
researchspec init --tools none
researchspec init --tools none --profile strict
```

读写边界：

| 行为 | 说明 |
| --- | --- |
| 读取 | 当前目录、现有 workspace、agent tool 检测信息 |
| 写入 | `researchspec/` skeleton、selected agent-facing generated files |
| 不写入 | 不生成研究问题，不自动接受研究决策，不维护 ARSU upstream |

规则：

- 已存在 workspace 时默认不覆盖。
- `init` 无 profile 时创建 adaptive workspace；`--profile strict` 创建 Schema `0.2`
  workspace。已有 workspace 的 profile 不会被 `init` 改写。
- 用户材料不足时只生成 skeleton 和待填位置，不让 CLI 猜研究内容。
- Agent-facing files 是 generated files；若用户已修改，默认跳过或提示 drift。
- `--force` 只允许覆盖 generated files，不允许覆盖 research contracts 中的用户内容。

## 5. `researchspec update [path]`

用途：刷新当前项目已安装的 ResearchSpec agent-facing files，类似 OpenSpec 的
“refresh instructions” 用户体验。

Synopsis：

```bash
researchspec update [path] [--tools <ids>] [--dry-run] [--force] [--json]
researchspec update [path] --migrate-runtime --dry-run [--json]
researchspec update [path] --migrate-runtime --yes --expected-plan-sha256 <sha256> [--json]
researchspec update [path] --migrate-runtime --rollback <migration-id> --dry-run [--json]
researchspec update [path] --migrate-runtime --rollback <migration-id> --yes --expected-plan-sha256 <sha256> [--json]
```

使用场景：

- ResearchSpec 包升级后刷新 agent instructions/wrappers。
- 用户新增一个 agent tool，需要安装同一套 ResearchSpec user-facing assets。
- 检测到 generated files drift 后重新生成。
- 用户明确把一个有效 Schema `0.2` strict workspace 迁移到 adaptive，或在未发生迁移后
  runtime drift 时恢复 plan 捕获的原始 strict authority。

读写边界：

| 行为 | 说明 |
| --- | --- |
| 读取 | workspace config、selected tools、packaged user-facing assets |
| 写入 | selected tool directories 中的 generated files |
| 不写入 | 普通 update 不写 stable specs、state、registry、ledgers 或 ARSU source package；只有显式 migration transaction 写 config/workflow/state、backup 与 receipt |

规则：

- `update` 不运行 converter，不同步 ARS upstream。
- 默认跳过用户修改过的 generated files。
- `--tools <ids>` 可添加或限制目标 tools。
- `--migrate-runtime` 与 `--tools` 互斥。dry-run 返回 compatibility findings、projected
  obligations、retained strict policies、target hashes 和 `plan_sha256`，且不写文件。
- 执行必须同时提供 `--yes` 和刚预览的 `--expected-plan-sha256`；state authority 最后提交。
- 迁移前原始字节保存在 durable backup，成功写 migration receipt；失败由同一事务恢复旧
  strict workspace。主动 rollback 同样 dry-run、hash-bound，发现后续 adaptive drift 时拒绝覆盖。

## 6. `researchspec status`

用途：查看当前 ResearchSpec workspace 的简明状态。

Synopsis：

```bash
researchspec status [--json]
```

读取：

- `specs/workflow.yaml`
- `runs/current/state.yaml`
- `runs/current/artifact-registry.json`
- `runs/current/decision-ledger.jsonl`
- `runs/current/gate-ledger.jsonl`

输出：

- 当前 workflow/stage/mode。
- pending decisions 或 pending items。
- blocking gates。
- 最近 artifacts。
- 已安装 agent tools 摘要。
- 最近 check/gate 摘要。
- 单一 `workflow_control` object：`profile`、`active_stage_id`、`state`（`unconfigured / blocked / ready / stage_work_complete`）、`ready_items` canonical selectors、`done/ready/blocked` work items、缺失依赖、unlocks、`stage_work_complete` 和 `transition_required`。顶层不重复输出 `work_items`。

`status` 是只读命令，不改变 workspace。

### 6.1 `researchspec instructions work:<id>`

用途：为一个 `ready` work item 返回由 workflow contract 和当前 runtime 状态动态组装的工作包。

```bash
researchspec instructions work:rq-brief [--json]
```

成功输出是扁平 instruction packet：`selector`、`work_item_id`、`stage_id`、`producer_skill`、`state`、`description`、typed runtime context；`output` 只保存 artifact type、workspace/resolved path 和 `template_ref`，实际解析后的 `template` 位于顶层。其余字段包括 dependencies、semantic instruction、rules、allowed/forbidden writes、`validation {profile, suggested_command}`、completion policy 和 unlocks。支持 `text-artifact` 或 `binary-file-artifact` 的节点返回 `submit_available: true` 及 selector、candidate path、dry-run command、strict input 字段和确认/hash 要求，并明确声明不写 state、Gate 或 Decision。命令不内嵌依赖文件全文，也不写 workspace。

约定错误：

| Code | 含义 |
| --- | --- |
| `invalid_work_item_selector` | 未使用 `work:<id>` canonical selector |
| `workflow_unconfigured` | workflow 没有 work-item graph |
| `workflow_invalid` | graph 结构或引用无效 |
| `work_item_not_found` | selector 对应节点不存在 |
| `work_item_blocked` | stage 或依赖尚未满足，或已登记输出失真 |
| `work_item_already_done` | 节点已经完成；本命令不承担 revise |
| `workflow_resource_unavailable` | `template_ref` 无法解析为随包模板 |

### 6.2 `researchspec submit work:<id>`

用途：对 workflow 声明路径中的候选文件执行确定性验证，并把候选 artifact 与
submission receipt 原子登记到 registry。

```bash
researchspec submit work:rq-brief \
  --input submission.json \
  --actor-kind agent \
  --actor-name deep-research \
  [--expected-sha256 <hash>] [--dry-run] [--yes] [--json]
```

输入文件严格限定为 `schema_version: "1"`、`dependency_artifact_ids` 和可选
`producer_mode`。路径、artifact type、stage、producer Skill、template ref 与确定性 ID
均来自 workflow node，调用方不能覆盖。首次执行前先 dry-run；非交互写入必须同时传入
dry-run 返回的 64 位小写 SHA-256 与 `--yes`。该确认只授权登记精确字节，不表示学术认可、
Gate 通过或 stage 推进。

成功状态为 `would_submit`、`submitted` 或 `already_submitted`。成功 envelope 返回 candidate
hash、candidate/receipt registry records、validation、write plan、projected completion 和写后
`workflow_control`，并以 `state_updated: false`、`gate_appended: false`、
`decision_appended: false` 固定声明非作用域。Receipt 先创建，registry 最后刷新；相同
work item、hash 与 provenance 的重试幂等，任何不同 revision、provenance、ID/receipt collision
或 plan/read-precondition drift 都以 exit 3 conflict 结束，不覆盖历史。

`verification_state: verified` 在此仅表示节点声明的确定性 validation profile 已通过：普通
UTF-8 非空文件、path containment、SHA-256、template ref 与依赖 artifact 均可信。它不表示
学术结论真实、证据充分或质量 Gate 已通过；`completion.required_gate_ids` 仍独立决定节点
能否成为 `done`。

### 6.3 `start`、`submit gate:` 与 `advance`（Current）

```bash
researchspec start subflow:<id> [--dry-run] [--yes] [--json]
researchspec submit gate:<id> --input <verdict.json> [--dry-run] [--yes] [--json]
researchspec advance transition:<id> [--dry-run] [--yes] [--json]
```

- `start` 已实现：strict JSON 输入绑定 subflow instructions basis；dry-run 返回 plan SHA-256，
  非交互执行要求相同输入、`--expected-plan-sha256` 与 `--yes`。Start receipt 先写、
  `state.yaml` 最后刷新，并持久化 parent/round/actor/confirmed-by；不执行 ARSU semantic work。
- `submit gate:` 只接受 CLI instructions 指定的 validator/evidence contract，并要求实际用户
  确认。它保存 verdict 与 `confirmed_by`，不把 Agent 自报文本当作 Gate。
- `advance` 校验 Gate/Decision basis、目标 state 与 read preconditions 后执行 transition
  receipt。唯一合法 transition 可由 Agent 自动调用；多分支必须先 `decide`。
- Gate/transition DTO、usage/domain/conflict 错误类和 operational receipt shape 已冻结；
  receipts 不登记为 academic artifacts。

## 7. `researchspec check [target]`

用途：检查 workspace 是否可被 ResearchSpec/ARSU wrappers 安全消费。

Synopsis：

```bash
researchspec check [target] [--json] [--strict]
```

Target 建议：

| Target | 检查内容 |
| --- | --- |
| `all` | 默认综合检查 |
| `contracts` | `specs/*` 字段结构和 cross refs |
| `runtime` | state、artifact registry、decision/gate ledgers |
| `artifacts` | artifact paths、hash、payload schema refs |
| `tools` | 已安装 agent-facing generated files |
| `plugins` | 已选择领域、resolution 与投影文件 |
| `literature-adapters` | 固定 Adapter catalog/resolution、runtime、hash、executable mode 与七个 Skill 投影 |

规则：

- 默认只读，不修复文件。
- `--strict` 可升级部分 diagnostics，但不得把 ARSU-derived version/history 文本
  默认当成阻断项。
- `check` 不维护 ARSU source，不运行 converter。
- `status` 与 `check` 不启动 Zotero runtime，也不探测 Host Bridge；connection 始终报告为 `unchecked`。

### 7.1 `researchspec doctor`

用途：在正常 snapshot 无法安全加载时容错观察 raw runtime 文件，并把问题分类为 healthy、
可重试、可确定修复、需要人工重建或证据冲突。

```bash
researchspec doctor [--json]
researchspec doctor --repair <finding-id> --dry-run [--json]
researchspec doctor --repair <finding-id> --expected-plan-sha256 <sha256> --yes [--json]
```

Doctor repair 只接受唯一可确定的内容，绑定 read preconditions、backup、postconditions 与
plan hash；authority 写入失败或 postcheck 失败时恢复原字节。Doctor 不承担 runtime profile
migration，也不猜测学术语义。

## 8. `researchspec list [type]`

用途：列出 workspace 中的用户可处理对象。

Synopsis：

```bash
researchspec list [changes|artifacts|gates|decisions|tools] [--json]
```

默认类型：`changes`，即 pending 或 active proposed items。

输出：

| Type | 内容 |
| --- | --- |
| `changes` | pending contract changes、draft patches、gate decisions |
| `artifacts` | registry 中的重要 artifacts |
| `gates` | 最近 gate events 和 blockers |
| `decisions` | human decision ledger 摘要 |
| `tools` | 已选择或已安装的 agent tools |

`list` 是只读命令。它不提供维护者向 ARSU build/diff 列表。

## 9. `researchspec show <item>`

用途：查看单个对象的 human-readable 摘要。

Synopsis：

```bash
researchspec show <item> [--json]
```

`<item>` 可以是：

- change id。
- draft patch id。
- artifact id。
- gate id。
- decision id。
- source id 或 claim id。
- `project`、`sources`、`claims`、`manuscript`、`workflow` 等 contract alias。

规则：

- 默认只读。
- 对大型 artifact，只显示 metadata 和路径，不把完整正文强塞到终端。
- 如果 item 是 pending decision，应提示使用 `researchspec decide <item>`。
- 如果 item 已 resolved 且仍留在 active surface，应提示使用 `researchspec archive <item>`。

## 10. `researchspec handoff`

用途：生成或打印当前 handoff view，供用户复制给 agent 或跨会话继续。

Synopsis：

```bash
researchspec handoff [--stdout] [--out <path>] [--json] [--dry-run]
```

默认行为：

- 如果没有 `--stdout`，写入 `researchspec/runs/current/handoff.md`。
- 如果指定 `--out`，写入指定路径。
- 如果指定 `--stdout`，只打印到 stdout，不写文件。

读取：

- `specs/*`
- `runs/current/state.yaml`
- `artifact-registry.json`
- `decision-ledger.jsonl`
- `gate-ledger.jsonl`

规则：

- Handoff 是 rendered view，不是 runtime SSOT。
- `handoff` 不修改 stable specs，不追加 ledgers，不推进 stage。
- 下游状态判断必须回到 state/registry/ledgers。

## 11. `researchspec pack`

用途：打包当前 ResearchSpec 上下文，供跨会话、跨 agent 或人工归档使用。

Synopsis：

```bash
researchspec pack [--out <path>] [--include-artifacts] [--json] [--dry-run]
```

输出内容：

- contract snapshot。
- runtime state。
- registry/ledger snapshot。
- handoff view。
- 可选 artifact files。

规则：

- `pack` 不改变研究语义。
- `pack` 不接受 pending items。
- `pack` 不推进 workflow stage。

## 12. `researchspec propose <change-id>`

用途：把 agent/human 已完成的 semantic change intent 验证并创建为 pending contract
change；不修改 stable specs、runtime state、registry 或 ledgers。

Synopsis：

```bash
researchspec propose <change-id> \
  --input <payload.json> \
  --actor-kind <human|agent> \
  --actor-name <name> \
  [--json] [--dry-run] [--yes]
```

输入 JSON 为 strict object，包含 `title`、`rationale`、`risk_level`、非空 `impact`
和非空 `patches`。每个 patch 提供 `target_contract`、`operation`、`target_path`、
operation 所需的 current/proposed value、`reason`、`source_artifact_ids` 与
`source_decision_ids`。未知字段和不完整 operation shape 属于 usage error。

规则：

- `change-id` 必须是 SafeId，不能复用 active/archive ID，不能覆盖 existing target；
  `--force` 不适用。
- Target 仅限五个 stable specs。YAML 支持 dot 与唯一 `collection[id]` selector；
  `project.md` 仅支持 `replace section[Heading]`。
- CLI 检查 target existence/type、current value、proposed value 及 artifact/decision refs，
  并派生 schema version、change ID、time、actor、status、human-decision flag、patch IDs
  和 validation metadata。
- Write plan 按 `proposal.md`、`tasks.md`、`contract-patch.yaml` 顺序 create-only；最后
  一个文件是 machine contract。三个文件均为 user-owned。
- 非交互执行需要 `--yes`；它只确认创建 pending proposal，不表示接受该 proposal。
- 参数/schema error 返回 2，target/current/reference domain conflict 返回 1，existing
  output/I/O conflict 返回 3。JSON mode 始终只输出一个 envelope。

## 13. `researchspec decide [item]`

用途：处理需要人类确认的 pending item。它统一承载合同变更、稿件 patch、
gate override 和 accepted limitation 等用户决策，避免多个相似写命令造成混淆。

Synopsis：

```bash
researchspec decide [item] \
  [--decision <accept|reject|postpone>] \
  [--actor-name <name>] [--reason <text>] [--json] [--dry-run]
```

交互流程：

1. 如果未指定 item，列出 pending items。
2. 展示 item 类型、来源、将读取的 artifacts、将写入的 surfaces。
3. 展示风险等级和是否会修改 stable specs 或 draft artifact。
4. 询问用户选择：accept、reject、postpone。
5. 对 accept 的 item 执行对应写入，并记录 human decision。

可处理对象：

| Item type | Accept 后写入 |
| --- | --- |
| Contract change | 更新目标 `specs/*`，追加 decision record，可写 apply receipt artifact |
| Draft patch | 生成 revised draft artifact，更新 artifact registry，追加 decision record |
| Gate override | 追加 decision record，不修改历史 gate event |

规则：

- `decide` 必须是 human-facing；不得由 wrapper 静默调用。
- `--dry-run` 必须显示将写入的全部 surfaces。
- 不提供多套相近 patch 应用命令；用户只通过 `decide` 处理 pending items。
- 任何 high-impact research change 都必须留下 decision record。
- Accept contract change 前必须再次解析 target、验证 artifact/decision refs，并比较
  YAML value 或 Markdown section body 的 `current_value`；发生 drift 时不得应用。
- `decide` 只负责决策和应用，不负责把已处理对象移出 active surface；收尾归档由
  `archive` 完成。

## 14. `researchspec archive [item]`

用途：归档已接受、拒绝或已完成处理的 contract change / draft patch，让它们退出
active surface，同时保留可追踪的收尾记录。

`archive` 与 `decide` 的边界：

| Command | 职责 |
| --- | --- |
| `decide` | 让人类接受、拒绝或暂缓 pending item，并执行必要写入 |
| `archive` | 检查 resolved item 是否可收尾，并移动到 archive surface |

`archive` 与 `pack` 的边界：

| Command | 职责 |
| --- | --- |
| `archive` | 生命周期收尾：让 resolved item 退出 active surface |
| `pack` | 上下文打包：生成可携带 bundle，不改变 item 生命周期 |

Synopsis：

```bash
researchspec archive [item] [--json] [--dry-run]
```

可处理对象：

| Item type | Archive target |
| --- | --- |
| Contract change | `researchspec/changes/archive/YYYY-MM-DD-<change-id>/` |
| Draft patch | `researchspec/draft-patches/archive/YYYY-MM-DD-<patch-id>.json` |

交互流程：

1. 如果未指定 item，列出可归档的 resolved items。
2. 检查 item 是否已 accepted、rejected 或 completed。
3. 检查是否存在 blocking gate、未应用 patch、缺失 decision record 或未生成 receipt。
4. 展示将移动的文件、将保留的 ledger/registry 引用，以及归档目标路径。
5. 用户确认后执行归档。

规则：

- `archive` 不接受 pending item；pending item 必须先经过 `decide`。
- `archive` 不修改 stable specs，不生成 revised draft，不追加 semantic decision。
- 历史 decision/gate ledger 不移动；归档对象保留对 ledger record 的引用。
- Current implementation 不处理 `runs/current`、整个 project 或 artifact registry 条目的归档生命周期。
- 如果检查发现格式不规范、引用缺失或 spec 冲突，应报告 diagnostics；复杂修复可交给
  agent-facing companion command 协助，但最终写入仍应通过 CLI 或明确的文件编辑完成。

## 15. `researchspec plugin`

`plugin` 是领域 Skill catalog 与 workspace 选择的命令组：

```bash
researchspec plugin list [--installed] [--summary]
researchspec plugin show <domain-id> [--summary]
researchspec plugin install <domain-ids...> [--expected-plan-sha256 <sha256>] [--summary]
researchspec plugin uninstall <domain-ids...>
researchspec plugin update [domain-ids...]
researchspec plugin instructions <skill-id>
```

`list/show` 直接读取随 npm 包分发的 registry，可在没有 workspace 时运行。写子命令
只接受稳定 domain IDs，改变 workspace 级 `plugins.selected`，并动态解析 direct Skills 与 reviewed hard dependencies 后更新 manifest-owned Skill projection；没有配置
Agent tool 时仍保存选择并给出非阻塞警告。插件只增加 Skills，不生成 wrapper，不进入
workflow profile。完整 Registry Schema、provenance、license、drift 和卸载边界见
[Domain Skill Plugins](./domain_skill_plugins.md)。当前六个 vendor 的维护边界分别见
[ToolUniverse Vendor Adapter](./tooluniverse_vendor_adapter.md) 与
[Scientific Agent Skills Vendor Adapter](./scientific_agent_skills_vendor_adapter.md)、
[Materials-Science-Skills-For-LLM Vendor Adapter](./materials_science_skills_vendor_adapter.md)、
[FinRobot Vendor Adapter](./finrobot_vendor_adapter.md)、
[HistAgent Vendor Adapter](./histagent_vendor_adapter.md)、
[Education Agent Skills Vendor Adapter](./education_agent_skills_vendor_adapter.md)；vendor 不是 CLI 安装对象。

学科型 domain 仅采用 ANZSRC 2020 FoR Group，工具型 domain 使用 ResearchSpec 的五类粗粒度目录，详见
[Domain Taxonomy](./domain_taxonomy.md)。Registry 内部固定保存 218 个 domain，但普通
`list/show/install` 及其 JSON 只暴露 `skills` 非空的可用 domain。`list --installed` 与
status 会保留已选但缺失或变空的 domain，并标为 unavailable；该状态阻断 update，但仍可
依赖 manifest snapshot 安全 uninstall。重新获得 reviewed Skills 后，同一 ID 自动恢复可用。

`list/show --summary` 是 Agent 发现入口：前者只返回 domain identity、availability 和
direct/resolved 数量，后者返回 Skill ID、frontmatter description、reviewed dependency 与
`SKILL.md` SHA-256；CLI 不执行语义打分或自动推荐。`plugin install --dry-run --summary --json`
返回 registry、domain version、resolved Skill、tool projection 与 write plan 共同绑定的
`plan_sha256`。非交互执行必须同时提供 `--yes` 和相同的
`--expected-plan-sha256`，不一致时按 conflict 失败且不写入。

`plugin instructions <skill-id>` 只读取当前已选、available、完整投影且与 manifest hash
一致的 Skill。返回包包含 exact `SKILL.md`、entry hash、resource paths、domain、projected
tools 与 advisory authority；该命令不执行资源，也不授予 plugin 修改 workflow state、
artifact registry、Gate、Decision、transition 或 receipt 的权限。它用于宿主尚未热加载新
Skill 时的当前会话即时路由。

## 16. 读写边界汇总

| Surface | 用户向可写命令 | 规则 |
| --- | --- | --- |
| `researchspec/specs/*` | `init`、`decide` | `propose` 只读取；语义变更必须来自 accepted pending item |
| `researchspec/changes/<id>/*` | `propose`、`decide` | propose create-only；decide 更新 lifecycle，machine contract 最后创建 |
| `runs/current/state.yaml` | Current: `init`; Target: `start`、`advance` | 只由受约束 lifecycle transaction 写入，不由 wrapper 手改 |
| `artifact-registry.json` | `submit`、`decide` | 只由受约束事务入口登记 candidate、receipt 或 revised artifact |
| `runs/current/receipts/artifact-submit/*` | `submit` | deterministic create-only receipt；与 candidate/registry hash 交叉验证 |
| `decision-ledger.jsonl` | `decide` | 记录 human decision，不允许用户手写 JSONL |
| `gate-ledger.jsonl` | `submit gate:` | validator 提出 verdict，用户确认，CLI 原子追加 receipt-backed event |
| `runs/current/handoff.md` | `handoff` | rendered view，不是 SSOT |
| `researchspec/changes/archive/*` | `archive` | 只移动 resolved contract changes，不处理 pending changes |
| `researchspec/draft-patches/archive/*` | `archive` | 只移动 resolved draft patches，不应用 patch |
| agent tool directories | `init`、`update` | 只写 generated agent-facing files |
| packed bundle | `pack` | 只写用户指定 bundle |

## 17. Current implementation 已冻结契约

### 17.1 JSON envelope

```ts
interface CliEnvelope<T> {
  schema_version: "1";
  command: string;
  ok: boolean;
  data: T | null;
  diagnostics: Diagnostic[];
  error?: { code: string; message: string; hint?: string; details?: unknown };
}
```

### 17.2 Exit codes

| Code | 含义 |
| --- | --- |
| `0` | 成功，包括空列表和无 pending item |
| `1` | 有效命令被 workspace/domain/preflight 阻断 |
| `2` | 参数、选项冲突、非 TTY 缺输入或 item 歧义 |
| `3` | 写保护或 I/O conflict |
| `4` | 未预期 internal error |

### 17.3 Item selectors

Current canonical selectors 还包括 external `subflow:<template>`、parent-scoped
`subflow:<parent>/<node>`、instance-scoped `work:`/`gate:`/`transition:`，以及 `change:`、`patch:`、`artifact:`、
`decision:`、`source:`、`claim:`、`tool:` 和 `contract:`。裸 ID 只有在所有
index 中唯一时才可解析；歧义时返回候选 canonical selectors。

Workflow work item 使用独立的 `work:<id>` selector，由 `instructions`、`submit` 和 status
work-item view 消费，不进入通用 `show/list` item index。

Target v0.1 将 `subflow:`、`work:`、`gate:`、`transition:` 统一纳入 control-plane
selector contract；既有 governance selectors 继续服务 `list/show/propose/decide/archive`。

### 17.4 Tool delivery facts

- `researchspec/config.yaml` 保存 profile、selected tools 和 workspace 级 selected plugins。
- `tool-installation-manifest.json` 保存 generated path、scope、source、adapter
  version 和 SHA-256 ownership evidence。
- Current implementation / Target v0.1：Project-local skill 路径统一为
  `<skillsDir>/skills/<skill-id>/**`；四个 ARSU、四个 self-contained Companion 与两个固定
  Zotero Adapter Skills 被投影到 31 个 registered tools，28 个 command-capable tools
  仍只从 ARSU/Companion 同源生成 8 个 wrappers。
  可选 registry-driven plugin Skills 同样可投影到 31 个 tools，但 wrapper 总数始终为 28×8。
- 迁移前后都不得用一个通用 Markdown 文件覆盖工具的 Markdown/TOML 格式差异。
- Codex prompts 是 `$CODEX_HOME/prompts` 或 `~/.codex/prompts` 下的
  shared-global files，不因单个项目 deselect 被删除。
- 明确产品退役且 manifest-owned、hash 匹配的 Codex prompt 可在 Codex 仍被选择时删除；
  drifted prompt 始终保留并报告。
- Manifest 未登记的 existing file 视为 user-owned；hash drift 默认保留，
  `--force` 也只能覆盖 manifest-owned generated files。

### 17.5 Deterministic derived views

`handoff` 每次从 contracts/state/registry/ledgers 渲染。`pack` 使用固定 entry
排序和时间戳，包含 entry path、byte count 和 SHA-256 manifest；两者都不接受
decision、不推进 stage，也不成为 runtime SSOT。

## 18. 非目标

- 不设计 LLM API integration。
- 不运行 ARSU semantic writing/research/review workflows。
- 不暴露 ARSU maintenance commands。
- 不暴露 registry/ledger 的低层 append commands。
- 不暴露 wrapper runtime helper commands。
- 不为 Check、Submit、Archive 等 deterministic transactions 再建立目标 Companion。
- Target v0.1 不扩展 run/project archive 生命周期。
- 不设计 shell completion。
- 不引入 hidden global state 或 database-first runtime。
