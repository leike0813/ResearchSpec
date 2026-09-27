# Revised Manuscript

> TEST FIXTURE — NOT A REAL MANUSCRIPT
>
> 本稿按 `work/review-response.md` 中对 R1–R10 的回应逐条修改；不再联网，不补造参与者信息、效应量或引用。

## Working title

Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits

## Introduction

Universities are experimenting with generative AI in writing courses while instructors and students negotiate new expectations for feedback, authorship, and disclosure. This paper examines a small synthetic evidence set to identify useful hypotheses and design constraints rather than general causal effects. The findings below are deliberately scoped to the supplied evidence: a single first-year writing course (six weeks, no comparison group), five instructor interviews at one institution, 84 voluntary student survey responses, and one institutional policy excerpt. We separate observation, interpretation, and unresolved questions throughout.

## Methods and evidence-selection limitations

The evidence package consists of four synthetic materials provided by the project (`benchmark/sources.yaml`):

| source_id | kind | scope | limits |
|-----------|------|-------|--------|
| SYN-CLASSROOM-01 | classroom observation summary | one first-year writing course, six weeks | no comparison group; no validated writing-improvement measure; instructor supplied all prompts |
| SYN-INTERVIEW-02 | instructor interview summary | five instructors at one institution | self-reported workload; small convenience sample; no time logs |
| SYN-SURVEY-03 | student survey summary | 84 voluntary responses | voluntary response bias; attitudes rather than observed behavior; local policy changed during data collection |
| SYN-POLICY-04 | institutional policy excerpt | one synthetic university policy | policy text does not show implementation quality; not generalizable across institutions |

No additional sources were retrieved for this revision. Effects, sample sizes, and quotes outside the four materials above are not introduced. The claim-evidence mapping in Table 1 binds each working claim to one or more of the four sources and to the strength recorded in `benchmark/claims.yaml`.

### Evidence scope and provenance

Each source carries an explicit scope statement drawn directly from `sources.yaml`. Classroom observations cover six weeks of one course, not a semester or institution. Instructor interviews come from five instructors at the same institution, selected by convenience. Student responses were voluntary and attitudes-based, not behavioral. The policy text is one institution's text, not a cross-institutional comparison. Any claim in the manuscript that goes beyond these scope statements is flagged as such in the Discussion.

## Table 1. Claim–evidence mapping

| claim_id | wording | support | strength | limits |
|----------|---------|---------|----------|--------|
| CLM-01 | Structured use of generative AI may increase visible revision activity in some introductory writing contexts. | SYN-CLASSROOM-01 | tentative | single course; revision activity is not equivalent to writing quality |
| CLM-02 | Generative AI reduces instructor workload. | SYN-INTERVIEW-02 | unsupported as written | evidence reports both time savings and new verification work; no measured workload data |
| CLM-03 | Clear disclosure guidance is associated with fewer student uncertainties about acceptable AI use. | SYN-SURVEY-03; SYN-POLICY-04 | hypothesis only | supplied materials do not directly compare policy clarity with uncertainty |

## Preliminary findings

Structured prompting coincided with more visible outline revisions in one introductory course (`CLM-01`, Table 1). The observation is real but tentative: there was no comparison group, the instructor supplied every prompt, and revision activity is not a validated measure of writing improvement (`SYN-CLASSROOM-01`). Instructors reported faster formative feedback and additional time spent checking unsupported claims (`CLM-02`, `SYN-INTERVIEW-02`). The supplied evidence does not support a net-workload claim in either direction; both the savings and the verification work are self-reported. Student respondents valued rapid feedback; some reported uncertainty about permitted use and attribution (`SYN-SURVEY-03`). Whether clearer disclosure guidance reduces that uncertainty remains a hypothesis (`CLM-03`, hypothesis only): the policy text requires course-level disclosure but does not itself show how disclosure interacts with student behavior.

## Discussion

### Policy variation

`SYN-POLICY-04` requires course-level disclosure but leaves acceptable assistance to instructor judgment. This single policy does not show implementation quality, and the policy changed during the student survey window (`SYN-SURVEY-03`). Policy variation is therefore a likely moderator of student uncertainty, but this paper does not test it. We treat clearer disclosure guidance as a moderating variable to be measured in future work, not a conclusion supported by the current evidence (`CLM-03`, hypothesis only).

### Alternative explanations

Several non-causal explanations are consistent with the observations above and remain unresolved:

- Novelty effect. Students and instructors encountering structured AI prompts for the first time may revise more, or report more activity, regardless of any underlying effect on writing quality.
- Prompt design. All prompts in the observed course were supplied by the instructor (`SYN-CLASSROOM-01`); observed revision activity may track prompt design rather than generative AI per se.
- Course structure. A single first-year course has its own assignment sequence, feedback conventions, and cohort characteristics that the supplied evidence cannot disentangle from AI use.

These alternatives are not arguments against the observations; they are reasons to keep `CLM-01` at tentative strength and to avoid wording that implies causal effect.

### Disclosure as a moderating variable

`SYN-POLICY-04` and `SYN-SURVEY-03` together suggest that disclosure guidance and student uncertainty may be related, but the supplied materials do not directly compare policy clarity with student uncertainty. We therefore treat disclosure guidance as a moderating variable, not a finding. The manuscript makes no claim about which disclosure practice is best.

## Limitations

The evidence base is small, synthetic, and locally scoped: one course, five instructors, 84 voluntary student responses, one institution's policy text. Each source has documented limits in Table 1 and `sources.yaml`. The manuscript deliberately does not include effects, sample sizes, or quotes outside those four materials. The working claims remain at their recorded strengths (CLM-01 tentative; CLM-02 unsupported as written; CLM-03 hypothesis only) and are not promoted by the Discussion or Conclusion.

## Conclusion

Three claims, three strengths. `CLM-01` (tentative): structured prompting may coincide with more visible outline revisions in some introductory writing contexts; the observation needs a comparison course and a validated writing-quality measure before it can move beyond tentative. `CLM-02` (unsupported as written): the net effect of generative AI on instructor workload is not measured by the supplied evidence; both time savings and additional verification work appear in self-reports, and we do not resolve their direction here. `CLM-03` (hypothesis only): clearer disclosure guidance may be associated with fewer student uncertainties, but the supplied materials do not directly compare policy clarity with uncertainty, and the policy text changed during data collection.

The paper therefore contributes hypotheses and design constraints, not causal conclusions. Useful next steps implied by the evidence are: (a) a comparison course with structured and unstructured AI prompt conditions; (b) instructor time logs that separate feedback drafting from verification; (c) a study design that links specific disclosure rules to measured student uncertainty. Each of these is a test of an unresolved claim, not an extension of a finding.