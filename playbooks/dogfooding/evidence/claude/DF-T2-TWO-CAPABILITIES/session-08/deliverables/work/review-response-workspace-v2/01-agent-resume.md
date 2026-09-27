<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-05 agent-resume.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/agent-resume.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.agent_resume.title

view.agent_resume.intro

## view.agent_resume.resume_state

| table.field | table.value |
| --- | --- |
| `resume_status` | active |
| `is_bootstrap` | no |
| `current_stage` | stage_3 |
| `stage_gate` | blocked |
| `active_comment_id` | None |

## language.section_title

| table.field | table.value |
| --- | --- |
| `language.document_language` | en |
| `language.working_language` | zh-CN |
| `language.manuscript_detected_language` | en |
| `language.review_comments_detected_language` | en |
| `language.prompt_detected_language` | zh-CN |
| `language.document_language_source` | manuscript |
| `language.working_language_source` | prompt |
| `language.languages_confirmed` | yes |

## view.agent_resume.what_to_understand_first

- view.agent_resume.current_state_summary: current_state.summary
- view.agent_resume.current_objective: 完成 review-response 的前三个阶段：Stage 1 入口、Stage 2 原稿结构、Stage 3 原子化 + 覆盖率。
- view.agent_resume.current_focus: Stage 3 字符级覆盖率 ≥ 30%；每个 thread 至少一个 primary span；每个 atomic 至少一个 link。
- view.agent_resume.why_paused: 等待用户确认 Stage 3 coverage。
- view.agent_resume.next_operator_action: 查看 07-review-comment-coverage.md 并确认覆盖率；或对原子化拆分/合并给出修改意见。
- view.agent_resume.next_action_anchor: request_stage3_coverage_confirmation

## view.agent_resume.open_loops

view.agent_resume.open_loops_intro

| table.order | table.message |
| --- | --- |
| 1 | Stage 4 atomic workboard（priority / evidence_gap / next_action）尚未建立。 |
| 2 | Stage 5 strategy cards + manuscript/response drafts 尚未形成。 |
| 3 | Stage 6 working_manuscript 改稿、revision action log、final assembly 尚未闭环。 |

## view.agent_resume.recent_decisions

view.agent_resume.recent_decisions_intro

| table.order | table.message |
| --- | --- |
| 1 | Stage 1: workspace 已初始化；languages confirmed (text=en, working=zh-CN)；主入口 partial-manuscript.md。 |
| 2 | Stage 2: manuscript_summary 已写入 (main_entry=partial-manuscript.md, project_shape=single_tex)。 |
| 3 | Stage 2: manuscript_sections 已写入 4 节 (working-title / introduction / preliminary-findings / missing-sections)。 |
| 4 | Stage 2: manuscript_claims 已写入 3 条 (CLM-01 tentative, CLM-02 unsupported_as_written, CLM-03 hypothesis_only)。 |
| 5 | Stage 3: review_comment_source_documents 已写入（src:editor-letter，757 chars）。 |
| 6 | Stage 3: raw_review_threads 已写入 7 条（editor_thread_001..007）；每条 1 个 primary span。 |
| 7 | Stage 3: atomic_comments 已写入 7 条（atomic_001..007）；与 thread 一一对应。 |
| 8 | Stage 3: raw_thread_atomic_links 与 atomic_comment_source_spans 已写入。 |
| 9 | Stage 3: 字符级覆盖率验证通过；等待用户确认覆盖率后再进入 Stage 4。 |

## view.agent_resume.must_not_forget

view.agent_resume.must_not_forget_intro

| table.order | table.message |
| --- | --- |
| 1 | 证据仅来自 benchmark/ 的合成 SYN-* 来源；不得引入未授权的新数据、效应量或引用。 |
| 2 | CLM-02 不得以“减少工作量”这种绝对陈述出现；必须反映更快反馈与验证工作的权衡。 |
| 3 | CLM-03 仅作为未来研究假设；不得使用因果或“已被检验”的措辞。 |

## view.agent_resume.resume_read_order

view.agent_resume.resume_read_order_intro

| table.step | table.read_this |
| --- | --- |
| 1 | resume.read_order.instruction_payload |
| 2 | 01-agent-resume.md |
| 3 | resume.read_order.stage_view |
| 4 | resume.read_order.stage_reference |

## view.agent_resume.runtime_digest

view.agent_resume.runtime_digest_intro

<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: runtime-digest
能力/包 ID: RM-ASSET-02 skill-runtime-digest
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/runtime/skill-runtime-digest.md（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# revision-master Runtime Digest

## Goals

- 以阶段化方式推进论文修回，而不是一步到位改稿
- 用 SQLite 维持运行时唯一真源
- 显式区分文本语言与工作语言，并在运行时持续遵守它们的边界
- 把原始 reviewer thread 整理为 canonical atomic item，并在用户确认下逐条闭环
- 最终 response letter 必须回到原始 `thread_id` 顺序组织，并以 point-to-point 表格输出

