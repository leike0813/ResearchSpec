# Revised Discussion — Synthetic Partial Manuscript

> TEST FIXTURE — NOT A REAL MANUSCRIPT. Companion revision to `benchmark/partial-manuscript.md`. Evidence IDs (`SYN-*`) and claim IDs (`CLM-*`) follow the supplied fixtures.

## Discussion

The preliminary findings rest on a narrow evidence set: one six-week classroom observation, five instructor interviews, eighty-four voluntary student responses, and one synthetic institutional policy. Each source carries limits that the discussion must keep visible rather than smooth over. The discussion below treats the supplied evidence as evidence, marks what it cannot support, and names alternative explanations that the data cannot rule out.

### What the classroom observation can and cannot tell us

`SYN-CLASSROOM-01` recorded more visible outline revisions among students who used structured AI prompts in a single first-year writing course over six weeks. That pattern is consistent with the hypothesis that structured prompting changes how students engage with drafting. The observation, however, has no comparison group, no validated writing-quality measure, and the same instructor authored the prompts and graded the work. Claim `CLM-01` is therefore correctly labeled *tentative* in `claims.yaml`. The revision activity is not equivalent to improvement in writing, and the manuscript should not let one stand in for the other.

### Why the workload claim remains unsupported as written

`SYN-INTERVIEW-02` reports faster formative feedback alongside new time spent checking unsupported claims. The sample is small, self-selected, and unlogged. Net workload—time saved on feedback minus time added to verification—cannot be derived from the interviews. The draft phrasing that "generative AI reduces instructor workload" (`CLM-02`) is therefore *unsupported_as_written*. We retain the claim in the manuscript instead of deleting it, because the substitution effect between saved feedback time and added verification work is the central open question for instructor adoption. Re-labeling the claim as "shifts the shape of instructor work" matches what the interviews actually show.

### Disclosure clarity as a hypothesis, not as a finding

Student respondents (`SYN-SURVEY-03`) valued rapid feedback and reported uncertainty about permitted use and attribution. The synthetic policy (`SYN-POLICY-04`) mandates course-level disclosure but leaves acceptable assistance to individual instructors. Taken together, these sources suggest, but do not test, a relationship between policy clarity and student uncertainty (`CLM-03`). The claim stays *hypothesis_only*: the supplied materials place a survey and a policy side by side, not a comparison between clearer and less clear policies.

### Policy variation as a confound

The supplied policy text differs from what survey respondents appear to have experienced, and institutional policies on disclosure, acceptable assistance, and authorship vary enough that a finding from one course may not transfer. Three sources of variation matter here: who defines acceptable assistance, whether the policy changed during data collection (`SYN-SURVEY-03` notes this explicitly), and how instructors enforce disclosure locally. Differences in student uncertainty could plausibly reflect any of these rather than the underlying effect of generative AI itself.

### Alternative explanations to flag

Several factors beyond the AI tool could plausibly account for the observed patterns, and the discussion should name them rather than ignore them:

- The instructor who wrote the prompts also graded the work (`SYN-CLASSROOM-01`), so prompt style and grading expectations are confounded.
- The student survey used voluntary responses while local policy was changing (`SYN-SURVEY-03`), which opens both selection and context effects.
- Six weeks is short relative to a typical writing course sequence, so novelty effects cannot be separated from durable ones.
- Instructor interviews are self-reported without time logs (`SYN-INTERVIEW-02`), so workload claims rest on perception rather than measurement.

These alternatives do not refute the preliminary findings. They narrow the conditions under which the findings can be expected to generalize and tell future work what to control.

### Conclusion calibrated to the evidence

The supplied materials justify three limited statements: structured prompting coincided with more visible outline revision in one course; instructor work shifted in shape rather than shrank in volume; and student uncertainty about acceptable AI use appeared alongside, not as a consequence of, policy clarity. They do not justify causal claims about writing quality, net instructor workload, or the effect of disclosure guidance. Future work should add a comparison condition, measure revision behavior and writing quality separately, log instructor time, and contrast policies rather than survey within a single one.