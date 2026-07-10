# ResearchSpec CLI Interface Design：用户向命令界面设计

## 0. 文档状态与事实源

本文定义 ResearchSpec CLI 的第一版用户向命令界面及当前实现契约。除 shell
completion 外，命令、参数、JSON envelope、exit code、item selector、agent tool
delivery、读写边界和生命周期行为均以本文为准。

事实源：

- Product requirements：`docs/prd_proposal.md`
- Architecture：`docs/arch_design_proposal.md`
- Contract schemas：`docs/contract_schema_design.md`
- Workflow-contract mapping：`docs/arsu_workflow_contract_design.md`
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
- artifact registry append 和 ledger append 属于 helper/API 行为，不作为用户日常命令。
- ARSU converter maintenance 属于开发者命令或脚本，不放进本文公共 CLI。

## 2. 命令风格

第一版采用尽量简洁的 OpenSpec-like 风格：少量顶层命令，避免无意义的
“谓词 + 宾语”嵌套，也避免相近命令表达不同写入语义。

全局形式：

```bash
researchspec <command> [arguments] [options]
```

公共命令：

| Command | 用途 | 默认写入 | `--json` | `--dry-run` |
| --- | --- | --- | --- | --- |
| `researchspec init [path]` | 交互式初始化 workspace 并选择 agent tools | 是 | 否 | 是 |
| `researchspec update [path]` | 刷新用户已选择的 agent-facing files | 是 | 是 | 是 |
| `researchspec status` | 查看当前 run 和 pending items | 否 | 是 | 否 |
| `researchspec check [target]` | 检查 workspace/contracts/runtime/tools | 否 | 是 | 否 |
| `researchspec list [type]` | 列出 changes/artifacts/gates/decisions/tools | 否 | 是 | 否 |
| `researchspec show <item>` | 查看某个合同、artifact 或 pending item | 否 | 是 | 否 |
| `researchspec handoff` | 生成或打印当前 handoff view | 可选 | 是 | 是 |
| `researchspec pack` | 打包当前上下文 | 是 | 是 | 是 |
| `researchspec decide [item]` | 交互式处理 pending item | 是 | 是 | 是 |
| `researchspec archive [item]` | 归档已处理的 change 或 draft patch | 是 | 是 | 是 |

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
| `--json` | 查询、检查、列表、show、handoff、pack、decide、archive | 输出单个 versioned JSON envelope |
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

用途：创建 ResearchSpec workspace，并用交互式 TUI 帮用户选择 agent tools。

Synopsis：

```bash
researchspec init [path] [--tools <ids>] [--profile <profile>] [--dry-run] [--force]
```

OpenSpec-like TUI 流程：

1. Welcome：说明将创建 `researchspec/` workspace 并安装 agent-facing files。
2. Detect：检测当前目录是否已有 workspace，检测可用 agent tools。
3. Select tools：从 agent registry 搜索并多选工具。`--tools all` 表示 registry
   中的全部 31 个工具；ForgeCode、Kimi CLI 和 Mistral Vibe 为 skills-only。
4. Select profile：选择 ResearchSpec profile。第一版默认是 ARSU paper workflow。
5. Preview writes：展示将创建的 workspace files 和将安装的 tool files。
6. Confirm：用户确认后写入。
7. Next steps：提示用户打开对应 agent，使用已安装的 ResearchSpec/ARSU wrapper。

非交互用法：

```bash
researchspec init --tools codex,claude --profile arsu-paper --yes
researchspec init --tools none
```

读写边界：

| 行为 | 说明 |
| --- | --- |
| 读取 | 当前目录、现有 workspace、agent tool 检测信息 |
| 写入 | `researchspec/` skeleton、selected agent-facing generated files |
| 不写入 | 不生成研究问题，不自动接受研究决策，不维护 ARSU upstream |

规则：

- 已存在 workspace 时默认不覆盖。
- 用户材料不足时只生成 skeleton 和待填位置，不让 CLI 猜研究内容。
- Agent-facing files 是 generated files；若用户已修改，默认跳过或提示 drift。
- `--force` 只允许覆盖 generated files，不允许覆盖 research contracts 中的用户内容。

## 5. `researchspec update [path]`

用途：刷新当前项目已安装的 ResearchSpec agent-facing files，类似 OpenSpec 的
“refresh instructions” 用户体验。

Synopsis：

```bash
researchspec update [path] [--tools <ids>] [--dry-run] [--force] [--json]
```

使用场景：

- ResearchSpec 包升级后刷新 agent instructions/wrappers。
- 用户新增一个 agent tool，需要安装同一套 ResearchSpec user-facing assets。
- 检测到 generated files drift 后重新生成。

读写边界：

| 行为 | 说明 |
| --- | --- |
| 读取 | workspace config、selected tools、packaged user-facing assets |
| 写入 | selected tool directories 中的 generated files |
| 不写入 | stable specs、state、registry、ledgers、ARSU source package |

规则：

