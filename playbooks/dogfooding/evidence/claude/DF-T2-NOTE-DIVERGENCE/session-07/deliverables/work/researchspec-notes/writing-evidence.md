# Writing evidence synthesis (ordinary task)

## Goal
Cross-check the draft claims in `benchmark/partial-manuscript.md` against `benchmark/sources.yaml`. No formal Gate; ordinary note per `rules/researchspec.md`.

## Source → claim mapping

| Draft claim | Source(s) | Calibration |
|---|---|---|
| Structured prompting coincided with more visible outline revisions in one introductory course (CLM-01) | SYN-CLASSROOM-01 | One course, six weeks; no comparison group; no validated writing-improvement measure; instructor supplied all prompts |
| Final rubric scores varied widely | SYN-CLASSROOM-01 | Same scope limit as above; "widely" is supported but unquantified |
| Faster feedback may be offset by verification work | SYN-INTERVIEW-02 | n=5, convenience sample, self-reported; the "may" hedge is appropriate |
| "Generative AI reduces workload" (CLM-02) is not supported | (meta) | Confirmed. SYN-INTERVIEW-02 actually describes added verification overhead, the opposite of unconditional reduction. No source supports CLM-02 |

## Sources currently unused by the draft
- SYN-SURVEY-03 — student perspective: respondents valued rapid feedback, some reported uncertainty about permitted use and attribution. Fits the missing "alternative explanations" section.
- SYN-POLICY-04 — disclosure required at course level; acceptable assistance left to instructors. Directly fits the missing "policy variation" section.

## Calibration checks on the draft wording
- "coincided with" / "may be offset" / "not supported by the supplied evidence" — already appropriately hedged; keep as-is.
- CLM-02 self-flagged as unsupported — no edit needed.
- No draft sentence overstates what the corpus shows.

## Evidence limits to carry into prose
- Single institution, six-week observation window.
- Synthetic corpus — no external generalization.
- SYN-SURVEY-03 = attitudes, not behavior; voluntary response bias; local policy changed mid-collection.
- SYN-POLICY-04 = text, not implementation quality.
- SYN-INTERVIEW-02 = self-reported, no time logs.

## Suggested next move for the manuscript
- Add one policy-variation paragraph grounded in SYN-POLICY-04.
- Cite SYN-SURVEY-03 once when introducing the student side of permitted use / attribution uncertainty.
- Keep CLM-02 out of any headline claim; the draft's self-correction already matches the evidence.

## Open
None for the cross-check. Outstanding scope question (defer to user): whether to draft the missing sections now, or stop here.