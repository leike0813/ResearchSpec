# Synthesis Report — Generative AI in Higher-Ed Writing Instruction

> TEST FIXTURE — synthetic dogfooding material. Not real research, not real participants, not real policy.
> Procedure: `analysis-evidence-synthesis` (standalone). Grading input reused from the synthetic
> `benchmark/sources.yaml` (`scope` + `finding` + `limits` serve as a lightweight pre-grade; no
> `procedure:discovery-source-quality-grading` was run because the corpus is synthetic and bounded
> by the goal "只使用本基准包提供的合成材料").
> Synthesis date: 2026-09-27.

## Claim Intent Manifest

```yaml
claim_intent_manifests:
  - claim_id: CI-S1
    intent: describe
    must_not:
      - infer net causal effect of AI on writing quality (CLASSROOM has no comparison group)
      - generalize beyond one institution (all four sources are single-site)
      - extrapolate beyond a six-week window
      - equate reported attitudes with observed behavior
  - claim_id: CI-S2
    intent: describe
    must_not:
      - infer causal workload change without time logs (INTERVIEW has no time logs)
      - claim institutional implementation quality (POLICY text ≠ implementation evidence)
```

## Literature Matrix

| Source | Kind | Scope | Theme: workload shift | Theme: student engagement | Theme: governance | Limits (acts as grade signal) |
|---|---|---|---|---|---|---|
| SYN-CLASSROOM-01 | Classroom observation summary | 1 first-year writing course, 6 weeks | Indirect — instructor supplies all prompts, so instructional control is high but student prompt initiative unmeasured | Supports — more outline revisions; rubric scores varied | Indirect — single instructor's enactment of unspecified policy | No comparison group; no validated writing-improvement measure; instructor supplied all prompts |
| SYN-INTERVIEW-02 | Instructor interview summary | 5 instructors at 1 institution | Supports — faster formative feedback, additional time checking unsupported claims | Indirect — instructor-side view of feedback | Supports — instructors carry acceptability judgement | Self-reported workload; small convenience sample; no time logs |
| SYN-SURVEY-03 | Student survey summary | 84 voluntary responses | Not addressed | Supports — valued rapid feedback; uncertainty about permitted use and attribution | Supports — student-side uncertainty on rules | Voluntary response bias; attitudes ≠ behavior; local policy changed during data collection |
| SYN-POLICY-04 | Institutional policy excerpt | 1 synthetic university | Not addressed | Not addressed | Direct — course-level disclosure required; acceptable assistance left to instructors | Policy text ≠ implementation evidence; not generalizable |

Evidence quality descriptors (since no formal grading was run):
- `policy_text` — descriptive, single-site
- `qualitative_interview_small_n` — Level-VI-equivalent: small convenience sample, self-report, no time logs
- `attitudinal_survey_voluntary` — Level-VI-equivalent: attitudes, voluntary bias, concurrent policy change
- `observational_classroom_no_control` — Level-V-equivalent: short window, no comparison, no validated outcome

## Key Themes

### Theme 1 — AI redistributes instructor workload from generation to verification

**Evidence strength:** Emerging (2 sources: CLASSROOM indirectly, INTERVIEW directly).
**Sources:** SYN-INTERVIEW-02 (direct), SYN-CLASSROOM-01 (indirect via instructor-supplied prompts).
**Synthesis:** Where instructors take an active role in shaping AI use (CLASSROOM: instructor-supplied prompts; INTERVIEW: 5 instructors using AI for formative feedback), the workload composition shifts. INTERVIEW names the new component explicitly — checking unsupported claims — but does not measure its magnitude (no time logs). CLASSROOM shows the other half of the redistribution: when the instructor supplies the prompts, the student side loses prompt-engineering effort, so the observed "more outline revisions" cannot be attributed to student AI initiative. The convergence is on the *direction* of change, not on its magnitude or net effect on writing quality.

### Theme 2 — Student engagement rises while norms stay unclear

**Evidence strength:** Emerging (2 sources: SURVEY directly, CLASSROOM indirectly).
**Sources:** SYN-SURVEY-03 (direct), SYN-CLASSROOM-01 (indirect via revision behavior).
**Synthesis:** SURVEY reports students value rapid feedback but are uncertain about permitted use and attribution. CLASSROOM reports more outline revisions but heterogeneous final rubric scores. Read together: students are engaging more deeply with the drafting process, but the quality of the resulting work varies, and the rules they are operating under are unclear. The engagement signal is consistent; the quality signal is unestablished.

### Theme 3 — Governance centralizes disclosure, decentralizes acceptability

**Evidence strength:** Moderate (1 policy source + 2 empirical sources describing the same gap).
**Sources:** SYN-POLICY-04 (direct), SYN-INTERVIEW-02 and SYN-CLASSROOM-01 (indirect).
**Synthesis:** POLICY mandates course-level disclosure and leaves acceptable assistance to instructors. The empirical sources describe heterogeneous instructor practice (one supplies all prompts; five report added verification work) without measuring whether either approach produces consistent acceptability decisions. The policy is implementable on paper; the implementation evidence is missing.

