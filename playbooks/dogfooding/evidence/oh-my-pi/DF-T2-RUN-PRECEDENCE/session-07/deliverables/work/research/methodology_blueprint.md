# Methodology Blueprint (methodology-blueprint.v1)

**Node**: methodology (research-main subgraph)
**Inputs**: `work/research/rq_brief.md`
**Outputs**: this `methodology_blueprint`
**Run**: run-2288fd2a43bd79f271923277

## Research Paradigm

**Selected:** Pragmatist (with a secondary descriptive case-study reading at the source level).
**Justification:** The primary RQ is a bounded evidence-mapping question — what does a small synthetic corpus support, partially support, or fail to support? Pragmatism permits mixing evidence kinds (observation summaries, interview summaries, survey summaries, policy excerpts) without committing to a single philosophical stance, which matches the fixture's mixed source set. The descriptive component reflects the source-level unit of analysis: each source is treated as a bounded case, with extraction, appraisal, and synthesis steps applied uniformly.

## Method

**Type:** Qualitative evidence mapping, structured as a four-source scoping review.
**Specific Method:** Single-team dual-pass extraction with claim-by-claim anchoring, no live external search. Each claim in the partial manuscript is extracted into a structured record with: claim text, source ID(s), observation type, and strength rating.
**Justification:** The RQ asks which claims survive contact with the supplied evidence; that is a claim-by-claim anchoring problem, not a primary-data problem. A scoping review is the lightest method that still produces auditable evidence maps. Dual-pass extraction is reduced to single-agent re-reads because there is no second team in this fixture; the second pass is implemented as a self-check after the first extraction.

## Data Strategy

**Data Type:** Secondary, qualitative (with one quantitative source — survey — used as qualitative summaries).
**Sources:** Four synthetic sources from `benchmark/sources.yaml`:
- `SYN-CLASSROOM-01` — classroom observation summary
- `SYN-INTERVIEW-02` — instructor interview summary
- `SYN-SURVEY-03` — student survey summary (84 voluntary responses)
- `SYN-POLICY-04` — institutional policy excerpt

Plus the partial manuscript at `benchmark/partial-manuscript.md` as the unit-of-claims object.

**Sampling:** Census of the supplied corpus (all four sources). No external sampling.
**Time Frame:** Six-week observation window (per `SYN-CLASSROOM-01`); survey window not specified beyond "data collection"; interview window not specified. The fixture does not allow further temporal disaggregation.

## Analytical Framework

**Technique:** Claim extraction, source grading, and a claim-source matrix (observation / partial support / unsupported / unknown), followed by a synthesis section that re-states the surviving hypotheses and design constraints.
**Steps:**
1. List every claim in the partial manuscript (working title, introduction sentences, preliminary findings).
2. For each claim, identify the source IDs whose summaries directly support, partially support, contradict, or are silent.
3. Rate each source on three dimensions: scope, design rigor, transferability.
4. Produce a claim-by-claim matrix and a per-source appraisal table.
5. Distinguish observation, interpretation, and unknown in every synthesis row.

**Tools:** Markdown tables; no statistical analysis is run because no source contains numerical effect sizes or comparisons suitable for re-analysis.

## Validity Criteria

| Criterion | Strategy to Ensure |
|---|---|
| Credibility | Every claim-source mapping cites the source ID and is restated in the source's own terms. No external paraphrase added. |
| Transferability | Source limits are stated up front; the matrix flags each claim's generalizability. |
| Dependability | Extraction is recorded in a single artifact (`annotated_bibliography`) and re-graded (`graded_sources`); the synthesis matrix cites both. |
| Confirmability | The four sources are the only inputs; no external citation is permitted. Unknowns are recorded as "unknown" rather than inferred. |

## Limitations (By Design)

- **No external evidence.** This blueprint cannot answer questions about how these patterns compare with other institutions, countries, or time periods.
- **Single-agent extraction.** No inter-rater reliability is possible in the fixture; the second pass is a self-check.
- **Source-kind heterogeneity.** A classroom summary, an interview summary, a survey summary, and a policy excerpt cannot be triangulated to a single construct; cross-source convergence is therefore reported as *kind-aligned agreement*, not as construct validation.
- **No effect sizes.** No source supplies an effect size, odds ratio, regression coefficient, or significance test; quantitative generalization is impossible.
- **Short observation window.** Six weeks cannot support causal claims about workload or skill development.

## Ethical Considerations

- All sources are synthetic test material; no human subjects, identifiable persons, or institution-specific policy is being transmitted.
- No real DOI or external publication is cited.
- The fixture goal explicitly forbids fabricating participants, effect sizes, citations, or ethics approvals.
- Any future study drawing on similar design must undergo institution-specific ethics review; this blueprint does not pre-empt that pathway.

## Human-Subjects Administrative Status

- candidate-pathway facts and unresolved applicability questions: No human subjects are involved in this evidence-mapping work itself; any future primary-data study would need a separate pathway determination.
- candidate rule trace: unavailable (no replay-validated authority context supplied).
- review pathway: institutional determination required (only if a future primary-data study is mounted).
- submission readiness: unresolved (not applicable to this fixture).
- authorization status: not_provided.
- authority context: unavailable.
- profile_dependent_result_allowed: false.
- applicable requirement IDs, obligated actors, consumer scopes, and exact pointers: unavailable.
- informed consent planning: not applicable to this fixture.
- data de-identification, retention, and destruction: not applicable; sources are synthetic.
- review timeline: unknown — obtain current institutional estimate.

> **Human-subjects boundary:** This output does not authorize recruitment, consent, access to identifiable data, intervention, or data collection.

## Reporting Standard

- **Guideline:** Adapted PRISMA-S for scoping reviews, but with explicit "no external search" overrides and a transparency note that this is a four-source scoping over a synthetic corpus.
- **Reporting checklist (abridged):**
  - [x] Identify the corpus and the inclusion rule (all supplied synthetic sources).
  - [x] Document the extraction form.
  - [x] Document source appraisal.
  - [x] Present claim-by-claim matrix.
  - [x] Distinguish observation, interpretation, unknown.
  - [x] State limits of the corpus.

## Preregistration

- **Recommendation:** Not required for this evidence-mapping exercise; not applicable.
- **Platform:** None.
- **Status:** Not required.
- **Completed artifact declaration:** not_provided.
- **Companion handle:** none.
- **Sidecar ownership:** dispatching layer only; do not populate a digest here.
