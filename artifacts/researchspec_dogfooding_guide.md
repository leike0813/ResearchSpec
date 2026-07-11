# ResearchSpec Dogfooding 指引

## 1. 目标

这份指引用于在暂不发布 npm 包的情况下，从本地源码验证 ResearchSpec 的真实使用体验。重点不是重复跑自动化测试，而是观察：

- Agent 能否发现并正确使用 4 个 ARSU Skills 与 4 个 Companion Skills；
- 模糊研究请求能否由 Navigate 路由，明确模式能否直接进入同一确认边界；
- Agent 是否只依据 CLI frontier 推进，而不手改 state、registry、ledger 或 receipt；
- Start、Submit、Gate、Decision 与 Advance 是否遵守 preview—确认—执行协议；
- 新会话恢复、handoff、pack、Gate challenge/override 和 revision round 是否符合用户心智模型。

Dogfooding 应在一次性研究项目中进行，不要把 ResearchSpec 源码仓库本身当作研究 workspace。

## 2. 安装位置与隔离原则

ResearchSpec 的交付面分为两类：

- Codex Skills 写入研究项目的 `.codex/skills/`，属于项目级内容；
- Codex 命令 prompts 写入 `$CODEX_HOME/prompts/`，属于共享全局投影。

因此，仅新建临时项目还不足以完全隔离。测试时应同时设置临时 `CODEX_HOME`，并在同一终端中启动 Codex。预期目录如下：

```text
~/researchspec-dogfood/
├── .codex/
│   └── skills/          # 8 个项目级 Skills
├── .codex-home/
│   └── prompts/         # Codex 共享全局投影的隔离副本
└── researchspec/        # contracts、runtime state、ledgers 与 receipts
```

不要把临时 `CODEX_HOME` 指向日常使用的 `~/.codex`。不要用 `--force` 处理任何无法确认所有权的漂移文件。

## 3. 从本地源码准备 CLI

在 ResearchSpec 源码仓库执行：

```bash
cd /home/joshua/Workspace/Code/JavaScript/ResearchSpec
pnpm build
npm link
researchspec --version
```

`npm link` 只用于本机验证，不代表包已经具备公开发布条件。源码变化后重新执行 `pnpm build`。

创建隔离项目：

```bash
mkdir -p ~/researchspec-dogfood
cd ~/researchspec-dogfood
export CODEX_HOME="$PWD/.codex-home"
researchspec init . --tools codex
researchspec check all --strict
```

初始化后先检查交付面：

```bash
find .codex/skills -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
find "$CODEX_HOME/prompts" -maxdepth 1 -type f -name 'researchspec-*' -printf '%f\n' | sort
researchspec list tools
researchspec status --json
```

预期能看到 8 个项目级 Skills：

- `deep-research`
- `academic-paper`
- `academic-paper-reviewer`
- `academic-pipeline`
- `researchspec-navigate`
- `researchspec-propose`
- `researchspec-decide`
- `researchspec-verify`

然后从同一终端、同一目录启动 Codex：

```bash
codex
```

## 4. 统一验证纪律

在所有旅程中坚持以下规则：

1. 只允许 Agent 在 `instructions` 指定的 candidate 路径写语义工件。
2. 不直接编辑 `researchspec/runs/current/state.yaml`、artifact registry、Decision/Gate ledgers 或 receipts。
3. 每次写事务先 dry-run，复用返回的 candidate hash 或 plan hash，再确认执行。
4. `--yes` 只确认已预览的机械事务，不能替代路线确认、Gate 人工确认、override 或多分支 Decision。
5. 每一步都动态读取 `status` 与 `instructions <selector>`，不要在提示词里硬编码 pipeline 阶段顺序。
6. Gate verdict 必须展示证据；challenge 后必须产生 reverification，不能直接把失败改成通过。
7. 多 transition 必须经过显式 Decision；拒绝或 postpone 不得隐式选择另一分支。

当 Agent 准备写入权威运行态文件或跳过 preview 时，应立即中止该步并记录为产品缺陷。

## 5. 推荐验证顺序

### 5.1 模糊路由与确认边界

在新会话中输入：

> 我想研究生成式 AI 对高校写作教学的影响，但现在还没想清楚具体研究问题。请先帮我选择合适路线，展示候选、near miss、前置条件、主要产物、正式 Gates、风险和成本。在我明确确认前不要启动任何路线。

观察点：

- 是否进入 Navigate / Route，而不是直接执行某个 ARSU Skill；
- 路线摘要是否来自当前 catalog，并解释候选与 near miss；
- 未确认前 `researchspec status` 是否仍无已启动 subflow；
- 确认 `deep-research:quick` 后，是否先预览 Start packet，再执行相同计划。

### 5.2 快速 standalone 路线

确认 quick 路线后输入：

> 按 ResearchSpec 当前 frontier 继续。每一步先读取 status 和 instructions，只在允许的 candidate 路径产出内容，并通过公开 CLI 的 preview—执行协议提交。遇到正式 Gate 或需要我决定的分支时停下来。

观察点：

- Agent 是否调用正确的 producer Skill；
- candidate 是否满足非空、UTF-8、路径 containment 和 hash binding；
- Submit 是否没有顺便推进 transition；
- 唯一非语义 transition 是否在预览后独立 Advance；
- terminal completion 是否来自 CLI 状态，而不是 Agent 自行宣称。

这是首轮最重要的旅程。若它不稳定，暂时不要进入完整 pipeline。

