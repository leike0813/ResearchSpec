## 1. Contracts and profile projection

- [x] 1.1 Discriminate end-to-end and mid-entry profile entries, validate non-empty unique child entry points, and add the Start/control `entry_point` field.
- [x] 1.2 Project the seven academic-pipeline entry points and remove the synthetic `entry` checkpoint allowance.

## 2. Runtime and CLI behavior

- [x] 2.1 Validate parent Start entry selection before writes, persist it in the Start confirmation, and initialize the parent at the selected child checkpoint.
- [x] 2.2 Centralize bounded initial-entry detection and apply it to child dependencies, branch unlocks, and repeatable round-1 calculation without weakening later transitions.
- [x] 2.3 Expose structured entry-point instructions and payload documentation, and report `subflow_checkpoint_invalid` for invalid profile parent checkpoints.

## 3. Tests and user guidance

- [x] 3.1 Extend profile and control tests for schema validation, seven entry choices, atomic Start rejection, persistence, and no child pre-creation.
- [x] 3.2 Extend workflow and packaged CLI journeys for selected-child exposure, successful child Start, local revision rounds, restored later guards, legacy checkpoint diagnostics, and existing-route regressions.
- [x] 3.3 Update the CLI handbook, Start page, canonical usage model, and academic-pipeline journey documentation for confirmed mid-entry selection.

## 4. Verification

- [x] 4.1 Strictly validate the OpenSpec change and run type, lint, unit, documentation, ARSU consistency, and ARSU idempotence checks.
