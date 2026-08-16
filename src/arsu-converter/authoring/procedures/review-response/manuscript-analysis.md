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
