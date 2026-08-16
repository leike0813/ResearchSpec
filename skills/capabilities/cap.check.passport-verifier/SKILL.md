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

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.

## Procedure

# Procedure

Run the bundled `validators/passport-verifier.py` with the current submission JSON.

1. Parse the material passport.
2. Verify required fields, source bindings, and schema version.
3. Report missing or invalid entries.
4. Never infer missing provenance.

## Output Format

Structured verifier findings from the script.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
