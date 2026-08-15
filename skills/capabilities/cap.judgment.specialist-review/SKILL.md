---
name: cap.judgment.specialist-review
description: "Reviews methodology, domain depth and interdisciplinary perspective."
metadata:
  capability_id: cap.judgment.specialist-review
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Specialist Review

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `specialist_review` (specialist-review.v1)

## Knowledge

- Load knowledge ID `quality-rubrics` from `knowledge/quality-rubrics.md`.
- Load knowledge ID `review-criteria` from `knowledge/review-criteria.md`.
- Load knowledge ID `statistical-reporting` from `knowledge/statistical-reporting.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
