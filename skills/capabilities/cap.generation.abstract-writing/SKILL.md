---
name: cap.generation.abstract-writing
description: "Writes independent bilingual abstract and keywords."
metadata:
  capability_id: cap.generation.abstract-writing
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Abstract Writing

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `abstract` (abstract.v1)

## Knowledge

- Load knowledge ID `abstract-guide` from `knowledge/abstract-guide.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
