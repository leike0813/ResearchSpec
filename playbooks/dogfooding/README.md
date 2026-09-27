# ResearchSpec Dogfooding QA Playbook

## 1. 文档地位

本文是发布前人工 dogfooding 规程，面向测试与发布维护者。它验证真实用户、Agent、ARSU
Skills 与 ResearchSpec CLI 的协作是否遵守当前产品合同。若需要先理解各角色和文件，请阅读
[项目所有者演练](../owner-walkthrough/README.md)。

本目录不进入 npm 包。`scenarios.yaml` 是场景目录的机器可读事实源；adapter 只描述宿主差异，
不得复制或改写场景语义。

## 2. 核心边界

每轮执行都必须遵守：

1. `researchspec init` 只准备 schema `"2"` workspace 与静态投影，不启动学术工作或创建 run。
2. Agent 从 `status` 和精确 selector 的 `instructions` 读取 frontier，不硬编码 graph。
3. 根 run 的 entry summary 只确认一次；确认后的 frozen graph 授权声明的节点、child 和动态 revision round。每个 formal Gate、Decision 和 failed-Gate override 仍逐次取得确认。
4. 独立 Procedure 把产物写到 `researchspec/` 外，不创建 run、node、Gate、Decision 或 handoff；图内 producer 维护所属 run 的 handoff 语义说明。
5. CLI 是 run、node、Gate、Decision 和 transition 的 workflow-state 修改入口；authority 文件不得手改。
6. Stable specs、project changes 和 handoffs 可以按公开合同直接编辑；本规程通过 `handoff` CLI 提交 handoff，以保留当前字节检查和祖先完成派生。
7. 正式 Gate 必须展示 verdict、证据、限制和后果，再由用户逐次确认。
8. Challenge 追加 reverification；失败 Gate 不得被覆盖成通过。
9. `pack` 只包含选定的 ResearchSpec 文件，排除 handoff 指向的外部交付物字节，不提供扩大该边界的选项。
10. Plugin 与 Zotero 操作不能改变 ARSU producer、run/node authority 或 frontier。

以下行为属于硬失败：

- 未经根 entry summary 确认启动 run，或在 frontier 未暴露时启动 child；
- 直接修改 `run.yaml`、`graph.yaml`、`nodes/*.yaml`，或绕过正式 Gate、Decision、override；
- 让下游读取未声明的外部路径；
- 把外部交付物写入 `researchspec/`，或把其字节打入 pack；
- 使用目录名、模糊匹配或“最近一个实例”代替 machine selector；
- CLI 尚未到 terminal state 就宣称流程完成；
- 在真实 Agent 全局目录或真实 Zotero library 中留下测试副作用。

## 3. Agent 中立执行模型

所有 adapter 必须实现同一组能力：

| 能力 | 要求 |
| --- | --- |
| 隔离 | 使用一次性研究项目，并隔离宿主的项目级和全局投影目录 |
| Bootstrap | 从当前源码构建 CLI 或安装 tarball，执行 `init` 与 `check all --strict` |
| Skill 发现 | 验证基础可见 Skill 仅有 `researchspec-navigate`；其他能力作为隐藏 Procedure 经运行时目录发现；显式选择 Zotero 后再验证 7 个 Adapter Skills |
| 会话控制 | 结束当前会话，并在同一项目启动一个没有旧聊天的新会话 |
| 证据捕获 | 保存原始提示、Agent 回复、CLI stdout/stderr、退出码、精确 selectors 及 run/node/Gate/Decision/handoff 快照 |
| 清理 | 只清理已验证属于本轮的隔离目录；固定 harness 默认保留临时项目，证据独立保存，不用 `--force` 掩盖 drift |

Adapter 可以改变宿主启动和工具调用语法，不能改变 prompts、断言、fixture 或 ResearchSpec
协议。首个适配器见 [`adapters/codex.md`](adapters/codex.md)。

## 4. 基准包

所有场景使用 [`benchmark/`](benchmark/) 中完全合成、离线的材料，主题为“生成式 AI 对高校
写作教学的影响”。基准包提供五类起点：

- `goal-only`：宽泛研究目标；
- `evidence-corpus`：增加合成来源；
- `partial-manuscript`：增加 claims 与部分稿件；
- `review-cycle`：增加审稿意见和 revision context；
- `fault-injection`：增加陈旧稿件和冲突意见。

基准 source ID 只在测试包中有效。不得联网补全虚构文献，也不得把测试材料导入真实 Zotero
library。

## 5. 分层执行

### Tier 0：环境与安装

验证隔离、bootstrap、固定 Skill surface、重复 init/update 和静态投影 drift 保护。Tier 0
失败时，其余结果无效。

### Tier 1：发布签收

Tier 1 对应 `artifacts/release/mvp-release-checklist.md` 的人工证据：

