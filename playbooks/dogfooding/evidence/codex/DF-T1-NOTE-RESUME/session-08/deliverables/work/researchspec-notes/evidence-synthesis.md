# Evidence synthesis: generative AI in university writing instruction

Scope: cross-check every substantive claim in `benchmark/partial-manuscript.md`
against the four synthetic sources in `benchmark/sources.yaml`. This file is the
ordinary synthesis the prior task note asked for; no graph run is opened.

All source IDs are synthetic test fixtures (`SYN-*`) from the local benchmark
package. They are not real publications, and no external lookup is performed.

## Claim-by-claim check

### Claim A — Structured prompting coincided with more visible outline revisions in one introductory course
Draft citation: `CLM-01`.

- Closest source: `SYN-CLASSROOM-01` (one first-year writing course, six weeks).
  Finding: "Students using structured AI prompts produced more outline revisions."
- Verdict: **supported in direction, not in magnitude.**
  - The source supports "more outline revisions" under structured prompting.
  - The draft adds the word "visible", which is the author's interpretation of
    what the source describes as a count of revisions. Treat as paraphrase,
    not literal restatement.
- Source-borne limits to record in the manuscript:
  - No comparison group.
  - No validated measure of writing improvement.
  - Instructor supplied all prompts (no prompt-design variation across
    instructors or students).

### Claim B — Faster feedback may be offset by verification work
Draft citation: implicit (no ID attached).

- Closest source: `SYN-INTERVIEW-02` (five instructors at one institution).
  Finding: "Instructors reported faster formative feedback but additional time
  spent checking unsupported claims."
- Verdict: **supported as a hypothesis, not as a measured effect.**
  - The hedging in the draft ("may be offset") matches the source's
    self-reported, qualitative nature.
- Source-borne limits to record:
  - Self-reported workload.
  - Small convenience sample (n = 5, single institution).
  - No time logs, so any quantitative "offset" claim would overreach the source.

### Claim C — "Generative AI reduces workload" is not supported by the supplied evidence
Draft citation: `CLM-02` (used here as a rejected claim label, not a source ID).

- Sources checked: `SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`,
  `SYN-POLICY-04`.
- Verdict: **rejection is correct.**
  - `SYN-INTERVIEW-02` explicitly frames faster feedback as paired with extra
    verification work, not net reduction.
  - `SYN-CLASSROOM-01` does not measure workload at all.
  - `SYN-SURVEY-03` measures student attitudes, not instructor workload.
  - `SYN-POLICY-04` is a policy text, not an outcome study.
- The draft's explicit downgrading of this claim is the right call and should
  be preserved in the final manuscript.

## Sources not yet used by the draft

- `SYN-SURVEY-03` (84 voluntary student responses). The draft does not cite
  student attitudes at all. Relevant evidence available: respondents valued
  rapid feedback; some reported uncertainty about permitted use and
  attribution. Limits: voluntary response bias, attitudes not behavior, local
  policy changed during data collection. This source can support a
  "student-perception" sub-paragraph in the Discussion once the manuscript
  scope explicitly allows attitudes.
- `SYN-POLICY-04` (institutional policy excerpt). The draft's introduction
  mentions disclosure and authorship negotiation. The source supports the
  disclosure dimension ("course-level disclosure rules are required") and
  notes that acceptable assistance is left to instructors. Limits: policy
  text only, no implementation evidence, not generalizable. Useful for a
  short "policy variation" note in the Discussion.

## Citation key issue in the current draft

The draft cites `CLM-01` and `CLM-02`, but the benchmark sources are keyed
`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`. The
draft is treating `CLM-02` as a *claim* label rather than a source label,
which is fine internally, but the inconsistency should be resolved before
sharing the manuscript outside the benchmark package. Suggested fix: keep
`SYN-CLASSROOM-01` as the source key for the classroom finding, and either
remove the `CLM-02` parenthetical or re-label it as `[rejected claim]`.

## Calibration guidance for the next manuscript revision

- Hold the line on causal language. None of the four sources supports a
  causal claim about AI's effect on writing quality or workload.
- Carry the source-borne limits into the manuscript itself, not only into
  this synthesis. The current draft mentions limits only implicitly; the
  "Missing sections" list already calls for an evidence-selection limitations
  section.
- If the Discussion is expanded, attribute the workload trade-off to
  `SYN-INTERVIEW-02` and the disclosure norm to `SYN-POLICY-04` rather than
  presenting them as common knowledge.
- Do not import effect sizes, participant counts beyond what the sources
  state, or institutional names. The benchmark is explicit that these
  materials are not to be supplemented with external lookup.

## What this synthesis does not do

- It does not open a run, gate, or decision. The work is ordinary file-level
  verification, which the prior task note scoped as standalone.
- It does not edit `benchmark/partial-manuscript.md`. Editing the manuscript
  is the next phase and was not in the prior task's "next step" line.
- It does not touch `researchspec/specs/claims.yaml`. The current stable
  claim registry is empty and the prior note did not request populating it.
