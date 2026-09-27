# Recovery brief — `run-a91e7fc1ba945237e7b1f6c4`

## Done
- Workspace initialized under `[workspace]/`. CLI at `[harness]/bin/researchspec` (in PATH for this shell).
- Profile **academic-pipeline** v0.1.0 selected, route `academic-pipeline:end-to-end` confirmed by `synthetic-fixture-user` at 2026-09-27T06:32:14Z. Expected outputs frozen in `researchspec/runs/.../handoff.md`: `submission_package` + `process_summary` (paths `work/historical-*.{zip,md}`).
- Synthetic fixture loaded into `benchmark/`: full **review-cycle** variant (`goal.md`, `sources.yaml`, `claims.yaml`, `partial-manuscript.md`, `review-comments.md`, `revision-context.md`) — one RQ candidate ("生成式 AI 对高校写作教学的影响"), 4 sources (SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04), 3 claims (CLM-01 tentative, CLM-02 unsupported, CLM-03 hypothesis-only), 1 partial manuscript, 4 major + 2 minor review comments.
- Graph bound (12 nodes + 4 gates + 1 decision): `research → research-gate → write → write-gate → review → review-gate → revision ↔ re-review ↔ round-outcome → format → final-integrity → final-integrity-gate`.

## Blocked
- Nothing framework-level: `diagnostics_summary.blocking=0`, no pending gates/decisions. 14 tools installed, no plugins selected.
- Two soft issues:
  1. Stable specs (`researchspec/specs/{project.md, sources.yaml, claims.yaml, manuscript.yaml}`) are empty placeholders — the run started without populating them. The `research` subgraph expects `research_report`, `annotated_bibliography`, `synthesis_report` and will need this gap closed or worked around.
  2. `benchmark/README.md` references `../scenarios.yaml` which doesn't exist in the workspace — minor doc drift, not a blocker.

## Next
Per `status --json`: `frontier=[]`, but `pending_subgraph_starts=[node:run-a91e7fc1ba945237e7b1f6c4/research]` → resume path is to advance `research` first.

```bash
# 1. Get the exact procedure packet for the pending node
researchspec --cwd [workspace] instructions node:run-a91e7fc1ba945237e7b1f6c4/research --json

# 2. Execute the packet, then advance
researchspec --cwd [workspace] advance node:run-a91e7fc1ba945237e7b1f6c4/research --json
```

Rerun `status --json` after each mutation; navigate downstream by `pending_subgraph_starts → pending_gates → pending_decisions`.

**Open question worth one confirmation before starting:** the fixture is the **review-cycle** variant — every upstream artifact is already on disk. Two valid routes:
- **A. Stay end-to-end** (run as started): re-run `research`/`write`/`review` against the fixture, then land at `revision`. Honest, more tokens, exercises every gate.
- **B. Mid-entry skip-ahead**: spin a child run from `academic-pipeline:mid-entry` starting at `revision` (or `re-review`), using the existing `partial-manuscript.md` + `review-comments.md` + `revision-context.md` directly. Cheaper, but the original end-to-end run stays "active" at zero progress and may need to be archived.

Say which route you want; I'll execute.
