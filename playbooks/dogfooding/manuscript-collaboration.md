# 稿件协作行为验收手册

本手册描述 `scenarios.yaml` 中 `manuscript-collaboration` 套件的**人工多轮**执行方式。
套件场景的 `prompts` 只是第一轮文本；凡是需要用户答复的步骤，都必须作为**后续独立轮次**
发送，不能拼进第一轮。现有 runner 会把 `prompts` 拼成一个非交互提示，因此这些场景的
完整验收只能在真实宿主会话里人工完成。

## 1. 状态声明

| 项目 | 状态 |
| --- | --- |
| 场景与 fixture 交付 | 已交付（`playbooks/dogfooding/scenarios.yaml` + `playbooks/dogfooding/benchmark/collaboration/`） |
| 宿主行为验收 | **NOT RUN**。未在任何宿主上执行过，不构成任何目标的行为通过结论 |
| 自动认证 | 无。静态检查只能说明材料可读、字段齐备，不能证明 Agent 行为 |

`natural-18` 套件与既有场景保持不变。本套件是新增的独立套件，不改默认套件计数，
默认行为套件仍是 `natural-18`。

## 2. 材料与合成声明

`benchmark/collaboration/` 下全部内容都是合成离线测试材料，不是真实研究、真实论文或
真实出版物。`SYN-*` source ID 不对应 DOI、期刊或作者。Agent 不得联网补全这些来源，
也不得把它们作为真实引用传播。

两个新增 fixture：

- `confirmed-delivery-note.md`：本任务中用户**自己的先前答复**记录。它是普通任务上下文，
  不是 stable spec，不是 run、node、Gate 或 Decision，也不授予任何工作流权限。Agent 只能
  把它当作已确认偏好读取，不能从中推导图状态。
- `qmd-draft.qmd`：已确认格式的 QMD 稿件，含章节结构与 `<!--ref:...-->` /
  `<!--anchor:...-->` 证据标记。标记值是 `benchmark/sources.yaml` 中合成来源语句的精确
  子串。

## 3. 通用准备

每个场景使用一次性隔离项目，按 [`README.md`](README.md) 第 6 节和
[`adapters/codex.md`](adapters/codex.md) 执行：

```bash
researchspec init <project> --tools <host> --delivery both
researchspec status --json
researchspec check all --strict --json
```

按场景的 `fixture_variant` 复制 `benchmark/` 下的材料。证据保存到 `researchspec/` 之外，
目录结构沿用 `evidence-template/`。保存首轮原始提示、每轮后续答复、transcript、
工具调用轨迹、工作前后 `status` / `check`、外部文件清单与哈希。

评分沿用 [`README.md`](README.md) 第 7 节的四项 0–3 分与 9/12 门槛，`hard_assertions`
全过才算 `pass`。没有真实宿主会话证据前，状态保持 `unverified`。

## 4. 场景与轮次

### 4.1 `DF-T1-COLLAB-TOPIC`：只给主题

fixture：`goal-only`。

第一轮（场景 `prompts`）：

> 我想写一篇关于生成式 AI 对高校写作教学影响的论文。现在还没有确定研究问题、写作方式或者
> 最终要交什么，先帮我看看这件事该怎么开始。

本轮结束即预期结果：Agent 读取 `benchmark/goal.md`，讨论研究问题方向，并就尚未确定的
工作源格式、最终交付物、引用风格和投稿去向提出聚焦问题，然后停下等待用户。

后续轮次（人工，可选，用于记录继续对话）：

> 工作源用 QMD，最终交给我本地渲染的 PDF，引用用 IEEE，暂时没有投稿去向。

记录重点：Agent 是否先检查材料再提问、问题是否聚焦在未确定的交付选择、是否没有在第一轮
写出完整稿件。

### 4.2 `DF-T1-COLLAB-CONFIRMED`：已确认设置复用

fixture：`collaboration-confirmed`。

第一轮（场景 `prompts`）：

> 项目 benchmark/collaboration/ 下有我此前确认过的交付记录和当前 QMD 草稿。请按已确认的设置
> 继续写这篇论文。

本轮结束即预期结果：Agent 读取 `confirmed-delivery-note.md` 与 `qmd-draft.qmd`，说明它沿用了
已确认的方向、QMD 工作源、PDF 最终交付、IEEE 引用风格与本地语料证据范围，然后产出稿件。

后续轮次（人工，用于观察偏好复用）：

> 引用风格还是 IEEE，工作源还是 QMD，其他都不变。

记录重点：是否复用而不是重新访谈、是否避免强制外部检索、产出稿件是否保留章节结构与证据
标记、工作源格式与最终交付物是否仍被区分。

### 4.3 `DF-T1-COLLAB-EVIDENCE-GAP`：证据缺口

fixture：`partial-manuscript`。

