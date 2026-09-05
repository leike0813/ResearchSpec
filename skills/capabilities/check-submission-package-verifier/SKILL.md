---
name: check-submission-package-verifier
description: "Deterministic submission package verifier with explicit unresolved findings."
metadata:
  capability_id: check-submission-package-verifier
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Submission Package Verifier

Execute exactly one ResearchSpec capability node.

## Inputs

- `submission_package` (submission-package.v1)

## Outputs

- `submission_package_report` (submission-package-check.v1)

## Knowledge

- Load knowledge ID `terminal-firm-rules` from `knowledge/terminal-firm-rules.md`.
- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.
- Load knowledge ID `validators-documents.py` from `validators/documents.py`.

## Tools

- `validators/documents.py` implements the package's authored computation; invoke it only through the declared runner and arguments.

## Procedure

# Procedure

Generate the report with `validators/submission-package-verifier.py` using the executable report contract below.

Supply submission_package as a JSON/YAML manifest with a nonempty files array of {path, sha256?}, relative to that manifest. Optional license, disclosure, terminal_policy_stamp and manuscript fields name listed files. An explicit profile may supply max_words and required_headings. Unperformed checks remain not_checked; this producer manifest grants no workflow authority.

1. Read the supplied `submission_package` paths and package manifest.
2. Verify required package files, declared checksums, license, disclosure, and
   terminal-policy stamp presence without changing package bytes.
3. Preserve `fail`, `warn`, and `NOT-CHECKED` findings in the report. Missing
   venue/profile/parser inputs are unresolved checks; never treat absence as a
   clean package or infer a venue policy.
4. Consume the resolved ResearchSpec package-policy value as input when one is
   supplied. This verifier reports mechanical findings; it does not read or
   choose workflow policy, grant a Gate, or reinterpret citation-marker policy.
5. Return pass/fail findings without modifying package bytes.

## Output Format

Structured verifier findings from the script, including unresolved checks and
the supplied policy/result provenance.

## Executable report contract

Use Python 3 with PyYAML for YAML inputs; PDF parsing additionally needs pypdf.
Use the host's already configured Python environment. Missing dependencies must
be reported; never install them without user authorization.

Create an external request JSON with `inputs: [{"role": "<input role>", "path": "<absolute material path>"}]`
from the paths returned by `researchspec instructions`. Run:

`python3 validators/submission-package-verifier.py submission /absolute/request.json --generate`

Save stdout unchanged as the declared external JSON report. The validator used by
`advance` recomputes the report from the graph's current resolved inputs and
rejects altered results. It does not write reports or mutate inputs. A valid
report can contain FAIL, UNAVAILABLE or not_checked findings: these remain
visible evidence for the owning human Gate, never a scientific clearance.


## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
