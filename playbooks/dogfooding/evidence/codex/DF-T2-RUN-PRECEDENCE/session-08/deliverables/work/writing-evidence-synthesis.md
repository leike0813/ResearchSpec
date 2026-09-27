# Evidence synthesis: draft claims vs. supplied sources

> TEST FIXTURE — synthesizes `benchmark/partial-manuscript.md` against
> `benchmark/sources.yaml`. All sources are synthetic and intentionally
> scoped; no external literature was searched.

## Scope reminder

- Draft claims reviewed: the two numbered claims in the preliminary
  findings section (`CLM-01`, `CLM-02`) plus the surrounding narrative
  sentences in the introduction.
- Source set: four synthetic summaries (one classroom observation,
  one instructor interview, one student survey, one policy excerpt).
- Strength rubric used here: **supported** (source directly describes
  the claim and the source's limits do not contradict it), **partial**
  (source speaks to a related phenomenon but does not cover the full
  claim), **unsupported** (no source covers the claim; do not assert).

## Claim-by-claim cross-reference

### CLM-01 — Structured prompting coincided with more visible outline revisions in one introductory course

- **Verdict:** partial.
- **Source:** `SYN-CLASSROOM-01`.
- **Match:** source reports that students using structured AI prompts
  produced more outline revisions.
- **Mismatch / gap:** source also states final rubric scores "varied
  widely"; the draft does not acknowledge this variability. Source has
  no comparison group and no validated improvement measure, so the
  draft's framing should remain correlational and course-specific.
- **Recommended draft wording:** keep the claim; add that rubric scores
  varied widely and that the observation lacks a comparison group.

### CLM-02 — Generative AI reduces instructor workload

- **Verdict:** unsupported.
- **Source:** none.
- **Relevant adjacent source:** `SYN-INTERVIEW-02` reports the opposite
  pattern — instructors described faster formative feedback but
  *additional* time spent checking unsupported claims. The source is
  self-reported, with no time logs, so it cannot ground a causal claim
  either way, but it clearly does not support "reduces workload."
- **Recommended draft wording:** drop the claim, or reframe as an
  open question: net workload change is unknown from the supplied
  evidence and may involve a substitution between feedback time and
  verification time.

### Narrative claim — Universities are experimenting with generative AI in writing courses

- **Verdict:** partial.
- **Sources:** `SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`,
  `SYN-SURVEY-03`, `SYN-POLICY-04` together describe activity in one
  synthetic institution. The claim is descriptive of a single site and
  should not be generalized.

## Additional evidence the draft does not yet use

- **Student uncertainty about permitted use and attribution**
  (`SYN-SURVEY-03`). Limitation: voluntary response bias; attitudes
  rather than observed behaviour; local policy changed during data
  collection. Useful for a "policy and disclosure" subsection — the
  draft currently lists this as a missing section.
- **Policy variation is delegated to course-level discretion**
  (`SYN-POLICY-04`). Course-level disclosure is required; acceptable
  assistance is left to instructors. Limitation: policy text does not
  show implementation quality and is not generalizable. Useful for the
  same policy subsection.
- **Verification overhead as a counter-pressure on feedback speed**
  (`SYN-INTERVIEW-02`). Self-reported; no time logs. Useful as an
  alternative explanation in the discussion.

## What the supplied evidence does not support

- Any causal claim about writing improvement (no validated measure).
- Any claim about general workload reduction (no time logs; instructors
  report offsetting verification work).
- Cross-institutional generalization (all sources come from a single
  synthetic institution).
- Anything about long-term effects on writing skill or academic
  integrity outcomes.

## Recommended next draft moves

1. Keep `CLM-01` but qualify it with the rubric-score variability and
   the absence of a comparison group.
2. Replace `CLM-02` with the verification-tradeoff framing drawn from
   `SYN-INTERVIEW-02`, marked as self-reported.
3. Add a short policy-and-disclosure subsection using
   `SYN-SURVEY-03` and `SYN-POLICY-04`, with explicit limits.
4. State in the conclusion that the supplied evidence supports design
   hypotheses and scope conditions, not general causal effects.

## Open questions

- Whether the draft's intended venue requires a stronger evidence base
  than these four synthetic summaries can provide.
- Whether the user wants to add a "limits of the synthetic corpus"
  paragraph before circulating the draft further.
