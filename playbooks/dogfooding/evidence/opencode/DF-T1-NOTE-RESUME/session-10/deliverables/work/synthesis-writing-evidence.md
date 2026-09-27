# Evidence Synthesis: Draft Claims vs. Synthetic Sources

> Test fixture output. All sources are `SYN-*` synthetic summaries; no external publication has been verified. This file does not introduce new evidence and does not modify the manuscript.

## Scope

This synthesis checks the claims currently present in `benchmark/partial-manuscript.md` against the source summaries in `benchmark/sources.yaml`. It does not propose a research question, target venue, or research design; per `benchmark/goal.md`, those remain to be decided by the user. No Gate, Decision, or graph run is recorded. No claim is upgraded in strength.

Stable specs under `researchspec/specs/` were checked deterministically (`researchspec check specs --json` → `ok: true`, no diagnostics). The claims and sources scaffolds are empty, so every current claim–source mapping lives only in the benchmark fixtures cited above.

## Observation / Interpretation / Unknown Convention

- **Observation** — a sentence that is directly supported by the finding text of a `SYN-*` source.
- **Interpretation** — a sentence that combines, qualifies, or generalises beyond what a single `SYN-*` source finding states.
- **Unknown** — a sentence for which no `SYN-*` source provides direct support, or for which the supplied evidence is insufficient to draw the stated conclusion.

## Claim-by-Claim Audit

### Claim CLM-01 — "Structured prompting coincided with more visible outline revisions in one introductory course"

- **Source link**: SYN-CLASSROOM-01 (`benchmark/sources.yaml:4-11`).
- **Observation**: SYN-CLASSROOM-01 reports that "students using structured AI prompts produced more outline revisions, while final rubric scores varied widely" in one first-year writing course over six weeks.
- **Interpretation in draft**: The draft sentence adds "coincided with more visible outline revisions" and scopes the claim to one introductory course. This stays inside the source's scope and does not generalise beyond it.
- **Limits that must travel with the claim** (per SYN-CLASSROOM-01): no comparison group, no validated writing-improvement measure, instructor supplied all prompts. The "more revisions" wording is therefore a process-level observation, not an outcome claim.
- **Unknown**: whether the revised outlines translated into quality improvement, since rubric scores varied widely.
- **Verdict**: SUPPORTED as a scoped, process-level observation in this single course. Downstream quality or causal claims would exceed the evidence.

### Implicit claim — "Faster feedback may be offset by verification work"

- **Source link**: SYN-INTERVIEW-02 (`benchmark/sources.yaml:12-19`). No explicit claim ID; the draft sentence does not name a source inline.
- **Observation**: Five instructors at one institution "reported faster formative feedback but additional time spent checking unsupported claims."
- **Interpretation in draft**: "Faster feedback may be offset by verification work" is a hedged restatement of the source finding.
- **Limits that must travel with the claim**: self-reported workload, small convenience sample, no time logs. The offset is a perceived trade-off, not a measured net change.
- **Unknown**: the magnitude or sign of the net-workload effect; whether the verification work scales linearly with class size or assignment type.
- **Verdict**: SUPPORTED as a hedged interpretation of one self-reported interview set; insufficient for any aggregate workload statement.

### Claim CLM-02 — "Generative AI reduces workload"

- **Source link**: none; the draft itself notes the claim is not supported by the supplied evidence.
- **Observation**: No `SYN-*` source reports a workload reduction. SYN-INTERVIEW-02 reports a perceived speed gain paired with additional verification work. SYN-CLASSROOM-01 and SYN-SURVEY-03 do not address workload.
- **Limits**: The four sources contain no time-logged or controlled comparison that could ground a reduction claim.
- **Unknown**: net workload change under controlled conditions; variation across course levels, class sizes, or assignment types.
- **Verdict**: UNSUPPORTED. CLM-02 should be removed or rephrased as a hedged open question, not stated as a finding.

### Introductory framing — "instructors and students negotiate new expectations for feedback, authorship, and disclosure"

- **Source link**: SYN-SURVEY-03 (`benchmark/sources.yaml:20-27`, permitted-use and attribution uncertainty) and SYN-POLICY-04 (`benchmark/sources.yaml:28-33`, course-level disclosure required, acceptable assistance left to instructors).
- **Observation**: SYN-SURVEY-03 reports student uncertainty about permitted use and attribution; SYN-POLICY-04 reports that disclosure is mandated but acceptable assistance is delegated to instructors.
- **Interpretation in draft**: The framing joins two different evidence types (student attitudes + a policy excerpt) into a single claim about negotiation. The convergence is plausible but the synthesis step is not visible in the source findings.
- **Limits**: attitudes ≠ observed behaviour (SYN-SURVEY-03); one policy is not generalisable (SYN-POLICY-04).
- **Unknown**: whether instructors' actual classroom practices align with either the policy text or the student perceptions.
- **Verdict**: WEAKLY SUPPORTED as a hedged framing. The convergence of attitudes and policy text is suggestive but should not be presented as evidence of how negotiation actually unfolds.

### Methodological self-description

- "This paper examines a small synthetic evidence set to identify useful hypotheses and design constraints rather than general causal effects." — methodological self-statement, not an empirical claim; no source mapping required.

## Convergent vs. Divergent Evidence

- **Convergent** (two or more `SYN-*` sources point the same direction):
  - Feedback speed: SYN-INTERVIEW-02 (faster formative feedback) and SYN-SURVEY-03 (students value rapid feedback) agree on direction. Magnitude and quality are not measured.
  - Disclosure / permitted-use uncertainty: SYN-POLICY-04 (instructor-discretion regime) and SYN-SURVEY-03 (student uncertainty) point to the same governance gap.
- **Divergent / Underdetermined**:
  - Workload: SYN-INTERVIEW-02 hints at an offsetting verification cost, but no source measures net change; CLM-02 as stated goes beyond the evidence.
  - Writing quality: SYN-CLASSROOM-01 reports varied rubric scores; no source supports an overall improvement or decline claim.

## Gaps in the Supplied Evidence

- No comparison group, no effect size, no time logs, no implementation-fidelity check for the policy.
- No claim about academic-integrity outcomes (detection, sanctions, disclosure compliance) is supported.
- No claim about cross-institutional variation is supported.
- No source addresses student demographics, course level variation beyond "first-year," or long-term retention of any effect.

## Items That Require a User Decision Before Any Manuscript Edit

Per `benchmark/goal.md`, I do not change scope, claim strength, or design without user confirmation. The following decisions remain open:

1. **CLM-02** — drop, soften to an open question, or keep the author's existing "not supported" disclaimer.
2. **Generalisation language** — any phrasing that implies causal or cross-institutional effects must be removed or qualified, because no `SYN-*` source supports it.
3. **Intro framing** — whether to keep "negotiate new expectations" (currently a weakly supported synthesis) or replace with the narrower, directly sourced statements (attitudes + policy text).
4. **Missing sections** listed in the draft (methods, policy variation, alternative explanations, calibrated conclusion) — whether to draft each section now or hold until a research question is set.

## Recommendation

The draft's empirical core — CLM-01 and the faster-feedback-with-verification hedged claim — is supportable as scoped, hedged observations. CLM-02 must be rewritten or removed. The intro framing should be tightened to the two directly observable points (attitudes + policy text). No further claims should be added without new source evidence.

## Status Notes

- Deterministic specs check passed (`researchspec check specs --json`, no diagnostics).
- No Gate recommendation is recorded; the verify companion does not record a human verdict, and none was sought in this continuation session.
- No workflow state, run, node, or handoff was created or modified. `researchspec/` was treated as read-only.