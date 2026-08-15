---
name: cap.generation.format-rendering
description: "Converts the final manuscript into declared output formats."
metadata:
  capability_id: cap.generation.format-rendering
  node_kind: producer
  execution_type: mixed
  gate_policy: required
  license: CC BY-NC 4.0
---

# Format Rendering

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `formatted_manuscript` (formatted-manuscript.v1)

## Knowledge

- Load knowledge ID `latex-template` from `knowledge/latex-template.md`.
- Load knowledge ID `submission-guide` from `knowledge/submission-guide.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
