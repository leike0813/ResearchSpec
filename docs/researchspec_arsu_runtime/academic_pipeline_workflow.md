# Academic Pipeline Workflow

## 1. Pipeline 是 ARSU 编排 Skill，但不是状态权威

![Academic Pipeline 当前外层 workflow](diagrams/rendered/academic-pipeline-workflow.svg)

`academic-pipeline` 把 deep research、paper writing、integrity、review、revision、finalization 和 process summary 连接为跨阶段流程。它的 `pipeline_orchestrator_agent` 负责语义检测、mode 建议和 Skill 调度；实际可启动 child、当前 active stage、formal Gate、branch 和 round number 均由 CLI/profile 决定。

生成 Skill 中保留的 ARS 10-stage state machine 是上游语义说明。当前 ResearchSpec profile 使用 8 个 end-to-end stage，mid-entry 时增加一个 entry stage，并把 revise/re-review 表达为可重复的内部 round。发生冲突时必须跟随 status/instructions，而不是上游编号。

## 2. 内部五个角色

| 角色 | 语义职责 | ResearchSpec 边界 |
| --- | --- | --- |
| `pipeline_orchestrator_agent` | 检测材料、建议 mode、调度 child Skill、组织 handoff | 只消费 parent frontier，不能直接推进 state |
| `state_tracker_agent` | 在 ARS 语义中整理完成阶段、材料和 revision 次数 | 不是 `state.yaml` writer；只能生成工作材料 |
| `integrity_verification_agent` | 参考文献、引用、数据、原创性和 claim 完整性检查 | pipeline integrity artifact 的语义生产角色；formal Gate validator 是 `researchspec-verify` |
| `collaboration_depth_agent` | 观察用户协作深度 | advisory，永不成为 blocker |
| `claim_ref_alignment_audit_agent` | 可选抽样核验 claim/reference 和负约束 | 产生辅助 findings，不拥有 Gate/Decision |

固定公开 Agent surface 不包含一个单独的 `integrity_verification_agent` Skill。它是 `academic-pipeline` Skill 内的角色/引用文件。

## 3. 两个公开入口

| Route | 前置条件 | 入口行为 | Gate / cost |
| --- | --- | --- | --- |
| `academic-pipeline:end-to-end` | workflow、project、research goal | 直接进入 research stage | profile-defined integrity、review、final_integrity；high/long_horizon |
| `academic-pipeline:mid-entry` | workflow、project，以及研究材料、draft 或 review feedback 之一 | 进入 entry stage，通过 Decision 选择 research/write/pre-review/revision | 同上；high/long_horizon |

Route catalog 的主交付物是 `submission_package` 和 `process_summary`；它们来自递归 child/work 图，不表示 pipeline 只有两个 work item。

## 4. End-to-end 的当前外层图

| Stage | 当前节点 | 完成后 |
| --- | --- | --- |
| `research` | child `deep-research:full` | `research-to-write` |
| `write` | child `academic-paper:full` | `write-to-pre-review` |
| `pre-review` | pipeline producer 写 `integrity_report`；formal `integrity` Gate | Gate 通过后 `pre-review-to-review` |
| `review` | child `academic-paper-reviewer:full`；formal `review` Gate | `editorial-outcome` Decision 选择 accepted/revision |
| `revision` | 一个或多个内部 revision-round child | round accepted 后 `rounds-to-final` |
| `final-integrity` | pipeline producer 写 `final_integrity_report`；formal `final_integrity` Gate | `final-integrity-to-finalize` |
| `finalize` | child `academic-paper:format-convert` | `finalize-to-summary` |
| `summary` | pipeline producer 写 `process_summary` | `complete-pipeline` |

Pipeline 不硬编码在 core evaluator 中；以上图由 converter-owned `pipelineTemplate()` 定义，core 只解释通用模板、child、Gate 和 transition。

## 5. Parent/child 调度