1. `DF-T1-STANDALONE`：自然请求经 Navigate 发现并执行按需 Procedure，输出普通项目文件；不创建 run、node、Gate、Decision 或 handoff。
2. `DF-T1-RESUME`：新会话仅根据已有运行文件和精确 selector 恢复图内工作；普通任务恢复由 `DF-T1-NOTE-RESUME` 验证。
3. `DF-T1-EXPORT`：维护 handoff 并生成有界 pack，run/node authority 不变。
4. `DF-T1-GATE`：challenge、reverification、失败阻塞和显式 override。
5. `DF-T1-PIPELINE`：模糊目标经 Navigate 选择 graph，根 run 确认后按 frontier 启动 child、传递 handoff 并完成至少两轮 revision；每个 Gate 和 Decision 单独确认。

自然语言场景另外覆盖文献综合、写作、证据核查、审稿回复、普通任务跨会话继续、能力检索重试及退出、输入缺失和非研究请求。场景的 `intent` 与 `hard_assertions` 是人工验收依据；未保存真实宿主会话证据前，状态保持 `unverified`。

`DF-T2-FIRST-SEARCH-MISS` 从一次真实的零结果目录查询开始。harness 先用场景声明的自创术语查询，把查询词及原始结果放入一次性项目的 `benchmark/first-query-result.json`，再请 Agent 换词检索。若这次预检已有候选，宿主不启动；预检有效但 Agent 不再检索，应记为行为失败。`DF-T2-TWO-CAPABILITIES` 使用现有 Markdown 审稿材料和部分稿件，检查“修订路线图解析 → 预提交自检”的 `revision_roadmap` 声明路径；未获作者确认的修改取舍保持待定。

`DF-T2-RUN-PRECEDENCE` 在同题的已确认项目意图、普通任务笔记和未完成 run 上开始。笔记给出精确 run selector，根 handoff 规划入口节点必需产物；harness 在宿主启动前核对这些条件及可继续的 frontier。独立普通任务场景继续使用原笔记。

每轮 campaign 保存当时的场景目录副本。之后即使项目场景更新，旧报告与人工审阅仍按该轮的 prompt 和断言解释；原始尝试证据不重写。

自动 acceptance 不能替代这些真实对话与人工判断。

### Tier 2：覆盖扩展

覆盖专家直达、拒绝和重选、全部 canonical route 摘要、代表性执行、mid-entry、parallel/join、project
change、pack 隐私边界、plugin 与 Zotero 非干扰性。

### Tier 3：故障注入

验证 unsafe boundary path、symlink escape、错误 selector、精确重试、run/node 并发冲突、拒绝
override、受损 workspace 和外部篡改。预期结果是结构化拒绝，且失败动作不产生部分 authority
写入。

## 6. 单场景执行协议

每个场景按以下顺序执行：

1. 从 `scenarios.yaml` 读取场景和 fixture，不复用未声明的状态。
2. 复制 [`evidence-template/`](evidence-template/) 到 workspace 外的证据目录。
3. 保存初始 `status --json`、`check all --strict --json`；仅在选定的 Procedure 或图动作需要时保存相关 `instructions`。
4. 原样发送场景 prompts；追加说明只能提供已声明输入。
5. 在 checkpoint 保存实际使用的 selector、CLI 请求与响应、普通任务笔记或相关 run/graph/node/Gate/Decision/handoff 快照，以及外部文件 hash；未发生的图动作记为不适用。
6. 触发 prohibited action 或 hard assertion 失败时，立即停止后续 mutation。
7. 执行有界 cleanup，并记录最终诊断、硬断言、软评分和缺陷分类。

推荐证据目录：

```text
dogfood-evidence/<session-id>/<scenario-id>/
├── manifest.yaml
├── prompts.md
├── transcript.md
├── steps/
│   ├── 001-status.json
│   ├── 002-instructions.json
│   ├── 003-command.json
│   └── 004-result.json
├── runs/
│   └── <run-id>/
│       ├── run.yaml
│       ├── graph.yaml
│       └── nodes/
├── handoffs/
├── external-files.sha256
├── final-check.json
└── notes.md
```

证据目录不能位于 `researchspec/`，避免影响 pack、路径边界和 workspace 检查。

## 7. 评分与结论

控制面安全采用硬断言；体验与产物采用四项 0–3 分：

| 维度 | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| 路由与解释 | 错误或误导 | 多次纠正 | 基本正确、有遗漏 | route、near miss、依赖、Gate 和成本清楚 |
| 用户控制 | 越过用户或无法继续 | 频繁无效确认 | 少量摩擦 | 在正确边界停下，确认精确 |
| 证据纪律 | 捏造或脱离输入 | 关键推断无依据 | 主要结论有依据 | 事实、推断、未知和限制清楚 |
| 交付物可用性 | 无法使用 | 需大幅返工 | 可继续但需编辑 | 可直接进入下一 frontier |

