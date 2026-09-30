---
name: analysis-review-response-manuscript-analysis
description: "Builds the manuscript structure summary, core claims, evidence links, and high-risk modification areas needed for comment mapping."
metadata:
  capability_id: analysis-review-response-manuscript-analysis
  node_kind: producer
  execution_type: mixed
  gate_policy: none
  license: MIT
---

# Review Response Manuscript Analysis

Execute exactly one ResearchSpec capability node.

## Inputs

- `review_response_workspace` (review-response-workspace.v1)

## Outputs

- `manuscript_structure_summary` (review-response-manuscript-analysis.v1)

## Knowledge

- Load knowledge ID `workflow-glossary` from `knowledge/workflow-glossary.md`.
- Load knowledge ID `workflow-state-machine` from `knowledge/workflow-state-machine.md`.
- Load knowledge ID `sql-write-recipes` from `knowledge/sql-write-recipes.md`.
- Load knowledge ID `helper-scripts` from `knowledge/helper-scripts.md`.
- Load knowledge ID `assets-localization-messages-en.json` from `assets/localization/messages/en.json`.
- Load knowledge ID `assets-localization-messages-zh-CN.json` from `assets/localization/messages/zh-CN.json`.

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

## Procedure

# Review Response Manuscript Analysis

Build a full manuscript structure understanding that can support later reviewer-thread and atomic-comment mapping. This node performs analysis only; it does not draft responses or edit the manuscript.

## Input

- `review_response_workspace`: the initialized artifact workspace from intake.

## Procedure

1. Read `01-agent-resume.md`, `02-manuscript-structure-summary.md` when present, and the current `instruction_payload`.
2. Read the manuscript entry from the workspace:
   - confirm single-file versus project shape;
   - build the complete section hierarchy, not just a heading list;
   - label section functions such as problem definition, methods, experimental setup, results/discussion, limitation, and conclusion.
3. Extract core claims. Each claim must identify its main supporting evidence; if a claim cannot be stated stably, the analysis is incomplete.
4. Identify high-risk modification areas: abstract, results/discussion, key method definitions, limitation, and conclusion are common candidates.
5. Write the structural truth with `recipe_stage2_upsert_manuscript_summary`:
   - `manuscript_summary`
   - `manuscript_sections`
   - `manuscript_claims`
   - `workflow_state`
   - `resume_brief`
   - `resume_recent_decisions`
   - open loops when present.
6. Run `scripts/gate_and_render_workspace.py --artifact-root <workspace>` and confirm `02-manuscript-structure-summary.md` is refreshed.
7. Ask the user when the structure remains unclear, the project is incomplete, references are missing, or a structural constraint is ambiguous.

## Completion Criteria

- Main entry and project shape are explicit.
- Section hierarchy supports later location mapping.
- Principal claims and supporting evidence are recorded.
- High-risk modification areas are recorded.
- `02-manuscript-structure-summary.md` renders without a blocking script error.

## Output

- `manuscript_structure_summary`: the refreshed `02-manuscript-structure-summary.md` path.

Do not begin comment atomization in this node.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