第一轮（场景 `prompts`）：

> 请把这份草稿的引言和初步结果写完整，我需要一版可以发给合作者的稿件。

本轮结束即预期结果：Agent 检查 `benchmark/sources.yaml` 与 `benchmark/claims.yaml`，指出
`CLM-02` 缺少支持、`CLM-01` 只有单课程限制、`CLM-03` 未被直接检验，并就“允许的补充研究
范围”与“更窄的论断”给出选项供用户决定。依赖这些论断的正文在决定前不写。

后续轮次（人工，二选一记录）：

> 不要补外部检索，按已有证据收窄 CLM-02，保留原材料中的限制。

或：

> 我可以补充外部文献，请按被许可的范围先说明需要哪些材料。

记录重点：是否先核查语料再讨论、是否区分支持/矛盾/缺口、是否没有编造出版物、是否在用户
决定前没有抢先写完依赖正文。

### 4.4 `DF-T1-COLLAB-REVIEW-CHOICE`：审阅方式选择

fixture：`review-cycle`。

第一轮（场景 `prompts`）：

> 请按这些审稿意见修改我的稿件，并说明每处改动。

本轮结束即预期结果：Agent 主动给出浏览器批注与对话审阅两种选择并停下等待。此时**不应**
出现 `workspace.json`、`review-session.json`、`result.json` 或本地会话进程。

后续轮次分两条互斥分支，分别在独立会话中执行。

分支 A —— 接受浏览器：

> 用浏览器批注。请准备审阅页面并把访问地址给我。

预期：Agent 在此后才准备冻结工作区与本地会话，交付 `127.0.0.1` 地址和 `result_path`。
用户在页面提交后，Agent 读取提交回执的 `history_path` 指向的**不可变历史文件**
（`results/<submission-id>.json`），而不是可被后续提交覆盖的 `result.json`；它对照保留的 `workspace.json`
与当前源文件独立校验，再把接受的反馈应用到原任务，并单独取得正式 Gate 与 Decision 的
人工确认。

分支 B —— 拒绝浏览器：

> 不用浏览器，请在对话里逐条跟我确认这些意见怎么改。

预期：Agent 在对话中完成同一审阅，不准备审阅工作区，也不把浏览器当作流程前提。

源文件变化的快照校验**只适用于分支 A**：分支 A 有冻结清单可比对，提交反馈后再修改稿件
源文件，然后让 Agent 处理剩余反馈，预期 Agent 展示差异与受影响的批注，并在改动前询问，
而不是直接套用旧定位。分支 B 没有冻结工作区和清单，不要求它做这一比对。

### 4.5 `DF-T1-COLLAB-MINOR-EDIT`：有界措辞修改

fixture：`partial-manuscript`。

第一轮（场景 `prompts`）：

> 请把草稿 Preliminary findings 里讲 instructor workload 的那句话（Interview summaries also
> suggest that faster feedback may be offset by verification work.）改得更通顺一些，含义、论断强度和
> 现在的文件格式都不要变，改完另存一份。

本轮结束即预期结果：Agent 直接完成修改并另存为独立文件，原草稿不变。没有完整访谈问题，
也没有审阅工作区或浏览器会话。论断强度、章节结构与文件格式保持不变。

后续轮次（人工，用于确认没有遗留未决选择）：

> 保持现在的文件和引用格式就好。

记录重点：走的是简化路径而非完整访谈；产出为独立文件；没有强制浏览器审阅。

## 5. 证据采集要求

除 `scenarios.yaml` 中各场景的 `required_evidence` 外，多轮场景必须额外保存：

| 证据 | 内容 |
| --- | --- |
| `turn-log.md` | 按顺序记录每轮发送的原始文本与时间，第 2 轮及以后为用户答复 |
| `awaiting-user` | Agent 停下等待用户决定的位置（回合结束点、用户答复内容） |
| `review-artifact-check` | 审阅工作区、会话文件、结果文件在每一轮前后的存在性检查 |
| `source-change-check` | 提交反馈后源文件被改动时，Agent 展示的差异与询问记录 |

审阅分支 A 必须记录会话 URL、`workspace.json` 路径、`result_path` 与 `results/` 历史目录，
并证明 Agent 在应用反馈前读的是该次提交的不可变 `history_path`（`results/<submission-id>.json`）
而不是可变的 `result.json`，且做过独立校验。分支 B 不要求 `workspace.json`、`result_path`
或历史目录。

## 6. 不做的事

- 不用静态字符串断言代替真实对话；静态检查不能证明模型行为。
- 不把第一轮提示与未来答复拼接。
- 不在本手册或场景目录中声明任何宿主已通过。
- 不为验收修改生产代码、断言、依赖或 CI。
- 不在真实 Agent 全局目录或真实 Zotero library 留下测试副作用。