## Non-Goals

- 不直接一步到位修改论文原稿
- 不替用户做未经授权的学术决策
- 不把脚本当作核心语义判断的替代品
- 不把只读 Markdown 视图当成运行时真源

## Responsibilities

- Agent 负责语义理解、学术判断、策略制定、意见映射和用户交互
- 脚本只负责确定性且可验证的工作：workspace 初始化、数据库读写辅助、状态门禁检查、恢复包输出和只读视图重渲染
- Stage 5 的 manuscript execution items 与 response drafts 由 Agent 写入正式真源表，Stage 6 基于这些真源派生 revision backlog，再进入交互式改稿与 Agent-owned revision log 闭环

## Workflow Discipline

- 先恢复，后执行
- 首次初始化前先确认文本语言与工作语言
- 每次写库后都必须运行 `gate-and-render` 核心脚本
- 有 `pending_user_confirmations` 时先请求确认
- Stage 3 建模完成后必须先展示 `07-review-comment-coverage.md`（完整原文顺序 + 红色高亮 `primary/supporting` + 橙色高亮 `duplicate_filtered` + 短 `thread_id` 标签 + 覆盖映射附录）并拿到用户确认，确认前不得进入 Stage 4
- Stage 3 覆盖真源以 `review_comment_source_documents` + `raw_thread_source_spans` 为准
- 每个 `thread_id` 至少包含一条 `span_role='primary'`；“仅标题覆盖、正文疑似漏抽”作为弱提示提醒用户复核，不直接触发 repair 阻断
- Stage 3 覆盖率门禁使用字符级指标（`len` 口径、含空白）：全局主指标分子包含 `duplicate_filtered`；hard=`30%`（低于即阻断），soft=`50%`（区间内仅提示）
- 有 `global_blockers` 时先请求补材或澄清
- Stage 5 必须先形成策略卡并完成显式确认，确认前不得形成 Stage 5 execution items 或 response draft
- 进入 Stage 5 后必须形成 `09-supplement-suggestion-plan.md`，先展示全局补材建议 backlog，再处理后续 intake
- 每轮补材都要形成文件级 intake 判定；`accepted` 补材必须有落地映射
- `active_comment_id` 允许显式切换，但不得静默切换 comment
- Stage 6 以 `working_manuscript`、`revision_action_logs` 与 `response_thread_rows` 为闭环真源
- Agent 每完成一轮明确修改后，都必须汇总结构化 semantic revision log，并通过 `commit_revision_round.py --payload ...` 提交
- `gate-and-render` 只负责检测 revision plan 结案、thread-level response 覆盖和最终输出状态，不读取稿件 diff，也不自动补写 revision log
- `response_latex` 必须是带 front matter 的完整可编译 LaTeX 文件

## Inputs And Outputs

- 必需输入：`manuscript_source`、`review_comments_source`
- 可选输入：`editor_letter_source`、`user_notes`
- 运行时真源：`revision-master.db`
- 语言真源：`runtime_language_context`
- 稿件副本真源：`workspace_manuscript_copies`
- workspace 本地化覆盖层：`runtime-localization/`
- 只读视图：`01-agent-resume.md`、`02-manuscript-structure-summary.md`、`03-style-profile.md`、`04-raw-review-thread-list.md`、`05-atomic-review-comment-list.md`、`06-thread-to-atomic-mapping.md`、`07-review-comment-coverage.md`、`08-atomic-comment-workboard.md`、`09-supplement-suggestion-plan.md`、`10-supplement-intake-plan.md`、`11-manuscript-revision-guide.md`、`12-manuscript-execution-graph.md`、`13-revision-action-log.md`、`14-response-coverage-matrix.md`、`15-response-letter-preview.md`、`16-response-letter-preview.tex`、`17-final-assembly-checklist.md`、`response-strategy-cards/{comment_id}.md`
- 最终输出：`working_manuscript`、`response_markdown`、`response_latex`、可选 `latexdiff_manuscript`

## Language Rules

- 文本语言默认以 manuscript 语言为准；review comments 若不同语言，仍以 manuscript 语言为准
- 工作语言默认从当前 prompt 语言推断，并在 Stage 1 向用户确认
- reviewer / editor 原文与原稿摘录保持原语言
- Stage 3-5 的 normalized summary、canonical summary、strategy card、workboard、resume、gate 输出和 Stage 5 execution items / response drafts 使用工作语言
- Stage 6 的 manuscript final copy、response rows 与最终导出产物使用文本语言

## Six Stages

1. 入口解析与 workspace 初始化
2. 原稿结构分析
3. 原始审稿意见块抽取、去重、归并和 canonical atomic item 形成
4. atomic workboard 规划
5. 逐条策略与执行
6. 交互式 working manuscript 改稿、Agent-owned revision log、thread-level response 覆盖闭环
