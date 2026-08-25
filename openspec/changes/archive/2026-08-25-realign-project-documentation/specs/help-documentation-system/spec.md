## ADDED Requirements

### Requirement: Durable Documentation Is Organized By Reader

Long-lived project knowledge SHALL live under `docs/user`, `docs/developer`, or `docs/maintainer`. Each category SHALL expose an index, and `docs/README.md` SHALL explain authority and route readers to the canonical source.

#### Scenario: A reader enters the docs tree

- **WHEN** the reader opens `docs/README.md`
- **THEN** they can identify the user, developer, and maintainer paths
- **AND** they can distinguish durable documentation from artifacts, specs, audits, and authoring inputs

### Requirement: Temporary Work Does Not Compete With Current Documentation

Generated reports, release evidence, superseded proposals, acceptance rehearsals, and historical decision logs SHALL live under categorized `artifacts/` directories. Archived material SHALL NOT be presented as current product authority.

#### Scenario: A historical rehearsal is retained

- **WHEN** a prior user-journey rehearsal remains useful as evidence
- **THEN** it is stored under `artifacts/archive/`
- **AND** current docs link to it only when historical context is needed
