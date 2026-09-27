# Response to Reviewers

> Draft revision-cycle response. Tied to `partial-manuscript.md`, `review-comments.md`, `revision-context.md`, and `claims.yaml`. Claim IDs are preserved where possible; `CLM-02` and `CLM-03` are re-stated, not renumbered, so that the diff in the revised manuscript stays traceable.

We thank the editor and reviewers for the careful read. We accept the recommendation of major revision. Below we address each comment in turn and indicate where the corresponding change appears in the revised manuscript.

---

## Major comments

### Comment 1 — Locality and synthetic nature of the evidence

**Reviewer.** *The manuscript should state that all evidence is local and synthetic before presenting findings.*

**Response.** Accepted. The revised manuscript opens the Methods section with an explicit statement that the four sources (SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04) are local and synthetic, that they were produced for the present study and are not drawn from a published corpus, and that no external sampling or comparison group supports them. The same caveat is repeated in the opening paragraph of Preliminary findings so that readers cannot read the claims as field-tested effects. The Limitations subsection restates it once more, so the boundary is visible in three places rather than one.

**Change in manuscript.** New Methods section, §2; revised opening of §3 (Preliminary findings); strengthened wording in §5 (Limitations).

### Comment 2 — Strength of CLM-02

**Reviewer.** *`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.*

**Response.** Accepted. We retain the claim because the interview summary is the only signal we have on instructor time, and dropping it entirely would misrepresent the evidence. We have reworded `CLM-02` from "Generative AI reduces instructor workload" to "Instructors reported faster formative feedback alongside new verification work, so net workload change is unclear from the supplied evidence." The trade-off phrasing matches what SYN-INTERVIEW-02 actually records. The claim keeps the same ID and is now annotated in `claims.yaml` with the same trade-off in its limits. Causal wording ("reduces") has been removed.

**Change in manuscript.** Revised sentence carrying `CLM-02` in §3; updated entry for `CLM-02` in the claim list appended to the Methods section.

### Comment 3 — Status of CLM-03

**Reviewer.** *The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.*

**Response.** Accepted in substance, with the wording the editor asked us to preserve. We have demoted `CLM-03` from a claim supported by SYN-SURVEY-03 and SYN-POLICY-04 to a hypothesis, and removed the causal verb "associated with" from the in-text wording. The revised statement reads: "Whether clearer disclosure guidance reduces student uncertainty about acceptable AI use is a hypothesis; the supplied materials describe each separately rather than comparing them." The hypothesis is registered in a new Future Research subsection and is no longer carried in the Preliminary findings list. `CLM-03` keeps its ID so the prior reading trail is not broken; its strength in `claims.yaml` is set to `hypothesis_only`, matching the existing limit note.

**Change in manuscript.** `CLM-03` moved from §3 to a new §6 (Future research hypotheses); corresponding update in the claim list and in `claims.yaml`.

### Comment 4 — Methods section and the basis for the four sources

**Reviewer.** *Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.*

**Response.** Accepted. The new Methods section (§2) records that the four sources are a fixed synthetic corpus assembled to mirror the kinds of evidence a campus study might collect (one classroom observation, one instructor interview summary, one student survey, one institutional policy excerpt), and that they were not sampled for representativeness. It then explains why causal inference is unavailable: no comparison condition, no pre-registered outcome, no workload time log, voluntary-response survey, and a policy that changed during data collection. The same subsection lists the claim each source is permitted to support and the limit flagged in `claims.yaml`, so readers see the source-to-claim mapping in one place.

**Change in manuscript.** New §2 (Methods and evidence selection); claim-to-source table appended at the end of §2; cross-reference from §5.

---

## Minor comments

### Comment M1 — Terminology consistency

**Reviewer.** *Use consistent terms for "AI-assisted feedback" and "generative AI feedback".*

**Response.** Accepted. The revised manuscript uses "generative AI feedback" throughout, with "AI-assisted feedback" retained only inside direct quotations of instructor statements from SYN-INTERVIEW-02. The choice is recorded once in §2 so that the convention is auditable.

### Comment M2 — Limitations in the conclusion

**Reviewer.** *Make the limitations visible in the conclusion, not only in methods.*

**Response.** Accepted. The Conclusion (§7) now closes with a short paragraph that restates the three core limits in plain language: the evidence is local and synthetic, the claims are at most tentative (with `CLM-02` reframed as a trade-off and `CLM-03` repositioned as a hypothesis), and no causal inference is supported. This mirrors the structure of §5 so that a reader who reaches only the conclusion still sees what the paper does and does not show.

---

## Summary of remaining limits

Nothing in this revision introduces new data, participants, effect sizes, citations, or ethics approvals. The four sources, their IDs, and their internal limits are unchanged. The changes are confined to claim wording (CLM-02 reframed as a trade-off, CLM-03 demoted to hypothesis), a new Methods section, a new Future Research subsection, terminology standardization, and a limitations paragraph in the Conclusion. We invite the reviewers to flag any place where the new wording still reads as stronger than the underlying evidence supports.
