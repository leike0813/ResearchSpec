材料已读完，按 `revision-context.md` 中作者既定的立场逐一处理即可，不必为这一轮单独拉起完整 review-response workspace。

#逐条意见的处置

| 编号 | 意见 | 处置 | 落点 |
| --- | --- | --- | --- |
| M1 | 在呈现发现前说明证据为本地合成 |采纳，按意见修改 | 在 Introduction 之后新增“Evidence and scope”说明，明确所有证据来自合成材料包，不作为外部推广 |
| M2 | `CLM-02` 表述过强 | 采纳，按意见修改 | 把“Generative AI reduces instructor workload”改为“instructors report faster formative feedback alongside new verification work”，保留 `CLM-02` ID 但 `strength` 调为 `trade_off`，与 `limits` 对齐 |
| M3 | `CLM-03` 未直接检验 | 部分采纳，保留政策清晰度思路但删因果措辞 | 改写为“policy-clarity hypothesis”：表述为待检验假设，移除“is associated with fewer uncertainties”这类准因果句，引用改为 `hypothesis_only`，并在 Discussion 中明确指出当前材料未做对照比较 |
| M4 | 补充方法节，说明四个来源的选取与因果推断不可用 | 采纳，按意见新增 | 在 Methods 中加入“Source selection and causal-inference limits”，逐条说明四个 `SYN-*` 来源的 scope、limit、为何不能支撑因果推断 |
| m1 | 统一“AI-assisted feedback / generative AI feedback”术语 | 采纳 |全文统一为“AI-assisted feedback”，首现处给出定义 |
| m2 | 在结论中显化限制 | 采纳 | 在 Conclusion 增加一段“Evidence-bound conclusions”，重申单门课程、五位教师、84 份自愿问卷、单机构政策文本的范围，以及不能外推的边界 |

# 给审稿人的回复（草稿）

> Response to Reviewers
>
> We thank the editor and reviewers for the careful reading. We have carried out a major revision. Below we address each point in order. The synthetic and local nature of the evidence is now stated before any finding is presented; the wording of `CLM-02` has been softened; `CLM-03` has been reframed as a hypothesis without causal language; a Methods section now explains source selection and the unavailability of causal inference; terminology has been harmonized; and the conclusion now carries the evidence limits visibly.
>
> **Major comment 1.** *State that all evidence is local and synthetic before presenting findings.*
> Accepted. We added an “Evidence and scope” note immediately after the Introduction that flags the supplied corpus as local and synthetic, and we removed any wording that could be read as a generalization beyond it.
>
> **Major comment 2.** *`CLM-02` is too strong; revise it to reflect the trade-off between faster feedback and verification work, or remove it.*
> Accepted. We kept the claim ID for traceability but rewrote the wording to “instructors reported faster formative feedback together with additional time spent checking unsupported claims.” Its `strength` is now `trade_off`, and the supporting paragraph now presents the time-savings and verification-work signals side by side.
>
> **Major comment 3.** *The relationship proposed in `CLM-03` is not directly tested.*
> Partially accepted. We agree the supplied materials do not permit a direct comparison between policy clarity and student uncertainty, so we have reframed `CLM-03` as a hypothesis for future research, removed the association-style wording, and added a Discussion paragraph noting the absent control. The policy-clarity intuition is retained because it is useful as a design hypothesis, not as a result.
>
> **Major comment 4.** *Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.*
> Accepted. The new Methods section lists each `SYN-*` source, its scope, and its stated limits, and explains that the corpus contains no comparison group, no time logs, no behavioral measure, and one institutional policy text, so causal inference is not available and any apparent association should be read as descriptive at most.
>
> **Minor comment 1.** *Use consistent terms for “AI-assisted feedback” and “generative AI feedback”.*
> Accepted. The manuscript now uses “AI-assisted feedback” throughout, with a one-line definition at first mention.
>
> **Minor comment 2.** *Make the limitations visible in the conclusion, not only in methods.*
> Accepted. The Conclusion now closes with an “Evidence-bound conclusions” paragraph that restates the scope (one course, five instructors, 84 voluntary survey responses, one policy text) and the corresponding limits, and it points to the policy-clarity hypothesis as the next step rather than a present claim.
>
> **What remains limited.** No new data, sources, effect sizes, or completed ethics review have been introduced; the four `SYN-*` sources are unchanged. The manuscript continues to treat all results as local, synthetic, and descriptive.

skipped: 完整 review-response workspace（workboard / scripts / interactive pass），本轮仅产出意见处置与回复稿。add when 用户要求按标准流程落库并产出修订稿与 LaTeX 预览时。
