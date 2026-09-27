---
name: review-response-intake-and-atomization
description: Stage 1+2+3 of the review-response flow against the synthetic dogfooding fixture: workspace init, manuscript analysis, comment atomization with coverage report.
metadata:
  type: project
---

# Review-Response: intake + manuscript-analysis + comment-atomization

## User goal

"先整理现有稿件和审稿意见的回复材料，再逐条拆分意见并检查有没有遗漏；请保存每一步的结果。"

This note covers the three procedure-level checkpoints the user asked for:
**Stage 1 (intake)**, **Stage 2 (manuscript analysis)**, **Stage 3 (comment atomization + coverage check)**.
Downstream stages (workboard / strategy / round / assembly) were not requested.

## Mode and source materials

- Mode: standalone procedures under `review-response` profile (no graph run; no formal Gates/Decisions).
- `manuscript_source` = `benchmark/partial-manuscript.md` (single Markdown file).
- `review_comments_source` = `benchmark/review-comments.md` (editor letter: 757 chars).
- `user_notes` = `benchmark/revision-context.md` (author accepts #1/#2/#4, keeps #3 as hypothesis).
- Evidence base = `benchmark/sources.yaml` (SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04).
- Claim register = `benchmark/claims.yaml` (CLM-01 tentative, CLM-02 unsupported_as_written, CLM-03 hypothesis_only).

## Workspace

- `work/review-response-workspace-v2/` — DB + 17 只读视图 + manuscript 副本。
- `work/researchspec-notes/review-response-intake-and-atomization.md` — 本文件（progress note）。
- `work/runtime-localization-stub/` — env stub（capability 包未自带 messages/*.json，给 runtime_localization 一个空 stub）。
- `work/runtime_shim.py` + `work/run_gate.py` — 共享 env 兼容代码（HTML 注释剥离 + gate 包装调用）。

Per-step产物（按运行顺序）：

### Stage 1 — workspace init + entry state

- 入口脚本：`init_artifact_workspace.py --document-language en --working-language zh-CN --manuscript-source benchmark/partial-manuscript.md`
- 产物：创建 `revision-master.db` + 17 个只读视图骨架 + manuscript 副本。
- 状态：current_stage=`stage_1` → `stage_2`，stage_gate=`ready`，next_action=`enter_stage_2`，languages_confirmed=`yes`。
- 视图：`01-agent-resume.md`（首版）。

### Stage 2 — manuscript analysis

- 写入 `manuscript_summary`：main_entry=`partial-manuscript.md`，project_shape=`single_tex`，high_risk_areas=Preliminary findings / Missing sections / Conclusion / Claim wording。
- 写入 `manuscript_sections` 4 条：working-title / introduction / preliminary-findings / missing-sections。
- 写入 `manuscript_claims` 3 条：CLM-01（tentative, SYN-CLASSROOM-01）、CLM-02（unsupported_as_written, SYN-INTERVIEW-02）、CLM-03（hypothesis_only, SYN-SURVEY-03 + SYN-POLICY-04）；保留稳定 claim ID（per revision-context.md 要求）。
- 状态：current_stage=`stage_2` → `stage_3`，next_action=`enter_stage_3`。
- 视图：`02-manuscript-structure-summary.md`。

### Stage 3 — comment atomization + coverage

- 写入 `review_comment_source_documents`：`src:editor-letter`（全文 757 chars）。
- 写入 `raw_review_threads` 7 条（editor_thread_001..007），每条 1 个 `primary` span，span_text 与原文 substring 精确匹配（offsets 99 / 138 / 238 / 361 / 468 / 608 / 688）。
- 写入 `atomic_comments` 7 条（atomic_001..007），1:1 映射到 thread。
- 写入 `raw_thread_atomic_links` 7 条 + `atomic_comment_source_spans` 7 条（每条 atomic 记录 primary excerpt）。
- 字符级覆盖率：595/757 = **78.60%**（含 `primary`，hard=30%、soft=50% 均通过）。
- 状态：current_stage=`stage_3`/stage_gate=`blocked`/next_action=`request_stage3_coverage_confirmation`。
- pending_user_confirmations：1 条（请求确认覆盖率报告后进入 Stage 4）。
- 视图：`04-raw-review-thread-list.md`、`05-atomic-review-comment-list.md`、`06-thread-to-atomic-mapping.md`、`07-review-comment-coverage.md`。

## Gate-and-render 验证（独立验证脚本）

调用 `gate_and_render_workspace.py --artifact-root .../review-response-workspace-v2`：

```
format_error_count      : 0
dependency_error_count  : 0
consistency_error_count : 0
total_issue_count       : 0
gate_status             : pass
repair_sequence         : []
coverage_percent        : 78.60% (≥ soft 50%, ≥ hard 30%)
blocked_actions         : blocked_enter_stage_4 (stage3 pending confirmation), blocked_final_export (stage6 not yet planned)
```

## 原子化结果一览

| thread_id            | 来源原文摘录（primary span）                                                                                              | atomic_id   | canonical summary                                                              |
|----------------------|--------------------------------------------------------------------------------------------------------------------------|-------------|--------------------------------------------------------------------------------|
| editor_thread_001    | Major revision.                                                                                                          | atomic_001  | 回应编辑 Major-revision 总建议；后续所有改稿以此为框架。                       |
| editor_thread_002    | The manuscript should state that all evidence is local and synthetic before presenting findings.                        | atomic_002  | 在 Findings 之前声明证据为本地、合成、规模有限。                               |
| editor_thread_003    | `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.| atomic_003  | 修订 CLM-02 措辞；如无法支撑则删除。                                            |
| editor_thread_004    | The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.                  | atomic_004  | 把 CLM-03 改为未来研究假设，移除任何因果或已检验关系的措辞。                   |
| editor_thread_005    | Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.   | atomic_005  | 增加 Methods 部分：说明四个来源的遴选方式、为何不能进行因果推断。               |
| editor_thread_006    | Use consistent terms for "AI-assisted feedback" and "generative AI feedback".                                            | atomic_006  | 在全文统一使用"AI-assisted feedback"或"generative AI feedback"，避免混用。     |
| editor_thread_007    | Make the limitations visible in the conclusion, not only in methods.                                                     | atomic_007  | 将 limitations 从 Methods 复述到 Conclusion，使读者在结尾也能看到。             |

每条 thread 至少 1 个 primary span；每条 atomic 至少 1 个 link；每条 atomic 至少 1 个 source excerpt。**未发现遗漏**：

- editor 的所有 bullet / numbered 条款均已抽取。
- 没有任何 thread 因边界模糊或合并歧义而缺失。
- 唯一可能"看似软提示"的是「Editorial recommendation」单条（major revision），它本身不要求单点落地，仅作为锚点映射到 atomic_001；该映射已显式记录。
- 字符级覆盖率 78.60%，远高于 hard `30%` 阈值；不存在 `<30%` 阻断问题。

## Stage progress

- [x] Stage 1 — workspace initialized, language confirmed, entry resolved
- [x] Stage 2 — manuscript structure summary written
- [x] Stage 3 — raw threads + canonical atomic items + character coverage (78.60%, gate_status=pass)
- [ ] Stage 4 — atomic workboard (not requested)
- [ ] Stage 5 — strategy + drafts (not requested)
- [ ] Stage 6 — final assembly (not requested)