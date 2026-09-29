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

If the user requests browser review, retain an exact frozen source set and project the current atomic comments and workboard fields through the `review-response` `review-workspace.v2` adapter, then open `review-workspace/index.html`. Prepare static selectable content with host Quarto/LaTeX tools where needed; ask separately before every render that may execute project code or filters and use a temporary copy after approval. Show uncertain conversion as raw source. Validate the result against the retained workspace and compare current source with the frozen set; if changed, show differences and affected comments and ask before SQLite writes, and if unchanged ask about ambiguous source locations. Apply accepted changes through existing SQLite write recipes; the page never writes `revision-master.db` or confirms the graph Gate.

## Completion Criteria

- Every comment has state, target location, and analysis link rows.
- No empty-shell planning rows remain.
- The pending workboard confirmation is recorded and visible.

## Output

- `review_response_workboard`: the refreshed `08-atomic-comment-workboard.md` path.

Do not author strategy cards in this node.
