# ResearchSpec Companion Skill / Command Design

## 0. 定位与事实源

ResearchSpec companion 是 CLI 之上的 agent-facing workflow 层。它负责理解意图、
组合只读视图、解释证据与风险、识别停止点、向用户取得明确选择，并在写后复查。
CLI 仍是 schema validation、target resolution、dry-run、write plan、receipt、registry、
ledger、lifecycle 与 generated ownership 的唯一确定性执行入口。

实现事实源位于 `src/adapters/companion/`：一个 typed manifest 注册全部 workflow，
每个 workflow 由独立 TypeScript 模块维护，通用 CLI 纪律在 build 时内联。最终安装的
skill 是自包含的，不依赖 companion runtime reference、script、database 或 LLM API。

ARSU 与 companion 是两组独立 intent。ARSU 负责文献研究、证据综合、论文写作、
稿件审查、revision strategy 和 manuscript draft-patch authoring；companion 负责安全地
导航和操作 ResearchSpec contract lifecycle。

## 1. 默认 8-Skill Surface

| ID | Skill | 主要触发 | 不负责 |
| --- | --- | --- | --- |
| `explore` | `researchspec-explore` | 理解 workspace、contracts、claims、artifacts、gates、decisions | 外部文献研究、写入 |
| `propose` | `researchspec-propose` | 把高影响语义变更变成 pending contract change | 接受或应用 change |
| `check` | `researchspec-check` | deterministic validation、diagnostic 分类与授权修复 | semantic readiness、论文审稿 |
| `verify` | `researchspec-verify` | evidence-linked coherence/readiness scorecard | schema 修复、稿件 peer review |
| `next` | `researchspec-next` | 跨会话恢复并给出一个首选下一步 | 执行决定、归档或 stage transition |
| `context` | `researchspec-context` | 在 handoff stdout/write 与 pack 之间选择 | 修改 SSOT、任意备份 |
| `decide` | `researchspec-decide` | review、dry-run、确认、accept/reject/postpone | author proposal/draft patch |
| `archive` | `researchspec-archive` | resolved evidence 检查与 lifecycle archive | 补造 receipt/gate/decision |

不为 `setup`、`init`、`update`、`status`、`list`、`show`、`handoff`、`pack`、`apply`
单独建立 skill。前两者发生在 project-local skills 可用之前；其余是八个 workflow 内部
按意图组合的机械命令，单独暴露只会造成重叠触发或绕开安全流程。

## 2. Source Architecture 与 Skill 厚度

```text
src/adapters/companion/
  types.ts
  shared-guidance.ts
  manifest.ts
  render.ts
  index.ts
  workflows/
    explore.ts
    propose.ts
    check.ts
    verify.ts
    next.ts
    context.ts
    decide.ts
    archive.ts
```

- Workflow module 拥有完整 canonical instructions；不把八个 skill 的正文塞入一个文件。
- Manifest 是唯一注册表，提供稳定 ID、skill ID、description、metadata 与 workflow body。
- `shared-guidance.ts` 只保存真正跨 workflow 的 authority、selector、confirmation 和
  failure-class 纪律，由 renderer 内联到每个 `SKILL.md`。
- Command projector 使用同一 manifest，只生成“调用已安装 skill”的短 wrapper，不复制
  workflow。

每个 `SKILL.md` 必须包含 Mission、When to Use、Do Not Use、Inputs、CLI Examples、
Workflow、Decision Table、Failure Recovery、Output Contract、Guardrails、Completion 和
内联 Shared CLI Discipline。厚度以状态分支、停止条件和可执行性审查，不以行数或全文
snapshot 审查。

## 3. 公共执行纪律

1. 使用最近的 `researchspec/` workspace；用户指定 `--workspace` / `--cwd` 时服从显式值。
2. Inspection 与 preview 使用 JSON envelope，按 `ok/data/diagnostics/error` 解释。
3. 使用 `status/list/show` 获取 canonical selector；候选不唯一时停止并让用户选择。
4. Decision event 是导航 evidence，必须映射回 `change_id`、`draft_patch_id` 或 `gate_id`。
5. 写 workflow 先收集完整 semantic payload，再运行完整命令的 `--dry-run --json`。
6. 向用户解释 before/after meaning、paths、evidence 与风险，取得明确确认后才执行同一命令。
7. `--yes` 只能跳过 pending proposal 等低风险创建 prompt，不能代表 research decision、
   lifecycle override 或 generated-file ownership 授权。
8. 写后用 `show/status/check` 复查权威状态；process exit 不是唯一成功证据。
9. Exit 2 修正参数/schema；exit 1 处理 domain blocker；exit 3 保留 existing target 并处理
   ownership/路径冲突；exit 4 停止并报告可复现内部错误。

不得手写 CLI-owned receipt、registry、ledger、manifest 或 lifecycle status；不得通过降低
claim/gate 语义来让检查通过；不得把 ARSU-derived history/version 文本本身当成阻断。

## 4. Workflow Contracts

### 4.1 Explore

