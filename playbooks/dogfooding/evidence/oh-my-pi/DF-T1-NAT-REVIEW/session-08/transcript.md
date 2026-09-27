材料是合成的（README 明确标注）。逐条对照 review-comments.md、claims.yaml、revision-context.md、partial-manuscript.md，给出"哪些意见需要改"和"给审稿人的回复"。

# 审稿意见逐条分类

## Major comments

**1. 在呈现发现前声明所有证据是本地且合成的。**
需要修改。

依据：partial-manuscript.md 的 Introduction 只说"examines a small synthetic evidence set"，措辞放在引言末段、且缺乏必要的风险提示；claims.yaml 表明全部材料合成（`synthetic: true`），来源都不对应真实研究。

**2. CLM-02 过强。**
需要修改。

依据：claims.yaml 中 CLM-02 的 strength 已标为 `unsupported_as_written`，limits 写明"证据既记录了时间节省，也记录了新的核查工作；没有测量工作量"。revision-context.md 显示作者接受修改。partial-manuscript.md 现行措辞已较弱（"faster feedback may be offset by verification work"），但应把这一对偶表述形式化为正式条款而不是隐含在叙述里。

**3. CLM-03 的关系未直接检验。**
需要修改。

依据：claims.yaml 中 CLM-03 的 strength 为 `hypothesis_only`，limits 写明"材料没有直接比较政策清晰度与不确定性"。revision-context.md：作者希望保留该想法但同意标记为假设并去掉因果措辞。

**4. 增加方法节，说明四个来源如何选出以及因果推断为何不可得。**
需要修改。

依据：partial-manuscript.md 在 "Missing sections" 中已列出"Methods and evidence-selection limitations"。四个 source ID（SYN-CLASSROOM-01、SYN-INTERVIEW-02、SYN-SURVEY-03、SYN-POLICY-04）来源类型差异大（课堂观察、访谈、调查、政策摘录），目前稿件完全没有解释选择逻辑；claims.yaml 的 limits 暴露了为什么因果推断不可得，但稿件没有把这些局限变成一个独立章节。

## Minor comments

**a. "AI-assisted feedback" 和 "generative AI feedback" 术语不一致。**
需要修改。

partial-manuscript.md 当前混用了两词（Introduction 中 "new expectations for feedback"；Preliminary findings 中 "faster feedback"），虽未直接并列，但综述整体需要统一。

**b. 把限制写进结论。**
需要修改。

依据：partial-manuscript.md "Missing sections" 列出 "Conclusion calibrated to the supplied evidence"，但目前的稿件没有结论节。限制如果只在方法节出现，读者会误把暂定性发现读成结论。

# 给审稿人的回复（草稿）

> Manuscript ID: *Working title — Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits*
>
> We thank the reviewer for the careful read. Below we address each comment in turn, summarizing the change and where it appears in the revised manuscript.

**Major 1 — Evidence provenance.**
We agree. The revised manuscript now opens with an explicit evidence-scope statement before any findings are presented. A short "Evidence scope and limits" subsection states that all sources are local, synthetic, and supplied for this manuscript; it does not refer to real participants, real courses, or real institutions, and should not be cited as such. This statement appears immediately after the introduction and before the preliminary findings, so readers cannot conflate these materials with empirical claims.

**Major 2 — Strength of CLM-02.**
We agree that the original wording overstated the evidence. CLM-02 has been rewritten to capture the trade-off the data actually supports: faster formative feedback co-occurred with additional verification work, and no measured workload metric was collected. The revised claim reads: *"Generative AI may redistribute instructor workload rather than reduce it; faster formative feedback in the interview sample was paired with new verification activity, and the supplied evidence does not measure workload."* The `unsupported_as_written` flag in the claims register has been resolved accordingly.

**Major 3 — CLM-03 as hypothesis.**
We agree. CLM-03 is reframed as a hypothesis for future research, not a tested relationship. The wording now reads: *"Hypothesis for future work: clearer course-level disclosure guidance may reduce student uncertainty about acceptable AI use."* Causal language ("is associated with", "reduces") has been removed. The supporting sources (SYN-SURVEY-03, SYN-POLICY-04) are cited as motivation rather than evidence for the relationship, and the gap in the supplied materials is named explicitly.

**Major 4 — Methods and limits on causal inference.**
We agree, and we have added a Methods section. It covers: (a) the four supplied sources and how they were selected (provided as the bounded corpus for this manuscript; no external search, no augmentation); (b) why causal inference is unavailable (single-course observation with no comparison group, convenience sample of instructors, voluntary-response survey, policy text without implementation data, and a local policy change during data collection); (c) the distinction in this manuscript between observation, interpretation, and hypothesis. Each claim now points back to a named source and its documented limits.

**Minor a — Terminology.**
We have standardized on "generative AI feedback" in the revised manuscript. "AI-assisted feedback" has been removed where it appeared; the term now refers to instructor-mediated use of generative AI tools for formative feedback, consistent with the source descriptions.

**Minor b — Limits in the conclusion.**
We agree. The revised conclusion restates the evidence scope (local, synthetic, bounded), the distinction between observation and interpretation, and the open questions that would require new data — including a measured workload metric and a direct test of the disclosure-uncertainty hypothesis. The conclusion is explicitly calibrated to the supplied evidence and does not generalize beyond it.

**What remains limited.**
The synthetic, local nature of the evidence base is unchanged. We have not added participants, effect sizes, citations, ethics approval, or new analyses; CLM-02 still lacks a measured workload variable, and CLM-03 still lacks a direct test. We flag these as the next steps and treat them as future work.

> We believe these revisions address all major and minor comments while preserving the manuscript's central message: that the supplied evidence supports a small set of careful, well-scoped observations and one explicit hypothesis, and not broader causal claims.

---

修订对应表（供作者自查）：

| 评论 | 处理 | 修订位置 |
|---|---|---|
| M1 证据本地且合成 | 新增"Evidence scope and limits"前置小节 | 引言后、Findings 前 |
| M2 CLM-02 过强 | 改写为工作量再分配 + 缺乏测量 | claims.yaml CLM-02；Preliminary findings |
| M3 CLM-03 未检验 | 标记为假设，去掉因果措辞 | claims.yaml CLM-03；Discussion |
| M4 方法与因果局限 | 新增 Methods 节，含四源选择与因果不可得原因 | 新章节 |
| m-a 术语不一致 | 统一为 "generative AI feedback" | 全文 |
| m-b 结论中的限制 | 新增 Conclusion 节，复制证据范围与剩余未知 | 新章节 |
