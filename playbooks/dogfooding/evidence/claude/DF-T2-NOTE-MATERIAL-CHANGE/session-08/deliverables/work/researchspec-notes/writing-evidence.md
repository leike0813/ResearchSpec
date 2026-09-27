# TEST FIXTURE: ordinary research task note

Copy this note to `work/researchspec-notes/writing-evidence.md` in the isolated project before the continuation session.

- Goal: Summarize how the supplied synthetic sources bear on the draft's claims about generative AI in university writing instruction.
- Inputs: `benchmark/sources.yaml` and `benchmark/partial-manuscript.md`.
- Output so far: `benchmark/partial-manuscript.md` contains the working draft; ordinary synthesis delivered as `work/researchspec-notes/writing-claim-verification.md`.
- Completed work: Read the draft, identified explicit claims (CLM-01, CLM-02) and several implicit ones, ran an internal-consistency + wording-calibration check, and wrote the claim-verification note. No formal review or graph action occurred.
- Evidence limits: `benchmark/sources.yaml` does not exist in the fixture; `researchspec/specs/sources.yaml` and `claims.yaml` are empty. The note therefore verifies only what is checkable inside the draft itself. All sources are synthetic test material; no external publication has been verified.
- Open question: Pending fixture-side fix — who supplies the real source corpus so each claim can be mapped to a `SYN-*` summary; CLM-02 still needs an explicit decision (delete / weaken / supply evidence).
- Next step: Hand the verification note back to the user; await either a populated `benchmark/sources.yaml` or a decision on CLM-02 before any `researchspec-verify` invocation. Do not start a graph run; do not fabricate source content.
- Related run: none.
