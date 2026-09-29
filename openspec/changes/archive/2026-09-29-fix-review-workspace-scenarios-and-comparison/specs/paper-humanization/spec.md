# Spec Delta

## ADDED Requirements

### Requirement: Plan and candidate have distinct browser reviews
Paper-humanizer plan review SHALL expose the bounded plan, risk and preservation constraints against one frozen manuscript. After candidate verification, an optional comparison review SHALL show the current round's direct base and verified candidate side by side, while retaining the plan item decisions as advisory intent. A candidate review SHALL NOT be presented as verified before the owning verification step succeeds.

#### Scenario: User reviews the plan
- **WHEN** no verified candidate exists
- **THEN** the browser shows the original manuscript and plan items without a fabricated before/after comparison

#### Scenario: User reviews a verified candidate
- **WHEN** the current candidate passed verification
- **THEN** the browser can compare it with its direct base and return comments on either side for a new round or acceptance discussion

