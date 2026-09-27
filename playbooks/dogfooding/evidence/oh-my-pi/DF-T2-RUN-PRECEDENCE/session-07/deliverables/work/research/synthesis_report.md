# Synthesis Report (synthesis-report.v1)

**Node**: synthesis (research-main subgraph)
**Inputs**: `work/research/graded_sources.md`; `work/research/rq_brief.md`; `work/research/methodology_blueprint.md`; `benchmark/partial-manuscript.md`; `benchmark/sources.yaml`
**Outputs**: this `synthesis_report`
**Run**: run-2288fd2a43bd79f271923277

> **Fixture note.** All source IDs prefixed `SYN-` are synthetic. Citation anchors are limited to source IDs and source-ID/quote-string tuples derived from the supplied summaries; no external locator is invented.

## Claim Intent Manifests

```yaml
claim_intent_manifests:
  - claim_id: CIM-01
    statement: "Within the bounded synthetic corpus, generative AI in university writing instruction is associated with directional trade-offs rather than uniform benefits or harms."
    intent: descriptive-synthesis
    must_not:
      - extend any pattern to institutions, populations, or time periods outside the supplied corpus
      - promote the directional trade-off into a quantitative or causal claim
  - claim_id: CIM-02
    statement: "Structured prompting coincides with more visible outline revisions but does not demonstrate writing-quality gains in the supplied evidence."
    intent: claim-bounded
    must_not:
      - describe the visibility of revisions as a measure of writing quality
      - infer that prompting caused the revisions
  - claim_id: CIM-03
    statement: "Self-reported instructor workload patterns in the corpus favor a trade-off reading (faster formative feedback partly offset by verification work) over a workload-reduction reading."
    intent: claim-bounded
    must_not:
      - generalize to all writing instructors or institutions
      - present self-report as measured time logs
  - claim_id: CIM-04
    statement: "Student perception data support a need for clearer disclosure/attribution guidance and do not constitute behavioral compliance evidence."
    intent: claim-bounded
    must_not:
      - treat perception data as observed behavior
  - claim_id: CIM-05
    statement: "Institutional policy text in the corpus establishes a disclosure floor and a discretionary zone for acceptable assistance; policy text alone does not establish implementation."
    intent: claim-bounded
    must_not:
      - generalize the policy excerpt to other institutions
      - infer enforcement or compliance from the policy text

citation_intent:
  - visible citations must carry <kind> != "none"
  - quote anchors limited to 25 words
  - all anchors derived from corpus summaries only
```

## Literature Matrix

| Source | Theme: writing process | Theme: feedback & workload | Theme: integrity & disclosure | Theme: policy framing | Method | Quality (Level) |
|---|---|---|---|---|---|---|
| SYN-CLASSROOM-01 | Supports (more outline revisions under structured prompting) | Indirect (rubric scores varied) | Silent | Silent | classroom observation (single, 6 wks) | VI |
| SYN-INTERVIEW-02 | Indirect (mentions claim-checking) | Supports (faster feedback, more verification time) | Indirect (claim-checking implies integrity concern) | Silent | instructor interviews (N=5) | VI |
| SYN-SURVEY-03 | Silent | Supports (students value rapid feedback) | Supports (uncertainty about use & attribution) | Indirect (policy changed mid-collection) | student survey (N=84, voluntary) | VI |
| SYN-POLICY-04 | Silent | Silent | Supports (disclosure required) | Supports (acceptable assistance left to instructors) | policy text | VII |

## Key Themes

### Theme 1: Process visibility ≠ quality improvement

**Evidence Strength**: Emerging (1 source at the design level; corroborated indirectly by the workload theme).
**Sources**: SYN-CLASSROOM-01 (direct); SYN-INTERVIEW-02 (indirect — claim-checking).
**Synthesis**: Structured AI prompting coincided with more visible outline revisions in one course, but the same source reports that rubric scores varied widely, and no validated writing-improvement measure exists in the corpus. Indirect corroboration comes from SYN-INTERVIEW-02, where instructors report additional time spent checking unsupported claims — a behavioral pattern that fits a world where AI-assisted drafting produces more verbiage that instructors must verify. Together, these two sources support a *process visibility* reading without supporting a *quality gain* reading.

### Theme 2: Workload trade-off, not workload reduction

