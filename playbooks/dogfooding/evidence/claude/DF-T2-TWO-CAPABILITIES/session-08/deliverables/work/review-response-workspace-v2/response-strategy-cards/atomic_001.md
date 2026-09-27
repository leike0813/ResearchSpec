<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-21 response-strategy-card.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/response-strategy-card.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.strategy_card.title: atomic_001

view.strategy_card.intro

## view.strategy_card.header

| table.field | table.value |
| --- | --- |
| `comment_id` | atomic_001 |
| table.source_reviewers | editor |
| table.source_threads | editor_thread_001 |
| `status` |  |
| `priority` |  |
| `evidence_gap` |  |
| table.target_locations |  |

## view.strategy_card.canonical_item

- view.atomic_comments.canonical_summary: 回应编辑 Major-revision 总建议；后续所有改稿以此为框架，无需单点落地。
- view.strategy_card.required_action: 在回复信开头声明对 Major-revision 建议的承认，并指出对应处理。

## view.strategy_card.response_stance

- view.strategy_card.proposed_stance: 
- view.strategy_card.why_defensible: 

## view.strategy_card.confirmation_status

- view.strategy_card.pending_notice
- view.strategy_card.user_may_modify_notice

## view.strategy_card.planned_actions

| view.strategy_card.action_id | view.strategy_card.manuscript_change | table.target_locations | view.strategy_card.expected_response_effect |
| --- | --- | --- | --- |
|  |  |  |  |

## view.strategy_card.manuscript_drafts

_view.strategy_card.drafts_locked_until_confirmation_

## view.strategy_card.response_draft

_view.strategy_card.response_draft_locked_until_confirmation_

## view.strategy_card.required_evidence

| view.strategy_card.evidence_id | view.strategy_card.required_material | view.strategy_card.available_now | view.strategy_card.gap_note |
| --- | --- | --- | --- |
|  |  |  |  |

## view.strategy_card.pending_confirmations

- common.none

## view.strategy_card.comment_blockers

- common.none

## view.strategy_card.completion_definition

- [ ] view.strategy_card.check.manuscript_execution_items_done
- [ ] view.strategy_card.check.response_draft_done
- [ ] view.strategy_card.check.evidence_gap_closed
- [ ] view.strategy_card.check.user_strategy_confirmed
