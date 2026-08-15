---
name: cap.judgment.review-synthesis
description: "Synthesizes panel reports into one editorial decision and revision roadmap."
metadata:
  capability_id: cap.judgment.review-synthesis
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Review Synthesis

Execute exactly one ResearchSpec capability node.

## Inputs

- `specialist_review` (specialist-review.v1)
- `editorial_decision` (editorial-decision.v1)

## Outputs

- `review_synthesis` (review-synthesis.v1)

## Knowledge

- Load knowledge ID `sprint-contract` from `knowledge/sprint-contract.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
