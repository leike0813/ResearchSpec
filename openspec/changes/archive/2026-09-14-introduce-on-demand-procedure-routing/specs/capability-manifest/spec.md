## MODIFIED Requirements

### Requirement: No Embedded Flow Authority

A capability `SKILL.md` SHALL contain only its local semantic procedure and SHALL end with mode-neutral completion guidance that defers lifecycle actions to the activation packet. It SHALL NOT instruct the Agent to choose, start, or advance another node, phase, mode, or run.

#### Scenario: Skill names a next phase
- **WHEN** a generated capability instructs the Agent to continue to another phase or invoke another Agent as a workflow step
- **THEN** authoring validation fails with a flow-authority-in-skill diagnostic

#### Scenario: Standalone procedure completes
- **WHEN** the procedure runs under a standalone packet
- **THEN** it returns declared ordinary output paths to the caller without workflow mutation

#### Scenario: Graph procedure completes
- **WHEN** the same procedure runs under a graph packet
- **THEN** it follows the packet's handoff and exact advance instructions

#### Scenario: Skill completes
- **WHEN** the local semantic procedure finishes
- **THEN** its mode-neutral Completion defers the lifecycle action to the activation packet

### Requirement: Operational Packages Carry Substantive Curated Procedures

Every bundled `operational` capability package SHALL contain a substantive `## Procedure` and a mode-neutral `## Completion` that delegates completion behavior to the activation packet. The bundled registries SHALL contain no operational thin wrappers.

#### Scenario: Bundled registry is loaded
- **WHEN** a capability registry loads
- **THEN** every registered package is operational and contains a substantive procedure
- **AND** each Completion section is valid for standalone and graph activation

#### Scenario: Thin operational wrapper is prevented
- **WHEN** a package contains only inputs, outputs, or knowledge references without a curated procedure
- **THEN** package validation fails with a thin-wrapper diagnostic
