---
name: cap.check.claim-faithfulness-audit
description: "LLM-as-judge claim-source alignment audit."
metadata:
  capability_id: cap.check.claim-faithfulness-audit
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Claim Faithfulness Audit

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `claim_audit_report` (claim-audit.v1)

## Knowledge

- Load knowledge ID `claim-audit-calibration` from `knowledge/claim-audit-calibration.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
