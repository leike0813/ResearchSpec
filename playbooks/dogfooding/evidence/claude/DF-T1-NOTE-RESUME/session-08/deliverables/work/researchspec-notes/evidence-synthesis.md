# Evidence Synthesis: draft claims vs. supplied synthetic sources

Scope: ordinary continuation of the open task in `work/researchspec-notes/writing-evidence.md`. Inputs are the synthetic evidence in `benchmark/sources.yaml` and the working draft in `benchmark/partial-manuscript.md`. All `SYN-*` IDs are synthetic test material; no external publication has been verified.

The draft makes three explicit claims about generative AI in university writing instruction. This note records what the supplied evidence does and does not support for each, plus what the introduction implies but does not formalize as a claim.

## Claim-by-claim mapping

### Claim 1 — "Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`)"

- Supported by: `SYN-CLASSROOM-01` (one first-year course, six weeks).
- Strength in evidence: "Students using structured AI prompts produced more outline revisions, while final rubric scores varied widely."
- The draft's wording matches the source: an observation in one course, with "more visible outline revisions" rather than a quantified improvement.
- Limits the source names itself: no comparison group, no validated measure of writing improvement, the instructor supplied every prompt.
- Net: the claim is supportable as a single-course observation, not as an effect. The draft already stays at the observation level, so this is consistent with the source.

### Claim 2 — "Interview summaries suggest that faster feedback may be offset by verification work"

- Supported by: `SYN-INTERVIEW-02` (five instructors at one institution).
- Strength in evidence: "Instructors reported faster formative feedback but additional time spent checking unsupported claims."
- The draft keeps this hedged ("may be offset"), which matches the self-report nature of the source.
- Limits the source names itself: self-reported workload, small convenience sample, no time logs.
- Net: the claim is supportable as a self-reported tradeoff. It cannot be quantified, and the draft does not quantify it.

### Claim 3 — "The stronger statement that generative AI reduces workload (`CLM-02`) is not supported by the supplied evidence"

- Source check: the supplied evidence does not support a net reduction. `SYN-INTERVIEW-02` describes a tradeoff (faster feedback + verification work) with no time log; no source reports a measured workload change.
- The draft itself flags this claim as not supported. The synthesis agrees: nothing in `sources.yaml` backs a workload-reduction statement, and a tradeoff interpretation is the most the evidence permits.
- Net: the draft's self-retraction is consistent with the supplied evidence. Treating `CLM-02` as retracted should be preserved.

## Other implications carried by the draft

The introduction frames two implicit claims that are not formalized as `CLM-*` claims:

- Universities are experimenting with generative AI in writing courses while negotiating expectations for feedback, authorship, and disclosure.
  - Supported by all four sources acting as a corpus: classroom observation, instructor interviews, student survey, and institutional policy all describe an in-progress negotiation.
  - Limits: each source is single-site or convenience-sampled; together they describe one synthetic evidence base, not a general pattern.
- Students experience uncertainty about permitted use and attribution.
  - Supported by `SYN-SURVEY-03`: "some reported uncertainty about permitted use and attribution."
  - Limits: voluntary response bias, attitudes rather than observed behavior, and the local policy changed during data collection, so the finding cannot be tied to a stable rule.
- Course-level disclosure rules are required, but acceptable assistance is left to instructors.
  - Supported by `SYN-POLICY-04`. This is a structural feature of one synthetic policy, not a measured outcome.
  - Limits: policy text does not show implementation quality, and the policy is not generalizable across institutions.

These three implications are supportable as descriptions of the supplied evidence set. The draft can mention them without overstating them.

## What the evidence cannot do

- Quantify any effect. No source reports a measured workload change, a measured writing-quality change, or a measured policy-compliance rate.
- Compare across institutions or populations. Each source is one course, one institution, one voluntary sample, or one synthetic policy.
- Speak to causality. There is no comparison group; alternative explanations (instructor prompting skill, course-level scaffolding, policy change during data collection) are not ruled out by the sources.

These limits are not gaps in the draft. They are properties of the evidence set, and the draft's "Missing sections" list (methods and evidence-selection limits, policy variation, alternative explanations, calibrated conclusion) is the right place to acknowledge them.

## Calibration for the next draft pass

- Keep `CLM-01` at observation level for one course.
- Keep the verification-vs-speed statement as a self-reported tradeoff.
- Leave `CLM-02` retracted.
- The introduction's framing is supportable; do not upgrade it to an effect claim.
- When the draft fills in "Methods and evidence-selection limitations" and "Discussion of policy variation", it should cite `SYN-*` IDs directly and carry forward the per-source limits above, rather than restating them as a generic caveat.

## Provenance of this synthesis

- Inputs: `benchmark/sources.yaml`, `benchmark/partial-manuscript.md`, `benchmark/goal.md`, `benchmark/README.md`.
- Task note: `work/researchspec-notes/writing-evidence.md`.
- Not a graph run; not a ResearchSpec procedure output. Ordinary continuation of the standalone task note.