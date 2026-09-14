---
name: design-review-response-intake
description: "Parses review-response entry, confirms languages, detects the manuscript entry, and initializes the task-local semantic workspace."
metadata:
  capability_id: design-review-response-intake
  node_kind: producer
  execution_type: mixed
  gate_policy: none
  license: MIT
---

# Review Response Intake

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_source` (manuscript-draft.v1)
- `review_comments_source` (review-comments.v1)
- `editor_letter_source` (editor-letter.v1)
- `user_notes` (user-notes.v1)

## Outputs

- `review_response_workspace` (review-response-workspace.v1)
- `intake_report` (review-response-intake.v1)

## Knowledge

- Load knowledge ID `workflow-glossary` from `knowledge/workflow-glossary.md`.
- Load knowledge ID `workflow-state-machine` from `knowledge/workflow-state-machine.md`.
- Load knowledge ID `sql-write-recipes` from `knowledge/sql-write-recipes.md`.
- Load knowledge ID `helper-scripts` from `knowledge/helper-scripts.md`.

## Tools

- `scripts/detect_main_tex.py` is packaged from extraction artifact `RM-SCRIPT-01`; invoke it only through the declared runner and arguments.
- `scripts/init_artifact_workspace.py` is packaged from extraction artifact `RM-SCRIPT-02`; invoke it only through the declared runner and arguments.
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

# Review Response Intake

Parse the review-response entry, confirm language context, and initialize the task-local artifact workspace. Do not perform manuscript analysis or comment atomization in this node.

## Inputs

- `manuscript_source`: a single main `.tex` file or a LaTeX project directory.
- `review_comments_source`: a `.md` or `.txt` file.
- Optional `editor_letter_source` and `user_notes`.

## Procedure

1. Confirm the script-driven runtime requirements: Python 3, PyYAML, and Jinja2. If a dependency is unavailable, ask the user before installation; if declined, the database may continue as truth but read-only Markdown views must be assembled by the Agent.
2. Confirm text language and working language before initialization. Text language defaults to the manuscript language; working language defaults to the current user prompt language. Record explicit user confirmation.
3. Verify required inputs are present and readable. Absorb optional inputs. If a required input is missing, stop and request it.
4. Identify the manuscript entry:
   - A single `.tex` file is normally the main entry.
   - A LaTeX project directory requires `scripts/detect_main_tex.py`; if multiple candidates are returned, ask the user before choosing.
5. If no artifact workspace exists, run `scripts/init_artifact_workspace.py` with explicit `--document-language` and `--working-language`. If the workspace already exists, run `scripts/gate_and_render_workspace.py --artifact-root <workspace>` first and read `01-agent-resume.md` and `instruction_payload.resume_packet`.
6. Write Stage 1 entry state using `recipe_stage1_set_entry_state`: at minimum `workflow_state` and `resume_brief`, plus pending confirmations, blockers, open loops, and must-not-forget items when present.
7. Run `scripts/gate_and_render_workspace.py --artifact-root <workspace>` after every database write. Read the refreshed resume packet and agent resume before finishing.

## Language Rules

- Reviewer and editor source text, manuscript excerpts, `raw_review_threads.original_text`, and `atomic_comment_source_spans.excerpt_text` stay in the source language.
- Stage 3–5 normalized summaries, workboard, strategy cards, resume, gate output, and execution items use the working language.
- Final manuscript copy and response letters use the text language.

## Workspace Shape

The initialized workspace contains `revision-master.db`, `runtime-localization/`, read-only views `01`–`17`, `response-strategy-cards/`, `source_snapshot`, and `working_manuscript`.

## Outputs

1. `review_response_workspace`: the initialized artifact workspace path.
2. `intake_report`: a Markdown report with resolved entry, language confirmation, dependency status, script envelopes, and any open user confirmations.

Do not advance workflow state beyond the current node.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
