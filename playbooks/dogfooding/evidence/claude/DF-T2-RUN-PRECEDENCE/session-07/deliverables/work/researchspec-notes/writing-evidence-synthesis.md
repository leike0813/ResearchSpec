# Writing-evidence synthesis

> Synthetic test fixture. Inputs: `benchmark/sources.yaml`, `benchmark/partial-manuscript.md`. No external sources are introduced. Observation / interpretation / unknown kept separate.

## 1. Claim-by-claim cross-check

| # | Draft claim | Best source | Status | Calibration needed |
|---|---|---|---|---|
| 1 | Universities are negotiating new expectations for feedback, authorship, and disclosure | SYN-SURVEY-03, SYN-POLICY-04 | Partial | Tighten wording |
| 2 | Structured prompting coincided with more visible outline revisions in one introductory course | SYN-CLASSROOM-01 | Supported within limits | Carry limits inline; fix source ID |
| 3 | Interview summaries suggest faster feedback may be offset by verification work | SYN-INTERVIEW-02 | Supported within limits | Add sample-size caveat |
| 4 | The stronger claim that generative AI reduces workload is not supported by the supplied evidence | none | Withheld correctly | Keep as-is |

### 1.1 Claim 1 — Negotiating new expectations

- SYN-SURVEY-03 documents respondent uncertainty about permitted use and attribution (authorship / disclosure side).
- SYN-POLICY-04 shows disclosure rules are mandated at course level while acceptable assistance is delegated to instructors (negotiation side).
- The "feedback" half is not directly evidenced by either source; SYN-INTERVIEW-02 speaks to instructor workload, not student-facing expectations.
- Suggest tightening the manuscript sentence to: "Students and instructors are negotiating disclosure and attribution expectations, while feedback-side expectations remain underexamined in the supplied evidence."

### 1.2 Claim 2 — Structured prompting and outline revisions

- SYN-CLASSROOM-01 directly supports "more outline revisions."
- Limits that must travel with the claim: no comparison group, no validated measure of writing improvement, instructor supplied all prompts.
- Citation drift: the draft cites `CLM-01`; the source ID is `SYN-CLASSROOM-01`. The draft must not be circulated with the wrong identifier.

### 1.3 Claim 3 — Faster feedback offset by verification work

- SYN-INTERVIEW-02 directly supports both halves ("faster formative feedback" and "additional time spent checking unsupported claims").
- Limits already implicit in the draft's hedged verbs ("suggest", "may be"); add explicit sample caveat (five instructors, one institution, self-reported, no time logs) so the inference does not read as a generalisable effect.

### 1.4 Claim 4 — Workload-reduction claim unsupported

- No source supports a generalisable reduction in instructor or student workload. SYN-INTERVIEW-02 actually pushes against a simple reduction reading by introducing verification time.
- The draft's withholding is correct and should be preserved.

## 2. Material available for the four missing sections

The draft lists missing: methods and evidence-selection limitations, discussion of policy variation, alternative explanations, conclusion calibrated to the supplied evidence.

- **Methods and evidence-selection limitations** — can be drafted directly from the `limits:` lines already present in `sources.yaml`. No new methodology is implied.
- **Discussion of policy variation** — SYN-POLICY-04 is a single-site excerpt. The section should state explicitly that policy variation across institutions is not represented in the supplied evidence.
- **Alternative explanations** — the supplied sources include no baseline, control, or counterfactual. The draft should state that alternative explanations (instructor prompting style, cohort effects, novelty of the tool, policy timing) cannot be ruled out from the supplied evidence.
- **Conclusion calibrated to the supplied evidence** — must remain within what the four sources actually show. General causation, scalable workload reduction, and institution-wide policy effect are unsupported by these sources and must not appear in the conclusion.

## 3. Open items requiring user decision

- Whether to fix the `CLM-01` → `SYN-CLASSROOM-01` citation in `benchmark/partial-manuscript.md` now, or leave the fixture unchanged.
- Whether the manuscript should add the missing-sections text in this session, or whether the user will draft those sections themselves.
- Whether the manuscript's title should be tightened to match the narrower claim set (current title implies opportunities and friction broadly; the evidence only supports a narrower framing).