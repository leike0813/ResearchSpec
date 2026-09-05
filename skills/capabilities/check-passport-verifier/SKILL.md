---
name: check-passport-verifier
description: "Deterministic read-only material passport verifier."
metadata:
  capability_id: check-passport-verifier
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
- Load knowledge ID `validators-documents.py` from `validators/documents.py`.

## Tools

- `validators/documents.py` implements the package's authored computation; invoke it only through the declared runner and arguments.

## Procedure

# Procedure

Generate the report with `validators/passport-verifier.py` using the executable report contract below.

Supply material_passport as JSON/YAML with literature_corpus entries. Computation checks required citation key, title, source pointer, year, CSL authors, unique keys and acquisition/audit consistency. Source truth, citation existence and full upstream runtime schema validation remain explicitly not_checked.

1. Parse the material passport and validate the current schema and required
   source bindings.
2. Report missing or invalid entries, preserving unknown, stale, degraded, and
   not-checked states as such. Never infer missing provenance, review, consent,
   or authorization from a schema-shaped document.
3. The passport is a supplied evidence record. This verifier does not mutate it,
   append compliance history, grant a Gate, or decide whether a workflow may
   advance.

## ResearchSpec boundary

Treat the passport as optional, read-only evidence. This capability validates its
shape and source pointers only. It does not interpret `resume_from_passport`,
consume boundary/resume entries, append a ledger, acquire a lock sidecar, or
create a hash chain. If those upstream fields are supplied, report them as
unconsumed context rather than acting on them. Resume routing, Gate verdicts, and
run completion remain the authority of the ResearchSpec CLI, the frozen graph,
the owning node instance, and the external handoff.

## Output Format

Structured verifier findings from the script, with unconsumed upstream resume
context clearly labelled when present.

## Executable report contract

Use Python 3 with PyYAML for YAML inputs; PDF parsing additionally needs pypdf.
Use the host's already configured Python environment. Missing dependencies must
be reported; never install them without user authorization.

Create an external request JSON with `inputs: [{"role": "<input role>", "path": "<absolute material path>"}]`
from the paths returned by `researchspec instructions`. Run:

`python3 validators/passport-verifier.py passport /absolute/request.json --generate`

Save stdout unchanged as the declared external JSON report. The validator used by
`advance` recomputes the report from the graph's current resolved inputs and
rejects altered results. It does not write reports or mutate inputs. A valid
report can contain FAIL, UNAVAILABLE or not_checked findings: these remain
visible evidence for the owning human Gate, never a scientific clearance.


## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
