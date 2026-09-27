claim_intent_manifests:
  - manifest_id: CIM-SYN-001
    node: synthesis
    intended_claims:
      - "Across the supplied synthetic evidence set, the partial manuscript's CLM-01 (more visible outline revisions under structured AI prompting in one introductory course) is supported as a descriptive observation bounded by the absence of a comparison group."
      - "Across the supplied synthetic evidence set, the partial manuscript's CLM-02 (unqualified 'generative AI reduces instructor workload') is contradicted by the verification-overhead offset that the same instructor-side signal reports."
      - "Across the supplied synthetic evidence set, the disclosure-required / acceptable-assistance-delegated policy structure interacts with student-reported uncertainty and instructor-reported verification overhead to surface an integrity-friction pattern that none of the four sources individually establishes."
      - "Across the supplied synthetic evidence set, the closed evidence universe cannot yield effect sizes, causal-inference claims, or cross-institutional generalisations; claims that would require any of those are recorded as unsupported gaps."
    author_declared_must_not:
      - "Promote any SYN-* source ID to a real citation in any downstream research product."
      - "Fabricate participant counts, demographics, ethics approvals, transcript material, or effect sizes beyond what the supplied summaries already state."
      - "Treat the synthesis as supporting any causal-inference claim about generative AI in university writing instruction."
    emission_status: draft
---

## Synthesis Report

### Literature Matrix

| Source | Theme: Writing-Process Pattern | Theme: Feedback Verification Overhead | Theme: Self-Reported Instructor Workload | Theme: Academic-Integrity Friction | Method | Quality |
|---|---|---|---|---|---|---|
| `SYN-CLASSROOM-01` | Supports (descriptive) | -- | -- | -- | Classroom observation summary, single course, six-week window | Level VI, Fixture |
| `SYN-INTERVIEW-02` | -- | Supports (perception) | Supports (perception, conditional) | -- | Interview-summary synthesis, five instructors, one institution, self-reported | Level VI, Fixture |
| `SYN-SURVEY-03` | -- | -- | -- | Supports (perception) | Survey summary, 84 voluntary responses, attitudes not behaviour | Level VI, Fixture |
| `SYN-POLICY-04` | -- | -- | -- | Supports (structural) | Institutional policy excerpt, text-only | Level VI, Fixture |

### Key Themes

#### Theme 1: Writing-Process Pattern under Structured AI Prompting

**Evidence Strength:** Moderate (one source, Level VI, no comparison group)

**Sources:** `SYN-CLASSROOM-01`. Single-source bound.

**Synthesis:** The classification rubric recorded in
`work/methodology_blueprint.md` placed this claim as `supported` with
qualifications. Inside the closed synthetic evidence universe, the only
observation of student writing-process behaviour describes more visible
outline revisions under structured AI prompting over a six-week window
in one first-year writing course; rubric scores varied widely during
the same window. The pattern is descriptive, bounded to a single
classroom without a comparison group, with no validated writing-
improvement measure and with instructor-supplied prompts. Because no
other supplied source addresses the same theme, the cross-source
convergence test the rubric expects ("3+ sources agree") cannot be met
for this theme; the claim stands on a single-source support and is
flagged as descriptive rather than comparative or causal. The
partial-manuscript `CLM-01` matches this support profile.

#### Theme 2: Feedback Verification Overhead as a Workload Mediator

**Evidence Strength:** Emerging (one source, Level VI, perception-level)

**Sources:** `SYN-INTERVIEW-02`. Single-source bound.

