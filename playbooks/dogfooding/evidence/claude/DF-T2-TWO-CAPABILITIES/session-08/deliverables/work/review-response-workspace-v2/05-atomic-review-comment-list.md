<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: template
能力/包 ID: RM-ASSET-07 atomic-review-comment-list.md
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/assets/templates/atomic-review-comment-list.md.j2（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# view.atomic_comments.title

view.atomic_comments.intro

## view.atomic_comments.table

| `comment_id` | table.source_reviewers | table.source_threads | view.atomic_comments.canonical_summary | view.atomic_comments.required_action |
| --- | --- | --- | --- | --- |
| atomic_001 | editor | editor_thread_001 | 回应编辑 Major-revision 总建议；后续所有改稿以此为框架，无需单点落地。 | 在回复信开头声明对 Major-revision 建议的承认，并指出对应处理。 |
| atomic_002 | editor | editor_thread_002 | 在 Findings 之前声明证据为本地、合成、规模有限。 | 在 Introduction 或 Preliminary findings 前加入一段 evidence-scope disclaimer。 |
| atomic_003 | editor | editor_thread_003 | 修订 CLM-02 措辞，使其承认“更快反馈”与“额外验证工作”的权衡；如无法支撑则删除。 | 替换 CLM-02 在 Preliminary findings 中的强陈述；并调整后续行文。 |
| atomic_004 | editor | editor_thread_004 | 把 CLM-03 改为未来研究假设，移除任何因果或已检验关系的措辞。 | 重写 CLM-03 的措辞；如需保留 policy-clarity 想法，仅作为 hypothesis 出现。 |
| atomic_005 | editor | editor_thread_005 | 增加 Methods 部分：说明四个来源的遴选方式、为何不能进行因果推断。 | 新增 Methods 部分，引用 sources.yaml 与 claims.yaml 反映四个合成来源的范围。 |
| atomic_006 | editor | editor_thread_006 | 在全文统一使用“AI-assisted feedback”或“generative AI feedback”，避免混用。 | 通稿替换术语；在 Introduction 与 Methods 中定义用法。 |
| atomic_007 | editor | editor_thread_007 | 将 limitations 从 Methods 复述到 Conclusion，使读者在结尾也能看到。 | 在 Conclusion 末尾重申局限性（局部合成证据、不能因果推断、claim 强度有限）。 |
