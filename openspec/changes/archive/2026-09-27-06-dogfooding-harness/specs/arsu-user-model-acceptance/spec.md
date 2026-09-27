# Spec Delta

## MODIFIED Requirements

### Requirement: All-Target Init Projection And Single-Host Behaviour Are Tracked

Acceptance SHALL check the init projection for every registered target in `skills`, `commands`
and `both` delivery modes, including shared `agents`, without launching host models. Each case
SHALL verify the project files and manifest plus ResearchSpec CLI status, strict check, and
Procedure discovery and instruction selectors. This establishes project delivery and CLI
callability; it SHALL NOT certify native host invocation or Agent behavior. Natural research
behavior SHALL be assessed on one explicitly selected runnable host through two independent
sessions per scenario and evidence-bound human review. The behavior result SHALL be reported
at project level and SHALL NOT transfer to untested hosts.

#### Scenario: Matrix covers every registered target
- **WHEN** the init matrix is validated
- **THEN** its target ids SHALL equal the runtime registry's target ids
- **AND** every target SHALL have one result for each of the three delivery modes

#### Scenario: Unrun behavior remains unverified
- **WHEN** a target has no recorded natural-journey evidence
- **THEN** no behavior pass SHALL be inferred for that target

#### Scenario: Installation checks do not confer behavior verification
- **WHEN** only the init matrix, static parity or fixture-based technical journeys have completed
- **THEN** no target SHALL be marked behaviourally verified

#### Scenario: Shared projection stays separate
- **WHEN** two registered targets share one project projection root
- **THEN** each SHALL have its own init matrix cases
- **AND** a target without its own runnable host SHALL NOT receive a behavior verdict or host version

#### Scenario: Selected behavior suite passes
- **WHEN** every natural scenario on the selected host has two independent human-reviewed passing sessions
- **THEN** the project behavior result SHALL cite the host and model versions, sessions, human-correction count, resume attempts and successes, and quality scores
- **AND** `resume_attempts: 0` SHALL leave the resume success rate recorded as not applicable
- **AND** untested hosts SHALL receive no inferred behavior verdict
