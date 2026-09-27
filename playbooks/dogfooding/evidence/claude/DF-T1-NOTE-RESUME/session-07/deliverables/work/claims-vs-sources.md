# Claims × Sources Synthesis (synthetic fixture)

> TEST FIXTURE — NOT A REAL REVIEW
>
> Standalone synthesis for the synthetic benchmark on "generative AI in
> university writing instruction". All `SYN-*` and `CLM-*` IDs are scoped to
> this fixture; no external publication is cited or implied.

Inputs:
- `benchmark/goal.md`
- `benchmark/partial-manuscript.md`
- `benchmark/sources.yaml`

Method: For each claim already present in the working draft, list the
synthetic source(s) that bear on it, rate the strength, surface the limits
declared by the source itself, and flag any claims that the draft is missing
even though the supplied evidence supports them. Strength labels are
interpretive and reflect the evidence actually supplied — they are not
generalisations beyond the fixture.

## Claim inventory from the working draft

| ID | Claim (paraphrased) | Type | Sources touching it | Strength | Notes / declared limits |
|---|---|---|---|---|---|
| BKG-1 | Universities are experimenting with generative AI in writing courses; instructors and students negotiate feedback, authorship, and disclosure. | Background framing | SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04 (all four) | moderate | Composite of four single-institution snapshots; no cross-institution adoption rate is supplied. Acceptable as scene-setting; do not promote to a causal claim. |
| CLM-01 | "Structured prompting coincided with more visible outline revisions in one introductory course" (CLM-01 in the draft). | Process observation (correlation) | SYN-CLASSROOM-01 | weak–moderate | Single course, six weeks; instructor supplied all prompts; no comparison group; no validated measure of writing improvement; final rubric scores varied widely. Coincidence is the most the evidence supports. |
| CLM-02 | "Generative AI reduces workload" — explicitly flagged in the draft as not supported. | Causal claim | SYN-INTERVIEW-02 (mixed signal only) | unsupported (correctly flagged) | SYN-INTERVIEW-02 reports faster formative feedback **plus** additional time checking unsupported claims — net effect unknown. The draft's negative verdict is the only position the supplied evidence supports. |

## Claims the draft does not yet make but the supplied sources allow

These are not new claims; they are claims the evidence supports and that
would close the "Missing sections" list in `partial-manuscript.md` without
inventing material.

| ID | Claim supported by the fixture | Supporting source | Strength | Declared limits | Why the draft benefits |
|---|---|---|---|---|---|
| CLM-03 | Students valued rapid feedback and some reported uncertainty about permitted use and attribution. | SYN-SURVEY-03 | moderate | n=84, voluntary, attitudes not behaviour, local policy changed mid-collection. | Supplies the student-side counterpart to BKG-1 and frames the "authorship/disclosure" half of the negotiation mentioned in the introduction. |
| CLM-04 | Course-level disclosure is required institutionally, but acceptable assistance is delegated to instructors. | SYN-POLICY-04 | moderate (textual) | One synthetic policy; does not show implementation quality; not generalisable. | Lets the draft connect policy text to the negotiation in BKG-1 without overreaching beyond one institution. |
| CLM-05 | Instructors reported faster formative feedback but additional time spent checking unsupported claims. | SYN-INTERVIEW-02 | weak | Five instructors, one institution, self-reported, no time logs. | Softens CLM-02 away from a binary "workload claim" and gives the discussion section a concrete trade-off to discuss. |

## What this means for the draft

1. CLM-01 wording already matches what SYN-CLASSROOM-01 supports (coincidence,
   one course, instructor-supplied prompts). Keep the qualifier "coincided
   with"; do not promote it to "structured prompting caused…".
2. The draft's negative verdict on CLM-02 is the only position the supplied
   evidence supports. Do not soften it.
3. CLM-03, CLM-04, CLM-05 are sourced and would directly address three of the
   four "Missing sections" (policy variation, alternative explanations,
   conclusion calibrated to evidence). The draft is currently silent on them.
4. BKG-1 is fine as framing, but only if the four sources are read together
   as one institutional composite. A reader should not be led to believe any
   one source establishes cross-institutional adoption.
5. None of the supplied evidence supports a quantitative effect size,
   cross-institution comparison, or causal claim about student learning. The
   draft's missing "Methods and evidence-selection limitations" section must
   say so explicitly.

## Open questions / next steps

- The draft does not yet distinguish which of CLM-03/04/05 to foreground.
  Decide which of those belongs in "Preliminary findings" vs. "Discussion";
  the source strength (CLM-04 textual > CLM-03 moderate > CLM-05 weak) is
  one input, not a verdict.
- No external literature is needed and none should be added — this is a
  fixture-only check.
- No graph run is required: standalone synthesis is complete after this
  file is written.
