## ADDED Requirements

### Requirement: Runtime-Aware Registered Artifact Path Basis

ResearchSpec SHALL choose exactly one registered Artifact path basis from the
loaded runtime mode. Adaptive registry paths SHALL be relative to the
`researchspec/` workspace, while unmigrated strict registry paths SHALL remain
relative to the project root. Artifact checks, workflow and Gate evaluation,
Doctor, pack, patch lifecycle, contract lifecycle, and runtime migration SHALL
reuse this path fact and its runtime-specific containment boundary.

#### Scenario: Adaptive Artifact is resolved from the workspace

- **GIVEN** an adaptive workspace registers `runs/current/example.md`
- **WHEN** any registered Artifact consumer resolves that path
- **THEN** it SHALL resolve to `researchspec/runs/current/example.md`
- **AND** it SHALL require the resolved file to remain inside `researchspec/`

#### Scenario: Strict Artifact retains its legacy project-relative basis

- **GIVEN** an unmigrated strict workspace registers
  `researchspec/runs/current/example.md`
- **WHEN** any registered Artifact consumer resolves that path
- **THEN** it SHALL resolve from the project root to the existing workspace file
- **AND** it SHALL preserve the strict registry representation

#### Scenario: Registered Artifact escapes its runtime boundary

- **WHEN** a registered Artifact path or its symlink target escapes the
  runtime-selected containment root
- **THEN** the consumer SHALL reject or exclude the Artifact
- **AND** it SHALL NOT probe another path basis

#### Scenario: Both possible legacy locations contain the same declared path

- **GIVEN** both the project-relative and workspace-relative locations for a
  declared path exist with different bytes
- **WHEN** a consumer resolves the registered Artifact
- **THEN** it SHALL use only the basis selected by the runtime mode
- **AND** file existence SHALL NOT change that selection
