# Response to Reviewers

> TEST FIXTURE — NOT A REAL MANUSCRIPT RESPONSE

## Overview

We thank the editor and reviewers for a careful read. The recommendation is **major revision**, and we agree that the original submission overstated several claims and did not sufficiently bound its evidence. This letter explains, comment by comment, what we have changed in the revised manuscript, what we have left in place, and where remaining limits are now made explicit.

For orientation: the manuscript treats three central claims — `CLM-01` (visible revision activity), `CLM-02` (workload reduction), and `CLM-03` (disclosure clarity vs. student uncertainty) — using four supplied sources (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`). All four sources are local and synthetic, and the revised manuscript now states this up front.

---

## Major comments

### Comment 1 — Evidence base should be flagged as local and synthetic before findings

**Agreed.** The reviewer is right that the introduction framed the evidence set as if it were generalizable. We have added a short note at the very start of the *Findings* section:

> *All evidence in this manuscript is local and synthetic. The four sources come from a single benchmark fixture used for offline testing. No participant, institution, effect size, or citation should be read as real, and no claim in this paper is intended as a general causal statement.*

This is now the first paragraph readers see before any claim is presented. We have also moved the corresponding limit into the abstract so that the scope is visible without reading the methods.

### Comment 2 — `CLM-02` is too strong

**Agreed, with reframing.** We initially wrote `CLM-02` as “Generative AI reduces instructor workload,” supported only by `SYN-INTERVIEW-02`. On re-reading that source, we agree that the interview summary explicitly reports *both* a time saving (faster formative feedback) and an additional cost (time spent checking unsupported claims). The original wording collapsed this into a one-sided effect.

In the revised manuscript we have:

- Restated `CLM-02` as a trade-off: *“Interview summaries indicate that faster AI-assisted feedback can be partially offset by additional instructor time spent verifying unsupported claims. The direction and magnitude of the net workload effect are not measured.”*
- Lowered the claim strength label from `unsupported_as_written` to `tentative_trade_off`, with the explicit caveat that the source contains no time logs and that “workload” was self-reported.
- Added the corresponding limit in the discussion: even if the trade-off is real, the supplied evidence cannot tell us whether it nets out positive or negative for any given instructor or course.

We considered removing `CLM-02` entirely, as the reviewer suggested, but kept it because the trade-off is itself a useful design constraint. The revised wording is deliberately symmetric — it does not assert a reduction.

### Comment 3 — `CLM-03` should be treated as a hypothesis

**Agreed in part, with the reframing the author already proposed.** The original wording (“clear disclosure guidance is associated with fewer student uncertainties”) implied a tested relationship. The supplied evidence does not directly compare policy clarity with student uncertainty: `SYN-SURVEY-03` measures student-reported attitudes in a setting where local policy changed during data collection, and `SYN-POLICY-04` only describes a policy text, not its implementation. We cannot, from these two sources, separate a policy effect from a cohort or policy-change effect.

In the revised manuscript we have:

- Reclassified `CLM-03` as `hypothesis_only` and renamed it *“Hypothesis H1: Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use.”*
- Removed all causal verbs (e.g., “reduces,” “decreases”) from the surrounding prose and replaced them with directional language (“would be expected to,” “is a candidate explanation for”).
- Moved the claim out of *Findings* into a dedicated *Hypotheses for future work* subsection of the discussion, where it is paired with the specific comparison that would be needed to test it (a cross-institutional survey with policy-clarity coding and a pre/post policy-change design).
- Kept the underlying intuition — that disclosure rules might reduce uncertainty — because it is the most actionable of the three claims and is consistent with the survey respondents’ self-reports. We do not, however, present it as a finding.

### Comment 4 — Add a methods section explaining source selection and the absence of causal inference

**Agreed.** The original submission had no methods section. We have added one titled *Methods and evidence limits*. It covers:

- **Source set.** The four sources are the entire evidence base. They were not sampled from a larger corpus; they are the complete fixture provided for this revision. We state this plainly.
- **Selection rationale.** Each source contributes a different lens — classroom observation, instructor interviews, student survey, and institutional policy text. Together they cover the four dimensions named in the goal (writing process, feedback quality, workload, integrity). We did not select sources to confirm or disconfirm a hypothesis; we worked with what was supplied.
- **Why causal inference is unavailable.** We list the reasons in the manuscript: (i) no comparison group in `SYN-CLASSROOM-01`; (ii) self-report without time logs in `SYN-INTERVIEW-02`; (iii) voluntary response bias and a mid-study policy change in `SYN-SURVEY-03`; (iv) policy text without implementation data in `SYN-POLICY-04`. None of the sources supports a counterfactual, and the survey’s policy change confounds any policy-clarity interpretation.
- **Strength labels.** We adopt the four-level scheme already present in `claims.yaml` (`tentative`, `tentative_trade_off`, `hypothesis_only`, `unsupported_as_written`) and apply it consistently in the manuscript.

We have deliberately not invented additional methods (no constructed comparison group, no simulated effect sizes, no assumed ethics review). Where evidence is missing, the manuscript now says so.

---

## Minor comments

### Consistent terms for “AI-assisted feedback” and “generative AI feedback”

**Addressed.** The manuscript now uses *“AI-assisted feedback”* as the umbrella term throughout, and reserves *“generative AI feedback”* for cases where the generative nature of the tool is itself the point of discussion (e.g., the introduction). A short footnote in the methods section defines the two terms and notes that they are not interchangeable in this paper.

### Limitations should be visible in the conclusion, not only in methods

**Addressed.** The conclusion now opens with a one-paragraph *Scope of evidence* statement that repeats, in plain language, the three most important limits: the evidence is local and synthetic; no causal inference is supported; and one of the three central claims (`CLM-03`) is a hypothesis, not a finding. The detailed treatment remains in the methods and discussion sections, but the conclusion no longer lets the limits stay invisible.

---

## What has not changed, and why

- **`CLM-01`** is preserved with the same ID. The source (`SYN-CLASSROOM-01`) directly supports the revised wording (*“Structured prompting coincided with more visible outline revisions in one introductory course”*) and the limit (single course, no validated writing-quality measure) was already explicit. We did not weaken or strengthen it.
- **Claim IDs.** We kept the existing IDs (`CLM-01`, `CLM-02`, `CLM-03`) so that the response, the revised manuscript, and `claims.yaml` continue to refer to the same entities. The strength labels in `claims.yaml` have been updated to match the revised manuscript.
- **No new data, sources, analyses, or ethics review have been added**, in line with the original brief and the revision context.

---

## Summary of changes

| Item | Before | After |
| --- | --- | --- |
| Evidence framing | Implicit | Explicitly local and synthetic, stated before findings |
| `CLM-02` wording | One-sided “reduces workload” | Symmetric trade-off, no net claim |
| `CLM-02` strength | `unsupported_as_written` | `tentative_trade_off` |
| `CLM-03` status | Causal-sounding finding | Hypothesis H1, moved to future-work subsection |
| Methods section | Absent | Added, including selection rationale and causal-inference limits |
| Terminology | Mixed | “AI-assisted feedback” used consistently; “generative AI feedback” reserved |
| Conclusion limits | Hidden | Repeated in plain language at the opening |

We believe these revisions address every major and minor comment. We are happy to provide further clarification if the editor or reviewers would like.
