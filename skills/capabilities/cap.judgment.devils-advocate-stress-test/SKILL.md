---
name: cap.judgment.devils-advocate-stress-test
description: "Attacks the strongest claims without scoring."
metadata:
  capability_id: cap.judgment.devils-advocate-stress-test
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Devil's Advocate Stress Test

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `stress_test_report` (stress-test.v1)

## Knowledge

- Load knowledge ID `logical-fallacies` from `knowledge/logical-fallacies.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
