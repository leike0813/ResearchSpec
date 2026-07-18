## ADDED Requirements

### Requirement: Immutable Zotero Bundle Admission
ResearchSpec SHALL convert only the approved immutable Zotero bundle release set and SHALL validate its complete source, release, content, runtime, and licensing identity before generation.

#### Scenario: Approved release is admitted
- **WHEN** the local bundle matches tag `host-bridge/hbrs-48630ca514e3146c2c89a8d5`, bundle commit `8eef49d72574084244514fb612b96e7f5e7967a8`, tree `d4cb943c0370e5104ec8c7074606c69980dec090`, and source commit `4436cf4a91f12ea555a54ddbba9278480ceaf56d`
- **THEN** admission SHALL validate release-set `hbrs-48630ca514e3146c2c89a8d5`, protocol `host-bridge.v1`, CLI schema `zotero-bridge.cli.v2`, build fingerprint, command checksum, content digests, binary aggregate, and all seven runtime checksums

#### Scenario: Source or published bytes drift
- **WHEN** the pinned source is dirty or any required identity, file, tree, content digest, binary, checksum, license, notice, or derivation value differs
- **THEN** conversion SHALL fail before committing generated output

#### Scenario: Release metadata remains planned
- **WHEN** the immutable tag is valid but its embedded release status is `planned` or no GitHub Release object exists
- **THEN** those external publication indicators SHALL NOT block admission

### Requirement: Curated Adapter Bundle Generation
The converter SHALL generate a self-contained ResearchSpec adapter tree containing only reviewed files consumed by the fixed integration.

#### Scenario: Production tree is generated
- **WHEN** conversion succeeds
- **THEN** `literature-adapters/zotero` SHALL contain two Agent-neutral Skills, required references, the evidence helper and schema, profile template, release identities, seven platform runtimes, and applicable license, notice, and derivation files

#### Scenario: Unconsumed upstream surfaces are excluded
- **WHEN** conversion succeeds
- **THEN** the generated tree SHALL exclude upstream global installers, `agents/openai.yaml`, `runner.json`, `output.schema.json`, and unused provider or platform contracts
- **AND** adapted Skill instructions SHALL NOT refer to an excluded installer or file

### Requirement: Deterministic Zotero Conversion
Zotero adapter conversion and checking SHALL be offline, non-executing, and byte-deterministic.

#### Scenario: Converter is repeated
- **WHEN** the converter runs twice against the same admitted input
- **THEN** the complete generated tree and report SHALL be byte-identical

#### Scenario: Conversion is checked
- **WHEN** normal conversion, checking, or idempotence validation runs
- **THEN** it SHALL NOT execute bundled binaries, installers, evidence helpers, or Python code
- **AND** it SHALL NOT contact upstream repositories, Zotero, or Host Bridge

### Requirement: Zotero License And Derivation Retention
ResearchSpec SHALL bind the pinned source commit's AGPL-3.0 license to every redistributed Zotero adapter component through package license, notice, and derivation evidence.

#### Scenario: Bundle root lacks a license file
- **WHEN** the pinned bundle is traced to its exact source commit
- **THEN** the source commit root AGPL-3.0 license SHALL be accepted as the licensing fact
- **AND** the bundle's lack of a root license or notice SHALL NOT independently block admission

