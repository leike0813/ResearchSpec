## ADDED Requirements

### Requirement: Navigate Separates Alternate-Model Consent

Navigate SHALL keep host-native alternate-model delegation separate from route,
plugin, Adapter, Gate, and branch confirmations. It SHALL present the proposed
host model, disclosed content category, and cost before dispatch and scope the
consent to the current subflow instance.

#### Scenario: Alternate model is not confirmed or unavailable

- **WHEN** the user declines, the host cannot dispatch the model, or the result is structurally invalid
- **THEN** Navigate SHALL leave the route and workflow frontier unchanged
- **AND** the producer SHALL disclose single-model fallback rather than configure or call a model service

#### Scenario: Another instance starts

- **WHEN** a child, branch, or dynamic revision round becomes current
- **THEN** Navigate SHALL obtain a fresh alternate-model confirmation if the producer proposes one
