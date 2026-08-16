---
name: cap-check-contamination-signals
description: "Deterministic contamination signal computation."
metadata:
  capability_id: cap-check-contamination-signals
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Contamination Signals

Execute exactly one ResearchSpec capability node.

## Inputs

- `corpus` (corpus.v1)

## Outputs

- `contamination_report` (contamination.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.

## Procedure

# Procedure

Run the bundled `validators/contamination-signals.py` with the current submission JSON.

1. Compute contamination signals from corpus and model-output evidence.
2. Do not infer contamination from style alone.
3. Report advisory scores and the evidence used.
4. Never block output on advisory signals alone.

## Output Format

Structured verifier findings from the script.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
