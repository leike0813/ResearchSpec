## ADDED Requirements

### Requirement: Converged Runtime Guidance Has Black-Box Acceptance

Acceptance SHALL verify that public CLI behavior, generated ARSU guidance,
Companion guidance, canonical usage documentation, and runtime documentation
describe the same adaptive-default and strict-compatible protocol without
requiring literal prose snapshots.

#### Scenario: Adaptive and strict guidance is exercised

- **WHEN** acceptance initializes adaptive and strict workspaces and obtains
  current descriptors
- **THEN** the journeys SHALL exercise the selector and execution-policy families
  valid for each mode
- **AND** they SHALL not use a strict-only selector to progress an adaptive run

#### Scenario: Documentation facts are checked structurally

- **WHEN** acceptance validates current runtime documentation
- **THEN** it SHALL verify command count, fixed Skill count, runtime mode,
  selector families, recovery, migration, and Material Passport compatibility
  facts through stable structured assertions
- **AND** it SHALL not assert complete natural-language paragraphs or field order

### Requirement: Traceability Covers Convergence Evidence

The traceability manifest SHALL link every affected runtime requirement and
scenario to its convergence change, black-box journey, stable test ID, and any
generated-guidance or documentation verification that proves it.

#### Scenario: Archived fluid-runtime changes remain traceable

- **WHEN** the traceability checker resolves this convergence change and the two
  archived fluid-runtime changes
- **THEN** it SHALL resolve their stable main-spec requirements and repository
  test paths without depending on an active historical change directory

