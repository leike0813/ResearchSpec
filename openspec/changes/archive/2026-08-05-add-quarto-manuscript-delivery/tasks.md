## 1. Core contracts

- [x] 1.1 Add manuscript delivery fields and workspace template/index support.
- [x] 1.2 Add handoff format metadata, path/renderer validation, and start/control format snapshots.
- [x] 1.3 Validate start snapshots against the current manuscript contract and expose structured tool requirements in instructions.

## 2. Quarto delivery

- [x] 2.1 Implement bounded read-only Quarto probing with available, unavailable, and unknown states.
- [x] 2.2 Implement the converter-owned single-file renderer with no-execute defaults, independent render consent, staging, conflict protection, and atomic delivery.

## 3. Workflow and converter

- [x] 3.1 Add the pipeline format child and route accepted review/re-review through formatting before final integrity.
- [x] 3.2 Update ARSU routing/source and anchor replacement rules for QMD-compatible writing, review, revision, annotation, and format conversion.
- [x] 3.3 Regenerate the converter-owned ARSU Skill tree and profile projection.

## 4. Documentation

- [x] 4.1 Update the canonical user model, contract/schema documentation, runtime workflows, and rehearsal journeys.
- [x] 4.2 Update main OpenSpec requirements for the delivered current-state behavior.

## 5. Verification

- [x] 5.1 Add focused contract, start/instructions, Quarto helper, annotation/revision, pipeline, and pack tests.
- [x] 5.2 Run type checks, focused tests, packaged CLI journeys, ARSU converter checks, idempotence, and generated-tree verification.
