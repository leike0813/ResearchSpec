# TEST FIXTURE: ordinary research task note

- Goal: Summarize how the supplied synthetic sources bear on the draft's claims about generative AI in university writing instruction.
- Inputs: `benchmark/sources.yaml` and `benchmark/partial-manuscript.md`.
- Output so far: `benchmark/partial-manuscript.md` contains the working draft; no completed synthesis has been delivered.
- Completed work: Read the draft and identified claims needing source support. No formal review or graph action occurred.
- Evidence limits: All sources are synthetic test material; no external publication has been verified.
- Open question: Which claims can be supported from the supplied source summaries?
- Next step: Check the draft claims against `benchmark/sources.yaml`, then write an ordinary synthesis file.
- Related run: none.

---

# Claim-by-claim check (continued)

Scope reminder: this is a fixture-only check. All `SYN-*` IDs are synthetic; no real
publication, effect size, or institution is implied. The draft refers to sources as
`CLM-01` and `CLM-02`; mapping to the YAML IDs is `CLM-01 → SYN-CLASSROOM-01`,
`CLM-02 → SYN-INTERVIEW-02` (the only classroom and interview summaries in the
supplied corpus). `SYN-SURVEY-03` and `SYN-POLICY-04` are present in the corpus
but never cited by the draft.

## Claim A — "Structured prompting coincided with more visible outline revisions in one introductory course (CLM-01)."

- Supported: yes, with qualifications.
- Evidence: `SYN-CLASSROOM-01` reports "more outline revisions" alongside
  structured prompting in one first-year writing course over six weeks.
- Source limits: no comparison group; no validated writing-improvement measure;
  the instructor supplied every prompt. The observation is co-occurrence in a
  single course, not an effect estimate.
- Draft wording matches the source when restated as observation; replacing
  "coincided with" by causal language would over-claim.

## Claim B — "Faster feedback may be offset by verification work."

- Supported: yes, with qualifications.
- Evidence: `SYN-INTERVIEW-02` reports instructors perceived faster formative
  feedback alongside additional time checking unsupported claims. The draft's
  hedge ("may be offset") matches the interview-summary finding.
- Source limits: self-reported workload, five-instructor convenience sample, no
  time logs. Net direction is plausible but not measured.

## Claim C — "The stronger statement that generative AI reduces workload (CLM-02) is not supported by the supplied evidence."

- Supported: yes — the corpus does not establish a net workload reduction.
- Evidence: `SYN-INTERVIEW-02` frames faster feedback against added verification
  time; it does not report a net decrease. No source gives a time-logged or
  controlled workload comparison.
- Implication: keep the workload-reduction claim out of any conclusion unless
  the user adds new evidence.

## Uncited sources — what the draft does not use

- `SYN-SURVEY-03`: student attitudes toward rapid feedback and uncertainty
  about permitted use and attribution. Relevant to a Discussion of student
  perspective and academic-integrity framing; absent from the current draft.
- `SYN-POLICY-04`: course-level disclosure rules with instructor-defined
  acceptable assistance. Relevant to the "Missing sections" item on policy
  variation; absent from the current draft.

## Items still flagged in the draft's "Missing sections"

- Methods and evidence-selection limitations — not yet written.
- Discussion of policy variation — only `SYN-POLICY-04` can support this; it is
  uncited.
- Explicit treatment of alternative explanations — not yet written; claims A and
  B both rest on small single-site samples.
- Conclusion calibrated to the supplied evidence — not yet written; current
  draft already marks the workload-reduction claim as unsupported, but no
  positive conclusion has been drafted.

## Limits that apply to every claim above

- All sources are synthetic test fixtures; none is a verified publication.
- Effect sizes, participant counts beyond those listed, ethics approval, and
  generalizability statements must not be added.
- Scope is one institution / one course / one survey frame; any institutional
  generalization would over-claim.

## Next step for the human

Decide whether to:

1. accept the draft's calibration (keep claims A and B as observations, drop the
   workload-reduction framing) and add a short Discussion paragraph drawing on
   `SYN-SURVEY-03` and `SYN-POLICY-04`; or
2. narrow scope further (e.g. treat the draft as a literature-framing note and
   add no claims) before any revision round.

No Gate or Decision is required for this synthesis; ordinary file work outside
`researchspec/` remains the right mode.