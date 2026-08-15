---
name: cap.check.compliance-check
description: "PRISMA-trAIce and RAISE advisory compliance."
metadata:
  capability_id: cap.check.compliance-check
  node_kind: observer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Compliance Check

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `compliance_report` (compliance.v1)

## Knowledge

- Load knowledge ID `raise-framework` from `knowledge/raise-framework.md`.
- Load knowledge ID `prisma-traice` from `knowledge/prisma-traice.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
