<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-13 raw-review-thread-list.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/raw-review-thread-list.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.raw_threads.title

view.raw_threads.intro

## view.raw_threads.table

| `thread_id` | `reviewer_id` | `thread_order` | `source_type` | view.raw_threads.normalized_summary | view.raw_threads.linked_atomic_comments |
| --- | --- | --- | --- | --- | --- |
| editor_thread_001 | editor | 1 | editor_comment | 编辑给出总建议：Major revision。 | atomic_001 |
| editor_thread_002 | editor | 2 | editor_comment | Major 1：陈述发现前应声明证据为本地且合成。 | atomic_002 |
| editor_thread_003 | editor | 3 | editor_comment | Major 2：CLM-02 措辞过强，应修订以体现更快反馈与验证工作的权衡，或删除。 | atomic_003 |
| editor_thread_004 | editor | 4 | editor_comment | Major 3：CLM-03 关系未直接检验，应作为未来研究假设处理。 | atomic_004 |
| editor_thread_005 | editor | 5 | editor_comment | Major 4：增加 Methods 部分，说明四个来源的遴选过程及为何无法进行因果推断。 | atomic_005 |
| editor_thread_006 | editor | 6 | editor_comment | Minor 1：统一“AI-assisted feedback”与“generative AI feedback”的术语用法。 | atomic_006 |
| editor_thread_007 | editor | 7 | editor_comment | Minor 2：让局限性在结论中也可见，而非仅出现在方法部分。 | atomic_007 |

## view.raw_threads.original_thread_text

### editor_thread_001

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">Major revision.</div>

### editor_thread_002

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">The manuscript should state that all evidence is local and synthetic before presenting findings.</div>

### editor_thread_003

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.</div>

### editor_thread_004

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.</div>

### editor_thread_005

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.</div>

### editor_thread_006

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">Use consistent terms for “AI-assisted feedback” and “generative AI feedback”.</div>

### editor_thread_007

- view.raw_threads.original_text_primary_supporting:

<div style="white-space: pre-wrap;">Make the limitations visible in the conclusion, not only in methods.</div>

