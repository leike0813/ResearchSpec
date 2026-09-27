我先确认一下导航状态再动手。这条请求（基于审稿意见逐条回复）按 `AGENTS.md` 属于 revision round，应走 `review-response` profile 的图工作流；启动前需要你确认 entry 摘要。

## 选定路由

- **mode**: `graph`
- **profile / entry**: `profile:review-response` · entry `full`，entry node `intake`
- **frozen graph 节点链**: `intake → manuscript-analysis → comment-atomization → comment-coverage-gate → workboard → strategy-gate → round → evidence-gate → response-coverage-gate → final-assembly-gate → outcome(decision)`
- **stable spec 现状**:
  - `specs/project.md`、`specs/manuscript.yaml`、`specs/claims.yaml`、`specs/sources.yaml` 均是占位（无 RQ、outline、claim、源数据落进稳定 spec）
  - 真实材料目前停在 `benchmark/` 的合成 fixture：`goal.md`、`sources.yaml`、`claims.yaml`、`partial-manuscript.md`、`review-comments.md`、`revision-context.md`
  - 历史 run `run-66fbb80b7bd98829615abf75`（academic-pipeline 主路由）已 complete，仅产出 `work/historical-*.md` 备注类交付，未形成 `response_markdown`
- **handoff 输入绑定**:
  - `manuscript_source` ← `benchmark/partial-manuscript.md`
  - `review_comments_source` ← `benchmark/review-comments.md`
  - `user_notes` ← `benchmark/revision-context.md`（其中已写明："accept comments 1, 2, 4；对 comment 3 保留政策清晰度观点但改标为假设、删除因果措辞"）
- **boundary / expected outputs**:
  - `review_response_workspace` + `intake_report`（intake 节点）
  - `working_manuscript`（修订后的稿件草案）+ `response_markdown` + `response_latex` + `round_summary`（round 节点）
- **正式 Gates（5 个，需要你分别裁决 pass / pass_with_conditions / fail）**:
  - `review-response-comment-coverage`（comment-coverage-gate 前置：每条审稿意见都被映射）
  - `review-response-strategy`（strategy-gate：策略板符合证据边界）
  - `review-response-evidence`（evidence-gate：response 中每个论断都有 `SYN-*` 来源锚定）
  - `review-response-response-coverage`（response-coverage-gate：response 中每条意见都被回复）
  - `review-response-final-assembly`（final-assembly-gate：response + 修订稿 + 工作板配套齐）
- **Decision（1 个）**: `review-response-outcome` — 选项 `continue` / `complete`，决定是否进入下一轮或收尾
- **source policy**: 当前 `literature_adapters.selected = []`，不接外部源；本任务完全使用 `benchmark/` 提供的 4 个 `SYN-*` 合成材料，无需 Zotero 授权
- **risk / cost**: profile-defined；路线锁定 grade-2 注释标准，要求回答里既不补造参与者、效应量、引用，也不让 CLM-02 维持原强度、CLM-03 维持因果措辞
- **interactive review workspace**: 可用 `local-static` 浏览器面板（`descriptor_schema: review-workspace.v1`）复核，但你也可以完全在对话中推进

## 一处需要你拍板

按 `AGENTS.md`+"unrelated work and explicit opt-out stay outside ResearchSpec"，我需要你显式确认这两条再 `researchspec start profile:review-response --input <file>`：

1. **是否按上面 entry summary 启动 profile:review-response 图工作流**（后续每个 Gate 都需要你单独裁决，outcome Decision 由你选 continue/complete）。
2. **是否同意把 `benchmark/` 下的合成 fixture 直接绑定为 handoff 输入**——尤其确认 `user_notes` 采取 `benchmark/revision-context.md` 的语义（接受 1/2/4、改 CLM-03 为假设并去因果化），而不是要我重新汇总。

如果只想拿到一份"逐条回复的草稿"、不想现在就建 run 与 Gate 记录，可以告诉我"用 native"，我会按 host Agent 能力直接出一份 `work/review-response-draft.md` 当作工作笔记留在 `work/` 之外，不创建 run / node / Gate / Decision。

请确认。
