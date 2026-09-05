---
name: check-citation-verification-summary
description: "Deterministic citation verification summary preserving resolver states."
metadata:
  capability_id: check-citation-verification-summary
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
- Load knowledge ID `validators-citations.py` from `validators/citations.py`.

## Tools

- `validators/citations.py` implements the package's authored computation; invoke it only through the declared runner and arguments.

## Procedure

# Procedure

Generate the report with `validators/citation-verification-summary.py` using the executable report contract below.

Supply the structured citation verification report, including per-resolver observations.

1. Aggregate citation verification outcomes without collapsing resolver details.
2. Produce counts by verdict and source, including the distinction between
   `true`, identifier-backed `false`, and coverage-safe `unresolvable`.
3. Report each resolver outcome, degradation and retry status, and any supplied
   bibliographic integrity/retraction signal as a separate advisory surface.
4. Preserve the current policy-independent summary; terminal policy is selected
   and evaluated by the ResearchSpec owning workflow, not this checker.
5. Return a machine-readable summary.

## Output Format

Structured verifier findings from the script.

## Executable report contract

Use Python 3 with PyYAML for YAML inputs; PDF parsing additionally needs pypdf.
Use the host's already configured Python environment. Missing dependencies must
be reported; never install them without user authorization.

Create an external request JSON with `inputs: [{"role": "<input role>", "path": "<absolute material path>"}]`
from the paths returned by `researchspec instructions`. Run:

`python3 validators/citation-verification-summary.py summary /absolute/request.json --generate`

Save stdout unchanged as the declared external JSON report. The validator used by
`advance` recomputes the report from the graph's current resolved inputs and
rejects altered results. It does not write reports or mutate inputs. A valid
report can contain FAIL, UNAVAILABLE or not_checked findings: these remain
visible evidence for the owning human Gate, never a scientific clearance.


## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
