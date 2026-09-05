## MODIFIED Requirements

### Requirement: Revision Rounds Are Template-Bound

Repeatable revision and review nodes SHALL be paired by the profile `revision_round_template`. A
completed review Decision SHALL select either the next revision round or the declared exit option. No
graph SHALL express any other implicit loop, and no global maximum round SHALL be introduced by the
engine. The initial revision round SHALL become reachable after its declared prerequisites and
controls are satisfied, without requiring a preceding-round continue Decision.

#### Scenario: A graph reaches its first revision

- **WHEN** a run starts before revision and satisfies the initial revision node's prerequisites and controls
- **THEN** revision round 1 SHALL be eligible without a round 0 Decision
- **AND** round 2 SHALL remain unavailable until the first round's continue Decision

#### Scenario: Continue option is accepted

- **WHEN** a completed review chooses the continue option
- **THEN** only the next revision round is exposed with its declared round role

#### Scenario: Exit option is accepted

- **WHEN** a completed review chooses the exit option
- **THEN** the revision template closes and only exit successors are eligible
