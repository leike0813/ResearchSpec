# 当前实现发现与审阅注记

## 1. 文档定位

本章记录当前代码、generated Skill、OpenSpec spec 和既有设计文档之间的可验证差异。它用于帮助开发者正确阅读系统，不为这些差异提出修复方案，也不改变当前行为。

发现分为三类：

- **文档漂移**：既有文档描述的 current/target 状态与代码不同。
- **两层张力**：ARSU 内层语义过程与 ResearchSpec 外层 profile 粒度或规则不同。
- **能力边界**：当前 deterministic enforcement 比 Skill 的丰富语义要求更窄。

## 2. 覆盖审计

| 项目 | 当前数量 | 来源 |
| --- | ---: | --- |
| 固定 ARSU Skills | 4 | routing catalog / generated Skills |
| Companion Skills | 4 | companion workflow sources |
| 固定 Zotero Adapter Skills | 2 | literature adapter catalog |
| ARSU standalone mode routes | 25 | routing catalog |
| Pipeline entry routes | 2 | routing catalog |
| 公开 route 合计 | 27 | 8 deep research + 11 paper + 6 reviewer + 2 pipeline |
| 内部 workflow template | 1 | dynamic revision round |
| Workflow template 合计 | 28 | workflow catalog |
| 顶层 CLI commands | 16 | `src/cli/main.ts` |
| Profile-level parallel groups | 4 | workflow catalog |
| Required route Gates | 9 | routing catalog |
| Pipeline profile-defined Gate routes | 2 | routing catalog；两种入口复用三类 pipeline Gate |
| Conditional/advisory Gate routes | 6 | routing catalog |
| 无 Gate routes | 10 | routing catalog |

四个 profile-level parallel group 分别位于 deep-research full、lit-review、systematic-review 和 academic-paper full，均使用 `join: all`。ARSU Skill 内部描述的其他并行 agent 不计入该数字。

## 3. Pipeline 的双重阶段叙述

### 3.1 ARSU 内层叙述

生成的 `academic-pipeline/SKILL.md` 保留 ARS 的 10-stage 叙述：Research、Write、Integrity、Review、Revise、Re-review、Re-revise、Final Integrity、Finalize、Process Summary。它还描述有限 revision loops、Reject 分支和 integrity fix/reverify 次数。

### 3.2 ResearchSpec 外层事实

当前 `pipelineTemplate()` 定义的 end-to-end profile 有 8 个 stage：research、write、pre-review、review、revision、final-integrity、finalize、summary。Mid-entry 额外增加 entry stage。Revision 被建模为可重复的内部 round，当前无最大轮数；review branch 只有 accepted 与 revision；profile 没有 Reject transition，也没有 integrity 重试次数上限。

### 3.3 正确解释

ARSU 阶段编号用于解释科研语义和 handoff；ResearchSpec stage/template 用于运行控制。前者不能补充或覆盖后者缺少的 transition。实际恢复和推进只跟随 profile、status 和 instructions。

## 4. Standalone Skills 的 rich phase 未完整投影

Deep Research 的 6 phase、Academic Paper 的 8 phase、Reviewer 的 3 phase 没有逐 phase 变成 CLI stage。每个 standalone template 当前只有一个外层 `work` stage，内部用 artifact DAG 表达可见进度。

因此：

- `research_question_agent`、`bibliography_agent` 等名称不会单独出现在 frontier，除非它们对应的最终 artifact work 被选中；
- reviewer 的五人 panel 是一次 producer 调用内的语义协作，不是五个 CLI work nodes；
- Academic Paper 内部 citation/abstract 并行不等于 profile parallel group；
- Skill 内 phase 完成不能直接作为 work done 证据。

## 5. 默认 artifact DAG 是机械投影

Workflow catalog 仅对八条 routes 提供显式 `GRAPH_PLANS`：

- deep-research：full、lit-review、systematic-review；
- academic-paper：full、lit-review、revision；
- academic-paper-reviewer：full、re-review。

其余 route 的多个 `primary_artifact_types` 默认按照目录顺序建立“当前 artifact 依赖前一个 artifact”的链。这种顺序是当前可执行图，但不证明 ARSU 内部学术方法天然要求该顺序。

## 6. Checkpoint、advisory 与 formal Gate 不等价

ARSU Skill 中存在大量 IRON RULE、用户 checkpoint、编辑判定和质量检查。Routing catalog 还允许 `gate_policy.level: conditional`。当前只有 `required` routes 和 pipeline 专门定义的 Gates 会生成 formal blocking Gate。

