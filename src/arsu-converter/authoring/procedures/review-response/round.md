# Review Response Round

Execute one complete revision-response round: author and confirm comment-scoped strategy and drafts, then perform final interactive manuscript revision, semantic revision logging, response-letter coverage, and export. The graph engine owns round continuation; this node returns control after one full round.

## Input

- `review_response_workspace`: the workspace with an accepted workboard.

## Stage 5 Strategy And Execution

1. For each non-done atomic comment in workboard order:
   - explicitly set `workflow_state.active_comment_id`; never switch silently;
   - write `strategy_cards` with `proposed_stance` and `stance_rationale`;
   - write at least one `strategy_card_actions`, plus target locations, evidence items, pending confirmations, and supplement suggestion/intake rows when needed;
   - ask for per-comment confirmation before writing manuscript and response drafts;
   - after confirmation, write `strategy_action_manuscript_execution_items` and `comment_response_drafts`; keep reviewer/editor excerpts in the source language and all normalized strategy/draft text in the working language;
   - mark a comment complete only when strategy, evidence judgment, manuscript draft, response draft, and one-to-one correspondence checks all pass.
2. Keep comment-scoped blockers local. Use global blockers only for true stage-level blockers.
3. Run `scripts/gate_and_render_workspace.py --artifact-root <workspace>` after every database write.
4. Ensure `11-manuscript-revision-guide.md` and `12-manuscript-execution-graph.md` are refreshed from the completed Stage 5 truth.

## Stage 6 Final Review And Export

1. Read `11-manuscript-revision-guide.md`, `12-manuscript-execution-graph.md`, and `03-style-profile.md`.
2. Treat `working_manuscript` as the only collaborative manuscript. Never edit `source_snapshot`.
3. Interactively revise `working_manuscript` with the user. After each explicit edit batch, author a structured semantic revision log payload and submit it through `scripts/capture_revision_action.py` followed by `scripts/commit_revision_round.py --payload ...`.
4. Every log must link plan actions and threads and contain entries with `target_file`, `target_locator`, `change_type`, `change_summary`, `rationale`, `evidence_source`, and `expected_response_use`.
5. Form one `response_thread_rows` row per original `thread_id`, ordered by `thread_order`. Each row must link at least one completed revision log or be explicitly `response_only_resolution`.
6. Run `scripts/gate_and_render_workspace.py --artifact-root <workspace>` and refresh `13-revision-action-log.md`, `14-response-coverage-matrix.md`, `15-response-letter-preview.md`, `16-response-letter-preview.tex`, and `17-final-assembly-checklist.md`.
7. Export final deliverables with `scripts/export_manuscript_variants.py` where the script supports the confirmed target; optional `latexdiff` is advisory only and must never block completion.
8. Ask the user when a change would alter the main line, core claims, or conclusions; when a closing strategy needs authorization; or when a response-only resolution is ambiguous.

For the final interactive pass, retain the exact frozen source set, project the current `working_manuscript` entry and open workboard items through the `review-response` `review-workspace.v2` adapter, then open `review-workspace/index.html`. Ask separately before every render that may execute project code or filters, render after approval in a temporary copy, and preserve unreliable conversion as visible raw source. The browser result is revision intent only: validate it against the retained workspace, compare current source with the frozen set, show differences and affected feedback and ask before edits if changed, and ask about ambiguous source locations if unchanged. Apply accepted edits to `working_manuscript`, commit through existing semantic revision log scripts, and prepare a new workspace without processed comments.

## Round Completion

A round is complete when:

- all atomic comments processed in this round have confirmed strategy, manuscript draft, and response draft truth;
- every working-manuscript change is represented by an Agent-authored semantic revision log;
- each thread has a response row or an explicit response-only resolution;
- views `13`–`17` are refreshed and the script envelopes are non-blocking.

## Outputs

1. `working_manuscript`: the final collaborative manuscript path for this round.
2. `response_markdown`: the Markdown response-letter path.
3. `response_latex`: the LaTeX response-letter path.
4. `round_summary`: a Markdown round report with coverage matrix path, unresolved residuals, and script envelopes.

Do not choose whether another round is required; submit outputs and return control.
