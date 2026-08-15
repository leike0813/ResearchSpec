## ADDED Requirements

### Requirement: Extraction Artifacts Are Verified Authoring Inputs

The authoring converter SHALL consume the deterministic extraction index derived from
`docs/ars_extraction/` and SHALL refuse to author a capability package unless every indexed artifact
used by that package passes byte-for-byte SHA-256 verification against the pinned `vendor/ars`
snapshot.

#### Scenario: Extraction index is regenerated

- **WHEN** the extraction index generator runs
- **THEN** it reports all 119 extraction artifacts and a pass/fail verification for each
- **AND** a non-pass entry blocks authoring of any package that references it

#### Scenario: Package references an unverified source

- **WHEN** an authored manifest cites an upstream file or extraction ID absent from the verified index
- **THEN** authoring validation fails with an unverified-source diagnostic

### Requirement: Authoring Converter Emits Capability Packages

The converter SHALL author capability packages as generated output: thin `SKILL.md`, `manifest.yaml`,
referenced knowledge packs, referenced validators and provenance records. It SHALL NOT emit the
upstream phase flow, mode registry or agent-team orchestration text as runtime Skill content.

#### Scenario: Capability package is authored

- **WHEN** an extraction capability reaches the authoring stage
- **THEN** its package passes the `capability-manifest` registry checks
- **AND** its `SKILL.md` contains no next-node or next-phase instruction

#### Scenario: Legacy flow text is emitted

- **WHEN** converter output would include upstream orchestration prose as runtime guidance
- **THEN** converter validation fails and the package is not admitted

### Requirement: Capability Authoring Is Deterministic And Idempotent

Authoring output SHALL be deterministic for a pinned extraction index and upstream snapshot. Running
the authoring converter twice SHALL produce byte-identical capability packages, knowledge packs and
provenance records.

#### Scenario: Authoring idempotence is checked

- **WHEN** the authoring converter runs twice without input changes
- **THEN** every generated package byte is identical across runs

### Requirement: Preset Graph Generation Cross-Validates Capability Registry

The converter SHALL generate preset graph profiles only from capability IDs present in the registry
and SHALL cross-validate that every preset entry, node, Gate, Decision and revision template reference
resolves. Coverage validation SHALL report dangling capability, role or validator references.

#### Scenario: Preset graph is generated

- **WHEN** converter graph generation runs
- **THEN** each generated profile passes graph profile schema `"2"` validation

#### Scenario: Registry changes without graph update

- **WHEN** a capability referenced by a preset graph is removed or renamed
- **THEN** generation or validation fails and identifies the dangling reference