**Evidence Strength**: Moderate (1 direct source, kind-aligned; contradicted by the partial manuscript's preliminary claim CLM-02).
**Sources**: SYN-INTERVIEW-02 (direct); SYN-SURVEY-03 (indirect — students value rapid feedback, which can only be supplied if instructors invest time).
**Synthesis**: The corpus does not support the strong "AI reduces instructor workload" framing. SYN-INTERVIEW-02 explicitly describes a trade-off: faster formative feedback partly offset by additional time checking unsupported claims. SYN-SURVEY-03's student-side appreciation of rapid feedback is consistent with that trade-off — rapid feedback has a cost. The partial manuscript's preliminary claim that workload reduction is unsupported (CLM-02) is therefore consistent with the supplied evidence; the corpus does not support reframing the claim as workload reduction.

### Theme 3: Disclosure and attribution as a perception-side gap

**Evidence Strength**: Emerging (1 direct source at the perception level; corroborated by policy floor).
**Sources**: SYN-SURVEY-03 (direct — student uncertainty); SYN-POLICY-04 (indirect — disclosure required).
**Synthesis**: Students report uncertainty about permitted use and attribution. The institutional policy requires course-level disclosure but leaves acceptable assistance to instructors. The two sources together support a perception-side gap (students do not feel they have clear guidance) without supporting any behavioral compliance claim. Whether the gap is filled by clearer course-level guidance, more uniform instructor interpretation, or both, is unknown from the supplied evidence.

### Theme 4: Policy text without implementation evidence

**Evidence Strength**: Single-source (1 policy excerpt).
**Sources**: SYN-POLICY-04.
**Synthesis**: The policy text establishes a disclosure requirement and a discretionary zone for instructors. Whether the disclosure requirement is enforced, how often instructors interpret the discretionary zone consistently, and what happens when students and instructors disagree, are all unanswered by the supplied evidence. This is not a defect of the source — it is a boundary of the corpus.

## Contradictions & Resolutions

| Claim A | Claim B | Resolution |
|---|---|---|
| CLM-02 (workload reduction): "The stronger statement that generative AI reduces workload is not supported by the supplied evidence." [partial-manuscript] | Reader expectation from "AI helps instructors" framing | Reconciled. The corpus is silent on net workload reduction and supports a trade-off reading instead. The partial-manuscript caution stands. |
| Faster formative feedback (SYN-INTERVIEW-02) vs. additional verification time (SYN-INTERVIEW-02) | n/a (same source) | Reconciled *within* the source as an explicit trade-off; not a contradiction. |
| Policy requires disclosure (SYN-POLICY-04) vs. student uncertainty about disclosure (SYN-SURVEY-03) | n/a | Reconciled as a perception-vs-text gap; no claim that the policy is unenforced. The corpus cannot distinguish whether the gap is due to weak policy communication, weak implementation, or student-side information deficits. |

#### Cross-Paper Tension Inventory

```yaml
cross_paper_tensions:
  - pair_id: CP-001
    paper_a: "SYN-INTERVIEW-02"
    paper_b: "SYN-CLASSROOM-01"
    candidate_basis: "shared RQ subtopic (workload / process)"
    overlap_topic: "How does AI-assisted writing change instructor time and student process visibility?"
    a_finding: "Faster formative feedback partly offset by additional claim-checking time."
    a_evidence_pointer: "SYN-INTERVIEW-02 finding statement"
    b_finding: "Structured prompting coincided with more outline revisions; rubric scores varied."
    b_evidence_pointer: "SYN-CLASSROOM-01 finding statement"
    pair_assessment: "conditional_difference"
    resolution_status: "resolved_in_synthesis"
    resolution_pointer: "Synthesis Report > Contradictions & Resolutions, ¶1; Theme 2 paragraph 1"
    scholar_confirmation: "pending"
  - pair_id: CP-002
    paper_a: "SYN-POLICY-04"
    paper_b: "SYN-SURVEY-03"
    candidate_basis: "shared RQ subtopic (integrity / disclosure)"
    overlap_topic: "Do students and policy align on disclosure and acceptable assistance?"
    a_finding: "Course-level disclosure required; acceptable assistance delegated to instructors."
    a_evidence_pointer: "SYN-POLICY-04 finding statement"
    b_finding: "Students report uncertainty about permitted use and attribution."
    b_evidence_pointer: "SYN-SURVEY-03 finding statement"
    pair_assessment: "conditional_difference"
    resolution_status: "resolved_in_synthesis"
    resolution_pointer: "Synthesis Report > Contradictions & Resolutions, ¶3; Theme 3 paragraph 1"
    scholar_confirmation: "pending"
  - pair_id: CP-003
    paper_a: "SYN-CLASSROOM-01"
    paper_b: "SYN-SURVEY-03"
    candidate_basis: "shared RQ subtopic (writing process / perception)"
    overlap_topic: "Process visibility and student appreciation of feedback"
    a_finding: "Structured prompting coincided with more visible outline revisions."
    a_evidence_pointer: "SYN-CLASSROOM-01 finding statement"
    b_finding: "Students valued rapid feedback; reported uncertainty about permitted use."
    b_evidence_pointer: "SYN-SURVEY-03 finding statement"
    pair_assessment: "no_material_conflict"
    resolution_status: "not_applicable"
    scholar_confirmation: "pending"
  - pair_id: CP-004
    paper_a: "SYN-INTERVIEW-02"
    paper_b: "SYN-POLICY-04"
    candidate_basis: "shared RQ subtopic (instructor discretion / workload)"
    overlap_topic: "Instructor authority over acceptable assistance and time cost"
    a_finding: "Instructors report additional claim-checking time."
    a_evidence_pointer: "SYN-INTERVIEW-02 finding statement"
    b_finding: "Acceptable assistance left to instructors."
    b_evidence_pointer: "SYN-POLICY-04 finding statement"
    pair_assessment: "no_material_conflict"
    resolution_status: "not_applicable"
    scholar_confirmation: "pending"
```

**Coverage Note**: 4 papers in corpus; 6 candidate ordered pairs; 4 candidate pairs were considered after de-duplication by sorted `(paper_a, paper_b)`. The CP-005/CP-006 candidates (CLM-01 vs CLM-02; manuscript-vs-policy) were excluded because they compare the manuscript's own preliminary claims to the source set, not source-to-source. This is a scoped advisory scan, not complete pairwise contradiction detection. Bibliographic coupling was not applicable (no real publications). Scholar confirms each resolution_pointer and may flag additional cross-pairs.

## Knowledge Gaps

1. **Empirical / outcome gap** — no source provides a validated writing-quality measure or a learning-gain outcome. The corpus can speak to process visibility and feedback timing, not to writing improvement.
2. **Methodological / triangulation gap** — four different evidence kinds (observation, interview, survey, policy text) cannot be triangulated to a single construct; the synthesis relies on kind-aligned agreement.
3. **Temporal / longitudinal gap** — six weeks of classroom observation cannot support causal claims about workload or skill development; no longitudinal outcomes are present.
4. **Geographic / institutional gap** — all four sources describe a single synthetic institution; cross-institutional patterns are unknown.
5. **Implementation gap** — SYN-POLICY-04 provides text only; whether disclosure is enforced, how instructors interpret the discretionary zone, and how often students and instructors disagree, are all unanswered.

## Evidence Convergence Map

```
Strong:      [          ] (no theme supported by 3+ sources)
Moderate:    [====      ] Theme 2 (Workload trade-off) — 2 sources (SYN-INTERVIEW-02, SYN-SURVEY-03 indirect)
Emerging:    [=====     ] Theme 1 (Process visibility) — 1 direct + 1 indirect
Emerging:    [=====     ] Theme 3 (Disclosure perception) — 1 direct + 1 indirect
Single:      [===       ] Theme 4 (Policy text) — 1 source
Gap:         [          ] validated writing-quality outcome
Gap:         [          ] longitudinal outcomes
Gap:         [          ] cross-institutional patterns
Gap:         [          ] policy implementation evidence
```

## Theoretical Integration

The synthesis supports a **process-trace-and-verification** reading of generative AI in writing instruction: AI assistance leaves a visible process trace (more revisions, more text to verify) that imposes a verification cost on instructors and a perception-side uncertainty cost on students. The framework implies that evaluating AI's effect on writing instruction requires measuring (a) the verifiability of AI-assisted output, (b) the time cost of verification, and (c) the quality of disclosure/attribution guidance — none of which are directly measured in the supplied corpus.

## Synthesis Limitations

- **Small corpus**: four sources, all from one synthetic institution.
- **No external comparison**: no prior systematic review or cross-institutional study was admissible in this fixture.
- **Source-kind heterogeneity**: cross-source triangulation is at the kind-aligned level only.
- **No quantitative synthesis**: no source supplies an effect size; meta-analysis is not possible.
- **No causal inference**: the corpus supports directional patterns, not causal claims.
- **No policy implementation evidence**: SYN-POLICY-04 is text only.

## Rules followed

- Findings integrated across sources, not listed sequentially.
- Each theme cites specific sources with evidence levels.
- All identified contradictions are analyzed; cross-paper tension inventory emitted with `scholar_confirmation: pending`.
- Knowledge gaps enumerated (5 total).
- Literature matrix completed for all 4 sources.
- Traceability: every claim maps to a source ID or to the partial-manuscript text it is derived from.
- No exhaustive-contradiction claim made; coverage note included.
- No full research report, editorial review, or revision work performed in this node.
