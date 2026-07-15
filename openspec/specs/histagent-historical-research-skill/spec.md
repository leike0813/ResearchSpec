# histagent-historical-research-skill Specification

## Purpose

Define the complete stateful historical-research Skill, its purpose-specific records, applicable-layer Gates, semantic authority boundary, and deterministic outputs.

## Requirements

### Requirement: Historical Research SHALL Be A Complete Stateful Skill
`histagent-historical-research` SHALL satisfy the non-native baseline plus script-assisted, resource-backed, and stateful extensions. Its complete tree SHALL contain a full `SKILL.md`, `scripts/research_runtime.py`, copied `lib/historical_support.py`, exactly two directly routed detailed references, and distribution metadata. The entrypoint SHALL provide exactly `init`, `status`, `submit-source`, `submit-layer`, `submit-evidence`, `check`, and `render`.

#### Scenario: Agent starts or resumes research
- **WHEN** a run exists
- **THEN** it runs `status` first and executes only the unique `next_action`
- **AND** it does not reconstruct state from chat

### Requirement: Research SHALL Use Purpose-Specific Records
`init` SHALL read `--scope-file`. Source, layer, and evidence mutations SHALL read their own domain record files and require the current status token. `status` SHALL directly return run ID, phase, unique next action, status token, blockers, counts, and a next-record example. Mutations SHALL return command-specific receipts. Expected failures SHALL exit nonzero with a stderr error object.

#### Scenario: Mutation uses a stale token
- **WHEN** state has changed since the prior status
- **THEN** mutation fails before writing

### Requirement: Layer Gates SHALL Respect Applicability
Every source SHALL declare all five source layers as `required` or `not-applicable` with a non-empty reason. The Gate SHALL request only required layers and SHALL NOT require meaningless translation, emendation, normalization, or interpretation content.

#### Scenario: Translation is unnecessary
- **WHEN** the source plan marks translation not applicable with a reason
- **THEN** translation does not block evidence work

### Requirement: Evidence Gates SHALL Remain Semantic-Neutral
The runtime SHALL validate registered source IDs, evidence IDs, conflicts, limitation review, and synthesis references. It SHALL block unresolved conflicts and missing review but SHALL NOT choose an interpretation through string heuristics.

#### Scenario: Conflicting evidence remains
- **WHEN** a conflict has no explicit treatment
- **THEN** the unique next action remains `submit-evidence`

### Requirement: Rendering SHALL Be Deterministic And Local
`render` SHALL generate exactly `research-report.md`, `evidence-matrix.json`, and `provenance.json` from validated state. `state.json` SHALL remain the Skill-local SSOT and SHALL have no ResearchSpec workflow authority.

#### Scenario: Same state is rendered twice
- **WHEN** overwrite is explicitly authorized and state is unchanged
- **THEN** the three final artifact bytes are identical
