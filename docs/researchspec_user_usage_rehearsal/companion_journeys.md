# Companion Skills 用户旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)。五个
Companion 组织路由、CLI 参考、研究 change、验证和人类决定，不生产学术结论，也不建立第二套运行时。

## 1. `researchspec-navigate`

### Route：从模糊目标选择路线

从 S0 开始。用户说：“研究绿地降温，最后写篇论文。”Navigate 读取 stable specs、项目
profile、`status` 与 routing catalog，先补齐研究范围和稿件目标，再说明为什么
`academic-pipeline:end-to-end` 比 standalone `deep-research:full` 更符合跨阶段目标。

它展示 Skill/mode、prerequisites、outputs、formal Gates、risk、cost 和示例路径。用户拒绝时
不调用 `start`；用户调整为“只要快速简报”时重新生成 `deep-research:quick` 摘要。专家直接
指定 mode 时可以跳过候选比较，仍不能跳过前置检查、摘要和启动确认。

### Resume：恢复而不猜测

用户说“继续上次修改”。Navigate 用 `status` 找到未完成实例，再以 `instructions` 读取其
checkpoint。唯一原实例且路线未变时直接恢复；多个候选时列出 `list/show` 的事实差异，请
用户选择。它不从聊天、目录名或 handoff 的“下一步建议”推断 control 状态。

### Explain：只读解释

用户问“为什么现在不能进入 re-review”。Navigate 读取 revision control、handoff、profile
和定向 `check`，解释缺少用户确认的 revision Gate。它区分证据、推断、未知和冲突，不写
诊断文件，也不把缺少 Gate 解释为学术工作失败。

### Export：选择 handoff 或 pack

用户要把当前稿件交给协作者时，Navigate 建议维护当前 subflow handoff；用户要给另一个
Agent 完整 ResearchSpec 上下文时，建议 `pack`。执行前说明输出路径、隐私、外部文件不被
包含以及覆盖风险。Export 不改变 control，也不把 pack 当作恢复权威。

### Navigate 验收

- Route、Resume、Explain、Export 四个分支均使用 CLI-owned 文件事实。
- Navigate 可以推荐 producer、Companion、Zotero 或 plugin，但不能替它们完成语义工作。
- Source-policy、plugin consent、Zotero mutation consent 与 route confirmation 分开。

## 2. `researchspec-propose`

### 高影响研究 change

从 S2 开始。用户说：

> 证据只支持相关性，把因果 claim 和论文结构一起收窄。

Propose 读取 `project.md`、`claims.yaml`、`manuscript.yaml`、相关 synthesis/fact-check 和当前
subflow handoff。它说明涉及 claim wording、contribution 与 structure，适合创建可审阅
change，而不是直接做一次不透明编辑。

用户确认创建后，`researchspec propose` 生成自适应文档包：

```text
researchspec/changes/narrow-causal-claim/
├── change.md
├── design.md
└── delta.yaml
```

`change.md` 是主要事实源；跨三个 specs 且存在结构取舍，因此需要 `design.md`；批量更新
claims 适合用 `delta.yaml` 辅助审阅。Change 初始为 `draft`/`proposed`，不修改 stable specs、
subflow control 或外部稿件。

Propose 运行相关 `check`，再用 `show` 向用户展示 targets、语义 delta、风险、非目标和待决
问题。用户拒绝创建时不产生目录；证据不足时保留 draft，而不是伪造支持。

### Propose 验收

- 普通低风险 spec 编辑不被强制包装为 change。
- 创建 change 不代表接受，更不自动应用。
- Change 不包含 target hash、artifact ID、receipt 或可执行 contract patch。

## 3. `researchspec-verify`

### Readiness 与 formal Gate 建议

Research child 已输出报告。用户问：“这些证据够不够进入写作？”Verify 先运行确定性
`check`，再读取 project、sources、candidate claims、owning control/handoff 和 handoff 指向
的外部报告。

它按 pass、concern、blocker、unknown 组织 finding，每项指向具体路径或证据位置；随后给出
`pass`、`pass_with_conditions` 或 `fail` 建议，并说明每个结论对 `advance` 的影响。Verify
不能自行把建议写成用户确认。

用户确认 verdict 后，Verify 将语义结论交给 Decide/`decide` 写入 owning control。若用户
不同意，可以补证据或要求重新验证；这不是 override。

### Gate challenge

现有 Gate attempt 为 fail。用户认为新补充的敏感性分析解决了问题。Verify 保留旧 attempt，
读取新材料并产生新的 evidence-linked verdict。新 attempt 仍需用户确认。若仍 fail，Verify
只能说明 blocker；用户坚持继续时转交 Decide 处理 override。

### Verify 验收

- 确定性文件检查先于语义判断。
- Finding 指向证据，不使用笼统“看起来没问题”。
- Reverification 追加 attempt，不覆盖历史 fail。
- Verify 不选择 branch、接受 change 或批准 override。

## 4. `researchspec-decide`

### 确认 formal Gate

Verify 已给出 evidence-quality verdict。Decide 读取确切 subflow 与 Gate、展示 evidence、限制
和后果，收集用户的最终结论。`researchspec decide` 只更新 owning `control.yaml`：

```yaml
gates:
  - gate: evidence-quality
    attempts:
      - verdict: pass_with_conditions
        confirmed_by: user
        confirmed_at: <timestamp>
        summary: causal wording remains prohibited
```

它不自动更新 specs、移动报告或推进 checkpoint。随后由 `advance` 独立检查 profile 条件。

### 选择 branch

Review Gate 已确认，profile 暴露 accept、revision、reject/stop。Decide 展示每个选择对下一
child 与成本的影响；用户选择 revision 后，只把 branch 写入 reviewer control。它不立即
创建 revision child，后者仍需单独启动确认。

### Failed-Gate override

Gate 重验仍 fail，用户坚持继续。Decide 要求明确理由，并检查 profile 是否允许 override。
获准时在同一 Gate 下追加批准人、时间与理由；原 fail 保留。Profile 禁止时，命令拒绝，
不能通过改写 branch 绕开。

### 接受并应用 project change

用户审阅 `narrow-causal-claim` 后同意方向。Decide 把 change 标为 `accepted`，记录确认人、
时间和理由；stable specs 此刻仍未改变。

Agent 随后直接编辑相关 specs 并运行 `check`。成功后把 change 标为 `applied`；Git diff 记录
实际变化。Resolved change 可以由 `researchspec archive` 整理。Archive 不归档 ARSU revision
patch，也不检查 registry/receipt。

### Decide 验收

- Gate、branch、override 与 change acceptance 都写入各自 owner，不进入全局 ledger。
- `decide` 不隐含 `advance`、spec apply 或 child start。
- Parent confirmation、`--yes` 或 Agent 推断都不能代替用户语义选择。

## 5. Companion 协作顺序

`researchspec-cli-handbook` 是独立的 CLI/workspace 参考入口。Agent 只要使用、解释、检查或修改
ResearchSpec，就加载该 Skill；Navigate 不再承载 handbook reference。

一个典型阻塞的处理顺序是：Navigate 解释当前 checkpoint，Verify 检查并提出 verdict，用户
确认后 Decide 写 Gate，最后 `advance` 推进。需要改变稳定研究含义时，Propose 先形成 change，
Decide 只接受方向，Agent 再应用到 specs。

五个 Companion 可以在同一旅程中协作，但任何一个都不能吸收其它 Companion 的权限。
