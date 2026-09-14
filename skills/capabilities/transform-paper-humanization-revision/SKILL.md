---
name: transform-paper-humanization-revision
description: "Executes an approved humanization plan through the deterministic document artifact contract and renders the revised manuscript."
metadata:
  capability_id: transform-paper-humanization-revision
  node_kind: producer
  execution_type: mixed
  gate_policy: required
  license: MIT
---

# Paper Humanization Revision

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_source` (manuscript-draft.v1)
- `humanization_revision_plan` (humanization-plan.v1)

## Outputs

- `humanized_manuscript` (manuscript-draft.v1)
- `humanization_candidate_artifact` (paper-humanizer-document.v1)

## Knowledge

- Load knowledge ID `paper-humanizer-taxonomy` from `knowledge/paper-humanizer-taxonomy.md`.
- Load knowledge ID `document-yaml-contract` from `knowledge/document-yaml-contract.md`.

## Tools

- `scripts/document_pipeline.py` is packaged from extraction artifact `PH-SCRIPT-01`; invoke it only through the declared runner and arguments.

## Procedure

# Paper Humanization Revision

Execute an approved humanization revision plan against one boundary manuscript. The graph engine owns approval state; this node receives the manuscript and the approved plan and performs exactly one bounded revision pass.

## Role

You are the humanization revision executor. Your edits are semantically neutral. Humanization is not fact-checking, copy-editing, argument repair, translation, or general quality improvement.

## Preconditions

- The manuscript input is a boundary file outside `researchspec/`.
- The revision plan is the approved plan bound to this node card. Every included item has an explicit disposition.
- If the plan contains no actionable items, close without manufactured edits and report an unchanged candidate.

## Document Artifact Cycle

1. Extract the exact source with `scripts/document_pipeline.py extract` according to `knowledge/document-yaml-contract.md`.
2. Confirm the success envelope and inspect parser warnings.
3. For each included plan item, map the source information units first:
   - claims, propositions, evidence, and citations;
   - entities, numbers, dates, terminology, scope, conditions, certainty, negation, contrast, and causality;
   - paragraph and section function;
   - deliberate voice features.
4. Edit only `text` fields on segments whose `kind` is `prose` in the document artifact. Do not touch excluded, pending, or protected content. Prefer the smallest operation that resolves the supported mechanism.
5. Run `scripts/document_pipeline.py analyze` on the edited artifact to a fresh path.
6. Run `scripts/document_pipeline.py validate` on the analyzed artifact.
7. Run `scripts/document_pipeline.py render` to the requested boundary output path.
8. Compare output structure and protected content with the source. Every source information unit must remain in the candidate, and every candidate unit must come from the source or an explicitly approved plan operation.

## Voice Calibration

If a writing sample or governing house style is available, record only acceptable form: vocabulary level, sentence-length range, paragraph openings, punctuation, recurring phrases, transitions, stance, and deliberate irregularities. Use it to constrain candidate edits without importing sample facts, claims, examples, or structure.

## Failure Handling

- On parser, schema, protected-content, or stale-analysis failure, stop without claiming success and report the error envelope and the offending artifact path.
- When a safe edit is uncertain, leave the span unchanged and record the uncertainty in the candidate notes.
- Never hand-edit `state.yaml`, plan hashes, or rendered views.

## Outputs

1. `humanized_manuscript`: the rendered boundary manuscript produced by the deterministic pipeline.
2. `humanization_candidate_artifact`: the validated analyzed document artifact used to produce the manuscript.

Do not submit when any pipeline command fails.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
