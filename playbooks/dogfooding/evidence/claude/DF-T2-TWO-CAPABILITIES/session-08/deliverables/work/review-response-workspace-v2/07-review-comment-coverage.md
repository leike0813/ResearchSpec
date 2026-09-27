<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-22 review-comment-coverage.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/review-comment-coverage.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.review_comment_coverage.title

view.review_comment_coverage.intro

## view.review_comment_coverage.legend_title

- view.review_comment_coverage.legend_covered
- view.review_comment_coverage.legend_duplicate
- view.review_comment_coverage.legend_uncovered

## view.review_comment_coverage.metrics_title

view.review_comment_coverage.metrics_intro

- view.review_comment_coverage.metrics_global_including_duplicates
- view.review_comment_coverage.metrics_global_non_duplicate
- view.review_comment_coverage.metrics_threshold_text
- view.review_comment_coverage.metrics_gate_status

### view.review_comment_coverage.metrics_per_document_title

| `source_document_id` | view.review_comment_coverage.metrics_doc_label | view.review_comment_coverage.metrics_doc_total | view.review_comment_coverage.metrics_doc_including_duplicates | view.review_comment_coverage.metrics_doc_non_duplicate |
| --- | --- | --- | --- | --- |
| `src:editor-letter` | Editor letter / review comments | `757` | `595/757` (78.60%) | `595/757` (78.60%) |

## Editor letter / review comments

- `source_document_id`: src:editor-letter
- view.review_comment_coverage.source_kind: `review_comments_source`
- view.review_comment_coverage.source_path: `/tmp/researchspec-journey-ahlF9D/benchmark/review-comments.md`
- view.review_comment_coverage.summary: view.review_comment_coverage.summary_text
- view.review_comment_coverage.summary_role_text

### view.review_comment_coverage.copy_title

<div style="white-space: pre-wrap; border: 1px solid #d0d7de; border-radius: 6px; padding: 12px;">
# Synthetic Review Comments

&gt; TEST FIXTURE — NOT A REAL PEER REVIEW

## Editorial recommendation


<span style="color: #d32f2f; font-weight: 700;">Major revision.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_001]</span>


## Major comments

1. 
<span style="color: #d32f2f; font-weight: 700;">The manuscript should state that all evidence is local and synthetic before presenting findings.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_002]</span>

2. 
<span style="color: #d32f2f; font-weight: 700;">`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_003]</span>

3. 
<span style="color: #d32f2f; font-weight: 700;">The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_004]</span>

4. 
<span style="color: #d32f2f; font-weight: 700;">Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_005]</span>


## Minor comments

- 
<span style="color: #d32f2f; font-weight: 700;">Use consistent terms for “AI-assisted feedback” and “generative AI feedback”.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_006]</span>

- 
<span style="color: #d32f2f; font-weight: 700;">Make the limitations visible in the conclusion, not only in methods.</span><span style="color: #6a737d; font-size: 0.85em;"> [editor_thread_007]</span>


</div>

### view.review_comment_coverage.appendix_title

view.review_comment_coverage.appendix_intro

| `source_document_id` | `thread_id` | `span_role` | `comment_ids` | `span_order` | `offset_range` | `segment_excerpt` |
| --- | --- | --- | --- | --- | --- | --- |
| `src:editor-letter` | `editor_thread_001` | `primary` | `atomic_001` | `1` | `99:114` | Major revision. |
| `src:editor-letter` | `editor_thread_002` | `primary` | `atomic_002` | `1` | `138:234` | The manuscript should state that all evidence is local and synthetic before presenting findings. |
| `src:editor-letter` | `editor_thread_003` | `primary` | `atomic_003` | `1` | `238:357` | `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it. |
| `src:editor-letter` | `editor_thread_004` | `primary` | `atomic_004` | `1` | `361:464` | The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis. |
| `src:editor-letter` | `editor_thread_005` | `primary` | `atomic_005` | `1` | `468:585` | Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable. |
| `src:editor-letter` | `editor_thread_006` | `primary` | `atomic_006` | `1` | `608:685` | Use consistent terms for “AI-assisted feedback” and “generative AI feedback”. |
| `src:editor-letter` | `editor_thread_007` | `primary` | `atomic_007` | `1` | `688:756` | Make the limitations visible in the conclusion, not only in methods. |

