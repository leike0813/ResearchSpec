# Synthetic Synthesis: Source-to-Claim Check

> TEST FIXTURE — NOT A REAL SYNTHESIS
>
> Companion to `partial-manuscript.md` and `sources.yaml`. All sources are
> synthetic (`synthetic: true`); do not propagate as real citations.

## Scope

Cross-check each claim or implicit assertion in the working draft against the
four synthetic sources in `benchmark/sources.yaml`. Mark support level, record
the limits, and flag any draft statement the supplied evidence cannot ground.

## Claim Inventory

The draft has two tagged claims (`CLM-01`, `CLM-02`) plus several untagged
assertions in the Introduction and Preliminary findings paragraphs. Each row
below pairs the assertion with the strongest source the corpus offers.

| ID    | Draft assertion (paraphrased)                                        | Best source       | Support   | Key limit carried into the draft                                                                 |
| ----- | -------------------------------------------------------------------- | ----------------- | --------- | ----------------------------------------------------------------------------------------------- |
| CLM-01 | Structured AI prompting coincided with more visible outline revisions | SYN-CLASSROOM-01  | partial   | One course, six weeks, instructor-supplied prompts, no comparison group, no validated measure   |
| CLM-02 | Generative AI reduces instructor workload                            | SYN-INTERVIEW-02  | none      | Self-reported, small convenience sample, no time logs; draft text already flags this as unsupported |
| A1    | Faster formative feedback is plausible                               | SYN-INTERVIEW-02  | weak      | Self-report, no comparison group, no time logs                                                  |
| A2    | Verification work may offset speed gains                             | SYN-INTERVIEW-02  | partial   | Same interview summary; offset is a qualitative judgement by interviewees                        |
| A3    | Students value rapid feedback                                        | SYN-SURVEY-03     | partial   | 84 voluntary responses, attitudes not behaviour, policy changed mid-collection                  |
| A4    | Students are uncertain about permitted use and attribution           | SYN-SURVEY-03     | partial   | Same survey limits; "some reported" is the strongest phrasing the data supports                 |
| A5    | Course-level disclosure is required, acceptable assistance is not    | SYN-POLICY-04     | supported | Single synthetic policy; implementation quality not observed                                    |
| A6    | Final rubric scores varied widely                                    | SYN-CLASSROOM-01  | partial   | "Varied widely" is a qualitative reading of an unreported distribution                            |

## Findings

- **CLM-01 is supportable only as a coincident observation.** The source says
  students using structured prompts produced more outline revisions; it does
  not establish that prompting caused the revisions or that revisions indicate
  improvement. Draft wording "coincided with" matches this ceiling.
- **CLM-02 should not appear in the manuscript.** The interview summary reports
  faster feedback plus extra verification work — a net effect the data do not
  resolve. The draft already labels the stronger statement as unsupported;
  keep that labelling and avoid paraphrasing it as a finding.
- **A1 / A2 must be hedged together.** Both rest on the same five-instructor
  interview. Stating one without the other misrepresents the source.
- **A3 / A4 share the same survey and the same limits.** Any quantitative
  language (proportions, effect sizes) would exceed the source. Stay
  qualitative ("respondents valued", "some reported").
- **A5 is the cleanest support, but institutional reach is one synthetic
  policy.** Treat it as illustrative, not representative.
- **A6 overstates the source.** SYN-CLASSROOM-01 says scores "varied widely"
  without a distribution; the draft should preserve the qualitative hedge.

## Evidence Limits Carried Forward

- No comparison or control group across any source.
- No validated measure of writing improvement, time on task, or learning
  gain.
- All instructor claims are self-reported; all student claims are
  self-reported attitudes, not observed behaviour.
- Policy source is single-institution and does not show implementation
  quality.
- Local policy changed during survey data collection (SYN-SURVEY-03),
  which weakens any cross-time comparison inside that source.

## Recommended Draft Adjustments

1. Keep the existing hedge on CLM-02; do not promote it to a finding.
2. In the same paragraph, pair any speed claim (A1) with the verification
   offset (A2) and cite the same source.
3. Replace any unattributed survey phrasing with "respondents" or "some
   respondents" rather than "students" generally.
4. Treat the policy excerpt as one institution's text, not as evidence of
   sector practice.
5. Note explicitly that "more outline revisions" was observed in one
   course with instructor-supplied prompts and is not an effect claim.

## Missing Coverage

The supplied corpus does not contain evidence for any of the draft's missing
sections. Adding them will require either additional synthetic sources or
deferred authoring:

- Methods and evidence-selection criteria.
- Discussion of cross-institutional policy variation.
- Alternative explanations for the observed outline-revision pattern
  (prompt design, instructor feedback, novelty effect).
- A conclusion calibrated to the evidence ceiling above.
