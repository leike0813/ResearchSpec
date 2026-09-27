<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-27 thread-to-atomic-mapping.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/thread-to-atomic-mapping.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.thread_mapping.title

view.thread_mapping.intro

## editor_thread_001 (editor)

- view.thread_mapping.normalized_summary: 编辑给出总建议：Major revision。
- view.thread_mapping.original_text: Major revision.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_001 | 回应编辑 Major-revision 总建议；后续所有改稿以此为框架，无需单点落地。 | Major revision. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

## editor_thread_002 (editor)

- view.thread_mapping.normalized_summary: Major 1：陈述发现前应声明证据为本地且合成。
- view.thread_mapping.original_text: The manuscript should state that all evidence is local and synthetic before presenting findings.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_002 | 在 Findings 之前声明证据为本地、合成、规模有限。 | The manuscript should state that all evidence is local and synthetic before presenting findings. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

## editor_thread_003 (editor)

- view.thread_mapping.normalized_summary: Major 2：CLM-02 措辞过强，应修订以体现更快反馈与验证工作的权衡，或删除。
- view.thread_mapping.original_text: `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_003 | 修订 CLM-02 措辞，使其承认“更快反馈”与“额外验证工作”的权衡；如无法支撑则删除。 | `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

## editor_thread_004 (editor)

- view.thread_mapping.normalized_summary: Major 3：CLM-03 关系未直接检验，应作为未来研究假设处理。
- view.thread_mapping.original_text: The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_004 | 把 CLM-03 改为未来研究假设，移除任何因果或已检验关系的措辞。 | The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

## editor_thread_005 (editor)

- view.thread_mapping.normalized_summary: Major 4：增加 Methods 部分，说明四个来源的遴选过程及为何无法进行因果推断。
- view.thread_mapping.original_text: Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_005 | 增加 Methods 部分：说明四个来源的遴选方式、为何不能进行因果推断。 | Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

## editor_thread_006 (editor)

- view.thread_mapping.normalized_summary: Minor 1：统一“AI-assisted feedback”与“generative AI feedback”的术语用法。
- view.thread_mapping.original_text: Use consistent terms for “AI-assisted feedback” and “generative AI feedback”.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_006 | 在全文统一使用“AI-assisted feedback”或“generative AI feedback”，避免混用。 | Use consistent terms for “AI-assisted feedback” and “generative AI feedback”. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

## editor_thread_007 (editor)

- view.thread_mapping.normalized_summary: Minor 2：让局限性在结论中也可见，而非仅出现在方法部分。
- view.thread_mapping.original_text: Make the limitations visible in the conclusion, not only in methods.

| view.thread_mapping.link_order | `comment_id` | view.atomic_comments.canonical_summary | view.thread_mapping.source_span | view.thread_mapping.note |
| --- | --- | --- | --- | --- |
| 1 | atomic_007 | 将 limitations 从 Methods 复述到 Conclusion，使读者在结尾也能看到。 | Make the limitations visible in the conclusion, not only in methods. | 由 editor_thread_* 单一来源合并，无需跨 reviewer 合并依据。 |

