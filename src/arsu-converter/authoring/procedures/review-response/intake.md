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
