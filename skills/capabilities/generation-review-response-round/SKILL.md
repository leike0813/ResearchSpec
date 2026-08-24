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

## Tools

- `scripts/capture_revision_action.py` is packaged from extraction artifact `RM-SCRIPT-06`; invoke it only through the declared runner and arguments.
- `scripts/commit_revision_round.py` is packaged from extraction artifact `RM-SCRIPT-07`; invoke it only through the declared runner and arguments.
- `scripts/export_manuscript_variants.py` is packaged from extraction artifact `RM-SCRIPT-08`; invoke it only through the declared runner and arguments.
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

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
