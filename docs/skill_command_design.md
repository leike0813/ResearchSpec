# ResearchSpec Skill / Slash Command Design：CLI Companion 设计

## 0. 文档状态与事实源

本文定义 ResearchSpec CLI 的 companion skill / slash command 设计。它不是实现级
adapter path 规格，也不冻结具体命令文件模板、JSON stdout shape、exit code 表或
TypeScript DTO。

事实源：

- CLI interface：`docs/cli_interface_design.md`
- Product requirements：`docs/prd_proposal.md`
- Architecture：`docs/arch_design_proposal.md`
- Contract schemas：`docs/contract_schema_design.md`
- Workflow-contract mapping：`docs/arsu_workflow_contract_design.md`
- Project rules：`AGENTS.md`
- OpenSpec reference：`references/OpenSpec`

OpenSpec 的重要参考不是命令数量，而是职责分离：terminal CLI 是稳定执行引擎，
agent chat 中的 skill / slash command 是高摩擦流程的方向盘。ResearchSpec 采用
同一原则，但不机械镜像 CLI 命令。

## 1. Companion 定位

ResearchSpec companion commands 是由 `researchspec init` 或 `researchspec update`
安装到用户选择的 agent tool 中的 agent-facing 指令。它们帮助 agent 正确调用 CLI、
解释诊断、读取必要上下文、向用户确认高影响决策，并在遇到格式不规范、spec 冲突或
缺失记录时进行语义修复。

Companion commands 不替代 CLI：

- CLI 负责 workspace 发现、schema/check、dry-run、写入、归档、handoff 渲染和
  machine-readable 输出。
- Agent 负责理解用户意图、解释检查结果、判断修复路径、整理风险、请求用户确认。
- ResearchSpec runtime 的权威文件仍由 CLI、helper、validator 或明确文件编辑产生。

Companion commands 也不替代 ARSU skills。ARSU-derived skills 承担研究、写作、
审稿和修订等语义 workflow；ResearchSpec companion commands 只维护和推进
ResearchSpec contract workspace。

## 2. 选择原则

第一版不为每个 CLI 命令生成 companion。只有满足以下任一条件的操作才值得配
skill / slash command：

| 条件 | 说明 |
| --- | --- |
| 用户手动操作容易漏步骤 | 需要先 list/show/check/dry-run，再确认写入 |
| CLI 可能因材料不规范失败 | 需要 agent 读取 artifact、修复格式或补齐说明 |
| 需要语义判断 | 例如 spec 冲突、claim 影响、gate blocker 的学术含义 |
| 需要人类确认 | agent 必须解释风险并等待用户决定 |
| 失败成本高 | 例如错误接受 contract patch、归档未完成 change、忽略 blocking gate |

不配 companion 的命令：

| CLI command | 原因 |
| --- | --- |
| `researchspec pack` | 机械打包，CLI dry-run 足够清楚 |
| `researchspec handoff` | 生成 rendered view，不需要 agent 介入 |
| `researchspec status` | 常规状态查询可直接运行 CLI |
| `researchspec list` | 常规列表查询可直接运行 CLI |
| `researchspec show` | 常规对象查看可直接运行 CLI |
| `researchspec init` / `researchspec update` | 主要是 terminal TUI 或安装刷新流程 |

不生成这些 companion ids：`researchspec-pack`、`researchspec-handoff`、
`researchspec-status`、`researchspec-list`、`researchspec-show`、
`researchspec-init`、`researchspec-update`。

## 3. 命名与投递

ResearchSpec 使用一个 canonical intent 渲染成不同 agent tool 的命令或 skill：

| Canonical id | Colon slash form | Dash slash form |
| --- | --- | --- |
| `researchspec-check` | `/researchspec:check` | `/researchspec-check` |
| `researchspec-decide` | `/researchspec:decide` | `/researchspec-decide` |
| `researchspec-archive` | `/researchspec:archive` | `/researchspec-archive` |
| `researchspec-next` | `/researchspec:next` | `/researchspec-next` |

工具适配规则：

- 支持 skills 的工具可安装为 skill folder，例如 `researchspec-check/SKILL.md`。
- 只支持 slash commands 的工具可安装为命令文件。
- 支持两者的工具可以同时安装，但两者必须来自同一个 canonical intent。
- 用户只需要记住当前 agent tool 展示的形式；语义以 canonical id 为准。

第一版不冻结具体 adapter 目标路径。路径、frontmatter、metadata 和 generated marker
由后续 adapter implementation spec 定义。

## 4. 通用运行模式

每个 companion command 都遵守同一运行纪律：

1. 定位 workspace，并优先调用 CLI 的 `--json` 或 `--dry-run`。
2. 如果用户未指定对象，使用 `researchspec list ... --json` 或相关 status 输出列出候选。
3. 候选不唯一时询问用户，不猜测、不自动选择。
4. 对高影响写入，先展示 dry-run 摘要和风险，再等待用户确认。
5. 需要修复文件时，先说明诊断、影响和目标 surface，再做最小修改。
6. 写入后重新运行相关 `check` 或 `status`。
7. 最终输出只汇报已发生的写入、仍存在的 blocker 和下一步。

禁止行为：

- 不直接手写权威 JSONL ledger。
- 不手工拼接 CLI 本应生成的 machine-readable 输出。
- 不静默接受 high-impact research decisions。
- 不把 ARS Material Passport 当作 runtime SSOT。
- 不运行 ARSU semantic research/writing/review workflow，除非用户明确调用对应 ARSU skill。

## 5. `researchspec-check`

用途：解释 `researchspec check` 的 diagnostics，判断哪些问题可以由 agent 修复，哪些必须
交给用户决策。

触发：

```text
/researchspec:check
/researchspec:check contracts
/researchspec-check artifacts
```

