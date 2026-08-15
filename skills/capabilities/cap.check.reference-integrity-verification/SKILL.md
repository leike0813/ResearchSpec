---
name: cap.check.reference-integrity-verification
description: "Verifies citations, bibliography metadata and data provenance."
metadata:
  capability_id: cap.check.reference-integrity-verification
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Reference Integrity Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `integrity_report` (integrity-report.v1)

## Knowledge

- Load knowledge ID `7mode-failures` from `knowledge/7mode-failures.md`.
- Load knowledge ID `integrity-protocol` from `knowledge/integrity-protocol.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
