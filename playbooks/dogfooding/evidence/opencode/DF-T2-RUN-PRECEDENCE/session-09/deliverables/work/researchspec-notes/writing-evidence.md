# ResearchSpec task note — writing-evidence

## Status: research phase complete on the active run; awaiting user direction before write/review/revision

### Goal

Continue the work on generative AI in university writing instruction by
mapping the four supplied synthetic sources (`benchmark/sources.yaml`)
against the partial manuscript's claims
(`benchmark/partial-manuscript.md`), with explicit attention to
evidence limits and the out-of-scope items the goal
(`benchmark/goal.md`) forbids.

### Inputs

- `benchmark/goal.md` — the user's stated research intent (synthetic
  dogfooding fixture; no fabricated participants, effect sizes,
  citations, or ethics approvals).
- `benchmark/sources.yaml` — the four `SYN-*` source summaries that
  form the closed evidence universe.
- `benchmark/partial-manuscript.md` — the working draft with the
  working title and two preliminary claims (`CLM-01` retained,
  `CLM-02` rejected in the partial text).
- `researchspec/specs/project.md` — initially empty; filled with a
  faithful lift from the goal and partial manuscript so the
  research-question node had a project intent to consume.

### Completed work (this session)

- Discovered the active run `run-54c36847e4697610f309be79`
  (`academic-pipeline`, mid-entry into `research`).
- Planed the `research` subgraph's three required outputs in the run
  handoff (`research_report`, `annotated_bibliography`,
  `synthesis_report`).
- Started the inherited child run
  `run-08ae493b86bba791b0e3d19c` (`research-main`) and walked its
  seven nodes end to end:
  - `research-question` → `work/rq_brief.md` (FINER avg 4.0/5).
  - `rq-gate` → verdict **pass**.
  - `methodology` → `work/methodology_blueprint.md`
    (interpretivist / structured claim-evidence mapping; SRQR-leaning
    reporting; preregistration not required; human-subjects pathway
    left at "institutional determination required").
  - `literature` → `work/annotated_bibliography.md` (four included,
    zero excluded / skipped; no external search because the
    methodology bound the evidence universe to the supplied corpus;
    each entry explicitly marked as a synthetic fixture citation,
    not a real publication).
  - `grading` → `work/graded_sources.md` (all four entries graded
    Level VI, marked `Fixture`; no real venue / author / DOI / COI
    checks applicable; `UNVERIFIABLE` against indexers expected for
    fixtures, not a fabrication signal).
  - `synthesis` → `work/synthesis_report.md` (literature matrix,
    five themes including the disclosure/verification/uncertainty
    co-occurrence pattern, three resolved contradictions, five
    candidate cross-paper tensions with `scholar_confirmation:
    pending`, six named gaps, claim-intent manifest at top).
  - `report` → `work/research_report.md` (Short-Form report, justified
    by the bounded evidence base; bibliography mirrors the
    annotated_bibliography with verbatim short anchors).
- Recorded rq-gate = pass and parent `research-gate` = pass.

### Outputs and their purpose

- `work/rq_brief.md` — research-question brief consumed by rq-gate
  and the methodology node.
- `work/methodology_blueprint.md` — interpretive paradigm, qualitative
  structured claim-evidence mapping, SRQR-leaning reporting. Consumed
  by literature, synthesis, and report nodes.
- `work/annotated_bibliography.md` — the four-entry bibliography with
  explicit synthetic-fixture citations and Search Strategy Report.
  Bound to downstream write / revision nodes.
- `work/graded_sources.md` — Level-VI grades for all four entries with
  a Fixture marker and an explanation of why real-publication checks
  are not applicable.
- `work/synthesis_report.md` — literature matrix, themes,
  contradictions, cross-paper tension inventory, gaps, evidence
  convergence map.
- `work/research_report.md` — Short-Form research brief companion to
  the partial manuscript, with claim-intent manifest and synthetic-
  fixture references.

### Evidence limits and boundary discipline

- All four sources are synthetic test fixtures; no real publication,
  DOI, or participant data was introduced or fabricated at any node.
- No claim was promoted to causal-inference language.
- Effect-size, cross-institutional, longitudinal, time-on-task, and
  implementation-quality claims are recorded as named gaps rather
  than attempted.
- The closed-evidence-universe discipline is preserved end to end.

### Open questions

- Should the parent run continue into `write` (academic-paper
  subgraph) given that the partial manuscript already exists and the
  write subgraph expects to draft from annotated_bibliography +
  synthesis_report? The write subgraph's `intake` typically asks
  how to relate its draft to an existing partial manuscript.
- Should `researchspec/specs/claims.yaml` and
  `researchspec/specs/sources.yaml` be updated from the synthesis
  output, and if so, in what granularity? The research-main
  subgraph did not auto-promote to those specs.
- Should `review-response` and downstream `format` / `final-integrity`
  nodes run inside this fixture, or are they out of scope for what
  the user wanted to "continue"?

### Next step

Await user direction on whether to advance into `write` and the
rest of the academic-pipeline, or whether to mark the
research-phase deliverable as the bound endpoint of this continuation
session.

### Related run

- `run-54c36847e4697610f309be79` (`academic-pipeline`, mid-entry into
  `research`). Research phase complete; rq-gate and parent
  research-gate recorded as pass; next pending action is the
  inherited `node:run-54c36847e4697610f309be79/write` subgraph start.
- `run-08ae493b86bba791b0e3d19c` (`research-main`,
  authorization_origin = `parent_run`). Status: complete. All seven
  nodes (research-question, rq-gate, methodology, literature, grading,
  synthesis, report) advanced.
