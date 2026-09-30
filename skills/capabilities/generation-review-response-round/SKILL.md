---
name: generation-review-response-round
description: "Executes one complete strategy/draft round plus final interactive manuscript revision, semantic revision logging, response-letter coverage, and export."
metadata:
  capability_id: generation-review-response-round
  node_kind: producer
  execution_type: mixed
  gate_policy: required
  license: MIT
---

# Review Response Round

Execute exactly one ResearchSpec capability node.

## Inputs

- `review_response_workspace` (review-response-workspace.v1)

## Outputs

- `working_manuscript` (manuscript-draft.v1)
- `response_markdown` (response-letter.v1)
- `response_latex` (response-letter-latex.v1)
- `round_summary` (review-response-round.v1)

## Knowledge

- Load knowledge ID `workflow-glossary` from `knowledge/workflow-glossary.md`.
- Load knowledge ID `workflow-state-machine` from `knowledge/workflow-state-machine.md`.
- Load knowledge ID `sql-write-recipes` from `knowledge/sql-write-recipes.md`.
- Load knowledge ID `helper-scripts` from `knowledge/helper-scripts.md`.
- Load knowledge ID `stage-6-final-review-export` from `knowledge/stage-6-final-review-and-export.md`.
- Load knowledge ID `assets-localization-messages-en.json` from `assets/localization/messages/en.json`.
- Load knowledge ID `assets-localization-messages-zh-CN.json` from `assets/localization/messages/zh-CN.json`.
- For an existing review workspace only, load knowledge ID `review-workspace-index.html` from `review-workspace/index.html`.
- For an existing review workspace only, load knowledge ID `review-workspace-v1.html` from `review-workspace/v1.html`.
- Load knowledge ID `workbench-review_workbench.py` from `workbench/review_workbench.py`.
- Load knowledge ID `workbench-receipts.sql` from `workbench/receipts.sql`.
- Load knowledge ID `workbench-README.md` from `workbench/README.md`.
- Load knowledge ID `review-workspace-revision-master.html` from `review-workspace/revision-master.html`.

## Tools

- `scripts/capture_revision_action.py` is packaged from extraction artifact `RM-SCRIPT-06`; invoke it only through the declared runner and arguments.
- `scripts/commit_revision_round.py` is packaged from extraction artifact `RM-SCRIPT-07`; invoke it only through the declared runner and arguments.
- `scripts/export_manuscript_variants.py` is packaged from extraction artifact `RM-SCRIPT-08`; invoke it only through the declared runner and arguments.
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

# Review Response Round

Execute one complete revision-response round: author and confirm comment-scoped strategy and drafts, then perform final interactive manuscript revision, semantic revision logging, response-letter coverage, and export. The graph engine owns round continuation; this node returns control after one full round.

## Input

- `review_response_workspace`: the workspace with an accepted workboard.

## Stage 5 Strategy And Execution

1. For each non-done atomic comment in workboard order:
   - explicitly set `workflow_state.active_comment_id`; never switch silently;
   - write `strategy_cards` with `proposed_stance` and `stance_rationale`;
   - write at least one `strategy_card_actions`, plus target locations, evidence items, pending confirmations, and supplement suggestion/intake rows when needed;
   - proactively prepare the current-strategy handoff using `workbench/README.md` and the package's `review-workspace/revision-master.html`, or review the same candidate in dialogue; ask for per-comment confirmation before writing manuscript and response drafts, binding the current active strategy candidate and its linked sources, evidence, and locations; a pending material blocker or substantive adjustment keeps that scope pending;
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

For the final interactive pass, review the current `working_manuscript` and open workboard items with the user in dialogue or through the round handoff: assemble the frozen `revision-master-review-workspace.v1` snapshot with the package's read-only `workbench/review_workbench.py` projection (follow `workbench/README.md`) and embed it in `review-workspace/revision-master.html`. The round view shows the frozen before/after excerpt, revision log, and thread-organized reply for every related location, plus actual delivery-file status and pending formal controls; a round seen marker is separate from feedback and never counts as confirmation. Apply accepted edits to `working_manuscript` and commit them through the existing semantic revision log scripts. Keep the per-comment confirmation and evidence boundaries intact.

When a returned `revision-master-review-result.v1` is processed, validate it against the retained snapshot and recheck each scope's current database dependencies before writing, commit the processing receipt with the same semantic write in one task transaction, and regenerate the derived views. Keep pending or conflicting items traceable in the next handoff; recheck actual files, logs, and receipts after an interrupted manuscript write before retrying, without replaying blindly. Removing an earlier annotation never reverses an applied effect; an explicit request is required.

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


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
