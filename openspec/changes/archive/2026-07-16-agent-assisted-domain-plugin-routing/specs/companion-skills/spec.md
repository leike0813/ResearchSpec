## MODIFIED Requirements

### Requirement: Navigate Plugin Skill Recommendation
The Navigate Companion SHALL use compact packaged-domain JSON to discover
installed or uninstalled semantically matching Skills, obtain batch consent
before installation, and invoke eligible installed Skills only as advisory
helpers of the canonical ARSU producer.

#### Scenario: Uninstalled domain matches user intent
- **WHEN** one or more specific Skills in an available uninstalled domain
  materially fit a Route or ready-work need
- **THEN** Navigate MAY propose at most three domains with compact impact
- **AND** it SHALL install them only through preview, explicit confirmation, and
  matching plan-hash execution

#### Scenario: Installed helper matches active work
- **WHEN** a projected Skill materially assists the current ARSU producer
- **THEN** Navigate MAY dispatch it natively or through the read-only instruction
  bridge with a bounded helper brief
- **AND** the recommendation or invocation SHALL NOT create a route, subflow,
  work item, Gate, Decision, receipt, frontier, producer change, or second state
  machine

#### Scenario: Augmentation is declined or unavailable
- **WHEN** the user declines installation or the Skill cannot be used safely
- **THEN** Navigate SHALL continue the canonical ARSU route without treating the
  plugin as a blocker
