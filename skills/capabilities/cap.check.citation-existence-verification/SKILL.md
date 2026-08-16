---
name: cap.check.citation-existence-verification
description: "Deterministic resolver-based citation existence gate."
metadata:
  capability_id: cap.check.citation-existence-verification
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Citation Existence Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `annotated_bibliography` (annotated-bibliography.v1)

## Outputs

- `citation_verification_report` (citation-existence.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.

## Procedure

# Procedure

Run the bundled `validators/citation-verification-gate.py` with the current submission JSON.

1. Resolve each reference through the declared index/API matrix.
2. Use the degradation registry when services are unavailable.
3. Return `lookup_verified: true | false | unresolvable`.
4. `unresolvable` must never be treated as pass.

## Output Format

Structured verifier findings from the script.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
