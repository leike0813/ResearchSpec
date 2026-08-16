## Context

Upstream `revision-master` is a six-stage interactive review-response workflow backed by a SQLite
semantic runtime and deterministic `gate-and-render` scripts. The old ResearchSpec adaptation kept
that runtime almost intact and wrapped it in a schema-1 route/subflow profile. The capability-graph
engine requires stage transitions and the revision loop to be data, not upstream prose or Python
state-machine authority.

## Decisions

### Stage semantics become capability procedures, stage transitions become graph facts

Stage 1–4 map one-to-one to four capability nodes. Stage 5 and Stage 6 are intentionally combined
into one repeatable `round` capability because the graph revision template models exactly one
strategy/execution plus final-review/export cycle per round. Within the round procedure, Stage 5
completes all comment-scoped drafts and Stage 6 completes manuscript edits, semantic revision logs,
and response-letter export.

### The Python runtime becomes package-local tooling

`workspace_db.py`, `runtime_localization.py`, `gate_and_render_workspace.py`, and the template/schema
assets remain packaged tools invoked by capability procedures. They render read-only views and
validate database writes. They no longer decide the next stage; the graph profile owns stage order,
Gates, and the continue/complete Decision.

### Gates preserve upstream confirmation points

- `review-response-comment-coverage` after Stage 3.
- `review-response-strategy` after Stage 4 workboard planning.
- `review-response-evidence`, `review-response-response-coverage`, and
  `review-response-final-assembly` after each completed revision round and before the outcome
  Decision.

Every Gate requires a separate human confirmation; failed-Gate override policy remains engine-owned.

### Revision loop is template-bound

The `review-response` graph profile declares `round` as the repeatable revision node and `outcome`
as the repeatable review Decision. `continue` creates the next round; `complete` closes the template
and makes the run complete once all non-template nodes and Gates are complete.

## Risks

- Combining Stage 5 and Stage 6 in one repeatable capability makes the node procedure large.
  Mitigation: the procedure references the extracted stage files as knowledge and keeps the node
  contract bounded to one complete round.
- The Python runtime is duplicated into each package that invokes it. This preserves package
  self-containment at the cost of repository size; a future shared-runtime capability can factor it
  out when hard dependencies exist.
- The old SQLite workspace remains task-local semantic truth. It must never be edited by hand or
  treated as ResearchSpec workflow authority.
