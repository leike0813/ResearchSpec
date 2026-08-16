# Review Response Comment Atomization

Turn raw reviewer and editor comments into stable canonical atomic items with complete source-span evidence. This node is semantic work performed by the Agent, never by a one-off script.

## Input

- `review_response_workspace`: the artifact workspace with manuscript structure analysis complete.

## Procedure

1. Read `02-manuscript-structure-summary.md`, `04-raw-review-thread-list.md`, `knowledge/sql-write-recipes.md`, and `knowledge/workflow-state-machine.md`.
2. Extract raw review threads first:
   - preserve reviewer/editor natural boundaries;
   - split numbered or bulleted input on its original boundaries;
   - use paragraph boundaries for unnumbered comments;
   - keep `raw_review_threads.original_text` in the source language;
   - do not semantically merge at the raw-thread layer.
3. Form canonical atomic items:
   - an atomic item must be independently answerable, independently actionable, and independently checkable;
   - split one thread into multiple items when it contains independent issues, different expected actions, or mixed requests;
   - do not over-split background explanation or rhetorical support.
4. Merge conservatively. Merge different reviewers only when core problem, expected action, evidence need, and revision direction all agree. Record every merge in `atomic_comment_source_spans` with source excerpts in the original language.
5. Write `raw_thread_atomic_links` and guarantee each `thread_id` maps to at least one `comment_id` and each `comment_id` is referenced at least once.
6. Write `review_comment_source_documents` and `raw_thread_source_spans`. Every thread must have at least one `span_role='primary'` whose `span_text` equals the source slice at the recorded offsets.
7. Update resume fields, run `scripts/gate_and_render_workspace.py --artifact-root <workspace>`, and show the coverage view `07-review-comment-coverage.md` with the hard `30%` / soft `50%` character-coverage thresholds.
8. Record the coverage confirmation request. Do not proceed until the user confirms coverage review.

## Stable IDs

- `thread_id`: `<reviewer_id>_thread_<3-digit-seq>`
- `comment_id`: `atomic_<3-digit-seq>`

## Outputs

1. `atomic_comment_list`: the refreshed `05-atomic-review-comment-list.md` path.
2. `comment_coverage_report`: the refreshed `07-review-comment-coverage.md` path plus the current coverage metrics and pending confirmation list.

Do not plan the workboard in this node.
