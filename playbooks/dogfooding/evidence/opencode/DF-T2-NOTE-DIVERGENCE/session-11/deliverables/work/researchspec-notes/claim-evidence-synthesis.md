# Claim–Evidence Synthesis (ordinary research note, no graph run)

This note maps the claims already on the page in `benchmark/partial-manuscript.md` against the four sources in `benchmark/sources.yaml`. It introduces no new claims and proposes no causal language. Everything here works under the constraint from `benchmark/goal.md` that the four sources are synthetic fixtures, so no participants, effect sizes, citations, or ethics details may be invented.

## What the existing claims can and cannot lean on

**CLM-01 — "structured prompting coincided with more visible outline revisions in one introductory course."** SYN-CLASSROOM-01 carries this as far as "students using structured AI prompts produced more outline revisions," and only within one first-year course over six weeks. The source itself flags a missing comparison group, no validated writing-quality measure, and that the instructor supplied every prompt. The cautious verb "coincided with" is therefore the right call; "produced" or "improved" would over-read the source. The source also notes that "final rubric scores varied widely," a detail the draft does not yet mention. That detail is worth keeping in reserve for the missing Discussion section, where it argues directly against any implicit claim of consistent gains.

**CLM-02 — "generative AI reduces workload."** The draft already rejects it. SYN-INTERVIEW-02 contradicts it: instructors reported faster formative feedback but also additional time spent checking unsupported claims, with five instructors at one institution, self-report, and no time logs. The rejection of CLM-02 is correct, and SYN-INTERVIEW-02 is the source to anchor it. "May be offset by verification work" is the strongest wording the source allows.

**Implicit framing claim — students and instructors are negotiating new expectations for feedback, authorship, and disclosure.** The Introduction states this without a citation. SYN-SURVEY-03 covers the student half (84 voluntary respondents valuing rapid feedback, with uncertainty about permitted use and attribution), and SYN-POLICY-04 covers the institutional half (course-level disclosure required, but acceptable assistance left to instructors). Both have limits — voluntary response bias, attitudes rather than behavior, policy changes during data collection, and a single non-generalizable policy excerpt — so at most a single sentence in the Introduction is what they can carry. The open question of whether to cite them at all there is listed below.

## Material in the corpus that is not yet on the page

- SYN-SURVEY-03, student-side perception: not cited anywhere in the draft. Its limits (voluntary response bias, attitudes not behavior, local policy changed during data collection) are exactly the kind of nuance a Discussion section should carry rather than the Introduction.
- SYN-POLICY-04, institutional policy: a single synthetic excerpt. It can support the policy paragraph the draft's "Missing sections" list anticipates, but it cannot, on its own, support a claim about variation across institutions — there is only one institution represented here.

## What the missing sections could responsibly say with this corpus

- **Methods and evidence-selection limitations.** Four synthetic sources; no comparison condition; no validated writing-quality measure; no time logs; one institution for interviews and policy; six weeks for the classroom observation. Any wording stronger than "consistent with" or "may" would exceed the corpus.
- **Discussion of policy variation.** Cannot be written as a study of variation from a single policy excerpt. The honest move is to describe what SYN-POLICY-04 says and explicitly flag the single-institution limitation; generalization is not available with this corpus.
- **Alternative explanations.** The "coincided with" wording already invites alternative readings (instructor prompting skill, novelty effect, small sample). SYN-CLASSROOM-01 and SYN-INTERVIEW-02 both list alternative explanations inside their own limits.
- **Conclusion calibrated to evidence.** Useful for hypothesis generation and design constraints, not for causal inference. The draft's Introduction already gestures at this framing.

## Open questions for you before any claim gets stronger

1. Should the student-perception material (SYN-SURVEY-03) be added to the Introduction's "students negotiate expectations" sentence? It is the only student-voice source in the corpus.
2. Should SYN-POLICY-04 be cited at all, given it represents one institution? The current draft flags "Discussion of policy variation" as a missing section; this corpus cannot fill that gap, and citing the one policy excerpt risks giving a misleading impression of breadth.
3. Is real evidence beyond this benchmark intended? If yes, the "synthetic" framing on the page will need to change, and `benchmark/goal.md` flags that as a scope change requiring your decision.

## Status

No new claims introduced. Existing wording in `benchmark/partial-manuscript.md` is consistent with what the four sources allow. No participants, effect sizes, citations, or ethics approvals invented. No graph run started; this is an ordinary research note in line with `AGENTS.md`.