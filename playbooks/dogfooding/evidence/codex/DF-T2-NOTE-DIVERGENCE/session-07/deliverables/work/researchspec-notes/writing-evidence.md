# Writing-evidence synthesis

- Goal: Map claims in `benchmark/partial-manuscript.md` to evidence in `benchmark/sources.yaml`, flag gaps and limits, and surface the next concrete edit.
- Inputs: `benchmark/partial-manuscript.md`, `benchmark/sources.yaml`. All four sources are synthetic test material (`synthetic: true`); no external publication has been verified.
- Related run: none.

## Claim-by-claim check

| Draft claim | Backing source | Match | Notes |
|---|---|---|---|
| "Structured prompting coincided with more visible outline revisions in one introductory course" (`CLM-01`) | SYN-CLASSROOM-01 | Direct: same scope (one first-year writing course, six weeks) and same finding (structured AI prompts → more outline revisions). | Source also reports widely varying final rubric scores, which the draft does not carry. Limits travel with the claim: no comparison group, no validated measure of writing improvement, instructor supplied all prompts. |
| "Faster feedback may be offset by verification work" (unlabeled sentence) | SYN-INTERVIEW-02 | Direct: finding matches the trade-off exactly. | Source is self-reported (n=5, one institution, no time logs). The "may be offset" wording in the draft is appropriately hedged. |
| "Generative AI reduces workload" (`CLM-02`) | None; contradicted by SYN-INTERVIEW-02 | Draft correctly marks this as unsupported. | SYN-INTERVIEW-02 reports additional verification time, not reduction. No supplied source supports a workload-reduction effect. |

## Source coverage gaps in the draft

Two sources are not yet represented and correspond to the draft's listed "Missing sections":

- SYN-SURVEY-03 (n=84, voluntary) records that respondents valued rapid feedback but reported uncertainty about permitted use and attribution; the local policy changed during data collection, so attitudes do not reflect any single policy regime. It is the only available evidence for student-side uncertainty about authorship and disclosure, and it supports the missing "Discussion of policy variation."
- SYN-POLICY-04 (one synthetic university) requires course-level disclosure while leaving the definition of acceptable assistance to instructors. The text alone does not show implementation quality and is not generalizable across institutions. It is the only available policy evidence.

A third gap sits inside the claim the draft does carry: SYN-CLASSROOM-01's "final rubric scores varied widely" finding is dropped on the way into the manuscript.

## Cross-source observations

- The manuscript's claim labels (`CLM-01`, `CLM-02`) do not correspond to source IDs (`SYN-*`). A reader cannot trace a claim back to evidence without reconstructing the mapping. The draft would benefit from replacing these labels with explicit source citations.
- Two sources describe process or self-report outcomes only (SYN-CLASSROOM-01 process; SYN-INTERVIEW-02 self-report). None of the four measures actual learning gains, time on task, or integrity outcomes, so any claim in those areas is unsupported by the supplied evidence.
- SYN-POLICY-04 and SYN-SURVEY-03 together describe an attribution-disclosure gap (policy mandates disclosure while students remain uncertain what counts as acceptable assistance) that is not visible in the current draft.

## Evidence limits to carry forward

- SYN-CLASSROOM-01: no comparison group; no validated writing-improvement measure; instructor supplied all prompts.
- SYN-INTERVIEW-02: self-reported workload; n=5 convenience sample; no time logs.
- SYN-SURVEY-03: voluntary response bias; attitudes rather than behavior; local policy changed during data collection.
- SYN-POLICY-04: policy text only; single synthetic institution; not generalizable.

## Suggested next edits to the draft

1. Replace `CLM-01` with an inline `SYN-CLASSROOM-01` citation, and add the rubric-score variance from the same source.
2. Replace `CLM-02` with a sentence that cites SYN-INTERVIEW-02 and records the verification-work trade-off instead of a workload-reduction claim.
3. Add a "Policy variation and student uncertainty" paragraph citing SYN-POLICY-04 and SYN-SURVEY-03, noting the voluntary-response and policy-change limits.
4. Keep the conclusion calibrated to the supplied evidence; do not generalize beyond one course, one institution, n=5 interviews, and n=84 survey responses.

## Next step

Hand the four edits above back to the manuscript author. No graph run is required for this task; the verification is standalone and the file above is the deliverable.
