---
name: check-pdf-read-preflight
description: "Deterministic PDF extraction preflight with a separate content advisory."
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
- Load knowledge ID `validators-pdf.py` from `validators/pdf.py`.

## Tools

- `validators/pdf.py` implements the package's authored computation; invoke it only through the declared runner and arguments.

## Procedure

# Procedure

Generate the report with `validators/pdf-read-preflight.py` using the executable report contract below.

pdf_path is the actual PDF file. Structural checks compare declared, enumerated and reader page counts. Optional content classification is not bundled and remains not_checked.

1. Check PDF structure using bounded parsing. Report declared, enumerated and
   reader page counts, plus parse warnings. Text-layer availability is not
   tested by this structural preflight.
2. Return `PASS | FAIL | UNAVAILABLE` without modifying the PDF. Only `PASS`
   licenses page anchors for downstream citation work; missing or failed
   preflight leaves page provenance unverified and must be surfaced.
3. Optional content classification is a separate advisory. Run it only when
   explicitly requested, over the exact already-read bytes, with bounded
   execution and output. A classifier result never changes the structural
   verdict or authorizes OCR, external uploads, or manuscript edits.

## Output Format

Structured verifier findings from the script, with any separate content advisory
clearly labelled and never treated as structural proof.

## Executable report contract

Use Python 3 with PyYAML for YAML inputs; PDF parsing additionally needs pypdf.
Use the host's already configured Python environment. Missing dependencies must
be reported; never install them without user authorization.

Create an external request JSON with `inputs: [{"role": "<input role>", "path": "<absolute material path>"}]`
from the paths returned by `researchspec instructions`. Run:

`python3 validators/pdf-read-preflight.py pdf /absolute/request.json --generate`

Save stdout unchanged as the declared external JSON report. The validator used by
`advance` recomputes the report from the graph's current resolved inputs and
rejects altered results. It does not write reports or mutate inputs. A valid
report can contain FAIL, UNAVAILABLE or not_checked findings: these remain
visible evidence for the owning human Gate, never a scientific clearance.


## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
