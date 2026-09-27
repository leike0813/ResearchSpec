claim_intent_manifests:
  - manifest_id: CIM-RPT-001
    node: report
    intended_claims:
      - "Across the supplied synthetic evidence set, the partial manuscript's CLM-01 (more visible outline revisions under structured AI prompting in one introductory course) is supported as a descriptive observation bounded by the absence of a comparison group."
      - "Across the supplied synthetic evidence set, the partial manuscript's CLM-02 (unqualified 'generative AI reduces instructor workload') is contradicted by the verification-overhead offset that the same instructor-side signal reports."
      - "Across the supplied synthetic evidence set, the disclosure-required / acceptable-assistance-delegated policy structure interacts with student-reported uncertainty and instructor-reported verification overhead to surface an integrity-friction pattern that none of the four sources individually establishes."
      - "Across the supplied synthetic evidence set, the closed evidence universe cannot yield effect sizes, causal-inference claims, or cross-institutional generalisations; claims that would require any of those are recorded as unsupported gaps."
    author_declared_must_not:
      - "Promote any SYN-* source ID to a real citation in any downstream research product."
      - "Fabricate participant counts, demographics, ethics approvals, transcript material, or effect sizes beyond what the supplied summaries already state."
      - "Treat this report as supporting any causal-inference claim about generative AI in university writing instruction."
    emission_status: draft
---

## Research Report

# Research Brief — Generative AI in University Writing Instruction: A Bounded Evidence Mapping Across Four Synthetic Source Summaries

**Date:** 2026-09-27
**Author / AI disclosure:** AI-assisted research pipeline (literature search, source verification, evidence synthesis, report drafting) with human oversight applied at every node.

> **Synthetic-fixture notice.** The evidence base for this report is the
> synthetic dogfooding corpus at `benchmark/sources.yaml`, consisting of
> four `SYN-*` source summaries. None of the entries corresponds to a
> real publication, real participants, real observation, or real ethics
> review. The report is structured to demonstrate the mapping method, not
> to assert conclusions about generative AI in any real institutional
> setting.

## Executive Summary

The RQ asks which observable claims about generative AI in university
writing instruction are supported, qualified, or contradicted across the
supplied synthetic evidence base. Mapping the four `SYN-*` source
summaries against the partial manuscript's claims yields three useful
patterns and a clear set of gaps. The partial manuscript's `CLM-01`
(more visible outline revisions under structured AI prompting in one
introductory course) `<!--ref:fixture:classroom-->` survives as a
descriptive observation bounded by the absence of a comparison group.
The earlier unqualified `CLM-02` (generative AI reduces workload) is
contradicted by the offsetting verification overhead reported by the
same instructor-side signal `<!--ref:fixture:interview-->`. A
disclosure-required / acceptable-assistance-delegated policy structure
`<!--ref:fixture:policy-->` co-occurs with student-reported uncertainty
about permitted use and attribution `<!--ref:fixture:survey-->` and
with the instructor verification workload `<!--ref:fixture:interview-->`,
producing an integrity-friction pattern that none of the four sources
establishes alone. Effect-size claims, causal-inference claims,
cross-institutional generalisations, and implementation-quality claims
are all unsupported by the closed evidence universe and are recorded as
named gaps rather than as conclusions.

## Background and Research Question

The broader conversation about generative AI in writing instruction has
two pressure points. First, AI tools appear to change the writing
process: structured prompting has been reported to produce more visible
outline revisions, and rapid AI-assisted feedback has been greeted
positively by students. Second, AI tools appear to change the
instructor's job: faster feedback may be offset by verification work,
and policy regimes that require disclosure but leave acceptability to
instructors leave room for inconsistent student experiences. The
partial manuscript
(`benchmark/partial-manuscript.md`) names the first pressure point as
`CLM-01` and rejects a too-strong version of the second as `CLM-02`.

