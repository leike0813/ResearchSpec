## ADDED Requirements

### Requirement: Alternate-Model Consent Is Separate And Instance-Bound

Route confirmation SHALL NOT authorize alternate-model delegation. An Agent may
propose a host-available alternate model only after the route is known, and the
user SHALL separately confirm the model, disclosed content category, and cost
for that exact subflow instance.

#### Scenario: Parent route used alternate-model review

- **WHEN** a child, branch, or dynamic revision round is proposed
- **THEN** the parent's alternate-model consent SHALL NOT carry forward
- **AND** the new instance SHALL obtain its own route confirmation and, if needed, its own alternate-model consent

#### Scenario: Consent is recorded

- **WHEN** the user confirms alternate-model delegation in the Agent session
- **THEN** no stable spec, control, handoff, or model-configuration file SHALL record that consent