**Synthesis:** The instructor-side perception the source describes is
not "AI reduces workload" in any aggregate sense; it is the co-presence
of perceived faster formative feedback and additional time spent
checking unsupported claims. The two perceptions are not summed or net
out inside the source. Any claim that aggregates them into a single
"workload" direction contradicts what the source states; any claim that
treats the perceived net direction as measured contradicts the absence
of time-on-task data. The partial-manuscript `CLM-02` ("generative AI
reduces workload") sits in this contradiction zone and was correctly
rejected in `benchmark/partial-manuscript.md`. The pattern itself is
real for the interpretation of the source summary but is bounded to a
small convenience sample of five instructors at one institution and
self-reported rather than instrumented.

#### Theme 3: Disclosure-First Policy Structure and Instructor-Level Acceptable-Assistance Definitions

**Evidence Strength:** Moderate (one source directly plus one
inferential source, both Level VI)

**Sources:** `SYN-POLICY-04` (direct), `SYN-INTERVIEW-02` (inferential
on acceptability).

**Synthesis:** The policy excerpt establishes that disclosure is
required at the course level while acceptable assistance is left to
instructors. Combined with the verification-overhead perception in
Theme 2, this delegation pattern produces a structural friction
surface that the partial manuscript does not currently name. The
delegation does not by itself produce inconsistent student experience;
the partial-manuscript gap list (policy variation discussion) makes this
the right place to add a one-paragraph framing in the discussion rather
than a new empirical claim. The policy excerpt is text-only and cannot
attest to implementation quality, so the structural reading is bounded.

#### Theme 4: Student-Perceived Uncertainty About Permitted Use and Attribution

**Evidence Strength:** Moderate (one source, Level VI, perception not
behaviour)

**Sources:** `SYN-SURVEY-03`.

**Synthesis:** The student-side attitude pattern bridges the policy
side and the instructor side: respondents valued rapid feedback (the
upside that motivates the policy to permit disclosure) while reporting
uncertainty about permitted use and attribution (the cost of the
delegation pattern in Theme 3). Because the survey is voluntary and
attitude-based rather than behaviour-based, the pattern is descriptive
and cannot be promoted to a behavioural conclusion. The policy
excerpt's reference to course-level disclosure rules is unchanged by
this finding, but the partial-manuscript gap list (alternative
explanations) is the right place to acknowledge that attitude and
behaviour could diverge once observation-based evidence is gathered.

#### Theme 5: Cross-Theme Structural Pattern — Disclosure, Verification, and Uncertainty Co-occur

**Evidence Strength:** Moderate (four sources, three themes, conditional
synthesis)

**Sources:** `SYN-POLICY-04`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`.

**Synthesis:** The three sources above describe pieces of the same
social pattern: disclosure required up front, verification work
performed by instructors, uncertainty carried by students. The pattern
is not a causal claim about generative AI in writing classrooms; it
is a conditional observation that the three themes are mutually
consistent within the closed synthetic evidence universe. The pattern
remains conditional because each underlying source is bounded by its
own limit (small sample, voluntary response, single institution,
text-only policy). Promoting the pattern to a general claim about AI
in writing instruction would invert the strength of each source.

### Contradictions & Resolutions

| Claim A | Claim B | Resolution |
|---|---|---|
| `SYN-INTERVIEW-02`: instructors reported *faster* formative feedback. | `SYN-INTERVIEW-02`: instructors spent *additional* time checking unsupported claims. | Reconciled inside the source. Both perceptions co-exist in the same summary; an aggregate "AI reduces workload" claim contradicts the source by collapsing two co-reported perceptions into one. The partial-manuscript `CLM-02` rejection in `benchmark/partial-manuscript.md` is consistent with this resolution. |
| `SYN-POLICY-04`: course-level disclosure is required. | `SYN-SURVEY-03`: students reported uncertainty about permitted use and attribution. | Conditional difference, not contradiction. Disclosure of AI use does not entail disclosure of which AI-assisted actions are acceptable; the policy excerpt explicitly delegates acceptable-assistance definitions to instructors, which is consistent with student-level uncertainty about what is permitted. The pattern is structural, not adversarial. |
| `SYN-CLASSROOM-01`: more visible outline revisions under structured AI prompting. | `SYN-CLASSROOM-01`: final rubric scores varied widely. | Conditional difference, not contradiction. The pattern in outline revisions does not entail pattern in rubric outcomes within this source; treating one as evidence for the other would over-extend a single six-week, single-course observation. The partial-manuscript `CLM-01` correctly claims only the outline-revision pattern, not the rubric outcome. |

#### Cross-Paper Tension Inventory

```yaml
cross_paper_tensions:
  - pair_id: CP-001
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-INTERVIEW-02
    candidate_basis: shared RQ subtopic (writing-instruction consequences of generative AI)
    overlap_topic: how AI assistance shows up inside the writing classroom versus inside instructor workflow
    a_finding: "Students using structured AI prompts produced more outline revisions"
    a_evidence_pointer: "benchmark/sources.yaml#SYN-CLASSROOM-01.finding"
    b_finding: "Instructors reported faster formative feedback but additional time spent checking unsupported claims"
    b_evidence_pointer: "benchmark/sources.yaml#SYN-INTERVIEW-02.finding"
    pair_assessment: no_material_conflict
    resolution_status: not_applicable
    resolution_pointer:
    scholar_confirmation: pending
  - pair_id: CP-002
    paper_a: SYN-INTERVIEW-02
    paper_b: SYN-SURVEY-03
    candidate_basis: shared construct (perception of feedback / acceptability)
    overlap_topic: instructor- and student-side perceptions of permitted AI-assisted work
    a_finding: "Instructors reported additional time spent checking unsupported claims"
    a_evidence_pointer: "benchmark/sources.yaml#SYN-INTERVIEW-02.finding"
    b_finding: "Some respondents reported uncertainty about permitted use and attribution"
    b_evidence_pointer: "benchmark/sources.yaml#SYN-SURVEY-03.finding"
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: "Synthesis Report > Contradictions & Resolutions row 2"
    scholar_confirmation: pending
  - pair_id: CP-003
    paper_a: SYN-POLICY-04
    paper_b: SYN-SURVEY-03
    candidate_basis: shared construct (disclosure regime)
    overlap_topic: course-level disclosure requirement versus student-perceived permitted-use uncertainty
    a_finding: "Course-level disclosure rules are required, but acceptable assistance is left to instructors"
    a_evidence_pointer: "benchmark/sources.yaml#SYN-POLICY-04.finding"
    b_finding: "Some respondents reported uncertainty about permitted use and attribution"
    b_evidence_pointer: "benchmark/sources.yaml#SYN-SURVEY-03.finding"
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: "Synthesis Report > Contradictions & Resolutions row 2"
    scholar_confirmation: pending
  - pair_id: CP-004
    paper_a: SYN-INTERVIEW-02
    paper_b: SYN-POLICY-04
    candidate_basis: shared construct (acceptable-assistance boundaries)
    overlap_topic: who defines what is acceptable assistance and at what cost
    a_finding: "Instructors reported additional time spent checking unsupported claims"
    a_evidence_pointer: "benchmark/sources.yaml#SYN-INTERVIEW-02.finding"
    b_finding: "Acceptable assistance is left to instructors"
    b_evidence_pointer: "benchmark/sources.yaml#SYN-POLICY-04.finding"
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: "Synthesis Report > Contradictions & Resolutions row 2"
    scholar_confirmation: pending
  - pair_id: CP-005
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-SURVEY-03
    candidate_basis: agent-noted cross-cluster
    overlap_topic: how visible the AI-assisted process is from a student angle
    a_finding: "Students using structured AI prompts produced more outline revisions"
    a_evidence_pointer: "benchmark/sources.yaml#SYN-CLASSROOM-01.finding"
    b_finding: "Respondents valued rapid feedback; some reported uncertainty about permitted use and attribution"
    b_evidence_pointer: "benchmark/sources.yaml#SYN-SURVEY-03.finding"
    pair_assessment: no_material_conflict
    resolution_status: not_applicable
    resolution_pointer:
    scholar_confirmation: pending
```

**Coverage Note:** 4 papers in corpus; 5 candidate pairs considered. This
is a scoped advisory scan, not complete pairwise contradiction
detection. Bibliographic coupling was used as an inclusion signal only
where it would expand the candidate set; in this corpus, candidate
edges were generated from shared RQ subtopic, shared
construct/outcome, and agent-noted cross-cluster, never from
bibliographic coupling (no bibliographic metadata exists for the four
fixtures). Cross-neighborhood pairs could have been missed; the
inventory never claims completeness. The scholar confirms each
`resolution_pointer` and may flag additional cross-pairs during
downstream review.

### Knowledge Gaps

1. **Empirical gap (population):** No multisite evidence exists in the
   supplied corpus. The four-source evidence universe describes one
   synthetic institution or sub-units of it. Cross-institutional
   generalisation is unsupported.
2. **Empirical gap (longitudinal):** Each supplied source describes
   observation windows inside its own narrative (six-week classroom
   observation; an unspecified interview window; a survey window during
   which local policy changed). A multi-cohort trajectory of either the
   outline-revision pattern or the verification-overhead perception is
   not addressable from this corpus.
3. **Methodological gap:** No comparison-group design, no validated
   writing-improvement measure, no time-on-task instrument, and no
   behavioural-observation instrument appear in the supplied corpus.
   Triangulation across these measurement modes is unsupported.
4. **Theoretical gap:** No theoretical framework in the supplied corpus
   explains why disclosure-required / acceptability-delegated policy
   structures co-occur with the perception-level uncertainty reported
   by students and the verification-overhead perception reported by
   instructors. Theory development (e.g., a delegated-acceptability
   explanation) is needed before the cross-theme pattern in Theme 5
   can be promoted to an explanation rather than a description.
5. **Currency gap (relative to field velocity):** Generative-AI
   applications in writing instruction move quickly. The supplied
   sources describe observation windows that pre-date current
   tools and policies. The closest the corpus comes to currency
   treatment is the student-survey note that local policy changed
   during data collection; even that is captured only as an inline
   limitation, not as a comparison across policy versions.
6. **Geographic / institutional gap:** No information in the supplied
   sources identifies the institution or its policy regime in a way
   that supports transfer to other institutional settings.

### Evidence Convergence Map

| Strength | Theme | Sources | Levels |
|---|---|---|---|
| Strong (3+ sources) | none | — | — |
| Moderate (2 sources) | Disclosure / verification / uncertainty co-occurrence | `SYN-POLICY-04`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03` | All Level VI |
| Emerging (1 source, qualified) | Writing-process pattern under structured AI prompting | `SYN-CLASSROOM-01` | Level VI |
| Gap | Multisite evidence | none | — |
| Gap | Time-on-task measurement of instructor workload | none | — |
| Gap | Behavioural observation of student AI use | none | — |
| Gap | Causal-effect evidence | none | — |
| Gap | Implementation quality of disclosure policies | none | — |

The "Strong (3+ sources)" tier is empty by design; the closed synthetic
universe only carries four sources, so cross-source convergence peaks at
the same number of sources that agree about the cross-theme structural
pattern in Theme 5. Promoting any single theme or the structural
pattern to the "Strong" tier would require evidence outside this
universe, which is forbidden by the methodology.

### Theoretical Integration

The interpretive paradigm selected in `work/methodology_blueprint.md`
frames these syntheses as meaning-making inside a closed evidence
universe, not as causal claims about generative AI in writing
instruction. The partial-manuscript working title — "Opportunities,
Friction, and Evidence Limits" — matches this framing: the
opportunity-side observation (`CLM-01`) and the friction-side
observation (verification overhead plus student-perceived uncertainty)
sit together with explicit evidence-limit framing rather than as
competing claims. The synthesis therefore organises the four sources by
opportunity, friction, and limit, and resists any move from
opportunity-and-friction description to cause-and-effect explanation.

### Citation Anchors

All visible citations point to `benchmark/sources.yaml` as
`source_pointer` for each `source_id`. No precise locator is
manufactured beyond that pointer because no underlying real
publication exists. Downstream nodes that consume this synthesis report
must mirror the synthetic-fixture disclaimer and must not promote any
`SYN-*` identifier to a real citation.

### Synthesis Limitations

- The evidence universe is closed at four synthetic summaries; no
  external database or real publication enters this synthesis.
- Each supplied source is qualitative and bounded by the limits stated
  inline in `benchmark/sources.yaml`; no quantitative triangulation is
  available.
- The cross-paper tension inventory is a scoped advisory scan, not
  complete pairwise contradiction detection.
- Knowledge gaps are surfaced rather than papered over, and any
  downstream claim that would close a gap must come from a separately
  authorised literature exercise.
- The synthesis cannot promote attitude-perception patterns to
  behavioural conclusions, and the partial-manuscript gap list
  acknowledges that limitation.
- This synthesis is one pass; inter-rater adjudication across multiple
  synthesizers is out of scope for this run.
