# Research Question Brief (rq-brief.v1)

**Node**: research-question (research-main subgraph, research-pipeline entry)
**Inputs**: `researchspec/specs/project.md` (intent header); `benchmark/goal.md`; `benchmark/partial-manuscript.md`
**Outputs**: this `rq_brief`
**Date**: 2026-09-27
**Run**: run-2288fd2a43bd79f271923277

## Topic Area

Generative AI in university writing instruction — student writing process, feedback quality, instructor workload, and academic integrity.

## Primary Research Question

Within the bounded set of synthetic evidence available in this benchmark, what hypotheses about generative AI's role in university writing instruction are supported, partially supported, or unsupported, and what design constraints does the evidence impose on future inquiry?

## FINER Assessment

| Criterion | Score | Justification |
|---|---|---|
| Feasible | 4/5 | The supplied evidence corpus (four synthetic sources) is small and self-contained; a bounded review can be carried out inside the fixture. External claims and primary data collection are explicitly out of scope. |
| Interesting | 4/5 | The corpus exposes a recurring tension between faster formative feedback and added verification work, plus a structural mismatch between short classroom observations and causal claims about workload. |
| Novel | 3/5 | Within this fixture the value lies in disciplined scoping rather than new empirical findings; no external literature may be added. |
| Ethical | 5/5 | All sources are synthetic test material; no human subjects, identifiable persons, or institution-specific policy is being transmitted. |
| Relevant | 4/5 | Calibrates how a future study or course policy can use such evidence honestly, and demonstrates a workflow that distinguishes observation from interpretation. |
| **Average** | **4.0/5** | |

## Scope Boundaries

**In Scope**
- Sources `SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04` (and the partial manuscript) only.
- Mapping each claim in `benchmark/partial-manuscript.md` to the supporting source(s) it actually rests on.
- Reporting observation, interpretation, and unknowns separately.
- Hypothesis generation for follow-up study designs using these source kinds.

**Out of Scope**
- External literature, web search, real DOI resolution, fabricated citations.
- New participants, effect sizes, p-values, regression outputs.
- General causal claims about generative AI in writing instruction as a whole.
- Institutional comparisons or policy transfer beyond the single synthetic policy excerpt.
- Ethics approval language implying real IRB review.

**Key Assumptions**
1. The synthetic sources are the only admissible evidence base; no source may be promoted beyond what its summary states.
2. The partial manuscript's existing claims are not authoritative until re-anchored to the supplied sources.
3. The working title in the manuscript is a placeholder, not a settled deliverable.

## Sub-questions

1. Which claims in the partial manuscript are supported, partially supported, or unsupported by the supplied sources?
2. What evidence limits should the manuscript's introduction, methods, and discussion sections acknowledge?
3. What hypotheses about generative AI in writing instruction can be generated from this corpus, and what study design would test each one?

## Sub-Question Bindings

- All three sub-questions inherit the full parent scope: synthetic corpus only, no external sources, observation/interpretation/unknown separated.
- No user-approved deviations.

## Candidate Questions Considered

| # | Candidate | FINER Avg | Why not selected |
|---|---|---|---|
| 1 | Does generative AI reduce instructor workload in writing courses? | 3.6 | The draft manuscript already flags this claim as unsupported; framing the primary RQ as a causal test would mislead the reader given the evidence. |
| 2 | How do students perceive AI-assisted feedback? | 3.4 | Doable but reduces the brief to a single survey; under-uses the policy and interview evidence. |
| 3 | What policy patterns govern acceptable AI assistance in writing courses? | 3.2 | One synthetic policy excerpt is too thin to bear this RQ alone. |
| 4 | What hypotheses can be drawn from a bounded synthetic corpus, and what design constraints follow? | 4.0 | Selected. Honest about the evidence base and yields actionable next-step design. |
| 5 | How should short classroom observations be communicated responsibly? | 3.6 | Relevant but derivative; folded into RQ #4 as a sub-question. |

## Notes on Socratic Mode

The fixture goal explicitly states that the research question is not yet decided. This packet therefore treats the primary RQ as a *bounded synthesis RQ* rather than a causal RQ, and surfaces three sub-questions. A user-side decision is still pending whether to escalate to a comparative or causal RQ once additional evidence is admitted. If the user widens the evidence base (e.g., adds a comparison institution or a time series), the candidate list above should be rescored before advancing past the rq-gate.
