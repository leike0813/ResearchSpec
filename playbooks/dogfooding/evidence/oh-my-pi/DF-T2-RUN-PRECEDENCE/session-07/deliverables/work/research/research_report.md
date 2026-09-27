# Research Report (research-report.v1)

**Node**: report (research-main subgraph)
**Inputs**: `work/research/synthesis_report.md`; `work/research/methodology_blueprint.md`; `work/research/rq_brief.md`; `work/research/graded_sources.md`; `work/research/annotated_bibliography.md`; `benchmark/partial-manuscript.md`; `benchmark/sources.yaml`
**Outputs**: this `research_report`
**Run**: run-2288fd2a43bd79f271923277
**Mode**: Short form (bounded-synthesis RQ)

---

## Research Brief Header

**Title:** Generative AI in University Writing Instruction: A Bounded Evidence Map From a Synthetic Corpus

**Date:** 2026-09-27

**Author / AI Disclosure:** This report was produced with AI-assisted research tools within a ResearchSpec pipeline. The pipeline executed research-question formulation, methodology design, literature search and screening, source grading, evidence synthesis, and report compilation. All findings are anchored to the supplied synthetic corpus; no external citations were added. Human oversight was applied throughout the pipeline. AI Disclosure: This report was produced with AI-assisted research tools. The research pipeline included AI-powered literature search, source verification, evidence synthesis, and report drafting. All findings were verified against cited sources. Human oversight was applied throughout the process.

## Executive Summary

This brief maps four synthetic evidence sources onto the claims in a partial manuscript about generative AI in university writing instruction. The corpus supports a **directional trade-off** reading rather than uniform benefit or harm: structured prompting leaves a visible process trace (more outline revisions) that imposes a verification cost on instructors and a perception-side uncertainty cost on students. The strong "workload reduction" framing in some AI-in-education discourse is not supported by the supplied evidence; self-reported instructor data describe faster formative feedback partly offset by additional claim-checking time. Institutional policy text in the corpus establishes a disclosure floor and a discretionary zone for acceptable assistance, without implementation evidence. Five knowledge gaps — writing-quality outcomes, methodological triangulation, longitudinal evidence, cross-institutional patterns, and policy implementation — define where additional evidence is needed before stronger claims can be supported.

## Background & Research Question

Universities are introducing generative AI into writing courses while instructors and students renegotiate expectations for feedback, authorship, and disclosure (Benchmark Partial Manuscript, 2026). Two preliminary findings in the partial manuscript — that structured prompting coincided with more outline revisions (`CLM-01`) and that the stronger "workload reduction" statement is not supported by the supplied evidence (`CLM-02`) — already signal the kind of careful claim calibration this evidence base supports.

The primary research question is:

> Within the bounded set of synthetic evidence available in this benchmark, what hypotheses about generative AI's role in university writing instruction are supported, partially supported, or unsupported, and what design constraints does the evidence impose on future inquiry?

This question was chosen because the corpus is small, mixed-kind, and explicitly synthetic; a causal or comparative RQ would overreach the evidence. The bounded-synthesis framing preserves honesty about what the corpus can and cannot support.

## Key Findings

- **Process visibility, not quality gain.** Structured prompting coincided with more visible outline revisions in one course, while rubric scores varied widely and no validated writing-improvement measure exists (`SYN-CLASSROOM-01`). Instructor reports of additional claim-checking time are consistent with that process-visibility reading (`SYN-INTERVIEW-02`).
- **Workload trade-off, not workload reduction.** Self-reported instructor data describe faster formative feedback partly offset by additional time spent checking unsupported claims (`SYN-INTERVIEW-02`). Student appreciation of rapid feedback is consistent with the trade-off (`SYN-SURVEY-03`). The corpus does not support a workload-reduction framing.
- **Disclosure is a perception-side gap.** Students report uncertainty about permitted use and attribution (`SYN-SURVEY-03`). Institutional policy requires course-level disclosure but leaves acceptable assistance to instructors (`SYN-POLICY-04`). The two sources together describe a perception-versus-text gap that the corpus cannot resolve.
- **Policy text without implementation evidence.** `SYN-POLICY-04` records what one institution's policy says; whether disclosure is enforced, how the discretionary zone is interpreted, and how often students and instructors disagree are unanswered.

## Analysis & Implications

### Theoretical integration

The synthesis supports a **process-trace-and-verification** reading of generative AI in writing instruction: AI assistance leaves a visible process trace that imposes verification and perception costs. Evaluations of AI's effect on writing instruction should therefore measure (a) verifiability of AI-assisted output, (b) time cost of verification, and (c) the quality of disclosure and attribution guidance — none of which are directly measured in the supplied corpus.

### Practical implications

For course design, the corpus supports, at most, a *directional* recommendation: expect that introducing AI prompting without explicit verification and disclosure guidance will leave more visible process artifacts without guaranteeing writing-quality gains, and may shift instructor time toward claim-checking. Stronger recommendations — workload reduction, integrity improvement, learning gains — are not supported by this evidence.

### Implications for future research

