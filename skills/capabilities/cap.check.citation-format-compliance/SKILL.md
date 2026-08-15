---
name: cap.check.citation-format-compliance
description: "Validates in-text citations and reference list formatting."
metadata:
  capability_id: cap.check.citation-format-compliance
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Citation Format Compliance

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `citation_compliance_report` (citation-compliance.v1)

## Knowledge

- Load knowledge ID `citation-format-standards` from `knowledge/citation-format-standards.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