## Contradictions & Resolutions

| Claim A | Claim B | Resolution |
|---|---|---|
| CLASSROOM: structured AI prompts → more outline revisions | INTERVIEW: AI use → faster formative feedback but additional verification time | Reconcilable as **conditional difference, not contradiction.** They measure different agents (student process vs instructor workload) and different outcomes. AI plausibly changes both simultaneously; net effect on writing quality is unmeasured. |
| SURVEY: students value rapid feedback | CLASSROOM: final rubric scores varied widely | Reconcilable. Engagement and outcome quality are distinct dimensions. Both can be true; the unresolved question is whether high engagement + varied outcomes means improvement for some students or heterogeneity in the intervention. |
| POLICY: instructors decide acceptable assistance | INTERVIEW: instructors report added verification workload | Conditional difference (flagged unresolved below). Policy *assumes* instructor can adjudicate consistently; the interview suggests instructor capacity may be strained, but no quality-of-adjudication measure exists. |

### Cross-Paper Tension Inventory

```yaml
cross_paper_tensions:
  - pair_id: CP-001
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-INTERVIEW-02
    candidate_basis: shared construct (AI in writing instruction); bibliographically coupled (same institutional context implied)
    overlap_topic: how AI changes instructor work and student process
    a_finding: structured AI prompts → more outline revisions; instructor supplies all prompts
    a_evidence_pointer: SYN-CLASSROOM-01.finding; SYN-CLASSROOM-01.limits
    b_finding: faster formative feedback but added time checking unsupported claims
    b_evidence_pointer: SYN-INTERVIEW-02.finding
    pair_assessment: conditional_difference
    resolution_status: resolved_in_synthesis
    resolution_pointer: "Synthesis Report > Contradictions & Resolutions, row 1"
    scholar_confirmation: pending

  - pair_id: CP-002
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-SURVEY-03
    candidate_basis: shared topic (student experience with AI in writing); shared construct (rapid feedback / revisions)
    overlap_topic: what students gain from AI-mediated writing work
    a_finding: more outline revisions; varied rubric scores
    a_evidence_pointer: SYN-CLASSROOM-01.finding
    b_finding: students value rapid feedback; uncertain about permitted use and attribution
    b_evidence_pointer: SYN-SURVEY-03.finding
    pair_assessment: no_material_conflict
    resolution_status: not_applicable
    scholar_confirmation: pending

  - pair_id: CP-003
    paper_a: SYN-INTERVIEW-02
    paper_b: SYN-POLICY-04
    candidate_basis: shared RQ subtopic (instructor role under institutional AI rules)
    overlap_topic: instructor capacity to adjudicate acceptable assistance
    a_finding: instructors report added verification workload
    a_evidence_pointer: SYN-INTERVIEW-02.finding; SYN-INTERVIEW-02.limits
    b_finding: acceptable assistance is left to instructors; policy text only
    b_evidence_pointer: SYN-POLICY-04.finding; SYN-POLICY-04.limits
    pair_assessment: conditional_difference
    resolution_status: flagged_unresolved
    scholar_confirmation: pending

  - pair_id: CP-004
    paper_a: SYN-SURVEY-03
    paper_b: SYN-POLICY-04
    candidate_basis: shared RQ subtopic (rules and student awareness of them)
    overlap_topic: clarity of permitted AI use
    a_finding: students uncertain about permitted use and attribution; policy changed mid-collection
    a_evidence_pointer: SYN-SURVEY-03.finding; SYN-SURVEY-03.limits
    b_finding: course-level disclosure required; acceptable assistance left to instructors
    b_evidence_pointer: SYN-POLICY-04.finding
    pair_assessment: conditional_difference
    resolution_status: flagged_unresolved
    scholar_confirmation: pending

  - pair_id: CP-005
    paper_a: SYN-CLASSROOM-01
    paper_b: SYN-POLICY-04
    candidate_basis: shared RQ subtopic (course-level AI rules and practice)
    overlap_topic: whether classroom practice matches policy requirements
    a_finding: instructor supplies all prompts in one first-year course
    a_evidence_pointer: SYN-CLASSROOM-01.finding; SYN-CLASSROOM-01.limits
    b_finding: course-level disclosure required; acceptability left to instructors
    b_evidence_pointer: SYN-POLICY-04.finding
    pair_assessment: insufficient_overlap
    resolution_status: not_applicable
    scholar_confirmation: pending
```

**Coverage Note:** 4 sources in corpus; 6 candidate pairs considered (CP-001 through CP-005 above; CP-006 INTERVIEW↔SURVEY omitted because the shared topic — feedback experience — does not produce a contradiction and would be a third `no_material_conflict` entry). This is a scoped advisory scan, not complete pairwise contradiction detection. Bibliographic coupling was used as an inclusion signal only. Scholar confirms each `resolution_pointer` and may flag additional cross-pairs.