The RQ carried into this report — "Across the supplied synthetic
evidence set, which observable claims about generative AI in university
writing instruction are supported, qualified, or contradicted, and what
design constraints does the evidence impose on any downstream
generalisation?" — is intentionally bounded. It works only from the
supplied four-source universe, refuses causal framing, and uses the
mapping primarily to surface design constraints rather than to assert
general claims.

## Key Findings

- **`CLM-01` (writing-process pattern) — supported, descriptive.** The
  partial manuscript's claim about more visible outline revisions under
  structured AI prompting in one introductory course is supported by
  the only supplied source that addresses the same theme
  `<!--ref:fixture:classroom-->`. The support is single-source; the
  claim remains descriptive and is bounded by the source's stated
  limits (no comparison group, no validated writing-improvement
  measure, instructor-supplied prompts).
- **`CLM-02` (instructor workload) — contradicted, in this form.** The
  unqualified claim that "generative AI reduces instructor workload" is
  contradicted by the offsetting verification overhead that the same
  instructor-interview summary reports
  `<!--ref:fixture:interview-->`. The pattern of perceived faster
  feedback and added verification work is consistent inside the
  source; aggregating them in one direction contradicts the source.
- **Cross-theme structural pattern — emerging, conditional.** The
  combination of disclosure-required policy structure
  `<!--ref:fixture:policy-->`, instructor verification overhead
  `<!--ref:fixture:interview-->`, and student-perceived uncertainty
  about permitted use `<!--ref:fixture:survey-->` describes pieces of
  the same social picture. The pattern is not a causal claim, but it is
  mutually consistent across the three sources and provides a place
  for the partial manuscript's missing "discussion of policy variation"
  to anchor itself.

## Analysis and Implications

Three implications follow from the mapping.

First, the partial manuscript's existing claims survive this pass with
one correction already noted in the partial-manuscript text: `CLM-02`
is rejected, and the manuscript correctly declines to publish the
stronger version. The mapping therefore does not require a substantive
re-write of the existing claims; it asks for them to be framed
inside the conditional pattern rather than as standalone observations.

Second, the missing sections named in the partial manuscript —
methods and evidence-selection limitations, discussion of policy
variation, explicit treatment of alternative explanations, conclusion
calibrated to the supplied evidence — can each be filled from the
mapping without exceeding the closed evidence universe. The methods
section can describe the structured-claim-mapping procedure used here
with the four sources as the closed population. The discussion of
policy variation can anchor on the
disclosure-required / acceptability-delegated pattern. The alternative-
explanations section can note that attitude-based evidence cannot be
promoted to behavioural evidence. The conclusion can be calibrated to
the supplied evidence without claiming effect sizes, causal inference,
or cross-institutional generalisation.

Third, several downstream design constraints are surfaced by the
mapping that the partial manuscript does not currently name:

- Comparison-group classroom observation would be needed before any
  version of `CLM-01` could be promoted to comparative language.
- Time-on-task measurement of instructor workload would be needed
  before any version of `CLM-02` could be promoted to a measured (rather
  than perceived) workload statement.
- Behavioural observation of student AI use (rather than attitude
  reporting) would be needed before any of the integrity-friction
  language could be promoted to a behavioural claim.
- Implementation-quality evidence for the disclosure-policy structure
  would be needed before any cross-institutional policy claim could be
  made.

## Limitations

- The evidence base is closed at four synthetic summaries. No external
  literature, no real publication, no DOI, no real participant data
  enters this report.
- Each supplied source is qualitative and bounded by the limits stated
  inline in `benchmark/sources.yaml`. No quantitative triangulation is
  available inside this report.
- The cross-paper tension inventory referenced in the synthesis report
  is a scoped advisory scan, not complete pairwise contradiction
  detection. A second reviewer working from the same four sources could
  record additional cross-pair assessments.
- The report's claim-strength language is bounded by the procedural
  rubric used in the synthesis. Any claim promoted beyond that
  rubric's classification must come from a separately authorised
  literature exercise.
- This is one pass; inter-rater adjudication across multiple
  synthesizers is out of scope for this run.
- The single-source support for `CLM-01` and the single-source
  perception-level support for `CLM-02` cannot, individually or
  jointly, support any causal-inference statement about generative AI
  in university writing instruction.

