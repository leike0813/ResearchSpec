---
name: cap.check.terminal-policy-gate
description: "Applies the finalizer policy before submission package creation."
metadata:
  capability_id: cap.check.terminal-policy-gate
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Terminal Policy Gate

Execute exactly one ResearchSpec capability node.

## Inputs

- `formatted_manuscript` (formatted-manuscript.v1)

## Outputs

- `terminal_policy_report` (terminal-policy.v1)

## Knowledge

- Load knowledge ID `terminal-firm-rules` from `knowledge/terminal-firm-rules.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
