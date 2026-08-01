# Academic Paper Reviewer 用户旅程

本文属于 [ResearchSpec 目标态用户使用预演](../researchspec_user_usage_rehearsal.md)。Reviewer
只读稿件并生产独立评审结果；它不能修改正文、冒充作者或自行选择 editorial branch。

## 1. `academic-paper-reviewer:full`：完整同行评议

从 S3 开始。用户说：“对这篇稿件做一次完整同行评议。”Navigate 确认稿件路径、四份 specs、
review scope、blind-review 边界、利益冲突、输出路径和成本。

```text
Skill/mode: academic-paper-reviewer:full
Outputs: review report、editorial outcome、revision roadmap
Formal Gate: review quality
Cost: medium / single-pass
```

用户确认后创建 reviewer control。Producer 从多个评审视角检查贡献、方法、证据、结构、
写作、伦理与引文，输出：

```text
paper/reviews/
├── round-01-review.md
├── editorial-outcome.md
└── revision-roadmap.md
```

Handoff 说明被审稿件、blind 边界和每份输出。Verify 审查评审完整性与可追溯性，用户确认
review-quality Gate 后，`decide` 保存 Gate。Accept、revision、reject/stop 是另一个明确的
branch Decision；Gate 结论不能自动选择 branch。Reviewer 不修改 `manuscript.yaml` 或正文。

材料泄露作者身份时，Agent 暂停并请求用户决定是否继续非盲评审；不得静默声称 blind。

## 2. `academic-paper-reviewer:re-review`：验证修订回应

从 S5 开始。用户要求验证 round 01 修订。Navigate 读取 revised manuscript、prior review、
response、revision patch 和 handoff；缺少修订稿时 near miss 是 `academic-paper:revision`。

用户确认后，Producer 输出：

```text
paper/reviews/round-01-re-review.md
paper/reviews/round-01-traceability.md
```

报告逐条比较原意见、作者回应、patch operation 和修订稿实际变化，区分 resolved、partial、
unresolved、introduced-risk 与 unverifiable。Patch 是辅助 traceability，不取代对当前稿件的
阅读。

Verify 提出 required revision-completeness Gate，用户确认后 `decide` 写 control。仍需修改
时，用户通过新的 branch Decision 请求 round 02；re-review 自己不创建 revision child，也
不假定最大轮数。回复信声称已改但正文未改时，以正文与证据为准。

## 3. `academic-paper-reviewer:quick`：快速识别严重问题

从 S3 开始。用户说：“先像主编一样快速看，告诉我最严重的三个问题。”Navigate 选择
`quick`，确认关注重点与篇幅，说明它不能替代正式同行评议。

Producer 输出 `paper/reviews/eic-quick-assessment.md`，包含 publishability signal、最高风险、
需要完整评审的问题和信息不足处。路线低成本、single-pass、无 formal Gate。

Handoff 标记 advisory；结果不产生 editorial branch，不更新 claims/manuscript，也不自动
启动 `full`。稿件明显不完整时可以报告 desk-level blocker，但不能伪造完整 review。

## 4. `academic-paper-reviewer:methodology-focus`：方法专项评审

从 S3 开始。用户要求重点检查遥感地表温度与实地气温研究能否合并论证。Navigate 确认
project、claims、manuscript、方法 section、数据可用范围和评审问题。

Producer 输出 `paper/reviews/methodology-review.md`，检查设计适配、测量有效性、混杂、尺度、
统计模型、可重复性和因果措辞。它不扩展成整篇语言编辑。

这是 high-risk route，required methodology-quality Gate 经 Verify 和用户确认后写入 control。
发现致命方法问题时保留 fail；若用户坚持继续，必须由 Decide 记录 profile 允许的 override
和理由。任何 claim 收窄另行更新 stable contract，不能由 reviewer report 自动完成。

## 5. `academic-paper-reviewer:guided`：与用户共同推演评审

从 S3 开始。用户希望边读边讨论，而不是直接收到定稿 review。Navigate 选择 `guided`，确认
用户关注点、互动方式和是否最终需要正式报告。

Agent 按章节提问，用户补充判断，Producer 把证据、意见与可选策略写入
`paper/reviews/guided-notes.md`。讨论中的猜想与个人偏好明确标记，不混为独立 reviewer
结论。

此 mode 成本可变、无 formal Gate。若用户选定高影响 review-response strategy，`decide`
可以记录策略 Decision；普通讨论不写 control Decision。转为 `full` 或 `methodology-focus`
时重新展示路线并确认，不在同一实例里偷换 mode。

## 6. `academic-paper-reviewer:calibration`：Reviewer 校准

用户提供同一研究领域的 gold set、rubric 与待校准 review outputs。该任务不需要当前项目的
paper draft，也不影响当前 pipeline。

Navigate 确认 gold set 的授权范围、盲法、评分维度和长周期成本。用户确认后创建独立
calibration control。Producer 比较问题识别、严重性、证据引用、遗漏、误报与置信度，输出：

```text
paper/reviewer-calibration/
├── calibration-report.md
└── confidence-disclosure.md
```

路线无 formal Gate，结果仅说明 reviewer 在该 gold set 上的表现；它不能为当前稿件授予
review Gate，也不能把校准分数当作未来评审正确性的保证。Gold set 不完整或存在泄漏时，
报告限制并停止相应比较。

## 7. Reviewer 分册验收

- 六个 mode 都保持 reviewer 对稿件只读。
- `full` 的 Gate 与 editorial branch 分开确认。
- `re-review` 必须读取修订稿实际变化，不能只信 response 或 patch。
- `quick`、`guided`、`calibration` 不制造 formal Gate。
- 方法 fail、盲法破坏和 gold-set 泄漏都以显式限制结束，不由 Agent 猜测修复。
