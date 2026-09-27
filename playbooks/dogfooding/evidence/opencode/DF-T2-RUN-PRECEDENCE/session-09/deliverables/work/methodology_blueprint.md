## Methodology Blueprint

### Research Paradigm

**Selected:** Interpretivist with pragmatist overlay
**Justification:** The RQ asks how observable claims about generative AI in
university writing instruction map onto a small synthetic evidence base
("which observable claims... are supported, qualified, or contradicted, and
what design constraints does the evidence impose on any downstream
generalisation?"). The mapping is interpretive because classification
(supported / qualified / contradicted / unsupported) is a judgement call
that must be reasoned from the source summaries rather than measured from
instrumented outcomes, and pragmatist because the deliverable is intended
to inform downstream instructors and program designers rather than to
extend a foundational theory. The RQ is descriptive-leaning evaluative;
the paradigm must support explanation of meaning and pattern in
qualitative summaries, which fit interpretivism, while keeping the work
applied enough to surface design constraints, which fits pragmatism.

### Method

**Type:** Qualitative
**Specific Method:** Structured claim-level evidence mapping over a
bounded synthetic source set, executed as a document-and-summary review
with an evidence-classification rubric (supported / qualified /
contradicted / unsupported) and a per-claim annotation of the limitation
that drives the classification.

**Justification:** The RQ does not invite causal inference (no comparison
group is named) and does not require primary data collection (the source
summaries are pre-existing supplied evidence). A qualitative structured
mapping lets the synthesizer trace each partial-manuscript claim back to
the supplied summaries, record the evidence pattern observed, and attach
the limitation that sets the classification strength. Quantitative or
mixed methods would either over-claim (promising effect sizes the sources
do not produce) or duplicate effort (the four-source cap precludes
meaningful statistical analysis).

### Data Strategy

**Data Type:** Secondary qualitative summaries and one partial drafting
artifact.

**Sources:**

- `SYN-CLASSROOM-01` — classroom observation summary (six-week
  first-year writing course).
- `SYN-INTERVIEW-02` — instructor interview summary (five instructors,
  one institution).
- `SYN-SURVEY-03` — student survey summary (84 voluntary responses).
- `SYN-POLICY-04` — institutional policy excerpt (one synthetic
  university).
- `benchmark/partial-manuscript.md` — the working draft whose claims are
  the target of the mapping.

**Sampling:** Entire population, not a sample. The four supplied `SYN-*`
summaries are the closed evidence universe for this exercise; the partial
manuscript is the closed set of working claims. No source outside
`benchmark/` enters the mapping.

**Time Frame:** The summaries describe observation windows referenced
inside the source narratives (six-week classroom observation, an
unspecified interview window, a survey with a mid-collection policy
change). The mapping does not impose an external timeframe and does not
collapse these windows into a single period.

### Analytical Framework

**Technique:** Inductive thematic coding of claim-evidence pairs, with a
priori classification rubric.

**Steps:**

1. Extract the draft claims from `benchmark/partial-manuscript.md` and
   the candidate claims implied by the RQ sub-questions into a working
   claim list.
2. For each claim, search the four supplied summaries for direct support,
   partial support, contradiction, or silence.
3. Assign a classification:
   - *supported* — at least one source describes the observation and
     none contradict the strength of the claim.
   - *qualified* — at least one source supports the observation but the
     claim's strength exceeds what the source allows, or the source
     carries a limit that changes interpretation.
   - *contradicted* — at least one source directly disagrees with the
     claim.
   - *unsupported* — no source in the closed evidence universe addresses
     the claim.
4. For each classification, record the driving limitation (e.g., no
   comparison group, voluntary response, single-institution interview,
   implementation-text-only policy excerpt).
5. Group the resulting claim-evidence pairs by theme (writing process,
   feedback verification overhead, reported workload, academic-integrity
   friction) to expose patterns across the four sources.

**Tools:** Manual claim-evidence table maintained in
`work/synthesis_report.md`. No external analytical software.

### Validity Criteria

| Criterion | Strategy to Ensure |
|---|---|
| Credibility | Each claim-evidence pair is anchored to the exact source summary by `source_id`; each classification carries the driving limitation inline, so a reader can re-derive the verdict. |
| Transferability | The mapping is bounded by the four-supply universe; the writeup states the boundary explicitly and refrains from transfer claims the sources do not support. |
| Dependability | Procedure and classification rubric are recorded in this blueprint and reproduced in the synthesis report so a second reader can repeat the mapping. |
| Confirmability | Inferences are flagged explicitly as inferences and the supporting observation is named; unknowns are tagged rather than smoothed over. |

### Limitations (By Design)

- Closed evidence base: only the four supplied `SYN-*` summaries enter
  the mapping; any claim the partial manuscript makes that requires
  external literature is recorded as unsupported, not back-filled.
- Synthetic material: summaries are test fixtures, so the mapping can
  demonstrate the method but cannot be deployed as a claim about any
  real institution.
- No primary data: no interviews, surveys, or instruments are designed
  or run inside this exercise, so claims that would need such data are
  recorded as design-constraint gaps.
- Single pass: the mapping is performed once; inter-rater agreement and
  adjudication across multiple mappers are out of scope.

### Ethical Considerations

- This exercise operates on synthetic dogfooding material
  (`benchmark/sources.yaml`, `benchmark/partial-manuscript.md`,
  `benchmark/goal.md`). No real participants are recruited, no
  identifiable data is collected, no intervention is performed.
- The syntheses explicitly avoid promoting any `SYN-*` source ID to a
  real citation, refuse to fabricate participant counts, demographics,
  ethics approvals, or effect sizes, and surface gaps rather than
  paper over them.
- No external lookup, real publication, or DOI is introduced by this
  blueprint or any node downstream of it.

### Human-Subjects Administrative Status

- candidate-pathway facts and unresolved applicability questions:
  No real human subjects are involved; this blueprint does not initiate
  any IRB / ethics-review submission. If the method were later
  generalised beyond the synthetic fixture, an institutional pathway
  would need to be opened against the then-applicable requirements;
  that pathway is not in scope here and is therefore not determined.
- candidate rule trace: unavailable (no institution- or
  jurisdiction-bound authority context is attached to this run)
- review pathway: institutional determination required
- submission readiness: no_listed_gaps_located (within this fixture's
  closed synthetic evidence base)
- authorization status: not_provided (no authorization is sought in
  this exercise)
- authority context: unavailable
- profile_dependent_result_allowed: false
- applicable requirement IDs, obligated actors, consumer scopes, and
  exact pointers: unavailable
- informed consent planning: not applicable to the synthetic fixture;
  would require actor/scope-matched actions if generalised
- data de-identification, retention, and destruction: not applicable;
  the four sources are already non-identifying summaries and reside in
  the project benchmark directory
- review timeline: unknown — obtain current institutional estimate (only
  relevant if the method is generalised past the fixture)

> **Human-subjects boundary:** This output does not authorize
> recruitment, consent, access to identifiable data, intervention, or
> data collection, and it does not represent an institutional ethics
> determination.

### Reporting Standard

- Standards for Reporting Qualitative Research (SRQR) as the closest
  match for a qualitative secondary-document review with structured
  classification. Specific sections will be borrowed selectively when
  the deliverable length does not warrant a full SRQR form.

### Preregistration

- recommendation: not_required
- rationale: This is exploratory qualitative mapping of an already
  collected synthetic evidence base, not confirmatory research, an RCT,
  a systematic review, or a multi-comparison analysis.
- platform: n/a
- status: would be filed only if the work is converted into a confirmatory
  secondary analysis in a future project.
- completed artifact declaration: not_provided (no preregistration
  artifact is claimed by this procedure)
- companion handle: none
- sidecar ownership: dispatching layer only; do not populate a digest
  here
