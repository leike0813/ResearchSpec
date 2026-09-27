# Response to Review Comments

> Synthetic dogfooding fixture — not a real submission response.

We thank the reviewer for the careful read and the major-revision recommendation. Below we respond to each point in order, noting what has been changed in the manuscript, what remains limited, and where we have chosen not to act (with reasons). The response is anchored to the supplied `claims.yaml`, `sources.yaml`, and `partial-manuscript.md`; we do not introduce new data, participants, or citations.

---

## Major comments

### Comment 1 — Locality and syntheticity of the evidence

**Reviewer:** The manuscript should state that all evidence is local and synthetic before presenting findings.

**Response:** Accepted.

We have added an explicit "Evidence base and scope" notice at the head of the revised manuscript. The notice now states, before any finding is reported, that:

- the evidence is drawn from a single first-year writing course (six weeks), five instructor interviews, 84 voluntary student responses, and one institutional policy excerpt;
- all source IDs (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`) are synthetic and not linked to real participants, courses, or institutions;
- no generalisation beyond these four sources is implied.

This caveat is also repeated, in compressed form, at the start of the Discussion and again in the Conclusion, so that the locality restriction is visible at every point where a claim is read.

### Comment 2 — Strength of `CLM-02`

**Reviewer:** `CLM-02` ("Generative AI reduces instructor workload") is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.

**Response:** Accepted (revise, not remove).

`CLM-02` is rewritten in the manuscript and in `claims.yaml` as a balanced statement: instructors report faster formative feedback **and** additional time spent checking unsupported claims. The claim is reframed as a trade-off rather than a net effect. The wording now reads approximately:

> "Instructors in the interview sample reported that faster AI-assisted formative feedback was accompanied by new verification work, so the net effect on workload is not established by the supplied evidence."

The original causal claim ("reduces workload") has been removed; we do not retain a "workload-reducing" reading in either the body or the conclusion. The revised `CLM-02` is tagged `tentative` with the same two limits as before (self-reported workload, no time logs) plus an explicit note that the source reports both directions of effect.

### Comment 3 — `CLM-03` is not directly tested

**Reviewer:** The relationship proposed in `CLM-03` (clear disclosure guidance ↔ fewer student uncertainties) is not directly tested. Treat it as a future research hypothesis.

**Response:** Accepted in substance, with the policy-clarity idea preserved as a hypothesis (per the author's prior note in `revision-context.md`).

Changes made:

- `CLM-03` is re-labelled `hypothesis_only` in `claims.yaml` and the manuscript. The body text no longer asserts an association; it instead proposes a hypothesis to be tested in future work.
- Causal wording ("is associated with", "reduces", "leads to") is removed. The hypothesis is presented as: "If course-level disclosure guidance is made clearer and more uniform, student uncertainty about acceptable AI use may decrease; the supplied materials do not directly test this."
- We note explicitly that `SYN-SURVEY-03` measures self-reported attitudes, not observed behaviour, and that `SYN-POLICY-04` is a text excerpt that does not show implementation quality — so the two sources cannot be linked causally with the present evidence.
- A short "Future research" paragraph is added, sketching the kind of comparison (policy-clarity × pre/post uncertainty, with implementation-fidelity check) that would be needed before any causal language is reinstated.

We have preserved the policy-clarity idea (it is the reviewer's and author's shared intuition) but separated it cleanly from what the evidence can currently support.

### Comment 4 — Methods section on source selection and the limits of causal inference

**Reviewer:** Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.

**Response:** Accepted.

A new "Methods and evidence base" section has been inserted between the Introduction and the Preliminary findings. It covers:

1. **Source selection.** The four sources were supplied as a fixed evidence package for this manuscript. No additional searches, databases, or external sources were used; we did not cherry-pick from a larger pool. Each source is described by kind (classroom observation, instructor interview, student survey, policy excerpt), scope, and stated limits — drawing on `sources.yaml` and reproducing the limits verbatim where they are policy-relevant.
2. **Why causal inference is unavailable.** Three structural reasons are given:
   - no comparison or control condition (single course, no parallel group);
   - the data are summaries, not unit-level records (no effect sizes, no inferential statistics);
   - the policy text and the survey were collected under changing local conditions (the institutional policy changed during data collection for `SYN-SURVEY-03`).
3. **What the evidence can support.** The section ends by listing the three legitimate uses of the present evidence: descriptive observations, tentative patterns, and hypothesis generation. It explicitly rules out causal or generalisable claims.
4. **Ethics and data.** We state that the package contains no ethics-board documentation, no identifiable data, and no completed review; we therefore do not present any of the findings as if they had been through a formal ethics process.

The same reasoning is referenced (not duplicated) in the Discussion and the Conclusion.

---

## Minor comments

### Comment M1 — Consistent terminology

**Reviewer:** Use consistent terms for "AI-assisted feedback" and "generative AI feedback".

**Response:** Accepted. The revised manuscript uses a single term, **"generative-AI feedback"**, throughout, with one parenthetical note at first mention that it is equivalent to what the supplied sources describe as AI-assisted feedback. No other variant appears in the body, headings, or conclusion.

### Comment M2 — Limitations visible in the conclusion

**Reviewer:** Make the limitations visible in the conclusion, not only in methods.

**Response:** Accepted. The Conclusion now opens with a one-paragraph restatement of the evidence scope (single course, single institution, five instructors, 84 voluntary respondents, one policy text, all synthetic) before any forward-looking statement. Limitations are no longer confined to the Methods section; the conclusion explicitly states that the three legitimate readings of the evidence are (a) what is observed, (b) what is tentatively patterned, and (c) what is hypothesised for future work — and that nothing stronger is warranted.

---

## What has not changed, and why

- **Claim IDs.** `CLM-01`, `CLM-02`, `CLM-03` are preserved as stable identifiers, with revised wording and strength labels. The review-response workspace can therefore track changes without re-keying.
- **`CLM-01` wording.** The tentative finding on structured prompting and visible outline revisions is retained as written; the reviewer did not flag it, and the supporting source (`SYN-CLASSROOM-01`) is consistent with the cautious wording.
- **No new data, sources, or analyses.** Per `revision-context.md` and the project constraints, we have not introduced new participants, effect sizes, citations, or a completed ethics review. The limits listed in `claims.yaml` and `sources.yaml` are reproduced, not extended.

## Summary of changes by artefact

| Artefact | Change |
|---|---|
| `claims.yaml` | `CLM-02` rewritten as a trade-off; `CLM-03` relabelled `hypothesis_only`; `CLM-01` unchanged. |
| `partial-manuscript.md` → revised manuscript | New "Evidence base and scope" notice; new "Methods and evidence base" section; conclusion restates limits; terminology unified to "generative-AI feedback". |
| `review-comments.md` | No change (reviewer file). |
| `revision-context.md` | No change (author intent file). |
| New: this response file | Point-by-point response covering major and minor comments. |

## Items the manuscript still cannot answer

We list these so the reviewer and editor can see what remains out of scope, not as new claims:

- Whether the observed revision activity corresponds to writing-quality improvement (no validated measure in `SYN-CLASSROOM-01`).
- Whether the policy-clarity hypothesis would survive a controlled comparison.
- Whether the instructor trade-off generalises beyond five self-reported interviews.
- Whether student attitudes in `SYN-SURVEY-03` reflect observed behaviour.

These are flagged in the Discussion as "open questions", not as findings.
