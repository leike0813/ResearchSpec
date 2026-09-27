# Response to Reviewers

**Manuscript:** *Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits*
**Editorial recommendation received:** Major revision

We thank the editor and the reviewer for the careful read and for the four major and two minor comments. The recommendation for major revision is fair, and we accept comments 1, 2, and 4 in full. For comment 3, we accept the recommendation to drop causal wording and to mark the claim as a hypothesis; we have kept the underlying policy-clarity observation because the four supplied sources together suggest it, but we agree it has not been directly tested. A consolidated change list follows the point-by-point responses.

> Note for reviewers and editors reading this draft: the manuscript under review, the reviewer comments, and the source materials used in this draft are explicitly marked as **synthetic test fixtures** prepared for ResearchSpec dogfooding. They do not describe a real study, real participants, real institutional records, or a real peer-review exchange. The responses below are written against those fixtures on that basis.

---

## Summary of changes

| # | Reviewer comment (short) | Decision | Manuscript change |
| --- | --- | --- | --- |
| Major 1 | Disclose that all evidence is local and synthetic | Accepted | New evidence-scope paragraph added before Preliminary findings |
| Major 2 | CLM-02 is too strong as written | Accepted | CLM-02 reformulated as a trade-off observation; strength downgraded |
| Major 3 | CLM-03 is not directly tested; treat as hypothesis | Partially accepted (keep idea, remove causality) | Wording rewritten to a candidate hypothesis; "associated with" replaced by a non-causal phrasing |
| Major 4 | Add a Methods section on source selection and causal limits | Accepted | New Methods section added, including per-source limits and an explicit "no causal inference" note |
| Minor 1 | Use one term for AI-assisted feedback | Accepted | "AI-assisted formative feedback" adopted throughout, with a first-use definition |
| Minor 2 | Surface limitations in the Conclusion, not only in Methods | Accepted | Conclusion rewritten to mirror the Methods limitations |

---

## Major comments

### Major 1 — Evidence scope disclosure

> *"The manuscript should state that all evidence is local and synthetic before presenting findings."*

**Decision:** Accepted.

**Response and change.** We agree that the previous draft moved from Introduction to Preliminary findings without naming the scope of the underlying evidence. A new opening paragraph has been added before the preliminary findings, stating that the four sources supporting this paper are all local, single-institution, and synthetic; that they were chosen to illustrate design constraints rather than to support general claims; and that any inferential language in the body must be read against this scope. The same disclosure is repeated in the Methods section (see Major 4) and echoed in the rewritten Conclusion (see Minor 2).

### Major 2 — Strength of CLM-02

> *"`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it."*

**Decision:** Accepted.

**Response and change.** We agree that the original wording — "Generative AI reduces instructor workload" — went beyond what the source supports. SYN-INTERVIEW-02 reports both faster formative feedback **and** additional time spent checking unsupported claims, and provides no measured workload data. We have rewritten CLM-02 as a tentative trade-off observation:

> *Revised CLM-02.* Instructors report that time savings from faster AI-assisted formative feedback appear to be partially offset by additional verification work on unsupported claims; the supplied materials do not include measured workload data.

The corresponding entry in `claims.yaml` is updated from `strength: unsupported_as_written` to `strength: tentative`, and its `limits` field is preserved verbatim. We retain the claim rather than removing it because it captures a pattern the interviewees consistently described, and because dropping it would leave the friction point — verification work — unmentioned in the body.

### Major 3 — Status of CLM-03

> *"The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis."*

**Decision:** Partially accepted — keep the underlying observation, drop causal wording, mark as a hypothesis.

**Response and change.** We accept the reviewer's main point: the four supplied sources do not jointly test the relationship between policy clarity and student uncertainty, so the previous wording ("Clear disclosure guidance is associated with fewer student uncertainties") was stronger than the evidence supports. At the same time, we would like to keep the observation in the paper because SYN-SURVEY-03 and SYN-POLICY-04 together point to it, and because it is the kind of hypothesis the field needs. We have therefore rewritten CLM-03 to make its status explicit:

