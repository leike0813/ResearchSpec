# Writing Evidence Synthesis — Synthetic Test Fixture

> TEST FIXTURE — not a real research product. All source IDs (`SYN-*`) and claim IDs (`CLM-*`) below are synthetic and have no external correspondence.

## Scope

Cross-check the working draft (`benchmark/partial-manuscript.md`) against the supplied source summaries (`benchmark/sources.yaml`) for the bounded question: *which draft claims can be supported by the supplied evidence, and where do they outrun it?*

## Claim-by-claim mapping

### CLM-01 — Structured prompting coincided with more visible outline revisions

- **Draft text.** "Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)."
- **Closest source.** `SYN-CLASSROOM-01` (classroom observation summary, one first-year writing course, six weeks) reports that students using structured AI prompts produced more outline revisions, while final rubric scores varied widely.
- **Support level.** Partial and descriptive. The source confirms the *co-occurrence* in one course; the draft frames it cautiously and adds no causal claim.
- **Limits that must travel with the sentence.** No comparison group, no validated writing-improvement measure, and the instructor supplied all prompts. The finding cannot be read as a population-level effect, an attribution to prompting per se, or a transfer result to other instructors or courses.
- **Verdict.** Keep as a one-course descriptive observation; do not extend to causal or general language.

### CLM-02 — "Generative AI reduces instructor workload"

- **Draft text.** The draft explicitly states this stronger claim is not supported by the supplied evidence.
- **Closest source.** `SYN-INTERVIEW-02` (five instructors at one institution) reports that faster formative feedback was offset by additional time spent checking unsupported claims. Workload data are self-reported, with no time logs.
- **Support level.** The source *contradicts* a net reduction. Five self-reporting instructors at a single institution, with no time logs, do not support a general workload-reduction claim; they only support a *trade-off* hypothesis.
- **Verdict.** Retain the draft's restraint. If the manuscript later wishes to discuss workload, frame it as a trade-off (faster feedback ↔ verification overhead) under voluntary-report limits, not as a reduction.

### Implicit claim — Faster formative feedback and verification overhead

- **Draft text.** "Faster feedback may be offset by verification work."
- **Closest source.** `SYN-INTERVIEW-02`.
- **Support level.** Direct match. The source supplies both halves of the trade-off.
- **Limits.** Self-reported workload, small convenience sample, single institution, no time logs. The claim should be presented as a hypothesis emerging from one interview set, not as an established pattern.
- **Verdict.** Keep the modal "may be offset" language; do not upgrade to "is offset" or "reduces net workload."

## Other sources and what they add

- `SYN-SURVEY-03` (84 voluntary student responses) shows that students value rapid feedback but feel uncertain about permitted use and attribution. This is *attitudinal*, not behavioral, and is biased by voluntary response; it does not directly support any sentence in the draft but is relevant for the Discussion once the manuscript expands beyond the Preliminary Findings. Do not draw behavior conclusions from it.
- `SYN-POLICY-04` (one synthetic university policy excerpt) records that course-level disclosure is required while acceptable assistance is left to instructors. The policy text does not measure implementation quality, and it is not generalizable. The draft's Introduction gestures at negotiated expectations; this source can ground that, but only as a single-institution illustration, not as evidence of policy effect.

## What the supplied evidence does NOT support

- Causal claims about generative AI improving student writing.
- Generalizable claims about instructor workload, student behavior, or institutional policy.
- Cross-institution comparison or longitudinal change.
- Any effect size, percentage, or statistical association: the supplied sources carry none.

## Suggested manuscript adjustments

1. Keep CLM-01 as a one-course observation; add the prompt-source caveat in the same sentence.
2. Keep the explicit non-support statement for CLM-02; consider demoting it from "preliminary findings" into the Limitations subsection once one exists.
3. Carry the `SYN-INTERVIEW-02` limits (self-report, convenience sample, no time logs) into any sentence that mentions the verification trade-off.
4. Defer `SYN-SURVEY-03` and `SYN-POLICY-04` to the Discussion and Policy Variation sections; do not import them into Findings.

## Calibration note for the draft

The supplied source set is small, single-institution, synthetic, and methodologically thin (no comparison groups, no validated measures, no time logs, no behavioral data). The draft's Missing sections list (Methods and evidence-selection limitations; Discussion of policy variation; Alternative explanations; Calibrated conclusion) is the right next target. Any sentence that survives into those sections should retain its limits in line.

## Open question for the user

Whether the manuscript should (a) stay within the supplied synthetic evidence and explicitly label it as such, (b) request permission to widen scope before any causal or generalizable claim is added, or (c) close the file as a methodological exercise with no external claim. The first option matches the goal statement; the other two require explicit user approval per the goal's scope rules.