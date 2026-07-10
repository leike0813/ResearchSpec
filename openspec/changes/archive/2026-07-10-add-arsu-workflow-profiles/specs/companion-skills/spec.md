## ADDED Requirements

### Requirement: Companion guidance respects composed subflow authority
Companion Skills SHALL treat the CLI child-aware frontier as the only authority for starting pipeline stages and revision rounds.

#### Scenario: A pipeline plan names a likely next Skill
- **WHEN** the named child selector is not present in current CLI status
- **THEN** the Agent does not start or simulate that child from prose alone

### Requirement: Companion guidance preserves human boundaries
Companion Skills SHALL distinguish delegated mechanical child starts from formal Gate confirmation, override Decisions, mid-entry choices, and review branch Decisions.

#### Scenario: Parent route was confirmed
- **WHEN** a child start is delegated by the exact parent plan
- **THEN** the Agent may execute that start but cannot use the parent confirmation to pass a Gate or select a branch
