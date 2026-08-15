---
name: cap.design.manuscript-structure-design
description: "Designs paper structure, outline, word budget and evidence mapping."
metadata:
  capability_id: cap.design.manuscript-structure-design
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Manuscript Structure Design

Execute exactly one ResearchSpec capability node.

## Inputs

- `writing_configuration` (writing-configuration.v1)
- `annotated_bibliography` (annotated-bibliography.v1)

## Outputs

- `paper_outline` (paper-outline.v1)

## Knowledge

- Load knowledge ID `paper-structure-patterns` from `knowledge/paper-structure-patterns.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
