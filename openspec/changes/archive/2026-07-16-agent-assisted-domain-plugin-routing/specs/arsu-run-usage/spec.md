## ADDED Requirements

### Requirement: Plugin Helpers Do Not Enter The Runtime Frontier
ResearchSpec SHALL treat domain Skill invocation as nested semantic assistance
inside the current ARSU producer rather than a selector-addressable runtime
entity.

#### Scenario: Helper is used during a work item
- **WHEN** the Agent invokes a plugin Skill while producing a ready work
  candidate
- **THEN** status and instructions SHALL retain the original work selector and
  producer
- **AND** Submit SHALL register only the producer-reviewed candidate

#### Scenario: Helper is unavailable
- **WHEN** helper discovery, installation, or invocation fails
- **THEN** the current selector SHALL remain ready or active according to the
  existing core evaluator
- **AND** no plugin-specific blocker SHALL be added to workflow state
