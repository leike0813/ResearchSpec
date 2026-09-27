# Writing evidence — claim check for `benchmark/partial-manuscript.md`

- Goal: Summarize how the supplied synthetic sources bear on the draft's claims about generative AI in university writing instruction.
- Inputs available: `benchmark/partial-manuscript.md`, `benchmark/goal.md`. `benchmark/sources.yaml` was referenced by the previous note but does not exist in this workspace; `researchspec/specs/sources.yaml` and `researchspec/specs/claims.yaml` are both empty.
- Output delivered: `work/claim-check-writing-evidence.md` — claim extraction, internal-consistency and hedging audit, plus a clear blocker on cross-source verification.
- Completed work: Extracted `CLM-01` and `CLM-02` plus two implicit claims; verified the draft's own claim annotations (CLM-02 already flagged as unsupported by the author); audited hedging verbs and scope statements; recorded the missing-source blocker. No formal ResearchSpec run, Gate, or Decision was created — this is ordinary standalone file work, consistent with the previous session's stance.
- Evidence limits: All sources in scope are synthetic test material; no external publication has been verified. The draft has no `<!--ref:slug-->` / `<!--anchor:...-->` markers, so a formal `check-claim-faithfulness-audit` would need manuscript-format conversion before it could run.
- Open question: Will the user supply `benchmark/sources.yaml` (or equivalent) and authorize citation-marker conversion, so that cross-source verification can resume? Until then, claim intensity is bounded by the partial manuscript's own scope statement.
- Next step: If the user confirms a source corpus and manuscript-format conversion, run the formal `check-claim-faithfulness-audit` standalone procedure and emit `claim_audit_report` per `claim-audit.v1`. Otherwise keep this informal audit as the deliverable.
- Related run: none.
