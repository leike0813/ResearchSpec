# Response to Reviewers

**Manuscript**: Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits
**Editorial recommendation acknowledged**: Major revision
**Response prepared**: 2026-09-27

We thank the editor and reviewers for the careful reading. The four major comments and two minor comments all pointed to the same underlying issue: the manuscript overstated what its evidence supports and under-described where that evidence comes from. We have revised accordingly. Each comment is addressed below in order, with the position we adopted and the sections of the manuscript that changed. Stable claim IDs (`CLM-01`, `CLM-02`, `CLM-03`) are preserved.

## Major comments

### Major Comment 1 — Local, synthetic framing before findings

**Reviewer.** The manuscript should state that all evidence is local and synthetic before presenting findings.

**Response.** Accepted. Readers must see the provenance of the evidence before any claim is introduced, otherwise the caveat only attaches after the reader has already weighed the claim. We have therefore moved the scope statement forward.

**Change in the manuscript.** The Introduction now carries a sentence naming the evidence base as a small, locally collected, synthetic corpus. A short *Evidence scope and limits* note has been added at the very start of the Preliminary findings section; every claim below it sits inside that frame. The original wording of the section opening has been replaced, not appended to.

### Major Comment 2 — CLM-02 is too strong

**Reviewer.** `CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.

**Response.** Accepted, with a substantive rewrite rather than removal. The interview summary (`SYN-INTERVIEW-02`) does report faster formative feedback, but it also reports additional time spent checking unsupported claims; the net effect on instructor workload is undetermined in the supplied evidence. Removing the claim entirely would discard a useful observation that the next study should measure. We have reformulated the claim as a tentative trade-off rather than a one-directional reduction.

**Change in the manuscript.** `CLM-02` has been rewritten in `claims.yaml`: the strength is changed from `unsupported_as_written` to `tentative`, and the wording now states that faster feedback coincided with new verification work, with the net workload effect undetermined. The corresponding paragraph in Preliminary findings has been replaced with the reformulated wording; the conclusion no longer refers to workload reduction as an outcome.

### Major Comment 3 — CLM-03 is not directly tested

**Reviewer.** The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.

**Response.** Accepted in substance. The underlying observation — that students reported uncertainty about acceptable use while the existing policy already requires course-level disclosure — is worth keeping, because it surfaces a real design question. The supplied materials, however, do not directly compare policy clarity with student uncertainty, so any causal phrasing was unsupported. We have kept the idea, but moved it out of the findings register and into the hypothesis register.

**Change in the manuscript.** `CLM-03` is relabelled in `claims.yaml` as `strength: hypothesis_only`; the claim text has been edited to remove causal wording ("is associated with" → "may be related to, pending a study that compares policy clarity directly"). The Preliminary findings paragraph that previously stated the relationship as a finding is replaced with a brief mention that flags it as a hypothesis; a new paragraph in the Conclusion restates the hypothesis and the conditions under which it could be tested (a stable policy window, before/after student reports, and a direct measure of policy clarity as perceived by students).

### Major Comment 4 — Methods section and why causal inference is unavailable

**Reviewer.** Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.

**Response.** Accepted. The previous draft had no methods section at all, which is the structural reason the manuscript read as though it were reporting findings from a designed study when it was not. We have added the missing section.

**Change in the manuscript.** A new *Methods and evidence-selection limitations* section now sits between the Introduction and the Preliminary findings. It states that the four sources are the entire evidence base supplied for this paper rather than a sampled subset, so source selection is bounded by what was available, not by a search strategy. It then describes each source by kind (`classroom_observation_summary`, `instructor_interview_summary`, `student_survey_summary`, `institutional_policy_excerpt`) and lists, source by source, the structural reasons causal inference is unavailable: no comparison group and no validated writing-quality measure in the classroom observation; no time logs and a small convenience sample in the interview summary; voluntary-response bias and a mid-collection policy change in the survey; and a policy excerpt that shows text but not implementation. The section closes with the framing decision — that the paper offers hypotheses and design constraints, not causal estimates. The "Missing sections" list in the original draft is now realised rather than listed.

## Minor comments

### M1 — Consistent terminology for AI-assisted feedback

**Reviewer.** Use consistent terms for "AI-assisted feedback" and "generative AI feedback".

**Response.** Accepted. We have chosen *AI-assisted feedback* as the canonical term and applied it uniformly across the Introduction, the new Methods section, the Preliminary findings, and the Conclusion. The two prior variants have been replaced. Synthetic sources are referred to by their `source_id` (e.g. `SYN-INTERVIEW-02`) wherever the underlying material is named, to avoid the same drift in the other direction.

**Change in the manuscript.** Term unified to "AI-assisted feedback" throughout; source references standardised to `source_id`.

### M2 — Limitations visible in the Conclusion

**Reviewer.** Make the limitations visible in the conclusion, not only in methods.

**Response.** Accepted. The previous draft had no Conclusion section at all. The new Conclusion is short and carries forward the limits the Methods section establishes, rather than leaving them implicit at the end of the paper.

**Change in the manuscript.** A new Conclusion section has been added. It restates three limits that the reader needs in order to weigh the manuscript correctly: the evidence is local and synthetic; `CLM-02` is a tentative trade-off, not a workload reduction; `CLM-03` is a hypothesis, not a tested relationship. It closes with the conditions under which a more definitive study could be designed (a control group, time logs, a stable policy window, and a measure of writing quality rather than only revision activity). The Methods section remains the primary home for the source-by-source limits; the Conclusion mirrors only what a reader needs to take away.

## Closing

The revised manuscript addresses every major and minor comment, retains the stable claim IDs, and stays inside the supplied evidence. We have introduced no new participants, effect sizes, citations, or completed ethics review, and we have not relabelled the manuscript as a generalisable study. We welcome any further guidance from the editor and reviewers.
