# Synthetic Partial Manuscript (Revised)

> TEST FIXTURE — NOT A REAL MANUSCRIPT
> 修订版对应 `partial-manuscript.md`；每节末括号内标记对应的审稿意见编号。

## Working title

Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits

## Introduction

Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations for feedback, authorship, and disclosure. This paper examines a small synthetic evidence set to identify useful hypotheses and design constraints rather than general causal effects. (— R7)

### Scope statement

This paper is restricted to four synthetic evidence sources (SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04) drawn from a single institution, a single first-year writing course, and a six-week window. We make no claim about other institutions, course levels, or timeframes, and we do not infer causal effects from observational summaries.

## Methods and evidence base

Four sources are supplied in `sources.yaml`. Each is summarised below with its scope and declared limits; no additional participants, effect sizes, or external citations are introduced. (— R1)

- **SYN-CLASSROOM-01** (classroom observation summary): one first-year writing course, six weeks. Structured AI prompts coincided with more outline revisions; final rubric scores varied widely. Limits: no comparison group, no validated measure of writing improvement, instructor supplied all prompts.
- **SYN-INTERVIEW-02** (instructor interview summary): five instructors at one institution. Instructors reported faster formative feedback but additional time spent checking unsupported claims. Limits: self-reported workload, small convenience sample, no time logs.
- **SYN-SURVEY-03** (student survey summary): 84 voluntary responses. Respondents valued rapid feedback; some reported uncertainty about permitted use and attribution. Limits: voluntary response bias, attitudes rather than observed behavior, local policy changed during data collection.
- **SYN-POLICY-04** (institutional policy excerpt): one synthetic university policy. Course-level disclosure rules are required, but acceptable assistance is left to instructors. Limits: policy text does not show implementation quality, not generalizable across institutions.

## Preliminary findings

1. Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`, support SYN-CLASSROOM-01; strength tentative). (— R5)
2. Instructor interview summaries describe both time savings and new verification work; no measured workload data were collected (`CLM-02`, support SYN-INTERVIEW-02; strength unsupported_as_written). (— R5)
3. Survey respondents reported uncertainty about permitted use and attribution alongside appreciation for rapid feedback (`CLM-03`, support SYN-SURVEY-03 + SYN-POLICY-04; strength hypothesis_only). (— R6)

## Alternative explanations

For each finding, the most plausible alternative explanations are listed below, grounded in the source-specific limits declared above. (— R3)

- **CLM-01**: The increase in outline revisions could reflect instructor prompting style rather than AI use; rubric variation suggests revision activity is not equivalent to writing quality (SYN-CLASSROOM-01).
- **CLM-02**: "Time savings" and "new verification work" are both self-reported recollections; the net workload effect is unobserved. Convenience sampling limits representativeness (SYN-INTERVIEW-02).
- **CLM-03**: Reported uncertainty may track concurrent local policy change, not stable student attitudes; the survey captured attitudes, not behaviour (SYN-SURVEY-03).

## Policy variation

SYN-POLICY-04 mandates course-level disclosure but delegates "acceptable assistance" to individual instructors. This implementation gap is consistent with the student-side uncertainty reported in SYN-SURVEY-03 but does not generalise to other institutions. Cross-institutional policy comparison is out of scope here. (— R2)

## Conclusion

This paper produces a small set of calibrated hypotheses and an explicit list of evidence-base limits, not causal findings. CLM-01 is tentative, CLM-02 is unsupported as written, and CLM-03 is a hypothesis for future work. We do not recommend institution-wide policy or workload claims on the basis of the supplied evidence. (— R4)

## Hypotheses for future work

- **H1 (CLM-03)**: Clearer disclosure guidance is associated with fewer student uncertainties about acceptable AI use. Testable with a pre/post policy-clarity comparison in a course that controls for instructor-level variation. (— R6)
- **H2**: Net instructor workload change can be measured with time logs before and after structured AI prompting, rather than retrospective self-report.