运行流程：

1. 运行 `researchspec check [target] --json`。
2. 按 blocker、warning、diagnostic 分组解释结果。
3. 标出可机械修复、可语义修复、必须用户决策、应忽略或记录为 upstream diagnostics 的项。
4. 对可修复项提出最小修改计划；高影响合同变化必须转成 pending item 或要求用户确认。
5. 修复后重新运行 `researchspec check [target] --json`。

Agent 可做：

- 解释字段缺失、cross-reference 断裂、artifact path/hash 异常。
- 读取相关 docs/artifacts，判断是否需要 contract patch。
- 对 ResearchSpec-authored docs 或 contracts 做最小修复。

Agent 不做：

- 因 ARSU-derived version/history/changelog 文本直接阻断。
- 为了通过检查而降低 claim/gate 语义强度。
- 静默改写 stable specs。

## 6. `researchspec-decide`

用途：帮助用户处理 pending item，包括 contract change、draft patch、gate override 和
accepted limitation。

触发：

```text
/researchspec:decide
/researchspec:decide <item>
/researchspec-decide <item>
```

运行流程：

1. 如果没有 item，运行 `researchspec list changes --json` 并让用户选择。
2. 运行 `researchspec show <item> --json`，读取相关 artifacts。
3. 概括 item 的来源、风险、将改变的 specs/artifacts，以及是否影响 claims、manuscript
   或 workflow state。
4. 运行 `researchspec decide <item> --dry-run --json`。
5. 向用户请求明确选择：accept、reject 或 postpone。
6. 用户确认后运行 `researchspec decide <item> --json`。
7. 写入后运行 `researchspec status --json`，说明后续是否应 archive。

关键规则：

- 用户没有明确选择时，不得执行 accept/reject。
- 如果 dry-run 显示会修改 high-impact specs，必须用自然语言解释影响。
- 如果 item 内容不完整，先修复或要求补充，不能用猜测填补。

## 7. `researchspec-archive`

用途：归档已处理的 contract change 或 draft patch。它参考 OpenSpec archive 的交互模式：
先选对象，再检查完成度，遇到可修复问题时由 agent 介入，最后 dry-run 与确认归档。

触发：

```text
/researchspec:archive
/researchspec:archive <item>
/researchspec-archive <item>
```

运行流程：

1. 如果没有 item，运行 `researchspec list changes --json`，筛出 resolved items。
2. 候选不唯一时询问用户；不要根据最近对话自动归档。
3. 运行 `researchspec show <item> --json` 和 `researchspec archive <item> --dry-run --json`。
4. 检查是否存在未应用 patch、缺失 decision record、blocking gate、格式不规范或 spec 冲突。
5. 对可修复问题，读取必要文件并提出最小修复；修复后重新 dry-run。
6. 对仍存在的 warning，向用户说明风险并请求确认是否继续。
7. 用户确认后运行 `researchspec archive <item> --json`。
8. 输出归档路径、是否有残留 warning，以及下一步。

Agent 可介入的典型问题：

- pending item 已被人工处理但缺少 receipt 或 decision 引用。
- draft patch metadata 与实际 artifact 不一致。
- contract patch 已合并但 active change 仍未标记 resolved。
- check 输出显示 spec 冲突，需要 agent 读相关 specs 后整理修复方案。

Agent 不做：

- 归档 pending item。
- 把 `runs/current` 整体归档。
- 因为用户说“差不多可以了”就跳过 dry-run。
- 将 archive 当成 pack 或备份命令。

## 8. `researchspec-next`

用途：基于 status/check 解释当前最合理的下一步。它是导航命令，不是执行命令。

触发：

```text
/researchspec:next
/researchspec-next
```

运行流程：

1. 运行 `researchspec status --json`。
2. 如存在 blocker 或 stale diagnostics，运行 `researchspec check --json`。
3. 给出一个首选下一步和最多两个备选项。
4. 如果下一步需要 companion command，给出对应命令。
5. 如果下一步是 ARSU semantic workflow，只说明应调用相应 ARSU skill，不直接执行。

输出原则：

- 不推进 workflow stage。
- 不接受或归档 pending item。
- 不生成 handoff 或 pack。
- 只给出可执行、可验证的下一步。

## 9. Skill 厚度判断

第一版 companion commands 采用轻量 reference-backed / script-assisted 设计：

| 判断 | 结论 |
| --- | --- |
| 为什么不是更轻 | archive/decide/check 需要对象选择、dry-run、诊断解释和用户确认 |
| 为什么不需要更重 | 权威状态和写入由 CLI 管理，不需要独立 gate、SQLite 或长期状态 |
| 升级触发 | 若未来 companion 需要跨 session 恢复、多阶段修复队列或弱模型稳定执行，再拆 gate-driven 设计 |

单个 command 文件应保持短小；共享规则由 generated shared reference 或同源模板注入。
后续实现可以把通用运行模式渲染成每个 tool 的本地格式，但不应让不同 adapter 产生语义漂移。

## 10. 后续实现规格

本文之后应拆分以下 implementation specs：

1. Adapter path and generated file marker rules。
2. Canonical command intent schema。
3. Per-tool rendering templates for skills and slash commands。
4. CLI `--json` result categories consumed by companion commands。
5. `researchspec archive` dry-run failure categories。
6. Companion command drift detection and `researchspec update` overwrite policy。
7. Trigger and near-miss review checklist for generated skills。

## 11. 非目标

- 不设计 ARSU maintenance companion。
- 不为简单机械 CLI 命令生成 companion。
- 不冻结具体 adapter 目录。
- 不冻结完整 slash command 文件格式。
- 不冻结 stdout JSON schema。
- 不引入 runtime LLM API dependency。
- 不让 companion command 直接写权威 registry/ledger。
