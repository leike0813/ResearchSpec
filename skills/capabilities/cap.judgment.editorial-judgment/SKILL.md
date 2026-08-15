---
name: cap.judgment.editorial-judgment
description: "Edits and judges the manuscript as a journal editor."
metadata:
  capability_id: cap.judgment.editorial-judgment
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Editorial Judgment

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `editorial_decision` (editorial-decision.v1)

## Knowledge

- Load knowledge ID `editorial-decision-standards` from `knowledge/editorial-decision-standards.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
