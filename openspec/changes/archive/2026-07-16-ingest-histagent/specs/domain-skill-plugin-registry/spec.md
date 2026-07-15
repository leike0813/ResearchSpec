## ADDED Requirements

### Requirement: Reviewed HistAgent Vendor SHALL Be The Fifth Vendor
Registry Schema 1 SHALL represent the approved HistAgent `snapshot-47bbe21` bundle as an isolated fifth vendor with three globally unique Skill IDs, immutable provenance, empty hard-dependency arrays, advisory-only relationships, complete mixed-license attribution, and explicit source-neutral domain memberships.

#### Scenario: Five-vendor registry is assembled
- **WHEN** the central assembler loads all published bundles
- **THEN** vendors appear in stable dictionary order as FinRobot, HistAgent, Materials-Science-Skills-For-LLM, Scientific Agent Skills, and ToolUniverse
- **AND** exactly three HistAgent Skills are reachable from reviewed domains
- **AND** no excluded HistAgent surface or hard dependency appears

#### Scenario: Historical domain collection is projected
- **WHEN** a user installs a reviewed historical discipline domain
- **THEN** membership projects the approved independent HistAgent Skills
- **AND** advisory Skill relationships do not change installation closure
