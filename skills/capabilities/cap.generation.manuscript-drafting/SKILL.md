---
name: cap.generation.manuscript-drafting
description: "Writes manuscript sections and revision patches from outline and argument blueprint."
metadata:
  capability_id: cap.generation.manuscript-drafting
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Manuscript Drafting

Execute exactly one ResearchSpec capability node.

## Inputs

- `argument_blueprint` (argument-blueprint.v1)
- `synthesis_report` (synthesis-report.v1)

## Outputs

- `manuscript_draft` (manuscript-draft.v1)

## Knowledge

- Load knowledge ID `academic-writing-style` from `knowledge/academic-writing-style.md`.
- Load knowledge ID `anti-leakage` from `knowledge/anti-leakage.md`.
- Load knowledge ID `writing-quality` from `knowledge/writing-quality.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