## Knowledge Gaps

1. **Empirical — net effect of AI on writing quality.** CLASSROOM lacks a comparison group; INTERVIEW lacks time logs; SURVEY measures attitudes. No source isolates the causal effect of AI use on writing improvement. *Implication:* any causal claim requires new material (a controlled study or pre/post design with validated outcomes).

2. **Methodological — outcome measurement.** No source uses a validated writing-improvement measure (rubric scores in CLASSROOM are described as "varied widely" without an inter-rater or validity statement). *Implication:* triangulation opportunity — need a study with a validated outcome instrument.

3. **Temporal — horizon.** CLASSROOM spans six weeks; SURVEY was concurrent with a policy change; INTERVIEW is a single interview wave. *Implication:* retention and durability of any effect are unestablished; longitudinal material needed.

4. **Population — single-site generalizability.** All four sources are drawn from one institution (or, for POLICY, one synthetic university). *Implication:* claims about higher education broadly are unsupported; multi-site material needed.

5. **Behavioral vs. attitudinal.** SURVEY reports attitudes; CLASSROOM reports observed behavior; the two are not directly bridged. *Implication:* a study linking student attitudes to observed behavior (and to actual academic-integrity decisions) is missing.

6. **Implementation quality of policy.** POLICY is a text artifact; no source measures how disclosure rules or acceptability decisions are enacted in practice. *Implication:* policy implementation evidence (audit, classroom observation across multiple instructors, or student-side disclosure compliance data) needed.

7. **Academic integrity outcomes.** SURVEY notes student uncertainty about attribution; no source measures actual integrity incidents, detection rates, or sanction patterns. *Implication:* the link between norm-uncertainty and integrity outcomes is a missing empirical strand.

## Evidence Convergence Map

```
Strong:      [          ] (none)
Moderate:    [======    ] Theme 3 — governance (policy + 2 empirical sources, with implementation caveat)
Emerging:    [====      ] Theme 1 — instructor workload shift (2 sources, qualitative, no time logs)
Emerging:    [====      ] Theme 2 — student engagement & norm-uncertainty (2 sources, attitude-behavior gap)
Gap:         [==========] Net causal effect of AI on writing quality
Gap:         [==========] Validated writing-outcome measurement
Gap:         [==========] Multi-site generalizability
Gap:         [==========] Longitudinal outcomes
Gap:         [==========] Policy implementation evidence
Gap:         [==========] Academic integrity outcomes
```

## Theoretical Integration

The three themes collectively suggest an alignment problem between institutional governance (POLICY), instructional practice (CLASSROOM, INTERVIEW), and student understanding (SURVEY). POLICY centralizes disclosure but decentralizes acceptability decisions; INTERVIEW suggests those decentralized decisions are taking real instructor time without quality-of-adjudication evidence; CLASSROOM shows one specific model of practice (instructor-supplied prompts) but no signal on whether other models exist in the same institution; SURVEY surfaces student-side norm uncertainty that no institutional source addresses. The pattern is consistent with a governance-implementation gap rather than a clear success or failure of any single intervention.

## Synthesis Limitations

- The corpus is synthetic, single-institution, and short-window; every claim above inherits these limits.
- The Evidence Synthesis procedure expects `graded-sources.v1` input. This run reused the synthetic `sources.yaml` scope/finding/limits fields as a lightweight grade. A formal `procedure:discovery-source-quality-grading` would not change the substantive findings but would tighten quality descriptors.
- The cross-paper tension inventory is an advisory scan, not exhaustive pairwise detection. CP-006 (INTERVIEW↔SURVEY) was omitted as a third `no_material_conflict` entry.
- No three-layer citations were emitted because the corpus has no real locators (synthetic sources, no PDF integrity preflight). Anchors of `kind: none` apply throughout; this is appropriate for the synthetic benchmark and would not be appropriate for real literature.
- Two tensions (CP-003, CP-004) are flagged unresolved because the available evidence is insufficient to settle them; new material is required.

## Where To Add Material If Continuing

If the user wants to convert these themes into publishable claims, the following additional materials would change the synthesis most:

1. A controlled or pre/post classroom study with a validated writing-outcome measure — closes Gaps 1 and 2 and directly tests Theme 1's direction claim.
2. A multi-site instructor survey or interview set with time logs — closes Gaps 4 and 6 and converts Theme 1 from emerging to moderate/strong.
3. A student behavior study linking reported attitudes to observed choices (e.g., disclosure decisions, prompt composition) — closes Gap 5 and tests Theme 2's attitude-behavior bridge.
4. An institutional implementation audit of the disclosure rule — closes Gap 6 and tests the governance-implementation pattern in Theoretical Integration.
5. Academic-integrity incident and adjudication data — closes Gap 7 and tests whether norm-uncertainty (SURVEY) translates into measurable misconduct or detection patterns.