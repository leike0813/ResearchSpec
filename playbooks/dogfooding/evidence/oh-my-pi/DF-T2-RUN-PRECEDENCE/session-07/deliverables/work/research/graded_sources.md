# Graded Sources (graded-sources.v1)

**Node**: grading (research-main subgraph)
**Inputs**: `work/research/annotated_bibliography.md`
**Outputs**: this `graded_sources`
**Run**: run-2288fd2a43bd79f271923277

> **Fixture note.** Sources are synthetic (`SYN-*`). No real DOI, venue, author affiliation, or external index entry exists. Predatory-journal, COI, and reference-existence verification are therefore not applicable as live checks; this report records the substitute appraisal on evidence-hierarchy grounds and flags the verification limit.

## Source Verification Report

### Overall Assessment

**Sources Reviewed**: 4
**Verified**: 0 (no external index can verify synthetic IDs)
**Flagged**: 4 (all flagged with verification-limit, not fabrication)
**Rejected**: 0

The four supplied sources are not externally verifiable because they are synthetic fixtures. They are not "fabricated references" in the hallucinated-citation sense — the fixture explicitly declares them as test material — but they are unusable as evidence for any real-world claim about generative AI in writing instruction. The grading below applies the seven-level evidence hierarchy *to the kind of evidence each summary represents*, not to publication status.

### Source Quality Matrix

| Source | Level (form of evidence) | Venue | Author | Method | Currency | COI | Overall |
|---|---|---|---|---|---|---|---|
| SYN-CLASSROOM-01 | VI (single descriptive study summary, no comparison) | n/a (synthetic) | n/a (synthetic) | warn — no comparison, no validated measure, instructor supplied prompts | n/a (synthetic) | warn — single-instructor design | **Grade C — process signal only** |
| SYN-INTERVIEW-02 | VI (qualitative summary, convenience sample) | n/a (synthetic) | n/a (synthetic) | warn — self-report, N=5, no time logs | n/a (synthetic) | warn — single-institution | **Grade C — directional pattern only** |
| SYN-SURVEY-03 | VI (single descriptive survey summary, voluntary response) | n/a (synthetic) | n/a (synthetic) | warn — voluntary bias, attitudes not behavior, policy changed mid-study | n/a (synthetic) | warn — policy shift confounds | **Grade C — perception signal only** |
| SYN-POLICY-04 | VII (policy text as expert/committee output) | n/a (synthetic) | n/a (synthetic) | warn — text without implementation evidence; not generalizable | n/a (synthetic) | warn — single institution | **Grade C — policy floor only** |

### Flagged Sources (Detail)

#### SYN-CLASSROOM-01
- **Issue**: Single classroom, six-week observation, no comparison group, no validated writing-improvement measure; instructor supplied all prompts.
- **Severity**: Medium (limits generalizability; the design cannot address the question of *whether* AI caused the changes).
- **Recommendation**: Include with caveat — use only as a process-level signal that structured prompting coincided with more visible outline revisions.
- **Evidence**: Limitations listed in `benchmark/sources.yaml`.

#### SYN-INTERVIEW-02
- **Issue**: Self-reported workload; small convenience sample (N=5); no time logs.
- **Severity**: Medium (directionality is plausible, magnitude is not measurable).
- **Recommendation**: Include with caveat — use as a directional trade-off claim, not a quantitative workload claim.
- **Evidence**: Limitations listed in `benchmark/sources.yaml`.

#### SYN-SURVEY-03
- **Issue**: Voluntary response bias; attitudes not observed behavior; policy changed during data collection.
- **Severity**: Medium-High (perception ≠ compliance; policy shift confounds attribution).
- **Recommendation**: Include with caveat — use as a perception-level signal about disclosure/attribution uncertainty only.
- **Evidence**: Limitations listed in `benchmark/sources.yaml`.

#### SYN-POLICY-04
- **Issue**: Policy text without implementation evidence; not generalizable.
- **Severity**: Low-Medium (text itself is unambiguous about what it says; the implementation gap is the real risk).
- **Recommendation**: Include with caveat — record what the policy says; do not claim enforcement or effect.
- **Evidence**: Limitations listed in `benchmark/sources.yaml`.

### Predatory Journal Alerts

None. No real journals involved (synthetic fixtures). `[S2-API-UNAVAILABLE]` and `[DOI-NOT-APPLICABLE]` recorded for completeness — these sources have no DOI to verify.

### Conflict of Interest Disclosures

- **SYN-CLASSROOM-01**: Instructor supplied all prompts (institutional/instructional COI: prompt choice is not independent of the hypothesized outcome).
- **SYN-INTERVIEW-02**: Single-institution sample (potential institutional COI for institution-level claims).
- **SYN-SURVEY-03**: Policy changed during data collection (temporal COI — policy shift may have shifted responses).
- **SYN-POLICY-04**: Single-institution policy (no cross-institutional benchmark; potential institutional COI if interpreted as representative).

### Verification Limitations

- **Reference existence verification:** Not applicable. None of the four sources has a DOI, an external title, or an author byline; they are synthetic IDs. The standard DOI / Semantic Scholar / WebSearch tiers cannot resolve them, and that is consistent with the fixture goal — these sources are not real publications.
- **Currency assessment:** Not applicable. Synthetic fixtures do not have publication dates in the real sense.
- **Cross-reference of factual claims:** Not applicable. The fixture does not contain external claims to cross-reference; all claims live within the supplied summaries.
- **Predatory-journal assessment:** Not applicable. No real journal venues.
- **Author credibility:** Not applicable. No real authors.

### Quality grading summary

- All four sources are evidence-level VI–VII *as forms of evidence*. None of them individually supports the strong claims sometimes associated with AI-in-education discourse (workload reduction, learning gain, integrity improvement).
- The strongest claims supportable by the corpus are directional and bounded: "structured prompting may increase visible outline revisions"; "instructors report faster formative feedback that may be partly offset by verification work"; "students value rapid feedback and need clearer disclosure guidance"; "policy requires disclosure and delegates acceptable assistance to instructors."
- No source supports a quantitative effect-size, a causal generalization, or a cross-institutional inference.

## Rules followed

- Each source received an evidence-level grade on the seven-level scale.
- All known concerns are flagged with severity and evidence.
- No source is silently excluded.
- No synthesis or report drafting performed in this node.
- Verification limits are recorded rather than guessed around.