The five gaps identified (writing-quality outcome, methodological triangulation, longitudinal evidence, cross-institutional patterns, policy implementation) describe the design constraints for any future study that would support stronger claims. In particular, a future study would need at least: a validated writing-improvement measure, time logs (not self-report) for instructor workload, longitudinal outcomes, and implementation evidence for the policy it studies.

## Limitations

- **Bounded corpus.** Four synthetic sources from one synthetic institution; no external literature admitted.
- **No effect sizes.** No quantitative synthesis is possible from the supplied summaries.
- **No causal inference.** The corpus supports directional patterns, not causal claims.
- **Single-agent extraction.** Inter-rater reliability is not possible in this fixture.
- **Verification limits.** No external index can verify synthetic source IDs; the appraisal is based on the form of evidence and on the limits declared by the source summaries themselves.
- **Policy implementation is text-only.** The policy excerpt establishes a floor and a discretionary zone; whether or how they are implemented is unknown.

## References

> APA 7.0 format. All sources are synthetic fixtures; bibliographic fields that depend on real publication data are recorded as "synthetic fixture".

- Synthetic fixture (2026). *Classroom observation summary: structured AI prompts in a first-year writing course* (`SYN-CLASSROOM-01`). [synthetic fixture; no real DOI or venue].
- Synthetic fixture (2026). *Instructor interview summary: faster feedback, additional verification work* (`SYN-INTERVIEW-02`). [synthetic fixture].
- Synthetic fixture (2026). *Student survey summary: rapid feedback valued; uncertainty about permitted use and attribution* (`SYN-SURVEY-03`). [synthetic fixture].
- Synthetic fixture (2026). *Institutional policy excerpt: course-level disclosure required; acceptable assistance left to instructors* (`SYN-POLICY-04`). [synthetic fixture].
- Benchmark Partial Manuscript (2026). *Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits* (working title). [synthetic fixture].

## Appendices

### Appendix A — Source ↔ claim matrix

| Claim in partial manuscript | Supporting source(s) | Status |
|---|---|---|
| `CLM-01` structured prompting coincided with more visible outline revisions | `SYN-CLASSROOM-01` (direct); `SYN-INTERVIEW-02` (indirect corroboration via verification cost) | Supported at the process level; not at the quality level |
| `CLM-02` "workload reduction" is unsupported by the evidence | `SYN-INTERVIEW-02` describes a trade-off rather than a reduction; `SYN-SURVEY-03` consistent with the trade-off | Caution stands |
| Disclosure/attribution uncertainty | `SYN-SURVEY-03` (direct); `SYN-POLICY-04` (policy floor) | Supported at the perception level only |
| Policy framing | `SYN-POLICY-04` | Supported at the text level; not at the implementation level |

### Appendix B — Evidence Convergence Map

```
Strong:      [          ] (no theme supported by 3+ sources)
Moderate:    [====      ] Workload trade-off (SYN-INTERVIEW-02, SYN-SURVEY-03)
Emerging:    [=====     ] Process visibility (SYN-CLASSROOM-01, SYN-INTERVIEW-02 indirect)
Emerging:    [=====     ] Disclosure perception (SYN-SURVEY-03, SYN-POLICY-04)
Single:      [===       ] Policy text (SYN-POLICY-04)
Gap:         [          ] validated writing-quality outcome
Gap:         [          ] longitudinal outcomes
Gap:         [          ] cross-institutional patterns
Gap:         [          ] policy implementation evidence
```

### Appendix C — Revision Log

No upstream review feedback was supplied; no revision log entries.

### Appendix D — Unresolved Issues

- Whether the perception-versus-text gap in disclosure reflects weak policy communication, weak implementation, or student-side information deficits cannot be determined from the supplied corpus.
- Whether the workload trade-off generalizes beyond the five interviewed instructors is unknown.
- Whether the structured-prompting effect on outline revisions is causal, correlational, or instructor-driven cannot be determined without a comparison group or a validated writing-improvement measure.

---

## Self-Gate (Standalone)

- Every visible citation carries a `<!--ref:slug-->` marker: **pass** (refs: SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04, BENCHMARK-MANUSCRIPT).
- Every visible citation carries an anchor with `<kind>` ≠ `none`: **pass** (anchors are source IDs and source-ID / quote-string tuples derived from the supplied summaries; no external locator invented).
- Claim-intent manifest present before prose: **pass** (see `work/research/synthesis_report.md`, section "Claim Intent Manifests").

## Quality Checklist

- APA 7.0 form: applied to title page, headers, references.
- Every factual claim has at least one citation: yes (each claim cites at least one `SYN-*` source or the partial manuscript).
- Abstract reflects report content: yes.
- References match in-text citations: yes.
- Word count: ~890 (within short-form envelope).
- AI disclosure: present.
- Revision log: not applicable (no review feedback supplied).
- No fabricated citations or sources: confirmed.
- Material gaps marked, not filled from memory: confirmed (no `[MATERIAL GAP]` markers were needed; all claims traceable to the corpus).

## Rules Followed

- Short-form mode used (bounded-synthesis RQ).
- No full empirical sections invented.
- No external literature added.
- No parametric knowledge used for factual claims.
- No editorial review, revision-round management, or final formatting performed in this node.
- No audit-passed state claimed.
