---
name: check-temporal-integrity-verification
description: "Runs five-pass temporal lint against manuscript claims."
metadata:
  capability_id: check-temporal-integrity-verification
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Temporal Integrity Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)
- `timeline` (timeline.v1)
- `citation_provenance` (citation-provenance.v1)

## Outputs

- `temporal_audit_report` (temporal-audit.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.
- Load knowledge ID `validators-temporal.py` from `validators/temporal.py`.

## Tools

- `validators/temporal.py` implements the package's authored computation; invoke it only through the declared runner and arguments.

## Procedure

# Procedure

Work from `manuscript_draft` and available timeline/citation provenance. Produce `temporal_audit_report`.

Use the executable report contract below. manuscript_draft is the actual text
file; optional timeline and citation_provenance inputs are explicit JSON/YAML
files. Missing metadata leaves the affected checks visibly unresolved.

1. Run the five deterministic passes:
   - P1 future-as-past arithmetic
   - P2 version-as-evidence anachronism
   - P3 unmaterialized comparators
   - P4 causal inversion
   - P5 deictic time bombs
2. When dates are unavailable, emit `TEMPORAL-METADATA-MISSING` rather than passing silently.
3. Classify findings as advisory or blocking according to the current degradation registry.
4. Return machine-readable findings and a human-readable summary.

## Output Format

```markdown
## Temporal Audit Report
| pass | finding | claim | severity |
|---|---|---|---|
```

## Executable report contract

Use Python 3 with PyYAML for YAML inputs; PDF parsing additionally needs pypdf.
Use the host's already configured Python environment. Missing dependencies must
be reported; never install them without user authorization.

Create an external request JSON with `inputs: [{"role": "<input role>", "path": "<absolute material path>"}]`
from the paths returned by `researchspec instructions`. Run:

`python3 validators/temporal-integrity.py temporal /absolute/request.json --generate`

Save stdout unchanged as the declared external JSON report. The validator used by
`advance` recomputes the report from the graph's current resolved inputs and
rejects altered results. It does not write reports or mutate inputs. A valid
report can contain FAIL, UNAVAILABLE or not_checked findings: these remain
visible evidence for the owning human Gate, never a scientific clearance.


## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
