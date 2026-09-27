# TEST FIXTURE: ordinary research task note

- Goal: Summarize how the supplied synthetic sources bear on the draft's claims about generative AI in university writing instruction.
- Inputs: `benchmark/sources.yaml` and `benchmark/partial-manuscript.md`.
- Output so far: `benchmark/partial-manuscript.md` contains the working draft; `work/researchspec-notes/claim-synthesis.md` holds the claim-by-source alignment.
- Completed work: Cross-checked the Introduction context, CLM-01, the implicit "faster feedback vs. verification" claim, and CLM-02 against `benchmark/sources.yaml`. CLM-01 and the verification-tradeoff claim are supported within the source limits; CLM-02 remains unsupported (draft already flags this). Identified which missing sections the synthesis material can or cannot fill.
- Evidence limits: All sources are synthetic test material; no external publication has been verified. Strength, scope, and directionality of every claim is bounded by the limits listed in `benchmark/sources.yaml`.
- Open question: Whether to tighten CLM-01 wording, promote the verification trade-off to a separate claim, and whether to add an "alternative explanations" subsection — all need a user decision before any claim-strength change.
- Next step: Hand the synthesis back to the user for scope and claim-strength decisions before drafting the missing sections.
- Related run: none.