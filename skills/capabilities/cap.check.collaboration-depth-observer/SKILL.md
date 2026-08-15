---
name: cap.check.collaboration-depth-observer
description: "Advisory four-dimension collaboration depth score."
metadata:
  capability_id: cap.check.collaboration-depth-observer
  node_kind: observer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Collaboration Depth Observer

Execute exactly one ResearchSpec capability node.

## Inputs

- `run_context` (run-context.v1)

## Outputs

- `collaboration_depth_report` (collaboration-depth.v1)

## Knowledge

- Load knowledge ID `collaboration-depth-rubric` from `knowledge/collaboration-depth-rubric.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
