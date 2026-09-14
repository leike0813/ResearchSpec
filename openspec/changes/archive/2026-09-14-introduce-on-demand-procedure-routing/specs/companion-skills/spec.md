## MODIFIED Requirements

### Requirement: Canonical Five-Workflow Manifest

ResearchSpec SHALL keep five canonical Companion identities but SHALL expose only `researchspec-navigate` as a host-visible Skill. Propose, Decide, Verify, and the CLI handbook SHALL be hidden procedures in the runtime-derived catalog.

#### Scenario: Companion catalog is loaded
- **WHEN** Agent delivery and procedure discovery read the Companion catalog
- **THEN** delivery selects only Navigate while procedure discovery includes the other four identities exactly once

#### Scenario: Manifest is the only companion registry
- **WHEN** delivery and procedure discovery resolve Companions
- **THEN** both derive identities and content from the canonical Companion manifest

### Requirement: Navigate Provides Progressive CLI Discovery

Navigate SHALL be a compact entry procedure that uses CLI procedure search, metadata, and instruction packets. It SHALL NOT embed a generated route catalog, full CLI handbook, or full literature policy.

#### Scenario: Request is ambiguous
- **WHEN** the user asks for broad or cross-capability work
- **THEN** Navigate reads bounded status when a workspace exists and searches compact procedure cards before selecting one body

#### Scenario: Detailed CLI help is needed
- **WHEN** Navigate cannot construct a payload from compact command metadata
- **THEN** it loads the CLI handbook procedure on demand

#### Scenario: User asks which command or option to use
- **WHEN** the user asks a CLI discovery question
- **THEN** Navigate starts with compact catalog help and loads the handbook only when needed

#### Scenario: Static discovery reaches a workspace action
- **WHEN** static discovery leads to a graph action
- **THEN** Navigate reads current status and exact instructions before acting

### Requirement: Independent CLI Handbook Companion

The CLI handbook SHALL remain a canonical Companion procedure with one generated content owner and SHALL NOT be installed as a separate Skill.

#### Scenario: Handbook procedure is activated
- **WHEN** a caller requests `instructions procedure:researchspec-cli-handbook`
- **THEN** the returned procedure body is generated from the same command and payload catalogs as CLI help

#### Scenario: ResearchSpec use triggers the handbook Skill
- **WHEN** detailed CLI operation guidance is required
- **THEN** the hidden handbook procedure is activated on demand rather than projected

### Requirement: Companion Guidance Exposes Only Graph Runtime Actions

Companion procedures SHALL distinguish standalone file work from graph runtime actions. Only graph activation may expose or request run, node, handoff, Gate, Decision, or transition mutations.

#### Scenario: Standalone Companion completes
- **WHEN** a hidden Companion runs in standalone mode
- **THEN** it returns ordinary output paths without claiming a graph action

#### Scenario: Governed Companion completes
- **WHEN** a Companion runs under a graph packet
- **THEN** it follows the packet's exact graph selector and authority

#### Scenario: Companion resumes active work
- **WHEN** a Companion resumes governed work
- **THEN** it reads status and exact node instructions before any state action

#### Scenario: Generated companion contains retired guidance
- **WHEN** Companion generation detects retired runtime or plugin-instruction guidance
- **THEN** generation validation fails
