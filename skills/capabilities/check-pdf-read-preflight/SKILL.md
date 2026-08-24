---
name: check-pdf-read-preflight
description: "Deterministic PDF extraction preflight."
metadata:
  capability_id: check-pdf-read-preflight
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# PDF Read Preflight

Execute exactly one ResearchSpec capability node.

## Inputs

- `pdf_path` (pdf.v1)

## Outputs

- `pdf_preflight_report` (pdf-preflight.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.

## Procedure

# Procedure

Run the bundled `validators/pdf-read-preflight.py` with the current submission JSON.

1. Check PDF readability and extraction readiness.
2. Report page count, text layer availability, and parse errors.
3. Return pass/fail/unresolvable without modifying the PDF.

## Output Format

Structured verifier findings from the script.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
