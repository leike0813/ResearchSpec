---
name: cap-check-submission-package-verifier
description: "Deterministic submission package verifier."
metadata:
  capability_id: cap-check-submission-package-verifier
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

## Procedure

# Procedure

Run the bundled `validators/submission-package-verifier.py` with the current submission JSON.

1. Read `submission_package` paths.
2. Verify required package files exist and match declared checksums.
3. Verify license, disclosure, and terminal-policy stamp presence.
4. Return pass/fail findings without modifying package bytes.

## Output Format

Structured verifier findings from the script.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
