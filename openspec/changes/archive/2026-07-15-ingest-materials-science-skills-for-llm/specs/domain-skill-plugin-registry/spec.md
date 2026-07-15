## ADDED Requirements

### Requirement: Reviewed Materials-Science-Skills Vendor
Registry Schema 1 SHALL represent the admitted Materials-Science-Skills-For-LLM `snapshot-fafd3ab` bundle as an isolated third vendor with globally unique vendor-prefixed Skill IDs, immutable provenance, reviewed empty dependency arrays, and explicit source-neutral domain memberships.

#### Scenario: Three-vendor registry is assembled
- **WHEN** the central assembler loads the Materials, Scientific Agent Skills, and ToolUniverse bundles
- **THEN** vendors appear in that stable order and every Skill ID is globally unique
- **AND** exactly seven Materials Skills are reachable from reviewed domains
- **AND** no excluded Materials Skill or hard dependency appears in the registry

#### Scenario: Materials membership is reviewed
- **WHEN** a Materials Skill uses GPU, scheduler, remote-service, or HPC mechanics
- **THEN** membership is based only on its scientific meaning
- **AND** infrastructure use alone does not add `research-computing-infrastructure`
