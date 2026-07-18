## MODIFIED Requirements

### Requirement: Deterministic ARSU Skill Generation
ResearchSpec SHALL generate ARSU-derived Skill artifacts from the vendored ARS source with deterministic structure, copied dependencies, generated metadata, and the approved offline Better BibTeX adapter closure.

#### Scenario: Required skill groups are generated
- **GIVEN** `vendor/ars` contains the required ARSU skill groups
- **WHEN** conversion succeeds
- **THEN** `skills/arsu` SHALL contain generated directories for `deep-research`, `academic-paper`, `academic-paper-reviewer`, and `academic-pipeline`
- **AND** each generated group SHALL contain `SKILL.md`

#### Scenario: Missing required skill group blocks conversion
- **GIVEN** a required ARSU skill group is missing from `vendor/ars`
- **WHEN** a maintainer runs the ARSU conversion script
- **THEN** conversion SHALL fail before producing a successful manifest
- **AND** the diagnostic SHALL identify the missing group

#### Scenario: Shared and cross-skill dependencies are copied
- **GIVEN** an upstream Skill references shared or cross-Skill runtime resources
- **WHEN** conversion succeeds
- **THEN** the required resources SHALL be copied into the generated Skill group
- **AND** generated links SHALL point to the copied local resources

#### Scenario: Offline Better BibTeX adapter is copied
- **GIVEN** `academic-pipeline` uses the upstream offline Zotero adapter
- **WHEN** conversion succeeds
- **THEN** it SHALL contain `zotero.py`, `_common.py`, and required package markers
- **AND** generated guidance SHALL state that this path reads user-supplied Better BibTeX JSON rather than live Zotero state

#### Scenario: Other adapter and development files are excluded
- **GIVEN** upstream contains other platform adapter files or development-only files
- **WHEN** conversion succeeds
- **THEN** unapproved files SHALL NOT be copied into `skills/arsu` runtime Skill groups
- **AND** exclusions SHALL be recorded in the conversion manifest

#### Scenario: Generated output records hashes
- **WHEN** conversion succeeds
- **THEN** the conversion manifest SHALL list generated files with SHA-256 hashes
- **AND** validation SHALL fail if a listed file no longer matches its recorded hash

## ADDED Requirements

### Requirement: Generated Zotero Literature Protocol
ResearchSpec SHALL inject one converter-owned Zotero literature-adapter protocol into every generated ARSU producer through the shared contract preflight.

#### Scenario: Producer handles ordinary literature work
- **WHEN** a generated ARSU producer needs literature and the adapter is available
- **THEN** it SHALL perform bounded read-only Zotero discovery before optional external supplementation
- **AND** it SHALL treat adapter output as working material that the same producer must review and integrate

#### Scenario: Query returns no items
- **WHEN** a bounded Zotero query returns an empty result
- **THEN** the generated guidance SHALL prohibit treating that result as proof that relevant literature does not exist

#### Scenario: Ordinary adapter use fails
- **WHEN** an ordinary literature task cannot use the adapter
- **THEN** the producer SHALL continue through its existing external or user-supplied input path with the limitation disclosed

#### Scenario: Task depends on private Zotero state
- **WHEN** a task explicitly requires current selection, a private collection, private metadata, or private attachments and the adapter is unavailable
- **THEN** the producer SHALL pause for adapter configuration or alternative user input
- **AND** it SHALL NOT substitute public search as if it were the private library

#### Scenario: Adapter output reaches workflow boundaries
- **WHEN** adapter-derived material is ready for ResearchSpec use
- **THEN** only the active producer and ResearchSpec CLI SHALL create candidates or perform authorized workflow writes
- **AND** adapter guidance SHALL prohibit direct writes to specs, state, artifact registry, Gates, Decisions, transitions, and receipts

#### Scenario: Mutating operation is requested
- **WHEN** Zotero mutation, workflow submit/apply, upload, deletion, or maintenance is proposed
- **THEN** it SHALL require separate user authorization and remain subject to Host Bridge approval

