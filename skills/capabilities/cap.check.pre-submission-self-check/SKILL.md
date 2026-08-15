---
name: cap.check.pre-submission-self-check
description: "Lightweight author self-check before submission."
metadata:
  capability_id: cap.check.pre-submission-self-check
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Pre-submission Self Check

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `self_check_report` (self-check.v1)

## Knowledge

- Load knowledge ID `quality-rubrics` from `knowledge/quality-rubrics.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