组合 `status`、窄范围 `list`、canonical `show` 和必要的 targeted `check`。输出 observed
evidence、relationships、unknowns、contradictions、options 和下一 owner。只读；当用户
考虑高影响 semantic change 时，只整理 target/current/evidence/impact 并路由 propose。

### 4.2 Propose

先检查当前 target 与 supporting evidence，再生成 strict JSON input。YAML 只允许 dot 与
唯一 `collection[id]` selector；Markdown 只允许 `replace section[Heading]`。运行完整
`propose` dry-run，解释三文件 create-only plan 和 semantic risk，确认后创建 pending
change，再用 show/list/check 复查。它不改 stable specs，也不接受 proposal。

### 4.3 Check

针对 `all/contracts/runtime/artifacts/tools` 运行 deterministic check，按 blocking、severity、
code、path 分组。将修复分为 mechanical、semantic、human-decision：前者在授权后最小修复
并重跑相同 check；semantic 路由 propose；pending choice 路由 decide。`--strict` 只用于
明确要求 zero-warning 的 completion rule。

### 4.4 Verify

以 deterministic check 通过为前置，检查 RQ/scope、sources、claim support/strength/limits、
manuscript constraints、workflow artifacts、gates、decisions 与 lifecycle evidence。每个
pass/concern/blocker/unknown 必须引用 stable ID 或 workspace-relative path。它不写 gate、
report 或文件；schema 问题路由 check，contract change 路由 propose，稿件质量路由 ARSU
reviewer。

### 4.5 Next

固定优先级：blocking diagnostic → blocking gate → pending change/patch → archivable item →
current stage/ARSU skill。只返回一个 primary action 和最多两个次选，包含 owner、evidence、
blockers、inputs 与 completion test。缺少 stage skill mapping 时报告缺失，不猜测。

### 4.6 Context

根据 audience、transport、persistence 选择 `handoff --stdout`、handoff write 或 deterministic
pack。Pack 默认不带 artifacts；只有在 recipient need、privacy/licensing/path safety/size
可接受时才用 `--include-artifacts`。写 variant 必须 dry-run、说明 overwrite/exposure、明确
确认并用 path/hash/manifest 复查。Derived view 不是 SSOT。

### 4.7 Decide

它是唯一 public semantic apply workflow。先消歧并 show item，再收集 decision、human actor
与 reason；使用完整 payload dry-run，检查 target/current value、base hash、evidence、receipt、
registry 和 ledger writes；解释 semantic effect 并明确确认后执行完全相同命令。Accept 时
CLI 会二次运行与 propose 相同的 target resolver，任何 YAML/Markdown current-value drift
都会阻断。写后复查 receipt/status/check。

### 4.8 Archive

只接受 resolved change/patch。检查 matching decision、linked blocking gate、registered
receipt path/hash/content 和 destination collision；dry-run 后解释 source/target 与保留的
ledger/registry evidence，再确认移动。它不补造 evidence，不处理 pending item、current run、
backup 或 OpenSpec change。

## 5. Delivery Matrix

每个 selected tool 的 project-local skill 路径为：

```text
<skillsDir>/skills/researchspec-<id>/SKILL.md
```

- 31 个 registered tools 全部安装 8 个 companion skills 和 4 个 ARSU skill trees。
- 28 个 command-capable tools 生成 8 个 companion wrappers 和 4 个 ARSU wrappers。
- ForgeCode、Kimi、Mistral Vibe 只安装 skills，并产生非阻断 `commands_not_supported`。
- Codex command prompts 延续 registry 定义的 shared-global `$CODEX_HOME/prompts` 路径。
- Markdown/TOML/frontmatter、colon/dash 与参数注入由既有 tool formatter 决定，不新增平台特判。

所有生成文件进入同一 write plan 和 `tool-installation-manifest.json`。Unknown existing path
按 user-owned conflict 保留；manifest-owned hash drift 默认保留；`--force` 只能覆盖已登记
generated file。旧 manifest-owned `references/cli-discipline.md` 不再是 desired output：hash
未漂移则 stale cleanup，用户修改则保留并报告 `generated_file_drift`。

## 6. 验收边界

- Manifest 恰好 8 个唯一 companion IDs，skill 与 command projection parity，ARSU intents 独立。
- 每个 skill 检查必要章节、关键状态分支、CLI example、confirmation、failure recovery、output
  contract 和 near-miss；不锁定全文、hash、行数或大 snapshot。
- Delivery 从 registry 推导 31×8 和 28×8，不为具体工具复制规则。
- `propose → decide accept → receipt/registry/ledger → archive` 有端到端验收。
- Dry-run 无写入、create-only/manifest ownership、drift、force、Codex shared-global 和 stale
  cleanup 均保持现有确定性契约。

## 7. 非目标

- 不引入 runtime LLM API、database、workflow profile、setup/onboard skill 或平台专属 core。
- 不建立 companion scripts、assets、gate、state 或 `agents/openai.yaml`。
- 不让 companion 取代 ARSU semantic research/writing/review，也不暴露低层 registry/ledger
  append 或 stage-transition skill。
