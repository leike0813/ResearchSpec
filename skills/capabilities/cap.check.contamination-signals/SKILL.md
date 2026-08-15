---
name: cap.check.contamination-signals
description: "Deterministic contamination signal computation."
metadata:
  capability_id: cap.check.contamination-signals
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Contamination Signals

Execute exactly one ResearchSpec capability node.

## Inputs

- `corpus` (corpus.v1)

## Outputs

- `contamination_report` (contamination.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
