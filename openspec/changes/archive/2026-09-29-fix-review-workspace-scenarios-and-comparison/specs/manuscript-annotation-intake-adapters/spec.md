# Spec Delta

## ADDED Requirements

### Requirement: Annotation review keeps source and display identities distinct
The v2 annotation projection SHALL retain each validated source target and MAY bind it to a separately checked frozen display block. A missing or ambiguous binding SHALL leave the item reachable without a precise highlight.

#### Scenario: Source target and rendered block IDs differ
- **WHEN** an annotation source target and its displayed block use different identities
- **THEN** the exported workspace preserves the source target and uses the explicit display binding for navigation