## References

> APA 7.0 normally requires real publications with authors, years,
> titles, venues, and DOIs. None of the four entries below carries a
> real publication profile. Each entry is recorded as a synthetic
> fixture citation solely so that downstream citation markers in the
> report remain auditable; the underlying fact is flagged as
> synthetic and must not be cited as if it were real.

- SYNTHETIC FIXTURE (NOT A REAL PUBLICATION). *Structured AI prompting
  in a first-year writing course: outline-revision signal over six
  weeks*. Synthetic Dogfooding Benchmark.
  <!--ref:fixture:classroom anchor:fixture_summary=Students using structured AI prompts produced more outline revisions, while final rubric scores varied widely (no comparison group, no validated writing-improvement measure, instructor-supplied prompts).-->
- SYNTHETIC FIXTURE (NOT A REAL PUBLICATION). *Reported feedback speed
  and verification overhead: five instructors at one institution*.
  Synthetic Dogfooding Benchmark.
  <!--ref:fixture:interview anchor:fixture_summary=Instructors reported faster formative feedback but additional time spent checking unsupported claims (self-reported workload, small convenience sample, no time logs).-->
- SYNTHETIC FIXTURE (NOT A REAL PUBLICATION). *Student-reported attitudes
  toward rapid feedback and disclosure uncertainty (n = 84, voluntary)*.
  Synthetic Dogfooding Benchmark.
  <!--ref:fixture:survey anchor:fixture_summary=Respondents valued rapid feedback; some reported uncertainty about permitted use and attribution (voluntary response bias, attitudes not behaviour, local policy changed during data collection).-->
- SYNTHETIC FIXTURE (NOT A REAL PUBLICATION). *Course-level disclosure
  requirement with instructor-level acceptable-assistance definitions*.
  Synthetic Dogfooding Benchmark.
  <!--ref:fixture:policy anchor:fixture_summary=Course-level disclosure rules are required, but acceptable assistance is left to instructors (policy text only, does not show implementation quality, not generalizable across institutions).-->

> Each reference slug above corresponds to a `source_id` in
> `benchmark/sources.yaml`. Each `anchor` field carries
> `kind=fixture_summary` and a verbatim quote drawn from the source's
> declared `finding` plus the synthesised annotation that captures the
> source's `limits` block. The quotes are intentionally short to keep
> them inspectable; longer structural anchors are outside this
> fixture's evidence surface.

### Word Count

The report body is intentionally short; the partial manuscript is the
target deliverable, and this brief is the research-side companion.
Word count of the body (Executive Summary through Limitations,
excluding the Synthetic-fixture notice and the References block) is
approximately 870 words. The Abstract required by Full-Mode reports is
omitted here under the Short-Form justification recorded in
`work/methodology_blueprint.md`.

### Revision Log

No review feedback was supplied to this compilation. The single-pass
output above should be treated as a research-side companion to the
partial manuscript, not as a submission-ready article.

### Unresolved Issues

- Whether the partial manuscript will adopt the cross-theme structural
  pattern in its discussion is a downstream decision for the lead
  author.
- Whether the `CLM-01` single-source support wording should be
  softened further pending a comparison-group observation is a
  downstream decision.
- Whether the policy-variation discussion should be sourced from
  `SYN-POLICY-04` alone or deferred until a multisite policy
  evidence base exists is a downstream decision.
- Whether `[MATERIAL GAP]` markers should appear inline wherever a
  downstream claim would require external evidence is a downstream
  decision; the report flags gaps in the Limitations and Analysis
  sections rather than inline.

---

**AI Disclosure:** This report was produced with AI-assisted research
tools. The research pipeline included AI-powered literature search,
source verification, evidence synthesis, and report drafting. All
findings were verified against the supplied synthetic source
summaries, and the synthesis self-gate was applied before the report
was emitted. Human oversight was applied at every node, with explicit
human gate verdicts recorded in the workflow state at the rq-gate,
the parent's research-gate, and downstream gates.
