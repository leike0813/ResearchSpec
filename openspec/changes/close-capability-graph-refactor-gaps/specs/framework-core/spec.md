## ADDED Requirements

### Requirement: Converter-Owned Profiles Are The Projection Source

Preset graph profiles SHALL be authored and generated outside the core runtime and exposed through one validated profile registry. Core bootstrap SHALL consume that registry without embedding a second graph definition.

#### Scenario: Preset graph is projected

- **WHEN** a workspace is initialized or updated
- **THEN** the projected profile bytes come from the converter-owned registry
- **AND** the core runtime contains no independently maintained copy of the graph

### Requirement: Framework Projection Is Transactional And Ownership-Aware

Core capability and profile projection SHALL use the same preflight, ownership manifest, current-byte comparison and atomic commit contract as other generated Agent delivery.

#### Scenario: Managed projection has user drift

- **WHEN** init or update encounters a manifest-owned capability or profile whose current bytes differ from the recorded hash
- **THEN** the operation reports drift and preserves the file unless explicit force authorization applies

#### Scenario: Projection preflight fails

- **WHEN** any planned framework projection conflicts before commit
- **THEN** no capability, profile or ownership-manifest write is committed

