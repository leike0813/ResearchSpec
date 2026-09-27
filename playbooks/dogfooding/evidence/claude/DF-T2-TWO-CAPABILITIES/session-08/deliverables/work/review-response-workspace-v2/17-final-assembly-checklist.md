<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-09 final-assembly-checklist.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/final-assembly-checklist.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.final_checklist.title

view.final_checklist.intro

## view.final_checklist.atomic_completion_table

| `comment_id` | table.source_reviewers | table.source_threads | `status` | `priority` | `evidence_gap` | table.target_locations | `manuscript_execution_items_done` | `response_draft_done` | `one_to_one_link_checked` | `export_ready` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| atomic_001 | editor | editor_thread_001 |  |  |  |  |  |  |  |  |
| atomic_002 | editor | editor_thread_002 |  |  |  |  |  |  |  |  |
| atomic_003 | editor | editor_thread_003 |  |  |  |  |  |  |  |  |
| atomic_004 | editor | editor_thread_004 |  |  |  |  |  |  |  |  |
| atomic_005 | editor | editor_thread_005 |  |  |  |  |  |  |  |  |
| atomic_006 | editor | editor_thread_006 |  |  |  |  |  |  |  |  |
| atomic_007 | editor | editor_thread_007 |  |  |  |  |  |  |  |  |

## view.final_checklist.revision_plan_table

| `plan_action_id` | `comment_id` | `execution_category` | view.revision_graph.title_column | `status` |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## view.final_checklist.thread_coverage_table

| `thread_id` | `reviewer_id` | view.raw_threads.linked_atomic_comments | `response_resolution_kind` | `audited_log_present` | view.final_checklist.final_row_ready | view.final_checklist.linked_atomic_export_ready | view.final_checklist.thread_export_ready |
| --- | --- | --- | --- | --- | --- | --- | --- |
| editor_thread_001 | editor | atomic_001 |  | no | no | no | no |
| editor_thread_002 | editor | atomic_002 |  | no | no | no | no |
| editor_thread_003 | editor | atomic_003 |  | no | no | no | no |
| editor_thread_004 | editor | atomic_004 |  | no | no | no | no |
| editor_thread_005 | editor | atomic_005 |  | no | no | no | no |
| editor_thread_006 | editor | atomic_006 |  | no | no | no | no |
| editor_thread_007 | editor | atomic_007 |  | no | no | no | no |

## view.final_checklist.export_artifact_table

| view.final_checklist.artifact | view.final_checklist.status | view.final_checklist.output_path |
| --- | --- | --- |
| latexdiff_manuscript | pending |  |
| response_latex | pending |  |
| response_markdown | pending |  |
| working_manuscript | pending |  |
