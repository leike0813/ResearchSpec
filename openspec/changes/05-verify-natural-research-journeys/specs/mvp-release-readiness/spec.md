# Spec Delta

## ADDED Requirements

### Requirement: Manual Acceptance Evidence Requires Natural Host Sessions

Manual release acceptance SHALL be produced by real Agent sessions on registered targets using
natural task prompts and SHALL satisfy the release gate's own evidence rules before it is
recorded. Technical readiness and fixture-based journeys SHALL NOT satisfy or partially satisfy
a manual item, and the existing release gate and its authorization rule SHALL remain
unchanged.

#### Scenario: Manual items stay unsigned without host evidence
- **WHEN** only automated technical journeys have completed
- **THEN** every manual dogfooding item SHALL remain unchecked
- **AND** the existing release gate SHALL continue to block authorization

#### Scenario: Items may be recorded once the gate's evidence rules are met
- **WHEN** a manual item has host evidence that satisfies the release gate's rules
- **THEN** the item and the authorization state SHALL be updated according to those rules
- **AND** no fixed wording SHALL be required to remain unchanged merely to satisfy this requirement

#### Scenario: Manual evidence identifies its host, model and sessions
- **WHEN** a manual item is recorded
- **THEN** its evidence SHALL identify the target, host and model versions, the independent sessions, human corrections, resume attempts and successes, and the quality scores
- **AND** the checklist SHALL link the item to its declared scenario slug

#### Scenario: Checklist references resolve to declared scenarios
- **WHEN** the manual release checklist is validated
- **THEN** every manual item slug SHALL resolve to a scenario declared in `playbooks/dogfooding/scenarios.yaml`
- **AND** an unresolved slug SHALL fail validation
