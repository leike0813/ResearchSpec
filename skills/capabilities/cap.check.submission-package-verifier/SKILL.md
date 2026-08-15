---
name: cap.check.submission-package-verifier
description: "Deterministic submission package verifier."
metadata:
  capability_id: cap.check.submission-package-verifier
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Submission Package Verifier

Execute exactly one ResearchSpec capability node.

## Inputs

- `submission_package` (submission-package.v1)

## Outputs

- `submission_package_report` (submission-package-check.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
