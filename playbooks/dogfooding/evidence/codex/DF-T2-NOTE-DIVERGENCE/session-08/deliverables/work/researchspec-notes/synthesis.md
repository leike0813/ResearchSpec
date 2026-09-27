# Synthesis: Draft Claims vs. Synthetic Sources

Scope: cross-check benchmark/partial-manuscript.md against benchmark/sources.yaml.
Inputs are dogfooding fixtures - SYN-* IDs are synthetic and must not be cited as real publications.

## Headline findings

1. Source-ID mismatch in the draft. The manuscript cites CLM-01 and CLM-02, but the supplied sources use SYN-CLASSROOM-01 and SYN-INTERVIEW-02. Either the draft needs editing or a short provenance note explaining the abbreviations. This is the only editorial defect found.
2. The two positive claims in the "Preliminary findings" section are supported by the supplied sources, but each is hedged at the level the evidence allows. The draft does not over-claim.
3. The draft's own self-flag - that a strong "AI reduces workload" statement is not supported - is correct. No SYN-* source supports a net workload reduction.
4. Two sources are not used in the draft: SYN-SURVEY-03 (student attitudes and policy uncertainty) and SYN-POLICY-04 (institutional disclosure rules). Both are directly relevant to the "Missing sections" list and should be added before the draft matures.

## Claim-by-claim mapping

| Draft claim | Source(s) | Support level | Notes |
|---|---|---|---|
| Structured prompting coincided with more visible outline revisions in one introductory course | SYN-CLASSROOM-01 | Supported as observed coincidence | Limits in the source (no comparison group, instructor-supplied prompts, no validated writing-quality measure) justify the hedged wording. Adding the source's "final rubric scores varied widely" caveat would tighten the claim. |
| Faster formative feedback may be offset by verification work | SYN-INTERVIEW-02 | Supported as self-report | Limits (self-reported workload, n=5 convenience sample, no time logs) justify "may be offset" rather than "is offset." |
| Stronger statement that generative AI reduces workload is not supported | None | Correctly flagged in draft | The interview source describes *additional* verification time; the survey source describes *uncertainty* rather than time savings. No source supplies a measured net workload change. |

## Sources the draft should also use

- SYN-SURVEY-03 - 84 voluntary respondents valued rapid feedback but reported uncertainty about permitted use and attribution. Useful for the "policy variation" and "alternative explanations" missing sections, and for the conclusion: attitudes, not behaviour.
- SYN-POLICY-04 - course-level disclosure required, but acceptable assistance is left to instructors. Directly supplies the policy-variation discussion the draft already lists as missing.

## Recommended edits to the draft

- Replace CLM-01 and CLM-02 with the full SYN-CLASSROOM-01 / SYN-INTERVIEW-02 IDs, or add a one-line abbreviations note.
- Under the first finding, append the source's "final rubric scores varied widely" caveat. This keeps the claim honest without weakening it.
- Under the second finding, optionally attribute the offset to "instructors reported" rather than to AI itself, matching the source.
- Add a short paragraph citing SYN-POLICY-04 and SYN-SURVEY-03 for the "Discussion of policy variation" section.
- State explicitly in the conclusion that no causal claim is being made and that the evidence base is one course, five instructors, and 84 student respondents at a single institution.

## What this synthesis does not do

- Does not promote the draft into a graph run or formal gate. The continuation note ("Related run: none") and the project entry indicate ordinary sustained work.
- Does not fabricate effect sizes, citations, or participants.
- Does not address real-world literature. All SYN-* sources are fixtures and must remain labelled as such.