- `update` 不运行 converter，不同步 ARS upstream。
- 默认跳过用户修改过的 generated files。
- `--tools <ids>` 可添加或限制目标 tools。

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

`status` 是只读命令，不改变 workspace。

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

规则：

- 默认只读，不修复文件。
- `--strict` 可升级部分 diagnostics，但不得把 ARSU-derived version/history 文本
  默认当成阻断项。
- `check` 不维护 ARSU source，不运行 converter。

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

## 12. `researchspec decide [item]`

用途：处理需要人类确认的 pending item。它统一承载合同变更、稿件 patch、
gate override 和 accepted limitation 等用户决策，避免多个相似写命令造成混淆。

Synopsis：

```bash
researchspec decide [item] [--json] [--dry-run]
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
| Accepted limitation | 追加 decision record；必要时要求 contract change |

规则：

- `decide` 必须是 human-facing；不得由 wrapper 静默调用。
- `--dry-run` 必须显示将写入的全部 surfaces。
- 不提供多套相近 patch 应用命令；用户只通过 `decide` 处理 pending items。
- 任何 high-impact research change 都必须留下 decision record。
- `decide` 只负责决策和应用，不负责把已处理对象移出 active surface；收尾归档由
  `archive` 完成。

## 13. `researchspec archive [item]`

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
- 第一版不处理 `runs/current`、整个 project 或 artifact registry 条目的归档生命周期。
- 如果检查发现格式不规范、引用缺失或 spec 冲突，应报告 diagnostics；复杂修复可交给
  agent-facing companion command 协助，但最终写入仍应通过 CLI 或明确的文件编辑完成。

## 14. 读写边界汇总

| Surface | 用户向可写命令 | 规则 |
| --- | --- | --- |
| `researchspec/specs/*` | `init`、`decide` | skeleton 可创建；语义变更必须来自 accepted pending item |
| `runs/current/state.yaml` | `init` | 后续 stage transition 由 wrapper/runtime 内部 helper 处理，不暴露为用户命令 |
| `artifact-registry.json` | `decide` | 只在接受 draft patch 或生成 receipt 时由 CLI/helper 写入 |
| `decision-ledger.jsonl` | `decide` | 记录 human decision，不允许用户手写 JSONL |
| `gate-ledger.jsonl` | 无公共写命令 | gate event 由 validator/gate helper 产生 |
| `runs/current/handoff.md` | `handoff` | rendered view，不是 SSOT |
| `researchspec/changes/archive/*` | `archive` | 只移动 resolved contract changes，不处理 pending changes |
| `researchspec/draft-patches/archive/*` | `archive` | 只移动 resolved draft patches，不应用 patch |
| agent tool directories | `init`、`update` | 只写 generated agent-facing files |
| packed bundle | `pack` | 只写用户指定 bundle |

## 15. 已冻结实现契约

### 15.1 JSON envelope

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

### 15.2 Exit codes

| Code | 含义 |
| --- | --- |
| `0` | 成功，包括空列表和无 pending item |
| `1` | 有效命令被 workspace/domain/preflight 阻断 |
| `2` | 参数、选项冲突、非 TTY 缺输入或 item 歧义 |
| `3` | 写保护或 I/O conflict |
| `4` | 未预期 internal error |

### 15.3 Item selectors

Canonical selectors 为 `change:`、`patch:`、`artifact:`、`gate:`、
`decision:`、`source:`、`claim:`、`tool:` 和 `contract:`。裸 ID 只有在所有
index 中唯一时才可解析；歧义时返回候选 canonical selectors。

### 15.4 Tool delivery facts

- `researchspec/config.yaml` 保存 profile 和 selected tools。
- `tool-installation-manifest.json` 保存 generated path、scope、source、adapter
  version 和 SHA-256 ownership evidence。
- Project-local skill 路径统一为 `<skillsDir>/skills/<skill-id>/**`；四个 ARSU
  skill 目录递归安装。
- 28 个 command-capable tools 通过 registry formatter 生成各自 Markdown/TOML
  格式；不得用一个通用 Markdown 文件覆盖格式差异。
- Codex prompts 是 `$CODEX_HOME/prompts` 或 `~/.codex/prompts` 下的
  shared-global files，不因单个项目 deselect 被删除。
- Manifest 未登记的 existing file 视为 user-owned；hash drift 默认保留，
  `--force` 也只能覆盖 manifest-owned generated files。

### 15.5 Deterministic derived views

`handoff` 每次从 contracts/state/registry/ledgers 渲染。`pack` 使用固定 entry
排序和时间戳，包含 entry path、byte count 和 SHA-256 manifest；两者都不接受
decision、不推进 stage，也不成为 runtime SSOT。

## 16. 非目标

- 不设计 LLM API integration。
- 不运行 ARSU semantic writing/research/review workflows。
- 不暴露 ARSU maintenance commands。
- 不暴露 registry/ledger 的低层 append commands。
- 不暴露 wrapper runtime helper commands。
- 不在第一版设计 run/project archive 生命周期。
- 不设计 shell completion。
- 不引入 hidden global state 或 database-first runtime。
