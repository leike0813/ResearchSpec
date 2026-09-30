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