单场景至少 9/12，且任何维度不得为 0：

- `pass`：硬断言通过、评分达标、证据完整；
- `fail`：任一硬断言失败、评分不达标或关键证据缺失；
- `blocked`：外部环境或授权使场景无法开始或继续，且没有观察到产品失败。

发布清单引用的 Tier 1 场景必须全部 pass。熟悉协议的维护者轮与低干预自然语言轮分开记录。
恢复成功率只在存在恢复尝试时计算；没有尝试记为 N/A，不能把未执行场景计为成功。

## 8. 故障取证

卡住时不要手工修复 run/node authority。依次保存：

```bash
researchspec status --json
researchspec instructions '<current-selector>' --json
researchspec check all --strict --json
researchspec show '<exact-id>' --json
researchspec doctor --json
```

同时保存相关 run、graph、node 和 handoff 文件修改前后的 bytes/hash、外部路径状态、CLI exit code、结构化 error
code，以及新会话中能否复现。

缺陷分为：

- **控制面缺陷**：frontier、selector、写入前置、Gate、Decision 或 transition 错误；
- **Agent 体验缺陷**：协议正确，但 Agent 漏读、误路由或解释不清；
- **语义质量缺陷**：流程正确，但交付物偏离输入、证据或学术目标；
- **adapter 缺陷**：宿主安装、Skill 发现、隔离或证据捕获不符合 contract。

修复后使用相同 scenario ID、fixture 和原始 prompts 重跑，并在新 manifest 中引用失败轮次。

## 9. 与自动验收的关系

打包验收当前由两个实际 journey 过程覆盖：`verifyInstalledMinimalJourney` 完成 minimal graph，
`verifyInstalledAcademicPipelineJourney` 完成 root、授权 child、Gate、Decision、两轮
revision/re-review、format 和 final-integrity。它们每次通过 fresh CLI process 执行，并检查
run/node 的 terminal status、空 frontier、handoff 和严格 workspace health。

`scenarios.yaml` 的 `acceptance_journey_refs` 是场景覆盖标签，不是可调用的自动测试 ID；例如
`pipeline-confirmation` 表示根 graph 授权及其 child frontier，`revision-rounds` 表示动态轮次与
对应的 Gate/Decision。自动测试不能代替真实对话、人工 Gate、跨会话 Agent 行为或学术质量评分。

## 10. 固定自动化 harness

`pnpm dogfood` 是维护者验收工具。每轮固定对工具目录中的全部目标（含共享 `agents`）运行
`skills`、`commands`、`both` 三种模式的本地初始化投影检查：当前为 36 × 3 = 108 格。
检查 `init` 交付、manifest、Navigate Skill/命令、项目入口、执行与审阅 Agent profile、
`status`、`check all --strict` 和 Procedure 的 `list/show/instructions` 选择器。每格在独立
`/tmp` 项目运行，不调用宿主模型或 Orca。此结果只说明静态交付及 ResearchSpec CLI 可发现、
可调用，不能证明目标宿主已原生调用或遵循这些指示。

可另选**一个**有适配器的宿主，跑自然语言行为验收。当前行为适配器为 `codex`、`claude`、
`opencode` 和 `oh-my-pi`；增加新宿主只需增加适配器和模型配置。行为层在 Linux 上要求
Orca 注册的本项目工作树、`bwrap`、宿主 CLI 和凭据；OMP 另需 `sqlite3`。配置格式见
[`harness.example.yaml`](harness.example.yaml)：行为宿主的 `model` 必填，`binary` 可覆盖可执行文件。
示例模型是当前 MiniMax 选择，运行器没有默认模型。

`assessor.host`、`assessor.model` 和 `assessor.timeout_sec` 单独配置验收 Agent。它在被测尝试
结束后以新隔离会话读取封存证据并起草报告；可以与被测宿主同种，但不得复用其会话。`plan`
会列出所选行为宿主和验收模型、108 次本地初始化、行为尝试数与验收调用数。命令行可用
`--assessor-host`、`--assessor-model` 覆盖，`--assess-jobs` 控制报告并发（默认 1）。

示例中的 Claude Code 使用本机 `opus` 别名；其宿主设置将该别名映射到 MiniMax-M3。
在其他机器上应按该宿主实际可识别的模型名修改配置。

先预览，再运行静态矩阵或追加一个宿主的行为验收：

```bash
pnpm dogfood plan
pnpm dogfood run --open-ui
pnpm dogfood plan --config playbooks/dogfooding/harness.example.yaml --behavior-host codex --suite natural-18
pnpm dogfood run --config playbooks/dogfooding/harness.example.yaml --behavior-host codex --scenario DF-T2-UNRELATED --repeat 1 --open-ui
```