Conditional gate kinds 只进入 template 的 `advisory_gate_kinds`：

- deep-research review：`evidence_quality`；
- deep-research fact-check：`claim_verification`；
- academic-paper outline-only：`manuscript_structure`；
- academic-paper citation-check：`citation_integrity`；
- academic-paper disclosure：`compliance`；
- academic-paper rebuttal-audit：`rebuttal_completeness`。

这些 advisory checks 不会自动产生 `gate:<instance>/<node>` selector，也不会写 Gate ledger。

## 7. Artifact completion 可靠，但语义 schema 较浅

当前 runtime 对 artifact completion 的确定性要求较强：workspace containment、文件存在/非空、media profile、SHA-256、registry identity、producer/route、依赖、receipt 和 required Gate 都会被核对。

另一方面，`artifact-contracts.ts` 为大量文本 artifact 生成的 required-content 仍是通用要求，主要强调声明 artifact type、覆盖 route 目的、记录限制和未解决问题。许多丰富的 ARSU payload 字段没有成为当前强制 schema；二进制输出主要检查 extension/media/非空。不能把设计文档中的完整字段构想写成 runtime 已逐字段强校验。

## 8. Cost 是分类，不是估算器

Routing catalog 的 cost 只有两项：

- `effort`: low / medium / high / variable；
- `interaction`: single_pass / iterative / long_horizon。

它用于 route confirmation 的相对预期，不计算 token、时间、金额或精确对话轮数。ARSU Skill 文本中的 token budget、round-trip cap 或 mode-specific 数字属于内层说明。

## 9. `state_tracker_agent` 与 CLI state

上游 pipeline 将 `state_tracker_agent` 描述为记录已完成阶段、材料和 revision count。ResearchSpec preflight 同时明确：跨阶段可见性不授予 stable/runtime 文件写权限。

因此该 agent 可以生成进度叙述、dashboard 或过程材料，但 `state.yaml`、round number 和 frontier 只能由 CLI 根据可信 receipt 和 transition 更新。两者同名含义不同，不能互相同步写入。

## 10. Integrity 角色与 formal Gate validator

`integrity_verification_agent` 是 academic-pipeline 内部语义角色，不是固定公开 Skill。它可生产 integrity report；formal Gate 的 validator 则是 `researchspec-verify`，后者依据 profile 声明的 artifact/contracts 形成 proposed verdict。用户确认后，CLI 才持久化 Gate event。

如果把内部 integrity 角色的 PASS 直接视为 Gate pass，会绕过独立证据摘要、用户确认和 receipt。

## 11. 已识别的既有文档漂移

| 文档 | 当前不一致 |
| --- | --- |
| `openspec_cli_skill_artifact_coordination_analysis.md` | 仍保留“8 Companion intents”“ARSU runtime 未闭环”“无通用 registration/Gate/state helper”“status 不计算 work state”等形成设计前的判断 |
| `arsu_workflow_contract_design.md` | 一处称 Gate/transition/profile 已实现，另一处仍将 Gate/transition 写成 Target；固定 Stage 1/2/2.5 映射容易被误读为 runtime graph |
| `arch_design_proposal.md` | 文档状态称 v0.1 已完成，后部 roadmap 和 acceptance wording 仍带未落地语气 |
| `contract_schema_design.md` | 顶部称完整实现，落地顺序章节仍保留部分未来态措辞 |
| `cli_interface_design.md` | 写边界表中仍有把 `state.yaml` 更新写成 Target 的内容，与当前 Start/Advance 不符 |

这些文档仍有设计解释价值，但 current-state 判断必须回到本组文档列出的分类事实源。本文档组没有重写其历史论证。

## 12. 当前权威冲突规则

当开发者发现描述不一致时，按以下规则判断：

1. 先区分问题属于用户意图、route 语义、workflow 图、wire shape、runtime 事务还是 ARSU 内部方法。
2. 读取该类别的 SSOT，而不是选择看起来最详细的文档。
3. 运行期 stage/Gate/transition 一律以 workspace profile、current state、status 和 scoped instructions 为准。
4. 生成 Skill 中的 ResearchSpec preflight 优先约束其后保留的上游语义叙述。
5. 历史 change 和分析文档只解释设计如何形成，不证明当前代码已按其中每个目标运行。
6. 若代码、main OpenSpec spec 与 canonical user model 仍不一致，应把它记录为新的明确产品问题，而不是在 Agent prompt 中静默调和。
