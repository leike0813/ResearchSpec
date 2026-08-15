---
name: cap.generation.figure-generation
description: "Generates publication-grade figure code."
metadata:
  capability_id: cap.generation.figure-generation
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Figure Generation

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `figure_code` (figure-code.v1)

## Knowledge

- Load knowledge ID `visualization-standards` from `knowledge/visualization-standards.md`.
- Load knowledge ID `vlm-figure-check` from `knowledge/vlm-figure-check.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
