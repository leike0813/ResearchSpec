# Writing evidence — claim verification (continuation)

- Goal: Summarize how the supplied synthetic sources bear on the draft's claims about generative AI in university writing instruction.
- Inputs (expected): `benchmark/sources.yaml`, `benchmark/partial-manuscript.md`. Per `benchmark/README.md` the `partial-manuscript` fixture variant should also include `benchmark/claims.yaml`.
- Inputs (actual): only `benchmark/partial-manuscript.md`, `benchmark/goal.md`, `benchmark/ordinary-task-note.md`, `benchmark/README.md` exist. `benchmark/sources.yaml` and `benchmark/claims.yaml` are absent. `../scenarios.yaml` is also absent despite the README referencing it.
- Output so far: `benchmark/partial-manuscript.md` contains the working draft; no synthesis file has been delivered.
- Completed work: Read the draft and identified two claims needing source support.
  - `CLM-01` — "Structured prompting coincided with more visible outline revisions in one introductory course." Scope: one course; only association, not causation; "more visible" is a process observation, not a measured effect.
  - `CLM-02` — "Generative AI reduces workload." The draft itself already flags this as not supported by the supplied evidence.
  No formal review or graph action occurred.
- Evidence limits: All sources are synthetic test material; no external publication has been verified. Source-policy constraint from `benchmark/goal.md`: do not invent participants, effect sizes, citations, or ethics approvals.
- Blocker: `benchmark/sources.yaml` is missing, so CLM-01 cannot be cross-referenced against any supplied source summary, and CLM-02 cannot be checked against counter-evidence. Verification cannot be completed without this file.
- Open question: Which claims can be supported from the supplied source summaries? — Unanswerable until `benchmark/sources.yaml` is supplied.
- Next step:
  1. Restore or supply `benchmark/sources.yaml` (and `benchmark/claims.yaml` if a separate claim list is intended). The fixture README names the `partial-manuscript` variant as combining goal + sources + claims + partial-manuscript, so both files belong to this fixture.
  2. Once present, re-run the check: align each claim id with the source ids that speak to it; record support / contradiction / silence per claim; only then write the ordinary synthesis file outside `researchspec/`.
  3. Until then, no synthesis file is produced and no run/graph action is started (no related run exists per `researchspec status --json`).
- Related run: none.