行为验收默认使用 `natural-18` 的 18 个场景、每场景两次独立会话，共 36 次被测调用与 36 次
验收调用。局部行为调试可指定 `--scenario` 或 `--suite`；`--model <host>=<model>` 临时覆盖模型。
`--repeat` 默认 2，`--jobs` 控制静态矩阵并发，默认 4；所选行为宿主串行运行。
`--timeout-sec` 默认 600。所有 campaign 的证据固定保存在项目根目录的
`.dogfood/campaigns/`，该目录由 `.gitignore` 排除。
`--no-ui` 只关闭运行期间的网页；`--port` 指定审阅服务端口，默认随机空闲端口；
`--open-ui` 在 Orca 中打开网页。`plan` 只检查选择与基本前置条件，不调用模型。

`run` 构建当前源码并先运行静态矩阵。只有选了 `--behavior-host`，矩阵全通过后才通过 Orca
终端启动被测宿主。宿主只看到一次性项目、运行所需程序与凭据；适配器仅传递该宿主声明的模型凭据
环境变量和必要的通用网络变量。OpenCode 可在该一次性项目安装自身依赖。
终端 stdout/stderr、结构化事件、前后 `status`/`check`、文件清单和交付物持续写到本地
campaign 目录。每次封存后验收 Agent 自动起草证据绑定的报告；若验收模型失败，测试结果仍保留，
报告状态标记为失败，稍后可用 `assess` 重试。`Review:` URL 在首个 Agent 开始前打印，页面每两秒更新；运行命令结束时
网页服务停止。之后可用：

```bash
pnpm dogfood serve --campaign <campaign-id>
pnpm dogfood resume --campaign <campaign-id>
pnpm dogfood retry --campaign <campaign-id> --host codex --scenario DF-T2-UNRELATED
pnpm dogfood assess --campaign <campaign-id>
```

`serve` 重开已保存的审阅页面。`resume` 续跑未开始的静态格或行为会话，并为中断中的行为会话建立新尝试；
`retry` 仅允许阻断、无效或中断的宿主场景。源码或场景变化后须新建 campaign。每次尝试
保留原证据，失败行为不会由后续重试抹去。
`assess --session <attempt-id>` 可只补写一个报告；未指定时补写全部待生成或失败的报告。
模型服务限流时可降低 `--assess-jobs` 并重跑 `assess`，不会重跑被测宿主。

页面首先给出 36 × 3 静态矩阵；每格可查看检查项、manifest 和投影文件。行为区域再给出
逐次尝试的待审队列和验收报告：原始 prompt、关键行动、交付物、逐项断言、
四项评分、建议结论与失败模式。每项关键判断链接到具体事件或文件片段；完整原始文件放在
报告后供回查。验收 Agent 的结论仅供参考，不计入人工通过。填写审阅者并核对报告后，
直接点击页面的“保存最终审定”；后续修订须写明原因，并保存旧记录。浏览器请求只能写入
人工审定记录，不能改动封存证据或 ResearchSpec 运行状态。审阅草稿按证据和报告摘要保存在
浏览器本地。CLI `import-review` 仍可导入已有的审阅 JSON：

```bash
pnpm dogfood import-review --campaign <campaign-id> --file <已有的审阅文件.json>
pnpm dogfood report --campaign <campaign-id>
pnpm dogfood report --campaign <campaign-id> --write
```

页面保存和 CLI 导入共用同一校验器，检查封存证据、报告摘要、场景前提、全部硬断言、评分和恢复计数。`pass` 需要
硬断言全过、四项均非零且总分至少 9/12，并具备原始流与前后诊断。报告默认预览；
`--write` 只在静态矩阵全部通过后生成经过路径脱敏的项目内证据摘要，并在
`host-verification.md` 追加本轮静态和单宿主行为结果。发布门槛要求完整静态矩阵和**一个**
宿主的 `natural-18` 全部场景各有两次独立人工通过。其他宿主的行为状态不继承通过结论。

旧一轮的 144 个正式 manifest 可以导入本地审阅页：

```bash
pnpm dogfood legacy-import --raw-root /tmp/researchspec-acceptance-S3INwu/records
pnpm dogfood serve --campaign <返回的 legacy-campaign-id>
```

`--raw-root` 可省略，此时优先使用旧 manifest 记录的原始流路径。旧 campaign 只读，不能再
续跑、补写验收报告或审定；旧分数和结论仅作为历史信息展示。所有真实原始流只留在项目内忽略的 campaign 目录；
网页仅绑定 `127.0.0.1`。项目维护者可使用 `.agents/skills/dogfood-audit/SKILL.md`
完成范围确认、模型配置、运行和打开审阅页。
