## ADDED Requirements

### Requirement: Capability Authoring Inputs Have A Dedicated Root

Converter-owned extraction indexes, capability prose, knowledge, scripts, templates, schemas, and review notes SHALL live under `authoring/<source>/`. Durable documentation SHALL describe the authoring contract but SHALL NOT contain files consumed as converter authority.

#### Scenario: Capability packages are authored

- **WHEN** a converter resolves an extraction artifact
- **THEN** it reads the artifact from its declared `authoring/` root
- **AND** no live converter path resolves through `docs/`

#### Scenario: A generated report is emitted

- **WHEN** parity or review tooling writes a derived report
- **THEN** the output is placed under `artifacts/generated/`
- **AND** converter inputs do not depend on that report unless a maintenance catalog explicitly binds it
