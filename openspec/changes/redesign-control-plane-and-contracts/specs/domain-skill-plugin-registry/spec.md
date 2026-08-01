## MODIFIED Requirements

### Requirement: Workspace Plugin Lifecycle
Plugin installation and update SHALL use exact domain IDs, explicit consent and generated-file drift
protection without binding ordinary execution to a generic runtime `plan_sha256`.

#### Scenario: Non-interactive plugin installation is approved
- **WHEN** exact domain IDs and `--yes` are supplied after preview
- **THEN** ResearchSpec reconciles only plugin-owned static projections

### Requirement: Plugin Core Authority Boundary
Domain Skills SHALL remain advisory and SHALL NOT own or directly modify stable specs, routes,
subflow controls, Gates, Decisions, transitions or handoffs.

#### Scenario: Plugin helps an ARSU producer
- **WHEN** a selected domain Skill returns semantic assistance
- **THEN** the result returns to the original producer without changing the workflow frontier

