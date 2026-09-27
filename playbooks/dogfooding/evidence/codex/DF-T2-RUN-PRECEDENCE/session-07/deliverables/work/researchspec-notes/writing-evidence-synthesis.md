# Evidence Synthesis: Generative AI in University Writing Instruction

> Synthesizes how the supplied sources bear on the draft claims in `benchmark/partial-manuscript.md`.
> All sources are synthetic test material (`SYN-*`); no external publication is verified.

## Claim <-> evidence map

### CLM-01 - Structured prompting coincided with more visible outline revisions in one introductory course

- Supported by: `SYN-CLASSROOM-01` (kind: classroom observation; scope: one first-year writing course, six weeks).
- Direction: Direct match. The source's finding ("Students using structured AI prompts produced more outline revisions") matches the claim verbatim in scope and direction.
- Limits to report: no comparison group; no validated writing-improvement measure; instructor supplied all prompts, so the prompt condition is confounded with instructor mediation. Final rubric scores "varied widely" — the outline-revision signal does not translate to an outcome claim.

Verdict: supportable **as an observational, single-course signal only**. Do not generalize beyond the one course or conflate outline revisions with writing quality.

### CLM-02 - The stronger statement that generative AI reduces instructor workload is not supported

- Supported by: `SYN-INTERVIEW-02` (kind: instructor interview; scope: five instructors, one institution, self-reported).
- Direction: Inverts the strong claim. Instructors reported faster formative feedback **plus additional time spent checking unsupported claims**. Net workload is ambiguous, not reduced.
- No support for reduction from: `SYN-SURVEY-03` (student attitudes, no workload measure), `SYN-POLICY-04` (policy text, no workload data), `SYN-CLASSROOM-01` (student-side revisions, not instructor workload).
- Limits to report: self-reported, convenience sample of five, no time logs. "Additional verification time" is qualitative; no magnitude or net direction can be claimed.

Verdict: the negative claim (workload reduction unsupported) **is itself supported**. The draft's caution is correct; the stronger positive claim should remain out of the manuscript.

## Additional source signals relevant to the draft's open sections

These are not draft claims yet, but the sources bear on the missing sections listed in the partial manuscript and should be carried into the rewrite rather than dropped.

- **Policy variation (planned section).** `SYN-POLICY-04` shows disclosure is mandated at course level while acceptable assistance is delegated to instructors — i.e., policy variation is by design, not by accident. Frame it as delegation, not as absence.
- **Authorship and disclosure (introduced in section 1).** `SYN-SURVEY-03` shows respondents valued rapid feedback but reported uncertainty about permitted use and attribution. Useful as the only student-voice signal on this point.
- **Alternative explanations.** `SYN-INTERVIEW-02`'s "additional verification work" is an alternative explanation for any perceived speed gain; treat the gain as conditional, not as a clean efficiency result.

## Evidence limits (carry into the rewrite)

- All four sources come from one institution or one course; cross-institutional generalization is not licensed.
- Three of four are self-report or convenience samples; behavioral verification is absent.
- Local policy changed during `SYN-SURVEY-03` collection — reported attitudes are time-bound.
- No source measures outcomes (writing quality, learning gains, rubric performance) with a validated instrument. The draft must not introduce outcome claims the sources do not support.

## Recommendation for the draft

1. Keep CLM-01 framed as a single-course observational signal with the three source limits attached.
2. Keep CLM-02's negative verdict; do not soften it into a qualified positive claim.
3. Add a short paragraph drawing on `SYN-SURVEY-03` for the student-uncertainty signal on disclosure.
4. Use `SYN-POLICY-04` to define the policy-variation section as instructor-level delegation rather than institutional absence.
5. Treat "additional verification work" from `SYN-INTERVIEW-02` as the explicit alternative explanation for any feedback-speed claim.

---
**Inputs used:** `benchmark/sources.yaml`, `benchmark/partial-manuscript.md`.
**Claim IDs:** CLM-01, CLM-02 (as used in the draft).
**Source IDs:** SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04.