### 5.3 跨会话恢复

关闭当前 Codex 会话，在相同目录和相同 `CODEX_HOME` 下重新启动，然后输入：

> 请恢复这个研究项目。不要依据上一段聊天或猜测流程；只根据 ResearchSpec workspace、status 和 scoped frontier 告诉我已完成、阻塞与下一步，并在我同意后继续。

观察点：

- 新会话是否通过 Navigate / Resume 恢复；
- 是否区分事实、推断与未知项；
- 是否没有要求重新确认已经进行中的、未漂移路线；
- selector 是否始终绑定正确的 subflow instance。

### 5.4 Context export

输入：

> 请说明 handoff 与 pack 的差异，先预览一个默认不包含 artifacts 的交接包；展示隐私、大小、陈旧性和覆盖风险，确认后再生成。

观察点：

- Explain/Export 是否保持只读，直到用户确认导出；
- `handoff` 是否只是派生视图；
- `pack` 默认是否排除 artifacts；
- 导出前后 workflow state、frontier 与 ledgers 是否不变。

### 5.5 Gate challenge 与 override

选择具有 blocking formal Gate 的路线。Gate 首次验证后输入：

> 我对这个 Gate 结论提出 challenge。请展示原结论及绑定证据，重新验证并提交 reverification；不要覆盖旧事件。如果重验仍失败，停下来让我决定是否 override。

观察点：

- 旧 Gate event 是否保留；
- reverification 是否绑定最新事件、当前证据和可信 receipt；
- failed Gate 是否仍阻塞；
- override 是否只能通过显式 Decision，且绑定最新、已确认的失败重验事件。

### 5.6 完整 pipeline 与 revision round

前述旅程稳定后，再验证 `academic-pipeline:end-to-end`：

> 请先展示完整 child graph、Gates、分支、主要产物和成本。我确认后，严格依据 scoped frontier 驱动 end-to-end pipeline。遇到 editorial Decision 时停下；先选择 revision，至少完成 round 1 和 round 2，再选择接受路径完成流程。

观察点：

- 父确认是否绑定完整 child graph；
- child start 是否复用未漂移的父确认，并绑定 parent、node 与输入 artifacts；
- pre-review 与 final-integrity Gate 是否不可绕过；
- round 1、round 2 的实例、Decision、稿件、review 和 receipts 是否互不串线；
- core/profile 是否没有人为轮数上限；
- 接受分支后是否完成 final integrity、format conversion 与 process summary。

## 6. 每轮结束检查

在项目根目录执行：

```bash
researchspec status --json > dogfood-status.json
researchspec check all --strict --json > dogfood-check.json
researchspec list artifacts --json > dogfood-artifacts.json
researchspec list gates --json > dogfood-gates.json
researchspec list decisions --json > dogfood-decisions.json
```

这些导出仅用于诊断，不应反向写回 workspace。再检查 Git 或文件变化，确认 Agent 没有越过 instructions 指定的写入范围。

建议在研究 workspace 外维护 `dogfood-notes.md`，每个问题至少记录：

```text
场景：
用户原始请求：
预期行为：
实际行为：
最后一个成功 selector：
失败 selector：
是否发生权威状态越权写入：
status/check/instructions JSON 路径：
是否可稳定复现：
主观摩擦与改进建议：
```

## 7. 故障取证

流程卡住时，不要手工修 state。依次保存：

```bash
researchspec status --json
researchspec instructions '<当前 selector>' --json
researchspec check all --strict --json
researchspec show '<相关全局唯一 ID>' --json
```

同时保留：

- 用户原始提示和 Agent 的路线摘要；
- dry-run 输入、返回的 plan/hash 与正式执行输入；
- candidate 文件路径及提交前 SHA-256；
- CLI exit code 和结构化 error code；
- 是否在新会话中仍可复现。

区分两类问题：

- **控制面缺陷**：CLI frontier、selector、hash binding、receipt、Gate/Decision/transition 约束错误；
- **Agent 体验缺陷**：Skill 已提供正确协议，但 Agent 漏读、误路由、解释不清或需要过多人工纠正。

二者都应记录，但不要用提示词补丁掩盖可复现的控制面缺陷。

## 8. 清理

完成验证后退出 Codex，并确认当前终端的 `CODEX_HOME` 仍指向测试目录。随后可删除整个一次性研究项目；这不会影响真实的 `~/.codex`。

解除本地 CLI link：

```bash
npm unlink -g researchspec
```

不要在未检查路径的情况下执行递归删除命令。若希望保留复现环境，应连同临时 `.codex-home`、research workspace、诊断 JSON 和 dogfood notes 一并归档。

## 9. 建议的通过标准

MVP dogfooding 可认为达到可用基线，当且仅当：

- quick standalone 能在少量人工纠正下完成；
- 新会话可以仅凭 workspace 恢复；
- handoff/pack 不改变运行状态；
- Gate challenge、reverification 与 override 边界没有被绕过；
- 完整 pipeline 至少经历两个 revision rounds 后正确完成；
- 全程没有手改权威 runtime 文件，也没有污染真实全局 Agent 目录；
- 发现的问题能够凭 CLI JSON、selector、candidate 和 receipt 稳定复现。

建议至少执行两轮：第一轮由项目作者熟悉协议地操作，第二轮尽量使用自然语言、减少纠正，以暴露真实 onboarding 与 Agent guidance 问题。
