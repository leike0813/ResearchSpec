---
name: cap.check.passport-verifier
description: "Deterministic material passport verifier."
metadata:
  capability_id: cap.check.passport-verifier
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Passport Verifier

Execute exactly one ResearchSpec capability node.

## Inputs

- `material_passport` (material-passport.v1)

## Outputs

- `passport_report` (passport-check.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