父 stage 激活后，status 暴露 `subflow:<parent>/<node>`。Navigate 或 pipeline orchestrator 获取 child instructions，并在父 Start 授权范围内执行机械 Start。Child 拥有自己的 work、Gate 和 completion transition；只有 child complete，父 node 才算满足。

父流程不直接运行 deep-research 内部 phase，也不把 child 的 candidate 路径硬编码到 prompt。所有 handoff 通过 registry 中的 artifact identity/hash 和 instructions 声明的依赖完成。

## 6. Mid-entry

![Mid-entry 的选择和前置证据](diagrams/rendered/academic-pipeline-mid-entry.svg)

Mid-entry 先进入 `entry` stage，并通过四条带 branch metadata 的 transition 选择入口：

| Option | 进入 stage | 必需可信 artifact |
| --- | --- | --- |
| `research` | research | 无额外 artifact |
| `write` | write | `synthesis_report` |
| `pre-review` | pre-review | `paper_draft` |
| `revision` | revision | `review_report` |

即使当前材料使某个 option 看起来显而易见，transition 仍带 `pipeline-entry` branch metadata，因此需要 accepted `workflow_branch` Decision。Agent 的材料识别是建议，Decision 才是运行记录。

Material Passport 只允许随确认的 mid-entry Start 导入。CLI 会校验 import basis 并将其投影为外部证据；它不能证明对应 stage 已完成，也不能绕过 pre-review/final integrity Gate。

## 7. Review branch

Review child 完成且父级 review Gate 通过后，profile 提供两个 canonical transition：

- `accepted`：进入 final-integrity；
- `revision`：进入 revision stage。

当前 profile 没有独立 `reject` transition。上游 Skill 中的 Reject、回到 writing 或 abandon 描述属于语义建议；若要改变当前控制图，必须通过后续 profile/spec change，而不能由 Agent 在运行中自行创造分支。

## 8. Dynamic revision round

![动态 Revision Round](diagrams/rendered/revision-round.svg)

内部 `tpl-pipeline-revision-round` 包含：

1. `revise` stage：child `academic-paper:revision`；
2. `revision-to-re-review` transition；
3. `re-review` stage：child `academic-paper-reviewer:re-review`；
4. `revision-outcome` Decision：accepted 或 revision；
5. 完成本轮。accepted 允许父 pipeline 进入 final integrity；revision 使父 frontier 暴露 round `n+1`。

Round number 从可信 parent/child Start receipt 和上一轮 transition receipt 推导，严格递增、没有配置的最大轮数。ARSU 文本中的“两轮上限”“仅一次 re-revise”等限制不是当前外层 enforcement。

## 9. 三个 formal Gates

| Gate | 主要证据 | 作用 |
| --- | --- | --- |
| `pre-review-integrity` | `integrity_report`、`paper_draft`、project/manuscript contracts | 在独立 review 前确认完整性 |
| `review-confirmation` | `review_report`、`editorial_decision`、project/manuscript contracts | 确认 review 证据足以进入 editorial branch |
| `final-integrity` | `final_integrity_report`、最新 `paper_draft`、project/manuscript contracts | finalization 前重新确认完整性 |

每个 Gate 都是 blocking、high risk 且需要用户确认。Integrity agent 产生报告，Verify 根据声明证据提出 verdict，CLI 在用户确认后写 ledger；这三个角色不能合并。

## 10. 完成与恢复

Pipeline 完成要求 summary work 已登记并执行 `complete-pipeline` transition。拥有 formatted manuscript、process summary 文件或 ARS dashboard 都不足以证明 terminal completion。

暂停后，新会话按以下证据恢复：

- `state.yaml` 的父子实例和 active stage；
- registry 中 child/work artifacts 和 receipts；
- Gate/Decision ledger 的最新可信事件；
- evaluator 重新计算的 scoped frontier。

Pipeline dashboard、state tracker 输出和 handoff 可以帮助人阅读，但不得覆盖上述证据。
