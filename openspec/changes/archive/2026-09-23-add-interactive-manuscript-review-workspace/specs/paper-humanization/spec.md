# Spec Delta

## ADDED Requirements

### Requirement: Humanization plans support interactive review projection
A paper-humanizer review procedure SHALL be able to project its bounded plan items and exact manuscript into the shared review-workspace contract. The projection SHALL preserve plan item identity, locators, operation, expected effect, preservation constraints, risk, recommendation, and current disposition.

#### Scenario: User reviews a humanization plan
- **WHEN** a valid humanization plan is projected
- **THEN** each plan item is independently reviewable and the exported result identifies include, exclude, revise, or defer intent without editing the source manuscript

#### Scenario: Candidate requires another revision
- **WHEN** a user requests changes after candidate verification
- **THEN** the exported result is advisory input for a new plan/revision round and does not bypass verification or the acceptance Decision

### Requirement: Humanization authority remains graph-owned
Interactive review SHALL NOT approve a humanization plan, accept a candidate, or mark a graph node complete. Current Gate and Decision instructions SHALL remain the only legal source for those mutations.

#### Scenario: User approves all displayed items
- **WHEN** every workspace item is marked included
- **THEN** revision remains blocked until the `paper-humanizer-plan` Gate and plan Decision are separately recorded through the existing CLI