> *Revised CLM-03 (hypothesis).* Clearer course-level disclosure guidance is a candidate for reducing student uncertainty about acceptable AI use; the supplied materials point in this direction but do not directly compare policy clarity with uncertainty, and the relationship should be treated as a future research hypothesis.

The "associated with" phrasing has been replaced with a non-causal construction, and the strength in `claims.yaml` remains `hypothesis_only`, with its existing `limits` field preserved. The Discussion now flags this explicitly as a hypothesis to be tested in a design that compares institutions or courses differing in policy specificity.

### Major 4 — Methods section on source selection and causal limits

> *"Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable."*

**Decision:** Accepted.

**Response and change.** A Methods section has been added before the Preliminary findings. It covers four points:

1. **Source set.** The analysis draws on four supplied sources: SYN-CLASSROOM-01 (six-week classroom observation in one first-year writing course), SYN-INTERVIEW-02 (five instructors at one institution), SYN-INTERVIEW/SYN-SURVEY-03 (84 voluntary student responses, with the local policy changing during the data collection window), and SYN-POLICY-04 (one synthetic institutional policy excerpt). All four are local and single-institution.
2. **Selection rationale.** The four sources were not sampled to estimate effects; they were chosen because together they touch each part of the writing-and-feedback loop (instructional practice, instructor experience, student attitudes, institutional rule-making), which is what a paper at this stage needs to map the surface area.
3. **Per-source limits.** The section reproduces the limit fields from `sources.yaml` for each source — for example, no comparison group and no validated measure of writing improvement (SYN-CLASSROOM-01); self-reported workload with no time logs (SYN-INTERVIEW-02); voluntary response bias and attitudinal rather than behavioral data (SYN-SURVEY-03); and policy text that does not show implementation quality (SYN-POLICY-04).
4. **Why causal inference is unavailable.** The section states plainly that the four sources provide no comparison group, no pre/post measurement, no time logs, and no behavioral measure of academic-integrity outcomes, so any causal statement about generative AI's effect on workload, revision quality, or student uncertainty would not be supported. Inferential language in the body is restricted accordingly.

---

## Minor comments

### Minor 1 — Term consistency for AI-assisted feedback

> *"Use consistent terms for 'AI-assisted feedback' and 'generative AI feedback'."*

**Decision:** Accepted.

**Response and change.** We have adopted **"AI-assisted formative feedback"** as the single term and have added a first-use definition in the Introduction ("AI-assisted formative feedback: written responses on drafts produced with the help of a generative AI tool and intended to inform revision, rather than to be submitted as the student's own work"). All previous uses of "generative AI feedback" in the body have been replaced, and the term has been threaded through the new Methods section.

### Minor 2 — Limitations in the Conclusion

> *"Make the limitations visible in the conclusion, not only in methods."*

**Decision:** Accepted.

**Response and change.** The Conclusion has been rewritten. The previous closing paragraph implied a more general takeaway than the evidence supports; the new closing restates the scope (single institution, four sources, all local and synthetic), the kinds of claim the data can and cannot support, and the three open questions the field needs answered before stronger claims become possible: comparison-group evidence on revision quality, measured instructor workload, and a direct test of the CLM-03 hypothesis. The Limitations subsection in Methods now serves as the source of truth; the Conclusion mirrors it rather than introducing new caveats.

---

## What remains limited

We want to be explicit about what this revision does **not** do, so that the editor and reviewer can judge whether a further round is needed:

- We have not added new sources, new data, or new analyses. The four-source set and its limits are unchanged.
- We have not measured workload, revision quality, or academic-integrity outcomes. Any future claim along these lines still requires an instrumented design.
- The hypothesis treatment of CLM-03 is a wording and framing change; it is not a new test. A direct test of the relationship between policy specificity and student uncertainty remains future work.
- The evidence scope is still local, single-institution, and synthetic. The Introduction and Methods now say so, but the limitation itself has not gone away.

We believe the manuscript, in its revised form, stays within the evidence it actually has and offers a usable map of where stronger work would have to go next. We are grateful for the comments that pushed us there.