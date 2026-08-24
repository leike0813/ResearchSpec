---
name: transform-review-response-comment-atomization
description: "Extracts raw reviewer threads, forms canonical atomic comments with conservative merges, and writes full source-span evidence and coverage confirmation."
metadata:
  capability_id: transform-review-response-comment-atomization
  node_kind: producer
  execution_type: mixed
  gate_policy: required
  license: MIT
---

# Review Response Comment Atomization

Execute exactly one ResearchSpec capability node.

## Inputs

- `review_response_workspace` (review-response-workspace.v1)

## Outputs

- `atomic_comment_list` (review-response-atomic-comments.v1)
- `comment_coverage_report` (review-response-coverage.v1)

## Knowledge

- Load knowledge ID `workflow-glossary` from `knowledge/workflow-glossary.md`.
- Load knowledge ID `workflow-state-machine` from `knowledge/workflow-state-machine.md`.
- Load knowledge ID `sql-write-recipes` from `knowledge/sql-write-recipes.md`.
- Load knowledge ID `helper-scripts` from `knowledge/helper-scripts.md`.

## Tools

- `scripts/gate_and_render_workspace.py` is packaged from extraction artifact `RM-SCRIPT-03`; invoke it only through the declared runner and arguments.
- `scripts/workspace_db.py` is packaged from extraction artifact `RM-SCRIPT-04`; invoke it only through the declared runner and arguments.
- `scripts/runtime_localization.py` is packaged from extraction artifact `RM-SCRIPT-05`; invoke it only through the declared runner and arguments.
- `assets/schema/revision-master-schema.yaml` is packaged from extraction artifact `RM-ASSET-01`; invoke it only through the declared runner and arguments.
- `assets/runtime/skill-runtime-digest.md` is packaged from extraction artifact `RM-ASSET-02`; invoke it only through the declared runner and arguments.
- `assets/localization/source-messages.yaml` is packaged from extraction artifact `RM-ASSET-03`; invoke it only through the declared runner and arguments.
- `assets/templates/action-copy-variants.md.j2` is packaged from extraction artifact `RM-ASSET-04`; invoke it only through the declared runner and arguments.
- `assets/templates/agent-resume.md.j2` is packaged from extraction artifact `RM-ASSET-05`; invoke it only through the declared runner and arguments.
- `assets/templates/atomic-comment-workboard.md.j2` is packaged from extraction artifact `RM-ASSET-06`; invoke it only through the declared runner and arguments.
- `assets/templates/atomic-review-comment-list.md.j2` is packaged from extraction artifact `RM-ASSET-07`; invoke it only through the declared runner and arguments.
- `assets/templates/export-patch-plan.md.j2` is packaged from extraction artifact `RM-ASSET-08`; invoke it only through the declared runner and arguments.
- `assets/templates/final-assembly-checklist.md.j2` is packaged from extraction artifact `RM-ASSET-09`; invoke it only through the declared runner and arguments.
- `assets/templates/manuscript-execution-graph.md.j2` is packaged from extraction artifact `RM-ASSET-10`; invoke it only through the declared runner and arguments.
- `assets/templates/manuscript-revision-guide.md.j2` is packaged from extraction artifact `RM-ASSET-11`; invoke it only through the declared runner and arguments.
- `assets/templates/manuscript-structure-summary.md.j2` is packaged from extraction artifact `RM-ASSET-12`; invoke it only through the declared runner and arguments.
- `assets/templates/raw-review-thread-list.md.j2` is packaged from extraction artifact `RM-ASSET-13`; invoke it only through the declared runner and arguments.
- `assets/templates/render-manifest.yaml` is packaged from extraction artifact `RM-ASSET-14`; invoke it only through the declared runner and arguments.
- `assets/templates/response-coverage-matrix.md.j2` is packaged from extraction artifact `RM-ASSET-15`; invoke it only through the declared runner and arguments.
- `assets/templates/response-letter-outline.md.j2` is packaged from extraction artifact `RM-ASSET-16`; invoke it only through the declared runner and arguments.
- `assets/templates/response-letter-preview.md.j2` is packaged from extraction artifact `RM-ASSET-17`; invoke it only through the declared runner and arguments.
- `assets/templates/response-letter-preview.tex.j2` is packaged from extraction artifact `RM-ASSET-18`; invoke it only through the declared runner and arguments.
- `assets/templates/response-letter-table-preview.md.j2` is packaged from extraction artifact `RM-ASSET-19`; invoke it only through the declared runner and arguments.
- `assets/templates/response-letter-table-preview.tex.j2` is packaged from extraction artifact `RM-ASSET-20`; invoke it only through the declared runner and arguments.
- `assets/templates/response-strategy-card.md.j2` is packaged from extraction artifact `RM-ASSET-21`; invoke it only through the declared runner and arguments.
- `assets/templates/review-comment-coverage.md.j2` is packaged from extraction artifact `RM-ASSET-22`; invoke it only through the declared runner and arguments.
- `assets/templates/revision-action-log.md.j2` is packaged from extraction artifact `RM-ASSET-23`; invoke it only through the declared runner and arguments.
- `assets/templates/style-profile.md.j2` is packaged from extraction artifact `RM-ASSET-24`; invoke it only through the declared runner and arguments.
- `assets/templates/supplement-intake-plan.md.j2` is packaged from extraction artifact `RM-ASSET-25`; invoke it only through the declared runner and arguments.
- `assets/templates/supplement-suggestion-plan.md.j2` is packaged from extraction artifact `RM-ASSET-26`; invoke it only through the declared runner and arguments.
- `assets/templates/thread-to-atomic-mapping.md.j2` is packaged from extraction artifact `RM-ASSET-27`; invoke it only through the declared runner and arguments.

## Procedure

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

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
