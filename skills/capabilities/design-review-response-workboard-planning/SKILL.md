---
name: design-review-response-workboard-planning
description: "Plans priority, dependencies, evidence gaps, target locations, and next actions for every canonical atomic comment."
metadata:
  capability_id: design-review-response-workboard-planning
  node_kind: producer
  execution_type: mixed
  gate_policy: required
  license: MIT
---

# Review Response Workboard Planning

Execute exactly one ResearchSpec capability node.

## Inputs

- `review_response_workspace` (review-response-workspace.v1)

## Outputs

- `review_response_workboard` (review-response-workboard.v1)

## Knowledge

- Load knowledge ID `workflow-glossary` from `knowledge/workflow-glossary.md`.
- Load knowledge ID `workflow-state-machine` from `knowledge/workflow-state-machine.md`.
- Load knowledge ID `sql-write-recipes` from `knowledge/sql-write-recipes.md`.
- Load knowledge ID `helper-scripts` from `knowledge/helper-scripts.md`.
- Load knowledge ID `assets-localization-messages-en.json` from `assets/localization/messages/en.json`.
- Load knowledge ID `assets-localization-messages-zh-CN.json` from `assets/localization/messages/zh-CN.json`.
- For an existing review workspace only, load knowledge ID `review-workspace-index.html` from `review-workspace/index.html`.
- For an existing review workspace only, load knowledge ID `review-workspace-v1.html` from `review-workspace/v1.html`.
- Load knowledge ID `workbench-review_workbench.py` from `workbench/review_workbench.py`.
- Load knowledge ID `workbench-receipts.sql` from `workbench/receipts.sql`.
- Load knowledge ID `workbench-README.md` from `workbench/README.md`.
- Load knowledge ID `review-workspace-revision-master.html` from `review-workspace/revision-master.html`.

## Tools

- `scripts/gate_and_render_workspace.py` is packaged from extraction artifact `RM-SCRIPT-03`; invoke it only through the declared runner and arguments.
- `scripts/workspace_db.py` is packaged from extraction artifact `RM-SCRIPT-04`; invoke it only through the declared runner and arguments.
- `scripts/runtime_localization.py` is packaged from extraction artifact `RM-SCRIPT-05`; invoke it only through the declared runner and arguments.
- `assets/schema/revision-master-schema.yaml` is a package resource; use it as directed by the Procedure.
- `assets/runtime/skill-runtime-digest.md` is a package resource; use it as directed by the Procedure.
- `assets/localization/source-messages.yaml` is a package resource; use it as directed by the Procedure.
- `assets/localization/messages/en.json` is a package resource; use it as directed by the Procedure.
- `assets/localization/messages/zh-CN.json` is a package resource; use it as directed by the Procedure.
- `assets/templates/action-copy-variants.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/agent-resume.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/atomic-comment-workboard.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/atomic-review-comment-list.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/export-patch-plan.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/final-assembly-checklist.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/manuscript-execution-graph.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/manuscript-revision-guide.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/manuscript-structure-summary.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/raw-review-thread-list.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/render-manifest.yaml` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-coverage-matrix.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-letter-outline.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-letter-preview.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-letter-preview.tex.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-letter-table-preview.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-letter-table-preview.tex.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/response-strategy-card.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/review-comment-coverage.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/revision-action-log.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/style-profile.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/supplement-intake-plan.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/supplement-suggestion-plan.md.j2` is a package resource; use it as directed by the Procedure.
- `assets/templates/thread-to-atomic-mapping.md.j2` is a package resource; use it as directed by the Procedure.
- `workbench/review_workbench.py` implements the package's authored computation; invoke it only through the declared runner and arguments.
- `workbench/receipts.sql` is a package resource; use it as directed by the Procedure.
- `workbench/README.md` is a package resource; use it as directed by the Procedure.
- `review-workspace/revision-master.html` is an optional local static review surface; it exports advisory working material and never owns workflow state.

## Procedure

# Review Response Workboard Planning

Build the canonical atomic workboard: priority, dependencies, evidence gaps, target locations, and next actions for every atomic comment. Planning is a user-reviewable semantic artifact, not a script output.

## Input

- `review_response_workspace`: the workspace with stable atomic comments and coverage confirmation.

## Procedure

1. Read `06-thread-to-atomic-mapping.md`, `05-atomic-review-comment-list.md`, `02-manuscript-structure-summary.md`, and the current resume packet.
2. For every `comment_id`, write one `atomic_comment_state` with non-empty `status`, `priority`, `evidence_gap`, `user_confirmation_needed`, and `next_action`.
3. For every `comment_id`, write at least one `atomic_comment_target_locations`. Chapter-level locations are acceptable; `TBD` is allowed only when enough precise locations remain for Stage 5 to proceed.
4. For every `comment_id`, write at least one `atomic_comment_analysis_links` carrying `manuscript_claim_or_section`, `existing_evidence`, `gap_summary`, and optional `dependency_comment_id`.
5. Judge priority, evidence gap, dependency, and next action semantically:
   - priority reflects main-line impact, work, and risk;
   - `evidence_gap=yes` when current evidence cannot support the eventual response or revision;
   - dependencies name another atomic item that must proceed first;
   - next action is the smallest forward step or a request for confirmation/material/location.
6. Write `workflow_pending_user_confirmations`, run `scripts/gate_and_render_workspace.py --artifact-root <workspace>`, and present `08-atomic-comment-workboard.md` and `06-thread-to-atomic-mapping.md`.
7. Keep the confirmation request open until the user explicitly accepts the workboard.

Review the workboard with the user in dialogue or through the board handoff: assemble the frozen `revision-master-review-workspace.v1` snapshot with the package's read-only `workbench/review_workbench.py` projection (follow `workbench/README.md`) and embed it in `review-workspace/revision-master.html`. The board confirmation binds the whole candidate board, so filtering the page view never narrows it. Keep each comment's source text, evidence gap, target location, priority, and next action visible; apply accepted changes through the existing SQLite write recipes, and commit the processing receipt with the semantic write in the same task transaction. Obtain the graph Gate confirmation separately in dialogue.

## Completion Criteria

- Every comment has state, target location, and analysis link rows.
- No empty-shell planning rows remain.
- The pending workboard confirmation is recorded and visible.

## Output

- `review_response_workboard`: the refreshed `08-atomic-comment-workboard.md` path.

Do not author strategy cards in this node.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
