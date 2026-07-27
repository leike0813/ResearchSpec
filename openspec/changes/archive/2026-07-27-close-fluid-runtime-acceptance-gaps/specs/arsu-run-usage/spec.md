## MODIFIED Requirements

### Requirement: Uniform Runtime Protocol

ResearchSpec SHALL expose subflows, obligations, case actions, Gates and
completion through bounded status and selector-based descriptors. A caller
SHALL execute only an allowed descriptor and SHALL not require a full status or
external plan-replay cycle after every mechanical step.

#### Scenario: Agent executes a direct durable action

- **WHEN** an allowed descriptor declares direct execution
- **THEN** the Agent SHALL submit its semantic input once
- **AND** the CLI SHALL plan, validate and commit under current read
  preconditions before returning next selectors

#### Scenario: Agent reaches a formal boundary

- **WHEN** a descriptor declares human-confirmed or plan-bound execution
- **THEN** the Agent SHALL provide the exact named confirmation or preview hash
  required by that policy

#### Scenario: Working material remains provisional

- **WHEN** an ARSU Skill has produced intermediate or provider-derived material
- **THEN** it SHALL retain that material as scoped working evidence
- **AND** it SHALL use a durable submit only at a declared artifact, evidence,
  patch or case-action boundary

