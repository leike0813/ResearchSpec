---
name: cap.check.citation-verification-summary
description: "Deterministic citation verification summary."
metadata:
  capability_id: cap.check.citation-verification-summary
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Citation Verification Summary

Execute exactly one ResearchSpec capability node.

## Inputs

- `citation_verification_report` (citation-existence.v1)

## Outputs

- `citation_summary` (citation-summary.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.

## Procedure

# Procedure

Run the bundled `validators/citation-verification-summary.py` with the current submission JSON.

1. Aggregate citation verification outcomes.
2. Produce counts by verdict and source.
3. Report degradation and retry status.
4. Return a machine-readable summary.

## Output Format

Structured verifier findings from the script.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
